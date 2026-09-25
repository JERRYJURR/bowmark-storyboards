# Bowmark website

Astro + React + TypeScript rebuild of the Bowmark homepage.

The approved **Bowmark Broadcast Paper frames** are the visual source of truth.
See [the implementation map](docs/paper-implementation.md) for frame ownership,
configuration, and review status. Exact Paper exports are retained in
`design-reference/paper-2026-09-19/`.

The original `../Bowmark Prototype/Bowmark Prototype v5.dc.html` supplies the
interaction sequence. The new Paper layouts take priority; motion is adapted
to their geometry. Installation, FAQ, and footer sections follow the same light theme and component
vocabulary. Broadcast is temporarily unrendered; its source is retained for later.

## Scope

The page keeps the prototype’s section order:

| v5 | Section | Implementation |
| --- | --- | --- |
| header | Logo, Docs · configurable Sign in · Get started | `SiteHeader.astro` (mobile disclosure menu ≤640px) |
| B1 | Hero, install block, bento → `searchFlights()`, import → run → hotel | `HeroMilestone.astro` + islands (see `docs/beat-table.md`) |
| F1 | Same task, two ways | `ComparisonSection.tsx` |
| B4 | Every capability. One import. — real provider calls and icons | `CapabilityWall.tsx` |
| F4 | Install for free (`#connect`, alias `#f4`) | `ConnectSection.tsx` |
| F5 | Broadcast — temporarily removed from the page and navigation | Source retained in `BroadcastSection.tsx` + `BroadcastArt.tsx` |
| F6 | Fair questions. (`#faq`, alias `#f6`, per-question `#faq-<id>`) | `FaqSection.astro` |
| F8 | Footer | `SiteFooter.astro` |

Deliberately **not** built: **F3 library** and **F7 last CTA** — both are
`display:none` in v5.

B4 provider calls and function counts come from a pinned repository snapshot,
except Expedia, which replaces KAYAK as a user-approved illustrative API in
the prototype (2026-09-24). Its `searchHotels`, `getHotel`, `getRooms`, and
`listReviews` methods are examples, not implemented Bowmark functions. The
Expedia site mockup, capability card, import example, and provider-wall entry
use the same illustrative API. See [the provider wall report](docs/capability-wall-report.md). Other scene and
replay figures remain illustrative demo values. Nothing performs a booking, runs an install
command or makes a network request; the Connect and install commands are only
displayed and copied. `docs/completion-report.md` lists where v5's copy differs
from the live product.

## Scripts

```bash
npm install
npm run dev      # local dev server
npm run build    # static build to ./dist
npm run preview  # serve ./dist
npm run check    # astro check (types + templates)
```

## Routes

- `/` — the page.
- `/proto/hero` — the same tree, `noindex`, for review links and screenshots.

## Reviewing a specific point

`/?p=0.62` or `/proto/hero?p=0.62` scrolls straight to that point in the
**first** half of B1 (`p` = 0…1 across `conv`); `/?scene=import&p=0.5` does the
same for the **second** half (`imp`). Both map onto the one track through
`SCENE_SPLIT` in `src/scene/beats.ts`, replacing the prototype's
`window.__bmGo('b1', x)`.

Section anchors (`#f1`, `#b4`, `#connect`, `#faq` and the
`#f4` / `#f6` aliases) re-align while the islands above them hydrate and change
height, then let go as soon as the reader scrolls, touches, clicks or types.
Closing sections carry `scroll-margin-top` equal to the fixed header.

## Architecture

```
src/
  styles/fonts.css           @font-face for the local brand fonts
  styles/tokens.css          all design tokens + the scene CSS-variable channel
  styles/global.css          reset, body, shared button/panel primitives, .bm-anchor
  scene/progress.ts          scroll → 0..1, easing, colour mix (ported from DCLogic)
  scene/beats.ts             every B1 beat range as data (mirrors docs/beat-table.md)
  scene/content.ts           B1 + install block copy/data transcribed from v5
  scene/demo-data.ts         illustrative data for the surfaces and the result
  scene/tasks.ts             F1 replay data
  scene/capabilities.ts      B4 real provider calls (pinned repository snapshot)
  scene/connect.ts           F4 destinations (v5 dest())
  scene/broadcast.ts         F5 stories and graphic values (v5 bcast())
  scene/faq.ts               F6 questions and answers
  scene/links.ts             every nav/footer/external destination
  scene/hash-align.ts        keeps #anchors aligned while islands hydrate
  components/                Logo, SiteHeader, SiteFooter, Hero, FaqSection (.astro)
                             InstallBlock, DecompileScene, ImportScene,
                             ComparisonSection, CapabilityWall, ConnectSection,
                             BroadcastSection (.tsx islands + .css)
                             BentoTiles, TravelArt, StayPhotos, BroadcastArt,
                             Glyphs (presentational), useCopy (clipboard hook)
  sections/HeroMilestone.astro   the one sticky B1 track, 1040vh
  sections/ClosingSections.astro F4 + F6 (F5 retained but unrendered)
  pages/                     /, /proto/hero
```

**Boundaries.** Content and layout are static Astro HTML. Hydrated islands: the
install block, the two halves of B1, F1, B4 and F4. F6 is static HTML with
native `<details>` plus a few lines of script for hash handling; the header
menu is a small inline script. Neither B1 half re-renders while scrolling —
React renders structure once (and on resize), then one rAF-coalesced pass per
half writes styles and text through refs. The **first** half alone publishes
`--b1-hero-out`, `--b1-h0…3` and `--b1-p` on `<html>`.

**Motion.** Transform/opacity throughout, except the B1 tile merge and import
stack, where geometry genuinely morphs. Scrolling is native. F1's replay only advances while its section is on screen
and the tab is visible. B4 drifts up/down/up independently of page scroll,
and runs continuously without hover, focus or visibility pause logic. Under `prefers-reduced-motion` F1 shows its finished
state, B4 uses its static list, and the global rule collapses decorative
animation to its end state.

**Accessibility.** Animated B1 stages are `aria-hidden` with the narrative in
the hero. The compact install bar has two keyboard-operable listboxes. F4's
twelve destinations are one native radio group in two fieldsets. B4 keeps
three continuously drifting columns of expanded cards; narrow screens and
reduced motion use a static expanded list. Provider logos have empty alt text beside readable brand names. Copy buttons (install, F4) announce success
or the manual-copy fallback through `role="status"`. Under
`prefers-reduced-motion: reduce` **or** ≤860px the B1 halves are replaced by
static figures.

## Assets

Fonts are served locally from `public/fonts`. Exported prototype assets are in
`/reference-assets/`. Assistant marks (install block, F4, F5) are inlined SVG
paths from v5's `LOGO` map (`TARGET_LOGO`), so they inherit `currentColor`;
destinations without an exported mark (Copilot, Windsurf, generic MCP, npm/pip,
HTTP) use neutral generic glyphs, never imitation logos. Hotel photography and
its provenance are in `docs/photo-sources.md`; F5 reuses the Hyatt Place Kyoto
photo already used by B1. B4 favicons are local assets in
`public/images/providers/`; their sources are recorded in
`docs/provider-wall-sources.json`. No third-party favicon requests are made
by page visitors.

## Open items

- `SurfaceViews.tsx` / `SurfaceViews.css` are left over from the pre-bento
  version and are imported nowhere; they can be deleted.
- 1040vh for B1 is a proposal, not a measured choice — worth a feel check on a
  trackpad and a mouse wheel.
- Mobile *replaces* the B1 sequence rather than adapting it.
- Without JavaScript the ≤860px header menu cannot open; every destination is
  still in the footer.
- F4's commands and addresses, and "No account needed", are v5's and differ
  from the live install flow — see `docs/completion-report.md`.

## Account portal integration

Set `PUBLIC_SIGN_IN_URL` in the build environment to show Sign in in both
desktop navigation and the mobile menu. When unset, the link is omitted.
Authentication lives in the host project; this landing page links to it.
All Get started actions point to the installation section, `#connect`.
See `.env.example` for the configuration key.

## Verification and review

The Paper implementation has been reviewed at desktop and phone widths.
Final checks and known limitations are recorded in
[docs/paper-implementation.md](docs/paper-implementation.md). Older milestone
reports describe previous versions and do not override the approved Paper
frames.

Latest provider-wall and Broadcast-removal verification is in
[docs/capability-wall-report.md](docs/capability-wall-report.md). Earlier scene,
replay and button corrections are in
[docs/corrections-2026-09-19.md](docs/corrections-2026-09-19.md).

Replay data findings, visual references and the recommended Next.js homepage
port are in [docs/replay-and-integration-2026-09-21.md](docs/replay-and-integration-2026-09-21.md).
