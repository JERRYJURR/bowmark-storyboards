import { useEffect, useRef, useState } from 'react';
import './ImportScene.css';
import { StayPhoto } from './StayPhotos';
import { CANVAS, canvasStyle, fitCanvas } from './DecompileScene';
import { CapabilityCard } from './BentoTiles';
import { BrandMark } from './sites/logos';
import { HANDOFF, IMPORT_BEATS as IB, importProgress } from '../scene/beats';
import { HOTEL_RESULT, IMPORT_BODY, IMPORT_HEAD, IMPORT_SOURCE, RUN_STATUS } from '../scene/content';
import { CARD_PLACE, IMPORTED, PAINT_ORDER, siteById } from '../scene/sites';
import { between, clamp01, lerp, onScrollFrame, smooth, trackProgress } from '../scene/progress';
import { MotionBlur } from '../scene/motion-blur';

/**
 * B1, second half — v5's `imp(p)`, laid out as Paper 7U1 → 7XJ → 80X.
 *
 * The five capability cards hand over from the first half; Kayak is chosen,
 * the others slide off-stage (opaque, motion-blurred by their real speed),
 * and it collapses into the `kayak` import token of agent.ts inside one soft
 * well. The agent types the call and runs it: the editor rises and fades
 * under the well's top edge while "Running code to find a hotel" and then
 * the found stay appear beneath it. The headline stays
 * below the well, owned by the hero channel the first half writes.
 *
 * Same contract as the first half: React renders structure once (and on
 * resize); a rAF-coalesced pass writes styles and text through refs. All
 * geometry is Paper's, on the shared 1440 x 900 canvas.
 */

const STATIC_QUERY = '(prefers-reduced-motion: reduce), (max-width: 860px)';

/** 7U1: the well (canvas px) and the editor column inside it */
const WELL = { x: 318, y: 217.5, w: 804, h: 465 } as const;
const COLUMN_X = 173;
/** column top: 7U1 initial, 7XJ running, 80X found */
const COLUMN_Y = { initial: 77, running: -50, found: -181 } as const;

/** where the chosen card pauses, straightened, before it collapses */
const SELECTED = { x: CANVAS.w / 2 - 153, y: 170 } as const;
const CARD = { w: 306, h: 396 } as const;

/** the capability cards, in the fan's paint order (back to front) */
const CARDS = PAINT_ORDER.map(siteById);
const CHOSEN = CARDS.findIndex((c) => c.id === IMPORTED);
const CHOSEN_SITE = CARDS[CHOSEN]!;

/** .imp__canvas perspective and its origin (50% 45%), for projecting z */
const PERSPECTIVE = 1500;
const P_ORIGIN = { x: CANVAS.w * 0.5, y: CANVAS.h * 0.45 } as const;

/** blur caps, screen px: the leaving cards, and the card becoming the token */
const BLUR_CARD = 6;
const BLUR_TOKEN = 5;

type Rect = { x: number; y: number; w: number; h: number };
/** fallback for the import token's slot (canvas px) until it is measured */
const CHIP_FALLBACK: Rect = { x: 581, y: 348, w: 110, h: 24 };

/** typed segments, in the order the agent writes them */
const SEGMENTS: string[] = [IMPORT_HEAD.pre, IMPORT_HEAD.post, ...IMPORT_BODY.map((l) => l.text)];

export default function ImportScene({ trackId }: { trackId: string }) {
  const [layout, setLayout] = useState(() => fitCanvas(1440, 900));
  const [isStatic, setIsStatic] = useState(false);

  const rootRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const faceRef = useRef<HTMLSpanElement | null>(null);

  const wellRef = useRef<HTMLDivElement | null>(null);
  const fadeRef = useRef<HTMLDivElement | null>(null);
  const columnRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<HTMLDivElement | null>(null);
  const chipRef = useRef<HTMLSpanElement | null>(null);
  const stateRef = useRef<HTMLSpanElement | null>(null);

  const shownRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const restRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const caretRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const agentRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const statusRef = useRef<HTMLDivElement | null>(null);
  const statusIconRef = useRef<HTMLSpanElement | null>(null);
  const statusTextRef = useRef<HTMLSpanElement | null>(null);
  const statusTimeRef = useRef<HTMLSpanElement | null>(null);
  const hotelRef = useRef<HTMLDivElement | null>(null);

  /** the import token's slot, measured in canvas px (layout, so unscaled) */
  const chipRect = useRef<Rect>(CHIP_FALLBACK);
  const applyRef = useRef<((raw: number) => void) | null>(null);
  const lastRaw = useRef(0);

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
    if (isStatic) return;
    const track = document.getElementById(trackId);
    if (!track) return;

    let last = -1;

    /* velocity-linked motion blur (scene/motion-blur.ts); fresh per layout */
    const mb = new MotionBlur();
    mb.scale = layout.s;
    /* the stage's reach beyond Paper's frame, canvas px */
    const outside = Math.max(0, (layout.vw / layout.s - CANVAS.w) / 2);

    /* The token's slot: offsets up to the canvas are layout values, so the
       canvas scale does not enter. The column sits at its initial top while
       the card collapses, which is the only time the slot is used. */
    const measureChip = () => {
      const chip = chipRef.current;
      const canvas = canvasRef.current;
      if (!chip || !canvas) return;
      let x = 0;
      let y = 0;
      let el: HTMLElement | null = chip;
      while (el && el !== canvas) {
        x += el.offsetLeft;
        y += el.offsetTop;
        el = el.offsetParent as HTMLElement | null;
      }
      if (el !== canvas) return;
      // the column may have moved; express the slot at its initial top
      const colTop = columnRef.current?.offsetTop ?? COLUMN_Y.initial;
      chipRect.current = { x, y: y - colTop + COLUMN_Y.initial, w: chip.offsetWidth, h: chip.offsetHeight };
    };

    const apply = (raw: number) => {
      /* Both halves hold the identical resting 7K2 frame across HANDOFF
         (same placements, tilts, z-order and shadow state), so this half
         takes over opaque at the window's midpoint — the same instant the
         first half hides. A cross-fade of two copies dimmed the cards and
         their shadows mid-way. */
      const live = between(raw, ...HANDOFF) >= 0.5;
      const root = rootRef.current;
      if (root) {
        root.style.opacity = live ? '1' : '0';
        root.style.visibility = live ? 'visible' : 'hidden';
      }
      if (!live) {
        mb.reset();
        return;
      }

      const p = importProgress(raw);
      const swp = smooth(between(p, ...IB.swap));
      const gOut = between(p, ...IB.ghostsOut);
      const toIn = between(p, ...IB.collapse);
      const mIn = Math.min(1, toIn * 1.5);
      const type = between(p, ...IB.type);
      const ent = between(p, ...IB.enter);
      const runIn = between(p, ...IB.runIn);
      const runT = between(p, ...IB.runProgress);
      const foundT = between(p, ...IB.found);
      const cardT = between(p, ...IB.result);
      const rise = between(p, IB.found[0], IB.result[1] - 0.02);

      /* --- the capability cards: one is chosen, the rest recede ---------- */
      for (let k = 0; k < CARDS.length; k++) {
        const el = cardRefs.current[k];
        if (!el) continue;
        const c = CARDS[k];
        const at = CARD_PLACE[c.id];

        if (k === CHOSEN) {
          const done = toIn > 0.999;
          el.style.visibility = done ? 'hidden' : 'visible';
          if (done) {
            mb.hide(el);
            continue;
          }
          const chip = chipRect.current;
          let x = lerp(at.x, SELECTED.x, swp);
          let y = lerp(at.y, SELECTED.y, swp);
          let w: number = CARD.w;
          let h: number = CARD.h;
          x = lerp(x, chip.x, toIn);
          y = lerp(y, chip.y, toIn);
          w = lerp(w, chip.w, toIn);
          h = lerp(h, chip.h, toIn);
          el.style.left = x.toFixed(1) + 'px';
          el.style.top = y.toFixed(1) + 'px';
          el.style.width = w.toFixed(1) + 'px';
          el.style.height = h.toFixed(1) + 'px';
          el.style.transform = `rotate(${(at.r * (1 - swp)).toFixed(2)}deg) scale(${lerp(1, 1.03, swp * (1 - toIn)).toFixed(4)})`;
          el.style.zIndex = swp > 0.3 ? '30' : String(2 + k);
          el.style.setProperty('--pad', lerp(24, 2, toIn).toFixed(1) + 'px');
          el.style.setProperty('--radius', lerp(16, 6, toIn).toFixed(1) + 'px');
          /* The provider list leaves first; the title (name, count, mark)
             hands over to the token's face through a brief blur, with just
             enough overlap that the card is never blank and the name is
             never shown twice at full strength (interface-details motion-7). */
          const titleOut = between(toIn, 0.2, 0.34);
          const faceIn = between(toIn, 0.26, 0.4);
          el.style.setProperty('--content', (1 - between(toIn, 0, 0.3)).toFixed(3));
          el.style.setProperty('--title', (1 - titleOut).toFixed(3));
          el.style.setProperty('--title-blur', (3 * titleOut).toFixed(2) + 'px');
          el.style.setProperty('--depth-lift', (swp * (1 - toIn)).toFixed(3));
          // the shadow shrinks with the card; a seated token casts almost none
          el.style.setProperty('--depth-k', lerp(1, 0.08, toIn).toFixed(3));
          mb.sample(el, x + w / 2, y + h / 2, w, BLUR_TOKEN);
          if (faceRef.current) {
            faceRef.current.style.opacity = faceIn.toFixed(3);
            faceRef.current.style.filter =
              faceIn < 0.01 || faceIn > 0.99 ? 'none' : `blur(${(3 * (1 - faceIn)).toFixed(1)}px)`;
          }
          continue;
        }

        /* The others leave opaque, sliding out past the nearest stage edge
           (ease-in, so they accelerate away), stepping back in depth as the
           choice lifts past them. No fade, so nothing colour-mixes where
           they cross. */
        const back = swp * 0.35;
        const go = gOut * gOut * gOut;
        if (gOut > 0.999) {
          el.style.visibility = 'hidden';
          mb.hide(el);
          continue;
        }
        const dir = at.x + CARD.w / 2 < CANVAS.w / 2 ? -1 : 1;
        const exit = dir < 0 ? at.x + CARD.w + outside + 120 : CANVAS.w - at.x + outside + 120;
        const x = at.x + dir * exit * go;
        const tz = -220 * back;
        el.style.visibility = 'visible';
        el.style.left = x.toFixed(1) + 'px';
        el.style.top = at.y.toFixed(1) + 'px';
        el.style.transform = `translateZ(${tz.toFixed(0)}px) rotate(${(at.r + dir * 6 * go).toFixed(2)}deg)`;
        el.style.setProperty('--depth-lift', Math.max(back, go).toFixed(3));
        const f = PERSPECTIVE / (PERSPECTIVE - tz);
        mb.sample(
          el,
          P_ORIGIN.x + (x + CARD.w / 2 - P_ORIGIN.x) * f,
          P_ORIGIN.y + (at.y + CARD.h / 2 - P_ORIGIN.y) * f,
          CARD.w * f,
          BLUR_CARD
        );
      }

      /* --- the well and the editor ----------------------------------------- */
      if (wellRef.current) {
        const el = wellRef.current;
        el.style.opacity = mIn.toFixed(3);
        el.style.visibility = mIn < 0.004 ? 'hidden' : 'visible';
        el.style.transform = mIn > 0.999 ? 'none' : `scale(${lerp(0.97, 1, mIn).toFixed(4)})`;
      }
      if (chipRef.current) chipRef.current.style.opacity = toIn > 0.999 ? '1' : '0';

      /* typing: "import {" as the token lands, then the rest */
      const preBudget = Math.round(mIn * (SEGMENTS[0].length + 1));
      let total = 0;
      for (let s = 1; s < SEGMENTS.length; s++) total += SEGMENTS[s].length;
      let budget = Math.round(type * (total + 18));
      let caretSeg = 0;
      for (let s = 0; s < SEGMENTS.length; s++) {
        const text = SEGMENTS[s];
        const n = s === 0 ? preBudget : Math.max(0, Math.min(text.length, budget));
        if (s > 0) {
          if (budget > 0) caretSeg = s;
          budget -= text.length;
        }
        const shown = shownRefs.current[s];
        const rest = restRefs.current[s];
        if (shown && shown.textContent !== text.slice(0, n)) shown.textContent = text.slice(0, n);
        if (rest && rest.textContent !== text.slice(n)) rest.textContent = text.slice(n);
      }
      // an empty line has nothing to type; the caret passes straight through
      const caretOn = ent < 0.6 && toIn > 0.55;
      const agTag = between(p, ...IB.agentTag) * (1 - between(p, ...IB.agentTagOut));
      for (let s = 0; s < SEGMENTS.length; s++) {
        const el = caretRefs.current[s];
        if (el) el.style.display = caretOn && s === caretSeg ? 'inline-block' : 'none';
        const tagEl = agentRefs.current[s];
        if (tagEl) tagEl.style.opacity = agTag.toFixed(3);
      }

      /* Enter: a brief lime ring, then the run takes over */
      if (editorRef.current) editorRef.current.style.setProperty('--ring', (ent * (1 - runIn)).toFixed(3));
      if (stateRef.current) {
        const el = stateRef.current;
        const next = runT > 0.97 ? `✓ ${RUN_STATUS.foundTime}` : ent > 0.5 ? 'running…' : '⏎ Run';
        if (el.textContent !== next) el.textContent = next;
        el.dataset.live = ent > 0.5 && runT <= 0.97 ? '1' : '0';
      }

      /* --- run, found, result: the column rises inside the well ------------ */
      const top = lerp(
        lerp(COLUMN_Y.initial, COLUMN_Y.running, smooth(runIn)),
        COLUMN_Y.found,
        smooth(rise)
      );
      if (columnRef.current) columnRef.current.style.top = top.toFixed(1) + 'px';
      if (fadeRef.current) fadeRef.current.style.opacity = runIn.toFixed(3);

      if (statusRef.current) {
        const el = statusRef.current;
        el.style.visibility = runIn < 0.01 ? 'hidden' : 'visible';
        el.style.opacity = Math.min(1, runIn * 1.6).toFixed(3);
        el.style.transform = `translateY(${lerp(10, 0, runIn).toFixed(1)}px)`;
      }
      const found = foundT > 0.01;
      if (statusIconRef.current) statusIconRef.current.dataset.state = found ? 'found' : 'running';
      if (statusTextRef.current) {
        const s: string = found ? RUN_STATUS.found : RUN_STATUS.running;
        const t = found ? s.slice(0, Math.round(clamp01(foundT * 1.4) * s.length)) : s;
        if (statusTextRef.current.textContent !== t) statusTextRef.current.textContent = t;
      }
      if (statusTimeRef.current) {
        const t = found ? RUN_STATUS.foundTime : `${Math.max(1, Math.ceil(runT * 2))}s`;
        if (statusTimeRef.current.textContent !== t) statusTimeRef.current.textContent = t;
        statusTimeRef.current.style.opacity = found ? between(foundT, 0.6, 1).toFixed(3) : '1';
      }

      if (hotelRef.current) {
        const el = hotelRef.current;
        el.style.visibility = cardT < 0.01 ? 'hidden' : 'visible';
        el.style.opacity = Math.min(1, cardT * 2).toFixed(3);
        el.style.transform = `translateY(${lerp(14, 0, cardT).toFixed(1)}px)`;
      }
    };

    applyRef.current = apply;
    measureChip();

    const stop = onScrollFrame(() => {
      const raw = trackProgress(track);
      if (Math.abs(raw - last) < 0.00005) return;
      // a jump (the ?p= review jump, anchors, scrollbar drag) is not motion
      if (last >= 0 && Math.abs(raw - last) > 0.04) mb.reset();
      last = raw;
      lastRaw.current = raw;
      apply(raw);
    });

    // Web fonts change the token's slot; measure again once they are in.
    let alive = true;
    document.fonts?.ready.then(() => {
      if (!alive) return;
      measureChip();
      // the token's slot moved under a still page; that is not motion
      mb.reset();
      applyRef.current?.(lastRaw.current);
    });

    lastRaw.current = trackProgress(track);
    apply(lastRaw.current);

    return () => {
      alive = false;
      stop();
      mb.dispose();
      applyRef.current = null;
    };
  }, [layout, isStatic, trackId]);

  /* --- markup ------------------------------------------------------------ */

  if (isStatic) return <ImportStatic />;

  let seg = 0;
  const typed = () => {
    const s = seg++;
    return (
      <>
        <span
          className="imp__typed"
          ref={(el) => {
            shownRefs.current[s] = el;
          }}
        />
        <span
          className="imp__caret"
          ref={(el) => {
            caretRefs.current[s] = el;
          }}
        >
          <span
            className="imp__agent"
            ref={(el) => {
              agentRefs.current[s] = el;
            }}
          >
            Agent
          </span>
        </span>
        <span
          className="imp__rest"
          ref={(el) => {
            restRefs.current[s] = el;
          }}
        >
          {SEGMENTS[s]}
        </span>
      </>
    );
  };

  const gutter = (indent: number) => (
    <>
      <span className="imp__gutter">$</span>
      {Array.from({ length: indent }, (_, k) => (
        <span key={k} className="imp__indent" />
      ))}
    </>
  );

  return (
    <div className="imp" ref={rootRef} aria-hidden="true">
      <div className="imp__canvas" ref={canvasRef} style={canvasStyle(layout.s)}>
        {/* 7K2, handed over from the first half */}
        {CARDS.map((c, k) => {
          const at = CARD_PLACE[c.id];
          return (
            <div
              key={c.id}
              className={`imp__cap${k === CHOSEN ? ' imp__cap--chosen' : ''}`}
              ref={(el) => {
                cardRefs.current[k] = el;
              }}
              style={{ left: at.x, top: at.y, zIndex: 2 + k, transform: `rotate(${at.r}deg)` }}
            >
              <CapabilityCard site={c}>
                {k === CHOSEN ? (
                  <span className="imp__face" ref={faceRef}>
                    <BrandMark id={c.id} size={14} />
                    <span>{c.ns}</span>
                  </span>
                ) : null}
              </CapabilityCard>
            </div>
          );
        })}

        {/* 7U1: one soft well; the editor, the run and the result live in it */}
        <div
          className="imp__well"
          ref={wellRef}
          style={{ left: WELL.x, top: WELL.y, width: WELL.w, height: WELL.h }}
        >
          <div className="imp__column" ref={columnRef} style={{ left: COLUMN_X, top: COLUMN_Y.initial }}>
            <div className="imp__editor" ref={editorRef}>
              <div className="imp__file">
                agent.ts
                <span className="imp__state" ref={stateRef} data-live="0">
                  ⏎ Run
                </span>
              </div>
              <div className="imp__frame">
                <div className="imp__lines">
                  <div className="imp__line">
                    {gutter(1)}
                    <span className="imp__seg">{typed()}</span>
                    <span
                      className="imp__chip"
                      ref={chipRef}
                      style={{ ['--cap-tone' as string]: CHOSEN_SITE.tone }}
                    >
                      <BrandMark id={CHOSEN_SITE.id} size={14} />
                      <span>{CHOSEN_SITE.ns}</span>
                    </span>
                    <span className="imp__seg">{typed()}</span>
                  </div>
                  {IMPORT_BODY.map((l, i) => (
                    <div className="imp__line" key={i}>
                      {gutter(l.indent)}
                      <span className="imp__seg">{typed()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 7XJ / 80X status line */}
            <div className="imp__status" ref={statusRef}>
              <span className="imp__status-icon" ref={statusIconRef} data-state="running">
                <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <circle cx="5" cy="12" r="1" />
                  <circle cx="12" cy="12" r="1" />
                  <circle cx="19" cy="12" r="1" />
                </svg>
              </span>
              <span ref={statusTextRef}>{RUN_STATUS.running}</span>
              <span className="imp__status-time" ref={statusTimeRef}>
                1s
              </span>
            </div>

            {/* 80X: the stay that came back */}
            <div className="imp__hotel" ref={hotelRef}>
              <HotelResult />
            </div>
          </div>

          <div className="imp__well-fade" ref={fadeRef} />
        </div>
      </div>
    </div>
  );
}

/** 80X's compact result row, with the existing actions set quietly beneath */
function HotelResult() {
  return (
    <>
      <div className="imp__hotel-row">
        <div className="imp__hotel-art">
          <StayPhoto />
        </div>
        <div className="imp__hotel-info">
          <div className="imp__hotel-head">
            <span className="imp__hotel-name">{HOTEL_RESULT.name}</span>
            <span className="imp__hotel-meta">
              <span>{HOTEL_RESULT.rating}</span>
              <span>{HOTEL_RESULT.reviews}</span>
              <span>∙</span>
              <span>{HOTEL_RESULT.kind}</span>
            </span>
          </div>
          <span className="imp__hotel-note">{HOTEL_RESULT.note.replace(/\.$/, '')}</span>
        </div>
        <span className="imp__hotel-rate">{HOTEL_RESULT.rate}</span>
      </div>
      <div className="imp__hotel-actions">
        <span className="imp__btn">{HOTEL_RESULT.primary}</span>
        <span className="imp__link">{HOTEL_RESULT.secondary}</span>
      </div>
    </>
  );
}

/* --- reduced motion / narrow: the same story, in flow ----------------------- */

function ImportStatic() {
  return (
    <section className="imp-static" aria-label="Calling a capability">
      <div className="imp-static__well">
        <div className="imp__editor imp-static__editor">
          <div className="imp__file">agent.ts</div>
          <div className="imp__frame">
            <pre className="imp-static__code">
              <code>{IMPORT_SOURCE}</code>
            </pre>
          </div>
        </div>
        <p className="imp__status imp-static__status">
          <span>{RUN_STATUS.found}</span>
          <span className="imp__status-time">{RUN_STATUS.foundTime}</span>
        </p>
        <div className="imp__hotel imp-static__hotel">
          <HotelResult />
        </div>
      </div>
    </section>
  );
}
