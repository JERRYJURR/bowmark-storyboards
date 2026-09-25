import './MapsMock.css';

/**
 * Google Maps (web, light mode) — a hotel search around Gion, Kyoto.
 *
 * A static thumbnail: the page is authored at its natural size inside an
 * inner frame (460 x 380) and scaled into the 322 x 266 panel. The base map is
 * one inline SVG in the same 460 x 380 space — a plausible central Kyoto:
 * the downtown grid west of the Kamo River, Gion and Yasaka Shrine to its east,
 * the Higashiyama hills beyond, Kyoto Station in the south-west corner.
 * Search results (hotel price pills) and the floating chrome sit on top in HTML.
 */

type RoadKind = 'minor' | 'local' | 'major' | 'art' | 'wide';

/* casing + fill widths per road class, in map px */
const ROAD_W: Record<RoadKind, [number, number]> = {
  minor: [3.4, 2.2],
  local: [5, 3.6],
  major: [6.6, 5],
  art: [7.2, 5.6],
  wide: [8.8, 7],
};

const h = (y: number, x0: number, x1: number) => `M${x0} ${y}H${x1}`;
const v = (x: number, y0: number, y1: number) => `M${x} ${y0}V${y1}`;

/* drawn in this order: minor streets under locals under arterials */
const ROADS: [RoadKind, string][] = [
  /* downtown grid, west of the river (N-S) */
  ['minor', v(10, 0, 346)],
  ['minor', v(35, 0, 346)],
  ['minor', v(60, 0, 346)],
  ['minor', v(70, 0, 346)],
  ['minor', v(91, 0, 346)],
  ['minor', v(100, 0, 346)],
  ['minor', v(108, 0, 346)],
  ['minor', v(116, 104, 182)],
  ['minor', v(134, 0, 300)],
  /* downtown grid (E-W) */
  ['minor', h(97, 0, 134)],
  ['minor', h(127, 0, 134)],
  ['minor', h(144, 0, 134)],
  ['minor', h(162, 0, 48)],
  ['minor', h(162, 108, 124)],
  ['minor', h(196, 0, 134)],
  ['minor', h(226, 0, 134)],
  ['minor', h(278, 0, 134)],
  ['minor', h(294, 0, 162)],
  ['minor', h(306, 0, 134)],
  ['minor', h(330, 0, 124)],
  /* Gion and the east bank */
  ['minor', h(128, 162, 230)],
  ['minor', h(142, 162, 230)],
  ['minor', v(199, 128, 180)],
  ['minor', h(196, 162, 199)],
  ['minor', h(294, 162, 232)],
  ['minor', 'M231 214Q250 216 268 226'],
  ['minor', 'M232 241Q262 244 290 252L316 262'],
  ['minor', 'M262 196C268 212 277 224 285 236S302 256 316 262'],
  ['minor', 'M253 182Q268 170 288 177'],
  ['minor', 'M264 158Q276 168 280 190'],
  ['minor', 'M256 128Q272 124 290 116'],
  ['minor', 'M232 318Q248 318 262 312'],
  ['minor', v(214, 128, 180)],
  ['minor', v(214, 250, 318)],
  ['minor', h(211, 162, 180)],
  ['minor', h(226, 162, 186)],
  ['minor', h(278, 162, 232)],
  ['minor', h(306, 162, 232)],
  ['minor', 'M231 98Q250 97 272 90'],
  ['minor', 'M231 150H248'],
  ['minor', 'M232 284Q252 282 272 272'],
  /* locals */
  ['local', v(48, 0, 346)],
  ['local', v(80, 0, 346)],
  ['local', h(162, 48, 108)],
  ['local', h(211, 0, 134)],
  ['local', h(241, 0, 232)],
  ['local', v(180, 110, 318)],
  ['local', v(199, 180, 206)],
  /* majors */
  ['major', h(110, 0, 231) + 'Q272 108 302 100T460 76'],
  ['major', v(162, 0, 380)],
  /* arterials */
  ['art', v(22, 0, 340)],
  ['art', v(124, 0, 380)],
  ['art', 'M229 0L230 120L231 200L232 262L234 380'],
  ['art', h(84, 0, 162)],
  ['art', h(180, 0, 231)],
  ['art', h(318, 0, 232)],
  ['art', h(340, 0, 232)],
  ['wide', h(262, 0, 232) + 'Q282 262 330 254T460 238'],
];

/** small base-map POI: a category-coloured teardrop with a white dot glyph */
function Poi({ x, y, fill }: { x: number; y: number; fill: string }) {
  return (
    <g transform={`translate(${x - 6} ${y - 16})`}>
      <path d="M6 0C2.7 0 0 2.7 0 6c0 4.4 6 10 6 10s6-5.6 6-10c0-3.3-2.7-6-6-6z" fill={fill} stroke="#fff" strokeWidth="0.8" />
      <circle cx="6" cy="6" r="2.2" fill="#fff" />
    </g>
  );
}

/** a red search-result pin (the classic Google Maps marker) with a glyph */
function RedPin({ x, y, glyph }: { x: number; y: number; glyph: string }) {
  return (
    <g transform={`translate(${x - 11} ${y - 31})`}>
      <path
        d="M11 0C4.9 0 0 4.9 0 11c0 8 11 20 11 20s11-12 11-20C22 4.9 17.1 0 11 0z"
        fill="#ea4335"
        stroke="#b31412"
        strokeWidth="0.9"
      />
      <path d={glyph} fill="#fff" transform="translate(5 5) scale(0.5)" />
    </g>
  );
}

/* white glyphs, 24-unit boxes */
const G_TORII =
  'M2 4.6Q12 7.4 22 4.6V7.4Q12 9.8 2 7.4Z M4 11H20V13.2H4Z M6.4 8.6H8.8V21.5H6.4Z M15.2 8.6H17.6V21.5H15.2Z';
const G_TEMPLE =
  'M12 2L3 7.4H21Z M5.5 8.4H18.5V10.4H5.5Z M2.5 13.4L12 10.6L21.5 13.4Z M5 14.4H19V21.5H14.2V17H9.8V21.5H5Z';
const G_FOOD =
  'M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z';

/* Material-style UI icons */
const I_MENU = 'M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z';
const I_SEARCH =
  'M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z';
const I_DIR_ARROW = 'M14 14.5V12h-4v3H8v-4c0-.55.45-1 1-1h5V7.5l3.5 3.5-3.5 3.5z';
const I_BED =
  'M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm12-6h-8v7H3V5H1v15h2v-3h18v3h2v-9c0-2.21-1.79-4-4-4z';
const I_CAMERA =
  'M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4zM9 2 7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z';
const I_TRAIN =
  'M12 2c-4 0-8 .5-8 4v9.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h2.23l2-2H14l2 2h2v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V6c0-3.5-3.58-4-8-4zM7.5 17c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm3.5-7H6V6h5v4zm2 0V6h5v4h-5zm3.5 7c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z';
const I_PARKING = 'M13 3H6v18h4v-6h3c3.31 0 6-2.69 6-6s-2.69-6-6-6zm.2 8H10V7h3.2c1.1 0 2 .9 2 2s-.9 2-2 2z';
const I_PLUS = 'M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z';
const I_MINUS = 'M19 13H5v-2h14v2z';
const I_LOCATE =
  'M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0 0 13 3.06V1h-2v2.06A8.994 8.994 0 0 0 3.06 11H1v2h2.06A8.994 8.994 0 0 0 11 20.94V23h2v-2.06A8.994 8.994 0 0 0 20.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z';
const I_LAYERS =
  'm11.99 18.54-7.37-5.73L3 14.07l9 7 9-7-1.63-1.27-7.38 5.74zM12 16l7.36-5.73L21 9l-9-7-9 7 1.63 1.27L12 16z';

function Icon({ d, className }: { d: string; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d={d} />
    </svg>
  );
}

/* hotel results: [price, x, y] — the pill's tail tip on the map */
const PILLS: [string, number, number][] = [
  ['$231', 196, 226],
  ['$96', 70, 280],
  ['$612', 294, 232],
  ['$205', 380, 176],
  ['$158', 192, 302],
  ['$327', 380, 330],
];

const CHIPS: [string, string][] = [
  ['Restaurants', G_FOOD],
  ['Hotels', I_BED],
  ['Things to do', I_CAMERA],
  ['Transit', I_TRAIN],
  ['Parking', I_PARKING],
];

export default function MapsMock() {
  return (
    <div className="sm-map">
      <div className="sm-map__page">
        <svg className="sm-map__base" viewBox="0 0 460 380" aria-hidden="true" focusable="false">
          {/* land, commercial blocks */}
          <rect width="460" height="380" fill="#f2f3f5" />
          <path
            className="sm-map__biz"
            d="M22 162H134V196H22Z M100 84H134V262H100Z M10 84H35V241H10Z M35 97H100V127H35Z M162 162H231V196H162Z M0 326H132V346H0Z M0 362H90V380H0Z"
          />

          {/* Higashiyama hills, Maruyama Park, temple grounds */}
          <path
            className="sm-map__forest"
            d="M460 0H300C292 30 288 60 290 90C292 110 284 122 262 132C250 142 246 156 250 170C254 186 262 198 280 208C292 216 298 232 300 248C302 264 296 284 288 300C280 318 272 340 270 380H460Z"
          />
          <path
            className="sm-map__park"
            d="M252 148C264 139 285 141 297 152C305 166 301 188 290 198C276 205 258 199 252 186C246 174 244 158 252 148Z"
          />
          <path className="sm-map__grounds" d="M186 212H224V246H186Z M240 104H282V130H240Z" />
          <path className="sm-map__shrine" d="M234 168H252V192H234Z M184 298H224V314H184Z M184 322H226V336H184Z" />

          {/* water: the Kamo (with its riverside walks), the Takase canal, the Shirakawa */}
          <path
            className="sm-map__bank"
            d="M141.4 0C141.4 60 140.4 140 140.4 190C140.4 250 137.4 320 135.4 380H154.6C156.6 320 159.6 250 159.6 190C159.6 140 160.6 60 160.6 0Z"
          />
          <path
            className="sm-map__water"
            d="M145 0C145 60 144 140 144 190C144 250 141 320 139 380H151C153 320 156 250 156 190C156 140 157 60 157 0Z"
          />
          <path className="sm-map__canal" d="M137.5 0V300Q138 340 136 380" />
          <path className="sm-map__canal" d="M245 118C225 124 205 134 186 140C172 144 162 146 157 150" />

          {/* JR lines and Kyoto Station */}
          <path className="sm-map__rail" d="M0 368H460 M0 373H250" />
          <path className="sm-map__bldg" d="M0 347H80V362H0Z" />

          {/* roads: all casings, then all fills */}
          <g fill="none" strokeLinecap="butt">
            {ROADS.map(([k, d], i) => (
              <path key={`c${i}`} d={d} className={`sm-map__rc sm-map__rc--${k}`} strokeWidth={ROAD_W[k][0]} />
            ))}
            {ROADS.map(([k, d], i) => (
              <path key={`f${i}`} d={d} className={`sm-map__rf sm-map__rf--${k}`} strokeWidth={ROAD_W[k][1]} />
            ))}
          </g>

          {/* street, water and area labels */}
          <g className="sm-map__lbl">
            <text x="171" y="183.6">Shijō-dōri</text>
            <text x="171" y="265.6">Gojō-dōri</text>
            <text transform="translate(120.3 190) rotate(90)">Kawaramachi-dōri</text>
            <text className="sm-map__lbl--water" transform="translate(144.6 262) rotate(90)">Kamo River</text>
            <text className="sm-map__lbl--area" x="178" y="168">GION</text>
          </g>

          {/* base-map places */}
          <g className="sm-map__lbl sm-map__lbl--poi">
            <Poi x={283} y={198} fill="#34a853" />
            <text className="sm-map__lbl--park" x="290" y="202">Maruyama Park</text>
            <Poi x={205} y={246} fill="#7e8f9c" />
            <text className="sm-map__lbl--wor" x="212" y="250">Kennin-ji</text>
            <Poi x={254} y={300} fill="#e8558e" />
            <Poi x={264} y={124} fill="#7e8f9c" />
            <Poi x={205} y={330} fill="#12a4af" />
            <text className="sm-map__lbl--att" x="212" y="340">Sanjūsangen-dō</text>
            <circle className="sm-map__dot" cx="64" cy="152" r="2.6" />
            <circle className="sm-map__dot" cx="87" cy="134" r="2.6" />
            <circle className="sm-map__dot" cx="41" cy="205" r="2.6" />
            <circle className="sm-map__dot" cx="172" cy="152" r="2.6" />
            <circle className="sm-map__dot" cx="214" cy="186" r="2.6" />
            <circle className="sm-map__dot" cx="96" cy="236" r="2.6" />
          </g>

          {/* stations */}
          <g className="sm-map__lbl sm-map__lbl--transit">
            {[
              [26, 186],
              [128, 170],
              [166, 186],
              [166, 250],
              [84, 349],
            ].map(([x, y]) => (
              <g key={`${x}-${y}`} transform={`translate(${x} ${y})`}>
                <rect width="9" height="9" rx="2" fill="#3f7ee8" stroke="#fff" strokeWidth="0.8" />
                <path d={I_TRAIN} fill="#fff" transform="translate(1.3 1.3) scale(0.27)" />
              </g>
            ))}
            <text x="96" y="357.4">Kyoto Station</text>
          </g>

          {/* red result pins: landmarks */}
          <g className="sm-map__lbl sm-map__lbl--pin">
            <text className="sm-map__lbl--sel" x="70" y="226" textAnchor="middle">Hyatt Place Kyoto</text>
            <text className="sm-map__lbl--sub" x="70" y="238" textAnchor="middle">4.4 ★ (1,532)</text>
            <RedPin x={60} y={162} glyph={G_FOOD} />
            <text x="73" y="148">Nishiki Market</text>
            <RedPin x={240} y={180} glyph={G_TORII} />
            <text x="253" y="161">Yasaka Shrine</text>
            <text className="sm-map__lbl--sub" x="253" y="173">Shinto shrine</text>
            <RedPin x={322} y={266} glyph={G_TEMPLE} />
            <text x="335" y="249">Kiyomizu-dera</text>
            <text className="sm-map__lbl--sub" x="335" y="261">Buddhist temple</text>
          </g>
        </svg>

        {/* hotel results */}
        {PILLS.map(([p, x, y]) => (
          <span key={p} className="sm-map__pill" style={{ left: x, top: y }}>
            <span className="sm-map__pill-ic">
              <Icon d={I_BED} />
            </span>
            {p}
          </span>
        ))}
        <span className="sm-map__pill sm-map__pill--on" style={{ left: 70, top: 214 }}>
          <span className="sm-map__pill-ic">
            <Icon d={I_BED} />
          </span>
          $184
        </span>

        {/* floating search box */}
        <div className="sm-map__search">
          <Icon d={I_MENU} className="sm-map__search-menu" />
          <span className="sm-map__search-q">Hotels near Gion, Kyoto</span>
          <Icon d={I_SEARCH} className="sm-map__search-go" />
          <span className="sm-map__search-div" />
          <svg className="sm-map__search-dir" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M12.7 2.3l9 9a1 1 0 0 1 0 1.4l-9 9a1 1 0 0 1-1.4 0l-9-9a1 1 0 0 1 0-1.4l9-9a1 1 0 0 1 1.4 0z" fill="#1a73e8" />
            <path d={I_DIR_ARROW} fill="#fff" />
          </svg>
        </div>

        {/* category chips */}
        <div className="sm-map__chips">
          {CHIPS.map(([label, d]) => (
            <span key={label} className={`sm-map__chip${label === 'Hotels' ? ' sm-map__chip--on' : ''}`}>
              <Icon d={d} />
              {label}
            </span>
          ))}
        </div>

        {/* account */}
        <div className="sm-map__acct">
          <svg className="sm-map__apps" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            {[5, 12, 19].map((cy) => [5, 12, 19].map((cx) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="2" />))}
          </svg>
          <span className="sm-map__avatar">M</span>
        </div>

        {/* layers switcher */}
        <div className="sm-map__layers">
          <span className="sm-map__layers-sat" />
          <span className="sm-map__layers-lbl">
            <Icon d={I_LAYERS} />
            Layers
          </span>
        </div>

        {/* map controls */}
        <div className="sm-map__ctrls">
          <span className="sm-map__ctrl">
            <Icon d={I_LOCATE} />
          </span>
          <span className="sm-map__zoom">
            <Icon d={I_PLUS} />
            <span className="sm-map__zoom-div" />
            <Icon d={I_MINUS} />
          </span>
          <span className="sm-map__ctrl">
            <svg className="sm-map__peg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <circle cx="12" cy="5" r="3.2" />
              <path d="M9.6 9.2h4.8a1.8 1.8 0 0 1 1.8 1.8v5h-1.8v5.6h-2v-5.6h-.8v5.6h-2v-5.6H7.8v-5a1.8 1.8 0 0 1 1.8-1.8z" />
            </svg>
          </span>
        </div>

        {/* attribution */}
        <div className="sm-map__attr">
          <span>Map data ©2026 Google</span>
          <span>Japan</span>
          <span>Terms</span>
          <span>Privacy</span>
          <span>Send Product Feedback</span>
          <span className="sm-map__scale">200 m</span>
        </div>
      </div>
    </div>
  );
}
