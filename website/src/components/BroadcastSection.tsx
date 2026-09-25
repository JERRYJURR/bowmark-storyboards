import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import './BroadcastSection.css';
import {
  BROADCAST_AUDIENCE,
  BROADCAST_BODY,
  BROADCAST_CTA,
  BROADCAST_SLIDES,
  BROADCAST_TABS_LABEL,
  BROADCAST_TITLE,
} from '../scene/broadcast';
import { LINKS } from '../scene/links';
import { alignToHash } from '../scene/hash-align';
import { BroadcastScreen } from './BroadcastArt';

/**
 * F5 — Bowmark Broadcast. Two columns on the 1024 column: a stack of four
 * product screens with a short caption on the left, a static heading, one
 * paragraph and the call on the right (text first in the DOM, so it also
 * leads on small screens).
 *
 * The stack is a manual carousel (WAI-ARIA APG, tabbed): previous / next
 * buttons and a tablist of slide markers. Nothing advances on its own. The
 * screens are decorative and inert; the caption panel carries each slide's
 * text and a full description.
 *
 * Motion: each card's place in the stack is `data-depth` (0 = front), and CSS
 * maps depth to a transform. On a change the cards' current transforms are
 * read first, then every card animates from there to its new place (WAAPI),
 * so a click mid-move carries on from where the cards are. A card that wraps
 * round the stack lifts up and tucks behind the others (or, going back,
 * comes out from behind and settles in front). Fronts stay opaque; nothing
 * fades. With `prefers-reduced-motion` the stack simply re-orders.
 */

const COUNT = BROADCAST_SLIDES.length;
const DURATION = 460;
const EASE = 'cubic-bezier(0.25, 0.8, 0.25, 1)';
/** where a wrapping card passes between the front and the back of the stack */
const LIFT = 'translateY(-52px) scale(0.95)';

const depthOf = (card: number, front: number) => (card - front + COUNT) % COUNT;

interface Pending {
  from: string[];
  prev: number;
  dir: 1 | -1;
}

export default function BroadcastSection() {
  const [index, setIndex] = useState(0);
  const rootRef = useRef<HTMLElement | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const pending = useRef<Pending | null>(null);
  const reduced = useRef(true);
  const uid = useId();

  const slide = BROADCAST_SLIDES[index];

  useEffect(() => {
    const root = rootRef.current;
    return root ? alignToHash(root, ['#broadcast', '#f5']) : undefined;
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => {
      reduced.current = mq.matches;
      if (mq.matches) {
        pending.current = null;
        cardRefs.current.forEach((card) => card?.getAnimations().forEach((animation) => animation.cancel()));
      }
    };
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  const go = useCallback(
    (target: number, dir: 1 | -1) => {
      const next = (target + COUNT) % COUNT;
      if (next === index) return;
      const cards = cardRefs.current;
      if (!reduced.current && typeof Element.prototype.animate === 'function') {
        // read where the cards are right now (mid-animation included), then let go
        pending.current = {
          from: cards.map((c) => (c ? getComputedStyle(c).transform : 'none')),
          prev: index,
          dir,
        };
      }
      cards.forEach((c) => c?.getAnimations().forEach((a) => a.cancel()));
      setIndex(next);
    },
    [index]
  );

  useLayoutEffect(() => {
    const p = pending.current;
    pending.current = null;
    if (!p) return;
    const steps = p.dir === 1 ? depthOf(index, p.prev) : depthOf(p.prev, index);

    cardRefs.current.forEach((card, i) => {
      if (!card) return;
      const from = p.from[i];
      const to = getComputedStyle(card).transform;
      const oldDepth = depthOf(i, p.prev);
      const newDepth = depthOf(i, index);
      const leaving = p.dir === 1 && oldDepth < steps;
      const arriving = p.dir === -1 && newDepth < steps;

      if (leaving) {
        card.animate(
          [
            { transform: from, zIndex: 9 },
            { transform: LIFT, zIndex: 9, offset: 0.46 },
            { transform: LIFT, zIndex: 0, offset: 0.47 },
            { transform: to, zIndex: 0 },
          ],
          { duration: DURATION + 80, easing: EASE }
        );
      } else if (arriving) {
        card.animate(
          [
            { transform: from, zIndex: 0 },
            { transform: LIFT, zIndex: 0, offset: 0.46 },
            { transform: LIFT, zIndex: 9, offset: 0.47 },
            { transform: to, zIndex: 9 },
          ],
          { duration: DURATION + 80, easing: EASE }
        );
      } else if (from !== to) {
        card.animate([{ transform: from }, { transform: to }], { duration: DURATION, easing: EASE });
      }
    });
  }, [index]);

  const onTabKey = (e: ReactKeyboardEvent, i: number) => {
    let next: number | null = null;
    let dir: 1 | -1 = 1;
    if (e.key === 'ArrowRight') next = i + 1;
    else if (e.key === 'ArrowLeft') {
      next = i - 1;
      dir = -1;
    } else if (e.key === 'Home') {
      next = 0;
      dir = -1;
    } else if (e.key === 'End') next = COUNT - 1;
    if (next === null) return;
    e.preventDefault();
    const n = (next + COUNT) % COUNT;
    go(n, dir);
    tabRefs.current[n]?.focus();
  };

  return (
    <section className="f5" id="broadcast" ref={rootRef} aria-labelledby={`${uid}-title`}>
      <span className="bm-anchor" id="f5" aria-hidden="true" />

      <div className="f5__layout">
        <div className="f5__text">
          <h2 className="f5__title" id={`${uid}-title`}>
            {BROADCAST_TITLE}
          </h2>
          <p className="f5__body">{BROADCAST_BODY}</p>
          <div className="f5__action">
            <a className="bm-btn bm-btn--cta f5__cta" href={LINKS.bookCall}>
              {BROADCAST_CTA}
            </a>
            <span className="f5__audience">{BROADCAST_AUDIENCE}</span>
          </div>
        </div>

        <div className="f5__carousel" role="group" aria-roledescription="carousel" aria-label={BROADCAST_TABS_LABEL}>
          <div className="f5__stack" aria-hidden="true" inert>
            {BROADCAST_SLIDES.map((s, i) => (
              <div
                key={s.id}
                className="f5__card"
                data-depth={depthOf(i, index)}
                ref={(el) => {
                  cardRefs.current[i] = el;
                }}
              >
                <BroadcastScreen id={s.id} />
              </div>
            ))}
          </div>

          <div
            className="f5__caption"
            id={`${uid}-panel`}
            role="tabpanel"
            aria-roledescription="slide"
            aria-labelledby={`${uid}-tab-${index}`}
            aria-live="polite"
          >
            <h3 className="f5__caption-title">{slide.title}</h3>
            <p className="f5__caption-text">{slide.text}</p>
            <p className="sr-only">{slide.describe}</p>
          </div>

          <div className="f5__controls">
            <button type="button" className="f5__step" aria-label="Previous example" onClick={() => go(index - 1, -1)}>
              <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false">
                <path d="M10 3.5 5.5 8l4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <div className="f5__tabs" role="tablist" aria-label={BROADCAST_TABS_LABEL}>
              {BROADCAST_SLIDES.map((s, i) => {
                const selected = i === index;
                return (
                  <button
                    key={s.id}
                    type="button"
                    role="tab"
                    id={`${uid}-tab-${i}`}
                    ref={(el) => {
                      tabRefs.current[i] = el;
                    }}
                    className="f5__tab"
                    aria-selected={selected}
                    aria-controls={`${uid}-panel`}
                    tabIndex={selected ? 0 : -1}
                    onClick={() => go(i, i > index ? 1 : -1)}
                    onKeyDown={(e) => onTabKey(e, i)}
                  >
                    <span className="f5__pip" aria-hidden="true" />
                    <span className="sr-only">
                      {s.label}, {i + 1} of {COUNT}
                    </span>
                  </button>
                );
              })}
            </div>

            <button type="button" className="f5__step" aria-label="Next example" onClick={() => go(index + 1, 1)}>
              <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false">
                <path d="M6 3.5 10.5 8 6 12.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
