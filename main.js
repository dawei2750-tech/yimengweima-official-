const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');
const cards = [...document.querySelectorAll('.experience-card')];
const cta = document.querySelector('.magnetic-cta');
const heroHorseImage = document.querySelector('.hero-horse-image');
const heroBgImage = document.querySelector('.hero-bg-image');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

const pointer = { x: 0.5, y: 0.5, active: false };
let particles = [];

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  particles = Array.from({ length: window.innerWidth < 760 ? 120 : 240 }, (_, index) => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    r: Math.random() * 1.8 + 0.3,
    a: Math.random() * 0.55 + 0.08,
    s: Math.random() * 0.35 + 0.08,
    phase: index * 0.12
  }));
}

function drawHorse(time) {
  const cx = window.innerWidth * (window.innerWidth < 760 ? 0.5 : 0.55);
  const cy = window.innerHeight * (window.innerWidth < 760 ? 0.35 : 0.36);
  const scale = window.innerWidth < 760 ? 0.68 : 1;
  const driftX = (pointer.x - 0.5) * 32;
  const driftY = (pointer.y - 0.5) * 18;

  ctx.save();
  ctx.translate(cx + driftX, cy + driftY);
  ctx.scale(scale, scale);
  ctx.rotate(-0.08);
  ctx.globalCompositeOperation = 'lighter';

  for (let strand = 0; strand < 34; strand += 1) {
    const offset = strand * 0.18 + time * 0.00045;
    ctx.beginPath();
    for (let i = 0; i <= 90; i += 1) {
      const t = i / 90;
      const x = -360 + t * 720;
      const y =
        Math.sin(t * Math.PI * 2 + offset) * 26 +
        Math.sin(t * Math.PI * 5 + offset) * 11 -
        70 * Math.sin(t * Math.PI);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = `rgba(244,241,234,${0.018 + strand / 1800})`;
    ctx.lineWidth = 0.6;
    ctx.stroke();
  }

  ctx.beginPath();
  ctx.ellipse(92, -22, 128, 72, -0.16, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(244,241,234,0.28)';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(244, -82, 54, 82, -0.32, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(244,241,234,0.32)';
  ctx.stroke();

  ctx.restore();
}

function draw(time) {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  const gradient = ctx.createRadialGradient(
    pointer.x * window.innerWidth,
    pointer.y * window.innerHeight,
    0,
    pointer.x * window.innerWidth,
    pointer.y * window.innerHeight,
    Math.max(window.innerWidth, window.innerHeight) * 0.65
  );
  gradient.addColorStop(0, 'rgba(73,214,194,0.16)');
  gradient.addColorStop(0.45, 'rgba(73,214,194,0.035)');
  gradient.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

  ctx.globalAlpha = 0.42;
  drawHorse(time);
  ctx.globalAlpha = 1;

  ctx.globalCompositeOperation = 'lighter';
  for (const p of particles) {
    p.x += Math.cos(time * 0.0002 + p.phase) * p.s + (pointer.x - 0.5) * 0.18;
    p.y += Math.sin(time * 0.00025 + p.phase) * p.s - 0.04;
    if (p.x < -20) p.x = window.innerWidth + 20;
    if (p.x > window.innerWidth + 20) p.x = -20;
    if (p.y < -20) p.y = window.innerHeight + 20;
    if (p.y > window.innerHeight + 20) p.y = -20;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(73,214,194,${p.a})`;
    ctx.fill();
  }

  const isMobile = window.innerWidth < 760;
  if (heroHorseImage) {
    const baseX = isMobile ? '-50%' : '-38%';
    heroHorseImage.style.transform = `translateX(${baseX}) translate(${(pointer.x - 0.5) * 28}px, ${
      (pointer.y - 0.5) * 18
    }px)`;
  }
  if (heroBgImage) {
    heroBgImage.style.transform = `scale(1.04) translate(${(0.5 - pointer.x) * 12}px, ${
      (0.5 - pointer.y) * 8
    }px)`;
  }

  requestAnimationFrame(draw);
}

window.addEventListener('resize', resize);
window.addEventListener('pointermove', (event) => {
  pointer.x = event.clientX / window.innerWidth;
  pointer.y = event.clientY / window.innerHeight;
  pointer.active = true;
});

function initEntranceMotion() {
  document.body.classList.add('animation-ready');

  if (prefersReducedMotion.matches || !window.gsap) {
    return;
  }

  const gsap = window.gsap;
  const heroCopyItems = document.querySelectorAll('[data-animate="copy"] > *');
  const deckCards = document.querySelectorAll('[data-animate="deck"] .experience-card');
  const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } });

  gsap.set('[data-animate="topbar"], [data-animate="copy"], [data-animate="deck"]', { opacity: 0 });
  gsap.set('[data-animate="bg"]', { opacity: 0, scale: 1.08 });
  gsap.set('[data-animate="horse"]', { opacity: 0, scale: 0.96, filter: 'blur(10px)' });
  gsap.set(heroCopyItems, { opacity: 0, y: 32 });
  gsap.set('[data-animate="cta"]', { filter: 'brightness(0.72)' });
  gsap.set(deckCards, { opacity: 0, y: 34 });

  timeline
    .to('[data-animate="bg"]', { opacity: 0.78, scale: 1.04, duration: 1.1 })
    .to('[data-animate="horse"]', { opacity: 0.95, scale: 1, filter: 'blur(0px)', duration: 1.35 }, '-=0.62')
    .to('[data-animate="topbar"]', { opacity: 1, y: 0, duration: 0.72 }, '-=0.9')
    .to('[data-animate="copy"]', { opacity: 1, duration: 0.2 }, '-=0.42')
    .to(heroCopyItems, { opacity: 1, y: 0, duration: 0.86, stagger: 0.09 }, '-=0.18')
    .to('[data-animate="cta"]', { filter: 'brightness(1)', duration: 0.48 }, '-=0.3')
    .to('[data-animate="deck"]', { opacity: 1, y: 0, duration: 0.42 }, '-=0.12')
    .to(deckCards, { opacity: 1, y: 0, duration: 0.82, stagger: 0.1, clearProps: 'transform' }, '-=0.28');
}

cards.forEach((card) => {
  card.addEventListener('pointermove', (event) => {
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    const depth = Number(card.dataset.depth || 1);
    card.style.transform = `rotateX(${4 - y * 10 * depth}deg) rotateY(${-8 + x * 12 * depth}deg) translateY(-6px)`;
  });
  card.addEventListener('pointerleave', () => {
    card.style.transform = '';
  });
});

cta.addEventListener('pointermove', (event) => {
  const rect = cta.getBoundingClientRect();
  const x = (event.clientX - rect.left) / rect.width - 0.5;
  const y = (event.clientY - rect.top) / rect.height - 0.5;
  cta.style.transform = `translate(${x * 12}px, ${y * 8}px) scale(1.03)`;
});

cta.addEventListener('pointerleave', () => {
  cta.style.transform = '';
});

resize();
initEntranceMotion();
requestAnimationFrame(draw);
