/**
 * F6 — "Fair questions." The six questions and their order are v5's. v5 gives
 * one answer ("Free to start, then metered.") and one pointer (business →
 * Broadcast, which is paused, so it points to the support inbox); the other answers are written conservatively from what the page
 * itself already shows, and make no new pricing, coverage or performance claim.
 */

export type FaqPart = string | { text: string; href: string };

export interface FaqItem {
  id: string;
  q: string;
  a: FaqPart[][];
  /** v5 shows the cost question expanded */
  open?: boolean;
}

export const FAQ_TITLE = 'Fair questions.';

export const FAQ: FaqItem[] = [
  {
    id: 'crawler',
    q: 'Is this a crawler or a scraper?',
    a: [
      [
        'Not in the way you might expect. Instead of your agent loading and reading pages every time, Bowmark describes what a site can do as typed functions — like searchFlights() or bookHotel() — that return structured results. Your agent calls the function rather than driving a browser.',
      ],
    ],
  },
  {
    id: 'agents',
    q: 'Which agents does it work in?',
    a: [
      [
        'ChatGPT, Claude, Claude Code, Codex, GitHub Copilot and Cursor, plus anything else that speaks MCP. Windsurf is coming soon. In your own code you can use npx, npm, pip or raw HTTP.',
      ],
      ['Setup for each one is in ', { text: 'Connect', href: '#connect' }, '.'],
    ],
  },
  {
    id: 'cost',
    q: 'What does it cost?',
    open: true,
    a: [['Free to start, then metered.'], ['Current details are in the ', { text: 'docs', href: 'https://bowmark.ai/docs' }, '.']],
  },
  {
    id: 'tokens',
    q: 'Does it use up my tokens?',
    a: [
      [
        'Your model still spends tokens on the conversation and on the results it reads. Because a capability returns compact, typed data rather than whole web pages, there is usually far less for it to read than when it works through a browser step by step.',
      ],
    ],
  },
  {
    id: 'coverage',
    q: 'What if the site I want isn’t covered?',
    a: [
      [
        'Tell us the site and what you want to do on it at ',
        { text: 'support@bowmark.ai', href: 'mailto:support@bowmark.ai' },
        '. In the meantime your agent can keep using its usual tools for that site.',
      ],
    ],
  },
  {
    id: 'business',
    q: 'Can I use this for my business?',
    a: [
      [
        'Yes. For business questions, write to ',
        { text: 'support@bowmark.ai', href: 'mailto:support@bowmark.ai' },
        '.',
      ],
    ],
  },
];
