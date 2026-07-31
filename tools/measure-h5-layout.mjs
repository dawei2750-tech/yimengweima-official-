import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { createRequire } from 'node:module';

const root = path.resolve('/root/yimengweima-official');
const REFERENCE_SIZE = { width: 941, height: 1672 };
const VIEWPORT = { width: 414, height: 736, isMobile: true };
const SCALE = VIEWPORT.width / REFERENCE_SIZE.width;

const SELECTORS = {
  brand: '.brand-lockup',
  horse: '.hero-horse-image',
  title: 'h1',
  subtitle: '.subtitle',
  cta: '.magnetic-cta',
  deck: '.deck-stage',
  firstCard: '.experience-card:nth-child(1)',
  secondCard: '.experience-card:nth-child(2)',
  fourthCard: '.experience-card:nth-child(4)'
};

// Manually measured from the reference H5 image at 941 x 1672.
const reference = {
  brand: { x: 31, y: 28, w: 190, h: 66 },
  horse: { x: 0, y: 133, w: 733, h: 554 },
  title: { x: 209, y: 705, w: 545, h: 185 },
  subtitle: { x: 267, y: 918, w: 408, h: 31 },
  cta: { x: 320, y: 979, w: 301, h: 66 },
  deck: { x: 31, y: 1143, w: 879, h: 426 },
  firstCard: { x: 39, y: 1146, w: 203, h: 393 },
  secondCard: { x: 267, y: 1149, w: 202, h: 388 },
  fourthCard: { x: 721, y: 1145, w: 204, h: 389 }
};

const THRESHOLDS = {
  positionPercent: 10,
  sizePercent: 16
};

function scaledReferenceBox(box) {
  return {
    x: Math.round(box.x * SCALE),
    y: Math.round(box.y * SCALE),
    w: Math.round(box.w * SCALE),
    h: Math.round(box.h * SCALE)
  };
}

function deltaPercent(actual, expected) {
  return Math.round(((actual - expected) / expected) * 1000) / 10;
}

function diffBox(actual, expected) {
  return {
    actual,
    expected,
    delta: {
      x: actual.x - expected.x,
      y: actual.y - expected.y,
      w: actual.w - expected.w,
      h: actual.h - expected.h
    },
    deltaPercent: {
      x: deltaPercent(actual.x, expected.x || 1),
      y: deltaPercent(actual.y, expected.y || 1),
      w: deltaPercent(actual.w, expected.w || 1),
      h: deltaPercent(actual.h, expected.h || 1)
    }
  };
}

function contentType(filePath) {
  const ext = path.extname(filePath);
  if (ext === '.html') return 'text/html; charset=utf-8';
  if (ext === '.css') return 'text/css; charset=utf-8';
  if (ext === '.js' || ext === '.mjs') return 'text/javascript; charset=utf-8';
  if (ext === '.png') return 'image/png';
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  return 'application/octet-stream';
}

function startServer() {
  const server = http.createServer((req, res) => {
    const urlPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const relative = urlPath === '/' ? 'index.html' : urlPath.slice(1);
    const filePath = path.resolve(root, relative);

    if (!filePath.startsWith(root) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }

    res.writeHead(200, { 'Content-Type': contentType(filePath) });
    fs.createReadStream(filePath).pipe(res);
  });

  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      resolve({ server, url: `http://127.0.0.1:${address.port}/` });
    });
  });
}

async function loadPlaywright() {
  try {
    return await import('playwright');
  } catch {
    const candidates = [
      '/root/protocol-observer/node_modules/playwright',
      '/root/guai/node_modules/playwright'
    ];
    for (const candidate of candidates) {
      if (fs.existsSync(candidate)) {
        const require = createRequire(import.meta.url);
        return require(candidate);
      }
    }
    throw new Error('Playwright is not available. Install it or set NODE_PATH to a node_modules directory containing playwright.');
  }
}

function summarizeFailures(measurements) {
  const failures = [];
  for (const [name, data] of Object.entries(measurements)) {
    const positionDeltas = ['x', 'y'].map((axis) => {
      const expected = data.expected[axis];
      if (expected === 0) {
        return data.delta[axis] === 0 ? 0 : Math.abs(data.delta[axis]);
      }
      return Math.abs(data.deltaPercent[axis]);
    });
    const posMax = Math.max(...positionDeltas);
    const sizeMax = Math.max(Math.abs(data.deltaPercent.w), Math.abs(data.deltaPercent.h));
    if (posMax > THRESHOLDS.positionPercent || sizeMax > THRESHOLDS.sizePercent) {
      failures.push({ name, posMax, sizeMax, data });
    }
  }
  return failures;
}

async function main() {
  const { chromium } = await loadPlaywright();
  const { server, url } = await startServer();
  let browser;

  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({
      viewport: VIEWPORT,
      deviceScaleFactor: 1
    });
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);

    const actual = await page.evaluate((selectors) => {
      const box = (selector) => {
        const element = document.querySelector(selector);
        if (!element) return null;
        const rect = element.getBoundingClientRect();
        return {
          x: Math.round(rect.x),
          y: Math.round(rect.y),
          w: Math.round(rect.width),
          h: Math.round(rect.height)
        };
      };

      return Object.fromEntries(
        Object.entries(selectors).map(([name, selector]) => [name, box(selector)])
      );
    }, SELECTORS);

    const measurements = {};
    for (const name of Object.keys(SELECTORS)) {
      measurements[name] = diffBox(actual[name], scaledReferenceBox(reference[name]));
    }

    const result = {
      referenceSize: REFERENCE_SIZE,
      viewport: VIEWPORT,
      scale: Math.round(SCALE * 10000) / 10000,
      thresholds: THRESHOLDS,
      measurements,
      failures: summarizeFailures(measurements)
    };

    console.log(JSON.stringify(result, null, 2));

    if (process.argv.includes('--strict') && result.failures.length > 0) {
      process.exitCode = 1;
    }
  } finally {
    if (browser) await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
