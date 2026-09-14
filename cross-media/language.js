(function () {
  'use strict';
  var dictionary = window.crossMediaEnglish;
  var reverse = Object.fromEntries(Object.entries(dictionary).map(function (entry) { return [entry[1], entry[0]]; }));
  var toggle = document.getElementById('language-toggle');
  var current = 'pl';
  var metadata = Array.from(document.querySelectorAll('meta[name="description"],meta[property="og:title"],meta[property="og:description"],meta[name="twitter:title"],meta[name="twitter:description"]')).map(function (element) { return [element, element.content]; });
  window.crossMediaText = function (text) { return current === 'en' ? dictionary[text] || text : text; };
  function translate(text, lang) {
    var clean = text.trim();
    var polish = reverse[clean] || clean;
    var target = lang === 'en' ? dictionary[polish] || clean : polish;
    return text.replace(clean, target);
  }
  function setLanguage(lang) {
    current = lang;
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    var node;
    while ((node = walker.nextNode())) {
      if (node.parentElement.closest('script,style,#language-toggle') || !node.nodeValue.trim()) continue;
      node.nodeValue = translate(node.nodeValue, lang);
    }
    document.querySelectorAll('[aria-label],[placeholder],[alt]').forEach(function (element) {
      ['aria-label', 'placeholder', 'alt'].forEach(function (attribute) {
        if (element.hasAttribute(attribute)) element.setAttribute(attribute, translate(element.getAttribute(attribute), lang));
      });
    });
    var budget = document.querySelector('[name="budget"]');
    if (['Do ustalenia', 'To be agreed'].includes(budget.value)) budget.value = lang === 'en' ? 'To be agreed' : 'Do ustalenia';
    budget.defaultValue = lang === 'en' ? 'To be agreed' : 'Do ustalenia';
    document.documentElement.lang = lang;
    document.title = lang === 'en' ? dictionary['Kampanie cross-media ZPR — radio, digital i prasa | InnovaPM'] : 'Kampanie cross-media ZPR — radio, digital i prasa | InnovaPM';
    metadata.forEach(function (entry) {
      entry[0].content = lang === 'pl' ? entry[1] : entry[0].getAttribute('property') === 'og:title' || entry[0].name === 'twitter:title'
        ? 'One campaign. More ways to reach people. | InnovaPM'
        : 'ZPR radio, digital, social media, print and special projects. InnovaPM helps select channels for your goals, audience and budget — locally or across Poland.';
    });
    document.querySelector('meta[property="og:locale"]').content = lang === 'en' ? 'en_GB' : 'pl_PL';
    document.querySelector('[name="language"]').value = lang;
    document.querySelector('[name="language"]').defaultValue = lang;
    toggle.textContent = lang === 'pl' ? 'EN' : 'PL';
    toggle.setAttribute('aria-label', lang === 'pl' ? 'Przełącz na angielski' : 'Switch to Polish');
    toggle.setAttribute('lang', lang === 'pl' ? 'en' : 'pl');
    try { localStorage.setItem('innovapm-lang', lang); } catch (error) { /* The selected language remains active for this page. */ }
    var url = new URL(location.href);
    url.searchParams.set('lang', lang);
    history.replaceState(null, '', url);
    document.dispatchEvent(new Event('crossmedia:language'));
  }
  toggle.addEventListener('click', function () { setLanguage(current === 'pl' ? 'en' : 'pl'); });
  var initial = new URL(location.href).searchParams.get('lang');
  if (!['pl', 'en'].includes(initial)) {
    try { initial = localStorage.getItem('innovapm-lang'); } catch (error) { initial = 'pl'; }
  }
  setLanguage(initial === 'en' ? 'en' : 'pl');
})();
