import { useEffect, useRef, useState, type CSSProperties } from 'react';

/** Real hotel photography, arranged in independent columns with varied heights.
 * Decorative discovery imagery; the result below uses its own exact property.
 * Image provenance is recorded in public/images/stays/sources.json.
 */
const FIELD = [
  { src: '/images/stays/park-kyoto-exterior.jpg', className: 'imp__photo--tall' },
  { src: '/images/stays/andaz-tokyo-pool.jpg', className: 'imp__photo--short' },
  { src: '/images/stays/hotel-garden.jpg', className: 'imp__photo--short' },
  { src: '/images/stays/niseko-exterior.jpg', className: 'imp__photo--tall' },
  { src: '/images/stays/park-kyoto-room.jpg', className: 'imp__photo--tall' },
  { src: '/images/stays/hotel-twin.jpg', className: 'imp__photo--short' },
  { src: '/images/stays/andaz-tokyo-suite.jpg', className: 'imp__photo--short' },
  { src: '/images/stays/niseko-pool.jpg', className: 'imp__photo--tall' },
  { src: '/images/stays/regency-kyoto-room.jpg', className: 'imp__photo--tall' },
  { src: '/images/stays/hyatt-place-kyoto.jpg', className: 'imp__photo--short' },
];

export const FIELD_COUNT = FIELD.length;

function Frame({
  src,
  className,
  innerRef,
  alternate,
  index,
}: {
  src: string;
  alternate: string;
  index: number;
  className: string;
  innerRef: (el: HTMLDivElement | null) => void;
}) {
  const [ready, setReady] = useState(false);
  const [alternateReady, setAlternateReady] = useState(false);
  const baseRef = useRef<HTMLImageElement>(null);
  const alternateRef = useRef<HTMLImageElement>(null);
  useEffect(() => {
    setReady(Boolean(baseRef.current?.complete && baseRef.current.naturalWidth));
    setAlternateReady(Boolean(alternateRef.current?.complete && alternateRef.current.naturalWidth));
  }, []);
  return (
    <div className={`imp__photo ${className}`} ref={innerRef}
      data-ready={ready} style={{ '--candidate-delay': `${-index * 0.73}s` } as CSSProperties}>
      <img ref={baseRef} className="imp__candidate imp__candidate--base" src={src} alt="" loading="lazy" decoding="async"
        onLoad={() => setReady(true)} onError={() => setReady(false)} />
      <img ref={alternateRef} className="imp__candidate imp__candidate--alternate" src={alternate} alt="" loading="lazy" decoding="async"
        data-ready={alternateReady} onLoad={() => setAlternateReady(true)} onError={() => setAlternateReady(false)} />
      <span className="imp__photo-scan" />
    </div>
  );
}

export function PhotoField({ refs }: { refs: (el: HTMLDivElement | null, i: number) => void }) {
  return (
    <div className="imp__masonry" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((column) => (
        <div className="imp__photo-column" key={column}>
          {FIELD.slice(column * 2, column * 2 + 2).map((f, row) => (
            <Frame key={f.src} src={f.src} className={f.className}
              index={column * 2 + row} alternate={FIELD[(column * 2 + row + 3) % FIELD.length].src}
              innerRef={(el) => refs(el, column * 2 + row)} />
          ))}
        </div>
      ))}
    </div>
  );
}

/** the property the run returned */
export function StayPhoto() {
  const [failed, setFailed] = useState(false);
  return (
    <>
      {!failed && (
        <img
          className="imp__stay-img"
          src="/images/stays/hyatt-place-kyoto.jpg"
          alt=""
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
        />
      )}
    </>
  );
}
