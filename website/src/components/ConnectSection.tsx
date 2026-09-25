import { useEffect, useId, useRef, useState } from 'react';
import './ConnectSection.css';
import { COMMAND_LABEL, CONNECT_COPY, CONNECT_GROUPS, DESTINATIONS } from '../scene/connect';
import { LINKS } from '../scene/links';
import { alignToHash } from '../scene/hash-align';
import { useCopy } from './useCopy';
import { BowmarkMark, CheckIcon, CopyIcon, Glyph } from './Glyphs';

/**
 * F4 — "Install for free" (Paper 8JR heading; body finished in the same
 * system as the comparison above it). v5's connect panel (`dest()` +
 * `assistants` / `codeTools`): twelve destinations in two groups; choosing one
 * swaps the title, steps and command, which copies exactly like the install
 * block. The destinations are one native radio group, so arrow keys move
 * through all twelve and the choice is announced by the control itself.
 *
 * `#connect` stays the anchor every "Get started" points at.
 */
export default function ConnectSection() {
  const [selected, setSelected] = useState(DESTINATIONS[0].name);
  const rootRef = useRef<HTMLElement | null>(null);
  const uid = useId();
  const dest = DESTINATIONS.find((d) => d.name === selected) ?? DESTINATIONS[0];
  const cmdId = `${uid}-cmd`;
  const { state, copy } = useCopy(dest.command, cmdId);

  useEffect(() => {
    const root = rootRef.current;
    return root ? alignToHash(root, ['#connect', '#f4']) : undefined;
  }, []);

  return (
    <section className="f4" id="connect" ref={rootRef} aria-labelledby={`${uid}-title`}>
      <span className="bm-anchor" id="f4" aria-hidden="true" />

      <h2 className="f4__title" id={`${uid}-title`}>
        {CONNECT_COPY.title}
      </h2>

      <div className="f4__body">
        <div className="f4__rail">
          {CONNECT_GROUPS.map((group) => (
            <fieldset className="f4__group" key={group}>
              <legend className="f4__legend">{group}</legend>
              <div className="f4__options" data-group={group === 'Assistants' ? 'assistants' : 'code'}>
                {DESTINATIONS.filter((d) => d.group === group).map((d) => (
                  <label className="f4__option" key={d.name} data-selected={d.name === selected ? '1' : '0'}>
                    <input
                      type="radio"
                      name={`${uid}-destination`}
                      value={d.name}
                      checked={d.name === selected}
                      onChange={() => setSelected(d.name)}
                    />
                    <span className="f4__option-glyph">
                      <Glyph name={d.glyph} size={16} />
                    </span>
                    <span className="f4__option-name">{d.name}</span>
                    {d.soon && <span className="f4__soon">soon</span>}
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
        </div>

        <div className="f4__main">
          <div className="f4__panel" data-soon={dest.soon ? '1' : '0'} aria-labelledby={`${uid}-dest`} role="group">
            <div className="f4__detail">
              <div className="f4__link" aria-hidden="true">
                <span className="f4__tile">
                  <span className="f4__destination-icon" key={dest.name}>
                    <Glyph name={dest.glyph} size={18} />
                  </span>
                </span>
                <span className="f4__wire" />
                <span className="f4__tile f4__tile--bowmark">
                  <BowmarkMark size={18} />
                </span>
              </div>

              <h3 className="f4__dest" id={`${uid}-dest`}>
                {dest.title}
              </h3>

              {dest.intro && <p className="f4__intro">{dest.intro}</p>}

              {dest.steps && (
                <ol className="f4__steps">
                  {dest.steps.map((step, i) => (
                    <li className="f4__step" key={step}>
                      <span className="f4__step-n" aria-hidden="true">
                        {i + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              )}
            </div>

            <div className="f4__cmd">
              <span className="f4__cmd-label" id={`${uid}-cmd-label`}>
                {COMMAND_LABEL[dest.kind]}
              </span>
              <div className="f4__cmd-row">
                {dest.kind === 'shell' && (
                  <span className="f4__prompt" aria-hidden="true">
                    $
                  </span>
                )}
                <code className="f4__code" id={cmdId}>
                  {dest.command}
                </code>
                <button
                  type="button"
                  className="bm-btn bm-btn--cta f4__copy"
                  data-state={state}
                  onClick={copy}
                  aria-describedby={`${uid}-cmd-label`}
                >
                  <span className="f4__copy-icons" aria-hidden="true">
                    <span className="f4__copy-icon"><CopyIcon /></span>
                    <span className="f4__check-icon"><CheckIcon /></span>
                  </span>
                  {/* both labels share one grid cell, so the button is always as
                      wide as "Copied" and the command never reflows */}
                  <span className="f4__copy-label">
                    <span data-shown={state === 'copied' ? '0' : '1'}>Copy</span>
                    <span data-shown={state === 'copied' ? '1' : '0'}>Copied</span>
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div className="f4__below">
            <p className="f4__foot">
              {CONNECT_COPY.footPrefix}{' '}
              <a href={LINKS.github} className="f4__foot-link">
                {CONNECT_COPY.footLink}
              </a>
              .
            </p>
            <p className={`f4__status${state === 'error' ? '' : ' sr-only'}`} role="status" aria-live="polite" data-state={state}>
              {state === 'copied'
                ? `${COMMAND_LABEL[dest.kind]} copied to clipboard`
                : state === 'error'
                  ? 'Couldn’t reach the clipboard — the text is selected. Press ⌘C or Ctrl+C to copy.'
                  : ''}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
