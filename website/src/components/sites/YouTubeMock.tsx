import type { ReactNode } from 'react';
import './YouTubeMock.css';
import { LOGO_SRC } from './logos';

/**
 * YouTube search results for "kyoto travel guide" (desktop web, light mode),
 * grid layout. Authored at natural UI size on a 530 px page and scaled down to
 * fill the 322 x 266 panel, so it reads like a zoomed-out screenshot: the top
 * left carries the guide button, logo, start of the search box, the chips and
 * the first thumbnail. The page is a crop — the masthead's right-hand controls
 * sit past the panel's edge, as they would in a cropped screenshot.
 * Photos: public/images/sites/youtube/sources.json.
 */

const IMG = '/images/sites/youtube';

type Video = {
  thumb: string;
  duration: string;
  title: string;
  channel: string;
  avatar: string;
  verified?: boolean;
  meta: string;
  /** resume-playback bar, 0–1 */
  watched?: number;
  /** baked-in thumbnail lettering, like a creator's own thumbnail art */
  art?: { big: string; small: string; tone: 'light' | 'warm' };
};

const VIDEOS: Video[] = [
  {
    thumb: `${IMG}/thumb-yasaka-dusk.jpg`,
    duration: '18:42',
    title: 'KYOTO Travel Guide 2026 — 3 perfect days (what to see, eat & skip)',
    channel: 'Mika in Japan',
    avatar: `${IMG}/avatar-1.jpg`,
    verified: true,
    meta: '1.2M views • 3 weeks ago',
    art: { big: 'KYOTO', small: '3 PERFECT DAYS', tone: 'light' },
  },
  {
    thumb: `${IMG}/thumb-fushimi-inari.jpg`,
    duration: '12:07',
    title: 'Fushimi Inari at 6 AM — beat the crowds on the full summit hike',
    channel: 'Nomad Notes',
    avatar: `${IMG}/avatar-2.jpg`,
    verified: true,
    meta: '486K views • 2 months ago',
    watched: 0.38,
  },
  {
    thumb: `${IMG}/thumb-kinkakuji.jpg`,
    duration: '24:15',
    title: "Kinkaku-ji, Ryoan-ji & Ginkaku-ji: Kyoto's best temples in one day",
    channel: 'Sora Travels',
    avatar: `${IMG}/avatar-3.jpg`,
    meta: '2.3M views • 1 year ago',
  },
  {
    thumb: `${IMG}/thumb-nishiki-takoyaki.jpg`,
    duration: '16:33',
    title: 'Nishiki Market street food tour — 12 things to eat in Kyoto',
    channel: 'Hungry in Japan',
    avatar: `${IMG}/avatar-4.jpg`,
    verified: true,
    meta: '912K views • 5 months ago',
    art: { big: '¥500', small: 'STREET FOOD', tone: 'warm' },
  },
];

const CHIPS = ['All', 'Shorts', 'Videos', 'Travel', 'Japan', 'Vlogs', 'Live', 'Recently uploaded'];

/* --- icons (24 px Material-style, drawn to YouTube's 2024 set) ------------- */

function Icon({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <svg className={`sm-yt__icon${className ? ` ${className}` : ''}`} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {children}
    </svg>
  );
}

const MenuIcon = () => (
  <Icon>
    <path d="M4 6h16M4 12h16M4 18h16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
  </Icon>
);

const SearchIcon = () => (
  <Icon>
    <circle cx="10.5" cy="10.5" r="6.75" fill="none" stroke="currentColor" strokeWidth="1.75" />
    <path d="M15.4 15.4 20.5 20.5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
  </Icon>
);

const ClearIcon = () => (
  <Icon>
    <path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </Icon>
);

const MicIcon = () => (
  <Icon>
    <rect x="9" y="3" width="6" height="11.5" rx="3" fill="currentColor" />
    <path d="M5.75 11a6.25 6.25 0 0 0 12.5 0M12 17.25V21" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </Icon>
);

const VerifiedIcon = () => (
  <svg className="sm-yt__verified" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path
      fill="currentColor"
      d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zM9.8 17.3l-4.2-4.1L7 11.8l2.8 2.7L17 7.4l1.4 1.4-8.6 8.5z"
    />
  </svg>
);

/* --- page ----------------------------------------------------------------- */

function VideoCard({ v }: { v: Video }) {
  return (
    <div className="sm-yt__video">
      <div className="sm-yt__thumb">
        <img className="sm-yt__thumb-img" src={v.thumb} alt="" draggable={false} />
        {v.art && (
          <div className={`sm-yt__art sm-yt__art--${v.art.tone}`}>
            <span className="sm-yt__art-big">{v.art.big}</span>
            <span className="sm-yt__art-small">{v.art.small}</span>
          </div>
        )}
        <span className={`sm-yt__duration${v.watched ? ' sm-yt__duration--raised' : ''}`}>{v.duration}</span>
        {v.watched && (
          <span className="sm-yt__progress">
            <span className="sm-yt__progress-fill" style={{ width: `${v.watched * 100}%` }} />
          </span>
        )}
      </div>
      <div className="sm-yt__details">
        <img className="sm-yt__avatar" src={v.avatar} alt="" draggable={false} />
        <div className="sm-yt__text">
          <div className="sm-yt__title">{v.title}</div>
          <div className="sm-yt__channel">
            {v.channel}
            {v.verified && <VerifiedIcon />}
          </div>
          <div className="sm-yt__meta">{v.meta}</div>
        </div>
      </div>
    </div>
  );
}

export default function YouTubeMock() {
  return (
    <div className="sm-yt">
      <div className="sm-yt__page">
        <header className="sm-yt__masthead">
          <div className="sm-yt__start">
            <span className="sm-yt__icon-btn">
              <MenuIcon />
            </span>
            <span className="sm-yt__logo">
              <img className="sm-yt__logo-img" src={LOGO_SRC.youtube} alt="YouTube" draggable={false} />
            </span>
          </div>
          <div className="sm-yt__center">
            <div className="sm-yt__search">
              <div className="sm-yt__search-box">
                <span className="sm-yt__query">kyoto travel guide</span>
                <span className="sm-yt__clear">
                  <ClearIcon />
                </span>
              </div>
              <span className="sm-yt__search-btn">
                <SearchIcon />
              </span>
            </div>
            <span className="sm-yt__mic">
              <MicIcon />
            </span>
          </div>
        </header>

        <div className="sm-yt__chips">
          {CHIPS.map((c, i) => (
            <span key={c} className={`sm-yt__chip${i === 0 ? ' sm-yt__chip--active' : ''}`}>
              {c}
            </span>
          ))}
        </div>

        <div className="sm-yt__grid">
          {VIDEOS.map((v) => (
            <VideoCard key={v.title} v={v} />
          ))}
        </div>
      </div>
    </div>
  );
}
