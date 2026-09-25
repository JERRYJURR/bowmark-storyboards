/**
 * F5 — Bowmark Broadcast. A quiet two-column section: a stack of four product
 * screens with a short caption on the left, a static heading, one paragraph
 * and the call on the right.
 *
 * Copy stays inside what the page already says (FAQ: "If you run a site or an
 * API and want agents to be able to use it, that is what Broadcast is for";
 * a site's actions are described as typed functions that return structured
 * results, which an agent calls instead of driving a browser; the agents
 * Bowmark works in). No figures, no customers: `yourhotel.com` is a
 * placeholder and every value inside the screens is illustration only.
 */

export type BroadcastScreenId = 'site' | 'tools' | 'assistant' | 'agent';

export interface BroadcastSlide {
  id: BroadcastScreenId;
  /** accessible name of the slide's tab */
  label: string;
  /** caption title under the stack */
  title: string;
  /** one sentence under the caption title */
  text: string;
  /** read by assistive tech in place of the decorative screen */
  describe: string;
}

export const BROADCAST_SLIDES: BroadcastSlide[] = [
  {
    id: 'site',
    label: 'Your site',
    title: 'Start from the site you run',
    text: 'Bring the website or API your customers already use.',
    describe:
      'Illustration: the room page of yourhotel.com, a garden view king room in Kyoto, with check-in May 14, check-out May 16, 2 adults and a Check availability button.',
  },
  {
    id: 'tools',
    label: 'Typed tools',
    title: 'Its actions become typed tools',
    text: 'Search, look up and book, each described with clear inputs and a structured result.',
    describe:
      'Illustration: Broadcast lists three tools for yourhotel.com — searchRooms, getRoom and bookRoom. searchRooms takes a city, check-in and check-out dates and a number of guests, and returns a list of rooms.',
  },
  {
    id: 'assistant',
    label: 'In the assistant',
    title: 'Answered inside the assistant',
    text: 'A guest asks. The assistant calls your tool and replies with your room, linked back to you.',
    describe:
      'Illustration: in an assistant, a guest asks for a garden-view room in Kyoto for two, May 14 to 16. The assistant calls searchRooms on yourhotel.com and answers with the garden view king room and a Book on yourhotel.com button.',
  },
  {
    id: 'agent',
    label: 'Agents and your API',
    title: 'Callable by agents, too',
    text: 'Coding agents and other MCP clients call the same tools and get structured results back.',
    describe:
      'Illustration: an agent in a terminal checks whether the garden view king at yourhotel.com is free May 14 to 16. It calls searchRooms and getRoom, reads the structured results and offers to book. The same tools are available in ChatGPT, Claude, Codex, Cursor and other MCP clients where Bowmark is installed.',
  },
];

export const BROADCAST_TITLE = 'Bowmark Broadcast';
export const BROADCAST_BODY =
  'Make your website or API callable by AI. Give assistants the tools to search, check availability and book with you directly.';
export const BROADCAST_AUDIENCE = 'For teams that run a site or an API.';
export const BROADCAST_CTA = 'Book a call';
export const BROADCAST_TABS_LABEL = 'Broadcast examples';

/* --- values inside the screens (illustration only) --------------------------- */

export const SITE = {
  domain: 'yourhotel.com',
  path: '/rooms/garden-king',
  brand: 'Yourhotel',
  city: 'Kyoto',
  nav: ['Rooms', 'Dining', 'Location'],
  photo: '/images/stays/hotel-garden.jpg',
  thumbs: ['/images/stays/hotel-garden.jpg', '/images/stays/hotel-twin.jpg', '/images/stays/park-kyoto-exterior.jpg'],
  wing: 'Garden wing',
  room: 'Garden view king',
  meta: 'King bed · Sleeps 2 · Garden view',
  rate: 'from ¥38,000',
  rateUnit: '/ night',
  checkIn: 'May 14',
  checkOut: 'May 16',
  guests: '2 adults',
  action: 'Check availability',
} as const;

export interface BroadcastTool {
  name: string;
  summary: string;
  from: string;
}

export const TOOLS: BroadcastTool[] = [
  { name: 'searchRooms', summary: 'Find available rooms for a city and dates.', from: 'Rooms search form' },
  { name: 'getRoom', summary: 'Details for one room.', from: 'Room page' },
  { name: 'bookRoom', summary: 'Book a room for a guest.', from: 'Booking form' },
];

/** searchRooms, opened: its inputs and what it returns */
export const TOOL_INPUTS = [
  { name: 'city', type: 'string', example: '"Kyoto"' },
  { name: 'checkIn', type: 'date', example: '"2027-05-14"' },
  { name: 'checkOut', type: 'date', example: '"2027-05-16"' },
  { name: 'guests', type: 'integer', example: '2' },
] as const;
export const TOOL_RETURNS = 'rooms[]  id · name · bed · nightlyRate · photo';

export const CHAT = {
  history: [
    { group: 'Today', items: ['Kyoto in May', 'Packing list'] },
    { group: 'Previous 7 days', items: ['Niseko ski weekend', 'Tokyo dinner ideas'] },
  ],
  active: 'Kyoto in May',
  ask: 'A garden-view room in Kyoto for two, May 14–16?',
  call: 'searchRooms',
  lead: 'One match on yourhotel.com:',
  room: 'Garden view king',
  meta: 'May 14–16 · 2 guests · King bed',
  action: 'Book on yourhotel.com',
  composer: 'Ask anything',
} as const;

export const AGENT = {
  title: 'agent — trip-planner',
  ask: 'Is the garden-view king at yourhotel.com free May 14–16 for two?',
  calls: [
    {
      name: 'searchRooms',
      args: '{ city: "Kyoto", checkIn: "2027-05-14", checkOut: "2027-05-16", guests: 2 }',
      result: '↳ 1 room',
    },
    {
      name: 'getRoom',
      args: '{ id: "garden-king" }',
      result: '↳ { name: "Garden view king", bed: "king", available: true }',
    },
  ],
  answer: 'It’s free both nights. Want me to book it with bookRoom?',
  reachLabel: 'Same tools wherever Bowmark is installed',
} as const;

/** Agents the page already lists (FAQ, Connect); the last is the generic MCP mark. */
export const REACH = ['ChatGPT', 'Claude', 'Codex', 'Cursor'] as const;
