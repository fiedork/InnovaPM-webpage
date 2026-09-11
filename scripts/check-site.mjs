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
  /<script\s+src="\.\/assets\/analytics\.js"><\/script>/,
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

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(`Site check passed (${localRefs.length} local references verified).`);
