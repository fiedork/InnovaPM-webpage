import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const errors = [];
const required = [
  'index.html',
  'robots.txt',
  'sitemap.xml',
  'assets/index-cfc00eb1.js',
  'assets/index-445a0a2a.css',
  'assets/analytics.js',
  'assets/conversion-ui.js',
  'assets/conversion-ui.css',
  'assets/card-system.css',
  'assets/card-images/audience-strategy.webp',
  'assets/card-images/audience-ai.webp',
  'assets/card-images/audience-product.webp',
  'assets/card-images/audience-data.webp',
  'assets/card-images/service-strategy.webp',
  'assets/card-images/service-digital.webp',
  'assets/card-images/service-finance.webp',
  'assets/card-images/service-training.webp',
  'assets/card-images/cooperation-contract.webp',
  'assets/card-images/cooperation-interim.jpg',
  'assets/card-images/knowledge-guide.webp',
  'assets/card-images/process-cycles.webp',
  'assets/innova-og.jpg',
  'assets/innova-hero.webp',
  'assets/krzysztof-fiedorowicz.webp',
];

for (const file of required) {
  if (!existsSync(resolve(root, file))) errors.push(`missing required file: ${file}`);
}

const html = readFileSync(resolve(root, 'index.html'), 'utf8');
for (const pattern of [
  /<html\s+lang="pl">/,
  /<title>[^<]+<\/title>/,
  /<meta\s+name="description"/,
  /<link\s+rel="canonical"/,
  /<meta\s+property="og:image"/,
  /<meta\s+name="twitter:card"/,
  /<script\s+type="application\/ld\+json">/,
  /<script\s+src="\.\/assets\/analytics\.js(?:\?v=\d+)?"><\/script>/,
  /<script\s+src="\.\/assets\/conversion-ui\.js"><\/script>/,
  /<link\s+rel="stylesheet"\s+href="\.\/assets\/conversion-ui\.css"/,
  /<link\s+rel="stylesheet"\s+href="\.\/assets\/card-system\.css\?v=\d+"/,
]) {
  if (!pattern.test(html)) errors.push(`missing index requirement: ${pattern}`);
}

const analytics = readFileSync(resolve(root, 'assets/analytics.js'), 'utf8');
const bundle = readFileSync(resolve(root, 'assets/index-cfc00eb1.js'), 'utf8');
const cardSystem = readFileSync(resolve(root, 'assets/card-system.css'), 'utf8');
for (const pattern of [
  /#dla-kogo/,
  /#uslugi/,
  /#proces/,
  /#wspolpraca/,
  /#wdrozenia/,
  /#wiedza/,
  /:focus-visible/,
  /prefers-reduced-motion:\s*reduce/,
]) {
  if (!pattern.test(cardSystem)) errors.push(`missing card system requirement: ${pattern}`);
}

for (const asset of required.filter((file) => file.startsWith('assets/card-images/'))) {
  if (!cardSystem.includes(`./${asset.replace('assets/', '')}`)) {
    errors.push(`card image is not referenced by the card system: ${asset}`);
  }
}

for (const pattern of [
  /window\.location\.hostname === 'innova\.pm'/,
  /generate_lead/,
  /cta_click/,
  /'mailto_click'/,
  /'phone_click'/,
  /'linkedin_click'/,
  /ad_user_data: 'denied'/,
  /ad_personalization: 'denied'/,
]) {
  if (!pattern.test(analytics) && !pattern.test(bundle)) {
    errors.push(`missing analytics requirement: ${pattern}`);
  }
}

if (bundle.includes('form_submit')) {
  errors.push('legacy form_submit event remains in the production bundle');
}

for (const pattern of [
  /<meta\s+name="robots"\s+content="index,follow,max-image-preview:large"\s*\/>/,
  /<meta\s+property="og:site_name"\s+content="InnovaPM"\s*\/>/,
  /href="\/cross-media\/"/,
]) {
  if (!pattern.test(html)) errors.push(`missing index SEO requirement: ${pattern}`);
}
if ((html.match(/<h1\b/g) || []).length !== 1) {
  errors.push('index.html must expose exactly one static h1 for crawlers');
}
if (html.includes('innova_cookie_consent_v2')) {
  errors.push('index.html must not duplicate the consent-banner logic owned by analytics.js');
}

const notFound = resolve(root, '404.html');
if (!existsSync(notFound)) {
  errors.push('missing branded 404.html');
} else {
  const page = readFileSync(notFound, 'utf8');
  for (const pattern of [
    /name="robots" content="noindex,follow"/,
    /src="\/assets\/analytics\.js"/,
    /href="\/cross-media\/"/,
  ]) {
    if (!pattern.test(page)) errors.push(`404 requirement missing: ${pattern}`);
  }
}

for (const pattern of [
  /send_page_view: false/,
  /gtag\('set'/,
  /innovaTrack\('page_view'\)/,
]) {
  if (!pattern.test(analytics)) errors.push(`analytics page-context requirement missing: ${pattern}`);
}

// The Google tag is inline on every page that loads analytics.js, so crawlers and
// Search Console verification can see it in the HTML source.
for (const page of ['index.html', '404.html', 'polityka-prywatnosci/index.html', 'cross-media/index.html']) {
  const content = readFileSync(resolve(root, page), 'utf8');
  for (const pattern of [
    /https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=G-MVWSMYMWL1/,
    /window\.location\.hostname === 'innova\.pm'/,
    /__innovaTagBootstrapped/,
  ]) {
    if (!pattern.test(content)) errors.push(`${page} must carry the inline Google tag: ${pattern}`);
  }
}

const conversionUi = readFileSync(resolve(root, 'assets/conversion-ui.js'), 'utf8');
for (const section of ['uslugi', 'wdrozenia', 'faq']) {
  if (!conversionUi.includes(`id: '${section}'`)) {
    errors.push(`missing repeated CTA after section: ${section}`);
  }
}

for (const copy of [
  'Umów bezpłatną diagnozę 30 min',
  'Book a free 30-minute diagnosis',
  'Zobacz przykłady wdrożeń',
  'See implementation examples',
  'Poproś o termin diagnozy',
  'Request a diagnosis slot',
]) {
  if (!conversionUi.includes(copy) && !bundle.includes(copy)) {
    errors.push(`missing conversion copy: ${copy}`);
  }
}

const localRefs = [...html.matchAll(/(?:src|href)="(?:\.\/)?(assets\/[^"#?]+)/g)].map((m) => m[1]);
for (const ref of localRefs) {
  if (!existsSync(resolve(root, ref))) errors.push(`broken local reference: ${ref}`);
}

const sitemap = readFileSync(resolve(root, 'sitemap.xml'), 'utf8');
if (!sitemap.includes('https://innova.pm/polityka-prywatnosci/')) {
  errors.push('sitemap is missing the canonical privacy URL');
}
if (sitemap.includes('prywatno\u015bci')) {
  errors.push('sitemap must not declare the legacy Unicode privacy URL');
}

// Legacy Unicode URL (declared in the sitemap until 2026-09-08 and indexed by Google)
// must keep resolving and redirect clients to the canonical ASCII page.
const legacyRedirect = resolve(root, 'polityka-prywatno\u015bci', 'index.html');
if (!existsSync(legacyRedirect)) {
  errors.push('missing legacy redirect for /polityka-prywatno\u015bci/');
} else {
  const redirect = readFileSync(legacyRedirect, 'utf8');
  for (const pattern of [
    /<link rel="canonical" href="https:\/\/innova\.pm\/polityka-prywatnosci\/">/,
    /<meta http-equiv="refresh" content="0; url=https:\/\/innova\.pm\/polityka-prywatnosci\/">/,
    /href="https:\/\/innova\.pm\/polityka-prywatnosci\/"/,
  ]) {
    if (!pattern.test(redirect)) errors.push(`legacy redirect requirement missing: ${pattern}`);
  }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(`Site check passed (${localRefs.length} local references verified).`);
