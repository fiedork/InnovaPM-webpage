(function () {
  'use strict';

  var sections = [
    {
      id: 'uslugi',
      pl: ['Nie wiesz, który zakres jest właściwy?', 'W 30 minut wybierzemy problem, od którego warto zacząć.'],
      en: ['Not sure which service fits?', 'In 30 minutes, we will identify the problem worth starting with.']
    },
    {
      id: 'wdrozenia',
      pl: ['Chcesz osiągnąć podobny efekt?', 'Omówmy Twój przypadek i realny pierwszy krok.'],
      en: ['Want to achieve a similar outcome?', 'Let us discuss your situation and a realistic first step.']
    },
    {
      id: 'faq',
      pl: ['Masz inne pytanie?', 'Odpowiem na nie podczas krótkiej, bezpłatnej diagnozy.'],
      en: ['Have another question?', 'I will answer it during a short, free diagnosis.']
    }
  ];

  function language() {
    return document.documentElement.lang === 'en' ? 'en' : 'pl';
  }

  function updateCopy() {
    var lang = language();
    document.querySelectorAll('[data-conversion-cta]').forEach(function (block) {
      var config = sections.find(function (item) {
        return item.id === block.getAttribute('data-conversion-cta');
      });
      if (!config) return;

      block.querySelector('[data-cta-title]').textContent = config[lang][0];
      block.querySelector('[data-cta-copy]').textContent = config[lang][1];
      block.querySelector('[data-cta-link]').textContent = lang === 'en'
        ? 'Book a free 30-minute diagnosis'
        : 'Umów bezpłatną diagnozę 30 min';
      block.setAttribute('aria-label', lang === 'en' ? 'Free diagnosis' : 'Bezpłatna diagnoza');
    });
  }

  function createBlock(config) {
    var block = document.createElement('aside');
    block.className = 'conversion-cta';
    block.setAttribute('data-conversion-cta', config.id);

    var content = document.createElement('div');
    content.className = 'conversion-cta__content';

    var copy = document.createElement('div');
    var title = document.createElement('h3');
    title.className = 'conversion-cta__title';
    title.setAttribute('data-cta-title', '');
    var text = document.createElement('p');
    text.className = 'conversion-cta__copy';
    text.setAttribute('data-cta-copy', '');
    copy.append(title, text);

    var link = document.createElement('a');
    link.className = 'conversion-cta__link';
    link.href = '#kontakt';
    link.setAttribute('data-cta-link', '');

    content.append(copy, link);
    block.append(content);
    return block;
  }

  function mount(attempt) {
    var mounted = 0;
    sections.forEach(function (config) {
      if (document.querySelector('[data-conversion-cta="' + config.id + '"]')) {
        mounted += 1;
        return;
      }

      var section = document.getElementById(config.id);
      if (!section) return;
      section.insertAdjacentElement('afterend', createBlock(config));
      mounted += 1;
    });

    updateCopy();
    if (mounted < sections.length && attempt < 120) {
      window.requestAnimationFrame(function () { mount(attempt + 1); });
    }
  }

  window.addEventListener('DOMContentLoaded', function () {
    mount(0);
    new MutationObserver(updateCopy).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['lang']
    });
  });
})();
