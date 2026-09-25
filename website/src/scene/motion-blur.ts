/**
 * Velocity-linked motion blur for scroll-scrubbed objects.
 *
 * Scroll only tells the scene where things are. This turns successive
 * positions into a screen-space speed — px per ms of *elapsed* time since the
 * object's previous sample, so a 120 Hz display, a 60 Hz one and a dropped
 * frame all read the same — smooths it with an asymmetric low-pass (picks
 * motion up quickly, lets it go quicker) and maps it to a bounded `blur()`.
 * Reversing is just motion the other way.
 *
 * One rAF commits. It starts when a sample arrives and keeps running only
 * while something is blurred or a sample is pending: when scrolling stops, no
 * new positions arrive, the speed decays, every object lands sharp and the
 * loop ends. The scene's scroll frame only samples, so there is a single
 * committer and no per-frame ordering race between two rAF callbacks.
 *
 * No layout reads: callers pass the positions they have just written, in
 * canvas px, and set the canvas-to-screen `scale`.
 */

type Track = {
  el: HTMLElement;
  /** blur cap, screen px */
  max: number;
  /** last committed centre and apparent size (canvas px), and when */
  x: number;
  y: number;
  s: number;
  at: number;
  /** pending sample */
  nx: number;
  ny: number;
  ns: number;
  pending: boolean;
  /** has a committed position to measure from */
  primed: boolean;
  /** smoothed speed, screen px / ms */
  speed: number;
  /** blur currently written, screen px (0.1 steps) */
  written: number;
};

export type MotionBlurOptions = {
  /** screen px/ms below which nothing blurs (a slow, reading scroll) */
  deadzone?: number;
  /** screen px of blur per px/ms above the dead zone */
  gain?: number;
  /** low-pass time constants, ms: rising speed, falling speed */
  attack?: number;
  release?: number;
  /**
   * how long (ms) a missing sample is read as "no scroll event this frame"
   * rather than "stopped" — covers 120 Hz frames between 60 Hz scroll events
   */
  hold?: number;
  /** one sample moving further than this (screen px) is a jump, not motion */
  teleport?: number;
  /** samples further apart than this (ms) carry no velocity */
  maxGap?: number;
};

const DEFAULTS: Required<MotionBlurOptions> = {
  deadzone: 0.35,
  gain: 1.25,
  attack: 45,
  release: 50,
  hold: 34,
  teleport: 520,
  maxGap: 120,
};

export class MotionBlur {
  /** screen px per canvas px */
  scale = 1;

  private readonly o: Required<MotionBlurOptions>;
  private readonly list: Track[] = [];
  private readonly byEl = new Map<HTMLElement, Track>();
  private readonly off: boolean;
  private last = 0;
  private raf = 0;

  constructor(opts: MotionBlurOptions = {}) {
    this.o = { ...DEFAULTS, ...opts };
    this.off =
      typeof window === 'undefined' ||
      (typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  /** Where `el` is now: centre and apparent size in canvas px; `max` caps its blur. */
  sample(el: HTMLElement, x: number, y: number, size: number, max: number): void {
    if (this.off) return;
    let t = this.byEl.get(el);
    if (!t) {
      t = {
        el,
        max,
        x,
        y,
        s: size,
        at: 0,
        nx: x,
        ny: y,
        ns: size,
        pending: false,
        primed: false,
        speed: 0,
        written: 0,
      };
      this.byEl.set(el, t);
      this.list.push(t);
    }
    t.max = max;
    t.nx = x;
    t.ny = y;
    t.ns = size;
    t.pending = true;
    this.schedule();
  }

  /** `el` is hidden: forget its history, so its return is not read as a leap. */
  hide(el: HTMLElement): void {
    const t = this.byEl.get(el);
    if (!t) return;
    t.primed = false;
    t.pending = false;
    t.speed = 0;
    this.write(t, 0);
  }

  /** Everything jumped (a query jump, a re-measure): the next move carries no velocity. */
  reset(): void {
    for (let i = 0; i < this.list.length; i++) {
      const t = this.list[i];
      t.primed = false;
      t.speed = 0;
      this.write(t, 0);
    }
  }

  /** Stop the loop and leave every object sharp. */
  dispose(): void {
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
    for (let i = 0; i < this.list.length; i++) this.write(this.list[i], 0);
  }

  private commit(now: number): void {
    const dt = this.last ? now - this.last : 0;
    this.last = now;
    const { deadzone, gain, attack, release, hold, teleport, maxGap } = this.o;
    const k = this.scale;
    let busy = false;

    for (let i = 0; i < this.list.length; i++) {
      const t = this.list[i];
      let inst = -1; // -1: hold the current speed this frame

      if (t.pending) {
        const span = now - t.at;
        inst = 0;
        if (t.primed && span > 0 && span <= maxGap) {
          const dx = (t.nx - t.x) * k;
          const dy = (t.ny - t.y) * k;
          // growth/shrink reads as motion of the edges, at half weight
          const ds = (t.ns - t.s) * k * 0.5;
          const d = Math.sqrt(dx * dx + dy * dy + ds * ds);
          if (d > teleport) t.speed = 0;
          else inst = d / span;
        } else if (t.primed) {
          t.speed = 0; // a long pause, then motion: no velocity from the gap
        }
        t.x = t.nx;
        t.y = t.ny;
        t.s = t.ns;
        t.at = now;
        t.pending = false;
        t.primed = true;
      } else if (now - t.at > hold) {
        inst = 0; // no sample for a while: it has stopped
      }

      if (inst >= 0 && dt > 0) {
        const tau = inst > t.speed ? attack : release;
        t.speed += (inst - t.speed) * (1 - Math.exp(-Math.min(dt, maxGap) / tau));
      }

      let b = Math.min(t.max, Math.max(0, t.speed - deadzone) * gain);
      b = b < 0.3 ? 0 : Math.round(b * 10) / 10;
      this.write(t, b);
      if (b > 0 || t.speed > deadzone) busy = true;
    }

    if (busy) this.schedule();
    // Retain the previous timestamp when the loop rests. Resetting it here
    // would make dt zero on every new scroll sample, preventing any velocity
    // from building when the object starts moving from a sharp resting state.
  }

  private write(t: Track, b: number): void {
    if (b === t.written) return;
    t.written = b;
    // filter blur applies before the canvas scale, so undo it
    t.el.style.filter = b ? `blur(${(b / this.scale).toFixed(2)}px)` : '';
  }

  private schedule(): void {
    if (this.off || this.raf) return;
    this.raf = requestAnimationFrame(this.tick);
  }

  private tick = (now: number): void => {
    this.raf = 0;
    this.commit(now);
  };
}
