(() => {
  if (new URLSearchParams(location.search).get('market') !== 'US') return;

  document.body.dataset.ehMarket = 'US';
  document.querySelectorAll('a[href]').forEach((link) => {
    const href = link.getAttribute('href');
    if (href === 'speakers.html') link.setAttribute('href', 'speakers.html?market=US');
    if (href === 'shipping-and-returns.html') link.setAttribute('href', 'shipping-and-returns-us.html');
    if (href?.startsWith('expression-charging-speaker.html')) {
      link.setAttribute('href', href.replace('expression-charging-speaker.html', 'pixo-n73-us.html'));
    }
  });

  const heroNote = document.querySelector('.sc-hero .sc-note');
  if (heroNote) heroNote.textContent = 'Shopping from the United States? PIXO N73 White is currently our only US speaker offer. $79.99 USD with standard US shipping included. The other available speakers ship within Canada.';
  document.querySelector('.sc-us-market')?.remove();

  const heroArt = document.querySelector('.sc-hero-art');
  if (heroArt) {
    heroArt.setAttribute('href', 'pixo-n73-us.html');
    const label = heroArt.querySelector('.sc-art-label');
    const photo = heroArt.querySelector('img');
    const caption = heroArt.querySelector('.sc-art-bottom span');
    const action = heroArt.querySelector('.sc-art-bottom b');
    if (label) label.textContent = 'MEET PIXO / WHITE EDITION';
    if (photo) {
      photo.src = 'assets/expression-charging-speaker-studio-v1.png';
      photo.alt = 'White PIXO N73 pixel Bluetooth speaker';
    }
    if (caption) caption.textContent = 'Sound. A smile. A place to recharge.';
    if (action) action.textContent = 'Discover PIXO ↗';
  }

  const lineup = document.querySelector('.sc-lineup');
  const pixoLineupCard = [...(lineup?.children || [])].find((card) => card.querySelector('strong')?.textContent?.trim() === 'PIXO');
  if (pixoLineupCard) lineup.prepend(pixoLineupCard);

  const finalNote = document.querySelector('.sc-compare > .sc-note');
  if (finalNote) finalNote.textContent = 'PIXO N73 White is the only US offer shown here. Its price includes standard US shipping; see its page for delivery details. ECHO, ORBI, BOP and BT369 are currently offered for Canadian delivery only. BIP is a collection preview.';

  document.querySelectorAll('.sc-story').forEach((story) => {
    const kicker = story.querySelector('.sc-kicker')?.textContent || '';
    const price = story.querySelector('.eh-collection-price');
    const action = story.querySelector('.sc-text-link');
    if (!price) return;
    if (kicker.startsWith('PIXO')) {
      price.textContent = '$79.99 USD · Standard US shipping included';
      if (action) action.textContent = 'Choose PIXO for US delivery ↗';
    } else {
      price.textContent = 'Available for Canadian delivery · ' + price.textContent;
      if (action) action.textContent = 'View ' + kicker.split(' / ')[0] + ' (Canada) ↗';
    }
  });

  document.querySelectorAll('.sc-compare-grid .sc-choice').forEach((card) => {
    const name = card.querySelector('h3')?.textContent?.trim();
    const availability = card.querySelector('.family-card-availability');
    if (!availability) return;
    if (name === 'PIXO') {
      availability.textContent = '$79.99 USD · Standard US shipping included';
      const action = card.querySelector('span');
      if (action) action.textContent = 'Choose PIXO for US delivery ↗';
    } else if (name !== 'BIP') {
      availability.textContent = 'Available for Canadian delivery only';
      const action = card.querySelector('span');
      if (action) action.textContent = 'View ' + name + ' (Canada) ↗';
    }
  });
  const compare = document.querySelector('.sc-compare-grid');
  const pixoCompareCard = [...(compare?.children || [])].find((card) => card.querySelector('h3')?.textContent?.trim() === 'PIXO');
  if (pixoCompareCard) compare.prepend(pixoCompareCard);

  const menuNote = document.querySelector('.eh-menu-collections .on-mega-card p');
  if (menuNote) menuNote.innerHTML = 'For your desk. For your soundtrack.<br>PIXO is available in the United States.';
})();
