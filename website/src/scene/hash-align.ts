/**
 * Keeps a direct link such as `/#faq` landing on its section while the islands
 * above it hydrate and change height (the B1 track, F1 and B4 all swap to
 * different layouts on phones). Same approach F1 and B4 use for their own
 * anchors: re-align on every size change of the content above, and stop the
 * moment the reader wheels, touches, clicks or types. The section's
 * `scroll-margin-top` accounts for the fixed header.
 */
export const alignToHash = (target: HTMLElement, hashes: readonly string[]): (() => void) => {
  const noop = () => {};
  if (!hashes.includes(window.location.hash)) return noop;
  if (new URLSearchParams(window.location.search).has('p')) return noop;

  const anchor = document.getElementById(window.location.hash.slice(1)) ?? target;
  let frame = 0;
  const align = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => anchor.scrollIntoView({ block: 'start', behavior: 'instant' }));
  };

  const observer = new ResizeObserver(align);
  const main = document.getElementById('main');
  if (main) observer.observe(main);

  const events = ['wheel', 'touchstart', 'pointerdown', 'keydown'] as const;
  const stop = () => {
    observer.disconnect();
    cancelAnimationFrame(frame);
    events.forEach((name) => window.removeEventListener(name, stop));
  };
  events.forEach((name) => window.addEventListener(name, stop, { passive: true }));
  align();
  return stop;
};
