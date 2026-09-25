import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from 'react';
import './InstallBlock.css';
import { useCopy } from './useCopy';
import {
  INSTALL_KINDS,
  INSTALL_TARGETS,
  TARGET_LOGO,
  installCommand,
  type InstallKind,
  type InstallTarget,
} from '../scene/content';

/**
 * The Paper redesign's compact install bar (6FU, 414px): one sentence —
 * "Install the [Plugin ▾] for [Claude ▾]" — above a single command well with
 * an icon Copy button.
 *
 * Both choices are real listboxes (the agent chips of the previous version
 * became the second dropdown): arrow keys / Home / End move, Enter or Space
 * picks, Escape and outside clicks close, Tab leaves. Every artifact and
 * every agent from before is still offered, and copy keeps its feedback and
 * its select-to-copy fallback.
 */

const kindLabel = (k: InstallKind): string => k.charAt(0).toUpperCase() + k.slice(1);

function AgentTile({ target }: { target: InstallTarget }) {
  return (
    <span className="install__tile" data-agent={target} aria-hidden="true">
      <svg viewBox="0 0 24 24" width="10" height="10" focusable="false">
        <path d={TARGET_LOGO[target]} fill="currentColor" fillRule="evenodd" />
      </svg>
    </span>
  );
}

function Chevron() {
  return (
    <svg
      className="install__chevron"
      viewBox="2.25 2.25 18 18"
      width="12"
      height="12"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M7.097 9.173l4.154 4.154 4.153-4.154"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface PickerProps<T extends string> {
  /** screen-reader prefix for the trigger, e.g. "Install artifact:" */
  srLabel: string;
  value: T;
  options: readonly T[];
  onChange: (value: T) => void;
  render: (value: T) => ReactNode;
  /** extra content before the underlined label (the agent tile) */
  lead?: (value: T) => ReactNode;
  name: string;
}

function Picker<T extends string>({
  srLabel,
  value,
  options,
  onChange,
  render,
  lead,
  name,
}: PickerProps<T>) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const uid = useId();

  const pickerRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const optionRefs = useRef<(HTMLLIElement | null)[]>([]);

  const close = useCallback((refocus: boolean) => {
    setOpen(false);
    if (refocus) triggerRef.current?.focus({ preventScroll: true });
  }, []);

  /**
   * Dismissal: outside pointerdown, Escape, selection, Tab.
   *
   * Scrolling is deliberately NOT a dismissal — a smooth scroll started by
   * the click could close the menu before an option was picked on a phone.
   * Instead, when the animated hero stops being live the scene flips
   * `data-hero-live` on the track; an attribute-filtered MutationObserver,
   * live only while the menu is open, closes it then.
   */
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: PointerEvent) => {
      if (!pickerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        close(true);
      }
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);

    const track = pickerRef.current?.closest('[data-hero-live]');
    let observer: MutationObserver | undefined;
    if (track) {
      observer = new MutationObserver(() => {
        if (track.getAttribute('data-hero-live') === '0') setOpen(false);
      });
      observer.observe(track, { attributes: true, attributeFilter: ['data-hero-live'] });
    }

    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
      observer?.disconnect();
    };
  }, [open, close]);

  // Focus must never scroll the page — that is what used to dismiss the menu.
  useEffect(() => {
    if (open) optionRefs.current[active]?.focus({ preventScroll: true });
  }, [open, active]);

  const openAt = (index: number) => {
    setActive(index);
    setOpen(true);
  };

  const onTriggerKey = (e: ReactKeyboardEvent) => {
    if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
      e.preventDefault();
      openAt(options.indexOf(value));
    }
  };

  const onOptionKey = (e: ReactKeyboardEvent, index: number) => {
    const n = options.length;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((index + 1) % n);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((index - 1 + n) % n);
    } else if (e.key === 'Home') {
      e.preventDefault();
      setActive(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setActive(n - 1);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onChange(options[index]);
      close(true);
    } else if (e.key === 'Tab') {
      // Hand focus back to the trigger *before* the browser runs Tab, so the
      // move starts from the trigger (like a native <select>) instead of from
      // an option that is about to unmount — which would drop focus to body.
      triggerRef.current?.focus({ preventScroll: true });
      setOpen(false);
    }
  };

  return (
    <div className="install__picker" ref={pickerRef} data-picker={name}>
      <button
        type="button"
        ref={triggerRef}
        className="install__trigger"
        id={`${uid}-trigger`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? `${uid}-list` : undefined}
        data-open={open ? '1' : '0'}
        onClick={() => (open ? close(false) : openAt(options.indexOf(value)))}
        onKeyDown={onTriggerKey}
      >
        <span className="sr-only">{srLabel}</span>
        {lead?.(value)}
        <span className="install__value">{render(value)}</span>
        <Chevron />
      </button>

      {open && (
        <ul
          className="install__menu"
          id={`${uid}-list`}
          role="listbox"
          aria-labelledby={`${uid}-trigger`}
        >
          {options.map((o, i) => (
            <li
              key={o}
              ref={(el) => {
                optionRefs.current[i] = el;
              }}
              role="option"
              aria-selected={o === value}
              tabIndex={-1}
              className="install__option"
              data-selected={o === value ? '1' : '0'}
              onClick={() => {
                onChange(o);
                close(true);
              }}
              onKeyDown={(e) => onOptionKey(e, i)}
              onMouseEnter={() => setActive(i)}
            >
              {lead?.(o)}
              {render(o)}
              <svg
                className="install__check"
                viewBox="0 0 12 12"
                width="12"
                height="12"
                aria-hidden="true"
                focusable="false"
              >
                <path
                  d="M2.5 6.2l2.3 2.3 4.7-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function InstallBlock() {
  const [kind, setKind] = useState<InstallKind>('plugin');
  const [target, setTarget] = useState<InstallTarget>('Claude');
  const uid = useId();
  const command = installCommand(kind, target);

  // Shared copy behaviour: clipboard write, select-to-copy fallback, and a
  // status that resets (and ignores in-flight writes) when the command changes.
  const { state: copyState, copy } = useCopy(command, `${uid}-cmd`);
  const copied = copyState === 'copied';
  const copyError = copyState === 'error';

  return (
    <div className="install bm-float">
      {/* div, not p: the pickers contain <ul> listboxes. */}
      <div className="install__line">
        <span className="install__word">Install the</span>
        <Picker
          name="kind"
          srLabel="Install artifact:"
          value={kind}
          options={INSTALL_KINDS}
          onChange={setKind}
          render={kindLabel}
        />
        <span className="install__word">for</span>
        <Picker
          name="target"
          srLabel="Install target:"
          value={target}
          options={INSTALL_TARGETS}
          onChange={setTarget}
          render={(t) => t}
          lead={(t) => <AgentTile target={t} />}
        />
      </div>

      <div className="install__well">
        <div className="install__command">
          <span className="install__prompt" aria-hidden="true">
            $
          </span>
          <code className="install__cmd" id={`${uid}-cmd`}>
            {command}
          </code>
        </div>

        <div className="install__actions">
          <button
            type="button"
            className="install__copy"
            onClick={copy}
            data-copied={copied ? '1' : '0'}
            aria-label={copied ? 'Copied' : 'Copy command'}
          >
            {copied ? (
              <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false">
                <path
                  d="M3.5 8.4l3 3 6-6.6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg
                viewBox="-1.143 -1.143 18.286 18.286"
                width="16"
                height="16"
                aria-hidden="true"
                focusable="false"
              >
                <rect
                  x="4.842"
                  y="4.843"
                  width="9.957"
                  height="9.957"
                  rx="2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="M11.156 4.843L11.156 3.628C11.156 2.287 10.069 1.2 8.728 1.2L3.628 1.2C2.286 1.2 1.199 2.287 1.199 3.628L1.199 8.728C1.199 10.07 2.286 11.157 3.628 11.157L4.842 11.157"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </button>
          <span className="install__tip" data-show={copied ? '1' : '0'} aria-hidden="true">
            Copied
          </span>
        </div>
      </div>

      <p
        className="install__status"
        data-error={copyError ? '1' : '0'}
        role="status"
        aria-live="polite"
      >
        {copied
          ? 'Command copied to clipboard'
          : copyError
            ? 'Text selected. Press ⌘C or Ctrl+C to copy.'
            : ''}
      </p>
    </div>
  );
}
