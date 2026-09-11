(()=>{'use strict';
const chapters=[...document.querySelectorAll('[data-chapter]')],pages=document.querySelector('.tj-pages'),links=[...document.querySelectorAll('[data-chapter-link]')];if(!pages)return;
pages.dataset.enhanced='true';
function selectChapter(id,scroll=false){const next=chapters.find(c=>c.id===id)||chapters[0];chapters.forEach(c=>{c.hidden=c!==next;c.classList.remove('is-entering')});next.classList.add('is-entering');links.forEach(a=>a.setAttribute('aria-current',String(a.dataset.chapterLink===next.id)));if(scroll){const target=matchMedia('(max-width:800px)').matches?pages:document.querySelector('#journal');target.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth',block:'start'})}}
selectChapter(window.__siteLocation.hash.slice(1),!!chapters.find(c=>c.id===window.__siteLocation.hash.slice(1)));
document.addEventListener('click',e=>{const a=e.target.closest('a[href^="#"]');if(!a)return;const id=a.getAttribute('href').slice(1);if(!chapters.some(c=>c.id===id))return;e.preventDefault();history.pushState(null,'','#'+id);selectChapter(id,true)});
addEventListener('popstate',()=>selectChapter(window.__siteLocation.hash.slice(1),true));addEventListener('hashchange',()=>selectChapter(window.__siteLocation.hash.slice(1),true));
chapters.forEach(chapter=>{const tabs=[...chapter.querySelectorAll('[data-variant]')],panels=[...chapter.querySelectorAll('.tj-variant-panel')];function activate(index,focus=false){tabs.forEach((t,i)=>{t.setAttribute('aria-selected',String(i===index));t.tabIndex=i===index?0:-1;panels[i].hidden=i!==index});if(focus)tabs[index].focus()}
tabs.forEach((t,i)=>{t.addEventListener('click',()=>activate(i));t.addEventListener('keydown',e=>{let next=i;if(e.key==='ArrowRight')next=(i+1)%tabs.length;else if(e.key==='ArrowLeft')next=(i+tabs.length-1)%tabs.length;else if(e.key==='Home')next=0;else if(e.key==='End')next=tabs.length-1;else return;e.preventDefault();activate(next,true)})});
const slider=chapter.querySelector('input[type="range"]');slider?.addEventListener('input',()=>{const n=Number(slider.value);chapter.style.setProperty('--angle',n+'deg');chapter.style.setProperty('--parallax',(-n/4)+'px');chapter.querySelector('output').textContent=n===0?'Centre view':Math.abs(n)+'° '+(n<0?'left':'right')});
});
})();
