/* A scroll-scrubbed landscape. All movement is a function of scroll progress. */
(()=>{'use strict';
const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
const smooth=(a,b,n)=>{n=clamp((n-a)/(b-a));return n*n*(3-2*n)};
function setup(root,video){
 if(root.dataset.relaxed==='true'||root.dataset.journeyReady)return;
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');if(reduce.matches)return;
 const stage=root.querySelector('.wr-hero'),canvas=root.querySelector('.wr-journey-canvas');
 const main=root.closest('main')||document,category=main.querySelector('.wr-categories'),signature=main.querySelector('.wr-signature'),story=main.querySelector('.wr-story');
 if(!canvas||!category||!signature||!story)return;
 if(!video){
  root.dataset.journeyReady='loading';
  const urls=["https://d2ol7oe51mr4n9.cloudfront.net/user_34c5NCSIlhTR97Hitd7WlY9Y5lI/e5cb13ee-2c5d-4314-86eb-099172321693.jpg","https://d2ol7oe51mr4n9.cloudfront.net/user_34c5NCSIlhTR97Hitd7WlY9Y5lI/1d7e4b89-71be-4b5b-b344-d138ec08ab4d.jpg","https://d2ol7oe51mr4n9.cloudfront.net/user_34c5NCSIlhTR97Hitd7WlY9Y5lI/3bf84727-031c-4713-9370-56ad4e5b3656.jpg","https://d2ol7oe51mr4n9.cloudfront.net/user_34c5NCSIlhTR97Hitd7WlY9Y5lI/aca9ba43-bee8-42fa-8242-bff0a5e24ccc.jpg","https://d2ol7oe51mr4n9.cloudfront.net/user_34c5NCSIlhTR97Hitd7WlY9Y5lI/36b1ee02-6e15-4b31-b3eb-3d1d55006173.jpg","https://d2ol7oe51mr4n9.cloudfront.net/user_34c5NCSIlhTR97Hitd7WlY9Y5lI/8408d8ff-70fd-4deb-9acc-4115e93d0214.jpg","https://d2ol7oe51mr4n9.cloudfront.net/user_34c5NCSIlhTR97Hitd7WlY9Y5lI/a8e57de5-3a1e-4232-bc1a-bd24be20ae5f.jpg","https://d2ol7oe51mr4n9.cloudfront.net/user_34c5NCSIlhTR97Hitd7WlY9Y5lI/693e048d-d8a0-40b8-8715-0b77eba55037.jpg","https://d2ol7oe51mr4n9.cloudfront.net/user_34c5NCSIlhTR97Hitd7WlY9Y5lI/e3302eb7-2915-457f-9c93-b16ade966f11.jpg","https://d2ol7oe51mr4n9.cloudfront.net/user_34c5NCSIlhTR97Hitd7WlY9Y5lI/0b0325f0-fe8f-4fad-850a-ed41a1ce28f5.jpg","https://d2ol7oe51mr4n9.cloudfront.net/user_34c5NCSIlhTR97Hitd7WlY9Y5lI/4943b7e5-6ba5-43a0-8a39-9b83cc14dbbc.jpg"];
  Promise.all(urls.map(src=>fetch(src).then(r=>{if(!r.ok)throw Error('Frame download');return r.blob();}))).then(async blobs=>{const first=await createImageBitmap(blobs[0]);delete root.dataset.journeyReady;if(root.isConnected)setup(root,{blobs,cache:new Map([[0,first]]),pending:new Set()});else first.close();}).catch(()=>{delete root.dataset.journeyReady;});
  return;
 }
 const frames=video,ctx=canvas.getContext('2d',{alpha:false});if(!ctx)return;
 root.dataset.journeyReady='true';
 const portal=document.createElement('div');portal.className='wr-landscape-portal';portal.setAttribute('aria-hidden','true');
 const opening=root.querySelector('.wr-journey-opening');portal.append(opening,canvas);document.body.append(portal);
 const coastWrap=document.createElement('div');coastWrap.className='wr-coast-scroll';story.before(coastWrap);coastWrap.append(story);
 root.classList.add('wr-journey-active');category.classList.add('wr-route-categories');signature.classList.add('wr-route-signature');story.classList.add('wr-coast-active');document.body.classList.add('wr-has-journey');
 const original=root.querySelector('.wr-slides'),bottom=root.querySelector('.wr-hero-bottom');
 const rail=root.querySelector('.wr-journey-rail'),caption=root.querySelector('.wr-journey-caption'),meter=rail.querySelector('.wr-journey-progress');
 rail.classList.add('wr-route-rail');caption.classList.add('wr-route-caption');document.body.append(rail,caption);
 const photo=story.querySelector('.wr-banner-image'),railLabel=rail.querySelector('span'),captionLabel=caption.querySelector('span');
 const heroPhotos=[...root.querySelectorAll('.wr-hero-image')].map(el=>({el,src:el.getAttribute('src'),srcset:el.getAttribute('srcset')}));
 heroPhotos.forEach(({el})=>{el.src=opening.src;el.removeAttribute('srcset');});
 let lastFrame=-1,sceneHeight=innerHeight,bannerHeight=innerHeight;
 let atlasFocus=0;
 // Advance on the display clock, not only on individual wheel/scroll events.
 let displayed=null,paintTime=0;
 function advance(desired,time){
  if(displayed===null){displayed=desired;paintTime=time;}
  const elapsed=Math.min(32,Math.max(0,time-paintTime));paintTime=time;
  const distance=desired-displayed;
  // Normal notches play sequentially; large jumps catch up within about 250ms.
  const step=Math.max(60,Math.abs(distance)/.25)*elapsed/1000;
  const next=displayed+Math.sign(distance)*Math.min(Math.abs(distance),step);
  const index=Math.floor(Math.round(next)/24);atlasFocus=index;
  loadAtlas(index);loadAtlas(index+1);loadAtlas(index-1);
  if(frames.cache.has(index))displayed=next;
  if(Math.abs(desired-displayed)>.001)request();
  return displayed/240;
 }
 function loadAtlas(index){
  if(index<0||index>=frames.blobs.length||frames.cache.has(index)||frames.pending.has(index))return;
  frames.pending.add(index);
  createImageBitmap(frames.blobs[index]).then(bitmap=>{
   frames.pending.delete(index);
   if(dead||Math.abs(index-atlasFocus)>1){bitmap.close();return;}
   frames.cache.set(index,bitmap);lastFrame=-1;request();
  }).catch(()=>frames.pending.delete(index));
 }
 function paint(progress){
  const n=Math.round(clamp(progress)*240),index=Math.floor(n/24);atlasFocus=index;
  for(const [key,bitmap] of frames.cache)if(Math.abs(key-index)>1){bitmap.close();frames.cache.delete(key);}
  loadAtlas(index);loadAtlas(index+1);loadAtlas(index-1);
  const atlas=frames.cache.get(index);if(!atlas||n===lastFrame)return;lastFrame=n;
  const w=canvas.width,h=sceneHeight*(canvas.height/innerHeight),scale=Math.max(w/1344,h/576),dw=1344*scale,dh=576*scale;
  const cell=n%24;ctx.globalAlpha=1;ctx.imageSmoothingQuality='high';ctx.drawImage(atlas,cell%6*1344,Math.floor(cell/6)*576,1344,576,(w-dw)/2,(h-dh)/2,dw,dh);
  canvas.dataset.frame=String(n);canvas.dataset.sourceResolution='1344x576';canvas.dataset.cachedAtlases=String(frames.cache.size);
 }
 let frame=0,current=scrollY,target=scrollY,start=0,coastStart=0,end=0,dead=false,panelBounds=[];
 function measure(){start=root.getBoundingClientRect().top+scrollY;coastStart=coastWrap.getBoundingClientRect().top+scrollY;end=coastStart+coastWrap.offsetHeight-story.offsetHeight;panelBounds=[category,signature].map(el=>{const b=el.getBoundingClientRect();return {top:b.top+scrollY,bottom:b.bottom+scrollY};});}
 function request(){if(!frame&&!dead)frame=requestAnimationFrame(draw);}
 function draw(time){
  frame=0;if(dead)return;current=target;
  const active=current>=start-innerHeight&&current<end+innerHeight;
  const route=clamp((current-start)/(coastStart-start)),p=clamp((current-coastStart)/(end-coastStart)),depart=(current-start)/innerHeight;
  const nextHeight=bannerHeight+(innerHeight-bannerHeight)*smooth(0,.65,depart);if(Math.abs(sceneHeight-nextHeight)>.1){sceneHeight=nextHeight;lastFrame=-1;}portal.style.height=sceneHeight+'px';
  const opacity=1-smooth(.08,.75,depart);
  original.style.opacity=opacity;bottom.style.opacity=opacity;original.inert=bottom.inert=opacity<.15;
  portal.style.visibility=active?'visible':'hidden';portal.style.transform='translateY('+Math.min(0,end-current)+'px)';
  opening.style.opacity=0;canvas.style.opacity=1;
  story.style.setProperty('--coast-arrived','0');
  rail.style.visibility=active?'visible':'hidden';rail.style.opacity=1-smooth(end,end+innerHeight*.35,current);
  const label=current<coastStart?'Scroll across the water':'A moment at the coast';if(railLabel.textContent!==label)railLabel.textContent=label;
  meter.style.transform='scaleX('+clamp((current-start)/(end-start))+')';
  const panel=panelBounds.some(b=>b.top-scrollY<innerHeight*.87&&b.bottom-scrollY>innerHeight*.12);
  caption.style.opacity=panel?0:smooth(.15,.3,route)*(1-smooth(.78,.94,route));
  const message=route<.5?'A little further from the noise.':'A brighter horizon ahead.';if(captionLabel.textContent!==message)captionLabel.textContent=message;
  if(active)paint(advance((route*.9+p*.1)*240,time));
  else {displayed=null;paintTime=0;}
  story.style.setProperty('--coast-progress',p);
  photo.style.transform='scale('+(1+p*.07)+') translate('+(-p*.8)+'%, '+(-p*.3)+'%)';

 }
 function resize(){const scale=Math.min(devicePixelRatio||1,2,2560/innerWidth);canvas.width=Math.round(innerWidth*scale);canvas.height=Math.round(innerHeight*scale);canvas.style.height=innerHeight+'px';bannerHeight=stage.offsetHeight;lastFrame=-1;measure();request();}
 function scroll(){target=scrollY;request();}
 const skip=()=>document.querySelector('#wearables-products')?.scrollIntoView({behavior:'auto'});
 const observer=new ResizeObserver(()=>{measure();request();});observer.observe(category);observer.observe(signature);
 function cleanup(){
  if(dead)return;dead=true;cancelAnimationFrame(frame);removeEventListener('scroll',scroll);removeEventListener('resize',resize);observer.disconnect();reduce.removeEventListener('change',motion);
  ctx.clearRect(0,0,canvas.width,canvas.height);for(const bitmap of frames.cache.values())bitmap.close();frames.cache.clear();
  heroPhotos.forEach(({el,src,srcset})=>{el.setAttribute('src',src);if(srcset)el.setAttribute('srcset',srcset);});
  stage.prepend(opening,canvas,caption,rail);portal.remove();coastWrap.before(story);coastWrap.remove();
  root.classList.remove('wr-journey-active');category.classList.remove('wr-route-categories');signature.classList.remove('wr-route-signature');story.classList.remove('wr-coast-active');
  rail.classList.remove('wr-route-rail');caption.classList.remove('wr-route-caption');document.body.classList.remove('wr-has-journey');
  [original,bottom,rail,caption,story,photo].forEach(el=>el.removeAttribute('style'));original.inert=bottom.inert=false;delete root.dataset.journeyReady;
  rail.querySelector('button').removeEventListener('click',skip);
 }
 const motion=()=>{if(reduce.matches)cleanup();};
 addEventListener('scroll',scroll,{passive:true});addEventListener('resize',resize);reduce.addEventListener('change',motion);
 rail.querySelector('button').addEventListener('click',skip);
root.addEventListener('wr:dispose',cleanup,{once:true});
 resize();request();
}
const modeButton=document.createElement('button');modeButton.type='button';modeButton.className='wr-mode-toggle';modeButton.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="16" height="6" rx="1.5"/><rect x="4" y="14" width="16" height="6" rx="1.5"/></svg>';modeButton.setAttribute('aria-label','Relaxed mode');modeButton.title='Switch to relaxed mode';modeButton.setAttribute('aria-pressed','false');document.querySelector('.wr-header-actions,.nx-wearables-page .on-header-icons')?.prepend(modeButton);
modeButton.addEventListener('click',()=>{
 const relaxed=modeButton.getAttribute('aria-pressed')!=='true';
 modeButton.setAttribute('aria-pressed',String(relaxed));modeButton.title=relaxed?'Switch to immersive mode':'Switch to relaxed mode';
 document.querySelectorAll('[data-wr-journey]').forEach(root=>{
  if(relaxed){root.dataset.relaxed='true';root.dispatchEvent(new Event('wr:dispose'));}
  else{delete root.dataset.relaxed;delete root.dataset.journeyReady;setup(root);}
 });window.scrollTo({top:0,behavior:'instant'});
});
document.querySelectorAll('[data-wr-journey]').forEach(root=>setup(root));
document.addEventListener('shopify:section:load',()=>document.querySelectorAll('[data-wr-journey]').forEach(root=>setup(root)));
document.addEventListener('shopify:section:unload',()=>document.querySelectorAll('[data-wr-journey]').forEach(el=>el.dispatchEvent(new Event('wr:dispose'))));
})();
