/* A bounded wheel glide. Touch, zoom, keyboard and nested scrollers remain native. */
(()=>{
 'use strict';
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let frame=0,velocity=0,previous=0;
 const stop=()=>{if(frame)cancelAnimationFrame(frame);frame=0;velocity=0;previous=0;};
 const maximum=()=>Math.max(0,document.documentElement.scrollHeight-innerHeight);
 function tick(time){
  frame=0;
  const elapsed=previous?Math.min(32,time-previous):16.667;previous=time;
  const next=Math.max(0,Math.min(maximum(),scrollY+velocity*elapsed/16.667));
  if(Math.abs(velocity)<.15||Math.abs(next-scrollY)<.01){stop();return;}
  window.scrollTo({top:next,behavior:'instant'});
  velocity*=Math.pow(.88,elapsed/16.667);
  frame=requestAnimationFrame(tick);
 }
 function wheel(event){
  if(reduced.matches||event.defaultPrevented||event.ctrlKey||event.metaKey||event.shiftKey||!event.cancelable||Math.abs(event.deltaX)>Math.abs(event.deltaY)){stop();return;}
  const delta=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?innerHeight:1);
  if(!delta)return;
  // Give form controls, dialogs and independently scrolling panels their own wheel.
  for(const el of event.composedPath()){
   if(!(el instanceof Element)||el===document.body||el===document.documentElement)continue;
   if(el.matches('input,textarea,select,[contenteditable="true"],dialog')){stop();return;}
   const style=getComputedStyle(el);
   if(/auto|scroll/.test(style.overflowY)&&el.scrollHeight>el.clientHeight+1&&((delta>0&&el.scrollTop+el.clientHeight<el.scrollHeight-1)||(delta<0&&el.scrollTop>0))){stop();return;}
  }
  if((delta<0&&scrollY<=0)||(delta>0&&scrollY>=maximum())){stop();return;}
  event.preventDefault();
  if(Math.sign(delta)!==Math.sign(velocity))velocity=0;
  velocity=Math.max(-100,Math.min(100,velocity+Math.max(-220,Math.min(220,delta))*.24));
  if(!frame)frame=requestAnimationFrame(tick);
 }
 addEventListener('wheel',wheel,{passive:false});
 addEventListener('pointerdown',stop,{passive:true});
 addEventListener('touchstart',stop,{passive:true});
 addEventListener('keydown',stop);
 addEventListener('blur',stop);
 reduced.addEventListener('change',stop);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
})();
