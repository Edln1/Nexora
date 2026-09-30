/* Google Ads measurement loads only after a separate Google-specific consent. */
(()=>{
 const key='eh-google-ads-consent-v1',destination='AW-18478122075/CgyFCO7W6IcdENuIh-tE';
 let choice=null,started=false,pending=null;
 try{choice=localStorage.getItem(key)}catch{}
 if(navigator.globalPrivacyControl)choice='denied';
 function start(){
  if(choice!=='granted'||navigator.globalPrivacyControl||new URLSearchParams(location.search).has('session_id'))return;
  if(!started){
   window.dataLayer=window.dataLayer||[];
   window.gtag=window.gtag||function(){window.dataLayer.push(arguments)};
   window.gtag('js',new Date());
   window.gtag('config','AW-18478122075');
   const script=document.createElement('script');script.async=true;script.src='https://www.googletagmanager.com/gtag/js?id=AW-18478122075';document.head.append(script);started=true;
  }
  window.gtag('consent','update',{ad_storage:'granted',ad_user_data:'granted',ad_personalization:'granted',analytics_storage:'granted'});
  if(pending){
   const p=pending;pending=null;
   window.gtag('event','conversion',{send_to:destination,value:p.value,currency:p.currency,transaction_id:p.eventId});
  }
 }
 window.ehGooglePurchase=p=>{
  if(!p||!/^nx_[a-f0-9]{32}$/.test(p.eventId)||!Number.isFinite(p.value)||p.value<=0||!['USD','CAD'].includes(p.currency)||choice==='denied')return;
  pending=p;start();
 };
 function show(){
  if(document.getElementById('eh-google-consent'))return;
  const box=document.createElement('aside');box.id='eh-google-consent';box.setAttribute('aria-label','Google advertising privacy choices');
  box.style.cssText='position:fixed;bottom:20px;left:20px;z-index:2147483647;max-width:360px;margin-right:20px;padding:20px;background:white;color:#222;border:1px solid #ddd;border-radius:16px;box-shadow:0 8px 32px #0002;font:14px/1.5 system-ui';
  box.innerHTML='<strong>Advertising cookies</strong><p>Allow Google Ads cookies to measure visits and confirmed purchases? Checkout works either way. <a href="google-ads-privacy.html">Privacy details</a></p><button type="button" data-choice="denied">Decline</button> <button type="button" data-choice="granted">Allow Google Ads cookies</button>';
  box.addEventListener('click',e=>{
   const value=e.target.closest('[data-choice]')?.dataset.choice;if(!value)return;
   choice=navigator.globalPrivacyControl?'denied':value;try{localStorage.setItem(key,choice)}catch{}
   box.remove();
   if(choice==='granted')start();else{pending=null;if(started)window.gtag('consent','update',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied'})}
  });document.body.append(box);
 }
 const button=document.querySelector('[data-eh-google-privacy]')||document.createElement('button');button.textContent='Privacy choices';button.type='button';button.addEventListener('click',show);
 if(!button.isConnected){button.style.cssText='position:fixed;bottom:12px;left:12px;z-index:1000;padding:6px 10px;border:1px solid #dce3dc;border-radius:999px;background:#fff;color:#59655d;font:11px/1.2 system-ui;cursor:pointer;box-shadow:0 2px 9px #0001';document.body.append(button)}
 if(!choice)show();start();
})();
