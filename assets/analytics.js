(function () {
  'use strict';

  var measurementId = 'G-MVWSMYMWL1';
  var isProduction = window.location.hostname === 'innova.pm';

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () {
    window.dataLayer.push(arguments);
  };

  window.innovaTrack = function (eventName, parameters) {
    if (!isProduction) return;
    window.gtag('event', eventName, parameters || {});
  };

  window.innovaSetAnalyticsConsent = function (value) {
    window.gtag('consent', 'update', {
      analytics_storage: value,
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    });
  };

  if (!isProduction) return;

  window.gtag('consent', 'default', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    wait_for_update: 500
  });

  try {
    if (window.localStorage.getItem('innova_cookie_consent_v2') === 'granted') {
      window.innovaSetAnalyticsConsent('granted');
    }
  } catch (error) {
    // Analytics remains denied when browser storage is unavailable.
  }

  window.gtag('js', new Date());
  window.gtag('config', measurementId);

  var analyticsScript = document.createElement('script');
  analyticsScript.async = true;
  analyticsScript.src = 'https://www.googletagmanager.com/gtag/js?id=' + measurementId;
  document.head.appendChild(analyticsScript);

  document.addEventListener('click', function (event) {
    var link = event.target.closest && event.target.closest('a[href]');
    if (!link) return;

    var href = link.getAttribute('href') || '';
    var section = link.closest('section');
    var context = section && section.id ? section.id : 'site';

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
