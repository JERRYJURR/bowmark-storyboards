/**
 * Beat table for B1 / first half (v5 `conv(pA)`), as data.
 *
 * `p` here is 0..1 across the B1 scroll track and maps 1:1 onto the
 * prototype's `pA = min(1, prog('b1') / 0.5)`. Every number below is lifted
 * verbatim from `Bowmark Prototype v5.dc.html` so the narrative timing
 * survives the port. The human-readable version lives in docs/beat-table.md.
 */

/**
 * B1 is one sticky track carrying both halves of v5's `beat1`.
 *
 *   raw 0 .. SCENE_SPLIT   -> conv(pA)  the bento, the selection, the wall
 *   raw SCENE_SPLIT .. 1   -> imp(pB)   the import, the run, the result
 *
 * The track is 1040vh, so the scrolled distance is 940vh and the first half
 * keeps exactly the 520vh it had before the second half existed.
 */
export const SCENE_SPLIT = 520 / 940;

/** local progress of the first half */
export const convProgress = (raw: number): number => Math.min(1, raw / SCENE_SPLIT);

/** local progress of the second half */
export const importProgress = (raw: number): number => {
  const t = (raw - SCENE_SPLIT) / (1 - SCENE_SPLIT);
  return t < 0 ? 0 : t > 1 ? 1 : t;
};

/** the two halves cross over in this window of raw progress */
export const HANDOFF: readonly [number, number] = [SCENE_SPLIT - 0.012, SCENE_SPLIT + 0.006];

export const BEATS = {
  /** hero hatch + install block fade out, headline rises to its running position */
  heroOut: [0.035, 0.095] as const,
  /** stage becomes visible */
  stageIn: [0.075, 0.105] as const,

  /** headline beat swaps (index 0 -> 1 -> 2 -> 3) */
  headline1: [0.12, 0.145] as const,
  headline2: [0.5, 0.525] as const,
  headline3: [0.925, 0.965] as const,

  /** surface cards rise: start = riseStart + ord(i) * riseStep, length riseLen */
  riseStart: 0.1,
  riseStep: 0.034,
  riseLen: 0.105,
  /** arrival order by surface slot — YouTube, Amazon, Kayak, Calendly, Google Maps */
  riseOrder: [4, 1, 3, 2, 0] as const,

  /** the Bowmark cursor: visible, enters, drags a marquee, exits */
  cursorOn: [0.3, 0.33] as const,
  cursorOff: [0.518, 0.556] as const,
  cursorEnter: [0.315, 0.35] as const,
  cursorDrag: [0.355, 0.455] as const,
  cursorExit: [0.505, 0.555] as const,
  marqueeOn: [0.352, 0.372] as const,
  marqueeOff: [0.5, 0.54] as const,

  /** each card's three windows wipe from live surface to provider code */
  flipStart: 0.468,
  flipEnd: 0.5,
  /** per-card offset = cellCentreFactor * flipSkew; per-window stagger 0.11 */
  flipSkew: 0.075,
  flipWindowStagger: 0.11,

  /** light sweep across the stage */
  sweep: [0.46, 0.59] as const,
  sweepWindow: [0.455, 0.6] as const,

  /* Brands pass (2026-09-22): each site card becomes its own capability
     card. Cards go in the capability fan's paint order (back to front), so
     each one lands on top of the ones already there. */

  /** a card's morph: start = morphStart + k * morphStep (k = paint order), length morphLen */
  morphStart: 0.6,
  morphStep: 0.034,
  morphLen: 0.19,

  /** the card's small print turns from its domain to the provider module: fraction of a card's flip */
  labelSwap: [0.4, 0.85] as const,
} as const;

/**
 * Second half — v5's `imp(p)`, verbatim ranges.
 *
 * `p` is 0..1 across the second half of the track.
 */
export const IMPORT_BEATS = {
  /** the chosen capability (Kayak) straightens and lifts to centre */
  swap: [0.03, 0.17] as const,
  /** the sibling capabilities slide out past the stage edges */
  ghostsOut: [0.1, 0.19] as const,
  /** the chosen capability collapses into an inline import token */
  collapse: [0.17, 0.29] as const,
  /** the agent types the call */
  type: [0.32, 0.6] as const,
  /** the Agent caret label, and the caret itself */
  agentTag: [0.3, 0.35] as const,
  agentTagOut: [0.58, 0.625] as const,
  /** Enter — the frame takes a focus ring */
  enter: [0.615, 0.655] as const,
  /** the stage masks in from the top as execution starts */
  exec: [0.62, 0.7] as const,
  /** the run block arrives, then its progress */
  runIn: [0.66, 0.71] as const,
  runProgress: [0.7, 0.855] as const,
  /** destinations settle behind the content while it runs */
  backdrop: [0.68, 0.84] as const,
  /** "Found a hotel." */
  found: [0.855, 0.9] as const,
  /** the result card */
  result: [0.88, 0.96] as const,
} as const;

/** ord(i) — position of surface i in the arrival order */
export const riseOrdinal = (i: number): number => BEATS.riseOrder.indexOf(i as 0 | 1 | 2 | 3 | 4);
