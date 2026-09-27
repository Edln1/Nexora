(async()=>{
 const key='electric-hearts-basket-v1',api='https://synbot-whatsapp-2.onrender.com/nexora';
 let products=[],config=null,items=[];
 const money=n=>'$'+(n/100).toFixed(2)+' USD';
 try{products=await fetch('assets/companion-catalog.json').then(r=>r.json())}catch{return}
 try{items=JSON.parse(localStorage.getItem(key)||'[]');if(!Array.isArray(items))items=[]}catch{}
 const seen=new Set();items=items.filter(i=>i&&products.some(p=>p.sku===i.sku)&&Number.isInteger(i.qty)&&i.qty>0&&i.qty<=5&&!seen.has(i.sku)&&seen.add(i.sku));
 const basket=document.createElement('dialog');basket.className='eh-basket';basket.setAttribute('aria-label','Your companion basket');document.body.append(basket);
 function save(){try{localStorage.setItem(key,JSON.stringify(items))}catch{}document.querySelectorAll('a[aria-label="Cart"]').forEach(a=>a.title='Basket: '+items.reduce((n,i)=>n+i.qty,0)+' items')}
 function render(){basket.innerHTML='<header><h2>Your companions</h2><button data-close aria-label="Close basket">×</button></header>'+items.map(i=>{const p=products.find(p=>p.sku===i.sku);return `<article><img src="assets/${p.image}" alt=""><div><strong>${p.name}</strong><p>${p.variant} · ${money(p.amount)}</p><label>Qty <input aria-label="${p.name} quantity" data-qty="${p.sku}" type="number" min="1" max="5" value="${i.qty}"></label></div><button data-remove="${p.sku}">Remove</button></article>`}).join('')+(items.length?'<h3>Subtotal '+money(items.reduce((n,i)=>n+products.find(p=>p.sku===i.sku).amount*i.qty,0))+'</h3><p>Delivery and any applicable taxes are calculated at checkout.</p><a class="eh-checkout-link" href="companion-checkout.html">Review checkout →</a>':'<p>Your basket is empty. Choose a companion to get started.</p>')+'<p>Coming soon items can be saved, but cannot be purchased until ordering opens.</p>'}
 document.addEventListener('click',e=>{const a=e.target.closest('[data-eh-add],a[aria-label="Cart"]');if(!a)return;e.preventDefault();e.stopImmediatePropagation();if(a.hasAttribute('data-eh-add')){const panel=a.closest('[data-companion]'),sku=panel.dataset.companion,qty=Number(panel.querySelector('input').value);if(!Number.isInteger(qty)||qty<1||qty>5){panel.querySelector('[data-eh-status]').textContent='Choose between 1 and 5.';return}const old=items.find(i=>i.sku===sku);if(old)old.qty=Math.min(5,old.qty+qty);else items.push({sku,qty});save()}render();basket.showModal()},true);
 basket.addEventListener('click',e=>{if(e.target.closest('[data-close]'))basket.close();const r=e.target.closest('[data-remove]');if(r){items=items.filter(i=>i.sku!==r.dataset.remove);save();render()}});
 basket.addEventListener('change',e=>{if(!e.target.matches('[data-qty]'))return;const qty=Number(e.target.value);if(Number.isInteger(qty)&&qty>=1&&qty<=5){items.find(i=>i.sku===e.target.dataset.qty).qty=qty;save()}render()});save();
 const status=document.getElementById('eh-checkout-status');if(!status)return;
 async function request(path,options){const r=await fetch(api+path,options),d=await r.json();if(!r.ok)throw Error(d.error||'Checkout is temporarily unavailable.');return d}
 try{
 const session=new URLSearchParams(location.search).get('session_id');if(session){history.replaceState(null,'',location.pathname);const d=await request('/checkout/status?session_id='+encodeURIComponent(session));status.textContent=d.paymentStatus==='paid'?'Thank you. Your payment is confirmed.':'Your payment is not confirmed. Please check again or contact us.';if(d.paymentStatus==='paid'){localStorage.removeItem(key)}return}
 if(!items.length){status.textContent='Your basket is empty. Choose a companion first.';return}
 document.getElementById('eh-summary').textContent=items.map(i=>{const p=products.find(p=>p.sku===i.sku);return `${i.qty} × ${p.name} · ${money(i.qty*p.amount)}`}).join(' / ');
 config=await request('/companions/config');
 if(!config.enabled||items.some(i=>!config.products?.find(p=>p.sku===i.sku)?.ready)){status.textContent='Your basket is saved. These companions are not open for ordering yet while delivery is being confirmed. No payment has been taken.';return}
 const id=crypto.randomUUID();const checkout=await Stripe(config.publishableKey).initEmbeddedCheckout({fetchClientSecret:async()=>{const d=await request('/checkout/sessions',{method:'POST',headers:{'Content-Type':'application/json','Idempotency-Key':id},body:JSON.stringify({collection:'electric-hearts',items})});return d.clientSecret}});await checkout.mount('#checkout');status.textContent=config.testMode?'Test checkout — no real charges.':'Enter your shipping and payment details below.';
 }catch{status.textContent='Ordering is not available right now. Your basket is saved and no payment has been taken.'}
})();
