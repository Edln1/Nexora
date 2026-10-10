(async()=>{
 const params=new URLSearchParams(location.search),market=params.get('market')||document.body.dataset?.ehMarket||'CA',us=market==='US';
 const caKey='electric-hearts-basket-v1',usKey='electric-hearts-basket-us-v1',key=us?usKey:caKey,wishKey='electric-hearts-wishlist-v1',api='https://synbot-whatsapp-2.onrender.com/nexora';
 const marketLink=page=>page+(us?'?market=US':''),image=p=>/^https:\/\//.test(p.image)?p.image:'assets/'+p.image;
 async function request(path,options){const r=await fetch(api+path,options),d=await r.json();if(!r.ok)throw Error(d.error||'Checkout is temporarily unavailable.');return d}
 function verifiedUS(data){return data.enabled===true&&data.market==='US'&&data.currency==='usd'&&Array.isArray(data.shippingCountries)&&data.shippingCountries.length===1&&data.shippingCountries[0]==='US'&&Array.isArray(data.products)&&data.products.every(p=>p.ready===true&&p.market==='US'&&p.currency==='usd'&&Number.isSafeInteger(p.amount)&&p.amount>0&&Number.isSafeInteger(p.shippingAmount)&&p.shippingAmount>=0&&p.shippingBasis==='per-unit')}
 const status=document.getElementById('eh-checkout-status');
 let products=[],config=null,items=[];
 const addButtons=[...document.querySelectorAll('[data-eh-add]')];
 addButtons.forEach(b=>{b.disabled=true;b.setAttribute('aria-busy','true')});
 const session=params.get('session_id');
 if(session&&status){
  try{
   const d=await request('/checkout/status?session_id='+encodeURIComponent(session));
   const purchase=d.paymentStatus==='paid'&&!d.testMode?d.purchase:null;
   if(d.paymentStatus==='paid'){
    status.textContent=d.testMode?'Test payment confirmed — no real charge.':'Thank you. Your payment is confirmed.';
    try{localStorage.removeItem(d.market==='US'?usKey:caKey)}catch{}
   }else status.textContent='Your payment is not confirmed. Please check again or contact us.';
   try{
    history.replaceState(null,'',location.pathname+(d.market==='US'?'?market=US':''));
    // Google measurement never receives a URL containing the Stripe session token.
    if(purchase)window.ehGooglePurchase?.(purchase);
   }catch{}
  }catch{status.textContent='We could not confirm your payment status. If you already paid, do not place another order; contact us so we can check it.'}
  return;
 }
 if(!['CA','US'].includes(market)){if(status)status.textContent='Choose Canada or the United States.';addButtons.forEach(b=>b.removeAttribute('aria-busy'));return}
 const money=(n,currency='usd')=>'$'+(n/100).toFixed(2)+' '+currency.toUpperCase();
 try{if(us){config=await request('/companions/config?market=US');if(!verifiedUS(config)||!config.products.length)throw Error('US delivery is not open yet.');products=config.products;document.querySelectorAll('[data-companion]').forEach(panel=>{const p=products.find(p=>p.sku===panel.dataset.companion),price=panel.querySelector('.pixo-price,.eh-price');if(price)price.textContent=p?money(p.amount,p.currency):'Unavailable for US delivery'})}else products=await fetch('assets/companion-catalog.json',{cache:'no-store'}).then(r=>r.json())}catch{const message=us?'US delivery is not open yet. No payment has been taken.':'Availability could not be loaded. Please refresh this page to try again.';if(status)status.textContent=message;addButtons.forEach(b=>{const panel=b.closest('[data-companion]'),notice=panel?.querySelector('[data-eh-status]'),price=panel?.querySelector('.pixo-price,.eh-price');if(notice)notice.textContent=message;if(us&&price)price.textContent='Unavailable for US delivery';b.removeAttribute('aria-busy')});return}
 try{items=JSON.parse(localStorage.getItem(key)||'[]');if(!Array.isArray(items))items=[]}catch{}
 const seen=new Set(),moved=[];items=items.filter(i=>{if(!i||!Number.isInteger(i.qty)||i.qty<1||i.qty>5||seen.has(i.sku))return false;const p=products.find(p=>p.sku===i.sku);if(!p)return false;seen.add(i.sku);if(!p.ready){moved.push(i.sku);return false}return true});
 if(moved.length){try{const saved=JSON.parse(localStorage.getItem(wishKey)||'[]');localStorage.setItem(wishKey,JSON.stringify([...new Set([...(Array.isArray(saved)?saved:[]),...moved])]))}catch{}}
 const basket=document.createElement('dialog');basket.className='eh-basket';basket.setAttribute('aria-label','Your companion basket');document.body.append(basket);
 function save(){try{localStorage.setItem(key,JSON.stringify(items))}catch{}document.querySelectorAll('a[aria-label="Cart"]').forEach(a=>a.title='Basket: '+items.reduce((n,i)=>n+i.qty,0)+' items')}
 function render(){basket.innerHTML='<header><h2>Your companions</h2><button data-close aria-label="Close basket">×</button></header>'+items.map(i=>{const p=products.find(p=>p.sku===i.sku);return `<article><img src="${image(p)}" alt=""><div><strong>${p.name}</strong><p>${p.variant} · ${money(p.amount,p.currency)}</p><label>Qty <input aria-label="${p.name} quantity" data-qty="${p.sku}" type="number" min="1" max="5" value="${i.qty}"></label></div><button data-remove="${p.sku}">Remove</button></article>`}).join('')+(items.length?'<h3>Subtotal '+money(items.reduce((n,i)=>n+products.find(p=>p.sku===i.sku).amount*i.qty,0),products.find(p=>p.sku===items[0].sku).currency)+'</h3>'+(us?'<p>Standard US shipping '+money(items.reduce((n,i)=>n+products.find(p=>p.sku===i.sku).shippingAmount*i.qty,0),'usd')+'</p>':'')+'<p>Delivery and any applicable taxes are shown before payment.</p><a class="eh-checkout-link" href="'+marketLink('companion-checkout.html')+'">Review checkout →</a>':'<p>Your basket is empty. <a href="wishlist.html">View your wishlist</a> or <a href="shop.html">explore available companions</a>.</p>')}
 document.addEventListener('click',e=>{const a=e.target.closest('[data-eh-add],[data-eh-open-basket],a[aria-label="Cart"]');if(!a)return;e.preventDefault();e.stopImmediatePropagation();if(a.hasAttribute('data-eh-add')){const panel=a.closest('[data-companion]'),sku=panel.dataset.companion,p=products.find(p=>p.sku===sku),qty=Number(panel.querySelector('input').value);if(!p?.ready){panel.querySelector('[data-eh-status]').textContent='Ordering is not open for this product.';return}if(!Number.isInteger(qty)||qty<1||qty>5){panel.querySelector('[data-eh-status]').textContent='Choose between 1 and 5.';return}const currency=p.currency||'usd';if(items.some(i=>(products.find(p=>p.sku===i.sku).currency||'usd')!==currency)){panel.querySelector('[data-eh-status]').textContent='Please check out CAD and USD items separately.';return}const old=items.find(i=>i.sku===sku);if(old)old.qty=Math.min(5,old.qty+qty);else items.push({sku,qty});save()}render();basket.showModal()},true);
 basket.addEventListener('click',e=>{if(e.target.closest('[data-close]'))basket.close();const r=e.target.closest('[data-remove]');if(r){items=items.filter(i=>i.sku!==r.dataset.remove);save();render()}});
 basket.addEventListener('change',e=>{if(!e.target.matches('[data-qty]'))return;const qty=Number(e.target.value);if(Number.isInteger(qty)&&qty>=1&&qty<=5){items.find(i=>i.sku===e.target.dataset.qty).qty=qty;save()}render()});save();
 if(location.pathname.endsWith('/basket.html')){render();basket.showModal()}
 addButtons.forEach(b=>{b.disabled=!products.find(p=>p.sku===b.closest('[data-companion]')?.dataset.companion)?.ready;b.removeAttribute('aria-busy')});
 if(!status)return;
 try{

 if(!items.length){status.textContent='Your basket is empty. Choose a companion first.';return}
 config=await request('/companions/config'+(us?'?market=US':''));
 if(us&&!verifiedUS(config)){status.textContent='US delivery is not open yet. Your US basket is saved. No payment has been taken.';return}
 if(!config.enabled||items.some(i=>!config.products?.find(p=>p.sku===i.sku)?.ready)){status.textContent='Your basket is saved. These companions are not open for ordering yet while delivery is being confirmed. No payment has been taken.';return}
 products=items.map(i=>config.products.find(p=>p.sku===i.sku));
 if(products.some(p=>!Number.isSafeInteger(p.amount)||p.amount<=0||p.currency!==(us?'usd':'cad'))){status.textContent='The basket price could not be verified. Your basket is saved. No payment has been taken.';return}
 document.getElementById('eh-summary').textContent=items.map(i=>{const p=products.find(p=>p.sku===i.sku);return `${i.qty} × ${p.name} · ${money(i.qty*p.amount,p.currency)}`}).join(' / ')+(us?' / Standard US shipping '+money(items.reduce((n,i)=>n+products.find(p=>p.sku===i.sku).shippingAmount*i.qty,0),'usd'):'');
 const id=crypto.randomUUID();const checkout=await Stripe(config.publishableKey).initEmbeddedCheckout({fetchClientSecret:async()=>{const d=await request('/checkout/sessions',{method:'POST',headers:{'Content-Type':'application/json','Idempotency-Key':id},body:JSON.stringify({collection:'electric-hearts',market,currency:us?'usd':'cad',items})});return d.clientSecret}});await checkout.mount('#checkout');status.textContent=config.testMode?'Test checkout — no real charges.':'Enter your shipping and payment details below.';
 }catch{status.textContent='Ordering is not available right now. Your basket is saved and no payment has been taken.'}
})();
