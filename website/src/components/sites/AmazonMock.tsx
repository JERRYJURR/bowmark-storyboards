import './AmazonMock.css';
import { LOGO_SRC } from './logos';

/**
 * Hi-fi thumbnail of amazon.com desktop search results (grid view) for
 * "carry on luggage" — packing for the Kyoto trip. The page is authored at
 * natural UI size and scaled down (see .sm-amz__page); the panel shows its
 * top-left, the card's fades take care of the rest. Static: no state, no
 * network. Product photos: public/images/sites/amazon (see sources.json).
 */

const IMG = '/images/sites/amazon';

type Product = {
  img: string;
  title: string;
  rating: string;
  stars: number; // in halves: 9 = 4.5 stars
  count: string;
  bought: string;
  whole: string;
  cents: string;
  list: string;
  delivery: string;
  badge?: 'best' | 'choice';
  sponsored?: boolean;
  deal?: string;
};

const PRODUCTS: Product[] = [
  {
    img: `${IMG}/carry-on-aluminum-frame.jpg`,
    title: 'Carry-On Luggage 21" Aluminum Frame Hardside Spinner Suitcase with TSA Lock, Airline Approved, Graphite',
    rating: '4.6',
    stars: 9,
    count: '8,214',
    bought: '2K+ bought in past month',
    whole: '129',
    cents: '99',
    list: '$179.99',
    delivery: 'Fri, Nov 6',
  },
  {
    img: `${IMG}/carry-on-spinner-graphite.jpg`,
    title: 'Hardside Carry On Suitcase 22x14x9 with Spinner Wheels, Lightweight Expandable Luggage, Airline Approved, Dark Gray',
    rating: '4.5',
    stars: 9,
    count: '21,436',
    bought: '5K+ bought in past month',
    whole: '69',
    cents: '99',
    list: '$99.99',
    delivery: 'Thu, Nov 5',
    badge: 'best',
    deal: 'Limited time deal',
  },
  {
    img: `${IMG}/carry-on-side.jpg`,
    title: 'Aluminum Carry On Luggage with Front Pocket, 21 Inch Hard Shell Suitcase, Double Spinner Wheels, Silver Black',
    rating: '4.4',
    stars: 9,
    count: '3,127',
    bought: '1K+ bought in past month',
    whole: '189',
    cents: '95',
    list: '$229.99',
    delivery: 'Sat, Nov 7',
    badge: 'choice',
    sponsored: true,
  },
];

const SUBNAV = ["Today's Deals", 'Prime Video', 'Registry', 'Gift Cards', 'Customer Service', 'Sell'];

/* --- icons (drawn at natural size; the page scale shrinks them) ------------ */

function PinIcon() {
  return (
    <svg className="sm-amz__pin" width="15" height="19" viewBox="0 0 15 19" aria-hidden="true">
      <path
        d="M7.5 1.2a5.9 5.9 0 0 0-5.9 5.9c0 4.3 5.9 10.6 5.9 10.6s5.9-6.3 5.9-10.6a5.9 5.9 0 0 0-5.9-5.9z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <circle cx="7.5" cy="7.1" r="2.1" fill="none" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

function Caret({ className }: { className?: string }) {
  return (
    <svg className={`sm-amz__caret${className ? ` ${className}` : ''}`} width="8" height="5" viewBox="0 0 8 5" aria-hidden="true">
      <path d="M0 0h8L4 5z" fill="currentColor" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
      <circle cx="9.2" cy="9.2" r="6.4" fill="none" stroke="#333" strokeWidth="2.6" />
      <path d="M14 14l5.6 5.6" stroke="#333" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function FlagUS() {
  const h = 14 / 13; // 13 stripes, 7 red
  return (
    <svg className="sm-amz__flag" width="21" height="14" viewBox="0 0 21 14" aria-hidden="true">
      <rect width="21" height="14" fill="#fff" />
      {[0, 1, 2, 3, 4, 5, 6].map((k) => (
        <rect key={k} y={k * 2 * h} width="21" height={h} fill="#c8102e" />
      ))}
      <rect width="9.4" height={7 * h} fill="#1d3f8f" />
    </svg>
  );
}

function CartIcon({ count }: { count: number }) {
  return (
    <span className="sm-amz__cart-icon">
      <svg width="40" height="30" viewBox="0 0 40 30" aria-hidden="true">
        <path
          d="M1.8 5.2h4.6l4.9 15.4h20.4L36.6 9"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="13.6" cy="25.6" r="2.3" fill="currentColor" />
        <circle cx="28.4" cy="25.6" r="2.3" fill="currentColor" />
      </svg>
      <span className="sm-amz__cart-count">{count}</span>
    </span>
  );
}

function Hamburger() {
  return (
    <svg className="sm-amz__burger" width="20" height="16" viewBox="0 0 20 16" aria-hidden="true">
      <path d="M1 2h18M1 8h18M1 14h18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

/** Rufus: the assistant pill in the sub-nav (two orange + blue blobs) */
function RufusMark() {
  return (
    <svg width="17" height="15" viewBox="0 0 17 15" aria-hidden="true">
      <rect x="0.5" y="1" width="9" height="9" rx="4.5" fill="#ff6200" />
      <rect x="5" y="6.4" width="7.4" height="7.4" rx="3.7" fill="#1e8bff" />
      <path d="M13.8 1.2l.8 1.8 1.8.8-1.8.8-.8 1.8-.8-1.8-1.8-.8 1.8-.8z" fill="#1e8bff" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg className="sm-amz__info" width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
      <circle cx="6" cy="6" r="6" fill="#949494" />
      <rect x="5.1" y="5" width="1.8" height="4.3" rx="0.6" fill="#fff" />
      <circle cx="6" cy="3.3" r="1" fill="#fff" />
    </svg>
  );
}

const STAR = 'M8 .9l2.15 4.5 4.95.62-3.63 3.42.93 4.9L8 11.93l-4.4 2.41.93-4.9L.9 6.02l4.95-.62z';
const STAR_LEFT = 'M8 .9L5.85 5.4.9 6.02l3.63 3.42-.93 4.9L8 11.93z';

/** five stars; `halves` = rating in half-stars */
function Stars({ halves }: { halves: number }) {
  return (
    <svg className="sm-amz__stars" width="76" height="15" viewBox="0 0 80 16" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => {
        const full = halves >= (i + 1) * 2;
        const half = !full && halves === i * 2 + 1;
        return (
          <g key={i} transform={`translate(${i * 16} 0)`}>
            <path d={STAR} fill={full ? 'currentColor' : '#fff'} stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
            {half && <path d={STAR_LEFT} fill="currentColor" />}
          </g>
        );
      })}
    </svg>
  );
}

function ChevronDown() {
  return (
    <svg className="sm-amz__chev" width="12" height="8" viewBox="0 0 12 8" aria-hidden="true">
      <path d="M1.5 1.8L6 6.2l4.5-4.4" fill="none" stroke="#0f1111" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** the ✓prime badge: orange check, "prime" lettering drawn as strokes */
function PrimeBadge() {
  return (
    <svg className="sm-amz__prime" width="53" height="17" viewBox="0 0 53 17" aria-hidden="true">
      <path d="M1.6 8.6l3.1 3.5L10.4 3.4" fill="none" stroke="#f47a1f" strokeWidth="2.7" strokeLinecap="round" strokeLinejoin="round" />
      <g fill="none" stroke="#1a82f0" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
        {/* p */}
        <path d="M13.6 4.6v11.2" />
        <path d="M13.6 8.2c0-2 1.5-3.6 3.4-3.6s3.3 1.6 3.3 3.6-1.4 3.6-3.3 3.6-3.4-1.6-3.4-3.6z" />
        {/* r */}
        <path d="M23.6 4.6v7.2M23.6 7.6c.5-2 1.9-3 3.6-3" />
        {/* i */}
        <path d="M29.6 4.8v7" />
        {/* m */}
        <path d="M33 11.8V4.6M33 7.3c0-1.7.9-2.7 2.2-2.7s2.1 1 2.1 2.7v4.5M37.3 7.3c0-1.7.9-2.7 2.2-2.7s2.1 1 2.1 2.7v4.5" />
        {/* e */}
        <path d="M44.6 8.3h6.2c0-2.2-1.3-3.7-3.1-3.7s-3.2 1.6-3.2 3.6 1.4 3.6 3.3 3.6c1 0 1.9-.4 2.5-1" />
      </g>
      <circle cx="29.6" cy="1.9" r="1.35" fill="#1a82f0" />
    </svg>
  );
}

/* --- page ------------------------------------------------------------------ */

function Card({ p }: { p: Product }) {
  return (
    <article className="sm-amz__card">
      <div className="sm-amz__tile">
        <img className="sm-amz__photo" src={p.img} alt="" />
        {p.badge === 'best' && <span className="sm-amz__badge sm-amz__badge--best">Best Seller</span>}
        {p.badge === 'choice' && (
          <span className="sm-amz__badge sm-amz__badge--choice">
            Amazon's <span className="sm-amz__badge-accent">Choice</span>
          </span>
        )}
      </div>
      <div className="sm-amz__body">
        {p.sponsored && (
          <div className="sm-amz__sponsored">
            Sponsored <InfoIcon />
          </div>
        )}
        <h3 className="sm-amz__title">{p.title}</h3>
        <div className="sm-amz__rating">
          <span className="sm-amz__rating-num">{p.rating}</span>
          <Stars halves={p.stars} />
          <ChevronDown />
          <span className="sm-amz__rating-count">({p.count})</span>
        </div>
        <div className="sm-amz__bought">{p.bought}</div>
        {p.deal && <span className="sm-amz__deal">{p.deal}</span>}
        <div className="sm-amz__price">
          <span className="sm-amz__price-sym">$</span>
          <span className="sm-amz__price-whole">{p.whole}</span>
          <span className="sm-amz__price-frac">{p.cents}</span>
        </div>
        <div className="sm-amz__list">
          List: <s>{p.list}</s>
        </div>
        <PrimeBadge />
        <div className="sm-amz__delivery">
          FREE delivery <b>{p.delivery}</b>
        </div>
        <span className="sm-amz__atc">Add to cart</span>
      </div>
    </article>
  );
}

export default function AmazonMock() {
  return (
    <div className="sm-amz" aria-hidden="true">
      <div className="sm-amz__page">
        {/* nav belt */}
        <header className="sm-amz__belt">
          <span className="sm-amz__logo">
            <img src={LOGO_SRC.amazonWhite} alt="" />
          </span>
          <span className="sm-amz__deliver sm-amz__navlink">
            <PinIcon />
            <span className="sm-amz__stack">
              <span className="sm-amz__line1">Deliver to</span>
              <span className="sm-amz__line2">Kyoto 604-8141</span>
            </span>
          </span>
          <div className="sm-amz__search">
            <span className="sm-amz__dept">
              All <Caret />
            </span>
            <span className="sm-amz__query">carry on luggage</span>
            <span className="sm-amz__go">
              <SearchIcon />
            </span>
          </div>
          <span className="sm-amz__lang sm-amz__navlink">
            <FlagUS />
            <b>EN</b>
            <Caret className="sm-amz__caret--grey" />
          </span>
          <span className="sm-amz__navlink sm-amz__stack">
            <span className="sm-amz__line1">Hello, sign in</span>
            <span className="sm-amz__line2">
              Account &amp; Lists <Caret className="sm-amz__caret--grey" />
            </span>
          </span>
          <span className="sm-amz__navlink sm-amz__stack">
            <span className="sm-amz__line1">Returns</span>
            <span className="sm-amz__line2">&amp; Orders</span>
          </span>
          <span className="sm-amz__navlink sm-amz__cart">
            <CartIcon count={2} />
            <span className="sm-amz__line2">Cart</span>
          </span>
        </header>

        {/* sub-nav */}
        <nav className="sm-amz__subnav">
          <span className="sm-amz__sublink sm-amz__sublink--all">
            <Hamburger />
            All
          </span>
          <span className="sm-amz__rufus">
            <RufusMark />
            Rufus
          </span>
          {SUBNAV.map((s) => (
            <span key={s} className="sm-amz__sublink">
              {s}
            </span>
          ))}
        </nav>

        {/* result info bar */}
        <div className="sm-amz__bar">
          <span>
            1-48 of over 3,000 results for <span className="sm-amz__term">"carry on luggage"</span>
          </span>
          <span className="sm-amz__sort">
            Sort by: <span>Featured</span> <ChevronDown />
          </span>
        </div>

        {/* grid */}
        <main className="sm-amz__grid">
          {PRODUCTS.map((p) => (
            <Card key={p.img} p={p} />
          ))}
        </main>
      </div>
    </div>
  );
}
