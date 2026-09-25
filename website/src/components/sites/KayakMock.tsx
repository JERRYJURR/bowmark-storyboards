import './KayakMock.css';
import { LOGO_SRC } from './logos';

/**
 * KAYAK Stays results, desktop — a static, zoomed-out "screenshot" for the
 * 322 x 266 site-card panel. The page is authored at natural UI size (540 px
 * wide) and scaled down; the card's fades leave the top-left readable, so the
 * logo, the search form and the first result sit there.
 *
 * The first result (Hyatt Place Kyoto, $184) is the one the later scene
 * returns — keep the copy in step with it.
 */

type Deal = { name: string; mark: 'agoda' | 'hotels' | 'trip' | 'priceline' | 'expedia' | 'booking'; price: string; more?: string };

type Stay = {
  name: string;
  area: string;
  score: string;
  label: string;
  reviews: string;
  photo: string;
  focus: string;
  provider: Deal['mark'];
  providerName: string;
  price: string;
  total: string;
  deals: Deal[];
  perk?: string;
};

const STAYS: Stay[] = [
  {
    name: 'Hyatt Place Kyoto',
    area: 'Shimogyo Ward',
    score: '8.8',
    label: 'Excellent',
    reviews: '(2,345 reviews)',
    photo: '/images/stays/hyatt-place-kyoto.jpg',
    focus: '30% 50%',
    provider: 'booking',
    providerName: 'Booking.com',
    price: '$184',
    total: '$552 total',
    perk: 'Free cancellation',
    deals: [
      { name: 'agoda', mark: 'agoda', price: '$189' },
      { name: 'Hotels.com', mark: 'hotels', price: '$192' },
      { name: 'Trip.com', mark: 'trip', price: '$196', more: 'and 3 more' },
    ],
  },
  {
    name: 'Hotel Granvia Kyoto',
    area: 'Kyoto Station',
    score: '8.6',
    label: 'Excellent',
    reviews: '(6,412 reviews)',
    photo: '/images/sites/kayak/granvia-kyoto-double.jpg',
    focus: '45% 50%',
    provider: 'expedia',
    providerName: 'Expedia',
    price: '$231',
    total: '$693 total',
    deals: [
      { name: 'priceline', mark: 'priceline', price: '$234' },
      { name: 'Hotels.com', mark: 'hotels', price: '$238' },
      { name: 'Booking.com', mark: 'booking', price: '$241', more: 'and 2 more' },
    ],
  },
  {
    name: 'Park Hyatt Kyoto',
    area: 'Higashiyama',
    score: '9.4',
    label: 'Excellent',
    reviews: '(1,108 reviews)',
    photo: '/images/stays/park-kyoto-exterior.jpg',
    focus: '55% 60%',
    provider: 'booking',
    providerName: 'Booking.com',
    price: '$612',
    total: '$1,836 total',
    deals: [
      { name: 'Expedia', mark: 'expedia', price: '$618' },
      { name: 'Hotels.com', mark: 'hotels', price: '$624' },
      { name: 'agoda', mark: 'agoda', price: '$631', more: 'and 1 more' },
    ],
  },
];

/* --- icons (24 x 24 unless noted) ---------------------------------------- */

const I = {
  menu: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 6h18M3 12h18M3 18h18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  heart: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 20.6 10.6 19.3C5.6 14.8 2.4 11.9 2.4 8.3 2.4 5.4 4.7 3.1 7.6 3.1c1.7 0 3.3.8 4.4 2 1.1-1.2 2.7-2 4.4-2 2.9 0 5.2 2.3 5.2 5.2 0 3.6-3.2 6.5-8.2 11Z"
        fill="currentColor"
      />
    </svg>
  ),
  user: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="7.5" r="4.5" fill="currentColor" />
      <path d="M3.5 21c0-4.4 3.8-7.5 8.5-7.5s8.5 3.1 8.5 7.5Z" fill="currentColor" />
    </svg>
  ),
  bed: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M4 5.5h16a1 1 0 0 1 1 1V11H3V6.5a1 1 0 0 1 1-1Zm2.5 2.5v3h4.5V8Zm6.5 0v3h4.5V8ZM2 12.5h20V17H2Zm1 5.5h2v2H3Zm16 0h2v2h-2Z"
        fill="currentColor"
      />
    </svg>
  ),
  cal: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M7 2.5h2V5h6V2.5h2V5h2.5A1.5 1.5 0 0 1 21 6.5v13a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 19.5v-13A1.5 1.5 0 0 1 4.5 5H7Zm-2 7v9.5h14V9.5Zm2 2h2.5V14H7Zm3.75 0h2.5V14h-2.5Zm3.75 0H17V14h-2.5ZM7 15.5h2.5V18H7Zm3.75 0h2.5V18h-2.5Z"
        fill="currentColor"
      />
    </svg>
  ),
  search: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" strokeWidth="2.6" />
      <path d="m15.5 15.5 5.5 5.5" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
    </svg>
  ),
  plane: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M20.6 3.4c-.9-.9-2.3-.8-3.2.1l-3.6 3.7-8.5-2.6-2 2 7 4.2-3.6 3.8-2.6-.4-1.6 1.6 3.6 2 2 3.6 1.6-1.6-.4-2.6 3.8-3.6 4.2 7 2-2-2.6-8.5 3.7-3.6c.9-.9 1-2.3.1-3.2Z"
        fill="currentColor"
      />
    </svg>
  ),
  car: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M6.3 5.5h11.4l2.1 5.2 1.2.6V18h-2v2h-3v-2H8v2H5v-2H3v-6.7l1.2-.6Zm1.3 2-1.3 3.3h11.4l-1.3-3.3ZM6.5 13a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Zm11 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
  ),
  umbrella: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3.2 11.2C4.4 6.6 9 3.8 13.7 5c3.2.8 5.6 3.3 6.3 6.4Z" fill="currentColor" />
      <path d="m11.6 8.4 2.9 11.3" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
      <path d="M3 20h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  trips: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M9 2.5h6v2h3.5A1.5 1.5 0 0 1 20 6v6.1a6 6 0 0 0-7.9 8.9H5.5A1.5 1.5 0 0 1 4 19.5V6a1.5 1.5 0 0 1 1.5-1.5H9Zm-2 7v2h10v-2Zm0 4v2h5v-2Z"
        fill="currentColor"
        fillRule="evenodd"
      />
      <circle cx="18" cy="18" r="4" fill="currentColor" />
      <path d="m16.2 18 1.3 1.3 2.4-2.5" fill="none" stroke="#fff" strokeWidth="1.4" />
    </svg>
  ),
  globe: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="8.6" fill="none" stroke="currentColor" strokeWidth="1.9" />
      <path
        d="M3.5 12h17M12 3.4c-2.4 2.4-3.4 5.3-3.4 8.6s1 6.2 3.4 8.6M12 3.4c2.4 2.4 3.4 5.3 3.4 8.6s-1 6.2-3.4 8.6M5 7.5h14M5 16.5h14"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      />
    </svg>
  ),
  radar: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="8.6" fill="none" stroke="currentColor" strokeWidth="1.9" />
      <circle cx="12" cy="12" r="4.8" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="M12 12h8.6" stroke="currentColor" strokeWidth="1.9" />
    </svg>
  ),
  news: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 4.5h18v4H3Zm0 5.5h8v9.5H3Zm10 0h8v2h-8Zm0 3.8h8v2h-8Zm0 3.7h8v2h-8Z" fill="currentColor" />
    </svg>
  ),
  case: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M9 3.5h6A1.5 1.5 0 0 1 16.5 5v1.5h3.5A1.5 1.5 0 0 1 21.5 8v11a1.5 1.5 0 0 1-1.5 1.5H4A1.5 1.5 0 0 1 2.5 19V8A1.5 1.5 0 0 1 4 6.5h3.5V5A1.5 1.5 0 0 1 9 3.5Zm.5 1.8v1.2h5V5.3Z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
  ),
  sliders: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="8" cy="6" r="2.4" fill="#fff" stroke="currentColor" strokeWidth="2" />
      <circle cx="16" cy="12" r="2.4" fill="#fff" stroke="currentColor" strokeWidth="2" />
      <circle cx="10" cy="18" r="2.4" fill="#fff" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  chevron: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m6 9 6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  save: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 20 10.8 18.9C6.3 14.9 3.4 12.3 3.4 9.1 3.4 6.5 5.4 4.5 8 4.5c1.5 0 2.9.7 4 1.8 1.1-1.1 2.5-1.8 4-1.8 2.6 0 4.6 2 4.6 4.6 0 3.2-2.9 5.8-7.4 9.8Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
      />
    </svg>
  ),
  share: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M13.5 4.5 21 11l-7.5 6.5v-4C8.5 13.5 5.4 15.2 3 19c.6-5.6 3.8-9.7 10.5-10.5Z" fill="currentColor" />
    </svg>
  ),
  next: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m9 5 7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

/* provider wordmarks, set as small brand-coloured text (Kayak shows logos) */
function Mark({ mark, name }: { mark: Deal['mark']; name: string }) {
  if (mark === 'hotels') {
    return (
      <span className="sm-kyk__mark sm-kyk__mark--hotels">
        <span className="sm-kyk__hotels-tile" aria-hidden="true">
          <svg viewBox="0 0 12 12" aria-hidden="true">
            <path d="M3 2.5h1.6v2.7h2.8V2.5H9v7H7.4V6.7H4.6v2.8H3Z" fill="#fff" />
          </svg>
        </span>
        <span>
          Hotels<small>.com</small>
        </span>
      </span>
    );
  }
  if (mark === 'expedia') {
    return (
      <span className="sm-kyk__mark sm-kyk__mark--expedia">
        <span className="sm-kyk__expedia-tile" aria-hidden="true">
          <svg viewBox="0 0 12 12" aria-hidden="true">
            <path d="M3.4 8.6 7.6 4.4M4.8 4.2h3v3" fill="none" stroke="#191e3b" strokeWidth="1.5" />
          </svg>
        </span>
        Expedia
      </span>
    );
  }
  if (mark === 'booking') {
    return (
      <span className="sm-kyk__mark sm-kyk__mark--booking">
        <span>
          Booking<small>.com</small>
        </span>
      </span>
    );
  }
  return <span className={`sm-kyk__mark sm-kyk__mark--${mark}`}>{name}</span>;
}

function Result({ stay, first }: { stay: Stay; first?: boolean }) {
  return (
    <li className={`sm-kyk__card${first ? ' sm-kyk__card--hover' : ''}`}>
      <div className="sm-kyk__photo">
        <img src={stay.photo} alt="" style={{ objectPosition: stay.focus }} />
        <span className="sm-kyk__photo-btns">
          <span className="sm-kyk__photo-btn">
            {I.save}
            Save
          </span>
          <span className="sm-kyk__photo-btn">
            {I.share}
            Share
          </span>
        </span>
        <span className="sm-kyk__dots" aria-hidden="true">
          <i className="is-on" />
          <i />
          <i />
          <i />
          <i />
        </span>
      </div>

      <div className="sm-kyk__info">
        <p className="sm-kyk__name">{stay.name}</p>
        <p className="sm-kyk__area">{stay.area}</p>
        <p className="sm-kyk__rating">
          <span className="sm-kyk__score">{stay.score}</span>
          <span className="sm-kyk__label">{stay.label}</span>
          <span className="sm-kyk__count">{stay.reviews}</span>
        </p>
        <ul className="sm-kyk__deals">
          {stay.deals.map((d) => (
            <li key={d.name} className="sm-kyk__deal">
              <span className="sm-kyk__deal-who">
                <Mark mark={d.mark} name={d.name} />
                {d.more && (
                  <span className="sm-kyk__deal-more">
                    {d.more}
                    {I.chevron}
                  </span>
                )}
              </span>
              <span className="sm-kyk__deal-price">{d.price}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="sm-kyk__offer">
        <Mark mark={stay.provider} name={stay.providerName} />
        <span className="sm-kyk__price">{stay.price}</span>
        <span className="sm-kyk__total">{stay.total}</span>
        {stay.perk && <span className="sm-kyk__perk">{stay.perk}</span>}
        <span className="sm-kyk__cta">View Deal</span>
      </div>
    </li>
  );
}

export default function KayakMock() {
  return (
    <div className="sm-kyk">
      <div className="sm-kyk__page">
        <div className="sm-kyk__header">
          <div className="sm-kyk__bar">
            <span className="sm-kyk__menu">{I.menu}</span>
            <img className="sm-kyk__logo" src={LOGO_SRC.kayak} alt="KAYAK" />
            <span className="sm-kyk__bar-end">
              <span className="sm-kyk__heart">{I.heart}</span>
              <span className="sm-kyk__signin">
                {I.user}
                Sign in
              </span>
            </span>
          </div>

          <div className="sm-kyk__form">
            <span className="sm-kyk__field sm-kyk__field--where">
              {I.bed}
              Kyoto, Japan
            </span>
            <span className="sm-kyk__field sm-kyk__field--dates">
              <span className="sm-kyk__date">
                {I.cal}
                Fri 11/13
              </span>
              <span className="sm-kyk__date">
                {I.cal}
                Mon 11/16
              </span>
            </span>
            <span className="sm-kyk__field sm-kyk__field--who">
              {I.user}
              1 room, 2 guests
            </span>
            <span className="sm-kyk__go">
              {I.search}
            </span>
          </div>
        </div>

        <div className="sm-kyk__body">
          <div className="sm-kyk__rail">
            <span className="sm-kyk__tab" data-tab="Flights">
              {I.plane}
            </span>
            <span className="sm-kyk__tab is-active" data-tab="Stays">
              {I.bed}
            </span>
            <span className="sm-kyk__tab" data-tab="Cars">
              {I.car}
            </span>
            <span className="sm-kyk__tab" data-tab="Packages">
              {I.umbrella}
            </span>
            <span className="sm-kyk__rule" />
            <span className="sm-kyk__tab" data-tab="Trips">
              {I.trips}
            </span>
            <span className="sm-kyk__tab" data-tab="Explore">
              {I.globe}
            </span>
            <span className="sm-kyk__tab" data-tab="Best time to travel">
              {I.radar}
            </span>
            <span className="sm-kyk__tab" data-tab="Travel guides">
              {I.news}
            </span>
            <span className="sm-kyk__tab" data-tab="KAYAK for Business">
              {I.case}
            </span>
          </div>

          <div className="sm-kyk__main">
            <div className="sm-kyk__filters">
              <span className="sm-kyk__chip sm-kyk__chip--all">
                {I.sliders}
                All filters
              </span>
              <span className="sm-kyk__chip">
                Price
                {I.chevron}
              </span>
              <span className="sm-kyk__chip">
                Review score
                {I.chevron}
              </span>
              <span className="sm-kyk__chip">
                Hotel class
                {I.chevron}
              </span>
              <span className="sm-kyk__chip">Free cancellation</span>
              <span className="sm-kyk__chips-next">{I.next}</span>
            </div>

            <div className="sm-kyk__sortrow">
              <span className="sm-kyk__nightly">
                Nightly base - before taxes and fees
                {I.chevron}
              </span>
              <span className="sm-kyk__sort">
                Sort by <b>Price (low to high)</b>
                {I.chevron}
              </span>
            </div>

            <ol className="sm-kyk__results">
              {STAYS.map((s, i) => (
                <Result key={s.name} stay={s} first={i === 0} />
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
