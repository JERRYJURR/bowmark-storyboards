import { useEffect, useRef } from 'react';
import { CAPABILITY_COLUMNS, STATIC_CAPABILITIES, type Capability } from '../scene/capabilities';
import './CapabilityWall.css';

/** Board drift, in px per second; every column moves at the same pixel speed. */
const SPEED = 16;
/** Columns drift up / down / up. */
const DIRECTIONS = ['up', 'down', 'up'] as const;
/** The board runs only when motion is welcome and there is room for three columns. */
const STATIC_QUERY = '(max-width: 860px), (prefers-reduced-motion: reduce)';

/* `count` is every live function for the provider, the header call included;
   `providers` are the other listed calls. */
const extra = (capability: Capability) => Math.max(0, (capability.count ?? 0) - capability.providers.length - 1);
const total = (capability: Capability) => capability.count ?? capability.providers.length + 1;

/** The provider's own mark; the brand is named right beside it, so alt is empty. */
function ProviderLogo({ capability }: { capability: Capability }) {
  return <img className="b4__logo" src={capability.icon} alt="" width={16} height={16} decoding="async" draggable={false} />;
}

/** Paper 4AK's function glyph (Material "function"). */
function FunctionIcon() {
  return (
    <svg className="b4__fx" width="16" height="16" viewBox="96 -864 768 768" aria-hidden="true" focusable="false">
      <path
        d="M403.241-288.003v-57.6h56l79.2-96-79.2-96h-44l-51.2 257.6q-6.4 31.2-28.4 50T285.641-211.203q-31.2 0-52.8-21.2T211.241-281.603q0-19.2 11.2-32t28.8-12.8q16 0 26.4 10t10.4 25.2q0 4.8-1.2 10.4t-3.6 11.2q1.6 0.8 2.4 0.8h2.4q8 0 12.4-5.6t6.8-16.8l49.6-246.4h-68.8v-57.6h80l16.8-84.8q6.4-31.2 28.4-50T463.241-748.803q31.2 0 52.8 21.2t21.6 49.2q0 19.2-11.2 32t-28.8 12.8q-16 0-26.4-10T460.841-668.803q0-4.8 1.2-10.4t3.6-11.2q-1.6-0.8-2.4-0.8h-2.4q-8 0-12.4 5.6t-6.8 16.8l-15.2 73.6h130.4v57.6h-23.2l42.4 51.2 42.4-51.2h-23.2v-57.6h153.6v57.6h-55.2L613.641-441.603l80 96h55.2v57.6H595.241v-57.6h23.2l-42.4-51.2-42.4 51.2h23.2v57.6H403.241Z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * One provider, always expanded: logo, headline call and its function count,
 * then the other listed calls and "+N more". Heights vary with the list, which
 * gives the board its masonry. `Item` is `li` in the readable group and `div`
 * in the decorative clone, so the clone carries no list semantics.
 */
function Card({ capability, as: Item }: { capability: Capability; as: 'li' | 'div' }) {
  const n = total(capability);
  const more = extra(capability);
  const List = Item === 'li' ? 'ul' : 'div';
  const Line = Item;
  return <Item className="b4__card">
    <div className="b4__function">
      <ProviderLogo capability={capability} />
      <span className="b4__name" title={capability.name}>{capability.name}</span>
      <span className="b4__total">{n}<span className="sr-only"> {n === 1 ? 'function' : 'functions'}</span></span>
    </div>
    {(capability.providers.length > 0 || more > 0) && <div className="b4__body">
      {capability.providers.length > 0 && <div className="b4__tree">
        <span className="b4__guide" aria-hidden="true" />
        <List className="b4__providers">
          {capability.providers.map(provider => <Line key={provider}><FunctionIcon /><span className="b4__call" title={provider}>{provider}</span></Line>)}
        </List>
      </div>}
      {more > 0 && <span className="b4__more">+{more} more</span>}
    </div>}
  </Item>;
}

/**
 * B4: every provider on a slowly drifting three-column board. Each column's
 * track holds its group twice; a CSS animation moves the track by exactly
 * -50% of its own height (one group plus its trailing gap), so the loop has no
 * seam and needs no measuring for distance. A ResizeObserver reads one group's
 * height only to set the duration, keeping every column at SPEED px/s. Nothing
 * runs per frame. The board drifts continuously without hover, focus or
 * visibility pause logic. Narrow screens, reduced motion and
 * no-JS get a static, expanded list of STATIC_CAPABILITIES instead.
 */
export default function CapabilityWall() {
  const rootRef = useRef<HTMLElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const board = boardRef.current;
    if (!root || !board) return;
    const query = window.matchMedia(STATIC_QUERY);
    const setMode = () => { root.dataset.mode = query.matches ? 'static' : 'motion'; };
    setMode();
    query.addEventListener('change', setMode);

    // one read per group per resize, written as a duration on its track
    const resize = new ResizeObserver(entries => {
      for (const entry of entries) {
        const group = entry.target as HTMLElement;
        const height = group.offsetHeight;
        if (height > 0) group.parentElement?.style.setProperty('--b4-duration', `${(height / SPEED).toFixed(2)}s`);
      }
    });
    board.querySelectorAll<HTMLElement>('.b4__group:first-child').forEach(group => resize.observe(group));

    return () => {
      query.removeEventListener('change', setMode);
      resize.disconnect();
    };
  }, []);

  // A preceding responsive island can change height after the browser resolves #b4.
  useEffect(() => {
    if (window.location.hash !== '#b4' || new URLSearchParams(window.location.search).has('p')) return;
    const target = rootRef.current;
    if (!target) return;
    let frame = 0;
    const align = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => target.scrollIntoView({ block: 'start', behavior: 'instant' }));
    };
    const observer = new ResizeObserver(align);
    for (const id of ['b1-track', 'f1']) {
      const previous = document.getElementById(id);
      if (previous) observer.observe(previous);
    }
    const events = ['wheel', 'touchstart', 'pointerdown', 'keydown'] as const;
    const stop = () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      events.forEach(event => window.removeEventListener(event, stop));
    };
    align();
    events.forEach(event => window.addEventListener(event, stop, { passive: true }));
    return stop;
  }, []);

  return <section className="b4" id="b4" ref={rootRef} aria-labelledby="b4-title">
    <header className="b4__head">
      <h2 id="b4-title">Every capability.<br /><span>One import.</span></h2>
    </header>
    <div className="b4__motion">
      <div className="b4__board" ref={boardRef}>
        {CAPABILITY_COLUMNS.map((column, c) => <div className="b4__column" key={c}>
          <div className="b4__track" data-direction={DIRECTIONS[c]}>
            <ul className="b4__group">
              {column.map(capability => <Card capability={capability} as="li" key={capability.id} />)}
            </ul>
            {/* the second copy only closes the loop's seam: hidden from assistive tech, nothing to focus */}
            <div className="b4__group" aria-hidden="true" inert>
              {column.map(capability => <Card capability={capability} as="div" key={capability.id} />)}
            </div>
          </div>
        </div>)}
      </div>
    </div>
    <ul className="b4__static">
      {STATIC_CAPABILITIES.map(capability => <Card capability={capability} as="li" key={capability.id} />)}
    </ul>
    <div className="b4__mobile" role="region" aria-label="Provider capabilities" aria-describedby="b4-swipe" tabIndex={0}>
      {[0, 4, 8].map(start => (
        <ul className="b4__mobile-group" key={start}>
          {STATIC_CAPABILITIES.slice(start, start + 4).map(capability => <Card capability={capability} as="li" key={capability.id} />)}
        </ul>
      ))}
    </div>
    <p className="b4__swipe" id="b4-swipe">Swipe to see all 12 providers</p>
  </section>;
}
