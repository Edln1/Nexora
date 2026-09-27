/* Nexora marketing measurement. No Meta script or events before consent. */
(()=>{
  if(window.nxMeta)return;
  const consentKey='nx-marketing-consent-v1', pixel='181981515695835';
  let choice;try{choice=localStorage.getItem(consentKey)}catch{}
  if(navigator.globalPrivacyControl)choice='denied';
  let initialized=false, viewed=false;const pending=[];
  function start(){
    if(choice!=='granted'||new URLSearchParams(location.search).has('session_id'))return;
    if(!initialized){
      const f=window.fbq=function(){f.callMethod?f.callMethod.apply(f,arguments):f.queue.push(arguments)};
      if(!window._fbq)window._fbq=f;f.push=f;f.loaded=true;f.version='2.0';f.queue=[];
      f('set','autoConfig',false,pixel);f('init',pixel);f('consent','grant');
      const s=document.createElement('script');s.async=true;s.src='https://connect.facebook.net/en_US/fbevents.js';document.head.append(s);initialized=true;
    }
    if(!viewed){viewed=true;window.fbq('track','PageView');if(/\/mi-1\//.test(location.pathname)||/mi-1|buy-ag100/.test(location.pathname))window.fbq('track','ViewContent',{content_ids:['mi-1'],content_type:'product',content_name:'MI-1',currency:'USD',value:99})}
    while(pending.length)pending.shift()();
  }
  function event(name,data,id){
    if(!['AddToCart','InitiateCheckout','Purchase'].includes(name))return;
    const send=()=>{
      const key=id?'nx-meta-'+id:null;
      try{if(key&&localStorage.getItem(key))return}catch{}
      window.fbq('track',name,data,id?{eventID:id}:undefined);
      try{if(key)localStorage.setItem(key,'1')}catch{}
    };
    if(choice==='granted'&&initialized)send();else if(choice!=='denied')pending.push(send);
    start();
  }
  function choose(value){choice=value;try{localStorage.setItem(consentKey,value)}catch{};document.getElementById('nx-consent')?.remove();if(value==='granted')start();else{pending.length=0;if(initialized)window.fbq('consent','revoke')}}
  function show(){
    if(document.getElementById('nx-consent'))return;
    const box=document.createElement('section');box.id='nx-consent';box.setAttribute('aria-label','Privacy choices');
    box.innerHTML='<strong>Your privacy choices</strong><p>With your permission, we use Meta cookies to measure visits and purchases from our ads. Checkout works either way. <a href="/tracking-privacy.html">Details</a></p><div><button data-consent="denied">Decline</button><button data-consent="granted">Allow marketing cookies</button></div>';
    box.addEventListener('click',e=>{const value=e.target.closest('[data-consent]')?.dataset.consent;if(value)choose(value)});document.body.append(box);
  }
  window.nxMeta={start,event};
  function ready(){
    const css=document.createElement('style');css.textContent='#nx-consent{position:fixed;z-index:2147483647;bottom:20px;left:20px;width:min(430px,calc(100vw - 40px));box-sizing:border-box;padding:20px;border:1px solid #d5dbe0;border-radius:16px;background:#fff;color:#192026;font:14px/1.5 system-ui;box-shadow:0 8px 40px #0002}#nx-consent p{margin:8px 0 16px;color:#48525b}#nx-consent a{color:inherit;text-decoration:underline}#nx-consent div{display:flex;gap:10px;flex-wrap:wrap}#nx-consent button{border:1px solid #a5afb8;border-radius:8px;padding:10px 14px;background:#fff;color:#192026;cursor:pointer;font:inherit}#nx-consent button:last-child{background:#192026;color:white}#nx-privacy-choice{display:block;margin:12px auto;padding:7px 12px;background:transparent;color:inherit;border:1px solid #aaa;border-radius:8px;cursor:pointer;font:12px system-ui}';document.head.append(css);
    const button=document.createElement('button');button.id='nx-privacy-choice';button.textContent='Cookie choices';button.addEventListener('click',show);document.body.append(button);
    if(!choice)show();start();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready);else ready();
})();
