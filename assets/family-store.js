(()=>{
 // Root/mobile pages share the actual Electric Hearts basket. Their old MI-1
 // checkout scripts are removed; product pages retain the standard cart drawer.
 const inHearts=location.pathname.includes('/electrichearts/');
 if(!inHearts)document.addEventListener('click',event=>{const a=event.target.closest('a[aria-label="Cart"]');if(!a)return;event.preventDefault();event.stopImmediatePropagation();top.location.href='/electrichearts/basket.html';},true);
})();
