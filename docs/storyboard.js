// Mid-fi motion engine: continuous scroll-driven segments, morphs, counters, races.

(function () {
  const scenes = Array.from(document.querySelectorAll('.scene'));
  const clamp01 = v => Math.min(1, Math.max(0, v));
  const seg = (p, a, b) => clamp01((p - a) / (b - a));

  function update() {
    const vh = window.innerHeight;
    for (const scene of scenes) {
      const rect = scene.getBoundingClientRect();
      const total = scene.offsetHeight - vh;
      const p = total > 0 ? clamp01(-rect.top / total) : 0;
      scene.style.setProperty('--p', p.toFixed(4));

      // segment progress per element
      scene.querySelectorAll('[data-seg]').forEach(el => {
        const [a, b] = el.dataset.seg.split(',').map(Number);
        el.style.setProperty('--sp', seg(p, a, b).toFixed(4));
      });

      // face morphs at thresholds
      scene.querySelectorAll('[data-morph-at]').forEach(el => {
        el.classList.toggle('morphed', p >= +el.dataset.morphAt);
      });

      // URL dissolve: characters strip away across a range
      scene.querySelectorAll('[data-dissolve]').forEach(el => {
        if (!el.dataset.full) el.dataset.full = el.textContent;
        const [a, b] = el.dataset.dissolve.split(',').map(Number);
        const s = seg(p, a, b);
        const full = el.dataset.full;
        el.textContent = full.slice(0, Math.round(full.length * (1 - s)));
      });

      // scroll-bound counters: data-pcount="start,end,target[,prefix]"
      scene.querySelectorAll('[data-pcount]').forEach(el => {
        const parts = el.dataset.pcount.split(',');
        const s = seg(p, +parts[0], +parts[1]);
        el.textContent = (parts[3] || '') + Math.round(s * +parts[2]).toLocaleString();
      });

      // svg line draws at thresholds
      scene.querySelectorAll('svg[data-draw-at]').forEach(el => {
        el.classList.toggle('draw', p >= +el.dataset.drawAt);
      });
    }

    // evidence rail (V3)
    const rail = document.querySelector('.evrail');
    if (rail) {
      const active = scenes.some(s => {
        if (!s.classList.contains('rail-on')) return false;
        const r = s.getBoundingClientRect();
        return r.top < window.innerHeight * 0.5 && r.bottom > window.innerHeight * 0.5;
      });
      rail.classList.toggle('show', active);
    }
  }

  let ticking = false;
  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(() => { update(); ticking = false; });
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();

  // ---- time-based counters (race sections) ----
  function runCounter(el, target, dur) {
    const t0 = performance.now();
    (function tick(t) {
      const s = clamp01((t - t0) / dur);
      const eased = 1 - Math.pow(1 - s, 2);
      el.textContent = Math.round(eased * target).toLocaleString();
      if (s < 1) requestAnimationFrame(tick);
    })(t0);
  }

  // races play once when they enter the viewport
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting && !e.target.classList.contains('play')) {
        e.target.classList.add('play');
        e.target.querySelectorAll('[data-count]').forEach(el =>
          runCounter(el, +el.dataset.count, +(el.dataset.dur || 2000)));
      }
    });
  }, { threshold: 0.35 });
  document.querySelectorAll('.autoplay').forEach(el => io.observe(el));
})();
