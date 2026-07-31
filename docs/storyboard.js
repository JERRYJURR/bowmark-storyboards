// Low-fi storyboard driver: scroll progress per .scene, stage switching, word flicker.

(function () {
  const scenes = Array.from(document.querySelectorAll('.scene'));

  function update() {
    const vh = window.innerHeight;
    for (const scene of scenes) {
      const rect = scene.getBoundingClientRect();
      const total = scene.offsetHeight - vh;
      const p = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0;
      scene.style.setProperty('--p', p.toFixed(4));

      const stages = parseInt(scene.dataset.stages || '1', 10);
      const stage = Math.min(stages - 1, Math.floor(p * stages));
      if (scene.dataset.stage !== String(stage)) {
        scene.dataset.stage = String(stage);
        scene.querySelectorAll('.kf').forEach((kf, i) => kf.classList.toggle('on', i === stage));
        const chip = scene.querySelector('.stage-note');
        if (chip) {
          const notes = JSON.parse(scene.dataset.notes || '[]');
          chip.innerHTML = notes[stage] || '';
        }
      }

      // optional per-scene live chip in the corner
      const corner = document.getElementById('corner-' + scene.id);
      if (corner) corner.hidden = p <= 0.001 || rect.bottom < vh * 0.5;
    }

    // evidence rail visibility (variant 3): shown while any .rail-on scene is active
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

  // Word flicker: <span data-flicker='["a","b","c"]'> — timer-based, not scroll-stepped.
  document.querySelectorAll('[data-flicker]').forEach(el => {
    const words = JSON.parse(el.dataset.flicker);
    let i = 0;
    setInterval(() => { i = (i + 1) % words.length; el.textContent = words[i]; }, 340);
  });
})();
