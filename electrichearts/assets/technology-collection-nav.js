/* Hover retains the mega menu; activating Technology opens its collection. */
document.addEventListener('click',function(event){
  const trigger=event.target.closest('[data-technology-collection]');
  if(!trigger)return;
  event.preventDefault();
  event.stopImmediatePropagation();
  if(location.pathname.endsWith('/everyday-technology.html')){
    if(window.scrollY>0)window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
    return;
  }
  window.location.assign('everyday-technology.html');
},true);
