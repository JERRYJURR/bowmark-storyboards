/**
 * Original artwork for the second half of B1.
 *
 * `KyotoInn` is the thumbnail on the result card: an illustrated machiya-style
 * inn at dusk — tiled roofs, shoji panels lit from within, a noren curtain, a
 * lantern and a small garden. It depicts the *kind* of stay the call returns;
 * it is not a photograph of, or a claim about, any real property.
 *
 * `DestinationMark` is the low-contrast silhouette used behind the run — four
 * motifs cycled across the destination grid.
 */

export function KyotoInn() {
  return (
    <svg
      className="inn"
      /* Framed on the building, not the sky: the crop starts below the upper
         hills so the facade, the lit shoji and the garden are always in shot,
         portrait on desktop and landscape when the card stacks on a phone. */
      viewBox="0 88 168 112"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="inn-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1a2230" />
          <stop offset="0.62" stopColor="#222b39" />
          <stop offset="1" stopColor="#2a3140" />
        </linearGradient>
        <linearGradient id="inn-glow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f0c98a" stopOpacity="0.92" />
          <stop offset="1" stopColor="#e2a862" stopOpacity="0.78" />
        </linearGradient>
        <radialGradient id="inn-lamp" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffd79a" stopOpacity="0.55" />
          <stop offset="1" stopColor="#ffd79a" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect y="80" width="168" height="120" fill="url(#inn-sky)" />

      {/* distant hills, just above the roofline */}
      <path d="M0 112c22-10 40-2 58-8s40-12 58-6 34 12 52 10v22H0z" fill="#131a25" opacity=".9" />

      {/* upper roof */}
      <path d="M14 122l70-30 70 30-12 6H26z" fill="#10151f" />
      <path d="M26 128h116v5H26z" fill="#1b2330" />

      {/* facade */}
      <rect x="30" y="133" width="108" height="46" fill="#1d2430" />
      {/* shoji panels, lit */}
      <g>
        <rect x="37" y="139" width="22" height="26" rx="1.5" fill="url(#inn-glow)" opacity=".9" />
        <rect x="63" y="139" width="22" height="26" rx="1.5" fill="url(#inn-glow)" opacity=".72" />
        <rect x="89" y="139" width="22" height="26" rx="1.5" fill="url(#inn-glow)" opacity=".85" />
        <rect x="115" y="139" width="16" height="26" rx="1.5" fill="url(#inn-glow)" opacity=".55" />
        {/* lattice */}
        <g stroke="#2a3140" strokeWidth="1" opacity=".55">
          <path d="M37 148h94M37 157h94M48 139v26M74 139v26M100 139v26M123 139v26" />
        </g>
      </g>

      {/* lower eave */}
      <path d="M22 168h124l-8 7H30z" fill="#10151f" />

      {/* noren curtain over the entrance */}
      <g>
        <rect x="66" y="175" width="36" height="14" fill="#223042" />
        <path d="M78 175v14M90 175v14" stroke="#1a2230" strokeWidth="1.2" />
      </g>

      {/* lantern */}
      <circle cx="46" cy="180" r="14" fill="url(#inn-lamp)" />
      <g>
        <rect x="42.5" y="172" width="7" height="11" rx="3.5" fill="#f4d9a8" />
        <path d="M46 168v4" stroke="#0f141d" strokeWidth="1.2" />
      </g>

      {/* garden: pine and stepping stones */}
      <g opacity=".9">
        <path d="M130 189v-12" stroke="#0f141d" strokeWidth="2" />
        <path d="M122 177c4-6 12-6 16 0-4 3-12 3-16 0z" fill="#16202a" />
        <path d="M124 170c3-5 10-5 13 0-3 2-10 2-13 0z" fill="#1a2632" />
      </g>
      <g fill="#161d29">
        <ellipse cx="60" cy="193" rx="7" ry="2.6" />
        <ellipse cx="78" cy="196" rx="7" ry="2.6" />
        <ellipse cx="96" cy="192" rx="7" ry="2.6" />
      </g>

      <rect y="80" width="168" height="120" fill="#0f1115" opacity=".14" />
    </svg>
  );
}

/* Filled architectural silhouettes rather than thin outlines — they read as
   places at a glance while still sitting quietly under the scrim. */
const MOTIFS = [
  /* torii and pagoda */
  <g key="a" fill="currentColor">
    <path d="M6 18h36v4H6zM9 23h30v3H9z" />
    <rect x="13" y="26" width="4" height="18" />
    <rect x="31" y="26" width="4" height="18" />
    <path d="M44 26h18l-3 4H47zM46 32h14l-3 4H49zM48 38h10v6H48z" />
  </g>,
  /* tower cluster */
  <g key="b" fill="currentColor">
    <rect x="8" y="24" width="11" height="20" />
    <path d="M25 44V14l7-6 7 6v30z" />
    <rect x="45" y="29" width="11" height="15" />
    <rect x="31" y="6" width="2" height="4" />
  </g>,
  /* domes and arches */
  <g key="c" fill="currentColor">
    <path d="M8 44V32a10 10 0 0 1 20 0v12z" />
    <path d="M32 44V34a7 7 0 0 1 14 0v10z" />
    <rect x="48" y="30" width="8" height="14" />
    <path d="M17 22v-5h2v5z" />
  </g>,
  /* coast and hills */
  <g key="d" fill="currentColor">
    <path d="M0 44l18-18 12 11 11-15 23 22z" />
    <path d="M40 22l6-6 6 6z" opacity=".7" />
  </g>,
];

export function DestinationMark({ index }: { index: number }) {
  return (
    <svg className="imp__mark" viewBox="0 0 64 48" aria-hidden="true" focusable="false">
      {MOTIFS[index % MOTIFS.length]}
    </svg>
  );
}
