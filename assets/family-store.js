(()=>{
 // Root/mobile pages share the actual Electric Hearts basket. Their old MI-1
 // checkout scripts are removed; product pages retain the standard cart drawer.
 const inHearts=location.pathname.includes('/electrichearts/');
 // Capture an ad landing visit only after the shopper's existing Google choice.
 // Checkout already includes this script; do not load a second copy there.
 if(inHearts&&!document.querySelector('script[src*="google-shopping-measurement.js"]')){
  const measurement=document.createElement('script');
  measurement.src='/electrichearts/assets/google-shopping-measurement.js?v=sitewide-20261006';
  measurement.defer=true;document.head.append(measurement);
 }
 if(!inHearts)document.addEventListener('click',event=>{const a=event.target.closest('a[aria-label="Cart"]');if(!a)return;event.preventDefault();event.stopImmediatePropagation();top.location.href='/electrichearts/basket.html';},true);
})();
