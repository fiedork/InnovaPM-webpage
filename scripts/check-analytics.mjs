import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../assets/analytics.js', import.meta.url), 'utf8');

function runAnalytics(hostname, storedConsent = null) {
  const scripts = [];
  const listeners = {};
  const window = {
    location: { hostname },
    localStorage: { getItem: () => storedConsent },
  };
  const document = {
    addEventListener: (name, listener) => { listeners[name] = listener; },
    createElement: () => ({}),
    head: { appendChild: (script) => scripts.push(script) },
  };

  vm.runInNewContext(source, { URL, document, window });
  return { listeners, scripts, window };
}

const preview = runAnalytics('127.0.0.1');
assert.equal(preview.scripts.length, 0, 'preview must not load the GA4 library');
preview.window.innovaTrack('generate_lead');
assert.equal(preview.window.dataLayer.length, 0, 'preview must not queue analytics events');

const production = runAnalytics('innova.pm', 'granted');
assert.equal(production.scripts.length, 1, 'production must load the GA4 library once');
assert.equal(
  production.scripts[0].src,
  'https://www.googletagmanager.com/gtag/js?id=G-MVWSMYMWL1',
);
assert.ok(production.listeners.click, 'production must register contact link tracking');
assert.ok(
  production.window.dataLayer.some((entry) => entry[0] === 'consent' && entry[1] === 'default'),
  'production must set default consent',
);
assert.ok(
  production.window.dataLayer.some((entry) => entry[0] === 'consent' && entry[1] === 'update'),
  'stored analytics consent must be restored',
);

console.log('Analytics check passed (production host gate and consent verified).');
