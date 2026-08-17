/* motion.js v2 — Villa's Scroll Story Engine. Zero runtime dependencies.
   Progress-based choreography (not just entry triggers):
   kinetic hero, dynamic header per scene, typography drift, reveal families,
   scroll-linked parallax. Responsive / reduced-motion / save-data aware.
   Never interferes with app.js or backoffice-auth.js. */
(() => {
  'use strict';
  const root = document.documentElement;
  const mqReduce = matchMedia('(prefers-reduced-motion: reduce)');
  const reduce = mqReduce.matches;
  const conn = navigator.connection || {};
  const saveData = conn.saveData === true;
  const slow = /(^|-)2g/.test(conn.effectiveType || '');
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const lerp = (a, b, t) => a + (b - a) * t;

  root.classList.add('motion-ready');
  if (reduce) root.classList.add('motion-reduced');

  /* ---------- Hero video: responsive source + guards ---------- */
  const video = document.getElementById('heroVideo');
  if (video && video.hasAttribute('data-src-base')) {
    const base = video.getAttribute('data-src-base');
    const load = () => {
      const variant = matchMedia('(max-width:820px)').matches ? 'mobile' : 'desktop';
      if (video.dataset.variant === variant) return;
      video.dataset.variant = variant;
      video.innerHTML =
        `<source src="${base}${variant}.webm" type="video/webm">` +
        `<source src="${base}${variant}.mp4" type="video/mp4">`;
      video.load();
      const p = video.play();
      if (p && p.catch) p.catch(() => {});
    };
    if (reduce || saveData || slow) root.classList.add('hero-static');
    else {
      load();
      let t;
      addEventListener('resize', () => { clearTimeout(t); t = setTimeout(load, 250); }, { passive: true });
      video.addEventListener('error', () => root.classList.add('hero-static'));
    }
  }

  /* ---------- Hero intro reveal ---------- */
  requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add('hero-in')));

  /* ---------- Entry reveals (families via data-reveal="type") ---------- */
  const revealEls = document.querySelectorAll('[data-reveal]');
  if (revealEls.length && 'IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.querySelectorAll(':scope > [data-stagger], [data-stagger-group] > *')
          .forEach((c, i) => c.style.setProperty('--st-i', i));
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-in'));
  }

  // Under reduced motion we stop here: content fully visible, no scroll-linked motion.
  if (reduce) return;

  /* ================= SCROLL STORY ENGINE ================= */
  const hero = document.querySelector('.hero');
  const heroContent = document.querySelector('.hero .hero-content');
  const bigCircle = document.querySelector('.hero-bigcircle');
  const drifters = Array.from(document.querySelectorAll('[data-drift]'));   // typography drift
  const scrollers = Array.from(document.querySelectorAll('[data-scroll]')); // generic parallax
  const header = document.querySelector('.header');
  const cue = document.querySelector('.scroll-cue');
  const themed = Array.from(document.querySelectorAll('[data-header-theme]'));

  let ticking = false;
  const onFrame = () => {
    const vh = innerHeight;
    const y = scrollY;

    // Kinetic hero: circle grows & exits, text compresses up, as you scroll the first viewport
    if (hero) {
      const hp = clamp(y / (hero.offsetHeight || vh), 0, 1);
      if (bigCircle) {
        const scale = lerp(1, 1.85, hp);
        const ty = lerp(0, -vh * 0.55, hp);
        bigCircle.style.setProperty('--sy', ty.toFixed(1) + 'px');
        bigCircle.style.setProperty('--ss', scale.toFixed(3));
        bigCircle.style.opacity = (1 - hp * 0.72).toFixed(3);
      }
      if (heroContent) {
        heroContent.style.transform = `translate3d(0, ${(-hp * 64).toFixed(1)}px, 0)`;
        heroContent.style.opacity = (1 - hp * 0.85).toFixed(3);
      }
    }

    // Typography drift: lines move at slightly different speeds within their section (subtle depth)
    for (const el of drifters) {
      const r = el.getBoundingClientRect();
      if (r.bottom < -120 || r.top > vh + 120) continue;
      const prog = clamp((vh - r.top) / (vh + r.height), 0, 1);
      const amp = parseFloat(el.getAttribute('data-drift')) || 20;
      el.style.transform = `translate3d(0, ${((prog - 0.5) * amp).toFixed(1)}px, 0)`;
    }

    // Generic scroll-linked parallax
    for (const el of scrollers) {
      const r = el.getBoundingClientRect();
      if (r.bottom < -240 || r.top > vh + 240) continue;
      const speed = parseFloat(el.getAttribute('data-scroll')) || 0.1;
      const off = (((r.top + r.height / 2) - vh / 2) * -speed);
      el.style.transform = `translate3d(0, ${off.toFixed(1)}px, 0)`;
    }

    // Dynamic header theme: the last themed section whose top has passed the header band wins
    if (header && themed.length) {
      let best = null, bestTop = -Infinity;
      for (const s of themed) {
        const t = s.getBoundingClientRect().top;
        if (t <= 110 && t > bestTop) { best = s; bestTop = t; }
      }
      header.setAttribute('data-theme', best ? best.getAttribute('data-header-theme') : 'hero');
    }

    if (cue) cue.classList.toggle('hide', y > 90);
    ticking = false;
  };
  const schedule = () => { if (!ticking) { ticking = true; requestAnimationFrame(onFrame); } };
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule, { passive: true });
  schedule();
})();
