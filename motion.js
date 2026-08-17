/* motion.js — Villa's Properties V2 motion system.
   Zero runtime dependencies. IntersectionObserver reveals + stagger,
   requestAnimationFrame parallax (transform only), hero intro reveal,
   and a responsive / reduced-motion / save-data aware hero video.
   Must never interfere with app.js or backoffice-auth.js. */
(() => {
  'use strict';
  const root = document.documentElement;
  const mqReduce = matchMedia('(prefers-reduced-motion: reduce)');
  const reduce = mqReduce.matches;
  const conn = navigator.connection || {};
  const saveData = conn.saveData === true;
  const slow = /(^|-)2g/.test(conn.effectiveType || '');

  root.classList.add('motion-ready');
  if (reduce) root.classList.add('motion-reduced');

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
    if (reduce || saveData || slow) {
      root.classList.add('hero-static');
    } else {
      load();
      let t;
      addEventListener('resize', () => { clearTimeout(t); t = setTimeout(load, 250); }, { passive: true });
      video.addEventListener('error', () => root.classList.add('hero-static'));
    }
  }

  requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add('hero-in')));

  const revealEls = document.querySelectorAll('[data-reveal]');
  if (revealEls.length && 'IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target;
        el.querySelectorAll(':scope > [data-stagger], [data-stagger-group] > *').forEach((c, i) => {
          c.style.setProperty('--st-i', i);
        });
        el.classList.add('is-in');
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-in'));
  }

  const paraEls = Array.from(document.querySelectorAll('[data-parallax]'));
  if (paraEls.length && !reduce && !saveData) {
    let ticking = false;
    const update = () => {
      const vh = innerHeight;
      for (const el of paraEls) {
        const r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) continue;
        const speed = parseFloat(el.getAttribute('data-parallax')) || 0.1;
        const off = (((r.top + r.height / 2) - vh / 2) * -speed);
        el.style.transform = `translate3d(0, ${off.toFixed(1)}px, 0)`;
      }
      ticking = false;
    };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll, { passive: true });
    update();
  }

  const cue = document.querySelector('.scroll-cue');
  if (cue) {
    addEventListener('scroll', () => {
      cue.classList.toggle('hide', scrollY > 90);
    }, { passive: true });
  }
})();