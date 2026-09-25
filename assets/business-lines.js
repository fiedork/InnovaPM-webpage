(function () {
  'use strict';
  function update() {
    var english = document.documentElement.lang === 'en';

    // 1. Header desktop navigation link
    var nav = document.querySelector('header nav[aria-label="Main"]');
    if (nav) {
      var headerLink = nav.querySelector('.business-header-link');
      if (!headerLink) {
        headerLink = document.createElement('a');
        headerLink.className = 'business-header-link text-sm font-semibold text-sky-700 transition hover:text-sky-950 inline-flex items-center gap-1 ml-1';
        headerLink.href = './cross-media/';
        headerLink.setAttribute('data-cta', 'nav_cross_media');
        nav.appendChild(headerLink);
      }
      var headerText = (english ? 'Cross-media' : 'Kampanie cross-media') + ' <span aria-hidden="true" style="font-size:11px;">↗</span>';
      if (headerLink.innerHTML !== headerText) headerLink.innerHTML = headerText;
    }

    // 2. Header mobile navigation link
    var mobileContainer = document.querySelector('header .border-t .flex-col');
    if (mobileContainer) {
      var mobileLink = mobileContainer.querySelector('.business-mobile-link');
      if (!mobileLink) {
        mobileLink = document.createElement('a');
        mobileLink.className = 'business-mobile-link rounded-md px-3 py-3 text-left text-sm font-semibold text-sky-700 hover:bg-sky-50 flex items-center justify-between border-t border-slate-100 mt-1';
        mobileLink.href = './cross-media/';
        mobileLink.setAttribute('data-cta', 'mobile_nav_cross_media');
        mobileContainer.appendChild(mobileLink);
      }
      var mobileText = (english ? 'Cross-media campaigns' : 'Kampanie cross-media') + ' <span aria-hidden="true">↗</span>';
      if (mobileLink.innerHTML !== mobileText) mobileLink.innerHTML = mobileText;
    }

    // 3. Footer and business-entry block
    var privacy = document.getElementById('privacy');
    var footer = privacy && privacy.closest('footer');
    if (!footer) return;
    var block = document.getElementById('media-business-entry');
    if (!block) {
      block = document.createElement('aside');
      block.id = 'media-business-entry';
      block.className = 'business-entry';
      block.innerHTML = '<div class="business-entry-inner"><div><p class="business-entry-label"></p><h2></h2><p class="business-entry-copy"></p></div><a href="./cross-media/"></a></div>';
      footer.insertAdjacentElement('beforebegin', block);
    }
    var items = [
      ['.business-entry-label', english ? 'ANOTHER AREA OF INNOVAPM' : 'DRUGA LINIA BIZNESOWA INNOVAPM'],
      ['h2', english ? 'Advertising and media campaigns' : 'Reklama i kampanie mediowe'],
      ['.business-entry-copy', english ? 'Looking for ways to promote your business? Explore ZPR radio, digital, print and special projects.' : 'Szukasz możliwości promocji swojej firmy? Poznaj kampanie radiowe, digital, prasowe i projekty specjalne ZPR.'],
      ['a', english ? 'Explore cross-media campaigns →' : 'Poznaj kampanie cross-media →']
    ];
    items.forEach(function (item) { var el = block.querySelector(item[0]); if (el.textContent !== item[1]) el.textContent = item[1]; });
    var links = footer.querySelector('.business-footer-links');
    if (!links) {
      links = document.createElement('nav');
      links.className = 'business-footer-links';
      links.innerHTML = '<a href="./#uslugi"></a><a href="./cross-media/"></a>';
      footer.prepend(links);
    }
    var titles = english ? ['Strategy and technology advisory', 'Cross-media campaigns'] : ['Doradztwo strategiczne i technologiczne', 'Kampanie cross-media'];
    links.setAttribute('aria-label', english ? 'InnovaPM business lines' : 'Linie biznesowe InnovaPM');
    links.querySelectorAll('a').forEach(function (el, i) { if (el.textContent !== titles[i]) el.textContent = titles[i]; });
  }
  var queued = false;
  new MutationObserver(function () {
    if (queued) return;
    queued = true;
    requestAnimationFrame(function () { queued = false; update(); });
  }).observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['lang'] });
  update();
})();
