import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import vm from 'node:vm';

const root = resolve(import.meta.dirname, '..');
const html = readFileSync(resolve(root, 'cross-media/index.html'), 'utf8');
const source = readFileSync(resolve(root, 'cross-media/cross-media.js'), 'utf8');
const stylesheet = readFileSync(resolve(root, 'cross-media/cross-media.css'), 'utf8');
for (const [, selector] of stylesheet.matchAll(/(?:^|[{}])([^{}]*\bnav\b[^{}]*)\{/g)) {
  assert.ok(selector.trim().startsWith('.site-header nav'), `Header navigation CSS must not affect footer: ${selector}`);
}
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
assert.equal(new Set(ids).size, ids.length, 'IDs must be unique');
assert.equal((html.match(/<h1\b/g) || []).length, 1);
for (const [, value] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
  if (value.startsWith('#')) assert.ok(ids.includes(value.slice(1)), `Missing anchor ${value}`);
  else if (!/^(https?:|mailto:|tel:)/.test(value)) {
    assert.ok(existsSync(resolve(root, 'cross-media', value.split(/[?#]/)[0])), `Missing asset ${value}`);
  }
}
assert.ok(html.includes('https://innova.pm/cross-media/'));
assert.equal((html.match(/rel="canonical"/g) || []).length, 1);
assert.ok(html.includes('name="robots" content="index,follow,max-image-preview:large"'));
const schema = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
assert.ok(schema['@graph'].some(item => item['@type'] === 'WebPage'));
assert.ok(schema['@graph'].some(item => item['@type'] === 'Service'));
assert.equal((html.match(/src="\.\.\/assets\/analytics\.js"/g) || []).length, 1);
assert.ok(readFileSync(resolve(root, 'sitemap.xml'), 'utf8').includes('https://innova.pm/cross-media/'));
assert.equal((html.match(/class="channel-card"/g) || []).length, 6);
assert.equal(new Set([...html.matchAll(/\.\/logos\/([^" ]+)/g)].map(m => m[1])).size, 7);
assert.ok(!html.includes('Jeden cel. Dobrany zestaw kanałów.'));
assert.ok(!html.includes('Marki i znaki należą do ich właścicieli.'));
assert.ok(html.includes('Prawa do marek i znaków przysługują właściwym spółkom z Grupy ZPR Media.'));
assert.ok(html.includes('https://www.grupazpr.pl/#kontakt'));
assert.equal((html.match(/class="brand-owner-note"/g) || []).length, 1);

function setup(response, storedConsent = null, storageThrows = false) {
  const nodes = {};
  function node(id) {
    return nodes[id] ||= { dataset: {}, handlers: {}, hidden: true, value: '', disabled: false,
      innerHTML: 'Wyślij', textContent: '', attrs: {},
      addEventListener(name, fn) { this.handlers[name] = fn; },
      setAttribute(key, value) { this.attrs[key] = value; }, getAttribute(key) { return this.attrs[key]; },
      removeAttribute(key) { delete this.attrs[key]; }, focus() {},
      setCustomValidity(value) { this.validationMessage = value; }, reportValidity() { return !this.validationMessage; },
      classList: { remove() {}, toggle() {} }, contains() { return false; }
    };
  }
  const button = node('submit');
  const form = node('brief');
  form.action = 'https://formspree.io/f/mnngrewp';
  form.reportValidity = () => true;
  form.querySelector = () => button;
  form.reset = () => { form.wasReset = true; };
  const calls = [], events = [], consent = [];
  const storage = { getItem() { if (storageThrows) throw Error('blocked'); return storedConsent; }, setItem(key, value) { if (storageThrows) throw Error('blocked'); storedConsent = value; } };
  const window = { innovaTrack: (...args) => events.push(args), innovaSetAnalyticsConsent: value => consent.push(value), setTimeout: () => 1, clearTimeout() {} };
  const document = { getElementById: node, querySelector: () => node('menu'), addEventListener: (name, fn) => { node('document').handlers[name] = fn; } };
  class SyntheticFormData { constructor() { this.data = { service_line: 'zpr_cross_media' }; } }
  const fetch = async (url, options) => { calls.push({ url, options }); if (response instanceof Error) throw response; return response; };
  vm.runInNewContext(source, { document, window, localStorage: storage, fetch, FormData: SyntheticFormData, AbortController, Object, String, Error });
  return { node, form, button, calls, events, consent };
}
const success = setup({ ok: true });
await success.form.handlers.submit({ preventDefault() {} });
assert.equal(success.calls.length, 1);
assert.equal(success.calls[0].options.method, 'POST');
assert.equal(success.node('form-status').dataset.state, 'success');
assert.ok(success.form.wasReset);
assert.equal(success.events.filter(e => e[0] === 'generate_lead').length, 1);
assert.equal(success.button.disabled, false);
for (const response of [{ ok: false, status: 422 }, new Error('Network unavailable'), Object.assign(new Error('Timed out'), { name: 'AbortError' })]) {
  const fail = setup(response);
  await fail.form.handlers.submit({ preventDefault() {} });
  assert.equal(fail.node('form-status').dataset.state, 'error');
  assert.ok(!fail.form.wasReset, 'Failed submission must preserve values');
  assert.ok(!fail.events.some(e => e[0] === 'generate_lead'));
  assert.equal(fail.button.disabled, false);
}
const invalid = setup({ ok: true });
for (const file of [{name:'brief.exe',size:20},{name:'brief.pdf',size:11*1024*1024}]) {
  const upload = setup({ok:true});
  upload.node('brief-attachment').files = [file];
  await upload.form.handlers.submit({preventDefault(){}});
  assert.equal(upload.calls.length,0);
  assert.ok(upload.node('brief-attachment').validationMessage);
}
const upload = setup({ok:true});
upload.node('brief-attachment').files = [{name:'brief.pdf',size:2048}];
await upload.form.handlers.submit({preventDefault(){}});
assert.equal(upload.calls.length,1);
invalid.form.reportValidity = () => false;
await invalid.form.handlers.submit({ preventDefault() {} });
assert.equal(invalid.calls.length, 0);
const repeated = setup({ ok: true });
repeated.button.disabled = true;
await repeated.form.handlers.submit({ preventDefault() {} });
assert.equal(repeated.calls.length, 0);
const blocked = setup({ ok: true }, null, true);
assert.equal(blocked.node('cookie-banner').hidden, false);
blocked.node('cookie-reject').handlers.click();
assert.equal(blocked.consent[0], 'denied');
assert.equal(blocked.node('cookie-banner').hidden, true);
for (const [, params] of success.events) {
  assert.equal(params.service_line, 'zpr_cross_media');
  assert.ok(!['name', 'email', 'phone', 'company', 'campaign_area'].some(key => key in params), 'No contact data in analytics');
}
console.log('Cross-media checks passed: assets, anchors, 7 logos, 6 channels, success, HTTP/network/timeout errors, validation, duplicate guard, blocked storage, analytics privacy. No requests sent.');
