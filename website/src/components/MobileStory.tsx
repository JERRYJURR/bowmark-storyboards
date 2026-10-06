import { useEffect, useRef } from 'react';
import { CapabilityCard, ConvertedTile, MarkGlyph, SurfaceCard } from './BentoTiles';
import { BrandMark } from './sites/logos';
import { HotelResult } from './ImportScene';
import { BEATS, IMPORT_BEATS as IB, SCENE_SPLIT, convProgress, importProgress, riseOrdinal } from '../scene/beats';
import { IMPORT_SOURCE, RUN_STATUS } from '../scene/content';
import { IMPORTED, PAINT_ORDER, SITES, type SiteId } from '../scene/sites';
import { between, clamp01, lerp, onScrollFrame, overshoot, smooth, trackProgress } from '../scene/progress';
import { MotionBlur } from '../scene/motion-blur';
import './MobileStory.css';

/** M02/M03 native positions; animation timing stays in the original beats.ts. */
const SOURCES: Record<SiteId, { x: number; y: number; r: number; z: number }> = {
  youtube: { x: -18, y: 100, r: -4.6, z: 1 },
  amazon: { x: 235, y: 120, r: 3.2, z: 2 },
  calendly: { x: -4, y: 537, r: 2.8, z: 3 },
  maps: { x: 212, y: 565, r: -3.4, z: 4 },
  expedia: { x: 107, y: 150, r: -2.2, z: 5 },
};
const TURNS = SITES.map(site => PAINT_ORDER.indexOf(site.id));
const CHOSEN_SITE = SITES.find(site => site.id === IMPORTED)!;
const PREFIX = IMPORT_SOURCE.slice(0, IMPORT_SOURCE.indexOf(IMPORTED));
const SUFFIX = IMPORT_SOURCE.slice(PREFIX.length + IMPORTED.length);
const carry = (x: number) => {
  const t = clamp01(x);
  return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

/**
 * The approved portrait frames are endpoints of the original scroll story.
 * One viewport, native scrolling, original easing/beat windows, mobile-native
 * artwork. React renders once; scroll writes to refs, never component state.
 */
export default function MobileStory({ trackId }: { trackId: string }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const jumped = useRef(false);

  useEffect(() => {
    const host = hostRef.current;
    const track = document.getElementById(trackId);
    const viewport = track?.querySelector<HTMLElement>('.scene__viewport');
    if (!host || !track || !viewport) return;
    const portrait = matchMedia('(max-width: 860px)');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let dispose: (() => void) | undefined;

    const setMode = () => {
      dispose?.();
      dispose = undefined;
      if (!portrait.matches || reduced.matches) {
        delete track.dataset.mobileMotion;
        // The combined desktop fallback query stays true at phone widths,
        // so it cannot signal a motion-preference change while already narrow.
        // This owner must restore the readable channels when its loop stops.
        if (reduced.matches) {
          const root = document.documentElement;
          root.style.setProperty('--b1-hero-out', '0');
          root.style.setProperty('--b1-p', '0');
          root.style.removeProperty('--b1-scale');
          for (let i = 0; i < 4; i++) {
            root.style.setProperty(`--b1-h${i}`, '1');
            root.style.setProperty(`--b1-hy${i}`, '0px');
          }
          track.dataset.heroLive = '1';
        }
        return;
      }
      track.dataset.mobileMotion = '1';
      const root = document.documentElement;
      const cards = Array.from(host.querySelectorAll<HTMLElement>('.mobile-story__card'));
      const parts = cards.map(card => ({
        paper: card.querySelector<HTMLElement>('.sc')!,
        mock: card.querySelector<HTMLElement>('.sc__panel')!,
        code: card.querySelector<HTMLElement>('.mobile-story__code')!,
        cap: card.querySelector<HTMLElement>('.mobile-story__cap')!,
        logo: card.querySelector<HTMLElement>('.cap__logo')!,
        rows: Array.from(card.querySelectorAll<HTMLElement>('.cap__row')),
        more: card.querySelector<HTMLElement>('.cap__more'),
        sourceLabels: Array.from(card.querySelectorAll<HTMLElement>('.sc > .sc__name, .sc > .sc__detail')),
      }));
      const well = host.querySelector<HTMLElement>('.mobile-story__well')!;
      const column = host.querySelector<HTMLElement>('.imp-static__column')!;
      const chip = host.querySelector<HTMLElement>('.mobile-story__token')!;
      const preTyped = host.querySelector<HTMLElement>('[data-typed="prefix"]')!;
      const preRest = host.querySelector<HTMLElement>('[data-rest="prefix"]')!;
      const typed = host.querySelector<HTMLElement>('[data-typed="suffix"]')!;
      const rest = host.querySelector<HTMLElement>('[data-rest="suffix"]')!;
      const caret = host.querySelector<HTMLElement>('.mobile-story__caret')!;
      const agent = host.querySelector<HTMLElement>('.imp__agent')!;
      const editor = host.querySelector<HTMLElement>('.imp__editor')!;
      const state = host.querySelector<HTMLElement>('.imp__state')!;
      const fade = host.querySelector<HTMLElement>('.imp__well-fade')!;
      const status = host.querySelector<HTMLElement>('.imp__status')!;
      const statusIcon = host.querySelector<HTMLElement>('.imp__status-icon')!;
      const statusText = host.querySelector<HTMLElement>('[data-status-text]')!;
      const statusTime = host.querySelector<HTMLElement>('.imp__status-time')!;
      const hotel = host.querySelector<HTMLElement>('.imp__hotel')!;
      const marquee = host.querySelector<HTMLElement>('.mobile-story__marquee')!;
      const cursor = host.querySelector<HTMLElement>('.mobile-story__cursor')!;
      const sweep = host.querySelector<HTMLElement>('.mobile-story__sweep')!;
      const blur = new MotionBlur();
      let width = 390, height = 844, fit = 1, editorFit = 1;
      let chipX = 0, chipY = 0, chipW = 0, chipH = 0;
      let last = -1;

      const apply = (raw: number) => {
        const p = convProgress(raw);
        const q = importProgress(raw);
        const heroOut = between(p, ...BEATS.heroOut);
        const shown = between(p, ...BEATS.stageIn);
        root.style.setProperty('--b1-p', p.toFixed(4));
        root.style.setProperty('--b1-hero-out', heroOut.toFixed(3));
        const headline = between(p, ...BEATS.headline1) + between(p, ...BEATS.headline2) + between(p, ...BEATS.headline3);
        for (let i = 0; i < 4; i++) {
          root.style.setProperty(`--b1-h${i}`, clamp01(1 - Math.abs(i - headline) * 2.4).toFixed(3));
          root.style.setProperty(`--b1-hy${i}`, `${((i - headline) * 12).toFixed(1)}px`);
        }
        track.dataset.heroLive = heroOut < .35 ? '1' : '0';
        host.style.opacity = shown.toFixed(3);

        // Portrait selection covers the same M02 collage, rather than a tiny
        // desktop cursor. The original entrance/drag/exit windows are intact.
        const drag = between(p, ...BEATS.cursorDrag);
        const enter = between(p, ...BEATS.cursorEnter);
        const exit = between(p, ...BEATS.cursorExit);
        const x = lerp(lerp(-130, 14, enter), width + 180, exit) + (width - 28) * drag * (1 - exit);
        const y = lerp(lerp(height * .62, height * 100 / 844, enter), height + 130, exit) + height * 665 / 844 * drag * (1 - exit);
        const selected = between(p, ...BEATS.marqueeOn) * (1 - between(p, ...BEATS.marqueeOff));
        const cursorOn = between(p, ...BEATS.cursorOn) * (1 - between(p, ...BEATS.cursorOff));
        marquee.style.opacity = selected.toFixed(3);
        marquee.style.width = `${Math.max(0, x - 14)}px`;
        marquee.style.height = `${Math.max(0, y - height * 100 / 844)}px`;
        cursor.style.opacity = cursorOn.toFixed(3);
        cursor.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;

        const swap = smooth(between(q, ...IB.swap));
        const collapse = between(q, ...IB.collapse);
        const ghosts = between(q, ...IB.ghostsOut);
        for (let i = 0; i < cards.length; i++) {
          const el = cards[i], part = parts[i], source = SOURCES[SITES[i].id], turn = TURNS[i];
          const rise = clamp01((p - BEATS.riseStart - riseOrdinal(i) * BEATS.riseStep) / BEATS.riseLen);
          const morph = clamp01((p - BEATS.morphStart - turn * BEATS.morphStep) / BEATS.morphLen);
          const travel = clamp01(morph / .62);
          const carried = carry(travel);
          const flood = smooth((morph - .12) / .5);
          const rem = Math.pow(1 - rise, 3);
          let scale = lerp(.5, fit, carried);
          let left = lerp(source.x * width / 390, (width - 350 * fit) / 2, carried);
          let top = lerp(source.y * height / 844, (110 + turn * 48) * height / 844, carried);
          let w = 350, h = lerp(400, 340, carried);
          let rotation = source.r * (1 - overshoot(travel));
          let lift = morph > 0 && travel < 1 ? Math.sin(Math.PI * travel) : 0;
          let depth = 70 * lift, tiltX = 0, tiltY = 0;
          let visible = rise > 0 && shown > .005;
          if (morph === 0) {
            const horizontal = (source.x + 87.5 - 195) / 390;
            const tilt = 1 - overshoot(rise);
            left += horizontal * 260 * rem;
            top += (height - top + 80) * rem;
            depth = 140 * rem;
            tiltX = 12 * tilt;
            tiltY = horizontal * -24 * tilt;
          }
          if (q > 0 && SITES[i].id === IMPORTED) {
            left = lerp(left, (width - 350 * fit) / 2, swap);
            top = lerp(top, 170 * height / 844, swap);
            left = lerp(left, chipX, collapse);
            top = lerp(top, chipY, collapse);
            scale = lerp(fit * lerp(1, 1.03, swap), editorFit, collapse);
            w = lerp(350, chipW, collapse);
            h = lerp(340, chipH, collapse);
            rotation = 0;
            lift = swap * (1 - collapse);
            depth = 0;
            visible = collapse < 1;
            el.style.setProperty('--mobile-content', `${1 - between(collapse, 0, .3)}`);
            el.style.setProperty('--mobile-title', `${1 - between(collapse, .2, .34)}`);
            el.style.setProperty('--mobile-title-blur', `${3 * between(collapse, .2, .34)}px`);
            el.style.setProperty('--mobile-face', `${between(collapse, .26, .4)}`);
            el.style.setProperty('--pad', `${lerp(24, 2, collapse)}px`);
            el.style.setProperty('--radius', `${lerp(16, 6, collapse)}px`);
            el.style.setProperty('--depth-k', `${lerp(1, .08, collapse)}`);
          } else {
            el.style.setProperty('--mobile-content', '1');
            el.style.setProperty('--mobile-title', '1');
            el.style.setProperty('--mobile-title-blur', '0px');
            el.style.setProperty('--mobile-face', '0');
            el.style.setProperty('--pad', '24px');
            el.style.setProperty('--radius', '16px');
            el.style.setProperty('--depth-k', '1');
            if (q > 0) {
              const dir = source.x < 195 ? -1 : 1;
              left += dir * (width + 350 * fit + 120) * ghosts * ghosts * ghosts;
              rotation += dir * 6 * ghosts;
              depth = -220 * swap * .35;
              visible = ghosts < .999;
            }
          }
          el.style.visibility = visible ? 'visible' : 'hidden';
          el.style.width = `${w.toFixed(3)}px`;
          el.style.height = `${h.toFixed(3)}px`;
          el.style.transform = `translate3d(${left.toFixed(3)}px, ${top.toFixed(3)}px, ${depth.toFixed(1)}px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) rotate(${rotation.toFixed(3)}deg) scale(${scale.toFixed(5)})`;
          el.style.zIndex = String(q > 0 && SITES[i].id === IMPORTED && swap > .3 ? 40 : morph > 0 ? 30 + turn : source.z);
          el.style.setProperty('--depth-lift', lift.toFixed(3));
          el.style.setProperty('--sh', `${flood}`);
          if (visible) blur.sample(el, left + w * scale / 2, top + h * scale / 2, w * scale, 6);
          else blur.hide(el);
          part.paper.style.visibility = flood >= 1 ? 'hidden' : 'inherit';
          // As in the desktop scene, labels that cross the second headline
          // leave before it arrives. The M02 keyframe remains unchanged.
          const clearLabel = SITES[i].id === 'maps' || SITES[i].id === 'calendly'
            ? 1 - between(p, BEATS.headline2[0] - .03, BEATS.headline2[0]) : 1;
          for (let j = 0; j < part.sourceLabels.length; j++) part.sourceLabels[j].style.opacity = `${clearLabel * (1 - flood)}`;
          const fraction = ((source.x + 87.5) / 390 + (source.y + 100) / 844) / 2;
          const converted = between(p, BEATS.flipStart + fraction * BEATS.flipSkew, BEATS.flipEnd + fraction * BEATS.flipSkew);
          part.mock.style.setProperty('--mock-in', `${1 - between(converted, .7, 1)}`);
          part.code.style.clipPath = converted > .995 ? 'none' : `polygon(0 0, ${-20 + converted * 165}% 0, ${-40 + converted * 165}% 100%, 0 100%)`;
          part.code.style.opacity = converted > .005 ? '1' : '0';
          part.cap.style.visibility = flood > 0 && visible ? 'visible' : 'hidden';
          part.cap.style.clipPath = flood >= 1 ? 'none' : `circle(${(Math.hypot(w, h) + 90) * flood}px at ${w - 40}px 40px)`;
          part.logo.style.transform = `scale(${lerp(.55, 1, overshoot(between(morph, .12, .3)))})`;
          for (let j = 0; j < part.rows.length; j++) {
            const amount = smooth((morph - .46 - j * .034) / .16);
            part.rows[j].style.opacity = `${amount}`;
            part.rows[j].style.transform = `translateY(${6 * (1 - amount)}px)`;
            part.rows[j].style.filter = amount < .01 || amount > .99 ? '' : `blur(${2 * (1 - amount)}px)`;
          }
          if (part.more) part.more.style.opacity = `${smooth((morph - .46 - part.rows.length * .034) / .16)}`;
        }

        sweep.style.opacity = p > BEATS.sweepWindow[0] && p < BEATS.sweepWindow[1] ? '1' : '0';
        sweep.style.transform = `translateX(${width * lerp(-.18, 1.18, between(p, ...BEATS.sweep))}px) skewX(-14deg)`;
        const wellIn = Math.min(1, collapse * 1.5);
        well.style.opacity = `${wellIn}`;
        well.style.visibility = wellIn > .004 ? 'visible' : 'hidden';
        well.style.transform = `scale(${lerp(.97, 1, wellIn)})`;
        chip.style.opacity = collapse >= 1 ? '1' : '0';
        const before = Math.min(PREFIX.length, Math.round(wellIn * (PREFIX.length + 1)));
        const characters = Math.min(SUFFIX.length, Math.round(between(q, ...IB.type) * (SUFFIX.length + 18)));
        const prefixText = PREFIX.slice(0, before), prefixRest = PREFIX.slice(before);
        const suffixText = SUFFIX.slice(0, characters), suffixRest = SUFFIX.slice(characters);
        if (preTyped.textContent !== prefixText) preTyped.textContent = prefixText;
        if (preRest.textContent !== prefixRest) preRest.textContent = prefixRest;
        if (typed.textContent !== suffixText) typed.textContent = suffixText;
        if (rest.textContent !== suffixRest) rest.textContent = suffixRest;
        const runIn = between(q, ...IB.runIn), run = between(q, ...IB.runProgress);
        const enterRun = between(q, ...IB.enter), found = between(q, ...IB.found), result = between(q, ...IB.result);
        caret.style.display = enterRun < .6 && collapse > .55 ? 'inline-block' : 'none';
        agent.style.opacity = `${between(q, ...IB.agentTag) * (1 - between(q, ...IB.agentTagOut))}`;
        editor.style.setProperty('--ring', `${enterRun * (1 - runIn)}`);
        editor.dataset.executing = enterRun > 0 && runIn < 1 ? '1' : '0';
        const runLabel = run > .97 ? `✓ ${RUN_STATUS.foundTime}` : enterRun > .5 ? 'running…' : '⏎ Run';
        if (state.textContent !== runLabel) state.textContent = runLabel;
        state.dataset.live = enterRun > .5 && run <= .97 ? '1' : '0';
        const rise = between(q, IB.found[0], IB.result[1] - .02);
        column.style.top = `${lerp(lerp(30, -50, smooth(runIn)), -181, smooth(rise)) * editorFit}px`;
        fade.style.opacity = `${runIn}`;
        status.style.visibility = runIn > .01 ? 'visible' : 'hidden';
        status.style.opacity = `${Math.min(1, runIn * 1.6)}`;
        status.style.transform = `translateY(${lerp(10, 0, runIn)}px)`;
        statusIcon.dataset.state = found > .01 ? 'found' : 'running';
        const statusLabel = found > .01 ? RUN_STATUS.found.slice(0, Math.round(clamp01(found * 1.4) * RUN_STATUS.found.length)) : RUN_STATUS.running;
        const timeLabel = found > .01 ? RUN_STATUS.foundTime : `${Math.max(1, Math.ceil(run * 2))}s`;
        if (statusText.textContent !== statusLabel) statusText.textContent = statusLabel;
        if (statusTime.textContent !== timeLabel) statusTime.textContent = timeLabel;
        statusTime.style.opacity = found > .01 ? `${between(found, .6, 1)}` : '1';
        hotel.style.visibility = result > .01 ? 'visible' : 'hidden';
        hotel.style.opacity = `${Math.min(1, result * 2)}`;
        hotel.style.transform = `translateY(${lerp(14, 0, result)}px)`;
      };

      // Layout reads only at setup/resize/font load; none in the scroll loop.
      const measure = () => {
        width = viewport.clientWidth;
        height = viewport.clientHeight;
        fit = Math.min(1, (width - 40) / 350, height / 844);
        editorFit = Math.min(1, (width - 40) / 350, parseFloat(getComputedStyle(well).height) / 465);
        host.style.setProperty('--imp-static-scale', `${editorFit}`);
        const previousTop = column.style.top;
        const previousTransform = well.style.transform;
        column.style.top = `${30 * editorFit}px`;
        well.style.transform = 'none';
        const stage = viewport.getBoundingClientRect(), slot = chip.getBoundingClientRect();
        chipX = slot.left - stage.left;
        chipY = slot.top - stage.top;
        // The moving card and the editor must use the same local pill size
        // and scale, otherwise a short phone clips the unscaled namespace.
        chipW = slot.width / editorFit;
        chipH = slot.height / editorFit;
        const chipType = getComputedStyle(chip);
        host.style.setProperty('--mobile-chip-font', chipType.fontFamily);
        host.style.setProperty('--mobile-chip-size', chipType.fontSize);
        column.style.top = previousTop;
        well.style.transform = previousTransform;
        blur.reset();
        last = trackProgress(track);
        apply(last);
      };
      measure();
      const observer = new ResizeObserver(measure);
      observer.observe(viewport);
      const stop = onScrollFrame(() => {
        const raw = trackProgress(track);
        if (Math.abs(raw - last) < .00005) return;
        if (Math.abs(raw - last) > .04) blur.reset();
        last = raw;
        apply(raw);
      });
      let alive = true;
      document.fonts.ready.then(() => { if (alive) measure(); });
      const params = new URLSearchParams(location.search);
      const requested = Number(params.get('p'));
      if (!jumped.current && requested > 0 && requested <= 1) {
        jumped.current = true;
        const raw = params.get('scene') === 'import' ? SCENE_SPLIT + requested * (1 - SCENE_SPLIT) : requested * SCENE_SPLIT;
        window.scrollTo({ top: track.offsetTop + raw * (track.offsetHeight - window.innerHeight), behavior: 'instant' });
      }
      dispose = () => { alive = false; stop(); observer.disconnect(); blur.dispose(); };
    };
    setMode();
    portrait.addEventListener('change', setMode);
    reduced.addEventListener('change', setMode);
    return () => {
      dispose?.();
      delete track.dataset.mobileMotion;
      portrait.removeEventListener('change', setMode);
      reduced.removeEventListener('change', setMode);
    };
  }, [trackId]);

  return <div className="mobile-story" ref={hostRef} aria-hidden="true">
    {SITES.map((site, i) => <div className="mobile-story__card" data-site={site.id} key={site.id}>
      <SurfaceCard surface={i}>
        <div className="mobile-story__code"><ConvertedTile surface={i} /></div>
      </SurfaceCard>
      <div className="mobile-story__cap">
        <CapabilityCard site={site}>
          <span className="mobile-story__face imp__chip" data-site={site.id}>
            <BrandMark id={site.id} size={14} /><span>{site.ns}</span>
          </span>
        </CapabilityCard>
      </div>
    </div>)}
    <div className="mobile-story__marquee" />
    <div className="mobile-story__cursor">
      <svg width="20" height="28" viewBox="0 0 20 28"><path d="M1 1L1 22L6 17L10 26L14 24L10 16L18 16Z" /></svg>
      <span className="mobile-story__tag"><MarkGlyph size={14} />Bowmark</span>
    </div>
    <div className="mobile-story__sweep" />
    <div className="mobile-story__well imp-static__well">
      <div className="imp-static__column">
        <div className="imp__editor imp-static__editor">
          <div className="imp__file">agent.ts<span className="imp__state">⏎ Run</span></div>
          <div className="imp__frame">
            <pre className="imp-static__code"><code><span data-typed="prefix" /><span className="imp__rest" data-rest="prefix">{PREFIX}</span><span className="mobile-story__token imp__chip" data-site={CHOSEN_SITE.id} style={{ ['--cap-tone' as string]: CHOSEN_SITE.tone }}><BrandMark id={CHOSEN_SITE.id} size={14} /><span>{CHOSEN_SITE.ns}</span></span><span data-typed="suffix" /><span className="mobile-story__caret"><span className="imp__agent">Agent</span></span><span className="imp__rest" data-rest="suffix">{SUFFIX}</span></code></pre>
          </div>
        </div>
        <div className="imp__status imp-static__status">
          <span className="imp__status-icon" data-state="running"><svg width="16" height="16" viewBox="0 0 24 24"><circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></svg></span>
          <span data-status-text>{RUN_STATUS.running}</span><span className="imp__status-time">1s</span>
        </div>
        <div className="imp__hotel imp-static__hotel"><HotelResult /></div>
      </div>
      <div className="imp__well-fade" />
    </div>
  </div>;
}
