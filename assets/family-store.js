(()=>{
 // Root/mobile pages share the actual Electric Hearts basket. Their old MI-1
 // checkout scripts are removed; product pages retain the standard cart drawer.
 const inHearts=location.pathname.includes('/electrichearts/');
 // Subdued parent-brand return: keep Electric Hearts' primary navigation focused on its own shop.
 if(inHearts){
  const credit=document.querySelector('.eh-footer-bottom > span:first-child');
  if(credit&&!credit.querySelector('a')&&credit.textContent.includes('Nexora')){
   const text=credit.textContent,at=text.lastIndexOf('Nexora');
   const parent=document.createElement('a');
   parent.href='/';parent.target='_top';parent.className='eh-parent-brand-link';
   parent.setAttribute('aria-label','Visit Nexora');parent.textContent='Nexora ↗';
   credit.replaceChildren(document.createTextNode(text.slice(0,at)),parent,document.createTextNode(text.slice(at+6)));
   const style=document.createElement('style');
   style.textContent='.eh-footer-bottom .eh-parent-brand-link{display:inline-flex;align-items:center;min-height:44px;color:inherit;font:inherit;text-decoration:none;text-underline-offset:4px}.eh-footer-bottom .eh-parent-brand-link:hover{text-decoration:underline}.eh-footer-bottom .eh-parent-brand-link:focus-visible{outline:2px solid currentColor;outline-offset:4px;border-radius:2px}';
   document.head.append(style);
  }
 }

 // Capture an ad landing visit only after the shopper's existing Google choice.
 // Checkout already includes this script; do not load a second copy there.
 if(inHearts&&!document.querySelector('script[src*="google-shopping-measurement.js"]')){
  const measurement=document.createElement('script');
  measurement.src='/electrichearts/assets/google-shopping-measurement.js?v=sitewide-20261006';
  measurement.defer=true;document.head.append(measurement);
 }
 if(!inHearts)document.addEventListener('click',event=>{const a=event.target.closest('a[aria-label="Cart"]');if(!a)return;event.preventDefault();event.stopImmediatePropagation();top.location.href='/electrichearts/basket.html';},true);
})();
