(async()=>{
 const key='electric-hearts-basket-v1',wishKey='electric-hearts-wishlist-v1',api='https://synbot-whatsapp-2.onrender.com/nexora';
 let products=[],config=null,items=[];
 const addButtons=[...document.querySelectorAll('[data-eh-add]')];
 addButtons.forEach(b=>{b.disabled=true;b.setAttribute('aria-busy','true')});
 const money=(n,currency='usd')=>'$'+(n/100).toFixed(2)+' '+currency.toUpperCase();
 try{products=await fetch('assets/companion-catalog.json',{cache:'no-store'}).then(r=>r.json())}catch{addButtons.forEach(b=>{const status=b.closest('[data-companion]')?.querySelector('[data-eh-status]');if(status)status.textContent='Availability could not be loaded. Please refresh this page to try again.';b.removeAttribute('aria-busy')});return}
 try{items=JSON.parse(localStorage.getItem(key)||'[]');if(!Array.isArray(items))items=[]}catch{}
 const seen=new Set(),moved=[];items=items.filter(i=>{if(!i||!Number.isInteger(i.qty)||i.qty<1||i.qty>5||seen.has(i.sku))return false;const p=products.find(p=>p.sku===i.sku);if(!p)return false;seen.add(i.sku);if(!p.ready){moved.push(i.sku);return false}return true});
 if(moved.length){try{const saved=JSON.parse(localStorage.getItem(wishKey)||'[]');localStorage.setItem(wishKey,JSON.stringify([...new Set([...(Array.isArray(saved)?saved:[]),...moved])]))}catch{}}
 const basket=document.createElement('dialog');basket.className='eh-basket';basket.setAttribute('aria-label','Your companion basket');document.body.append(basket);
 function save(){try{localStorage.setItem(key,JSON.stringify(items))}catch{}document.querySelectorAll('a[aria-label="Cart"]').forEach(a=>a.title='Basket: '+items.reduce((n,i)=>n+i.qty,0)+' items')}
 function render(){basket.innerHTML='<header><h2>Your companions</h2><button data-close aria-label="Close basket">×</button></header>'+items.map(i=>{const p=products.find(p=>p.sku===i.sku);return `<article><img src="assets/${p.image}" alt=""><div><strong>${p.name}</strong><p>${p.variant} · ${money(p.amount,p.currency)}</p><label>Qty <input aria-label="${p.name} quantity" data-qty="${p.sku}" type="number" min="1" max="5" value="${i.qty}"></label></div><button data-remove="${p.sku}">Remove</button></article>`}).join('')+(items.length?'<h3>Subtotal '+money(items.reduce((n,i)=>n+products.find(p=>p.sku===i.sku).amount*i.qty,0),products.find(p=>p.sku===items[0].sku).currency)+'</h3><p>Delivery and any applicable taxes are shown before payment.</p><a class="eh-checkout-link" href="companion-checkout.html">Review checkout →</a>':'<p>Your basket is empty. <a href="wishlist.html">View your wishlist</a> or <a href="shop.html">explore available companions</a>.</p>')}
 document.addEventListener('click',e=>{const a=e.target.closest('[data-eh-add],[data-eh-open-basket],a[aria-label="Cart"]');if(!a)return;e.preventDefault();e.stopImmediatePropagation();if(a.hasAttribute('data-eh-add')){const panel=a.closest('[data-companion]'),sku=panel.dataset.companion,p=products.find(p=>p.sku===sku),qty=Number(panel.querySelector('input').value);if(!p?.ready){panel.querySelector('[data-eh-status]').textContent='Ordering is not open for this product.';return}if(!Number.isInteger(qty)||qty<1||qty>5){panel.querySelector('[data-eh-status]').textContent='Choose between 1 and 5.';return}const currency=p.currency||'usd';if(items.some(i=>(products.find(p=>p.sku===i.sku).currency||'usd')!==currency)){panel.querySelector('[data-eh-status]').textContent='Please check out CAD and USD items separately.';return}const old=items.find(i=>i.sku===sku);if(old)old.qty=Math.min(5,old.qty+qty);else items.push({sku,qty});save()}render();basket.showModal()},true);
 basket.addEventListener('click',e=>{if(e.target.closest('[data-close]'))basket.close();const r=e.target.closest('[data-remove]');if(r){items=items.filter(i=>i.sku!==r.dataset.remove);save();render()}});
 basket.addEventListener('change',e=>{if(!e.target.matches('[data-qty]'))return;const qty=Number(e.target.value);if(Number.isInteger(qty)&&qty>=1&&qty<=5){items.find(i=>i.sku===e.target.dataset.qty).qty=qty;save()}render()});save();
 if(location.pathname.endsWith('/basket.html')){render();basket.showModal()}
 addButtons.forEach(b=>{b.disabled=!products.find(p=>p.sku===b.closest('[data-companion]')?.dataset.companion)?.ready;b.removeAttribute('aria-busy')});
 const status=document.getElementById('eh-checkout-status');if(!status)return;
 async function request(path,options){const r=await fetch(api+path,options),d=await r.json();if(!r.ok)throw Error(d.error||'Checkout is temporarily unavailable.');return d}
 try{
 const session=new URLSearchParams(location.search).get('session_id');
 if(session){
  try{
   const d=await request('/checkout/status?session_id='+encodeURIComponent(session));
   if(d.paymentStatus==='paid'){
    status.textContent=d.testMode?'Test payment confirmed — no real charge.':'Thank you. Your payment is confirmed.';
    try{if(d.purchase&&!d.testMode)window.ehGooglePurchase?.(d.purchase)}catch{}
    try{localStorage.removeItem(key)}catch{}
   }else status.textContent='Your payment is not confirmed. Please check again or contact us.';
   try{history.replaceState(null,'',location.pathname)}catch{}
  }catch{status.textContent='We could not confirm your payment status. If you already paid, do not place another order; contact us so we can check it.'}
  return;
 }
 if(!items.length){status.textContent='Your basket is empty. Choose a companion first.';return}
 document.getElementById('eh-summary').textContent=items.map(i=>{const p=products.find(p=>p.sku===i.sku);return `${i.qty} × ${p.name} · ${money(i.qty*p.amount,p.currency)}`}).join(' / ');
 config=await request('/companions/config');
 if(!config.enabled||items.some(i=>!config.products?.find(p=>p.sku===i.sku)?.ready)){status.textContent='Your basket is saved. These companions are not open for ordering yet while delivery is being confirmed. No payment has been taken.';return}
 const id=crypto.randomUUID();const checkout=await Stripe(config.publishableKey).initEmbeddedCheckout({fetchClientSecret:async()=>{const d=await request('/checkout/sessions',{method:'POST',headers:{'Content-Type':'application/json','Idempotency-Key':id},body:JSON.stringify({collection:'electric-hearts',items})});return d.clientSecret}});await checkout.mount('#checkout');status.textContent=config.testMode?'Test checkout — no real charges.':'Enter your shipping and payment details below.';
 }catch{status.textContent='Ordering is not available right now. Your basket is saved and no payment has been taken.'}
})();
