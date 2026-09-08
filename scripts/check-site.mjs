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
  /gtag\(['"]consent['"],\s*['"]default['"]/,
]) {
  if (!pattern.test(html)) errors.push(`missing index requirement: ${pattern}`);
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
