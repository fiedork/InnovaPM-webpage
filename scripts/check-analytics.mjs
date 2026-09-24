import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../assets/analytics.js', import.meta.url), 'utf8');

function runAnalytics(hostname, storedConsent = null, pathname = '/') {
  const scripts = [];
  const listeners = {};
  const window = {
    location: { hostname, pathname },
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
assert.ok(
  production.window.dataLayer.some((entry) => entry[0] === 'event' && entry[1] === 'page_view'),
  'the tag must send exactly one explicit page_view carrying the page context',
);
assert.equal(
  production.window.dataLayer.filter((entry) => entry[0] === 'event' && entry[1] === 'page_view').length,
  1,
  'page_view must not be duplicated',
);
assert.equal(
  production.window.dataLayer.find((entry) => entry[0] === 'config')[2].send_page_view,
  false,
  'the automatic page_view must stay disabled while the explicit one is used',
);

for (const [path, group, line] of [['/', 'Doradztwo', 'advisory'], ['/index.html', 'Doradztwo', 'advisory'], ['/cross-media/', 'Cross-media', 'zpr_cross_media'], ['/cross-media/index.html', 'Cross-media', 'zpr_cross_media'], ['/polityka-prywatnosci/', 'Pozostale', 'other'], ['/cross-media-other/', 'Pozostale', 'other']]) {
  const run = runAnalytics('innova.pm', null, path);
  const config = run.window.dataLayer.filter(entry => entry[0] === 'config');
  assert.equal(config.length, 1);
  assert.equal(config[0][2].content_group, group);
  run.window.innovaTrack('generate_lead', { form_id: 'test', service_line: 'wrong' });
  const event = run.window.dataLayer.at(-1);
  assert.equal(event[2].content_group, group);
  assert.equal(event[2].service_line, line);
  assert.equal(event[2].form_id, 'test');
}
// The Google tag must live in the HTML itself: Search Console verification and other
// crawlers read the page source and never execute assets/analytics.js.
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const inlineTags = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)]
  .map((match) => match[1])
  .filter((body) => body.includes('googletagmanager.com/gtag/js'));
assert.equal(inlineTags.length, 1, 'index.html must carry exactly one inline Google tag');

function runBootstrap(sources, hostname, storedConsent = null, pathname = '/') {
  const scripts = [];
  const listeners = {};
  const window = {
    location: { hostname, pathname },
    localStorage: { getItem: () => storedConsent },
  };
  const document = {
    addEventListener: (name, listener) => { listeners[name] = listener; },
    createElement: () => ({}),
    head: { appendChild: (script) => scripts.push(script) },
    getElementById: () => null,
  };
  const context = vm.createContext({ URL, document, window });
  for (const source of sources) vm.runInContext(source, context);
  return { listeners, scripts, window };
}

const bootstrapped = runBootstrap([...inlineTags, source], 'innova.pm', 'granted');
assert.equal(
  bootstrapped.scripts.length,
  1,
  'the inline tag and analytics.js must not load the GA4 library twice',
);
assert.equal(
  bootstrapped.scripts[0].src,
  'https://www.googletagmanager.com/gtag/js?id=G-MVWSMYMWL1',
);
assert.equal(
  bootstrapped.window.__innovaTagBootstrapped,
  true,
  'the inline tag must mark itself as bootstrapped',
);
assert.ok(
  bootstrapped.window.dataLayer.some((entry) => entry[0] === 'consent' && entry[1] === 'default'),
  'the inline tag must set default consent before any hit',
);
assert.equal(
  bootstrapped.window.dataLayer.filter((entry) => entry[0] === 'event' && entry[1] === 'page_view').length,
  1,
  'the inline tag plus analytics.js must still send exactly one page_view',
);

const previewBootstrap = runBootstrap([...inlineTags, source], '127.0.0.1');
assert.equal(previewBootstrap.scripts.length, 0, 'the inline tag must stay off outside production');
assert.equal(previewBootstrap.window.dataLayer.length, 0, 'the inline tag must not queue hits outside production');

console.log('Analytics check passed (inline tag, host gate, consent, single tag load, page groups and event attribution verified).');
