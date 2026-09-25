import type { ReactNode } from 'react';
import './CalendlyMock.css';

/**
 * Calendly's public booking page (calendly.com/<name>/<event>), hi-fi.
 *
 * The whole booking card is authored at its real desktop size (800 x 700,
 * measured from the live page) and the "camera" in CalendlyMock.css crops it
 * to the right-hand column: "Select a Date & Time", the month grid with its
 * blue available dates, and the "POWERED BY Calendly" corner ribbon. The
 * ribbon is the only Calendly mark on the page and it hangs off the card's
 * top-right corner, so framing that column is the one real crop that puts
 * the calendar and the brand together in the panel's visible top-left.
 * The details column (host, event) is authored too, just off-camera.
 */

const AVATAR = '/images/sites/calendly/aiko-tanaka.jpg';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/* November 2026 starts on a Sunday and has 30 days. Weekdays are bookable,
   except 3 Nov (Culture Day) and 23 Nov (Labour Thanksgiving), Japan's
   public holidays. */
const FIRST_WEEKDAY = 0;
const DAYS_IN_MONTH = 30;
const HOLIDAYS = new Set([3, 23]);

function isAvailable(day: number) {
  const weekday = (FIRST_WEEKDAY + day - 1) % 7;
  return weekday !== 0 && weekday !== 6 && !HOLIDAYS.has(day);
}

function monthRows() {
  const cells: (number | null)[] = [
    ...Array.from({ length: FIRST_WEEKDAY }, () => null),
    ...Array.from({ length: DAYS_IN_MONTH }, (_, i) => i + 1),
  ];
  while (cells.length % 7) cells.push(null);
  const rows: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
  return rows;
}

/* --- icons (24px grid, 2px round strokes, like the page's own) ----------- */

function Icon({ size = 24, children, className }: { size?: number; children: ReactNode; className?: string }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
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

const ClockIcon = () => (
  <Icon className="sm-cal__meta-icon">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 3" />
  </Icon>
);

const VideoIcon = () => (
  <Icon className="sm-cal__meta-icon">
    <rect x="3" y="6" width="12" height="12" rx="2" />
    <path d="M15 10l4.553-2.276A1 1 0 0 1 21 8.618v6.764a1 1 0 0 1-1.447.894L15 14z" />
  </Icon>
);

const GlobeIcon = () => (
  <Icon size={16} className="sm-cal__tz-globe">
    <circle cx="12" cy="12" r="9" />
    <path d="M3.6 9h16.8M3.6 15h16.8" />
    <path d="M11.5 3a17 17 0 0 0 0 18M12.5 3a17 17 0 0 1 0 18" />
  </Icon>
);

const ChevronLeft = () => (
  <Icon>
    <path d="M15 6l-6 6 6 6" />
  </Icon>
);

const ChevronRight = () => (
  <Icon>
    <path d="M9 6l6 6-6 6" />
  </Icon>
);

const CaretDown = () => (
  <svg className="sm-cal__tz-caret" width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path d="M6.6 9.5h10.8a1 1 0 0 1 .7 1.7l-5.4 5.4a1 1 0 0 1-1.4 0l-5.4-5.4a1 1 0 0 1 .7-1.7z" fill="currentColor" />
  </svg>
);

export default function CalendlyMock() {
  return (
    <div className="sm-cal">
      <div className="sm-cal__camera">
        <div className="sm-cal__card">
          {/* ---- event details (left column; off-camera in the card) ---- */}
          <div className="sm-cal__details">
            <img className="sm-cal__avatar" src={AVATAR} alt="" width={65} height={65} />
            <div className="sm-cal__host">Aiko Tanaka</div>
            <div className="sm-cal__event">Kyoto Food Tour · Intro Call</div>
            <div className="sm-cal__meta">
              <div className="sm-cal__meta-row">
                <ClockIcon />
                <span>30 min</span>
              </div>
              <div className="sm-cal__meta-row">
                <VideoIcon />
                <span>Web conferencing details provided upon confirmation.</span>
              </div>
            </div>
            <div className="sm-cal__legal">
              <span>Cookie settings</span>
              <span>Privacy Policy</span>
            </div>
          </div>

          {/* ---- date picker (right column; what the camera frames) ---- */}
          <div className="sm-cal__picker">
            <div className="sm-cal__title">Select a Date &amp; Time</div>
            <div className="sm-cal__calendar">
              <div className="sm-cal__month">
                <span className="sm-cal__nav">
                  <ChevronLeft />
                </span>
                <span className="sm-cal__month-label">November 2026</span>
                <span className="sm-cal__nav">
                  <ChevronRight />
                </span>
              </div>
              <div className="sm-cal__grid">
                {WEEKDAYS.map((d) => (
                  <span key={d} className="sm-cal__weekday">
                    {d}
                  </span>
                ))}
                {monthRows().flatMap((row, r) =>
                  row.map((day, c) => (
                    <span key={`${r}-${c}`} className="sm-cal__cell">
                      {day !== null && (
                        <span className={`sm-cal__day${isAvailable(day) ? ' sm-cal__day--open' : ''}`}>{day}</span>
                      )}
                    </span>
                  )),
                )}
              </div>
            </div>
            <div className="sm-cal__tz">
              <div className="sm-cal__tz-label">Time zone</div>
              <div className="sm-cal__tz-value">
                <GlobeIcon />
                <span>Pacific Time - US &amp; Canada (9:41am)</span>
                <CaretDown />
              </div>
            </div>
          </div>

          {/* ---- the corner ribbon (Calendly's live DOM, measured) ---- */}
          <div className="sm-cal__ribbon">
            <div className="sm-cal__ribbon-band">
              <div className="sm-cal__ribbon-small">Powered by</div>
              <div className="sm-cal__ribbon-name">Calendly</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
