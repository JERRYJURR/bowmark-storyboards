# Bowmark homepage — 3-variant storyboard spec (v2)

Handoff spec for Claude Design. Supersedes all earlier Bowmark briefs/specs. Read fully
before doing anything.

## The job

Storyboard **three variants of the same homepage** as low-fidelity wireframes. The variants
share a baseline structure and differ only on defined axes (hero, teaching order, evidence
register, S6 treatment, Broadcast placement, library entry). We are testing which lands
better; do not blend them into one design.

Deliverable format:

- **Film-style storyboard per variant** for the scrollytelling half: a sequence of keyframes
  (1440×900 viewport each) laid out as a labeled filmstrip, ~6–8 keyframes per variant.
  Annotation under each frame: variant, keyframe number, scroll beat, what's animating.
- **One wireframe of the functional half** (it is ~90% shared), plus small delta frames
  for the spots where variants differ (library entry, Broadcast placement).
- **Very low fidelity, grayscale only.** Boxes, hatching, placeholder shapes, real text
  beats. Animated/WebGL regions = diagonal-hatch placeholder + label. No invented visual
  identity yet — that comes after we pick a direction.
- **No eyebrow text. No overnested frames. Minimal copy** — the text beats in this spec are
  the only copy; do not add explanatory paragraphs.
- Stop after the storyboards. We iterate before fidelity goes up.

## Context

Bowmark's pitch: **a new web for AI — no URLs, no websites, no browser; just capabilities
that get called as code.** Audiences in priority order: (1) heavy AI-assistant users, who
convert by connecting Bowmark to the tool they already use; (2) developers, who convert by
installing from npm/pip; (3) businesses, whose answer is Broadcast (its own offering: we
make your product operable by agents and publish it everywhere agents look). All three are
allergic to marketing language. Desktop-first; mobile is explicitly deferred, but no scene
may depend on a mechanic with no plausible mobile fallback.

## Naming model (used in every variant — do not deviate)

```
searchFlights()             ← capability (task-named, verb-first)
  ├─ googleFlights.search() ← provider functions (company-named)
  ├─ delta.search()
  └─ expedia.compare()
```

- A capability call **fans out** to providers and merges results into one typed result.
- Fan-out applies to search/compare-type capabilities. Transactional capabilities
  (`bookFlight()`) commit to ONE provider. Where the story needs both: fire
  `searchFlights()` (fan-out, merged results), then `bookFlight()` as a single-provider
  follow-up. Never show a booking merging across providers.
- One provider can appear in multiple capabilities.
- Company names here are placeholders; final logos come from a vetted list. A fictional
  demo brand ("Acme" for now) is used wherever a full company must be dissected.
- Vocabulary: capability, provider, function, call, typed result, script, run. Never:
  cheatsheet, shortcut, procedure, crawl, scrape, "browse the web."

## Baseline requirements (apply to ALL THREE variants — not test axes)

1. **Five comparisons minimum** in the demos section: one hero "race" + four compact units.
2. **Every number shown is a real measurement or absent.** No scripted counters. Wireframes
   mark number slots as `[REAL # ]` placeholders.
3. A **methodology line** sits under the demo numbers: "measured [date], [model] —
   methodology on GitHub."
4. The comparison unit's Bowmark side is **static, real, syntax-highlighted code + typed
   result** — not a video of code. The browser-agent side is a real screen recording.
   Token count rendered as a horizontal bar growing rightward, both sides on ONE shared
   time axis, synced to recording playback. Literal numbers (tokens biggest, then cost,
   time, steps) beside each side.
5. The collapse scene shows **all five surface types**: website flows, MCP servers, public
   APIs, CLIs, SDKs/feeds/structured data — each in its native visual costume, each getting
   its own beat (no 3× blur).
6. **Navbar**: wordmark · Broadcast · FAQ · GitHub · primary CTA **"Connect"** (opens the
   connect destination picker / jumps to the connect surface — a real action, not "Get
   started").
7. GitHub docs link appears in nav, connect surface, and footer.
8. Demo-brand fiction is declared, never discovered ("Acme is our demo brand" microcopy).

## Shared functional half (identical across variants unless noted)

**F1 — The demos ("the receipts")** — hero race full-bleed (the browser-agent recording vs
static code + result, shared time axis, bars racing), then four compact stacked units with
a task switcher. Autoplay on scroll-into-view, one active at a time.

**F2 — Two doors** — split panel, static (no typing animations): left = chat context
showing a natural-language request and the REAL tool-call card UI as users see it in
Claude/ChatGPT (user never sees code on this side); right = editor context showing
`npm install bowmark` + import + call + typed result. Each pane carries its own CTA
(Connect / Install).

**F3 — The live library** — real library data, searchable in place, capabilities grouped by
domain (Travel, Shopping, Finance, Research, Dev…). Each capability exposes: signature,
typed args, one example call with a real recorded response, and its **provider functions**
(e.g. `delta.search()`) — not just company logo chips. Per-capability deep links. A
"Request a capability" affordance for gaps. Live counts only if genuinely live; include
loading/unavailable states. **Entry treatment varies per variant — see below.**

**F4 — Connect surface** — two visibly grouped clusters in one section: (a) assistants —
ChatGPT, Claude (desktop and web), Claude Code, Codex, Copilot, Cursor, + repeatable
long-tail MCP pattern; (b) code — npm (`npx` and `npm install` distinct), pip, raw HTTP.
Click a tile → copy-paste instructions expand without reflowing the grid (detail strip
below the grid). Copy button on tile face. "Coming soon" as quiet badge. "No account
needed" stated. GitHub link for deeper docs.

**F5 — Broadcast section** — the business door. Register shift. Substantive section, not a
card: what it is (2 lines max), the Acme demo teaser (product working inside ChatGPT),
where-we-publish hint, CTA "Book a call" → /broadcast. **Placement varies per variant.**

**F6 — FAQ block** — these questions answered fully in place: Is this a crawler or a
scraper? · Which agents does it work in? · What does it cost? (one line: free to start,
then metered) · Does it use up my tokens? · What if the site I want isn't covered? · Can I
use this for my business? (→ Broadcast). Link to /faq.

**F7 — Last CTA** — repeats top connect destinations + the npm one-liner + pip. Nothing new.

**F8 — Footer** — wordmark, Broadcast, FAQ, GitHub, Contact, X, legal.

---

## VARIANT 1 — "Manifesto" (the original direction)

Hypothesis: an abstract, manifesto-register opening makes Bowmark read as a company
revolutionizing a field, not selling a product.

- **Hero (100vh):** abstract branded shader (hatched placeholder), headline "Remaking the
  web for AI", scroll cue. Navbar Connect CTA is the only action.
- **V1-S1 — a website decompiles (pinned):** browser + address bar navigates to a
  feature-rich site (Acme or vetted brand). Interactive components morph one by one:
  physical UI → wireframe → labeled function box (`acme.search()` …). First morph slow
  (teach the grammar), rest accelerate. Address bar dissolves last. End state: provider
  stack under the provider name.
- **V1-S2 — everything collapses (pinned):** the five surfaces (per baseline #5), each its
  own beat, same morph grammar. Ending reveal: all provider stacks slide under one
  capability box — `searchFlights()`. First appearance of the capability level.
- **V1-S3 — fire it (pinned):** chat window, prompt "find me a flight to Tokyo next
  weekend." Real tool-call card fires `searchFlights()`; fan-out lines flash to providers;
  merged typed result returns. Optional follow-up beat: `bookFlight()` commits to one
  provider. Numbers: `[REAL #]` from demo #1 or none.
- **V1-S4 — meanwhile (pinned):** S3's result slides aside, still visible; real recording
  of a browser agent doing the same task enters mid-struggle, token counter ticking (real
  footage, real final totals shown when it ends).
- **V1-S5 →** functional half F1 (race = its own demo #1, restated with full numbers).
- **V1-S6 — map inversion:** provider logos scattered as destinations; capability boxes
  pull logos in; some logos split into multiple capability boxes. End: shelf of callable
  capabilities.
- Functional half order: F1 → V1-S6 → F2 → F3 (⌘K palette entry: large command-palette
  search field as the section's front door, grouped list revealed on interaction) → F4 →
  F5 (Broadcast here, after connect surface) → F6 → F7 → F8.

## VARIANT 2 — "Artifact" (kimi's vision)

Hypothesis: the product's own artifact — a function call where the URL used to be — is a
stronger statement than abstraction; evidence is threaded into the theater.

- **Hero (100vh):** a browser chrome frame whose **address bar contains
  `searchFlights("SFO → TYO")` instead of a URL**. One blunt subline: "A new web for AI. No
  URLs, no websites, no browser." Connect CTA visible in hero. This image is the brand
  mark; annotate it as the page's recurring motif.
- **V2-S1 — decompile, capability lands immediately (pinned):** same decompile grammar as
  V1-S1, but the address bar dissolves **into the capability label** — `searchFlights()` —
  with provider functions nesting beneath it from that moment. Capability taught in scene 1.
- **V2-S2 — the other surfaces (pinned, single-purpose):** the five surfaces collapse into
  provider stacks that join the existing capability. No new concept introduced.
- **V2-S3 — fire it (ONE viewport, not stretched):** real tool-call card, fan-out blink,
  merged typed result. No numbers here.
- **V2-S4 — "meanwhile" as a TRANSITION, not a scene:** as S3's result locks, the
  browser-agent recording begins and literally follows the scroll down into F1, where it is
  tallied as demo #1 with both sides' full real numbers.
- **F1 with an added closer:** the **aggregate receipt** — one line after the five demos:
  "Across these five tasks: [REAL] tokens → [REAL]. $[REAL] → $[REAL]."
- **V2-S6 — one company's story:** Acme's surfaces (homepage, API docs, MCP server, CLI)
  collapse into its namespace `acme.search()`, `acme.quote()`, `acme.checkout()`; the
  namespace shrinks to a provider chip and slots into `getQuote()` **beside its
  competitors**. End beat: "Your website becomes an implementation detail." Powered by the
  same live data as F3 (annotate).
- **F5 Broadcast placement: immediately after V2-S6** — the story flows directly into the
  business door, mid-page.
- Functional half order: F1(+receipt) → F2 → V2-S6 → F5 → F3 (entry: grouped two-pane list
  **visible first**, palette as keyboard overlay) → F4 → F6 → F7 → F8 (footer carries the
  address-bar motif as a closing mark).

## VARIANT 3 — "Evidence" (codex's vision)

Hypothesis: for this audience, inversion of the teaching order (intent first) plus
relentless evidence-grounding converts better than any theater.

- **Hero:** blunt thesis in text — "A new web for AI. No URLs, no websites, no browser.
  Just capabilities you call as code." — plus a REAL artifact above the fold: an actual
  call + typed result block, and the Connect/Install CTA pair. No shader.
- **V3-S1 — intent vs. address (pinned):** one intent centered: "find a flight to Tokyo
  next weekend." On scroll it splits: the old path **grows outward** (address bar → nav →
  forms → results → tabs, sprawling), while the new path **contracts** into
  `searchFlights({…})` → typed array. Same words, two fates. The capability fires and
  fans out to provider functions here — capability is the first concept taught.
- **V3-S2 — where providers come from (pinned):** one company (Acme) X-rayed: website
  checkout, MCP tool, REST endpoint, CLI command, SDK method, product feed shown
  simultaneously, normalizing into ONE provider namespace — then connecting outward to
  several capabilities. Include the **schema-assembly beat**: differently-shaped provider
  results (different field names, nesting) visibly assembling into one stable typed schema.
- **Persistent evidence rail:** from V3-S1 through the demos, a small fixed strip shows the
  current real call, return type, token count, elapsed time. Annotate it on every keyframe.
- **No "meanwhile" theater:** the race is simply demo #1 in F1, fully measured both sides.
- **V3-S6 — the matrix:** provider columns (company logos, the old company-first web)
  rotate into a capability × provider **matrix**: capabilities as rows, provider functions
  as cells. One provider visibly occupies several rows; one row contains several providers.
- Functional half order: F1 → F2 → V3-S6 → F3 (entry: **dense live registry/ledger by
  default** — rows of name, plain-language task, real signature, provider-function count,
  status; expandable; search filters the visible list) → F4 → F5 (Broadcast separate,
  here) → F6 → F7 → F8.

---

## Review checkpoints for the storyboard pass

- Does each variant's scrollytelling stay ≤ ~10 viewport-heights before F1? Flag any that
  don't rather than silently compressing.
- Is the capability level visually distinct from provider functions in every frame where
  both appear (containment must be unambiguous)?
- Do all three variants remain honestly comparable — same baseline sections, same copy
  register, differing only on the defined axes?
- No eyebrow text, no nested frame decoration, no added copy.
