# 90 Percent Homepage Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the deployed “以梦为马” homepage from an abstract coded prototype to a 90% visual match with the generated PC/H5 concept: cinematic dream-horse hero, rich wedding gallery background, image-backed 3D glass cards, and polished responsive motion.

**Architecture:** Keep the site static and Vercel-friendly. Use AI-generated raster assets for the hard visual parts, then layer CSS/WebGL-lite canvas motion and card interactions on top. Avoid introducing a build pipeline until the site needs true Three.js scenes.

**Tech Stack:** Static HTML, CSS, vanilla JavaScript canvas, generated PNG/JPG/WebP assets, Vercel static hosting.

---

## File Structure

- Modify: `index.html`  
  Add image layers for the dream horse, gallery background, logo, and card images. Keep semantic text and controls.
- Modify: `styles.css`  
  Replace the current abstract-only visual with composited cinematic layers, responsive H5/PC positioning, card image masks, reflection, and stronger glass highlights.
- Modify: `main.js`  
  Keep particle/cursor animation, reduce abstract horse drawing, add pointer-driven parallax for image layers and card sheen.
- Create: `assets/hero-dream-horse.png`  
  Main transparent or dark-backed dream horse hero asset.
- Create: `assets/hero-gallery-bg.jpg`  
  Dark wedding gallery background with depth and floral/sculptural elements.
- Create: `assets/card-light-flow-horse.jpg`  
  Card 01 image.
- Create: `assets/card-dark-rose.jpg`  
  Card 02 image.
- Create: `assets/card-silver-dome.jpg`  
  Card 03 image.
- Create: `assets/card-art-gallery.jpg`  
  Card 04 image.
- Create: `assets/logo-light-horse.png`  
  Small logo mark based on the first logo direction.
- Modify: `scripts/validate-site.mjs`  
  Validate the new asset references and required visual layer class names.
- Create: `docs/visual-checklist.md`  
  Record the visual acceptance checklist for 90% target.

## Acceptance Target

- PC first viewport resembles `homepage-pc-concept.png` in layout, hierarchy, and mood.
- H5 is a real mobile H5 viewport, not a generic poster ratio: design target is `750x1624`; browser verification targets are CSS viewport `390x844` and `375x812`.
- H5 first viewport resembles a phone landing screen: dream horse dominates the upper half, CTA sits below title, and the image-backed card carousel begins within the first viewport.
- At least 6 real visual assets are used on the homepage.
- No horizontal page overflow on H5.
- Main content remains readable without relying on screenshots.
- Vercel deploy stays static: no build command required.

---

### Task 1: Asset Generation Briefs

**Files:**
- Create images under: `assets/`
- Create: `docs/visual-checklist.md`

- [ ] **Step 1: Generate the required six homepage assets**

Use `imagegen` with these six prompts, saving each final selected image into `assets/`:

```text
1. hero-dream-horse.png
Generate an ethereal horse made from silver bridal veil fabric, translucent particles, and comet-like emerald light trails. The horse must be elegant, high-fashion, not cartoon. Dark cinematic background or transparent-feeling black composition. It must work as the central hero image for the Chinese brand “以梦为马 / DREAM AS HORSE”. Leave enough safe margin for both a PC wide crop and an H5 `750x1624` phone crop.

2. hero-gallery-bg.jpg
Generate a dark luxury wedding-art-gallery interior with deep perspective, black stone floor, sculptural floral installations, subtle archways, silver-white highlights, emerald glints, and no people in foreground. It must support overlay text.

3. card-light-flow-horse.jpg
Generate a cinematic wedding scene named 流光梦马: glowing aisle, silver veil trails, dark gallery wedding, emerald light path, premium editorial style.

4. card-dark-rose.jpg
Generate a cinematic wedding scene named 暗夜玫瑰: black-red roses, dark banquet hall, dramatic art lighting, gothic luxury, no cute romance.

5. card-silver-dome.jpg
Generate a cinematic wedding scene named 银白穹顶: grand silver dome, white florals, architectural ceiling, polished luxury.

6. card-art-gallery.jpg
Generate a cinematic wedding scene named 美术馆婚礼: museum gallery, sculptures, couple silhouette far in background, black-silver palette, editorial luxury.
```

- [ ] **Step 2: Save the visual checklist**

Create `docs/visual-checklist.md`:

```markdown
# Visual Checklist

- PC hero has a recognizable dream horse, not only abstract lines.
- PC background has wedding gallery depth.
- PC cards contain real images and readable Chinese labels.
- H5 design target is `750x1624`; browser verification targets are `390x844` and `375x812`.
- H5 hero horse dominates the upper half without pushing the CTA below the first viewport.
- H5 has no horizontal page overflow.
- CTA is visible above the card carousel.
- Particle/cursor motion is visible but not distracting.
- Page works as static Vercel hosting.
```

- [ ] **Step 3: Commit assets and checklist**

Run:

```bash
git add assets docs/visual-checklist.md
git commit -m "asset: add homepage visual assets"
```

Expected: commit succeeds with generated image assets and checklist.

---

### Task 2: Static Validation Upgrade

**Files:**
- Modify: `scripts/validate-site.mjs`

- [ ] **Step 1: Extend the failing validation**

Update `scripts/validate-site.mjs` so it fails until asset references and new layer classes exist:

```js
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

for (const token of ['hero-bg-image', 'hero-horse-image', 'card-image', 'card-sheen']) {
  if (!html.includes(token) && !css.includes(token)) {
    throw new Error(`missing visual layer token: ${token}`);
  }
}
```

- [ ] **Step 2: Run validation and verify failure**

Run:

```bash
npm test
```

Expected: FAIL until `index.html` and CSS are updated to reference the new layers.

- [ ] **Step 3: Commit failing validation**

Run:

```bash
git add scripts/validate-site.mjs
git commit -m "test: require homepage visual assets"
```

Expected: commit succeeds.

---

### Task 3: Homepage Markup Composition

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Add image-backed hero layers**

Inside `<section class="hero">`, before `.topbar`, add:

```html
<div class="hero-bg-image" aria-hidden="true"></div>
<img class="hero-horse-image" src="./assets/hero-dream-horse.png" alt="" />
```

Replace the `.brand-mark` contents with:

```html
<img src="./assets/logo-light-horse.png" alt="" />
```

- [ ] **Step 2: Add card images and sheen**

Each `.experience-card` gets an image and sheen layer before text:

```html
<img class="card-image" src="./assets/card-light-flow-horse.jpg" alt="" />
<div class="card-sheen" aria-hidden="true"></div>
```

Use the matching image for each card.

- [ ] **Step 3: Run validation and verify remaining CSS/JS failures**

Run:

```bash
npm test
```

Expected: FAIL only if CSS or JS tokens are still missing.

- [ ] **Step 4: Commit markup**

Run:

```bash
git add index.html
git commit -m "feat: compose homepage visual layers"
```

Expected: commit succeeds.

---

### Task 4: PC/H5 Visual Styling

**Files:**
- Modify: `styles.css`

- [ ] **Step 1: Style the cinematic background and dream horse**

Add these rules:

```css
.hero-bg-image {
  position: absolute;
  inset: 0;
  z-index: 0;
  background: linear-gradient(180deg, rgba(3, 4, 6, 0.15), rgba(3, 4, 6, 0.88)),
    url("./assets/hero-gallery-bg.jpg") center / cover no-repeat;
  opacity: 0.78;
}

.hero-horse-image {
  position: absolute;
  z-index: 1;
  top: 3vh;
  left: 50%;
  width: min(980px, 72vw);
  transform: translateX(-38%);
  opacity: 0.95;
  filter: drop-shadow(0 0 42px rgba(73, 214, 194, 0.3));
  pointer-events: none;
}
```

- [ ] **Step 2: Style card images and glass**

Add:

```css
.card-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.62;
  filter: saturate(0.82) contrast(1.08);
}

.card-sheen {
  position: absolute;
  inset: 0;
  background: linear-gradient(120deg, transparent 8%, rgba(255, 255, 255, 0.22) 42%, transparent 68%);
  transform: translateX(-70%);
  opacity: 0.32;
}

.experience-card:hover .card-sheen {
  transform: translateX(70%);
  transition: transform 700ms ease;
}
```

- [ ] **Step 3: Add H5-specific image layout**

Inside `@media (max-width: 760px)`, add a phone-first layout tuned for `375x812` and `390x844` CSS viewports:

```css
.hero-bg-image {
  background-position: center top;
  opacity: 0.72;
}

.hero-horse-image {
  top: 8vh;
  left: 50%;
  width: min(136vw, 560px);
  transform: translateX(-50%);
}

.hero-horse {
  opacity: 0.22;
}

.hero-stage {
  min-height: 64vh;
  padding-top: 12px;
}

h1 {
  margin-top: 30vh;
  font-size: clamp(46px, 16vw, 66px);
}

.subtitle {
  font-size: 16px;
  letter-spacing: 3px;
}

.magnetic-cta {
  margin-top: 20px;
}
```

- [ ] **Step 4: Run validation**

Run:

```bash
npm test
```

Expected: PASS.

- [ ] **Step 5: Commit styling**

Run:

```bash
git add styles.css
git commit -m "style: match cinematic homepage concept"
```

Expected: commit succeeds.

---

### Task 5: Motion and Parallax Polish

**Files:**
- Modify: `main.js`

- [ ] **Step 1: Add parallax element references**

At the top:

```js
const heroHorseImage = document.querySelector('.hero-horse-image');
const heroBgImage = document.querySelector('.hero-bg-image');
```

- [ ] **Step 2: Add pointer parallax in `draw`**

Before `requestAnimationFrame(draw);`:

```js
if (heroHorseImage) {
  heroHorseImage.style.transform = `translateX(-38%) translate(${(pointer.x - 0.5) * 28}px, ${(pointer.y - 0.5) * 18}px)`;
}
if (heroBgImage) {
  heroBgImage.style.transform = `scale(1.04) translate(${(0.5 - pointer.x) * 12}px, ${(0.5 - pointer.y) * 8}px)`;
}
```

- [ ] **Step 3: Keep canvas motion but reduce abstract-horse dominance**

Change `drawHorse(time);` to:

```js
ctx.globalAlpha = 0.42;
drawHorse(time);
ctx.globalAlpha = 1;
```

- [ ] **Step 4: Run validation**

Run:

```bash
npm test
```

Expected: PASS.

- [ ] **Step 5: Commit motion**

Run:

```bash
git add main.js
git commit -m "feat: add homepage parallax motion"
```

Expected: commit succeeds.

---

### Task 6: Browser Visual Verification

**Files:**
- Read: `docs/visual-checklist.md`
- Generated screenshots: `/tmp/yimengweima-90-pc.png`, `/tmp/yimengweima-90-h5-390x844.png`, `/tmp/yimengweima-90-h5-375x812.png`

- [ ] **Step 1: Start local static server**

Run:

```bash
python3 -m http.server 4177
```

Expected: local server listens on `http://127.0.0.1:4177`.

- [ ] **Step 2: Capture PC screenshot**

Run:

```bash
google-chrome --headless=new --no-sandbox --disable-gpu --disable-crash-reporter --window-size=1440,900 --virtual-time-budget=3000 --screenshot=/tmp/yimengweima-90-pc.png http://127.0.0.1:4177
```

Expected: screenshot contains dream horse, image-backed cards, no blank canvas.

- [ ] **Step 3: Capture H5 screenshot at 390x844**

Run:

```bash
google-chrome --headless=new --no-sandbox --disable-gpu --disable-crash-reporter --window-size=390,844 --virtual-time-budget=3000 --screenshot=/tmp/yimengweima-90-h5-390x844.png http://127.0.0.1:4177
```

Expected: screenshot has no horizontal browser overflow, hero/CTA/cards are all visible in the intended first-screen composition, and card carousel remains usable.

- [ ] **Step 4: Capture H5 screenshot at 375x812**

Run:

```bash
google-chrome --headless=new --no-sandbox --disable-gpu --disable-crash-reporter --window-size=375,812 --virtual-time-budget=3000 --screenshot=/tmp/yimengweima-90-h5-375x812.png http://127.0.0.1:4177
```

Expected: screenshot has no horizontal browser overflow, title does not clip, CTA remains above the card carousel, and the first card is visible.

- [ ] **Step 5: Stop local server**

Run:

```bash
pkill -f "python3 -m http.server 4177"
```

Expected: no local server remains running.

- [ ] **Step 6: Commit any final visual fixes**

Run:

```bash
git status --short
git add index.html styles.css main.js scripts/validate-site.mjs docs/visual-checklist.md assets
git commit -m "fix: polish 90 percent homepage visuals"
```

Expected: commit only if there are visual fixes.

---

### Task 7: Push and Deploy

**Files:**
- Push all changed files to GitHub.
- Deploy through Vercel Git integration.

- [ ] **Step 1: Run final verification**

Run:

```bash
npm test
git status --short --branch
```

Expected: validation passes and branch is clean.

- [ ] **Step 2: Push to GitHub**

Run:

```bash
git push origin main
```

Expected: GitHub remote updates successfully.

- [ ] **Step 3: Trigger Vercel deployment**

Use Vercel Git integration on repository:

```text
dawei2750-tech/yimengweima-official-
```

Expected: Vercel creates a new deployment for `main`.

- [ ] **Step 4: Verify deployed asset URLs**

Run:

```bash
curl -I -L https://yimengweima-official-hgsy.vercel.app/
curl -I -L https://yimengweima-official-hgsy.vercel.app/assets/hero-dream-horse.png
curl -I -L https://yimengweima-official-hgsy.vercel.app/main.js
```

Expected: all return `HTTP/2 200`.

---

## Self-Review

- Spec coverage: The plan covers visual assets, PC/H5 composition, card images, parallax, validation, Git push, and Vercel deployment.
- Placeholder scan: No TBD/TODO placeholders remain; each implementation step names exact files and commands.
- Type consistency: Asset names, class names, and validation tokens match across tasks.
