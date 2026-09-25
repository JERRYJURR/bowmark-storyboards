/**
 * Every destination used by the header, footer and closing sections.
 *
 * External URLs are limited to ones verified on the live bowmark.ai homepage
 * (docs, terms, support address, the X account it links as "Bowmark on X") and
 * the plugin marketplace repository the live install panel installs from
 * (`bowmark-ai/plugin`). In-page anchors resolve on both `/` and `/proto/hero`.
 */

/**
 * Sign in goes to an external portal whose URL is not decided yet. Set
 * `PUBLIC_SIGN_IN_URL` at build time (e.g. in `.env`) and the header shows
 * the link; leave it unset and the link is omitted. There is no auth flow on
 * this site — it only ever links out.
 */
const signInUrl = (import.meta.env.PUBLIC_SIGN_IN_URL as string | undefined)?.trim();

export const LINKS = {
  connect: '#connect',
  /** "Get started" (header and hero) — the install section. */
  getStarted: '#connect',
  /** Broadcast is paused (not rendered); kept for when the section returns. Not in any nav. */
  broadcast: '#broadcast',
  faq: '#faq',
  docs: 'https://bowmark.ai/docs',
  github: 'https://github.com/bowmark-ai/plugin',
  x: 'https://x.com/Metroxe',
  legal: 'https://bowmark.ai/terms',
  support: 'mailto:support@bowmark.ai',
  supportAddress: 'support@bowmark.ai',
  /** Broadcast "Book a call" — no booking destination exists; the support inbox is the real one. */
  bookCall: 'mailto:support@bowmark.ai?subject=Bowmark%20Broadcast%20call',
  /** External sign-in portal, or undefined until configured. */
  signIn: signInUrl ? signInUrl : undefined,
} as const;

export type NavItem = { label: string; href: string; external?: boolean };

/** Paper header (all frames): Bowmark AI · Broadcast · Docs | Sign in · Get started — Broadcast paused */
export const HEADER_NAV: NavItem[] = [
  { label: 'Docs', href: LINKS.docs, external: true },
];

/**
 * The phone disclosure menu has room for the rest of the previous header
 * (FAQ, GitHub) so nothing that was reachable from the top disappears.
 */
export const HEADER_MENU: NavItem[] = [
  ...HEADER_NAV,
  { label: 'FAQ', href: LINKS.faq },
  { label: 'GitHub', href: LINKS.github, external: true },
];

/** Footer: Connect · FAQ · Docs · GitHub · Contact · X · Legal (the Paper frames do not show a footer; Broadcast paused) */
export const FOOTER_NAV: NavItem[] = [
  { label: 'Connect', href: LINKS.connect },
  { label: 'FAQ', href: LINKS.faq },
  { label: 'Docs', href: LINKS.docs, external: true },
  { label: 'GitHub', href: LINKS.github, external: true },
  { label: 'Contact', href: LINKS.support, external: true },
  { label: 'X', href: LINKS.x, external: true },
  { label: 'Legal', href: LINKS.legal, external: true },
];
