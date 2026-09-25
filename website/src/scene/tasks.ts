/**
 * F1 — "same task two ways".
 *
 * Transcribed from `TASKS` in `Bowmark Prototype/Bowmark Prototype v5.dc.html`
 * (the authoritative wireframe). Every string and number below is the
 * prototype's own demo data: nothing here is measured, so no copy built from
 * it may claim a benchmark.
 */

import { HOTEL_RESULT } from './content';

export type Scene = 'load' | 'form' | 'results' | 'captcha';

export type Task = {
  name: string;
  prompt: string;
  /** the capability the assistant calls, and the follow-up if there is one */
  fn1: string;
  fn2: string | null;
  /** what comes back, as label / value pairs */
  rows: [string, string][];
  cTitle: string;
  cPrice: string;
  cSub: string;
  final: string;
  /** the same job, written as code */
  lib: string;
  args: [string, string][];
  out: string;
  /** the browser agent's side */
  tabs: string[];
  url: string;
  inputs: [string, string][];
  btn: string;
  steps: string[];
  sc: Scene[];
  /** the prototype's illustrative replay figures */
  bmTok: number;
  bmCost: number;
  bmSec: number;
  webTok: number;
  webCost: number;
  webSec: number;
};

export const TASKS: Task[] = [
  /* The approved redesign (Paper 8YQ) replaces v5's "book a flight" with the
     hotel story the import scene already tells: Hyatt Place Kyoto at $184 a
     night, from HOTEL_RESULT. The figures mirror the flight task's scale so
     the replay makes no stronger claim than v5 did. */
  {
    name: 'Book a hotel',
    prompt: 'book me a hotel in Kyoto for 3 nights, under $200',
    fn1: 'searchHotels',
    fn2: 'bookHotel',
    rows: [
      [`${HOTEL_RESULT.name} · Shimogyo · 4.4★`, HOTEL_RESULT.price],
      ['Hotel Granvia Kyoto · Station · 4.3★', '$196'],
      ['Hyatt Regency Kyoto · Higashiyama · 4.6★', '$241'],
    ],
    cTitle: 'Booked ✓',
    cPrice: `${HOTEL_RESULT.price}${HOTEL_RESULT.per}`,
    cSub: `${HOTEL_RESULT.name} · Oct 9 → Oct 12 · free cancellation · Confirmation K4Q7TM`,
    final: `Done — 3 nights at ${HOTEL_RESULT.name}, ${HOTEL_RESULT.price} a night.`,
    lib: 'bookHotel',
    args: [
      ['city', '"Kyoto"'],
      ['nights', '3'],
      ['maxRate', '200'],
    ],
    out: `→ Booked · ${HOTEL_RESULT.name} · conf #K4Q7TM · 2.5s`,
    tabs: ['booking.com — Kyoto', 'hyatt.com', 'expedia.com'],
    url: 'booking.com/searchresults.html?ss=Kyoto&checkin=…',
    inputs: [
      ['Kyoto, Japan', '2 guests'],
      ['Check-in Oct 9', 'Check-out Oct 12'],
    ],
    btn: 'Search hotels',
    steps: [
      'Opening booking.com',
      'Accepting cookie banner',
      'Typing "Kyoto"',
      'Picking check-in date',
      'Picking check-out date',
      'Clicking Search',
      'Waiting for results…',
      'Filtering under $200',
      'Reading room options',
      'Session expired — reloading',
      'Re-entering dates',
      'Solving captcha…',
    ],
    sc: ['load', 'form', 'form', 'form', 'form', 'load', 'load', 'results', 'results', 'load', 'form', 'captcha'],
    bmTok: 1186,
    bmCost: 0.02,
    bmSec: 2.5,
    webTok: 50640,
    webCost: 0.91,
    webSec: 236,
  },
  {
    name: 'Rent a car',
    prompt: 'rent a mid-size car in Denver, Fri to Mon',
    fn1: 'searchCars',
    fn2: 'bookCar',
    rows: [
      ['Budget · Elantra · downtown', '$139'],
      ['Hertz · Corolla · DEN airport', '$146'],
      ['Avis · Mazda 3 · DEN airport', '$158'],
    ],
    cTitle: 'Booked ✓',
    cPrice: '$139',
    cSub: 'Budget · Hyundai Elantra · Fri 10a → Mon 10a · #RC77218',
    final: 'Done — Budget downtown, $139 total.',
    lib: 'bookCar',
    args: [
      ['city', '"DEN"'],
      ['size', '"midsize"'],
      ['dates', '"fri-mon"'],
    ],
    out: '→ Booked · Budget · #RC77218 · 2.1s',
    tabs: ['hertz.com — Reservations', 'avis.com', 'budget.com'],
    url: 'hertz.com/rentacar/reservation/…',
    inputs: [
      ['Denver (DEN)', 'Mid-size'],
      ['Fri, Oct 9', 'Mon, Oct 12'],
    ],
    btn: 'Find cars',
    steps: [
      'Opening hertz.com',
      'Dismissing promo modal',
      'Typing "Denver"',
      'Picking a location',
      'Setting pickup date',
      'Setting return date',
      'Clicking Find cars',
      'Waiting for results…',
      'Comparing insurance add-ons',
      'Session expired — reloading',
      'Re-selecting dates',
      'Solving captcha…',
    ],
    sc: ['load', 'form', 'form', 'form', 'form', 'form', 'load', 'load', 'results', 'load', 'form', 'captcha'],
    bmTok: 1078,
    bmCost: 0.02,
    bmSec: 2.1,
    webTok: 52990,
    webCost: 0.95,
    webSec: 287,
  },
  {
    name: 'Get a quote',
    prompt: 'get me an insurance quote for a 2022 Outback',
    fn1: 'getQuote',
    fn2: null,
    rows: [
      ['Geico · full coverage', '$94/mo'],
      ['Progressive · full coverage', '$101/mo'],
      ['State Farm · full coverage', '$112/mo'],
    ],
    cTitle: 'Best quote ✓',
    cPrice: '$94/mo',
    cSub: 'Geico · full coverage · 2022 Subaru Outback',
    final: 'Geico is cheapest at $94/mo — want me to start the application?',
    lib: 'getQuote',
    args: [
      ['vehicle', '"2022 Outback"'],
      ['coverage', '"full"'],
    ],
    out: '→ 3 quotes · best $94/mo · 1.9s',
    tabs: ['geico.com — Quote', 'progressive.com', 'statefarm.com'],
    url: 'geico.com/auto-insurance-quote/…',
    inputs: [
      ['2022 Subaru Outback', '94103'],
      ['Full coverage', '1 driver'],
    ],
    btn: 'Get my quote',
    steps: [
      'Opening geico.com',
      'Entering ZIP code',
      'Typing VIN',
      'Answering 14 questions',
      'Creating an account…',
      'Verifying email',
      'Re-entering vehicle info',
      'Waiting for quote…',
      'Comparing tiers',
      'Repeating on progressive.com',
      'Answering 17 questions',
      'Solving captcha…',
    ],
    sc: ['load', 'form', 'form', 'form', 'form', 'load', 'form', 'load', 'results', 'load', 'form', 'captcha'],
    bmTok: 911,
    bmCost: 0.02,
    bmSec: 1.9,
    webTok: 61890,
    webCost: 1.12,
    webSec: 264,
  },
  {
    name: 'Compare prices',
    prompt: 'find the cheapest 65" OLED with delivery this week',
    fn1: 'comparePrices',
    fn2: null,
    rows: [
      ['Costco · LG C4 65"', '$1,299'],
      ['Amazon · LG C4 65"', '$1,347'],
      ['Best Buy · LG C4 65"', '$1,399'],
    ],
    cTitle: 'Best price ✓',
    cPrice: '$1,299',
    cSub: 'Costco · LG C4 65" · delivery Thursday',
    final: 'Costco wins at $1,299 with Thursday delivery.',
    lib: 'comparePrices',
    args: [
      ['query', '"65 inch OLED"'],
      ['delivery', '"this week"'],
    ],
    out: '→ 14 retailers · best $1,299 · 2.4s',
    tabs: ['bestbuy.com — TVs', 'amazon.com', 'costco.com'],
    url: 'bestbuy.com/site/searchpage.jsp?st=65+oled…',
    inputs: [
      ['65" OLED TV', '94103'],
      ['Sort: price', 'In stock'],
    ],
    btn: 'Search',
    steps: [
      'Opening bestbuy.com',
      'Closing membership popup',
      'Searching "65 OLED"',
      'Applying filters',
      'Reading 24 listings',
      'Opening amazon.com',
      'Comparing the same model',
      'Checking delivery dates',
      'Opening costco.com',
      'Sign-in required…',
      'Re-checking price',
      'Comparing totals…',
    ],
    sc: ['load', 'form', 'form', 'form', 'results', 'load', 'results', 'results', 'load', 'form', 'results', 'results'],
    bmTok: 1322,
    bmCost: 0.03,
    bmSec: 2.4,
    webTok: 74102,
    webCost: 1.38,
    webSec: 341,
  },
];

/**
 * The replay runs both lanes off ONE simulated clock, `sim` (seconds of task
 * time). Each lane's elapsed time is `min(sim, laneSec)`, so the two timers
 * always tick at the same speed and each stops at its own figure.
 *
 * The clock plays at real time (1×) until Bowmark has finished and the reader
 * has seen the browser agent keep going for `holdSec`; from then on the shared
 * clock — not one lane — runs at `ffRate`× for the browser agent's remainder.
 *
 *   rate(sim) = 1       while sim < bmSec + holdSec
 *             = ffRate  after that
 *   end       = max(bmSec, webSec)
 */
export const REPLAY = {
  holdSec: 2,
  ffRate: 25,
} as const;

/** sim time at which the shared clock switches to fast-forward */
export const ffStart = (task: Task) => Math.min(replayEnd(task), task.bmSec + REPLAY.holdSec);

/** sim time at which the replay is over */
export const replayEnd = (task: Task) => Math.max(task.bmSec, task.webSec);

/** the shared clock's current speed multiplier */
export const replayRate = (task: Task, sim: number) => (sim < ffStart(task) ? 1 : REPLAY.ffRate);

/**
 * Advance the shared clock by `wallSec` of wall time, splitting the step
 * exactly where it crosses from real time into fast-forward.
 */
export const advanceReplay = (task: Task, sim: number, wallSec: number): number => {
  const ff = ffStart(task);
  let next: number;
  if (sim >= ff) {
    next = sim + wallSec * REPLAY.ffRate;
  } else {
    next = sim + wallSec;
    if (next > ff) next = ff + (next - ff) * REPLAY.ffRate;
  }
  return Math.min(replayEnd(task), next);
};

export const HEADLINE = 'Up to 20x faster than browser agents.';

export const LANES = {
  bowmark: { title: 'Bowmark', desc: 'Skip the browser and get the job done.' },
  agent: {
    title: 'Browser agent',
    desc: 'Needs inefficient tools to read and interact with websites.',
  },
} as const;
