/* VIAIM interaction parameters: magnet=10, duration=1.5, Motion.spring(). */
(()=>{const reduced=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(hover:hover) and (pointer:fine)');
document.querySelectorAll('.on-header-icons>a').forEach(el=>{
 let animation,origin;
 const move=(x,y)=>{if(!window.Motion)return;animation?.stop();animation=Motion.animate(el,{x,y},{duration:.25});};
 el.addEventListener('mouseenter',()=>{origin=el.getBoundingClientRect()});
 el.addEventListener('mousemove',e=>{if(reduced.matches||!fine.matches)return;const r=origin||el.getBoundingClientRect();move(((e.clientX-r.left)/el.offsetWidth-.5)*10,((e.clientY-r.top)/el.offsetHeight-.5)*10)});
 el.addEventListener('mouseleave',()=>move(0,0));
 reduced.addEventListener('change',()=>move(0,0));
});})();
