document.addEventListener('DOMContentLoaded',()=>{
  const hero=document.querySelector('[data-px-hero-image]');
  document.querySelectorAll('[data-px-hero]').forEach(button=>button.addEventListener('click',()=>{
    if(!hero)return;
    hero.src=button.dataset.pxHero;
    hero.alt=button.dataset.pxAlt||'PIXO product scene';
    document.querySelectorAll('[data-px-hero]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
  }));
  const modes={
    reactions:{image:'assets/pixo-campaign-touch-detail-v2.webp',alt:'Close-up of white PIXO displaying a magenta pixel heart, with a fingertip on the upper rim',caption:'TOUCH INTERACTION / BUILT-IN PIXEL DISPLAY',eyebrow:'01 / EXPRESSIONS',title:'A little touch. A new reaction.',copy:'Cycle through the built-in emoji effects, or gently touch the upper or side points around the display to prompt a reaction and sound.'},
    clock:{image:'assets/pixo-campaign-clock-v1.webp',alt:'White PIXO displaying 7:30 in a morning bedside setting',caption:'CLOCK + TWO ALARMS / WHITE MODEL',eyebrow:'02 / CLOCK',title:'Time has a little personality.',copy:'The front display becomes a clock. Pair your phone to sync the time, or set it on the device; two alarm settings are documented for the N73.'},
    rhythm:{image:'assets/pixo-campaign-rhythm-v1.webp',alt:'White PIXO with colourful pixel rhythm bars beside a laptop',caption:'MUSIC-RHYTHM DISPLAY / WHITE MODEL',eyebrow:'03 / MUSIC RHYTHM',title:'Watch the music move.',copy:'Pair by Bluetooth to play music through the 10 W speaker. Switch on music-rhythm lighting to give the display a colourful response while you listen.'},
    night:{image:'assets/pixo-campaign-night-v1.webp',alt:'White PIXO with a glowing pixel heart on a softly lit bedside table',caption:'WHITE NOISE / WHITE MODEL',eyebrow:'04 / WHITE NOISE',title:'A softer soundtrack at night.',copy:'Use the built-in white-noise mode and sleep timer to settle the room. Set it beside your bed for reading, resting or winding down.'}
  };
  const image=document.querySelector('[data-px-image]'),caption=document.querySelector('[data-px-caption]'),eyebrow=document.querySelector('[data-px-eyebrow]'),title=document.querySelector('[data-px-title]'),copy=document.querySelector('[data-px-copy]');
  document.querySelectorAll('[data-px-mode]').forEach(button=>button.addEventListener('click',()=>{
    const mode=modes[button.dataset.pxMode];if(!mode||!image)return;
    image.src=mode.image;image.alt=mode.alt;caption.textContent=mode.caption;eyebrow.textContent=mode.eyebrow;title.textContent=mode.title;copy.textContent=mode.copy;
    document.querySelectorAll('[data-px-mode]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
  }));
});
