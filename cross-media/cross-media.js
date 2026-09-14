(function () {
  'use strict';
  function t(text) { return window.crossMediaText ? window.crossMediaText(text) : text; }
  var form = document.getElementById('brief');
  form.enctype = 'multipart/form-data';
  var attachment = document.getElementById('brief-attachment');
  function validateAttachment() {
    var file = attachment.files && attachment.files[0];
    var error = '';
    if (file && !/\.(pdf|docx?|pptx?|xlsx?)$/i.test(file.name)) error = 'Wybierz plik PDF, Word, PowerPoint lub Excel.';
    if (file && file.size > 10 * 1024 * 1024) error = 'Plik przekracza 10 MB. Wybierz mniejszy brief.';
    attachment.setCustomValidity(t(error));
    return !error;
  }
  attachment.addEventListener('change', function () { validateAttachment(); attachment.reportValidity(); });
  document.addEventListener('crossmedia:language', validateAttachment);
  var menu = document.querySelector('.menu-toggle');
  var nav = document.getElementById('navigation');
  var consentKey = 'innova_cookie_consent_v2';
  var banner = document.getElementById('cookie-banner');
  function track(name, params) {
    if (window.innovaTrack) window.innovaTrack(name, Object.assign({ service_line: 'zpr_cross_media', offer_family: 'media' }, params));
  }
  function closeMenu() { menu.setAttribute('aria-expanded', 'false'); nav.classList.remove('is-open'); }
  menu.addEventListener('click', function () {
    var open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') { closeMenu(); menu.focus(); }
  });
  document.addEventListener('click', function (event) {
    var link = event.target.closest('a');
    if (!link) return;
    if (nav.contains(link)) closeMenu();
    if (link.dataset.goal) {
      document.getElementById('campaign-goal').value = link.dataset.goal;
      document.getElementById('campaign-goal').focus({ preventScroll: true });
    }
    if (link.dataset.cta) track('cta_click', { cta_location: link.dataset.cta, cta_target: 'media_brief' });
    if (link.dataset.brand) track('media_brand_click', { brand_id: link.dataset.brand });
  });
  var started = false;
  form.addEventListener('input', function () {
    if (!started) { track('form_start', { form_id: 'cross_media' }); started = true; }
  });
  form.addEventListener('submit', async function (event) {
    event.preventDefault();
    if (!validateAttachment() || !form.reportValidity()) { attachment.reportValidity(); return; }
    var button = form.querySelector('[type="submit"]');
    if (button.disabled) return;
    var status = document.getElementById('form-status');
    var buttonText = button.innerHTML;
    var controller = new AbortController();
    var timeout = window.setTimeout(function () { controller.abort(); }, 60000);
    button.disabled = true;
    button.textContent = t('Wysyłanie…');
    var languageToggle = document.getElementById('language-toggle');
    languageToggle.disabled = true;
    status.textContent = '';
    status.removeAttribute('data-state');
    track('form_submit_attempt', { form_id: 'cross_media' });
    try {
      var response = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' }, signal: controller.signal });
      if (!response.ok) throw new Error('Form service returned ' + response.status);
      status.dataset.state = 'success';
      status.textContent = t('Dziękuję za zapytanie. Wrócę z pytaniami uzupełniającymi lub propozycją rozmowy o kampanii.');
      track('generate_lead', { form_id: 'cross_media' });
      form.reset();
      started = false;
    } catch (error) {
      status.dataset.state = 'error';
      status.textContent = t(error.name === 'AbortError'
        ? 'Nie otrzymaliśmy potwierdzenia wysyłki. Zanim spróbujesz ponownie, sprawdź zapytanie pod adresem krzysztof@innova.pm — mogło już dotrzeć.'
        : 'Nie udało się potwierdzić wysyłki. Twoje dane pozostały w formularzu. Spróbuj ponownie lub napisz na krzysztof@innova.pm.');
      track('form_error', { form_id: 'cross_media', reason: error.name === 'AbortError' ? 'timeout' : 'request_failed' });
    } finally {
      window.clearTimeout(timeout);
      button.disabled = false;
      languageToggle.disabled = false;
      button.innerHTML = buttonText;
      status.focus({ preventScroll: true });
    }
  });
  function setConsent(value) {
    try { localStorage.setItem(consentKey, value); } catch (error) { /* Consent still applies to this visit when storage is blocked. */ }
    if (window.innovaSetAnalyticsConsent) window.innovaSetAnalyticsConsent(value);
    banner.hidden = true;
  }
  try { banner.hidden = !!localStorage.getItem(consentKey); } catch (error) { banner.hidden = false; }
  document.getElementById('cookie-accept').addEventListener('click', function () { setConsent('granted'); });
  document.getElementById('cookie-reject').addEventListener('click', function () { setConsent('denied'); });
  document.getElementById('cookie-settings').addEventListener('click', function () { banner.hidden = false; document.getElementById('cookie-reject').focus(); });
})();
