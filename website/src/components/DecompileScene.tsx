import { useEffect, useRef, useState, type CSSProperties } from 'react';
import './DecompileScene.css';
import {
  CapabilityCard,
  ConvertedTile,
  MarkGlyph,
  SurfaceCard,
  SurfaceMock,
} from './BentoTiles';
import { MotionBlur } from '../scene/motion-blur';
import { BEATS, HANDOFF, SCENE_SPLIT, convProgress, riseOrdinal } from '../scene/beats';
import { CARD_PLACE, PAINT_ORDER, SITES, capCount } from '../scene/sites';
import { HEADLINE_BEATS } from '../scene/content';
import {
  between,
  clamp01,
  lerp,
  onScrollFrame,
  overshoot,
  smooth,
  trackProgress,
} from '../scene/progress';

/**
 * B1, first half — v5's `conv(pA)`, laid out as Paper 6O9 → 7K2, with the
 * five sites of Chris's 2026-09-22 feedback in place of the five surface
 * categories.
 *
 * Five site cards (a hi-fi crop of each live site) rise around the centred
 * headline, a cursor marquee selects them, and the conversion sweeps each
 * mockup into its provider module. Then every card becomes that site's
 * capability card: it lifts, travels into the tilted 7K2 fan, and while it
 * travels the brand's colour floods out from the corner where its white logo
 * lands, and its live functions list in. Cards stay opaque throughout —
 * arrivals travel, they don't fade — and anything moving blurs with its real
 * screen velocity.
 *
 * Geometry is authored on Paper's 1440 x 900 frame (`CANVAS`) and the canvas
 * is scaled to the viewport as one piece, so every coordinate below is the
 * export's own number. React renders structure once (and on resize); scroll
 * only drives a flat pass of style writes through refs. Nothing intercepts
 * wheel or touch.
 */

const STATIC_QUERY = '(prefers-reduced-motion: reduce), (max-width: 860px)';

/** Paper's frame */
export const CANVAS = { w: 1440, h: 900 } as const;

/** 6O9 card positions (canvas px, top-left), by surface slot (scene/sites.ts) */
const CELLS = [
  { x: 400, y: -58.5 }, // Google Maps
  { x: 773, y: 308.5 }, // Amazon
  { x: 400, y: 412.5 }, // Calendly
  { x: 1146, y: 78.5 }, // Expedia
  { x: 27, y: 160.5 }, // YouTube
] as const;
const CARD_W = 363;
const CARD_H = 460;

/** 6O9: the mockup's panel slot inside a card */
const PANEL = { x: 64, y: 39, w: 322, h: 266 } as const;

/** 7K2 capability card size */
const CAP_W = 306;
const CAP_H = 396;

/**
 * Beat 2 ("Bowmark converts everything…") sits bottom-centre: 520px wide,
 * its box ≈ canvas y 725–830 (Paper's 7K2 headline slot, with a little
 * margin). A card's serif label occupies the card's bottom 24–82px over its
 * 266px measure. Labels that intersect the headline fade out as it arrives —
 * just before beat 2's window, so the 6O9 keyframe is untouched.
 */
const HEADLINE_ZONE = { x0: CANVAS.w / 2 - 260, x1: CANVAS.w / 2 + 260, y0: 725, y1: 830 } as const;
const HEADLINE_CLEAR: readonly [number, number] = [BEATS.headline2[0] - 0.03, BEATS.headline2[0]];
const UNDER_HEADLINE = CELLS.map((c) => {
  const x0 = c.x + 24;
  const x1 = x0 + 266;
  const y0 = c.y + CARD_H - 82;
  const y1 = c.y + CARD_H - 24;
  return x1 > HEADLINE_ZONE.x0 && x0 < HEADLINE_ZONE.x1 && y1 > HEADLINE_ZONE.y0 && y0 < HEADLINE_ZONE.y1;
});

/** each slot's place in the fan, and its turn to morph (= its paint order) */
const PLACES = SITES.map((s) => CARD_PLACE[s.id]);
const TURN = SITES.map((s) => PAINT_ORDER.indexOf(s.id));

/**
 * The morph, as fractions of a card's own window (BEATS.morphLen):
 * it travels over the first TRAVEL, the brand floods over FLOOD, and the
 * rows list in from ROWS_AT, one after another.
 */
const TRAVEL = 0.62;
const FLOOD: readonly [number, number] = [0.12, 0.62];
const ROWS_AT = 0.46;
const ROW_STEP = 0.034;
const ROW_LEN = 0.16;
/** the flood's origin: the logo's corner of the capability card (card px from its top-right) */
const FLOOD_AT = { right: 40, top: 40 } as const;
/** how high a card lifts toward the viewer mid-travel (canvas px of z) */
const LIFT_Z = 70;

/** cursor marquee, canvas px: it sweeps the whole spread */
const MARQUEE_FROM = { x: 14, y: 70 } as const;
const MARQUEE_TO = { x: 1400, y: 862 } as const;

/** .b1__canvas perspective and its origin (50% 45%), for projecting z */
const PERSPECTIVE = 1500;
const P_ORIGIN = { x: CANVAS.w * 0.5, y: CANVAS.h * 0.45 } as const;
const depthScale = (z: number) => PERSPECTIVE / (PERSPECTIVE - z);

/** blur cap for whole cards, screen px */
const BLUR_CARD = 6;

/** remaining distance of an ease-out-cubic travel, 1 → 0 */
const travelLeft = (t: number) => {
  const r = 1 - clamp01(t);
  return r * r * r;
};

/** ease-in-out cubic, for a card carried from one place to another */
const carry = (x: number) => {
  const t = clamp01(x);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

type Layout = { vw: number; vh: number; s: number };

export const fitCanvas = (vw: number, vh: number): Layout => ({
  vw,
  vh,
  s: Math.min(vw / CANVAS.w, vh / CANVAS.h),
});

const FALLBACK: Layout = fitCanvas(1440, 900);

export const canvasStyle = (s: number): CSSProperties => ({
  width: CANVAS.w,
  height: CANVAS.h,
  transform: `translate(-50%, -50%) scale(${s.toFixed(4)})`,
});

export default function DecompileScene({ trackId }: { trackId: string }) {
  const [layout, setLayout] = useState<Layout>(FALLBACK);
  const [isStatic, setIsStatic] = useState(false);

  const canvasRef = useRef<HTMLDivElement | null>(null);
  const glowRef = useRef<HTMLDivElement | null>(null);
  const sweepRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<SVGGElement | null>(null);
  const marqueeRef = useRef<SVGRectElement | null>(null);
  const cursorRef = useRef<SVGGElement | null>(null);
  const tagRef = useRef<SVGGElement | null>(null);

  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const paperRefs = useRef<(HTMLDivElement | null)[]>([]);
  const artRefs = useRef<(HTMLDivElement | null)[]>([]);
  const mockRefs = useRef<(HTMLDivElement | null)[]>([]);
  const labelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const detailSrcRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const detailModRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const ringRefs = useRef<(HTMLDivElement | null)[]>([]);
  const codeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const wipeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const capRefs = useRef<(HTMLDivElement | null)[]>([]);
  const jumped = useRef(false);

  /* --- responsive layout / static mode ---------------------------------- */

  useEffect(() => {
    const mq = window.matchMedia(STATIC_QUERY);
    const measure = () => {
      setIsStatic(mq.matches);
      setLayout(fitCanvas(document.documentElement.clientWidth, document.documentElement.clientHeight));
    };
    measure();
    window.addEventListener('resize', measure);
    mq.addEventListener('change', measure);
    return () => {
      window.removeEventListener('resize', measure);
      mq.removeEventListener('change', measure);
    };
  }, []);

  /* --- the frame loop ---------------------------------------------------- */

  useEffect(() => {
    const root = document.documentElement;

    if (isStatic) {
      // The portrait scene owns these channels on phones. Only a real motion
      // preference gets the still-state reset; width is not that preference.
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      // Readable fallback: hero copy fully visible, no scroll-driven state.
      root.style.setProperty('--b1-hero-out', '0');
      root.style.setProperty('--b1-p', '0');
      root.style.removeProperty('--b1-scale');
      for (let i = 0; i < 4; i++) {
        root.style.setProperty(`--b1-h${i}`, '1');
        root.style.setProperty(`--b1-hy${i}`, '0px');
      }
      return;
    }

    const track = document.getElementById(trackId);
    if (!track) return;

    const L = layout;
    root.style.setProperty('--b1-scale', L.s.toFixed(4));

    /* the parts of each capability card the morph stages: its corner logo,
       its count, its rows (column A then B), and its "+ N more" */
    const capParts = capRefs.current.map((cap) => ({
      logo: cap?.querySelector<HTMLElement>('.cap__logo') ?? null,
      count: cap?.querySelector<HTMLElement>('.cap__count') ?? null,
      rows: cap ? Array.from(cap.querySelectorAll<HTMLElement>('.cap__row')) : [],
      more: cap?.querySelector<HTMLElement>('.cap__more') ?? null,
    }));

    /* Motion blur follows each object's real screen velocity (see
       scene/motion-blur.ts). A fresh tracker per layout, so a resize never
       reads as motion. */
    const mb = new MotionBlur();
    mb.scale = L.s;
    /* the stage's reach beyond Paper's frame, canvas px: off-stage starts */
    const outside = Math.max(0, (L.vw / L.s - CANVAS.w) / 2);
    const below = Math.max(0, (L.vh / L.s - CANVAS.h) / 2);

    let last = -1;

    const apply = (raw: number) => {
      /* This half owns raw 0..SCENE_SPLIT; past it, p stays at 1 so the
         headline and the hidden hero hold while the second half plays. */
      const p = convProgress(raw);
      const handoff = between(raw, ...HANDOFF);
      const heroOut = between(p, ...BEATS.heroOut);
      const shown = between(p, ...BEATS.stageIn);
      /* Across HANDOFF both halves hold the identical, resting 7K2 frame, so
         the second half takes over with one opaque switch at its midpoint.
         Cross-fading two copies let the ground show through both (the cards
         and their shadows dimmed, then recovered) — a visible flash. */
      const handed = handoff >= 0.5;

      /* hero channel (read by Hero.astro's CSS) */
      root.style.setProperty('--b1-p', p.toFixed(4));
      root.style.setProperty('--b1-hero-out', heroOut.toFixed(3));
      const th =
        between(p, ...BEATS.headline1) +
        between(p, ...BEATS.headline2) +
        between(p, ...BEATS.headline3);
      const beat = (i: number) => clamp01(1 - Math.abs(i - th) * 2.4);
      for (let i = 0; i < 4; i++) {
        root.style.setProperty('--b1-h' + i, beat(i).toFixed(3));
        root.style.setProperty('--b1-hy' + i, ((i - th) * 12).toFixed(1) + 'px');
      }
      track.dataset.heroLive = heroOut < 0.35 ? '1' : '0';

      if (glowRef.current) glowRef.current.style.opacity = (0.55 + 0.45 * shown).toFixed(3);
      const active = shown >= 0.005 && !handed;
      if (canvasRef.current) {
        // The cards explicitly set visibility: visible during their motion.
        // They can override an ancestor's visibility: hidden, so remove the
        // inactive canvas from rendering rather than only hiding its parent.
        // All geometry here is authored coordinates, with no layout reads.
        canvasRef.current.style.display = active ? '' : 'none';
        canvasRef.current.style.opacity = shown.toFixed(3);
        canvasRef.current.style.visibility = active ? 'visible' : 'hidden';
      }
      if (!active) {
        mb.reset();
        return;
      }

      /* cursor path — enters, drags a marquee over the surfaces, exits */
      const posAt = (pp: number): [number, number] => {
        const en = between(pp, ...BEATS.cursorEnter);
        const dg = between(pp, ...BEATS.cursorDrag);
        const ex = between(pp, ...BEATS.cursorExit);
        let x = lerp(-outside - 130, MARQUEE_FROM.x, en);
        let y = lerp(CANVAS.h * 0.62, MARQUEE_FROM.y, en);
        x = lerp(x, lerp(MARQUEE_FROM.x, MARQUEE_TO.x, dg), dg);
        y = lerp(y, lerp(MARQUEE_FROM.y, MARQUEE_TO.y, dg), dg);
        x = lerp(x, CANVAS.w + 180, ex);
        y = lerp(y, CANVAS.h + 130, ex);
        return [x, y];
      };
      const cur = posAt(p);
      let tag = posAt(p - 0.009);
      const dx = cur[0] - tag[0];
      const dy = cur[1] - tag[1];
      const dd = Math.sqrt(dx * dx + dy * dy);
      if (dd > 34) tag = [cur[0] - (dx / dd) * 34, cur[1] - (dy / dd) * 34];
      const tagFlipX = lerp(40, -136, smooth(clamp01((tag[0] + 130 - CANVAS.w) / 90)));
      const tagFlipY = lerp(17, -46, smooth(clamp01((tag[1] + 46 - CANVAS.h) / 60)));

      const mqOp = between(p, ...BEATS.marqueeOn) * (1 - between(p, ...BEATS.marqueeOff));
      const curOp = between(p, ...BEATS.cursorOn) * (1 - between(p, ...BEATS.cursorOff));

      if (overlayRef.current) overlayRef.current.style.opacity = Math.max(mqOp, curOp).toFixed(3);
      if (marqueeRef.current) {
        const m = marqueeRef.current;
        m.setAttribute('x', String(Math.min(MARQUEE_FROM.x, cur[0])));
        m.setAttribute('y', String(Math.min(MARQUEE_FROM.y, cur[1])));
        m.setAttribute('width', String(Math.abs(cur[0] - MARQUEE_FROM.x)));
        m.setAttribute('height', String(Math.abs(cur[1] - MARQUEE_FROM.y)));
        m.style.opacity = mqOp.toFixed(3);
      }
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${cur[0].toFixed(1)}px, ${cur[1].toFixed(1)}px)`;
        cursorRef.current.style.opacity = curOp.toFixed(3);
      }
      if (tagRef.current) {
        tagRef.current.style.transform = `translate(${(tag[0] + tagFlipX).toFixed(1)}px, ${(tag[1] + tagFlipY).toFixed(1)}px)`;
        tagRef.current.style.opacity = curOp.toFixed(3);
      }

      /* the five cards */
      for (let i = 0; i < SITES.length; i++) {
        const el = cardRefs.current[i];
        if (!el) continue;
        const cell = CELLS[i];
        const place = PLACES[i];
        const ord = riseOrdinal(i);
        const st = BEATS.riseStart + ord * BEATS.riseStep;
        // linear here: the travel below carries its own ease-out
        const ri = clamp01((p - st) / BEATS.riseLen);

        if (ri <= 0) {
          el.style.visibility = 'hidden';
          mb.hide(el);
          continue;
        }
        el.style.visibility = 'visible';

        /* this card's morph into its capability card */
        const turn = TURN[i] ?? 0;
        const m = clamp01((p - (BEATS.morphStart + turn * BEATS.morphStep)) / BEATS.morphLen);
        const mt = clamp01(m / TRAVEL);
        const t = carry(mt);
        const flood = smooth((m - FLOOD[0]) / (FLOOD[1] - FLOOD[0]));
        const lift = m > 0 && mt < 1 ? Math.sin(Math.PI * mt) : 0;

        const x = lerp(cell.x, place.x, t);
        const y = lerp(cell.y, place.y, t);
        const w = lerp(CARD_W, CAP_W, t);
        const h = lerp(CARD_H, CAP_H, t);

        el.style.left = x.toFixed(1) + 'px';
        el.style.top = y.toFixed(1) + 'px';
        el.style.width = w.toFixed(1) + 'px';
        el.style.height = h.toFixed(1) + 'px';
        // a card in flight rides above the ones still waiting; its place in
        // the fan's paint order is fixed from the moment it lifts off
        el.style.zIndex = String(m > 0 ? 30 + turn : 10 + ord);

        let tz = 0;
        if (m <= 0) {
          /* Rise: an opaque sheet travels up from below the stage (no fade,
             so overlapping arrivals never colour-mix). Position eases out;
             the tilt uses the back-out so the sheet settles with a small give. */
          const rem = travelLeft(ri);
          const tilt = 1 - overshoot(ri);
          const ux = (cell.x + CARD_W / 2 - CANVAS.w / 2) / CANVAS.w;
          const tx = ux * 260 * rem;
          const ty = (CANVAS.h + below - cell.y + 80) * rem;
          tz = 140 * rem;
          el.style.transformOrigin = '';
          el.style.transform =
            rem < 0.0005 && Math.abs(tilt) < 0.002
              ? 'none'
              : `translate3d(${tx.toFixed(1)}px, ${ty.toFixed(1)}px, ${tz.toFixed(0)}px) rotateX(${(12 * tilt).toFixed(2)}deg) rotateY(${(ux * -24 * tilt).toFixed(2)}deg)`;
          const f = depthScale(tz);
          mb.sample(
            el,
            P_ORIGIN.x + (x + w / 2 + tx - P_ORIGIN.x) * f,
            P_ORIGIN.y + (y + h / 2 + ty - P_ORIGIN.y) * f,
            w * f,
            BLUR_CARD
          );
        } else {
          /* Travel: lifted toward the viewer mid-flight, turning into the
             fan's tilt with the back-out's small give. Rotation is about the
             top-left corner, as the second half's cards rest (.imp__cap), so
             the landed frame is theirs exactly. */
          tz = LIFT_Z * lift;
          const r = place.r * overshoot(mt);
          el.style.transformOrigin = '0 0';
          el.style.transform =
            tz < 0.05 ? `rotate(${r.toFixed(3)}deg)` : `translateZ(${tz.toFixed(1)}px) rotate(${r.toFixed(3)}deg)`;
          const f = depthScale(tz);
          mb.sample(
            el,
            P_ORIGIN.x + (x + w / 2 - P_ORIGIN.x) * f,
            P_ORIGIN.y + (y + h / 2 - P_ORIGIN.y) * f,
            w * f,
            BLUR_CARD
          );
        }

        /* the paper sheet: shrinks with the card until the brand covers it */
        const paper = paperRefs.current[i];
        if (paper) {
          paper.style.visibility = flood >= 1 ? 'hidden' : '';
          paper.style.outlineColor =
            flood < 0.001
              ? ''
              : `color-mix(in oklab, var(--bm-stage-line) ${((1 - flood) * 100).toFixed(1)}%, transparent)`;
        }
        const k = w / CARD_W;
        const art = artRefs.current[i];
        if (art) {
          art.style.transformOrigin = '0 0';
          art.style.transform = m > 0 ? `scale(${k.toFixed(4)})` : '';
        }

        /* the conversion wipes the mockup into its provider module */
        const fq = ((cell.x + CARD_W / 2) / CANVAS.w + (cell.y + CARD_H / 2) / CANVAS.h) / 2;
        const fl = between(p, BEATS.flipStart + fq * BEATS.flipSkew, BEATS.flipEnd + fq * BEATS.flipSkew);
        const code = codeRefs.current[i];
        const wipe = wipeRefs.current[i];
        if (code) {
          code.style.opacity = fl > 0.005 ? '1' : '0';
          code.style.clipPath =
            fl > 0.995
              ? 'none'
              : `polygon(0 0, ${(-20 + fl * 165).toFixed(1)}% 0, ${(-40 + fl * 165).toFixed(1)}% 100%, 0 100%)`;
        }
        if (wipe) {
          const on = fl > 0.005 && fl < 0.995;
          wipe.style.opacity = on ? '1' : '0';
          wipe.style.transform = `translateX(${((((-20 + fl * 165) - 13) / 26) * 100).toFixed(1)}%) skewX(-13deg)`;
        }
        const mock = mockRefs.current[i];
        if (mock) mock.style.setProperty('--mock-in', (1 - between(fl, 0.7, 1)).toFixed(3));

        const label = labelRefs.current[i];
        if (label) {
          // A bottom label that would run under the relocated beat-2 headline
          // steps aside as that headline arrives (after the 6O9 keyframe).
          const clear = UNDER_HEADLINE[i] ? 1 - between(p, ...HEADLINE_CLEAR) : 1;
          label.style.opacity = clear.toFixed(3);
          // the label shrinks with its sheet (as the art does); its
          // typography is untouched
          label.style.transform = m > 0 ? `scale(${k.toFixed(4)})` : '';
        }
        /* With the code, the site's domain gives way to the provider module
           it now is — one small line changing, through a brief blur. */
        const [sa, sb] = BEATS.labelSwap;
        const srcOut = between(fl, sa, lerp(sa, sb, 0.65));
        const modIn = between(fl, lerp(sa, sb, 0.35), sb);
        const src = detailSrcRefs.current[i];
        if (src) {
          src.style.opacity = (1 - srcOut).toFixed(3);
          src.style.filter = srcOut < 0.01 || srcOut > 0.99 ? '' : `blur(${(3 * srcOut).toFixed(1)}px)`;
        }
        const mod = detailModRefs.current[i];
        if (mod) {
          mod.style.opacity = modIn.toFixed(3);
          mod.style.filter = modIn < 0.01 || modIn > 0.99 ? '' : `blur(${(3 * (1 - modIn)).toFixed(1)}px)`;
        }

        const ring = ringRefs.current[i];
        if (ring) {
          const sel =
            clamp01((cur[0] - cell.x) / 80) * clamp01((cur[1] - cell.y) / 80) * mqOp * (ri > 0.98 ? 1 : 0);
          ring.style.opacity = sel.toFixed(3);
        }

        /* the capability card: the brand floods out from the logo's corner,
           then its functions list in, one after another */
        const cap = capRefs.current[i];
        if (cap) {
          if (flood <= 0) {
            cap.style.visibility = 'hidden';
          } else {
            cap.style.visibility = 'visible';
            const reach = Math.hypot(w, h) + 90;
            cap.style.clipPath =
              flood >= 1
                ? 'none'
                : `circle(${(reach * flood).toFixed(1)}px at ${(w - FLOOD_AT.right).toFixed(1)}px ${FLOOD_AT.top}px)`;
          }
          // the frame's shadow comes in with the brand and deepens with the
          // lift; landed, it is the second half's resting shadow exactly
          el.style.setProperty('--sh', flood.toFixed(3));
          el.style.setProperty('--depth-lift', lift.toFixed(3));
          const parts = capParts[i];
          if (parts?.logo) {
            const pop = between(m, FLOOD[0], FLOOD[0] + 0.18);
            parts.logo.style.transform = pop > 0.999 ? '' : `scale(${lerp(0.55, 1, overshoot(pop)).toFixed(3)})`;
          }
          const inAt = (j: number) => clamp01((m - ROWS_AT - j * ROW_STEP) / ROW_LEN);
          parts?.rows.forEach((row, j) => {
            const a = smooth(inAt(j));
            row.style.opacity = a > 0.999 ? '' : a.toFixed(3);
            row.style.transform = a > 0.999 ? '' : `translateY(${(6 * (1 - a)).toFixed(1)}px)`;
            row.style.filter = a < 0.01 || a > 0.99 ? '' : `blur(${(2 * (1 - a)).toFixed(1)}px)`;
          });
          if (parts?.more) {
            const a = smooth(inAt(parts.rows.length));
            parts.more.style.opacity = a > 0.999 ? '' : a.toFixed(3);
          }
        }
      }

      /* light sweep */
      if (sweepRef.current) {
        const on = p > BEATS.sweepWindow[0] && p < BEATS.sweepWindow[1];
        sweepRef.current.style.opacity = on ? '1' : '0';
        if (on) {
          const q = lerp(-18, 118, between(p, ...BEATS.sweep));
          sweepRef.current.style.transform = `translateX(${((q / 100) * CANVAS.w).toFixed(1)}px) skewX(-14deg)`;
        }
      }
    };

    const stop = onScrollFrame(() => {
      const p = trackProgress(track);
      if (Math.abs(p - last) < 0.00005) return;
      // a jump (anchor, scrollbar drag, find-in-page) is not motion
      if (last >= 0 && Math.abs(p - last) > 0.04) mb.reset();
      last = p;
      apply(p);
    });

    apply(trackProgress(track));

    /* Review aid, and the only owner of the query jump on this page (the
       second half never scrolls the page). `?p=` is progress through the FIRST
       half, as it always was; `?scene=import&p=` is progress through the
       second. The jump runs once, after the first apply, and is instant so a
       smooth-scroll animation cannot land late and fight the reader. */
    const params = new URLSearchParams(window.location.search);
    const requested = Number(params.get('p'));
    if (!jumped.current && Number.isFinite(requested) && requested > 0 && requested <= 1) {
      jumped.current = true;
      const raw =
        params.get('scene') === 'import'
          ? SCENE_SPLIT + requested * (1 - SCENE_SPLIT)
          : requested * SCENE_SPLIT;
      window.scrollTo({
        top: track.offsetTop + raw * (track.offsetHeight - window.innerHeight),
        behavior: 'instant' as ScrollBehavior,
      });
      // land sharp: the jump itself carries no velocity
      mb.reset();
    }

    return () => {
      stop();
      mb.dispose();
      track.dataset.heroLive = '1';
    };
  }, [layout, isStatic, trackId]);

  /* --- markup ------------------------------------------------------------ */

  if (isStatic) return <StaticFigure />;

  return (
    <>
    <StaticFigure />
    <div className="b1" aria-hidden="true">
      <div className="b1__glow" ref={glowRef} />

      <div className="b1__canvas" ref={canvasRef} style={canvasStyle(layout.s)}>
        {SITES.map((site, i) => (
          <div
            key={site.id}
            className="b1__card"
            data-site={site.id}
            ref={(el) => {
              cardRefs.current[i] = el;
            }}
            style={{ zIndex: 10 + riseOrdinal(i) }}
          >
            {/* the site card: its mockup, the code it becomes, its label */}
            <div
              className="b1__paper"
              ref={(el) => {
                paperRefs.current[i] = el;
              }}
            >
              <div
                className="sc__art"
                ref={(el) => {
                  artRefs.current[i] = el;
                }}
              >
                <div
                  className="sc__panel"
                  data-site={site.id}
                  ref={(el) => {
                    mockRefs.current[i] = el;
                  }}
                >
                  <SurfaceMock surface={i} />
                </div>
                <div
                  className="b1__code"
                  ref={(el) => {
                    codeRefs.current[i] = el;
                  }}
                  style={{ left: PANEL.x, top: PANEL.y, width: PANEL.w, height: PANEL.h }}
                >
                  <ConvertedTile surface={i} />
                </div>
                <div
                  className="b1__wipe-slot"
                  style={{ left: PANEL.x, top: PANEL.y, width: PANEL.w, height: PANEL.h }}
                >
                  <div
                    className="b1__wipe"
                    ref={(el) => {
                      wipeRefs.current[i] = el;
                    }}
                  />
                </div>
              </div>

              <div
                className="b1__label"
                ref={(el) => {
                  labelRefs.current[i] = el;
                }}
              >
                <span className="sc__name">{site.brand}</span>
                <span className="b1__details">
                  <span
                    className="sc__detail"
                    ref={(el) => {
                      detailSrcRefs.current[i] = el;
                    }}
                  >
                    {site.detail}
                  </span>
                  <span
                    className="sc__detail b1__detail-mod"
                    ref={(el) => {
                      detailModRefs.current[i] = el;
                    }}
                  >
                    Provider module · {capCount(site)}
                  </span>
                </span>
              </div>

              <div
                className="b1__ring"
                ref={(el) => {
                  ringRefs.current[i] = el;
                }}
              />
            </div>

            {/* the capability card it becomes */}
            <div
              className="b1__cap"
              ref={(el) => {
                capRefs.current[i] = el;
              }}
            >
              <CapabilityCard site={site} />
            </div>
          </div>
        ))}

        <div className="b1__sweep" ref={sweepRef} style={{ width: CANVAS.w * 0.24 }} />

        <svg
          className="b1__ov"
          width={CANVAS.w}
          height={CANVAS.h}
          viewBox={`0 0 ${CANVAS.w} ${CANVAS.h}`}
          focusable="false"
        >
          <g ref={overlayRef}>
            <rect ref={marqueeRef} className="b1__marquee" x="0" y="0" width="0" height="0" />
            {/* the "Bowmark" badge that trails the cursor */}
            <g ref={tagRef} className="b1__tag">
              <rect className="b1__tag-bg" width="96" height="28" rx="14" />
              <g className="b1__tag-mark" transform="translate(9.5, 7) scale(0.29)">
                <circle
                  cx="24"
                  cy="24"
                  r="20.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray="92.7 36.1"
                  transform="rotate(126 24 24)"
                />
                <circle
                  cx="24"
                  cy="24"
                  r="12.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray="64.4 14.1"
                  transform="rotate(99 24 24)"
                />
                <circle cx="24" cy="24" r="4.6" fill="currentColor" />
              </g>
              <text x="59" y="15" textAnchor="middle" dominantBaseline="middle">
                Bowmark
              </text>
            </g>
            <g ref={cursorRef} className="b1__cursor">
              <path d="M0,0 l0,19.4 l5.3,-4.3 l3.2,7.1 l3.2,-1.5 l-3.1,-6.9 l6.5,0 Z" />
            </g>
          </g>
        </svg>
      </div>
    </div>
    </>
  );
}

/* --- reduced motion / narrow viewport ---------------------------------------- */

/**
 * The same story as stills: the five sites (with their mockups), the Bowmark
 * conversion, and the capability card each one becomes.
 */
function StaticFigure() {
  const rootRef = useRef<HTMLElement | null>(null);
  /* M02's source order and M03's back-to-front capability stack. */
  const order = ['youtube', 'amazon', 'calendly', 'maps', 'expedia'].map(id => {
    const i = SITES.findIndex(site => site.id === id);
    return { i, site: SITES[i]! };
  });
  const capabilities = [order[0]!, order[2]!, order[3]!, order[1]!, order[4]!];

  useEffect(() => {
    const beat = rootRef.current?.querySelector<HTMLElement>('.b1-static__beat--caps');
    if (!beat) return;
    const observer = new ResizeObserver(([entry]) => {
      if (!entry || entry.contentRect.width <= 40) return;
      const scale = Math.min((entry.contentRect.width - 40) / 350, entry.contentRect.height / 844);
      beat.style.setProperty('--b1-cap-scale', String(scale));
    });
    observer.observe(beat);
    return () => observer.disconnect();
  }, []);

  return (
    <figure className="b1-static" ref={rootRef}>
      <div className="b1-static__beat b1-static__beat--sources" id="story-sites">
        <ol className="b1-static__sources" aria-label="Five sites">
          {order.map(({ i, site }) => (
            <li key={site.id} data-site={site.id}>
              <SurfaceCard surface={i} />
            </li>
          ))}
        </ol>
        <h2 className="b1-static__heading">{HEADLINE_BEATS[1]}</h2>
      </div>

      <div className="b1-static__merge" aria-hidden="true">
        <span className="b1-static__converter">
          <MarkGlyph size={22} />
        </span>
      </div>

      <div className="b1-static__beat b1-static__beat--caps" id="story-capabilities">
        <ul className="b1-static__caps" aria-label="The capabilities they become">
          {capabilities.map(({ site }) => (
            <li key={site.id} data-site={site.id}>
              <CapabilityCard site={site} />
            </li>
          ))}
        </ul>
        <h2 className="b1-static__heading">{HEADLINE_BEATS[2]}</h2>
      </div>

      <figcaption className="b1-static__caption">AI accesses the web programmatically.</figcaption>
    </figure>
  );
}
