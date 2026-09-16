import http from 'node:http';
import {mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {DatabaseSync} from 'node:sqlite';
import Stripe from 'stripe';
import {checkoutParameters} from './stripe-checkout.mjs';

const env = process.env;
const stripe = env.STRIPE_SECRET_KEY ? new Stripe(env.STRIPE_SECRET_KEY, {maxNetworkRetries:2}) : null;
const live = env.STRIPE_SECRET_KEY?.startsWith('sk_live_');
if (live && env.LIVE_PAYMENTS_APPROVED !== 'true') throw Error('Live payments have not been approved');
const config = {
  countries:env.SHIPPING_COUNTRIES || '', shippingRate:env.STRIPE_SHIPPING_RATE,
  returnUrl:env.CHECKOUT_RETURN_URL || 'https://nexora.synapses.cloud/checkout.html',
  prices:{black:env.STRIPE_PRICE_BLACK,white:env.STRIPE_PRICE_WHITE},
  automaticTax:env.STRIPE_AUTOMATIC_TAX === 'true',
};
const origins = new Set((env.ALLOWED_ORIGINS || '').split(',').filter(Boolean));
if (!config.returnUrl.startsWith('https://')) throw Error('Return URL must use HTTPS');
const dataDir = resolve(env.DATA_DIR || './data'); mkdirSync(dataDir,{recursive:true});
const db = new DatabaseSync(resolve(dataDir,'stripe-orders.sqlite'));
db.exec(`PRAGMA journal_mode=WAL;
 CREATE TABLE IF NOT EXISTS stripe_events(id TEXT PRIMARY KEY, received TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS stripe_orders(session_id TEXT PRIMARY KEY,payment_intent TEXT,amount INTEGER,currency TEXT,status TEXT,updated TEXT);
 CREATE TABLE IF NOT EXISTS checkout_sessions(id TEXT PRIMARY KEY);`);
const limits = new Map();
setInterval(()=>limits.clear(),60_000).unref();
const enabled = () => !!stripe && !!env.STRIPE_WEBHOOK_SECRET && !!env.STRIPE_PUBLISHABLE_KEY && env.PAYMENTS_ENABLED === 'true';
async function readBody(req) {
 const chunks=[];let size=0;
 for await (const c of req) {size+=c.length;if(size>262144)throw Error('Body too large');chunks.push(c)}
 return Buffer.concat(chunks);
}
http.createServer(async(req,res)=>{
 const send=(status,data)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(data))};
 const url=new URL(req.url,'http://localhost');
 if(req.method==='GET' && url.pathname==='/health')return send(200,{ok:true});
 if(req.method==='POST' && url.pathname==='/webhooks/stripe'){
  if(!stripe||!env.STRIPE_WEBHOOK_SECRET)return send(503,{error:'Not configured'});
  let event;
  try{event=stripe.webhooks.constructEvent(await readBody(req),req.headers['stripe-signature'],env.STRIPE_WEBHOOK_SECRET)}catch{return send(400,{error:'Invalid webhook'})}
  if(event.livemode!==!!live)return send(400,{error:'Wrong payment mode'});
  const s=event.data.object;
  if(!['checkout.session.completed','checkout.session.async_payment_succeeded','checkout.session.async_payment_failed'].includes(event.type))return send(200,{received:true});
  if(s.metadata?.store!=='nexora'||s.metadata?.product!=='mi-1')return send(200,{received:true});
  try{
   db.exec('BEGIN IMMEDIATE');
   const now=new Date().toISOString();
   if(db.prepare('INSERT OR IGNORE INTO stripe_events VALUES(?,?)').run(event.id,now).changes){
    const status=s.payment_status==='paid'?'paid_review_required':event.type.endsWith('failed')?'payment_failed':'payment_pending';
    db.prepare(`INSERT INTO stripe_orders VALUES(?,?,?,?,?,?) ON CONFLICT(session_id) DO UPDATE SET status=CASE WHEN stripe_orders.status='paid_review_required' THEN stripe_orders.status ELSE excluded.status END,updated=excluded.updated`).run(s.id,s.payment_intent||null,s.amount_total,s.currency,status,now);
   }
   db.exec('COMMIT');return send(200,{received:true});
  }catch{db.exec('ROLLBACK');return send(500,{error:'Please retry'})}
 }
 if(!origins.has(req.headers.origin))return send(403,{error:'Origin not allowed'});
 res.setHeader('Access-Control-Allow-Origin',req.headers.origin);res.setHeader('Vary','Origin');
 if(req.method==='OPTIONS'){res.setHeader('Access-Control-Allow-Methods','GET, POST, OPTIONS');res.setHeader('Access-Control-Allow-Headers','Content-Type, Idempotency-Key');return send(204,null)}
 if(req.method==='GET'&&url.pathname==='/config')return send(200,{enabled:enabled(),publishableKey:env.STRIPE_PUBLISHABLE_KEY||null,testMode:!live});
 if(!enabled())return send(503,{error:'Checkout is not open yet'});
 if(req.method==='POST'&&url.pathname==='/checkout/sessions'){
  const ip=req.socket.remoteAddress,n=(limits.get(ip)||0)+1;limits.set(ip,n);if(n>30)return send(429,{error:'Please try again shortly'});
  if(!req.headers['content-type']?.startsWith('application/json'))return send(415,{error:'JSON required'});
  const id=req.headers['idempotency-key'];if(typeof id!=='string'||!/^[-a-zA-Z0-9]{16,100}$/.test(id))return send(400,{error:'Missing checkout identifier'});
  let params;try{params=checkoutParameters(JSON.parse((await readBody(req)).toString()).items,config)}catch{return send(400,{error:'Basket or shipping configuration is unavailable'})}
  try{
   const session=await stripe.checkout.sessions.create(params,{idempotencyKey:'nexora-'+id});
   db.prepare('INSERT OR IGNORE INTO checkout_sessions VALUES(?)').run(session.id);
   return send(200,{clientSecret:session.client_secret});
  }catch{return send(502,{error:'Unable to start checkout. Please try again'})}
 }
 if(req.method==='GET'&&url.pathname==='/checkout/status'){
  const id=url.searchParams.get('session_id');if(!id||!db.prepare('SELECT id FROM checkout_sessions WHERE id=?').get(id))return send(404,{error:'Unknown checkout'});
  try{const s=await stripe.checkout.sessions.retrieve(id);return send(200,{status:s.status,paymentStatus:s.payment_status})}catch{return send(502,{error:'Could not verify payment'})}
 }
 return send(404,{error:'Not found'});
}).listen(Number(env.PORT||3080),'0.0.0.0',()=>console.log('Stripe service started; supplier dispatch is not enabled.'));
