/**
 * Scroll-progress engine.
 *
 * Ported from the v5 prototype's DCLogic helpers (`cl`, `sm`, `bt`, `lerp`,
 * `mix`, `prog`) so that every beat range in `beats.ts` keeps the exact
 * meaning it had in the wireframe. No React, no DOM writes — this module only
 * turns scroll position into a 0..1 number and eases it.
 */

/** clamp to 0..1 */
export const clamp01 = (x: number): number => (x < 0 ? 0 : x > 1 ? 1 : x);

/** smoothstep */
export const smooth = (x: number): number => {
  const t = clamp01(x);
  return t * t * (3 - 2 * t);
};

/** eased 0..1 for the window [a,b] of p — the prototype's `bt()` */
export const between = (p: number, a: number, b: number): number =>
  smooth((p - a) / (b - a));

export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

/** back-out overshoot, used for the surface cards' arrival */
export const overshoot = (x: number): number => {
  const c1 = 1.14;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};

const hexToRgb = (hex: string): [number, number, number] => {
  const s = hex.replace('#', '');
  return [
    parseInt(s.slice(0, 2), 16),
    parseInt(s.slice(2, 4), 16),
    parseInt(s.slice(4, 6), 16),
  ];
};

/** interpolate two hex colours, returns an rgb() string */
export const mixHex = (c1: string, c2: string, t: number): string => {
  const a = hexToRgb(c1);
  const b = hexToRgb(c2);
  const k = clamp01(t);
  return `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * k)).join(',')})`;
};

/**
 * Progress of a sticky track: 0 when its top hits the viewport top, 1 when its
 * bottom does. Identical mapping to the prototype's `prog(id)`.
 */
export const trackProgress = (track: HTMLElement): number => {
  const r = track.getBoundingClientRect();
  const d = r.height - window.innerHeight;
  return d <= 0 ? 0 : clamp01(-r.top / d);
};

/**
 * rAF-coalesced scroll + resize subscription. The page scrolls natively; we
 * only read. Returns an unsubscribe function.
 */
export const onScrollFrame = (frame: (now: number) => void): (() => void) => {
  let raf = 0;
  const schedule = () => {
    if (raf) return;
    raf = requestAnimationFrame((now) => {
      raf = 0;
      frame(now);
    });
  };
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  schedule();

  return () => {
    window.removeEventListener('scroll', schedule);
    window.removeEventListener('resize', schedule);
    cancelAnimationFrame(raf);
  };
};

export const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;
