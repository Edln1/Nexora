(()=>{
const base=new URL('.',document.currentScript.src),reduced=matchMedia('(prefers-reduced-motion: reduce)');
const style=document.createElement('style');style.textContent=`.ag-editorial-row>.mi-motion{display:block;position:relative;overflow:hidden;border:0;border-radius:24px;padding:0!important;background:#eee;width:100%;aspect-ratio:3/2}.ag-editorial-row:nth-of-type(even)>.mi-motion{order:2}.mi-motion img,.mi-motion video{display:block;width:100%;height:100%;object-fit:cover}.mi-motion video{position:absolute;inset:0;opacity:0}.mi-motion.is-playing video{opacity:1}@media(max-width:760px){.ag-editorial-row:nth-of-type(even)>.mi-motion{order:0}}`;document.head.append(style);
document.querySelectorAll('.ag-editorial-row>img').forEach(img=>{
if(!img.src.includes('ag100-cat-life-scale2.webp'))return;
const box=document.createElement('div');box.className='mi-motion';img.replaceWith(box);box.append(img);
const video=document.createElement('video');video.muted=true;video.playsInline=true;video.preload='none';video.setAttribute('aria-hidden','true');box.append(video);
let visible=false,active=false;
const stop=()=>{active=false;video.pause();box.classList.remove('is-playing');if(video.readyState)video.currentTime=0};
const play=async()=>{if(active||reduced.matches||document.hidden)return;active=true;if(!video.src)video.src=new URL('mi1-hover-2.mp4',base).href;try{await video.play();if(active)box.classList.add('is-playing');else stop()}catch{stop()}};
const update=()=>{if(visible&&!document.hidden&&!reduced.matches)play();else stop()};
video.addEventListener('error',stop);
new IntersectionObserver(entries=>{visible=entries[0].isIntersecting&&entries[0].intersectionRatio>=.35;update()},{threshold:[0,.35]}).observe(box);
document.addEventListener('visibilitychange',update);reduced.addEventListener('change',update);
});
const img=document.querySelector('.ag-art>img[src*="ag100-black-stock"]');if(!img)return;
const host=img.parentElement;host.style.position='relative';const c=document.createElement('canvas');c.width=c.height=2000;c.setAttribute('aria-hidden','true');c.style.cssText='position:absolute;pointer-events:none;z-index:1;';host.append(c);const ctx=c.getContext('2d');
function position(){const s=getComputedStyle(img),pt=parseFloat(s.paddingTop)||0,pb=parseFloat(s.paddingBottom)||0;const size=Math.min(img.clientWidth,img.clientHeight-pt-pb);c.style.width=c.style.height=size+'px';c.style.left=(img.offsetLeft+(img.clientWidth-size)/2)+'px';c.style.top=(img.offsetTop+pt+(img.clientHeight-pt-pb-size)/2)+'px'}
new ResizeObserver(position).observe(img);img.addEventListener('load',position);position();
// Shapes based on saved WILL demo frames at 17.5s, 75.5s and 88s.
// Decorative screen sequence; no command/response relationship is implied.
function draw(open=1,expression='round'){
ctx.clearRect(0,0,2000,2000);if(open>=.999&&expression==='round')return;
for(const [x,y,color] of [[886,1123,68],[1100,1125,73]]){
const g=ctx.createLinearGradient(x-63,0,x+63,0);g.addColorStop(0,`rgb(${color-1},${color-1},${color-1})`);g.addColorStop(1,`rgb(${color+1},${color+1},${color+1})`);ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(x,y,62,61,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff';ctx.strokeStyle='#fff';
if(expression==='heart'){ctx.beginPath();ctx.moveTo(x,y+48);ctx.bezierCurveTo(x-12,y+41,x-49,y+8,x-48,y-18);ctx.bezierCurveTo(x-48,y-53,x-12,y-55,x,y-30);ctx.bezierCurveTo(x+14,y-55,x+48,y-53,x+48,y-18);ctx.bezierCurveTo(x+49,y+8,x+12,y+41,x,y+48);ctx.fill()}
else if(expression==='sleep'){ctx.lineWidth=12;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x-35,y-8);ctx.quadraticCurveTo(x,y+30,x+35,y-8);ctx.stroke()}
else{ctx.beginPath();ctx.ellipse(x,y,55.5,Math.max(3,53.5*open),0,0,Math.PI*2);ctx.fill()}
}}
let timer,step=0;
function animate(){if(reduced.matches||document.hidden){draw();timer=setTimeout(animate,1000);return}const mode=step++%4,t=performance.now(),duration=mode===0||mode===2?230:1250;function frame(now){if(reduced.matches||document.hidden){draw();timer=setTimeout(animate,1000);return}const p=(now-t)/duration;if(p>=1){draw();timer=setTimeout(animate,1600);return}if(mode===0||mode===2)draw(Math.abs(2*p-1));else draw(1,mode===1?'heart':'sleep');requestAnimationFrame(frame)}requestAnimationFrame(frame)}
function start(){clearTimeout(timer);timer=setTimeout(animate,450)}if(img.complete)start();else img.addEventListener('load',start,{once:true});reduced.addEventListener('change',()=>{draw()});
})();
