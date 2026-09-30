(()=>{
 const key='electric-hearts-wishlist-v1';
 const read=()=>{try{const value=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(value)?value.filter(x=>typeof x==='string'):[]}catch{return []}};
 const save=items=>{try{localStorage.setItem(key,JSON.stringify([...new Set(items)]))}catch{}};
 document.addEventListener('click',event=>{
  const button=event.target.closest('[data-eh-wishlist]');if(!button)return;
  const panel=button.closest('[data-companion]'),sku=panel?.dataset.companion;if(!sku)return;
  event.preventDefault();save([...read(),sku]);button.textContent='Saved to wishlist ✓';
  const status=panel.querySelector('[data-eh-status]');if(status)status.innerHTML='Saved on this device. <a href="wishlist.html">View your wishlist →</a>';
 });
 const list=document.getElementById('eh-wishlist-list');if(!list)return;
 fetch('assets/companion-catalog.json').then(r=>r.json()).then(products=>{
  const render=()=>{
   const saved=read(),matches=saved.map(sku=>products.find(p=>p.sku===sku)).filter(Boolean);
   list.replaceChildren();
   if(!matches.length){const p=document.createElement('p');p.textContent='No companions saved yet. Meet the collection and choose the ones you want to follow.';list.append(p);return}
   matches.forEach(product=>{
    const card=document.createElement('article');card.className='wish-card';
    const image=document.createElement('img');image.src='assets/'+product.image;image.alt='';image.loading='lazy';
    const copy=document.createElement('div');const title=document.createElement('h2');title.textContent=product.name;
    const detail=document.createElement('p');detail.textContent=product.ready?'Available to order':'Coming soon · Price to be confirmed';
    const link=document.createElement('a');link.href=product.page+'.html';link.textContent='Meet '+product.name+' →';
    const remove=document.createElement('button');remove.type='button';remove.textContent='Remove';remove.setAttribute('aria-label','Remove '+product.name+' from wishlist');remove.addEventListener('click',()=>{save(read().filter(s=>s!==product.sku));render()});
    copy.append(title,detail,link);card.append(image,copy,remove);list.append(card)
   })
  };render()
 }).catch(()=>{list.textContent='Your wishlist could not load. Please try again.'});
})();
