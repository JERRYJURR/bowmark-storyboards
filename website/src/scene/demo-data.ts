/**
 * Illustrative data for the miniature product surfaces in B1.
 *
 * v5 fixes the cast: three providers (acmeair, united, delta) and one task
 * (flights). Everything below is demo data for those screens — flight numbers,
 * times, fares, tool schemas. No marketing claim and no measured metric is
 * expressed here; the surfaces are meant to read as real product UI.
 */

export type Airline = {
  domain: string;
  code: string;
  name: string;
  tint: 'a' | 'b' | 'c';
};

/** matches v5's D3 = ['acmeair', 'united', 'delta'] */
export const AIRLINES: Airline[] = [
  { domain: 'acmeair', code: 'AC', name: 'Acme Air', tint: 'a' },
  { domain: 'united', code: 'UA', name: 'United', tint: 'b' },
  { domain: 'delta', code: 'DL', name: 'Delta', tint: 'c' },
];

export const ROUTE = {
  from: 'SFO',
  to: 'JFK',
  date: 'Nov 14',
  pax: '1 adult',
  iso: '2026-11-14',
};

export type Flight = {
  no: string;
  dep: string;
  arr: string;
  dur: string;
  stops: string;
  fare: string;
};

export const FLIGHTS: Flight[][] = [
  [
    { no: 'AC 412', dep: '06:40', arr: '15:05', dur: '5h 25m', stops: 'Nonstop', fare: '$268' },
    { no: 'AC 908', dep: '10:15', arr: '18:52', dur: '5h 37m', stops: 'Nonstop', fare: '$301' },
    { no: 'AC 214', dep: '17:30', arr: '01:58', dur: '5h 28m', stops: '1 stop', fare: '$249' },
  ],
  [
    { no: 'UA 523', dep: '07:15', arr: '15:42', dur: '5h 27m', stops: 'Nonstop', fare: '$284' },
    { no: 'UA 1180', dep: '11:40', arr: '20:05', dur: '5h 25m', stops: 'Nonstop', fare: '$312' },
    { no: 'UA 402', dep: '16:05', arr: '00:31', dur: '5h 26m', stops: '1 stop', fare: '$259' },
  ],
  [
    { no: 'DL 716', dep: '08:05', arr: '16:29', dur: '5h 24m', stops: 'Nonstop', fare: '$276' },
    { no: 'DL 1342', dep: '12:20', arr: '20:48', dur: '5h 28m', stops: 'Nonstop', fare: '$298' },
    { no: 'DL 288', dep: '19:10', arr: '03:35', dur: '5h 25m', stops: '1 stop', fare: '$243' },
  ],
];

/* --- API responses, one per v5 endpoint ------------------------------------ */

export type JsonToken = { t: string; c: 'key' | 'str' | 'num' | 'punc' };

/** GET /flights · GET /fares · POST /book */
export const API_RESPONSE: JsonToken[][][] = [
  [
    [{ t: '{', c: 'punc' }],
    [
      { t: '  "route"', c: 'key' },
      { t: ': ', c: 'punc' },
      { t: '"SFO-JFK"', c: 'str' },
      { t: ',', c: 'punc' },
    ],
    [
      { t: '  "flights"', c: 'key' },
      { t: ': [', c: 'punc' },
    ],
    [
      { t: '    { ', c: 'punc' },
      { t: '"no"', c: 'key' },
      { t: ': ', c: 'punc' },
      { t: '"AC 412"', c: 'str' },
      { t: ', ', c: 'punc' },
      { t: '"fare"', c: 'key' },
      { t: ': ', c: 'punc' },
      { t: '268', c: 'num' },
      { t: ' },', c: 'punc' },
    ],
    [
      { t: '    { ', c: 'punc' },
      { t: '"no"', c: 'key' },
      { t: ': ', c: 'punc' },
      { t: '"AC 908"', c: 'str' },
      { t: ', ', c: 'punc' },
      { t: '"fare"', c: 'key' },
      { t: ': ', c: 'punc' },
      { t: '301', c: 'num' },
      { t: ' }', c: 'punc' },
    ],
    [{ t: '  ]', c: 'punc' }],
    [{ t: '}', c: 'punc' }],
  ],
  [
    [{ t: '{', c: 'punc' }],
    [
      { t: '  "flightNo"', c: 'key' },
      { t: ': ', c: 'punc' },
      { t: '"UA 523"', c: 'str' },
      { t: ',', c: 'punc' },
    ],
    [
      { t: '  "cabin"', c: 'key' },
      { t: ': ', c: 'punc' },
      { t: '"economy"', c: 'str' },
      { t: ',', c: 'punc' },
    ],
    [
      { t: '  "total"', c: 'key' },
      { t: ': ', c: 'punc' },
      { t: '284.00', c: 'num' },
      { t: ',', c: 'punc' },
    ],
    [
      { t: '  "currency"', c: 'key' },
      { t: ': ', c: 'punc' },
      { t: '"USD"', c: 'str' },
    ],
    [{ t: '}', c: 'punc' }],
  ],
  [
    [{ t: '{', c: 'punc' }],
    [
      { t: '  "booking"', c: 'key' },
      { t: ': ', c: 'punc' },
      { t: '"DL-7Q2XK"', c: 'str' },
      { t: ',', c: 'punc' },
    ],
    [
      { t: '  "status"', c: 'key' },
      { t: ': ', c: 'punc' },
      { t: '"confirmed"', c: 'str' },
      { t: ',', c: 'punc' },
    ],
    [
      { t: '  "seat"', c: 'key' },
      { t: ': ', c: 'punc' },
      { t: '"14C"', c: 'str' },
      { t: ',', c: 'punc' },
    ],
    [
      { t: '  "total"', c: 'key' },
      { t: ': ', c: 'punc' },
      { t: '276.00', c: 'num' },
    ],
    [{ t: '}', c: 'punc' }],
  ],
];

export const API_META = [
  { status: '200', ms: '18 ms' },
  { status: '200', ms: '11 ms' },
  { status: '201', ms: '340 ms' },
];

/* --- SDK source, one per package ------------------------------------------- */

export type CodeTok = { t: string; c: 'kw' | 'fn' | 'str' | 'plain' | 'punc' | 'note' };

export const SDK_SOURCE = (pkg: string, method: string): CodeTok[][] => [
  [
    { t: 'import', c: 'kw' },
    { t: ' { ', c: 'punc' },
    { t: method, c: 'fn' },
    { t: ' } ', c: 'punc' },
    { t: 'from', c: 'kw' },
    { t: ' ', c: 'punc' },
    { t: `"${pkg}"`, c: 'str' },
  ],
  [],
  [
    { t: 'const', c: 'kw' },
    { t: ' res = ', c: 'plain' },
    { t: 'await', c: 'kw' },
    { t: ' ', c: 'plain' },
    { t: method, c: 'fn' },
    { t: '({', c: 'punc' },
  ],
  [
    { t: '  from: ', c: 'plain' },
    { t: `"${ROUTE.from}"`, c: 'str' },
    { t: ', to: ', c: 'plain' },
    { t: `"${ROUTE.to}"`, c: 'str' },
    { t: ',', c: 'punc' },
  ],
  [
    { t: '  date: ', c: 'plain' },
    { t: `"${ROUTE.iso}"`, c: 'str' },
  ],
  [{ t: '})', c: 'punc' }],
  [],
  [
    { t: 'res.flights[', c: 'plain' },
    { t: '0', c: 'punc' },
    { t: '].fare', c: 'plain' },
    { t: '   // 284.00', c: 'note' },
  ],
];

/* --- converted provider source, one composition per category ---------------- */

const t = (text: string, c: CodeTok['c'] = 'plain'): CodeTok => ({ t: text, c });

export type Converted = {
  file: string;
  lines: CodeTok[][];
  /** the typed result the provider returns */
  out: { type: string; rows: [string, string][]; status: string };
};

/**
 * Indexed by the scene's surface slot (scene/sites.ts): 0 Google Maps ·
 * 1 Amazon · 2 Calendly · 3 Expedia · 4 YouTube. Each is the provider module a
 * site card becomes. Expedia's API is illustrative; the other function
 * names come from their live providers. The
 * bodies are illustrative (they sketch how each provider reaches its site,
 * not its source) and are sized to fill the tile once it converts.
 */
export const CONVERTED: Converted[] = [
  {
    file: 'providers/google-maps.ts',
    lines: [
      [t('export default ', 'kw'), t('defineProvider', 'fn'), t('({', 'punc')],
      [t('  domain: '), t("'google.com/maps'", 'str'), t(',', 'punc')],
      [t('  async ', 'kw'), t('searchPlaces', 'fn'), t('({ query, near }) {', 'punc')],
      [t('    const res = '), t('await ', 'kw'), t('get', 'fn'), t('('), t("'/search'", 'str'), t(', { query })', 'punc')],
      [t('    return '), t('parsePlaces', 'fn'), t('(res, near)', 'punc')],
      [t('  },', 'punc')],
      [t('  async ', 'kw'), t('getDirections', 'fn'), t('({ from, to }) {', 'punc')],
      [t('    return '), t('route', 'fn'), t('(from, to)', 'punc')],
      [t('  },', 'punc')],
      [t('})', 'punc')],
    ],
    out: { type: 'Place[]', rows: [['Hyatt Place Kyoto', '4.4']], status: '20 places' },
  },
  {
    file: 'providers/amazon.ts',
    lines: [
      [t('export default ', 'kw'), t('defineProvider', 'fn'), t('({', 'punc')],
      [t('  domain: '), t("'amazon.com'", 'str'), t(',', 'punc')],
      [t('  async ', 'kw'), t('searchProducts', 'fn'), t('({ keywords }) {', 'punc')],
      [t('    const page = '), t('await ', 'kw'), t('fetchHtml', 'fn'), t('('), t("'/s'", 'str'), t(', { k })', 'punc')],
      [t('    return page.'), t('extract', 'fn'), t('(ProductList)', 'punc')],
      [t('  },', 'punc')],
      [t('  async ', 'kw'), t('getProduct', 'fn'), t('({ asin }) {', 'punc')],
      [t('    return '), t('product', 'fn'), t('(asin)', 'punc')],
      [t('  },', 'punc')],
      [t('})', 'punc')],
    ],
    out: { type: 'Product[]', rows: [['Carry-on 21"', '$129.99']], status: '48 results' },
  },
  {
    file: 'providers/calendly.ts',
    lines: [
      [t('export default ', 'kw'), t('defineProvider', 'fn'), t('({', 'punc')],
      [t('  domain: '), t("'calendly.com'", 'str'), t(',', 'punc')],
      [t('  async ', 'kw'), t('getAvailability', 'fn'), t('({ profile, event }) {', 'punc')],
      [t('    const { uuid } = '), t('await ', 'kw'), t('lookup', 'fn'), t('(profile, event)', 'punc')],
      [t('    return '), t('get', 'fn'), t('('), t('`/event_types/${uuid}`', 'str'), t(' +', 'punc')],
      [t('      '), t("'/calendar/range'", 'str'), t(')', 'punc')],
      [t('  },', 'punc')],
      [t('})', 'punc')],
    ],
    out: { type: 'Slot[]', rows: [['Fri 13', '9:30am']], status: '12 slots' },
  },
  {
    file: 'providers/expedia.ts',
    lines: [
      [t('export default ', 'kw'), t('defineProvider', 'fn'), t('({', 'punc')],
      [t('  domain: '), t("'expedia.com'", 'str'), t(',', 'punc')],
      [t('  async ', 'kw'), t('searchHotels', 'fn'), t('({ location, checkIn,', 'punc')],
      [t('                  checkOut }) {', 'punc')],
      [t('    const page = '), t('await ', 'kw'), t('open', 'fn'), t('('), t('hotelsUrl', 'fn'), t('(location))', 'punc')],
      [t('    const rows = '), t('await ', 'kw'), t('page.poll', 'fn'), t('()', 'punc')],
      [t('    return rows.'), t('sort', 'fn'), t('(byTotalPrice)', 'punc')],
      [t('  },', 'punc')],
      [t('})', 'punc')],
    ],
    out: { type: 'Hotel[]', rows: [['Hyatt Place Kyoto', '$184']], status: '38 stays' },
  },
  {
    file: 'providers/youtube.ts',
    lines: [
      [t('export default ', 'kw'), t('defineProvider', 'fn'), t('({', 'punc')],
      [t('  domain: '), t("'youtube.com'", 'str'), t(',', 'punc')],
      [t('  async ', 'kw'), t('search', 'fn'), t('({ query }) {', 'punc')],
      [t('    const res = '), t('await ', 'kw'), t('post', 'fn'), t('('), t("'/youtubei/v1/search'", 'str'), t(',', 'punc')],
      [t('      { query })', 'punc')],
      [t('    return '), t('parseSearchResults', 'fn'), t('(res)', 'punc')],
      [t('  },', 'punc')],
      [t('  async ', 'kw'), t('getTranscript', 'fn'), t('({ videoId }) {', 'punc')],
      [t('    return '), t('captions', 'fn'), t('(videoId)', 'punc')],
      [t('  },', 'punc')],
      [t('})', 'punc')],
    ],
    out: { type: 'Video[]', rows: [['Kyoto in 3 days', '12:04']], status: '20 results' },
  },
];

/* --- MCP tool lists, sized to v5's "tools · N" headers ---------------------- */

export type Tool = { name: string; args: string; ret: string };

export const TOOLS: Tool[][] = [
  [
    { name: 'search_flights', args: '{ from, to, date }', ret: 'Flight[]' },
    { name: 'get_fare', args: '{ flightNo }', ret: 'Fare' },
    { name: 'seat_map', args: '{ flightNo }', ret: 'Seat[]' },
    { name: 'book_seat', args: '{ flightNo, seat }', ret: 'Booking' },
  ],
  [
    { name: 'list_fares', args: '{ flightNo }', ret: 'Fare[]' },
    { name: 'fare_rules', args: '{ fareId }', ret: 'Rules' },
    { name: 'price_quote', args: '{ fareId, pax }', ret: 'Quote' },
  ],
  [
    { name: 'create_booking', args: '{ flightNo, pax }', ret: 'Booking' },
    { name: 'confirm', args: '{ bookingId }', ret: 'Booking' },
    { name: 'add_bag', args: '{ bookingId, kg }', ret: 'Booking' },
    { name: 'cancel', args: '{ bookingId }', ret: 'Refund' },
  ],
];

/** how many tools each provider advertises — matches v5's HEAD3 counts */
export const TOOL_COUNTS = [5, 3, 8];
