import type { ReactNode } from 'react';
import './ReplaySites.css';
import type { Scene, Task } from '../scene/tasks';

/**
 * F1's depicted websites — small recreations of the sites the browser agent
 * works through (Booking.com, Hertz, GEICO then Progressive, Best Buy then
 * Amazon then Costco), so the browser lane reads as a real product rather
 * than a wireframe.
 *
 * Presentational only: every value shown comes from the task in
 * scene/tasks.ts. Site furniture (mastheads, labels, buttons) is each site's
 * own public vocabulary; nothing here is a measured figure.
 *
 * The field or control the agent is working on carries `data-cursor`, which
 * the browser window reads to aim its pointer.
 */

export type Site = 'booking' | 'hertz' | 'geico' | 'progressive' | 'bestbuy' | 'amazon' | 'costco';

const SITE_BY_HOST: Record<string, Site> = {
  'booking.com': 'booking',
  'hertz.com': 'hertz',
  'geico.com': 'geico',
  'progressive.com': 'progressive',
  'bestbuy.com': 'bestbuy',
  'amazon.com': 'amazon',
  'costco.com': 'costco',
};

const siteOf = (task: Task): Site => SITE_BY_HOST[task.url.split('/')[0]] ?? 'booking';

/**
 * Which site the browser is on at step `idx`, following the task's own steps:
 * the TV search moves to amazon.com at "Opening amazon.com" (step 6) and to
 * costco.com at "Opening costco.com" (step 9); the quote moves to
 * progressive.com at "Repeating on progressive.com" (step 10). The first site
 * keeps the task's URL; later sites show their bare domain.
 */
export function activeSite(task: Task, idx: number): { site: Site; host: string; url: string } {
  const first = siteOf(task);
  let host = task.url.split('/')[0];
  if (first === 'bestbuy' && idx >= 8) host = 'costco.com';
  else if (first === 'bestbuy' && idx >= 5) host = 'amazon.com';
  else if (first === 'geico' && idx >= 9) host = 'progressive.com';
  const site = SITE_BY_HOST[host] ?? first;
  return { site, host, url: site === first ? task.url : host };
}

/** The name a task row gives each site's own offer (`"Costco · LG C4 65""`). */
const ROW_NAME: Partial<Record<Site, string>> = {
  hertz: 'Hertz',
  geico: 'Geico',
  progressive: 'Progressive',
  bestbuy: 'Best Buy',
  amazon: 'Amazon',
  costco: 'Costco',
};

const QUOTE_SITES: Site[] = ['geico', 'progressive'];

/* --- favicons ------------------------------------------------------------------ */

/** Real favicons (public/images/replays and public/images/providers, provenance
    in each folder's sources.json); a letter tile only for an unknown host. */
const FAVICONS: Record<string, { src: string } | { letter: string }> = {
  'booking.com': { src: '/images/replays/booking-icon.png' },
  'hyatt.com': { src: '/images/replays/hyatt-icon.png' },
  'expedia.com': { src: '/images/replays/expedia-icon.png' },
  'hertz.com': { src: '/images/replays/hertz-icon.png' },
  'avis.com': { src: '/images/providers/avis.png' },
  'budget.com': { src: '/images/replays/budget-icon.png' },
  'geico.com': { src: '/images/replays/geico-icon.png' },
  'progressive.com': { src: '/images/replays/progressive-icon.png' },
  'statefarm.com': { src: '/images/replays/statefarm-icon.png' },
  'bestbuy.com': { src: '/images/providers/bestbuy.png' },
  'amazon.com': { src: '/images/providers/amazon.png' },
  'costco.com': { src: '/images/providers/costco.png' },
};

export function Favicon({ tab }: { tab: string }) {
  const host = tab.split(' ')[0];
  const icon = FAVICONS[host];
  if (icon && 'src' in icon) return <img className="rs-fav" src={icon.src} alt="" />;
  return (
    <span className="rs-fav rs-fav--letter" data-host={host}>
      {icon ? icon.letter : host.slice(0, 1).toUpperCase()}
    </span>
  );
}

/* --- the page ------------------------------------------------------------------ */

type PageProps = {
  task: Task;
  scene: Scene;
  /** the browser agent's current step */
  idx: number;
  /** progress through the current step, 0..1 */
  fr: number;
};

export function SitePage({ task, scene, idx, fr }: PageProps) {
  const { site } = activeSite(task, idx);
  /* the field the agent is in (forms) and the row it is reading (results),
     both walked through across the step, as before */
  const hot = Math.floor(fr * 4) % 4;
  const pick = Math.min(task.rows.length - 1, Math.floor(fr * task.rows.length));

  let body: ReactNode;
  if (scene === 'load') {
    body = <Loading site={site} />;
  } else if (scene === 'form') {
    body = <Form site={site} task={task} hot={hot} />;
  } else {
    body = <Results site={site} task={task} pick={scene === 'results' ? pick : -1} />;
  }

  return (
    <div className="rs" data-site={site} data-scene={scene}>
      {body}
      {scene === 'results' && (
        <span className="rs-agent">
          <span className="f1__spin" />
          {task.steps[idx]}
        </span>
      )}
      {scene === 'captcha' && <Captcha />}
    </div>
  );
}

/* --- per-site mastheads ----------------------------------------------------------- */

function Mast({ site, task, hot = -1 }: { site: Site; task?: Task; hot?: number }) {
  if (site === 'booking') {
    return (
      <div className="rs-mast">
        <span className="rs-bk-logo">
          Booking<span>.com</span>
        </span>
        <span className="rs-grow" />
        <span className="rs-mast-link">List your property</span>
        <span className="rs-mast-btn">Sign in</span>
      </div>
    );
  }
  if (site === 'hertz') {
    return (
      <div className="rs-mast">
        <span className="rs-hz-logo">Hertz</span>
        <span className="rs-hz-nav">
          <b>Book a car</b>
          <span>Buy a car</span>
        </span>
        <span className="rs-grow" />
        <span className="rs-mast-link">Sign in</span>
      </div>
    );
  }
  if (QUOTE_SITES.includes(site)) {
    return (
      <div className="rs-mast">
        <span className="rs-gc-logo">{site === 'geico' ? 'GEICO' : 'PROGRESSIVE'}</span>
        <span className="rs-gc-nav">
          <span>Insurance</span>
          <span>Claims</span>
          <span>Support</span>
        </span>
        <span className="rs-grow" />
        <span className="rs-mast-link">Log In</span>
      </div>
    );
  }
  /* Retailers: the search lives in the masthead, so the form fills it in */
  return (
    <div className="rs-mast">
      {site === 'amazon' ? (
        <span className="rs-az-logo">amazon</span>
      ) : site === 'costco' ? (
        <span className="rs-co-logo">
          COSTCO
          <small>WHOLESALE</small>
        </span>
      ) : (
        <span className="rs-bb-logo">
          <img src="/images/providers/bestbuy.png" alt="" />
          <b>Best Buy</b>
        </span>
      )}
      {task ? (
        <>
          <Field
            className="rs-bb-search"
            i={0}
            hot={hot}
            value={task.inputs[0][0]}
            trail={
              <span className="rs-bb-go">
                <SearchIcon />
              </span>
            }
          />
          <Field className="rs-bb-zip" i={1} hot={hot} icon={<PinIcon />} value={task.inputs[0][1]} />
        </>
      ) : (
        <>
          <span className="rs-field rs-bb-search rs-skel-field" />
          <span className="rs-grow" />
        </>
      )}
    </div>
  );
}

/* --- loading: the site's shell, content still arriving ------------------------------ */

function Loading({ site }: { site: Site }) {
  return (
    <div className="rs-page">
      <Mast site={site} />
      {site === 'booking' || QUOTE_SITES.includes(site) ? <div className="rs-hero rs-hero--empty" /> : null}
      <div className="rs-skel" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <span className="rs-skel-row" key={i}>
            <span className="rs-skel-media" />
            <span className="rs-skel-lines">
              <i />
              <i />
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* --- forms: the site's own search / quote form, filled with the task's inputs ------- */

function Form({ site, task, hot }: { site: Site; task: Task; hot: number }) {
  const [[a, b], [c, d]] = task.inputs;

  if (site === 'booking') {
    return (
      <div className="rs-page">
        <Mast site={site} />
        <div className="rs-hero">
          <span className="rs-bk-tabs">
            <b>
              <BedIcon />
              Stays
            </b>
            <span>Flights</span>
            <span>Car rentals</span>
          </span>
          <strong>Find your next stay</strong>
        </div>
        <div className="rs-bk-bar">
          <Field className="rs-wide" i={0} hot={hot} icon={<BedIcon />} value={a} />
          <Field i={1} hot={hot} icon={<PersonIcon />} value={b} />
          <Field i={2} hot={hot} icon={<CalendarIcon />} value={c} />
          <Field i={3} hot={hot} icon={<CalendarIcon />} value={d} />
          <span className="rs-btn rs-btn--primary">{task.btn}</span>
        </div>
      </div>
    );
  }

  if (site === 'hertz') {
    return (
      <div className="rs-page">
        <Mast site={site} />
        <div className="rs-hz-form">
          <strong>Book your Hertz car rental</strong>
          <div className="rs-row">
            <Field className="rs-wide" i={0} hot={hot} icon={<PinIcon />} label="Pickup & Drop-Off Location" value={a} />
            <Field i={1} hot={hot} icon={<CarIcon />} label="Vehicle type" value={b} />
          </div>
          <span className="rs-toggle">
            <i />
            Return to same location
          </span>
          <div className="rs-row">
            <Field i={2} hot={hot} icon={<CalendarIcon />} label="Pickup date" value={c} />
            <Field i={3} hot={hot} icon={<CalendarIcon />} label="Drop-off date" value={d} />
            <span className="rs-btn rs-btn--primary">{task.btn}</span>
          </div>
        </div>
      </div>
    );
  }

  if (QUOTE_SITES.includes(site)) {
    return (
      <div className="rs-page">
        <Mast site={site} />
        <div className="rs-hero rs-gc-hero">
          {site === 'geico' && <img className="rs-gc-gecko" src="/images/replays/geico-gecko.png" alt="" />}
          <strong>{site === 'geico' ? 'Get a quote today' : 'Get an auto quote'}</strong>
          <span className="rs-gc-products">
            <b>
              <CarIcon />
              Auto
            </b>
            <span>Homeowners</span>
            <span>Renters</span>
          </span>
        </div>
        <div className="rs-gc-card">
          <span className="rs-gc-step">
            <span>Vehicle details</span>
            <span className="rs-gc-progress">
              {[0, 1, 2, 3].map((i) => (
                <i key={i} data-on={i <= hot ? '1' : '0'} />
              ))}
            </span>
          </span>
          <div className="rs-row">
            <Field className="rs-wide" i={0} hot={hot} label="Vehicle" value={a} />
            <Field i={1} hot={hot} label="ZIP code" value={b} />
          </div>
          <div className="rs-row">
            <Field i={2} hot={hot} label="Coverage" value={c} />
            <Field i={3} hot={hot} label="Drivers" value={d} />
            <span className="rs-btn rs-btn--primary">{task.btn}</span>
          </div>
        </div>
      </div>
    );
  }

  /* retailers: query and store in the masthead, sort and stock as filters */
  return (
    <div className="rs-page">
      <Mast site={site} task={task} hot={hot} />
      <div className="rs-bb-bar">
        <Field className="rs-bb-select" i={2} hot={hot} value={c} trail={<ChevronIcon />} />
        <Field className="rs-bb-chip" i={3} hot={hot} icon={<CheckIcon />} value={d} />
        <span className="rs-grow" />
        <span className="rs-btn rs-btn--primary">{task.btn}</span>
      </div>
      <div className="rs-skel rs-skel--grid" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <span className="rs-skel-row" key={i}>
            <span className="rs-skel-media" />
            <span className="rs-skel-lines">
              <i />
              <i />
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* --- results: the site's listing, with the task's rows ------------------------------ */

/** Local hotel photographs; provenance is in images/stays and images/replays. */
const STAY_PHOTOS: Record<string, string> = {
  'Hyatt Place Kyoto': '/images/stays/hyatt-place-kyoto.jpg',
  'Hotel Granvia Kyoto': '/images/replays/granvia-kyoto.jpg',
  'Hyatt Regency Kyoto': '/images/stays/regency-kyoto-room.jpg',
};
const STAY_FALLBACK = '/images/stays/hotel-garden.jpg';

/** Only models with their own photo (public/images/replays/sources.json); the
    rest keep the drawn sedan rather than borrow another model's picture. */
const CAR_PHOTOS: Record<string, string> = {
  Corolla: '/images/replays/corolla.png',
};

function Results({ site, task, pick }: { site: Site; task: Task; pick: number }) {
  const [[a, b], [c, d]] = task.inputs;
  const rows = task.rows.map((r) => ({ parts: r[0].split(' · '), price: r[1] }));
  /* A site only lists its own offer; the rival offers stay in the Bowmark
     chat, where they were compared. Booking.com legitimately lists every hotel. */
  const own = rows.find((r) => r.parts[0] === ROW_NAME[site]);
  const aim = pick >= 0;

  if (site === 'booking') {
    return (
      <div className="rs-page">
        <Mast site={site} />
        <div className="rs-strip">
          <span>
            <BedIcon />
            {a}
          </span>
          <span>
            <CalendarIcon />
            {c.replace('Check-in ', '')} — {d.replace('Check-out ', '')}
          </span>
          <span>
            <PersonIcon />
            {b}
          </span>
          <span className="rs-btn rs-btn--primary">Search</span>
        </div>
        <div className="rs-list">
          {rows.map(({ parts: [name, area, rating], price }, i) => (
            <div className="rs-card" key={name}>
              <img className="rs-card-photo" src={STAY_PHOTOS[name] ?? STAY_FALLBACK} alt="" />
              <span className="rs-card-main">
                <b className="rs-card-name">{name}</b>
                <span className="rs-card-meta">
                  <PinIcon />
                  {area}, Kyoto
                </span>
              </span>
              <span className="rs-card-side">
                <span className="rs-bk-score">{rating?.replace('★', '')}</span>
                <b className="rs-card-price">{price}</b>
                <span className="rs-card-cap">per night</span>
                <span className="rs-btn rs-btn--primary" data-cursor={pick === i ? '1' : undefined}>
                  See availability
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (site === 'hertz') {
    return (
      <div className="rs-page">
        <Mast site={site} />
        <div className="rs-strip">
          <span>
            <PinIcon />
            {a}
          </span>
          <span>
            <CalendarIcon />
            {c} — {d}
          </span>
          <span>
            <CarIcon />
            {b}
          </span>
        </div>
        {own && (
          <Detail
            media={
              <span className="rs-hz-car">
                {CAR_PHOTOS[own.parts[1]] ? <img src={CAR_PHOTOS[own.parts[1]]} alt="" /> : <CarArt />}
              </span>
            }
            kicker={b}
            name={`${own.parts[1]} or similar`}
            meta={`${own.parts[0]} · ${own.parts[2]}`}
            price={own.price}
            per="total"
            cta="Select"
            aim={aim}
          />
        )}
      </div>
    );
  }

  if (QUOTE_SITES.includes(site)) {
    return (
      <div className="rs-page">
        <Mast site={site} />
        <div className="rs-strip">
          <span>
            <CarIcon />
            {a}
          </span>
          <span>{c}</span>
          <span>{d}</span>
        </div>
        {own && (
          <Detail
            kicker="Your auto quote"
            name={a}
            meta={`${own.parts[1]} · ${d}`}
            price={own.price}
            cta="Continue"
            aim={aim}
          />
        )}
      </div>
    );
  }

  return (
    <div className="rs-page">
      <Mast site={site} task={task} />
      <div className="rs-bb-bar">
        <span className="rs-bb-count">Results for “{a}”</span>
        <span className="rs-grow" />
        <span className="rs-field rs-bb-select">
          <span className="rs-field-text">
            <span>{c}</span>
          </span>
          <ChevronIcon />
        </span>
        <span className="rs-field rs-bb-chip" data-on="1">
          <CheckIcon />
          <span className="rs-field-text">
            <span>{d}</span>
          </span>
        </span>
      </div>
      {own && (
        <Detail
          media={
            <span className="rs-bb-tv">
              <img src="/images/replays/lg-c4.webp" alt="" />
            </span>
          }
          kicker="TVs › OLED TVs"
          name={`${own.parts[1]} OLED TV`}
          stars
          meta={`Sold by ${own.parts[0]}`}
          price={own.price}
          cta="Add to cart"
          aim={aim}
        />
      )}
    </div>
  );
}

/** One listing on its own site: a large product shot beside the details. */
function Detail({
  media,
  kicker,
  name,
  stars,
  meta,
  price,
  per,
  cta,
  aim,
}: {
  media?: ReactNode;
  kicker: string;
  name: string;
  stars?: boolean;
  meta: string;
  price: string;
  per?: string;
  cta: string;
  /** whether the agent's pointer is on this listing's action */
  aim: boolean;
}) {
  return (
    <div className="rs-detail" data-media={media ? '1' : '0'}>
      {media && <span className="rs-detail-media">{media}</span>}
      <span className="rs-detail-info">
        <i className="rs-detail-kicker">{kicker}</i>
        <b className="rs-detail-name">{name}</b>
        {stars && (
          <span className="rs-bb-stars" aria-hidden="true">
            ★★★★★
          </span>
        )}
        <span className="rs-card-meta">{meta}</span>
        <span className="rs-detail-price">
          <b>{price}</b>
          {per && <span className="rs-card-cap">{per}</span>}
        </span>
        <span className="rs-btn rs-btn--primary" data-cursor={aim ? '1' : undefined}>
          {cta}
        </span>
      </span>
    </div>
  );
}

/* --- the challenge, over the page it interrupted ------------------------------------ */

function Captcha() {
  return (
    <div className="rs-modal">
      <div className="rs-modal-card">
        <b>Verify you’re human</b>
        <span className="rs-check" data-cursor="1">
          <i />
          I’m not a robot
          <span className="rs-grow" />
          <ShieldIcon />
        </span>
        <span className="rs-modal-fine">Privacy · Terms</span>
      </div>
    </div>
  );
}

/* --- pieces -------------------------------------------------------------------------- */

function Field({
  i,
  hot,
  label,
  value,
  icon,
  trail,
  className,
}: {
  i: number;
  hot: number;
  label?: string;
  value: string;
  icon?: ReactNode;
  trail?: ReactNode;
  className?: string;
}) {
  const on = hot === i;
  return (
    <span
      className={`rs-field${className ? ` ${className}` : ''}`}
      data-hot={on ? '1' : '0'}
      data-cursor={on ? '1' : undefined}
    >
      {icon}
      <span className="rs-field-text">
        {label && <i>{label}</i>}
        <span>{value}</span>
      </span>
      {trail}
    </span>
  );
}

/** a mid-size sedan in profile, for the rental cards */
function CarArt() {
  return (
    <svg viewBox="0 0 64 26" aria-hidden="true" focusable="false">
      <path
        className="rs-car-body"
        d="M3 18.5c0-2.3 1.4-3.9 3.6-4.3l8.2-1.6 7.3-5.4A8 8 0 0 1 26.8 5.6h11.6a8 8 0 0 1 5.3 2l5.6 5 7.2 1.2c2.6.5 4.5 2.4 4.5 4.8V21H3z"
      />
      <path className="rs-car-glass" d="M18.5 12.6l5.2-4a5 5 0 0 1 3.1-1h5.4v5zM34.2 7.6h4.3a5 5 0 0 1 3.4 1.3l3.8 3.7H34.2z" />
      <circle className="rs-car-tyre" cx="15.5" cy="20.5" r="4.2" />
      <circle className="rs-car-tyre" cx="48.5" cy="20.5" r="4.2" />
      <circle className="rs-car-hub" cx="15.5" cy="20.5" r="1.7" />
      <circle className="rs-car-hub" cx="48.5" cy="20.5" r="1.7" />
    </svg>
  );
}

const Svg = ({ children }: { children: ReactNode }) => (
  <svg className="rs-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    {children}
  </svg>
);

const SearchIcon = () => (
  <Svg>
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3.5-3.5" />
  </Svg>
);
const PinIcon = () => (
  <Svg>
    <path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z" />
    <circle cx="12" cy="9.5" r="2.5" />
  </Svg>
);
const BedIcon = () => (
  <Svg>
    <path d="M3 18V6M3 14h18v4M21 14v-2a3 3 0 0 0-3-3h-7v5" />
    <circle cx="7" cy="11" r="1.6" />
  </Svg>
);
const CalendarIcon = () => (
  <Svg>
    <rect x="4" y="5" width="16" height="15" rx="2" />
    <path d="M4 10h16M9 3v4M15 3v4" />
  </Svg>
);
const PersonIcon = () => (
  <Svg>
    <circle cx="12" cy="8" r="3.5" />
    <path d="M5 20a7 7 0 0 1 14 0" />
  </Svg>
);
const CarIcon = () => (
  <Svg>
    <path d="M5 16V12l2-5h10l2 5v4M5 16h14M5 16v2M19 16v2M4 12h16" />
    <circle cx="8" cy="14" r=".5" />
    <circle cx="16" cy="14" r=".5" />
  </Svg>
);
const ChevronIcon = () => (
  <Svg>
    <path d="M7 10l5 5 5-5" />
  </Svg>
);
const CheckIcon = () => (
  <Svg>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </Svg>
);
const ShieldIcon = () => (
  <Svg>
    <path d="M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6z" />
    <path d="M9 12l2 2 4-4" />
  </Svg>
);
