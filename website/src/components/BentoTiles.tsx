import type { CSSProperties, ReactNode } from 'react';
import './BentoTiles.css';
import { CONVERTED, type CodeTok } from '../scene/demo-data';
import { SITES, capCount, capMore, type Site, type SiteId } from '../scene/sites';
import { BrandMark } from './sites/logos';
import YouTubeMock from './sites/YouTubeMock';
import AmazonMock from './sites/AmazonMock';
import CalendlyMock from './sites/CalendlyMock';
import MapsMock from './sites/MapsMock';
import ExpediaMock from './sites/ExpediaMock';

/**
 * Scene artwork, as Paper draws it (design-reference/paper-2026-09-19), with
 * Chris's 2026-09-22 brands in place of the five surface categories.
 *
 *  - 6O9: five 363 x 460 site cards. Each carries a cropped mockup of the
 *    live site in its upper part and a Crimson Pro brand label at the foot.
 *  - 7K2: 306 x 396 capability cards — the brand's fill burned by a
 *    white→grey ramp, the brand in serif, its white logo in the corner, and
 *    its functions in two columns (Expedia's API is illustrative).
 *
 * Indices are v5's surface slots (scene/sites.ts): 0 Google Maps · 1 Amazon ·
 * 2 Calendly · 3 Expedia · 4 YouTube. Nothing here knows about scroll.
 */

/* --- surface cards ---------------------------------------------------------- */

const MOCKS: Record<SiteId, () => ReactNode> = {
  youtube: () => <YouTubeMock />,
  amazon: () => <AmazonMock />,
  calendly: () => <CalendlyMock />,
  maps: () => <MapsMock />,
  expedia: () => <ExpediaMock />,
};

/** the site in a surface slot (0–4, scene/sites.ts) */
const siteAt = (surface: number): Site => SITES[surface]!;

/** The mockup a site card shows: the live site, cropped by the card's fades. */
export function SurfaceMock({ surface }: { surface: number }) {
  return <>{MOCKS[siteAt(surface).id]()}</>;
}

/** the serif brand and its domain */
export function SurfaceLabel({ surface }: { surface: number }) {
  const site = siteAt(surface);
  return (
    <>
      <span className="sc__name">{site.brand}</span>
      <span className="sc__detail">{site.detail}</span>
    </>
  );
}

/** A complete, static site card (used by the reduced-motion figure). */
export function SurfaceCard({ surface }: { surface: number }) {
  return (
    <div className="sc">
      <div className="sc__art" aria-hidden="true">
        <div className="sc__panel" data-site={siteAt(surface).id}>
          <SurfaceMock surface={surface} />
        </div>
      </div>
      <SurfaceLabel surface={surface} />
    </div>
  );
}

/* --- the converted state -------------------------------------------------------
   What a surface's mockup becomes as the conversion sweeps over it: the
   provider module Bowmark writes for it. Code, so it is set in the mono face.
---------------------------------------------------------------------------- */

export function ConvertedTile({ surface }: { surface: number }) {
  const c = CONVERTED[surface];
  return (
    <div className="cv">
      <div className="cv__head">
        <span className="cv__ts">TS</span>
        <span className="cv__file">{c.file}</span>
      </div>
      <ol className="cv__code">
        {c.lines.map((line: CodeTok[], i) => (
          <li key={i} className="cv__line">
            <span className="cv__ln">{i + 1}</span>
            <span className="cv__text">
              {line.map((tok, k) => (
                <span key={k} className={`cv__t cv__t--${tok.c}`}>
                  {tok.t}
                </span>
              ))}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* --- capability cards --------------------------------------------------------- */

/** Bowmark's mark, as the 7K2 card corner and the 7U1 import token draw it. */
export function MarkGlyph({ size = 32 }: { size?: number }) {
  return (
    <svg
      className="cap__mark"
      width={size}
      height={size}
      viewBox="-45.6 -45.6 76.8 76.8"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M-27.888 21.276A35.2 35.2 0 1 1 24.681 7.723 2.4 2.4 0 0 1 20.335 5.69 30.4 30.4 0 1 0-25.067 17.393 2.4 2.4 0 0 1-27.888 21.276ZM-10.827 15.714A23.2 23.2 0 1 1 11.991 5.835 3.2 3.2 0 0 1 6.699 2.239 16.8 16.8 0 1 0-9.826 9.393 3.2 3.2 0 0 1-10.827 15.714ZM-16.805-7.201A9.602 9.602 0 1 0 2.398-7.201 9.602 9.602 0 1 0-16.805-7.201Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** Material "function" glyph Paper uses before each provider row */
function FxGlyph() {
  return (
    <svg className="cap__fx" width="16" height="16" viewBox="96 -864 768 768" aria-hidden="true" focusable="false">
      <path
        d="M403.241-288.003v-57.6h56l79.2-96-79.2-96h-44l-51.2 257.6q-6.4 31.2-28.4 50T285.641-211.203q-31.2 0-52.8-21.2T211.241-281.603q0-19.2 11.2-32t28.8-12.8q16 0 26.4 10t10.4 25.2q0 4.8-1.2 10.4t-3.6 11.2q1.6 0.8 2.4 0.8h2.4q8 0 12.4-5.6t6.8-16.8l49.6-246.4h-68.8v-57.6h80l16.8-84.8q6.4-31.2 28.4-50T463.241-748.803q31.2 0 52.8 21.2t21.6 49.2q0 19.2-11.2 32t-28.8 12.8q-16 0-26.4-10T460.841-668.803q0-4.8 1.2-10.4t3.6-11.2q-1.6-0.8-2.4-0.8h-2.4q-8 0-12.4 5.6t-6.8 16.8l-15.2 73.6h130.4v57.6h-23.2l42.4 51.2 42.4-51.2h-23.2v-57.6h153.6v57.6h-55.2L613.641-441.603l80 96h55.2v57.6H595.241v-57.6h23.2l-42.4-51.2-42.4 51.2h23.2v57.6H403.241Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** one provider row: `acme.tools` — Paper drops the call parentheses */
export function CapRow({ fn }: { fn: string }) {
  return (
    <span className="cap__row">
      <FxGlyph />
      <span className="cap__row-name">{fn.replace(/\(\)$/, '')}</span>
    </span>
  );
}

/**
 * A 7K2 capability card for one site. `rows="hidden"` keeps the rows' layout
 * but leaves them to the scene.
 */
export function CapabilityCard({
  site,
  rows = 'shown',
  style,
  className,
  children,
}: {
  site: Site;
  rows?: 'shown' | 'hidden';
  style?: CSSProperties;
  className?: string;
  children?: ReactNode;
}) {
  // up to five rows fit one full-width column (no long name is cut);
  // more split across Paper's two columns, five a column
  const single = site.rows.length <= 5;
  const colA = single ? site.rows : site.rows.slice(0, 5);
  const colB = single ? [] : site.rows.slice(5, 10);
  return (
    <div
      className={`cap${className ? ` ${className}` : ''}`}
      data-site={site.id}
      style={{ ...style, ['--cap-tone' as string]: site.tone }}
    >
      <div className="cap__top">
        <div className="cap__title">
          <span className="cap__count">{capCount(site)}</span>
          <span className="cap__name">{site.brand}</span>
        </div>
        <BrandMark id={site.id} size={site.id === 'youtube' ? 24 : 30} className="cap__logo" />
      </div>
      <div className="cap__foot">
        <div className="cap__cols" data-rows={rows}>
          <span className="cap__col">
            {colA.map((fn) => (
              <CapRow key={fn} fn={fn} />
            ))}
          </span>
          {single ? null : (
            <span className="cap__col">
              {colB.map((fn) => (
                <CapRow key={fn} fn={fn} />
              ))}
            </span>
          )}
        </div>
        <span className="cap__more">{capMore(site)}</span>
      </div>
      {children}
    </div>
  );
}
