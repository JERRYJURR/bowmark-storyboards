import { TARGET_LOGO } from '../scene/content';
import type { ConnectGlyph } from '../scene/connect';

/**
 * Small marks for the closing sections. Brand marks come from the install
 * block's `TARGET_LOGO` (the exported prototype SVGs); destinations without an
 * exported mark get a neutral generic glyph rather than an imitation logo.
 */

const GENERIC: Record<Exclude<ConnectGlyph, keyof typeof TARGET_LOGO>, string> = {
  editor: 'M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5v-13ZM4 8.5h16M9 12.5l-2 2 2 2M15 12.5l2 2-2 2',
  mcp: 'M9 4v4M15 4v4M7 8h10v3a5 5 0 0 1-10 0V8ZM12 16v4',
  terminal: 'M4 6.5A1.5 1.5 0 0 1 5.5 5h13A1.5 1.5 0 0 1 20 6.5v11a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5v-11ZM7.5 10l2.5 2-2.5 2M12 14.5h4.5',
  package: 'M12 3.5 19.5 7.5v9L12 20.5 4.5 16.5v-9L12 3.5ZM4.5 7.5 12 11.5l7.5-4M12 11.5v9',
  http: 'M9 4.5c-2 0-2.5 1-2.5 2.5v2.5c0 1.2-.8 2.5-2 2.5 1.2 0 2 1.3 2 2.5V17c0 1.5.5 2.5 2.5 2.5M15 4.5c2 0 2.5 1 2.5 2.5v2.5c0 1.2.8 2.5 2 2.5-1.2 0-2 1.3-2 2.5V17c0 1.5-.5 2.5-2.5 2.5',
};

export function Glyph({ name, size = 18 }: { name: ConnectGlyph | keyof typeof TARGET_LOGO; size?: number }) {
  if (name in TARGET_LOGO) {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" focusable="false">
        <path d={TARGET_LOGO[name as keyof typeof TARGET_LOGO]} fill="currentColor" fillRule="evenodd" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" focusable="false">
      <path
        d={GENERIC[name as keyof typeof GENERIC]}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** The live concentric broken-circle mark, same geometry as `Logo.astro`. */
export function BowmarkMark({ size = 22 }: { size?: number }) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden="true" focusable="false">
      <path d="M11.95 40.585C3.199 34.227 0.894 22.164 6.684 13.027C12.474 3.89 24.366 0.824 33.852 6.023C43.338 11.222 47.152 22.896 42.566 32.692" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M22.045 36.346C16.553 35.476 12.296 31.084 11.599 25.567C10.902 20.051 13.932 14.737 19.035 12.528C24.137 10.32 30.086 11.747 33.63 16.031C37.175 20.314 37.464 26.425 34.34 31.024" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      <circle cx="23.997" cy="24" r="6.001" fill="currentColor" />
    </svg>
  );
}

export function CopyIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false">
      <rect x="5.4" y="5.4" width="8.2" height="8.2" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M10.6 5.4V4.4a2 2 0 0 0-2-2H4.4a2 2 0 0 0-2 2v4.2a2 2 0 0 0 2 2h1"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function CheckIcon({ size = 14 }: { size?: number }) {
  return (
    <svg viewBox="0 0 16 16" width={size} height={size} aria-hidden="true" focusable="false">
      <path d="M3.5 8.5 6.5 11.5 12.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
