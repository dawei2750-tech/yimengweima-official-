import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function read(file) {
  const target = path.join(root, file);
  if (!fs.existsSync(target)) {
    throw new Error(`${file} is missing`);
  }
  return fs.readFileSync(target, 'utf8');
}

const html = read('index.html');
const css = read('styles.css');
const js = read('main.js');
const pkg = JSON.parse(read('package.json'));
const vercel = JSON.parse(read('vercel.json'));

if (root !== process.cwd()) {
  throw new Error('validate-site.mjs must resolve files from the current checkout');
}

const requiredAssets = [
  'assets/hero-dream-horse-v2-wide-feathered.png',
  'assets/hero-gallery-bg.jpg',
  'assets/card-light-flow-horse.jpg',
  'assets/card-dark-rose.jpg',
  'assets/card-silver-dome.jpg',
  'assets/card-art-gallery.jpg',
  'assets/logo-light-horse.png'
];

for (const asset of requiredAssets) {
  if (!fs.existsSync(path.join(root, asset))) {
    throw new Error(`${asset} is missing`);
  }
  if (!html.includes(asset)) {
    throw new Error(`${asset} is not referenced in index.html`);
  }
}

for (const text of ['以梦为马', 'DREAM AS HORSE', '流光梦马', '暗夜玫瑰', '银白穹顶', '美术馆婚礼']) {
  if (!html.includes(text)) {
    throw new Error(`missing required copy: ${text}`);
  }
}

for (const token of ['particle-canvas', 'hero-horse', 'experience-card', 'magnetic-cta']) {
  if (!html.includes(token)) {
    throw new Error(`missing required markup: ${token}`);
  }
}

for (const token of ['gsap.min.js', 'data-animate=', 'mobile-nav-dots', 'swipe-hint', 'deck-reflection']) {
  if (!html.includes(token)) {
    throw new Error(`missing next-stage UI markup: ${token}`);
  }
}

for (const token of ['hero-bg-image', 'hero-horse-image', 'card-image', 'card-sheen']) {
  if (!html.includes(token) && !css.includes(token)) {
    throw new Error(`missing visual layer token: ${token}`);
  }
}

for (const token of ['@media (max-width: 760px)', 'perspective', 'backdrop-filter', 'text-wrap: balance']) {
  if (!css.includes(token)) {
    throw new Error(`missing responsive/premium CSS token: ${token}`);
  }
}

for (const token of ['hero-copy', 'deck-stage', 'mask-image', 'grid-template-columns: repeat(4', 'animation-ready']) {
  if (!css.includes(token)) {
    throw new Error(`missing next-stage UI CSS token: ${token}`);
  }
}

for (const token of ['max-width: min(1500px, 82vw)', '@media (max-width: 1100px)', 'font-size: 24px']) {
  if (!css.includes(token)) {
    throw new Error(`missing multi-size refinement CSS token: ${token}`);
  }
}

for (const token of ['requestAnimationFrame', 'pointermove', 'card.style.transform', 'drawHorse']) {
  if (!js.includes(token)) {
    throw new Error(`missing interaction token: ${token}`);
  }
}

for (const token of ['initEntranceMotion', 'window.gsap', 'prefers-reduced-motion', 'data-animate']) {
  if (!js.includes(token)) {
    throw new Error(`missing GSAP motion token: ${token}`);
  }
}

for (const token of ['animation-fallback-visible', 'setTimeout(showAnimationFallback', "document.body.classList.add('animation-complete')"]) {
  if (!js.includes(token)) {
    throw new Error(`missing animation fallback token: ${token}`);
  }
}

if (!js.includes('setTimeout(showAnimationFallback, 5600)')) {
  throw new Error('animation fallback timeout should wait until the GSAP entrance timeline has completed');
}

for (const token of ['.animation-fallback-visible .hero-horse-image', '.animation-fallback-visible .hero-copy', '.animation-fallback-visible .deck-stage']) {
  if (!css.includes(token)) {
    throw new Error(`missing animation fallback CSS token: ${token}`);
  }
}

if (css.includes('.animation-fallback-visible .experience-card {\n  transform: none')) {
  throw new Error('animation fallback must preserve card stage transforms');
}

for (const token of ['.card-deck::after', '.experience-card:nth-child(1)', '.deck-reflection']) {
  if (!css.includes(token)) {
    throw new Error(`missing PC card stage CSS token: ${token}`);
  }
}

for (const label of [
  ['首', '页'],
  ['策', '展'],
  ['灵', '感'],
  ['定', '制'],
  ['关', '于']
]) {
  if (!label.every((token) => html.includes(`<em>${token}</em>`))) {
    throw new Error(`missing mobile nav label: ${label.join('')}`);
  }
}

for (const token of ['.hero::before', '.hero::after', 'background-clip: text', 'mix-blend-mode: screen']) {
  if (!css.includes(token)) {
    throw new Error(`missing horse fusion/title CSS token: ${token}`);
  }
}

if (vercel.cleanUrls !== true) {
  throw new Error('vercel cleanUrls must be enabled');
}

if (pkg.scripts?.['measure:h5'] !== 'node tools/measure-h5-layout.mjs') {
  throw new Error('package.json must expose npm run measure:h5');
}

if (pkg.scripts?.['measure:h5:strict'] !== 'node tools/measure-h5-layout.mjs --strict') {
  throw new Error('package.json must expose npm run measure:h5:strict');
}

const measureScript = read('tools/measure-h5-layout.mjs');
for (const token of ['REFERENCE_SIZE', 'VIEWPORT', 'SELECTORS', 'THRESHOLDS', 'getBoundingClientRect', 'deltaPercent']) {
  if (!measureScript.includes(token)) {
    throw new Error(`missing H5 measurement token: ${token}`);
  }
}

console.log('official site validation ok');
