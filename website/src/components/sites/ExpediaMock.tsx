import './ExpediaMock.css';
import { LOGO_SRC } from './logos';

/**
 * Expedia's desktop hotel-results layout, observed 2026-09-24. Static artwork
 * inside the existing 322 × 266 surface panel; it has no interactive controls.
 * Photos and the Kyoto story carry over from the previous travel mockup.
 * Rates/reviews are illustrative and do not come from a live Expedia search.
 */
const STAYS = [
  {
    name: 'Hyatt Place Kyoto', area: 'Central Kyoto', score: '8.8',
    rating: 'Excellent', reviews: '2,345 reviews', price: '$184', total: '$552',
    photo: '/images/stays/hyatt-place-kyoto.jpg', focus: '30% 50%',
    amenities: 'Breakfast available · Free WiFi',
  },
  {
    name: 'Hotel Granvia Kyoto', area: 'Kyoto Station', score: '8.6',
    rating: 'Excellent', reviews: '6,412 reviews', price: '$231', total: '$693',
    photo: '/images/sites/expedia/granvia-kyoto-double.jpg', focus: '45% 50%',
    amenities: 'Pool · Restaurant · Free WiFi',
  },
  {
    name: 'Park Hyatt Kyoto', area: 'Higashiyama', score: '9.4',
    rating: 'Exceptional', reviews: '1,108 reviews', price: '$612', total: '$1,836',
    photo: '/images/stays/park-kyoto-exterior.jpg', focus: '55% 60%',
    amenities: 'Spa · Restaurant · Free WiFi',
  },
] as const;

function Icon({ kind }: { kind: 'pin' | 'calendar' | 'person' | 'search' | 'heart' | 'chevron' }) {
  const paths = {
    pin: 'M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0ZM15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
    calendar: 'M7 3v4m10-4v4M4 10h16M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1Zm3 9h3v3H8Z',
    person: 'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM5 21v-2a7 7 0 0 1 14 0v2Z',
    search: 'M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Zm-2 5 6 6',
    heart: 'M12 21S2 15 2 8.5a5.5 5.5 0 0 1 10-3 5.5 5.5 0 0 1 10 3C22 15 12 21 12 21Z',
    chevron: 'm7 10 5 5 5-5',
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d={paths[kind]} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function MapPreview() {
  return (
    <div className="sm-exp__map">
      <svg viewBox="0 0 128 70" aria-hidden="true">
        <rect width="128" height="70" fill="#e7eddc" />
        <path d="M0 0h34l-7 30L0 48Zm101 0h27v70H97l9-24Z" fill="#cee1b5" />
        <path d="M70-5c-9 22 14 35 5 50S57 61 68 76" fill="none" stroke="#b8dbea" strokeWidth="5" />
        <path d="M24-5 41 77M47-5l6 80M93-5 89 77M0 18l128 7M0 38l128-2M0 58l128-6" fill="none" stroke="#fff" strokeWidth="3" />
        <path d="m0 65 128-48M4-2l112 74" fill="none" stroke="#f6dca5" strokeWidth="2" />
        <circle cx="65" cy="37" r="5" fill="#3364db" stroke="#fff" strokeWidth="2" />
        <text x="45" y="25" fontSize="9" fill="#575b52">Kyoto</text>
      </svg>
      <span>View in a map</span>
    </div>
  );
}

export default function ExpediaMock() {
  return (
    <div className="sm-exp">
      <div className="sm-exp__page">
        <div className="sm-exp__header">
          <img className="sm-exp__logo" src={LOGO_SRC.expedia} alt="Expedia" />
          <span className="sm-exp__shop">Shop travel <Icon kind="chevron" /></span>
          <span className="sm-exp__links">Support <span>Trips</span> Sign in</span>
        </div>
        <div className="sm-exp__form">
          <span className="sm-exp__field"><Icon kind="pin" /><span><small>Where to?</small>Kyoto, Japan</span></span>
          <span className="sm-exp__field"><Icon kind="calendar" /><span><small>Dates</small>Nov 13 – Nov 16</span></span>
          <span className="sm-exp__field"><Icon kind="person" /><span><small>Travelers</small>2 travelers, 1 room</span></span>
          <span className="sm-exp__search"><Icon kind="search" /></span>
        </div>
        <div className="sm-exp__body">
          <div className="sm-exp__sidebar">
            <MapPreview />
            <div className="sm-exp__filter">
              <b>Search by property name</b>
              <span className="sm-exp__property"><Icon kind="search" />e.g. Marriott</span>
            </div>
            <div className="sm-exp__filter">
              <b>Filter by</b>
              <strong>Nightly price</strong>
              <div className="sm-exp__prices"><span><small>Min</small>$0</span><span><small>Max</small>$300+</span></div>
              <div className="sm-exp__histogram">{[8, 18, 37, 28, 23, 19, 26, 20, 16, 12, 7, 5].map((h, i) => <i key={i} style={{ height: h }} />)}</div>
              <div className="sm-exp__range"><i /><i /></div>
              <strong>Popular filters</strong>
              {['Fully refundable', 'Breakfast included', 'Hotel', 'Pool'].map(label => <span className="sm-exp__check" key={label}><i />{label}</span>)}
            </div>
          </div>
          <div className="sm-exp__main">
            <div className="sm-exp__tabs"><span className="is-active">All stays</span><span>Hotels</span><span>Homes</span></div>
            <div className="sm-exp__sort"><span>38 properties</span><span>Sort by recommended <Icon kind="chevron" /></span></div>
            <div className="sm-exp__member"><img src="/images/sites/logos/expedia-icon.svg" alt="" /><span><b>Members save more</b><small>Unlock instant savings with Member Prices</small></span></div>
            <ol className="sm-exp__results">
              {STAYS.map(stay => (
                <li className="sm-exp__stay" key={stay.name}>
                  <div className="sm-exp__photo">
                    <img src={stay.photo} alt="" style={{ objectPosition: stay.focus }} />
                    <span className="sm-exp__save"><Icon kind="heart" /></span>
                    <span className="sm-exp__next">›</span>
                    <span className="sm-exp__dots">● ● ● ●</span>
                  </div>
                  <div className="sm-exp__details">
                    <b className="sm-exp__name">{stay.name}</b>
                    <span>{stay.area}</span>
                    <small>{stay.amenities}</small>
                    <span className="sm-exp__refundable">Fully refundable</span>
                    <div className="sm-exp__bottom">
                      <span className="sm-exp__rating"><b>{stay.score}</b><span>{stay.rating}<small>{stay.reviews}</small></span></span>
                      <span className="sm-exp__rate"><span>{stay.price} nightly</span><strong>{stay.total} total</strong><small>3 nights</small></span>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
