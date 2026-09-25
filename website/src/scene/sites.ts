/**
 * The five sites of the B1 scene (Chris's feedback, 2026-09-22): real
 * brands in place of the Websites / MCPs / APIs / SDKs / CLIs categories.
 *
 * Each site card converts to code and becomes that site's capability card —
 * its white logo in the corner and its functions as the rows. Function names
 * are the provider's live (implemented) functions in Metroxe/bowmark
 * `packages/providers/<id>/manifest.json` at 9a7ffd1e5 (2026-09-21); `total`
 * is the count of those live functions.
 *
 * Arrays are indexed by v5's surface index — the slot a card rises into
 * (DecompileScene CELLS): 0 top-middle · 1 middle-right · 2 bottom-middle ·
 * 3 right · 4 left. Rise order stays [4, 1, 3, 2, 0].
 */

export type SiteId = 'youtube' | 'amazon' | 'calendly' | 'maps' | 'kayak';

export type Site = {
  id: SiteId;
  /** the brand, as the card titles it */
  brand: string;
  /** the provider namespace an agent imports */
  ns: string;
  domain: string;
  /** what the site card's small print says under the brand */
  detail: string;
  /** live functions shown on the capability card, most useful first (≤ 10,
      and short enough for a 121px column) */
  rows: readonly string[];
  /** every live function the provider exposes */
  total: number;
  /** the capability card's fill */
  tone: string;
};

export const SITES: readonly Site[] = [
  {
    id: 'maps',
    brand: 'Google Maps',
    ns: 'googleMaps',
    domain: 'google.com/maps',
    detail: 'google.com/maps',
    rows: [
      'searchPlaces',
      'searchNearby',
      'getPlace',
      'getDirections',
      'listReviews',
      'listPhotos',
      'suggestPlaces',
      'geocodeAddress',
      'reverseGeocode',
    ],
    total: 11,
    tone: 'var(--bm-brand-maps)',
  },
  {
    id: 'amazon',
    brand: 'Amazon',
    ns: 'amazon',
    domain: 'amazon.com',
    detail: 'amazon.com',
    rows: [
      'searchProducts',
      'getProduct',
      'listReviews',
      'listDeals',
      'listBestSellers',
      'listVariations',
      'listNewReleases',
      'getSeller',
    ],
    total: 15,
    tone: 'var(--bm-brand-amazon)',
  },
  {
    id: 'calendly',
    brand: 'Calendly',
    ns: 'calendly',
    domain: 'calendly.com',
    detail: 'calendly.com',
    rows: ['getAvailability', 'getEventTypes', 'getBookingForm', 'findProfiles'],
    total: 4,
    tone: 'var(--bm-brand-calendly)',
  },
  {
    id: 'kayak',
    brand: 'Kayak',
    ns: 'kayak',
    domain: 'kayak.com',
    detail: 'kayak.com',
    rows: ['searchHotels', 'search', 'searchCars', 'getBookingOptions'],
    total: 4,
    tone: 'var(--bm-brand-kayak)',
  },
  {
    id: 'youtube',
    brand: 'YouTube',
    ns: 'youtube',
    domain: 'youtube.com',
    detail: 'youtube.com',
    rows: [
      'search',
      'getVideo',
      'getTranscript',
      'listComments',
      'getChannel',
      'createPlaylist',
      'addToPlaylist',
      'getPlaylist',
      'listChapters',
      'getLiveChat',
    ],
    total: 28,
    tone: 'var(--bm-brand-youtube)',
  },
] as const;

export const siteById = (id: SiteId): Site => SITES.find((s) => s.id === id)!;

/** the site whose capability the agent imports in the second half */
export const IMPORTED: SiteId = 'kayak';

/**
 * The capability cards' resting composition (Paper 7K2's tilted spread,
 * widened from four cards to five), canvas px top-left + tilt. Heights and
 * paint order are chosen so that no card covers another's logo or title:
 * the fan dips to Kayak at the centre, which sits in front, and the second
 * half lifts it out.
 */
export const CARD_PLACE: Record<SiteId, { x: number; y: number; r: number }> = {
  youtube: { x: 70, y: 112, r: -4.6 },
  amazon: { x: 318, y: 156, r: 3.2 },
  kayak: { x: 540, y: 236, r: -2.2 },
  calendly: { x: 846, y: 140, r: 2.8 },
  maps: { x: 1080, y: 214, r: -3.4 },
};

/** back to front — also the order the site cards turn into capability cards */
export const PAINT_ORDER: readonly SiteId[] = ['youtube', 'calendly', 'maps', 'amazon', 'kayak'];

export const capCount = (s: Site) => `${s.total} ${s.total === 1 ? 'capability' : 'capabilities'}`;

export const capMore = (s: Site) => {
  const n = s.total - s.rows.length;
  return n > 0 ? `+ ${n} more` : '';
};
