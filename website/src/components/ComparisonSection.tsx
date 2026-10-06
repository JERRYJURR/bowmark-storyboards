import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import './ComparisonSection.css';
import {
  HEADLINE,
  LANES,
  REPLAY,
  TASKS,
  advanceReplay,
  replayEnd,
  replayRate,
  type Task,
} from '../scene/tasks';
import { between, clamp01 } from '../scene/progress';
import { BowmarkMark } from './Glyphs';
import { Favicon, SitePage, activeSite } from './ReplaySites';

/**
 * F1 — "same task two ways", v5's `replays()`.
 *
 * One task, run twice: Bowmark calls a capability and answers; a browser agent
 * opens a browser and works through it step by step.
 *
 * Both lanes read ONE simulated clock, `sim` (seconds of task time, see
 * `advanceReplay` in scene/tasks.ts). A lane's elapsed time is
 * `min(sim, laneSec)`, so the two timers always tick at the same rate and each
 * stops at its own figure. The clock plays at 1× until just after Bowmark
 * finishes, then the whole clock (both lanes) fast-forwards at a labelled
 * `REPLAY.ffRate`×.
 *
 * Each lane's windows keep the prototype's choreography, written against a
 * 0..1 beat time `t`; `bmBeat` and `agentBeat` map the lane's own elapsed time
 * onto it, so what a stage shows always matches that lane's timer.
 *
 * The loop is event-driven at the edges: it only advances while the section is
 * on screen and the tab is visible, and it stops at the end.
 */

const FRAME_MS = 33; // ~30fps is plenty for a tenths-of-a-second readout
const STEP_COUNT = 12;

/** Bowmark's working beats span t 0..BM_RUN while the lane runs; the answer
    (t ≥ 0.58 in the choreography) lands only when the lane completes. */
const BM_RUN = 0.56;
const bmBeat = (p: number) => (p >= 1 ? 1 : p * BM_RUN);

/** The agent's preamble — prompt, reply, browser opening (t 0..0.12) — plays
    over its first seconds at Bowmark's pace; its twelve steps then spread
    across the rest of its run, reaching t = 1 at `webSec`. */
const AGENT_INTRO_SEC = 1.2;
const agentBeat = (task: Task, elapsed: number) =>
  elapsed < AGENT_INTRO_SEC
    ? (elapsed / AGENT_INTRO_SEC) * 0.12
    : 0.12 + ((elapsed - AGENT_INTRO_SEC) / (task.webSec - AGENT_INTRO_SEC)) * 0.88;

/** the browser agent's current step, v5's `baIdx` */
const stepIndex = (t: number) =>
  t < 0.12 ? -1 : Math.min(STEP_COUNT - 1, Math.floor(((t - 0.12) / 0.86) * STEP_COUNT));

const fmtSeconds = (s: number) =>
  s >= 60 ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}` : `${s.toFixed(1)}s`;

export default function ComparisonSection() {
  const [taskIndex, setTaskIndex] = useState(0);
  /* Server and first client render show the finished run, so the section is
     informative with no JavaScript and before hydration. */
  const [sim, setSim] = useState(() => replayEnd(TASKS[0]));
  const [playing, setPlaying] = useState(false);
  const [reduced, setReduced] = useState(true);
  const [bmFocus, setBmFocus] = useState<'bmChat' | 'bmCode'>('bmChat');
  const [baFocus, setBaFocus] = useState<'baChat' | 'baBrowser'>('baBrowser');

  const rootRef = useRef<HTMLElement | null>(null);
  const visible = useRef(false);
  const started = useRef(false);
  const simRef = useRef(sim);
  const taskRef = useRef(TASKS[0]);
  const reducedRef = useRef(true);

  const task = TASKS[taskIndex];

  const setClock = (next: number) => {
    simRef.current = next;
    setSim(next);
  };

  /**
   * v5's reset: a new task, or a replay, restarts the shared clock and the
   * focus. Under reduced motion there is no playback, so it lands on the
   * finished run instead — switching task must never blank the content.
   */
  const reset = useCallback((index: number) => {
    const next = TASKS[index];
    taskRef.current = next;
    started.current = true;
    setTaskIndex(index);
    setClock(reducedRef.current ? replayEnd(next) : 0);
    setBmFocus('bmChat');
    setBaFocus('baBrowser');
    setPlaying(!reducedRef.current);
  }, []);

  /* Keep a direct review link aligned while the preceding mobile scene hydrates.
     Stop as soon as the reader interacts; normal scrolling remains native. */
  useEffect(() => {
    if (window.location.hash !== '#f1' || new URLSearchParams(window.location.search).has('p')) return;
    const previous = document.getElementById('b1-track');
    const target = rootRef.current;
    if (!previous || !target) return;
    let frame = 0;
    const align = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => target.scrollIntoView({ block: 'start', behavior: 'instant' }));
    };
    const observer = new ResizeObserver(align);
    const stop = () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      for (const name of ['wheel', 'touchstart', 'pointerdown', 'keydown']) window.removeEventListener(name, stop);
    };
    observer.observe(previous);
    align();
    for (const name of ['wheel', 'touchstart', 'pointerdown', 'keydown']) window.addEventListener(name, stop, { passive: true });
    return stop;
  }, []);

  /* M07/M08 show the original overlapping windows as one scaled screen.
     Scale its artwork, keeping the tag, figures and controls at native size. */
  useEffect(() => {
    const stages = rootRef.current?.querySelectorAll<HTMLElement>('.f1__stage');
    if (!stages) return;
    const resize = new ResizeObserver(entries => {
      for (const entry of entries) {
        const scale = Math.min(entry.contentRect.width / 529.984375, entry.contentRect.height / 268);
        (entry.target as HTMLElement).style.setProperty('--f1-screen-scale', String(scale));
      }
    });
    stages.forEach(stage => resize.observe(stage));
    return () => resize.disconnect();
  }, []);

  /* --- motion preference ------------------------------------------------- */

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => {
      reducedRef.current = mq.matches;
      setReduced(mq.matches);
    };
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  /* --- autoplay once, when the section comes into view -------------------- */

  useEffect(() => {
    if (reduced) {
      setPlaying(false);
      setClock(replayEnd(taskRef.current));
      return;
    }
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    /* Threshold 0: the section is taller than a phone viewport, so any
       fractional threshold could never be met and the replay would never
       start. Any part on screen counts as visible; nothing counts down while
       the section is entirely off screen. */
    const io = new IntersectionObserver(
      ([entry]) => {
        visible.current = entry.isIntersecting;
        if (entry.isIntersecting && !started.current && !reducedRef.current) {
          started.current = true;
          setClock(0);
          setPlaying(true);
        }
      },
      { threshold: 0 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);

  /* --- the shared clock ---------------------------------------------------- */

  useEffect(() => {
    if (!playing || reduced) return;

    let raf = 0;
    let last = performance.now();
    let acc = 0;

    const frame = (now: number) => {
      const dt = Math.min(100, now - last);
      last = now;

      // Offscreen or backgrounded: hold, do not advance.
      if (visible.current && !document.hidden) {
        acc += dt;
        if (acc >= FRAME_MS) {
          const current = taskRef.current;
          const next = advanceReplay(current, simRef.current, acc / 1000);
          acc = 0;
          setClock(next);
          if (next >= replayEnd(current)) {
            setPlaying(false);
            return;
          }
        }
      } else {
        acc = 0;
      }
      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [playing, reduced, taskIndex]);

  /* --- derived, all from the one clock ------------------------------------- */

  const end = replayEnd(task);
  const done = sim >= end;
  const bmElapsed = Math.min(sim, task.bmSec);
  const webElapsed = Math.min(sim, task.webSec);
  const bmP = bmElapsed / task.bmSec;
  const webP = webElapsed / task.webSec;
  const bmT = bmBeat(bmP);
  const baT = agentBeat(task, webElapsed);
  const fast = replayRate(task, sim) > 1;

  /* The browser agent's run ends wherever its last step left it, which for
     most tasks is a captcha. Only the Bowmark lane earns a completion tick. */
  const agentEnd = task.sc[task.sc.length - 1] === 'captcha' ? 'blocked at captcha' : 'still going';

  const speed = reduced
    ? { label: 'Finished run', ff: false, paused: false }
    : done
      ? { label: 'Replay finished', ff: false, paused: false }
      : { label: fast ? `${REPLAY.ffRate}× fast-forward` : '1× real time', ff: fast, paused: !playing };

  const speedReadout = (
    <span className="f1__speed" data-ff={speed.ff ? '1' : '0'}>
      {speed.ff ? <FastGlyph /> : <ClockGlyph />}
      {speed.label}
      {speed.paused && <span className="f1__speed-paused">· paused</span>}
    </span>
  );

  return (
    <section className="f1" id="f1" ref={rootRef} aria-labelledby="f1-title">
      <h2 className="f1__title" id="f1-title">
        {HEADLINE}
      </h2>

      <div className="f1__body">
      <div className="f1__rail">
        <p className="f1__rail-label" id="f1-tasks-label">Choose a task</p>
        <div className="f1__tasks" role="group" aria-labelledby="f1-tasks-label">
          {TASKS.map((item, i) => (
            <button
              key={item.name}
              type="button"
              className="f1__task"
              aria-pressed={i === taskIndex}
              onClick={() => reset(i)}
            >
              <PlayIcon />
              {item.name}
            </button>
          ))}
        </div>

        <div className="f1__transport">
          {!reduced && (
            <button
              type="button"
              className="f1__ctl"
              onClick={() => setPlaying((p) => !p)}
              disabled={done}
            >
              {playing ? <PauseGlyph /> : <PlayIcon />}
              {playing ? 'Pause' : 'Resume'}
            </button>
          )}
          <button type="button" className="f1__ctl" onClick={() => reset(taskIndex)}>
            <ReplayGlyph />
            Replay
          </button>
          <span className="f1__mobile-clock">{speedReadout}</span>
        </div>
      </div>

      <div className="f1__lanes">
      {/* The shared clock's speed. Both timers read it, so the switch to
          fast-forward after Bowmark finishes is named, never hidden. */}
      <div className="f1__clock">
        {speedReadout}
      </div>

      {/* The stages are decorative; this is the narrative in text. Static, not
          a live region, so nothing is announced as the replay runs. */}
      <div className="sr-only">
        <h3>{task.name}</h3>
        <p>Prompt: “{task.prompt}”.</p>
        <p>
          Bowmark calls {task.fn1}
          {task.fn2 ? ` and ${task.fn2}` : ''} and answers: {task.cTitle} {task.cPrice},{' '}
          {task.cSub}. {task.final} Replay figures: {task.bmTok.toLocaleString()} tokens, $
          {task.bmCost.toFixed(2)}, {task.bmSec} seconds.
        </p>
        <p>
          A browser agent works through {task.steps.length} steps in a web browser, ending{' '}
          {agentEnd} at “{task.steps[task.steps.length - 1]}”. Replay figures:{' '}
          {task.webTok.toLocaleString()} tokens, ${task.webCost.toFixed(2)},{' '}
          {fmtSeconds(task.webSec)}.
        </p>
      </div>

      <Lane
        kind="bowmark"
        title={LANES.bowmark.title}
        desc={LANES.bowmark.desc}
        elapsed={bmElapsed}
        axis={end}
        p={bmP}
        tokens={task.bmTok}
        cost={task.bmCost}
        outcome={bmP >= 1 ? 'Done' : null}
      >
        <Window
          id="bmCode"
          focused={bmFocus === 'bmCode'}
          onFocus={() => setBmFocus('bmCode')}
        >
          <CodePane t={bmT} task={task} />
        </Window>
        <Window
          id="bmChat"
          focused={bmFocus === 'bmChat'}
          onFocus={() => setBmFocus('bmChat')}
        >
          <BowmarkChat t={bmT} task={task} />
        </Window>
      </Lane>

      <Lane
        kind="agent"
        title={LANES.agent.title}
        desc={LANES.agent.desc}
        elapsed={webElapsed}
        axis={end}
        p={webP}
        tokens={task.webTok}
        cost={task.webCost}
        outcome={webP >= 1 ? agentEnd : null}
      >
        <Window
          id="baChat"
          focused={baFocus === 'baChat'}
          onFocus={() => setBaFocus('baChat')}
        >
          <AgentChat t={baT} task={task} />
        </Window>
        <Window
          id="baBrowser"
          focused={baFocus === 'baBrowser'}
          onFocus={() => setBaFocus('baBrowser')}
          style={{ opacity: between(baT, 0.07, 0.12) }}
        >
          <BrowserTrace t={baT} task={task} />
        </Window>
      </Lane>
      </div>
      </div>
    </section>
  );
}

/* Paper 8YQ's rail glyph (lucide "play"), reused for Resume. */
function PlayIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z" />
    </svg>
  );
}

function PauseGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true" focusable="false">
      <path d="M8 5v14M16 5v14" />
    </svg>
  );
}

function ReplayGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5" />
    </svg>
  );
}

function ClockGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function FastGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M3 6l8 6-8 6zM13 6l8 6-8 6z" />
    </svg>
  );
}

/* Small in-window glyphs: stroke icons sized in em so they scale with the stage. */
function Glyph({ children }: { children: ReactNode }) {
  return (
    <svg
      className="f1__glyph"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

const SidebarGlyph = () => (
  <Glyph>
    <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" />
    <path d="M9.5 4.5v15" />
  </Glyph>
);
const ChevronGlyph = () => (
  <Glyph>
    <path d="M8 10l4 4 4-4" />
  </Glyph>
);
const PlusGlyph = () => (
  <Glyph>
    <path d="M12 6v12M6 12h12" />
  </Glyph>
);
const ArrowUpGlyph = () => (
  <Glyph>
    <path d="M12 19V6M6.5 11.5L12 6l5.5 5.5" />
  </Glyph>
);
const BackGlyph = () => (
  <Glyph>
    <path d="M19 12H6M11 6l-6 6 6 6" />
  </Glyph>
);
const ForwardGlyph = () => (
  <Glyph>
    <path d="M5 12h13M13 6l6 6-6 6" />
  </Glyph>
);
const ReloadGlyph = () => (
  <Glyph>
    <path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3M19.5 4v4h-4" />
  </Glyph>
);
const LockGlyph = () => (
  <Glyph>
    <rect x="5.5" y="10.5" width="13" height="9" rx="2" />
    <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
  </Glyph>
);

/** the system arrow pointer, dark with a light rim */
function CursorGlyph() {
  return (
    <svg className="f1__pointer" viewBox="0 0 16 22" aria-hidden="true" focusable="false">
      <path d="M1.5 1.5v16.2l4.1-3.9 2.7 6.2 2.8-1.2-2.7-6.1h5.7z" />
    </svg>
  );
}

/* --- lane -------------------------------------------------------------------- */

function Lane({
  kind,
  title,
  desc,
  elapsed,
  axis,
  p,
  tokens,
  cost,
  outcome,
  children,
}: {
  kind: 'bowmark' | 'agent';
  title: string;
  desc: string;
  /** this lane's time on the shared clock */
  elapsed: number;
  /** the shared clock's full length, so both meters use one scale */
  axis: number;
  /** this lane's completion, 0..1 */
  p: number;
  tokens: number;
  cost: number;
  /** how this lane ended — only the lane that completed reads as done */
  outcome: string | null;
  children: ReactNode;
}) {
  /* One scale for both meters; a finished Bowmark keeps a visible sliver. */
  const fill = Math.max(0.025 * p, elapsed / axis);
  return (
    <div className="f1__lane" data-kind={kind}>
      <div className="f1__stage" aria-hidden="true">
        {kind === 'bowmark' && (
          <span className="f1__tag">
            <BowmarkMark size={14} />
            Bowmark
          </span>
        )}
        <div className="f1__screen">{children}</div>
      </div>

      <div className="f1__side">
        <h3 className="f1__side-title" title={desc}>
          <span className="f1__side-name">
            {kind === 'bowmark' && (
              <span className="f1__side-mark">
                <BowmarkMark size={18} />
              </span>
            )}
            {title}
          </span>
          {outcome && <span className="f1__outcome">{outcome}</span>}
        </h3>
        <div className="f1__timing">
          <strong>{fmtSeconds(elapsed)}</strong>
          <span className="f1__meter">
            <span className="f1__meter-fill" style={{ transform: `scaleX(${fill.toFixed(4)})` }} />
          </span>
        </div>
        <dl className="f1__metrics">
          <div>
            <dt>Tokens used</dt>
            <dd>{Math.round(tokens * p).toLocaleString()}</dd>
          </div>
          <div>
            <dt>Cost</dt>
            <dd>${(cost * p).toFixed(2)}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

function Window({
  id,
  focused,
  onFocus,
  style,
  children,
}: {
  id: string;
  focused: boolean;
  onFocus: () => void;
  /** geometry lives in the stylesheet; only per-frame values come through here */
  style?: CSSProperties;
  children: ReactNode;
}) {
  return (
    <div
      className="f1__win"
      data-win={id}
      data-focused={focused ? '1' : '0'}
      style={style}
      onClick={onFocus}
      onMouseEnter={onFocus}
    >
      {children}
    </div>
  );
}

/* --- Bowmark lane ------------------------------------------------------------ */

function BowmarkChat({ t, task }: { t: number; task: Task }) {
  const hasB = !!task.fn2;
  const t1 = between(t, 0.03, 0.08);
  const t2 = between(t, 0.14, 0.2);
  const c1 = between(t, 0.22, 0.26);
  const t3 = between(t, 0.26, 0.34);
  const t4 = hasB ? between(t, 0.38, 0.44) : 0;
  const c2 = between(t, 0.44, 0.5);
  /* the answer, for every task, only once the lane has completed */
  const t6 = between(t, 0.58, 0.64);

  /* A call's duration is read off the lane's own clock: from the call
     appearing to its tick, in Bowmark's seconds. */
  const secs = (from: number, to: number) => `${(((to - from) / BM_RUN) * task.bmSec).toFixed(1)}s`;

  /* Keep the newest message in view, so the finished state shows the answer
     rather than the opening prompt. Keyed on how many blocks exist, not on the
     timeline, so this reads layout when the thread grows — not every frame. */
  const beats = (t1 > 0 ? 1 : 0) + (t2 > 0 ? 1 : 0) + (t3 > 0 ? 1 : 0) + (t4 > 0 ? 1 : 0) + (t6 > 0 ? 1 : 0);
  const msgs = useStickToEnd(beats);

  return (
    <div className="f1__app">
      <ChatBar title={task.name} />

      <div className="f1__msgs" ref={msgs}>
        {t1 > 0 && (
          <Reveal o={t1} align="end">
            <p className="f1__bubble">{task.prompt}</p>
          </Reveal>
        )}

        {t2 > 0 && (
          <Reveal o={t2}>
            <ToolCall name={task.fn1} done={c1 > 0.5} dur={secs(0.14, 0.24)} />
          </Reveal>
        )}

        {t3 > 0 && (
          <Reveal o={t3}>
            <div className="f1__rows">
              {task.rows.map((r, i) => (
                <span
                  key={r[0]}
                  className="f1__row"
                  style={{ opacity: between(t, 0.26 + i * 0.015, 0.3 + i * 0.015) }}
                >
                  <span>{r[0]}</span>
                  <b>{r[1]}</b>
                </span>
              ))}
            </div>
          </Reveal>
        )}

        {hasB && t4 > 0 && (
          <Reveal o={t4}>
            <ToolCall name={task.fn2 as string} done={c2 > 0.5} dur={secs(0.38, 0.47)} />
          </Reveal>
        )}

        {t6 > 0 && (
          <Reveal o={t6}>
            <div className="f1__result">
              {RESULT_PHOTOS[task.name] && (
                <img className="f1__result-photo" src={RESULT_PHOTOS[task.name]} alt="" />
              )}
              <span className="f1__result-text">
                <span className="f1__result-top">
                  <b>{task.cTitle}</b>
                  <span className="f1__grow" />
                  <b>{task.cPrice}</b>
                </span>
                <span className="f1__result-sub">{task.cSub}</span>
              </span>
            </div>
            <p className="f1__say f1__result-final">{task.final}</p>
          </Reveal>
        )}
      </div>

      <Composer />
    </div>
  );
}

/** Only where the repo holds the result's own photo (public/images/stays). */
const RESULT_PHOTOS: Record<string, string> = {
  'Book a hotel': '/images/stays/hyatt-place-kyoto.jpg',
};

/* --- Claude chrome, shared by both chat windows ------------------------------- */

function ChatBar({ title }: { title: string }) {
  return (
    <div className="f1__app-bar">
      <SidebarGlyph />
      <span className="f1__claude" />
      <span className="f1__app-name">{title}</span>
      <ChevronGlyph />
    </div>
  );
}

function Composer() {
  return (
    <div className="f1__composer">
      <span className="f1__composer-btn">
        <PlusGlyph />
      </span>
      <span className="f1__composer-hint">Reply to Claude…</span>
      <span className="f1__send">
        <ArrowUpGlyph />
      </span>
    </div>
  );
}

function ToolCall({ name, done, dur }: { name: string; done: boolean; dur: string }) {
  return (
    <span className="f1__tool">
      <img className="f1__tool-mark" src="/favicon.svg" alt="" />
      <span className="f1__tool-name">
        {name} <i>· Bowmark</i>
      </span>
      <span className="f1__grow" />
      {done ? <span className="f1__tool-done">✓ {dur}</span> : <span className="f1__spin" />}
    </span>
  );
}

type Tok = [string, 'kw' | 'plain' | 'str' | 'fn' | 'num' | 'punc'];

function CodePane({ t, task }: { t: number; task: Task }) {
  const lines: Tok[][] = [
    [
      ['import ', 'kw'],
      ['{ ', 'punc'],
      [task.lib, 'fn'],
      [' } ', 'punc'],
      ['from ', 'kw'],
      ['"bowmark"', 'str'],
    ],
    [[' ', 'plain']],
    [
      ['const ', 'kw'],
      ['r = ', 'plain'],
      ['await ', 'kw'],
      [task.lib, 'fn'],
      ['({', 'punc'],
    ],
    ...task.args.map(
      (a, i): Tok[] => [
        [`  ${a[0]}: `, 'plain'],
        [a[1], /^\d/.test(a[1]) ? 'num' : 'str'],
        [i < task.args.length - 1 ? ',' : '', 'punc'],
      ]
    ),
    [['})', 'punc']],
  ];

  const nl = Math.ceil(between(t, 0.1, 0.5) * lines.length);
  const res = between(t, 0.56, 0.62);
  /* what the editor's run panel says, read off the same beats */
  const status = res > 0 ? 'done' : nl >= lines.length ? 'running' : 'editing';

  return (
    <div className="f1__code">
      <div className="f1__code-bar">
        <Dots />
        <span className="f1__code-tab">
          <span className="f1__code-ts">TS</span>
          task.ts
        </span>
      </div>
      <div className="f1__code-body">
        {lines.slice(0, nl).map((line, i) => (
          <span className="f1__code-line" key={i}>
            <i className="f1__ln">{i + 1}</i>
            <span>
              {line.map(([text, cls], k) => (
                <span key={k} className={`f1__t f1__t--${cls}`}>
                  {text}
                </span>
              ))}
              {i === nl - 1 && nl < lines.length && <span className="f1__code-caret" />}
            </span>
          </span>
        ))}
      </div>
      <div className="f1__code-out" data-status={status}>
        <span className="f1__code-out-head">
          <span>Output</span>
          <span className="f1__grow" />
          {status === 'running' && <span className="f1__spin" />}
          {status === 'done' ? '✓ done' : status === 'running' ? 'running' : ''}
        </span>
        <span className="f1__code-out-line" style={{ opacity: res }}>
          {task.out}
        </span>
      </div>
    </div>
  );
}

/* --- browser agent lane ------------------------------------------------------ */

function AgentChat({ t, task }: { t: number; task: Task }) {
  const idx = stepIndex(t);
  const u = between(t, 0.02, 0.05);
  const a1 = between(t, 0.06, 0.09);

  /* Follow the current step rather than leaving the first ones on screen. */
  const msgs = useStickToEnd(idx + (u > 0 ? 1 : 0) + (a1 > 0 ? 1 : 0));

  return (
    <div className="f1__app">
      <ChatBar title={task.name} />

      <div className="f1__msgs" ref={msgs}>
        {u > 0 && (
          <Reveal o={u} align="end">
            <p className="f1__bubble">{task.prompt}</p>
          </Reveal>
        )}
        {a1 > 0 && (
          <p className="f1__say" style={{ opacity: a1 }}>
            I’ll open a browser and do this step by step.
          </p>
        )}
        {idx >= 0 && (
          <ol className="f1__steps">
            {task.steps.slice(0, idx + 1).map((s, k) => (
              <li key={s} className="f1__step" data-done={k < idx ? '1' : '0'}>
                {k < idx ? <span className="f1__step-tick">✓</span> : <span className="f1__spin" />}
                <span className="f1__step-label">{s}</span>
              </li>
            ))}
          </ol>
        )}
      </div>

      <Composer />
    </div>
  );
}

function BrowserTrace({ t, task }: { t: number; task: Task }) {
  const idx = Math.max(0, stepIndex(t));
  const scene = task.sc[idx];
  const raw = ((t - 0.12) / 0.86) * STEP_COUNT;
  const fr = raw > 0 ? raw - Math.floor(raw) : 0;
  /* the site the agent is on at this step: active tab, address, page */
  const view = activeSite(task, idx);

  /* The pointer aims at whatever the page marks `data-cursor` — the field the
     agent is filling, the row it is reading, the captcha box. The target only
     changes on these buckets (the page walks 4 fields / 3 rows per step), so
     layout is read on those transitions and on resize, never per frame. */
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [aim, setAim] = useState<[number, number] | null>(null);
  const target = `${task.name}|${idx}|${Math.floor(fr * 12)}`;
  const measure = useCallback(() => {
    const root = rootRef.current;
    const page = root?.querySelector<HTMLElement>('.f1__b-body');
    if (!root || !page) return;
    const box = root.getBoundingClientRect();
    const el = page.querySelector<HTMLElement>('[data-cursor="1"]');
    const r = el ? el.getBoundingClientRect() : page.getBoundingClientRect();
    const scale = box.width / root.offsetWidth || 1;
    const x = Math.round((r.left - box.left + r.width * (el ? 0.62 : 0.7)) / scale);
    const y = Math.round((r.top - box.top + r.height * (el ? 0.55 : 0.45)) / scale);
    setAim((prev) => (prev && prev[0] === x && prev[1] === y ? prev : [x, y]));
  }, []);
  useEffect(measure, [target, measure]);
  useEffect(() => {
    const root = rootRef.current;
    if (!root || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(measure);
    ro.observe(root);
    return () => ro.disconnect();
  }, [measure]);

  return (
    <div className="f1__browser" ref={rootRef}>
      <div className="f1__b-tabs">
        <Dots />
        {task.tabs.map((tb) => (
          <span key={tb} className="f1__b-tab" data-active={tb.split(' ')[0] === view.host ? '1' : '0'}>
            <Favicon tab={tb} />
            <span className="f1__b-tab-title">{tb}</span>
          </span>
        ))}
      </div>
      <div className="f1__b-chrome">
        <span className="f1__b-nav">
          <BackGlyph />
          <ForwardGlyph />
          <ReloadGlyph />
        </span>
        <span className="f1__b-url">
          <LockGlyph />
          <span>{view.url}</span>
        </span>
        {scene === 'load' && (
          <span className="f1__b-progress" style={{ transform: `scaleX(${(0.12 + fr * 0.8).toFixed(3)})` }} />
        )}
      </div>
      <div className="f1__b-body">
        <SitePage task={task} scene={scene} idx={idx} fr={fr} />
      </div>
      <span
        className="f1__b-cursor"
        style={{
          opacity: aim ? 1 : 0,
          transform: aim ? `translate(${aim[0]}px, ${aim[1]}px)` : undefined,
        }}
      >
        <span
          className="f1__b-cursor-drift"
          style={{
            transform: `translate(${(Math.sin(fr * 6.3) * 3).toFixed(1)}px, ${(Math.cos(fr * 6.3) * 2).toFixed(1)}px)`,
          }}
        >
          <CursorGlyph />
        </span>
      </span>
    </div>
  );
}

/* --- shared ------------------------------------------------------------------ */

/**
 * Pins a scroll container to its end whenever `step` changes — a new message,
 * a new browser step, or a replay resetting to zero. Reading `scrollHeight`
 * only on those transitions keeps the clock free of forced layout.
 */
function useStickToEnd(step: number) {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [step]);
  return ref;
}

function Dots() {
  return (
    <span className="f1__dots">
      <i />
      <i />
      <i />
    </span>
  );
}

function Reveal({
  o,
  align,
  children,
}: {
  o: number;
  align?: 'end';
  children: ReactNode;
}) {
  return (
    <div
      className="f1__reveal"
      data-align={align ?? 'start'}
      style={{ opacity: o, transform: `translateY(${((1 - clamp01(o)) * 12).toFixed(1)}px)` }}
    >
      {children}
    </div>
  );
}
