/* VIAIM interaction parameters: magnet=10, duration=1.5, Motion.spring(). */
(()=>{const reduced=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(hover:hover) and (pointer:fine)');
document.querySelectorAll('.on-header-icons>a').forEach(el=>{
 const move=(x,y)=>{if(!window.Motion)return;Motion.animate(el,{x,y},{duration:1.5,easing:Motion.spring()});};
 el.addEventListener('mousemove',e=>{if(reduced.matches||!fine.matches)return;const r=el.getBoundingClientRect();move(((e.clientX-r.left)/el.offsetWidth-.5)*10,((e.clientY-r.top)/el.offsetHeight-.5)*10)});
 el.addEventListener('mouseleave',()=>move(0,0));
 reduced.addEventListener('change',()=>move(0,0));
});})();