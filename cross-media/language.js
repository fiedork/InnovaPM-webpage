(function () {
  'use strict';
  var dictionary = window.crossMediaEnglish || {};
  var isEn = document.documentElement.lang === 'en' || /\/cross-media\/en(?:\/|$)/.test(location.pathname);
  window.crossMediaText = function (text) {
    return isEn ? (dictionary[text] || text) : text;
  };
})();
