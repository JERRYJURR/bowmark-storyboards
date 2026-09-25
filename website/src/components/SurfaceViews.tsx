import './SurfaceViews.css';
import { SURFACE_HEADS, WINDOW_DOMAINS, WINDOW_METHODS } from '../scene/content';
import {
  AIRLINES,
  API_META,
  API_RESPONSE,
  FLIGHTS,
  ROUTE,
  SDK_SOURCE,
  TOOLS,
  TOOL_COUNTS,
} from '../scene/demo-data';

/**
 * The five surfaces of one provider, as small but real product interfaces.
 *
 * v5 decides the cast and the labels: `surface` is its surface index
 * (0 MCPs · 1 APIs · 2 CLIs · 3 SDKs · 4 Websites) and `slot` its window
 * (0 acmeair · 1 united · 2 delta), whose header string comes from v5's
 * HEAD3. Everything inside is demo data for the flights task.
 *
 * `back` renders the quieter, trimmed variant used for the two panes behind
 * the dominant one.
 */
export default function SurfaceView({
  surface,
  slot,
  back = false,
}: {
  surface: number;
  slot: number;
  back?: boolean;
}) {
  const head = SURFACE_HEADS[surface][slot];
  const airline = AIRLINES[slot];

  if (surface === 4) return <SiteView head={head} slot={slot} back={back} />;
  if (surface === 1) return <ApiView head={head} slot={slot} back={back} />;
  if (surface === 2) return <CliView head={head} slot={slot} back={back} />;
  if (surface === 3) return <SdkView head={head} slot={slot} back={back} />;
  return <McpView head={head} slot={slot} back={back} airlineCode={airline.code} />;
}

/* --- route glyph ------------------------------------------------------------ */

function RouteGlyph() {
  return (
    <svg className="sv__route" viewBox="0 0 34 8" aria-hidden="true" focusable="false">
      <circle cx="2.5" cy="4" r="2" fill="none" stroke="currentColor" strokeWidth="1" />
      <path d="M5.6 4h22.2" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2.2" />
      <path d="M27 1.4 30.8 4 27 6.6z" fill="currentColor" />
    </svg>
  );
}

/* --- Websites ---------------------------------------------------------------- */

function SiteView({ head, slot, back }: { head: string; slot: number; back: boolean }) {
  const airline = AIRLINES[slot];
  const flights = FLIGHTS[slot].slice(0, back ? 2 : 3);

  return (
    <div className="sv sv--site">
      <div className="sv__chrome">
        <span className="sv__dot" />
        <span className="sv__dot" />
        <span className="sv__addr">
          <svg viewBox="0 0 8 9" width="7" height="8" aria-hidden="true" focusable="false">
            <rect x="0.6" y="3.6" width="6.8" height="4.8" rx="1.2" fill="currentColor" opacity=".6" />
            <path d="M2.4 3.6V2.4a1.6 1.6 0 0 1 3.2 0v1.2" fill="none" stroke="currentColor" strokeWidth="1" />
          </svg>
          {head}/flights
        </span>
      </div>

      {!back && (
        <div className="sv__searchbar">
          <span className="sv__field sv__field--route">
            <b>{ROUTE.from}</b>
            <RouteGlyph />
            <b>{ROUTE.to}</b>
          </span>
          <span className="sv__field">{ROUTE.date}</span>
          <span className="sv__field sv__field--pax">{ROUTE.pax}</span>
          <span className="sv__go">Search</span>
        </div>
      )}

      <div className="sv__rows">
        {flights.map((f, i) => (
          <div key={f.no} className="sv__row" data-selected={!back && i === 0 ? '1' : '0'}>
            <span className="sv__badge" data-tint={airline.tint}>
              {airline.code}
            </span>
            <span className="sv__times">
              {f.dep} <span className="sv__arrow">→</span> {f.arr}
            </span>
            <span className="sv__dur">{f.dur}</span>
            {!back && <span className="sv__stops">{f.stops}</span>}
            <span className="sv__fare">{f.fare}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* --- APIs -------------------------------------------------------------------- */

function ApiView({ head, slot, back }: { head: string; slot: number; back: boolean }) {
  const [method, path] = head.split(' ');
  const meta = API_META[slot];
  const lines = API_RESPONSE[slot].slice(0, back ? 4 : undefined);

  return (
    <div className="sv sv--api">
      <div className="sv__chrome sv__chrome--api">
        <span className="sv__method" data-method={method}>
          {method}
        </span>
        <span className="sv__path">
          {path}
          {!back && slot === 0 && <span className="sv__query">?from=SFO&amp;to=JFK</span>}
        </span>
        <span className="sv__status">{meta.status}</span>
        {!back && <span className="sv__ms">{meta.ms}</span>}
      </div>

      <div className="sv__json">
        {lines.map((line, i) => (
          <div key={i} className="sv__code-line">
            {line.map((tok, k) => (
              <span key={k} className={`sv__t sv__t--${tok.c}`}>
                {tok.t}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* --- CLIs -------------------------------------------------------------------- */

function CliView({ head, slot, back }: { head: string; slot: number; back: boolean }) {
  const flights = FLIGHTS[slot].slice(0, back ? 2 : 3);
  const args = ` --from ${ROUTE.from} --to ${ROUTE.to}`;

  return (
    <div className="sv sv--cli">
      <div className="sv__chrome sv__chrome--cli">
        <span className="sv__dot" />
        <span className="sv__dot" />
        <span className="sv__title">{WINDOW_DOMAINS[slot]}</span>
      </div>

      <div className="sv__term">
        <div className="sv__term-line">
          <span className="sv__gutter" />
          <span className="sv__cmd">
            {head}
            {!back && <span className="sv__args">{args}</span>}
          </span>
        </div>

        {flights.map((f) => (
          <div key={f.no} className="sv__term-line" data-out="1">
            <span className="sv__gutter" />
            <span className="sv__out">
              <span className="sv__out-no">{f.no}</span>
              <span className="sv__out-time">
                {f.dep}–{f.arr}
              </span>
              {!back && <span className="sv__out-dur">{f.dur}</span>}
              <span className="sv__out-fare">{f.fare}</span>
            </span>
          </div>
        ))}

        {!back && (
          <div className="sv__term-line" data-status="1">
            <span className="sv__gutter" />
            <span className="sv__ok">✓</span>
            <span className="sv__meta">{flights.length} results · 0.42s</span>
          </div>
        )}

        <div className="sv__term-line">
          <span className="sv__gutter" />
          <span className="sv__prompt">$</span>
          <span className="sv__caret" />
        </div>
      </div>
    </div>
  );
}

/* --- SDKs -------------------------------------------------------------------- */

function SdkView({ head, slot, back }: { head: string; slot: number; back: boolean }) {
  const lines = SDK_SOURCE(head, WINDOW_METHODS[slot]).slice(0, back ? 5 : undefined);

  return (
    <div className="sv sv--sdk">
      <div className="sv__chrome sv__chrome--sdk">
        <span className="sv__tab">
          <span className="sv__ts">TS</span>
          {head}
        </span>
        <span className="sv__tab sv__tab--ghost">index.ts</span>
      </div>

      <div className="sv__editor">
        {lines.map((line, i) => (
          <div key={i} className="sv__code-line" data-focus={i === 2 ? '1' : '0'}>
            <span className="sv__ln">{i + 1}</span>
            <span className="sv__code-text">
              {line.map((tok, k) => (
                <span key={k} className={`sv__t sv__t--${tok.c}`}>
                  {tok.t}
                </span>
              ))}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* --- MCPs -------------------------------------------------------------------- */

function McpView({
  head,
  slot,
  back,
  airlineCode,
}: {
  head: string;
  slot: number;
  back: boolean;
  airlineCode: string;
}) {
  const all = TOOLS[slot];
  const tools = all.slice(0, back ? 2 : 4);
  const hidden = TOOL_COUNTS[slot] - tools.length;

  return (
    <div className="sv sv--mcp">
      <div className="sv__chrome sv__chrome--mcp">
        <span className="sv__server">
          <span className="sv__badge" data-tint={AIRLINES[slot].tint}>
            {airlineCode}
          </span>
          {WINDOW_DOMAINS[slot]}
        </span>
        <span className="sv__chip">{head}</span>
      </div>

      <div className="sv__tools">
        {tools.map((t) => (
          <div key={t.name} className="sv__tool">
            <span className="sv__tool-glyph" aria-hidden="true">
              <svg viewBox="0 0 10 10" width="8" height="8" focusable="false">
                <path
                  d="M3.4 1.2 1.2 3.4l2.2 2.2M6.6 8.8 8.8 6.6 6.6 4.4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className="sv__tool-name">{t.name}</span>
            <span className="sv__tool-sig">
              <span className="sv__t--punc">{t.args}</span>
              <span className="sv__tool-arrow">→</span>
              <span className="sv__tool-ret">{t.ret}</span>
            </span>
          </div>
        ))}
        {!back && hidden > 0 && <div className="sv__tool-more">+ {hidden} more</div>}
      </div>
    </div>
  );
}
