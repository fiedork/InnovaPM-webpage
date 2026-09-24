(function () {
  'use strict';

  var measurementId = 'G-MVWSMYMWL1';
  var consentKey = 'innova_cookie_consent_v2';
  var isProduction = window.location.hostname === 'innova.pm';
  var path = window.location.pathname || '/';
  var isMedia = /^\/cross-media(?:\/|$)/.test(path);
  var isHome = path === '/' || path === '/index.html' || path === '/InnovaPM-webpage/';
  var pageContext = {
    content_group: isMedia ? 'Cross-media' : isHome ? 'Doradztwo' : 'Pozostale',
    service_line: isMedia ? 'zpr_cross_media' : isHome ? 'advisory' : 'other'
  };

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () {
    window.dataLayer.push(arguments);
  };

  function readConsent() {
    try {
      return window.localStorage.getItem(consentKey);
    } catch (error) {
      return null;
    }
  }

  function storeConsent(value) {
    try {
      window.localStorage.setItem(consentKey, value);
    } catch (error) {
      // Consent still applies to this visit when browser storage is blocked.
    }
  }

  window.innovaTrack = function (eventName, parameters) {
    if (!isProduction) return;
    window.gtag('event', eventName, Object.assign({}, parameters || {}, pageContext));
  };

  window.innovaSetAnalyticsConsent = function (value) {
    window.gtag('consent', 'update', {
      analytics_storage: value,
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    });
  };

  function setBannerVisible(visible) {
    var banner = document.getElementById('cookie-banner');
    if (!banner) return;
    banner.hidden = !visible;
    banner.style.display = visible ? 'block' : 'none';
  }

  function rememberConsent(value) {
    storeConsent(value);
    window.innovaSetAnalyticsConsent(value);
    setBannerVisible(false);
  }

  // One consent-banner handler for every page that loads this shared tag, so the
  // banner logic is not duplicated per page. Cross-media keeps its own banner
  // implementation and raises window.__innovaConsentOwnedByPage; this module then
  // stays out of the way instead of wiring the same buttons twice.
  function initConsentBanner() {
    if (typeof document.getElementById !== 'function') return;
    if (window.__innovaConsentOwnedByPage === true) return;

    var stored = readConsent();
    if (stored === 'granted' || stored === 'denied') {
      window.innovaSetAnalyticsConsent(stored);
      setBannerVisible(false);
    } else {
      setBannerVisible(true);
    }

    var accept = document.getElementById('cookie-accept');
    var reject = document.getElementById('cookie-reject');
    var settings = document.getElementById('cookie-settings');

    if (accept) accept.addEventListener('click', function () { rememberConsent('granted'); });
    if (reject) reject.addEventListener('click', function () { rememberConsent('denied'); });
    if (settings) settings.addEventListener('click', function () {
      setBannerVisible(true);
      if (reject) reject.focus();
    });
  }

  if (typeof document.addEventListener === 'function') {
    document.addEventListener('DOMContentLoaded', initConsentBanner);
  }

  if (!isProduction) return;

  // The Google tag bootstrap (default consent, js, gtag.js loader) now lives inline
  // in each page's HTML so crawlers and Search Console verification see it without
  // running this file. This fallback fires only when that inline tag is absent - for
  // example HTML cached before it shipped - so gtag.js is never loaded twice.
  if (!window.__innovaTagBootstrapped) {
    window.gtag('consent', 'default', {
      analytics_storage: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      wait_for_update: 500
    });

    window.gtag('js', new Date());

    var fallbackTag = document.createElement('script');
    fallbackTag.async = true;
    fallbackTag.src = 'https://www.googletagmanager.com/gtag/js?id=' + measurementId;
    document.head.appendChild(fallbackTag);
  }

  if (readConsent() === 'granted') {
    window.innovaSetAnalyticsConsent('granted');
  }

  // content_group and service_line must reach every hit. Passing them as config
  // parameters alone is not enough: GA4 does not propagate them to the automatic
  // page_view or to Enhanced Measurement events. The group is therefore set for
  // the tag, the automatic page_view is disabled and an explicit page_view carries
  // the parameters, and every event sent through innovaTrack already merges them.
  window.gtag('config', measurementId, Object.assign({ send_page_view: false }, pageContext));
  window.gtag('set', pageContext);
  window.innovaTrack('page_view');

  document.addEventListener('click', function (event) {
    var target = event.target;
    var link = target && target.closest ? target.closest('a[href]') : null;
    if (!link) return;

    var href = link.getAttribute('href') || '';
    var section = link.closest('section');
    var context = section && section.id ? section.id : 'site';

    if (href === '#kontakt') {
      window.innovaTrack('cta_click', { cta_target: 'contact', cta_location: context });
      return;
    }

    if (href.indexOf('mailto:') === 0) {
      window.innovaTrack('mailto_click', { link_context: context });
      return;
    }

    if (href.indexOf('tel:') === 0) {
      window.innovaTrack('phone_click', { link_context: context });
      return;
    }

    try {
      var url = new URL(link.href);
      if (url.hostname === 'linkedin.com' || url.hostname.endsWith('.linkedin.com')) {
        window.innovaTrack('linkedin_click', { link_context: context });
      }
    } catch (error) {
      // Ignore malformed URLs; navigation continues normally.
    }
  });
})();
