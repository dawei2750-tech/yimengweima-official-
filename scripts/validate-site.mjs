import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('/root/yimengweima-official');

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
const vercel = JSON.parse(read('vercel.json'));

const requiredAssets = [
  'assets/hero-dream-horse.png',
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

for (const token of ['requestAnimationFrame', 'pointermove', 'card.style.transform', 'drawHorse']) {
  if (!js.includes(token)) {
    throw new Error(`missing interaction token: ${token}`);
  }
}

if (vercel.cleanUrls !== true) {
  throw new Error('vercel cleanUrls must be enabled');
}

console.log('official site validation ok');
