(()=>{
const base=new URL('.',document.currentScript.src),reduced=matchMedia('(prefers-reduced-motion: reduce)');
const style=document.createElement('style');style.textContent=`.ag-editorial-row>.mi-motion{display:block;position:relative;overflow:hidden;border:0;border-radius:24px;padding:0;background:#eee;width:100%;aspect-ratio:3/2;cursor:pointer}.ag-editorial-row:nth-of-type(even)>.mi-motion{order:2}.mi-motion img,.mi-motion video{display:block;width:100%;height:100%;object-fit:cover}.mi-motion video{position:absolute;inset:0;opacity:0}.mi-motion.is-playing video{opacity:1}.mi-motion:focus-visible{outline:3px solid #ffb600;outline-offset:5px}.mi-motion .mi-play-label{position:absolute;bottom:16px;right:16px;background:#13181bd9;color:white;padding:8px 12px;border-radius:22px;font:12px/1.3 system-ui;pointer-events:none}.mi-motion.is-playing .mi-play-label{opacity:0}@media(max-width:760px){.ag-editorial-row:nth-of-type(even)>.mi-motion{order:0}}`;document.head.append(style);
const files=['ag100-life-day-v3.webp','ag100-cat-life-scale2.webp','ag100-life-evening-v3.webp'];
document.querySelectorAll('.ag-editorial-row>img').forEach(img=>{
const i=files.findIndex(n=>img.src.includes(n));if(i<0)return;
const box=document.createElement('button');box.type='button';box.className='mi-motion';box.setAttribute('aria-label','Play scene '+(i+1));box.setAttribute('aria-pressed','false');img.replaceWith(box);box.append(img);
const video=document.createElement('video');video.muted=true;video.playsInline=true;video.preload='none';video.setAttribute('aria-hidden','true');box.append(video);
const label=document.createElement('span');label.className='mi-play-label';label.textContent=matchMedia('(hover:hover)').matches?'Hover to play ↗':'Tap to play ▷';box.append(label);
let active=false;
const stop=()=>{active=false;video.pause();box.classList.remove('is-playing');box.setAttribute('aria-pressed','false');if(video.readyState)video.currentTime=0};
const play=async()=>{active=true;if(!video.src)video.src=new URL('mi1-hover-'+(i+1)+'.mp4',base).href;try{await video.play();if(active){box.classList.add('is-playing');box.setAttribute('aria-pressed','true')}else stop()}catch{stop()}};
box.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'&&!reduced.matches)play()});box.addEventListener('pointerleave',e=>{if(e.pointerType==='mouse')stop()});box.addEventListener('click',()=>active?stop():play());box.addEventListener('blur',stop);video.addEventListener('ended',stop);video.addEventListener('error',stop);
new IntersectionObserver(entries=>{if(!entries[0].isIntersecting)stop()}).observe(box);document.addEventListener('visibilitychange',()=>{if(document.hidden)stop()});
});
const img=document.querySelector('.ag-art>img[src*="ag100-black-stock"]');if(!img)return;
const host=img.parentElement;host.style.position='relative';const c=document.createElement('canvas');c.width=c.height=2000;c.setAttribute('aria-hidden','true');c.style.cssText='position:absolute;pointer-events:none;z-index:1;';host.append(c);const ctx=c.getContext('2d');
function position(){const s=getComputedStyle(img),pt=parseFloat(s.paddingTop)||0,pb=parseFloat(s.paddingBottom)||0;const size=Math.min(img.clientWidth,img.clientHeight-pt-pb);c.style.width=c.style.height=size+'px';c.style.left=(img.offsetLeft+(img.clientWidth-size)/2)+'px';c.style.top=(img.offsetTop+pt+(img.clientHeight-pt-pb-size)/2)+'px'}
new ResizeObserver(position).observe(img);img.addEventListener('load',position);position();
function draw(open){ctx.clearRect(0,0,2000,2000);if(open>=.999)return;for(const [x,y,color] of [[886,1123,68],[1100,1125,73]]){const g=ctx.createLinearGradient(x-63,0,x+63,0);g.addColorStop(0,`rgb(${color-1},${color-1},${color-1})`);g.addColorStop(1,`rgb(${color+1},${color+1},${color+1})`);ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(x,y,60,59,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.ellipse(x,y,55.5,Math.max(3,53.5*open),0,0,Math.PI*2);ctx.fill()}}
let timer;function blink(){if(reduced.matches||document.hidden){timer=setTimeout(blink,4000);return}const t=performance.now();function frame(now){const p=(now-t)/230;if(p>=1){draw(1);timer=setTimeout(blink,3800+Math.random()*2300);return}draw(Math.abs(2*p-1));requestAnimationFrame(frame)}requestAnimationFrame(frame)}timer=setTimeout(blink,2200);reduced.addEventListener('change',()=>{draw(1)});
})();
