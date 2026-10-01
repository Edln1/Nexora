document.addEventListener('DOMContentLoaded',()=>{
  const hero=document.querySelector('[data-px-hero-image]');
  document.querySelectorAll('[data-px-hero]').forEach(button=>button.addEventListener('click',()=>{
    if(!hero)return;
    hero.src=button.dataset.pxHero;
    hero.alt=button.dataset.pxAlt||'PIXO N73 supplier product photograph';
    document.querySelectorAll('[data-px-hero]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
  }));
  const modes={
    reactions:{image:'assets/pixo-supplier-4.webp',alt:'Supplier photo of white N73 showing a pixel-eyes expression during a touch interaction',caption:'TOUCH-TRIGGERED EXPRESSION / WHITE MODEL',eyebrow:'01 / EXPRESSIONS',title:'A face you can interact with.',copy:'Cycle through the built-in emoji effects, or gently touch the upper or side points around the display to prompt a reaction and sound.'},
    clock:{image:'assets/pixo-supplier-6.webp',alt:'Supplier photo of white N73 showing a pixel clock while a phone rests on the wireless charging pad',caption:'CLOCK + PHONE CHARGING / WHITE MODEL',eyebrow:'02 / CLOCK',title:'Time has a little personality.',copy:'The front display becomes a clock. Pair your phone to sync the time, or set it on the device; two alarm settings are documented for the N73.'},
    rhythm:{image:'assets/pixo-supplier-3.webp',alt:'Supplier photo of white N73 with colourful music-rhythm bars and a view of the speaker components',caption:'MUSIC-RHYTHM DISPLAY / WHITE MODEL',eyebrow:'03 / MUSIC RHYTHM',title:'Watch the music move.',copy:'Pair by Bluetooth to play music through the 10 W speaker. Switch on music-rhythm lighting to give the display a colourful response while you listen.'},
    night:{image:'assets/pixo-supplier-5.webp',alt:'Supplier lifestyle photo of alternate blue N73 finish beside a sleeping person, illustrating white-noise playback',caption:'WHITE-NOISE SCENE / ALTERNATE FINISH',eyebrow:'04 / WHITE NOISE',title:'A softer soundtrack at night.',copy:'Use the built-in white-noise mode and sleep timer to settle the room. This supplier photo shows an alternate finish; the PIXO option sold here is white.'}
  };
  const image=document.querySelector('[data-px-image]'),caption=document.querySelector('[data-px-caption]'),eyebrow=document.querySelector('[data-px-eyebrow]'),title=document.querySelector('[data-px-title]'),copy=document.querySelector('[data-px-copy]');
  document.querySelectorAll('[data-px-mode]').forEach(button=>button.addEventListener('click',()=>{
    const mode=modes[button.dataset.pxMode];if(!mode||!image)return;
    image.src=mode.image;image.alt=mode.alt;caption.textContent=mode.caption;eyebrow.textContent=mode.eyebrow;title.textContent=mode.title;copy.textContent=mode.copy;
    document.querySelectorAll('[data-px-mode]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
  }));
});
