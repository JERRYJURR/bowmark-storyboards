import type { ReactNode } from 'react';
import { AGENT, CHAT, REACH, SITE, TOOL_INPUTS, TOOL_RETURNS, TOOLS, type BroadcastScreenId } from '../scene/broadcast';
import { BowmarkMark, CheckIcon, Glyph } from './Glyphs';

/**
 * The four Broadcast screens: finished, static product mockups of one example
 * — a hotel's room page, its actions described as tools, a guest's question
 * answered in an assistant, and an agent calling the same tools.
 *
 * Decorative: the section hides these from assistive tech and keyboard focus
 * and describes each one in text beside the stack. Nothing in here is a real
 * control, so nothing is a button or a link.
 */

function Window({ bar, tone, children }: { bar: ReactNode; tone?: 'paper'; children: ReactNode }) {
  return (
    <div className="f5w" data-tone={tone}>
      <div className="f5w__bar">
        <span className="f5w__lights">
          <i />
          <i />
          <i />
        </span>
        <span className="f5w__title">{bar}</span>
        <span className="f5w__lights f5w__lights--spacer" />
      </div>
      <div className="f5w__body">{children}</div>
    </div>
  );
}

function Mark({ size = 20 }: { size?: number }) {
  return (
    <span className="f5w-mark" style={{ width: size, height: size }}>
      <BowmarkMark size={Math.round(size * 0.6)} />
    </span>
  );
}

function FnIcon() {
  return (
    <svg className="f5w-fn" viewBox="0 0 16 16" width="12" height="12" aria-hidden="true" focusable="false">
      <path
        d="M10.5 2.75c-2 0-2.6 1.1-2.9 2.9L6.4 12.1c-.3 1.6-.9 2.15-2.4 2.15M4.75 6.5h5.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Img({ src, className }: { src: string; className?: string }) {
  return <img className={className} src={src} alt="" width="960" height="540" loading="lazy" decoding="async" />;
}

/* --- 1. the site ------------------------------------------------------------- */

function SiteScreen() {
  return (
    <Window
      bar={
        <span className="f5w__url">
          <svg viewBox="0 0 16 16" width="10" height="10" aria-hidden="true" focusable="false">
            <path d="M4.5 7V5.5a3.5 3.5 0 0 1 7 0V7M3.5 7h9v6.5h-9z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          </svg>
          {SITE.domain}
          <span className="f5w__url-path">{SITE.path}</span>
        </span>
      }
    >
      <div className="f5site">
        <div className="f5site__nav">
          <span className="f5site__brand">
            {SITE.brand}
            <span>{SITE.city}</span>
          </span>
          <span className="f5site__links">
            {SITE.nav.map((item) => (
              <span key={item} data-current={item === 'Rooms' ? '1' : undefined}>
                {item}
              </span>
            ))}
          </span>
          <span className="f5site__book">Book</span>
        </div>

        <div className="f5site__main">
          <div className="f5site__gallery">
            <Img className="f5site__photo" src={SITE.photo} />
            <div className="f5site__thumbs">
              {SITE.thumbs.map((src, i) => (
                <span key={src} data-current={i === 0 ? '1' : undefined}>
                  <Img src={src} />
                </span>
              ))}
            </div>
          </div>

          <div className="f5site__panel">
            <span className="f5site__wing">{SITE.wing}</span>
            <strong className="f5site__room">{SITE.room}</strong>
            <span className="f5site__meta">{SITE.meta}</span>
            <span className="f5site__rate">
              <b>{SITE.rate}</b> {SITE.rateUnit}
            </span>
            <div className="f5site__form">
              <span className="f5site__field">
                <small>Check-in</small>
                {SITE.checkIn}
              </span>
              <span className="f5site__field">
                <small>Check-out</small>
                {SITE.checkOut}
              </span>
              <span className="f5site__field f5site__field--wide">
                <small>Guests</small>
                {SITE.guests}
              </span>
              <span className="f5site__action">{SITE.action}</span>
            </div>
          </div>
        </div>
      </div>
    </Window>
  );
}

/* --- 2. the tools -------------------------------------------------------------- */

function ToolsScreen() {
  const [open] = TOOLS;
  return (
    <Window
      bar={
        <span className="f5w__app">
          <Mark size={16} />
          Broadcast
          <span className="f5w__app-sub">{SITE.domain}</span>
        </span>
      }
    >
      <div className="f5tools">
        <div className="f5tools__side">
          <span className="f5tools__group">Site</span>
          <span className="f5tools__site">
            <span className="f5tools__favicon">Y</span>
            {SITE.domain}
          </span>
          <span className="f5tools__group">
            Tools <em>{TOOLS.length}</em>
          </span>
          {TOOLS.map((tool) => (
            <span className="f5tools__item" key={tool.name} data-current={tool === open ? '1' : undefined}>
              <FnIcon />
              <code>{tool.name}</code>
            </span>
          ))}
        </div>

        <div className="f5tools__main">
          <div className="f5tools__head">
            <code className="f5tools__name">
              <FnIcon />
              {open.name}
            </code>
            <span className="f5tools__from">From: {open.from}</span>
          </div>
          <p className="f5tools__summary">{open.summary}</p>

          <span className="f5tools__label">Inputs</span>
          <div className="f5tools__table">
            {TOOL_INPUTS.map((input) => (
              <span className="f5tools__row" key={input.name}>
                <code>{input.name}</code>
                <code className="f5tools__type">{input.type}</code>
                <code className="f5tools__example">{input.example}</code>
              </span>
            ))}
          </div>

          <span className="f5tools__label">Returns</span>
          <code className="f5tools__returns">{TOOL_RETURNS}</code>
        </div>
      </div>
    </Window>
  );
}

/* --- 3. the assistant ---------------------------------------------------------- */

function AssistantScreen() {
  return (
    <Window bar={<span className="f5w__app">Assistant</span>}>
      <div className="f5chat">
        <div className="f5chat__side">
          <span className="f5chat__new">
            <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true" focusable="false">
              <path d="M8 3.5v9M3.5 8h9" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            New chat
          </span>
          {CHAT.history.map((group) => (
            <div className="f5chat__group" key={group.group}>
              <span className="f5chat__group-label">{group.group}</span>
              {group.items.map((item) => (
                <span key={item} className="f5chat__item" data-current={item === CHAT.active ? '1' : undefined}>
                  {item}
                </span>
              ))}
            </div>
          ))}
        </div>

        <div className="f5chat__main">
          <div className="f5chat__thread">
            <p className="f5chat__ask">{CHAT.ask}</p>
            <span className="f5chat__call">
              <Mark size={18} />
              Called <code>{CHAT.call}</code> on {SITE.domain}
              <CheckIcon size={12} />
            </span>
            <p className="f5chat__lead">{CHAT.lead}</p>
            <div className="f5chat__card">
              <Img src={SITE.photo} />
              <div className="f5chat__card-text">
                <strong>{CHAT.room}</strong>
                <span>{CHAT.meta}</span>
                <span className="f5chat__book">{CHAT.action}</span>
              </div>
            </div>
          </div>
          <div className="f5chat__composer">
            {CHAT.composer}
            <span className="f5chat__send">
              <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true" focusable="false">
                <path d="M8 12.5v-9M4 7.5l4-4 4 4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </Window>
  );
}

/* --- 4. an agent, calling the same tools --------------------------------------- */

function AgentScreen() {
  return (
    <Window tone="paper" bar={<span className="f5w__app f5w__app--mono">{AGENT.title}</span>}>
      <div className="f5agent">
        <div className="f5agent__log">
          <p className="f5agent__ask">
            <span aria-hidden="true">›</span>
            {AGENT.ask}
          </p>
          {AGENT.calls.map((call) => (
            <div className="f5agent__call" key={call.name}>
              <p className="f5agent__fn">
                <Mark size={14} />
                <b>{call.name}</b>
                <span>{SITE.domain}</span>
              </p>
              <p className="f5agent__args">{call.args}</p>
              <p className="f5agent__result">{call.result}</p>
            </div>
          ))}
          <p className="f5agent__answer">{AGENT.answer}</p>
        </div>

        <div className="f5agent__reach">
          <span>{AGENT.reachLabel}</span>
          <span className="f5agent__apps">
            {REACH.map((name) => (
              <span className="f5agent__app" key={name}>
                <Glyph name={name} size={13} />
              </span>
            ))}
            <span className="f5agent__app">
              <Glyph name="mcp" size={13} />
            </span>
          </span>
        </div>
      </div>
    </Window>
  );
}

const SCREENS: Record<BroadcastScreenId, () => ReactNode> = {
  site: SiteScreen,
  tools: ToolsScreen,
  assistant: AssistantScreen,
  agent: AgentScreen,
};

export function BroadcastScreen({ id }: { id: BroadcastScreenId }) {
  const Screen = SCREENS[id];
  return <Screen />;
}
