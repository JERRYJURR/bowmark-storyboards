import { useEffect, useRef } from 'react';
import { createNeuroShader, type NeuroConfig, type NeuroShader } from 'neuroshader';
import './HeroSignal.css';
import heroLook from '../scene/bowmark-hero.json';

/**
 * The Bowmark mark behind the hero copy, rendered by neuroshader ("Signal
 * Lock": draw-on entrance, drifting idle that leans toward the pointer, and an
 * exit that folds the mark into nothing).
 *
 * The look is data: scene/bowmark-hero.json is a neuroshader studio export —
 * export a new one and drop it in to change it. neuroshader itself is vendored
 * as vendor/neuroshader-0.1.0.tgz until it ships to npm.
 *
 * The exit follows the hero's own. DecompileScene writes --b1-hero-out on :root
 * as the track scrolls, and the mark collapses in step with the panel and the
 * headline leaving. The canvas is transparent, so the product scene rising
 * underneath shows through, and it stops drawing once the hero has gone or the
 * viewport is off screen.
 */
export default function HeroSignal() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    // JSON types `[0, 0, 5]` as number[], not the config's 3-tuple.
    const look = structuredClone(heroLook) as unknown as NeuroConfig;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) holdStill(look);

    let ns: NeuroShader;
    try {
      ns = createNeuroShader(host, look, { transparent: true, maxPixelRatio: 2 });
    } catch {
      return; // No WebGL: the hero stands on its own.
    }

    const root = document.documentElement;
    let onScreen = true;
    let running = false;
    let clearFrames = 0;
    let raf = 0;

    const setRunning = (next: boolean) => {
      if (next === running) return;
      running = next;
      if (next) ns.start();
      else ns.stop();
      host.style.visibility = next ? '' : 'hidden';
    };

    const tick = () => {
      raf = requestAnimationFrame(tick);
      const out = Number.parseFloat(root.style.getPropertyValue('--b1-hero-out')) || 0;
      ns.setProgress(out);
      // Fully collapsed: let a couple more frames land so the canvas is clear,
      // then stop until the hero scrolls back.
      clearFrames = out >= 1 ? clearFrames + 1 : 0;
      setRunning(onScreen && clearFrames <= 2);
    };

    const seen = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
    });
    seen.observe(host);
    tick();

    return () => {
      cancelAnimationFrame(raf);
      seen.disconnect();
      ns.dispose();
    };
  }, []);

  return <div className="hero-signal" ref={hostRef} aria-hidden="true" />;
}

/**
 * Reduced motion: the finished mark, still — no draw-on, drift, tilt or flow,
 * and no distortion layer (its ripple animates and its lens follows the pointer).
 */
function holdStill(look: NeuroConfig) {
  if (look.layers.distortion) look.layers.distortion.enabled = false;
  for (const effect of look.layers.object?.effects ?? []) {
    if (effect.type !== 'bowmarkSignal') continue;
    effect.params = {
      ...effect.params,
      assembleDuration: 0.1,
      stagger: 0,
      holdMotion: 0,
      pointerTilt: 0,
      pointerGlow: 0,
      colorFlow: 0,
    };
  }
}
