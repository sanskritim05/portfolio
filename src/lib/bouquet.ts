/*
 * An ASCII bouquet: lilies, cosmos, tulips, roses, lavender sprigs and baby's breath on long
 * stems gathered below the frame, with leaves along them. The scene is painted into a grid of
 * brightness + colour values, then each cell is drawn as a glyph whose density matches its
 * brightness, with a soft glow on top.
 */

type Vec2 = [number, number];
type Vec3 = [number, number, number];
type Palette = { deep: Vec3; mid: Vec3; tip: Vec3; sheen: Vec3; spots: number };
type CellFn = (i: number, a: number, q: number, r: number, c: number) => void;

const FONT_SIZE = 8;
const FONT = `${FONT_SIZE}px Menlo, Consolas, "DejaVu Sans Mono", "Courier New", monospace`;
const ROWS = 160;
// Scene x runs about -75..75 at 2 columns per unit
const COLS = 300;
/** Width / height of the rendered image: cells are twice as tall as wide. */
export const BOUQUET_ASPECT = COLS / (ROWS * 2);
const WAVE_PERIOD = 14;
const WIND = 2.2;
const GLOW = 0.55;

const BUCKETS = [" ", "'.", ":,", "-~", "+=*", "oxsz", "%&8#", "@"];
const LEVELS = [0.06, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9];

/** "#RRGGBB" as an [r, g, b] triple in 0..1. */
const hex = (h: string): Vec3 => [
  parseInt(h.slice(1, 3), 16) / 255,
  parseInt(h.slice(3, 5), 16) / 255,
  parseInt(h.slice(5, 7), 16) / 255,
];
const tint = (c: Vec3, toWhite: number, scale: number): Vec3 => [
  (c[0] + (1 - c[0]) * toWhite) * scale,
  (c[1] + (1 - c[1]) * toWhite) * scale,
  (c[2] + (1 - c[2]) * toWhite) * scale,
];

export const COLORS = {
  hotPink: "#FF4FA3",
  electricPink: "#FF2D95",
  bubblegumPink: "#FF78C4",
  vibrantCoral: "#FF6B6B",
  watermelon: "#FF477E",
  tangerine: "#FF914D",
  sunflowerYellow: "#FFD93D",
  goldenYellow: "#FFBF3F",
  electricLavender: "#B56CFF",
  vividViolet: "#A855F7",
  brightLilac: "#CE8CFF",
  periwinkleBlue: "#8B9CFF",
  skyBlue: "#5CCBFF",
  turquoise: "#40E0D0",
  springGreen: "#70E89B",
  emeraldGreen: "#31D99B",
};
type ColorName = keyof typeof COLORS;

/**
 * Petal shading built from one colour. Rendering brightens lit cells (about 1.3x for a typical
 * petal), so the stored values are scaled down to land on the colour itself: deeper at the
 * petal base, the colour across the petal, and a lighter tint at the tips and highlights.
 */
function petalPalette(color: string, spots: number): Palette {
  const c = hex(color);
  return {
    deep: tint(c, 0, 0.45),
    mid: tint(c, 0, 0.8),
    tip: tint(c, 0.25, 0.85),
    sheen: tint(c, 0.5, 0.85),
    spots,
  };
}
const PAL = Object.fromEntries(
  Object.entries(COLORS).map(([name, value]) => [name, petalPalette(value, 8)]),
) as Record<ColorName, Palette>;

const SPRING = hex(COLORS.springGreen);
const EMERALD = hex(COLORS.emeraldGreen);
const STEM = tint(EMERALD, 0, 0.6);
const BUD = tint(SPRING, 0, 0.75);
const ANTHER: Vec3 = [0.95, 0.42, 0.1];
const STAMEN: Vec3 = [0.78, 0.55, 0.45];
const BREATH_WHITE: Vec3 = [0.6, 0.6, 0.58];
const STAR_LIGHT: Vec3 = [0.62, 0.68, 0.85];

// ---------------------------------------------------------------- maths
const TAU = Math.PI * 2;
const rad = (d: number) => (d * Math.PI) / 180;
const clamp = (x: number, lo = 0, hi = 1) => (x < lo ? lo : x > hi ? hi : x);
function smoothstep(a: number, b: number, x: number) {
  const t = clamp((x - a) / (b - a));
  return t * t * (3 - 2 * t);
}
const wave = (t: number, k: number, ph = 0) => Math.sin((TAU * k * t) / WAVE_PERIOD + ph);
/** Deterministic hash: the same inputs always give the same value. */
function hash3(a: number, b: number, c: number) {
  let h = (Math.imul(a, 73856093) ^ Math.imul(b, 19349663) ^ Math.imul(c, 83492791)) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
  return (h ^ (h >>> 16)) >>> 0;
}
const rnd = (a: number, b = 0) => hash3(a, b, 911) / 4294967296; // fixed pseudo-random 0..1
const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul = (a: Vec3, s: number): Vec3 => [a[0] * s, a[1] * s, a[2] * s];
const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
const norm = (v: Vec3) => mul(v, 1 / (Math.hypot(v[0], v[1], v[2]) + 1e-9));
const lin = (n: number) => Array.from({ length: n }, (_, k) => k / (n - 1));
const lerp3 = (a: Vec3, b: Vec3, k: number): Vec3 => {
  k = clamp(k);
  return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
};
const easeOut = (x: number) => 1 - Math.pow(1 - clamp(x), 3);
const LIGHT = norm([-0.5, -0.6, 0.62]); // light from the upper left

function curve(p0: Vec2, p1: Vec2, bulge: number, grow: number, n = 10): Vec2[] {
  const dx = p1[0] - p0[0];
  const dy = p1[1] - p0[1];
  const L = Math.hypot(dx, dy) + 1e-9;
  const nx = -dy / L;
  const ny = dx / L;
  const out: Vec2[] = [];
  for (let k = 0; k < n; k++) {
    const s = (k / (n - 1)) * grow;
    const b = bulge * Math.sin(Math.PI * s);
    out.push([p0[0] + dx * s + nx * b, p0[1] + dy * s + ny * b]);
  }
  return out;
}

// ---------------------------------------------------------------- composition
const BASE_Y = 172; // stems gather below the bottom edge, like a bunch held in a hand
/** Where a flower's stem starts: the stems converge toward the middle below the frame. */
const baseOf = (p: Vec2): Vec2 => [p[0] * 0.12, BASE_Y];

type Kind = "lily" | "cosmos" | "tulip" | "rose";
type Head = { kind: Kind; pos: Vec2; size: number; color: ColorName; axis?: Vec3 };

// A tight, overlapping cluster: back of the bouquet first, lower heads sit in front
const HEADS: Head[] = [
  { kind: "tulip", pos: [-16, 24], size: 11, color: "goldenYellow" },
  { kind: "tulip", pos: [18, 20], size: 11, color: "watermelon" },
  { kind: "tulip", pos: [-38, 46], size: 10, color: "bubblegumPink" },
  { kind: "tulip", pos: [40, 44], size: 10, color: "vividViolet" },
  { kind: "lily", pos: [14, 44], size: 13, color: "electricLavender", axis: [0.45, -0.5, 0.74] },
  { kind: "lily", pos: [-10, 54], size: 15, color: "hotPink", axis: [-0.1, -0.35, 0.93] },
  { kind: "lily", pos: [-34, 76], size: 13, color: "tangerine", axis: [-0.7, -0.2, 0.68] },
  { kind: "lily", pos: [36, 72], size: 12, color: "periwinkleBlue", axis: [0.7, -0.25, 0.67] },
  // Three cosmos tucked into the middle: one sitting just above the yellow and blue pair
  { kind: "cosmos", pos: [6, 68], size: 11, color: "bubblegumPink" },
  { kind: "cosmos", pos: [-6, 84], size: 11, color: "sunflowerYellow" },
  { kind: "cosmos", pos: [18, 84], size: 11, color: "skyBlue" },
  { kind: "rose", pos: [-20, 100], size: 11, color: "vibrantCoral" },
  { kind: "rose", pos: [26, 100], size: 10, color: "turquoise" },
  { kind: "rose", pos: [3, 108], size: 12, color: "electricPink" },
];
const SPRIGS: { tip: Vec2; color: ColorName }[] = [
  { tip: [-46, 16], color: "brightLilac" },
  { tip: [48, 14], color: "vividViolet" },
  { tip: [4, 4], color: "periwinkleBlue" },
];
const BREATH_AT: Vec2[] = [
  [-42, 26],
  [44, 28],
  [0, 32],
  [-48, 94],
  [50, 90],
];
const bulgeOf = (h: Head, k: number) => (h.pos[0] >= 0 ? 1 : -1) * (k % 2 ? 3 : -2);

// Timeline (seconds): stems grow up from below, the centre first; each head blooms once its
// stem has arrived, filler flowers follow, then the stars and drifting petals
const STEM_DUR = 1.0;
const distFromCentre = (p: Vec2) => Math.hypot(p[0], (p[1] - 64) * 1.3);
const BLOOM = HEADS.map((h) => {
  const start = 0.1 + (distFromCentre(h.pos) / 80) * 0.7;
  return { start, end: start + STEM_DUR };
});
const AMBIENT_AT = 3.0;

/** Point and direction a fraction of the way along a stem. */
function pathAt(path: Vec2[], frac: number) {
  const f = frac * (path.length - 1);
  const k = Math.min(path.length - 2, Math.floor(f));
  const u = f - k;
  const a = path[k];
  const b = path[k + 1];
  return {
    x: a[0] + (b[0] - a[0]) * u,
    y: a[1] + (b[1] - a[1]) * u,
    ang: Math.atan2(b[1] - a[1], b[0] - a[0]),
  };
}

type Leaf = {
  x: number;
  y: number;
  ang: number;
  dir: number;
  seed: number;
  len: number;
  wid: number;
  droop: number;
  twist: number;
  phase: number;
  tAt: number; // when the growing stem passes the leaf, so it can unfurl
};
// Two leaves on each of the lower stems, sprouting where the stems are on screen
const LEAF_SPECS: Leaf[] = HEADS.flatMap((h, k) => {
  if (h.pos[1] < 50) return [];
  const path = curve(baseOf(h.pos), h.pos, bulgeOf(h, k), 1, 14);
  return [150, 130].map((y, j) => {
    const sd = k * 7 + j;
    const frac = clamp((BASE_Y - y) / (BASE_Y - h.pos[1]), 0.05, 0.85);
    const p = pathAt(path, frac);
    const side = (k + j) % 2 ? 1 : -1;
    const ang = p.ang + side * rad(32 + rnd(sd, 1) * 25);
    return {
      x: p.x,
      y: p.y,
      ang,
      dir: Math.cos(ang) >= 0 ? 1 : -1,
      seed: sd,
      len: (40 - j * 7) * (0.85 + rnd(sd, 2) * 0.3),
      wid: 3.6 + rnd(sd, 3) * 1,
      droop: rad(30 + rnd(sd, 4) * 35),
      twist: 1.2 + rnd(sd, 5) * 2,
      phase: rnd(sd, 6) * TAU,
      tAt: BLOOM[k].start + STEM_DUR * (1 - Math.cbrt(1 - frac)),
    };
  });
});

const STARS = Array.from({ length: 46 }, (_, k) => ({
  x: (rnd(k, 10) - 0.5) * 146,
  y: rnd(k, 11) * 156 + 2,
  speed: 1.2 + rnd(k, 12) * 2.4,
  phase: rnd(k, 13) * TAU,
}));
const PETALS = Array.from({ length: 7 }, (_, k) => ({
  x0: (rnd(k, 20) - 0.5) * 130,
  speed: 9 + rnd(k, 21) * 7,
  offset: rnd(k, 22) * 190,
  phase: rnd(k, 23) * TAU,
  size: 2.2 + rnd(k, 24) * 1.4,
  color: PAL[(Object.keys(COLORS) as ColorName[])[k * 2]].mid,
}));

export type Bouquet = {
  width: number;
  height: number;
  render: (t: number) => void;
  /** Cursor wind: position (0..1 of the image) and horizontal speed (image widths per second). */
  push: (xFrac: number, yFrac: number, vxFrac: number) => void;
};

/**
 * Sets up the bouquet on `canvas` and returns its pixel size, `render(t)` to draw the scene `t`
 * seconds into the animation, and `push` for cursor wind.
 */
export function createBouquet(canvas: HTMLCanvasElement, background: string): Bouquet {
  const probe = document.createElement("canvas").getContext("2d")!;
  probe.font = FONT;
  const CW = Math.max(1, Math.round(probe.measureText("M").width));
  const CH = CW * 2; // cells are exactly twice as tall as wide, which the x scale assumes
  const N = COLS * ROWS;

  // ---------------------------------------------------------------- grid of brightness + colour
  const Xc = new Float32Array(COLS);
  const Yr = new Float32Array(ROWS);
  for (let c = 0; c < COLS; c++) Xc[c] = (c + 0.5 - COLS / 2) * 0.5;
  for (let r = 0; r < ROWS; r++) Yr[r] = r + 0.5;
  const lum = new Float32Array(N);
  const rgb = new Float32Array(N * 3);
  const rowShift = new Float32Array(ROWS);
  // Cursor wind: each row is a damped spring that the pointer's horizontal speed kicks, so the
  // stems and petals it brushes past bend that way and then swing back
  const gust = new Float32Array(ROWS);
  const gustVel = new Float32Array(ROWS);
  const pointer = { x: 0, y: -1e3 };
  let lastT = -1;

  function set(i: number, l: number, col: Vec3) {
    lum[i] = l;
    const j = i * 3;
    rgb[j] = col[0];
    rgb[j + 1] = col[1];
    rgb[j + 2] = col[2];
  }
  const cellIndex = (x: number, y: number) => {
    const r = Math.floor(y);
    if (r < 0 || r >= ROWS) return -1;
    const c = Math.floor((x + rowShift[r]) * 2 + COLS / 2);
    return c < 0 || c >= COLS ? -1 : r * COLS + c;
  };

  // Paints a tapered shape along a polyline: calls fn(cell, distance along a, signed offset q -1..1)
  const SEG = new Float64Array(24 * 9);
  function brush(pts: Vec2[], hws: number[], av: number[], fn: CellFn) {
    const n = pts.length;
    const ns = n - 1;
    if (n < 2) return;
    let ymin = 1e9;
    let ymax = -1e9;
    let maxw = 0;
    for (let k = 0; k < n; k++) {
      const y = pts[k][1];
      if (y < ymin) ymin = y;
      if (y > ymax) ymax = y;
      if (hws[k] > maxw) maxw = hws[k];
    }
    for (let s = 0; s < ns; s++) {
      const o = s * 9;
      const ax = pts[s][0];
      const ay = pts[s][1];
      const dx = pts[s + 1][0] - ax;
      const dy = pts[s + 1][1] - ay;
      SEG[o] = ax;
      SEG[o + 1] = ay;
      SEG[o + 2] = dx;
      SEG[o + 3] = dy;
      SEG[o + 4] = 1 / (dx * dx + dy * dy + 1e-9);
      SEG[o + 5] = hws[s];
      SEG[o + 6] = hws[s + 1] - hws[s];
      SEG[o + 7] = av[s];
      SEG[o + 8] = av[s + 1] - av[s];
    }
    const pad = maxw + 1;
    const r0 = Math.max(0, Math.floor(ymin - pad));
    const r1 = Math.min(ROWS, Math.ceil(ymax + pad));
    for (let r = r0; r < r1; r++) {
      const py = Yr[r];
      const sh = rowShift[r];
      let rx0 = 1e9;
      let rx1 = -1e9;
      for (let s = 0, o = 0; s < ns; s++, o += 9) {
        const pw = Math.max(SEG[o + 5], SEG[o + 5] + SEG[o + 6]) + 1;
        const ya = SEG[o + 1];
        const yb = ya + SEG[o + 3];
        if (py < Math.min(ya, yb) - pw || py > Math.max(ya, yb) + pw) continue;
        const xa = SEG[o];
        const xb = xa + SEG[o + 2];
        rx0 = Math.min(rx0, Math.min(xa, xb) - pw);
        rx1 = Math.max(rx1, Math.max(xa, xb) + pw);
      }
      if (rx0 > rx1) continue;
      const c0 = Math.max(0, Math.floor((rx0 + sh) * 2 + COLS / 2));
      const c1 = Math.min(COLS, Math.ceil((rx1 + sh) * 2 + COLS / 2));
      for (let c = c0; c < c1; c++) {
        const px = Xc[c] - sh;
        let best = 1;
        let bestS = -1;
        let bestU = 0;
        for (let s = 0, o = 0; s < ns; s++, o += 9) {
          const qx = px - SEG[o];
          const qy = py - SEG[o + 1];
          const dx = SEG[o + 2];
          const dy = SEG[o + 3];
          let u = (qx * dx + qy * dy) * SEG[o + 4];
          u = u < 0 ? 0 : u > 1 ? 1 : u;
          const ex = qx - dx * u;
          const ey = qy - dy * u;
          let hw = SEG[o + 5] + SEG[o + 6] * u;
          if (hw < 1e-3) hw = 1e-3;
          const q2 = (ex * ex + ey * ey) / (hw * hw);
          if (q2 < best) {
            best = q2;
            bestS = s;
            bestU = u;
          }
        }
        if (bestS < 0) continue;
        const o = bestS * 9;
        const cr = SEG[o + 2] * (py - SEG[o + 1]) - SEG[o + 3] * (px - SEG[o]);
        const side = cr > 0 ? 1 : cr < 0 ? -1 : 0;
        fn(r * COLS + c, SEG[o + 7] + SEG[o + 8] * bestU, Math.sqrt(best) * side, r, c);
      }
    }
  }

  /** Fills a disc, calling fn(cell, distance from centre 0..1, x offset, y offset). */
  function fillDisc(
    cx: number,
    cy: number,
    radius: number,
    fn: (i: number, d: number, dx: number, dy: number) => void,
  ) {
    if (radius <= 0.05) return;
    const r0 = Math.max(0, Math.floor(cy - radius));
    const r1 = Math.min(ROWS, Math.ceil(cy + radius));
    for (let r = r0; r < r1; r++) {
      const sh = rowShift[r];
      const dy = Yr[r] - cy;
      const c0 = Math.max(0, Math.floor((cx - radius + sh) * 2 + COLS / 2));
      const c1 = Math.min(COLS, Math.ceil((cx + radius + sh) * 2 + COLS / 2));
      for (let c = c0; c < c1; c++) {
        const dx = Xc[c] - sh - cx;
        const d = Math.hypot(dx, dy) / radius;
        if (d < 1) fn(r * COLS + c, d, dx, dy);
      }
    }
  }

  // ---------------------------------------------------------------- stems and leaves
  function tube(pts: Vec2[], w0: number, w1: number, col: Vec3) {
    const n = pts.length;
    if (n < 2) return;
    const hws = lin(n).map((k) => w0 + (w1 - w0) * k);
    const dark = mul(col, 0.6);
    const lite = mul(col, 1.25);
    brush(pts, hws, lin(n), (i, _a, q) => {
      set(i, 0.42 + 0.35 * (1 - Math.abs(q)) - 0.18 * q, lerp3(dark, lite, 0.5 - 0.5 * q));
    });
  }

  const LEAF_D = tint(EMERALD, 0, 0.3);
  const LEAF_L = tint(SPRING, 0, 0.66);
  const UNDER = tint(SPRING, 0.25, 0.62);
  // A long leaf curving off its stem; it twists to show its paler underside
  function leaf(L: Leaf, t: number, unfurl: number) {
    if (unfurl <= 0.01) return;
    const n = 12;
    const len = L.len * (0.3 + 0.7 * unfurl);
    const sway = rad(5) * wave(t, 3, L.seed);
    const pts: Vec2[] = [];
    const hws: number[] = [];
    let x = L.x;
    let y = L.y;
    for (let k = 0; k < n; k++) {
      const a = k / (n - 1);
      pts.push([x, y]);
      const tw = Math.cos(L.twist * a + L.phase);
      hws.push(
        Math.max(
          0.06,
          L.wid * Math.sin(Math.PI * Math.pow(a, 0.55)) * (0.25 + 0.75 * Math.abs(tw)),
        ),
      );
      const ang = L.ang + sway * a + L.dir * L.droop * Math.pow(a, 1.5) * unfurl;
      x += (Math.cos(ang) * len) / (n - 1);
      y += (Math.sin(ang) * len) / (n - 1);
    }
    brush(pts, hws, lin(n), (i, a, q) => {
      const aq = Math.abs(q);
      const back = Math.cos(L.twist * a + L.phase) < 0;
      const lit = q > 0 !== back ? 1 : 0;
      let l = 0.42 + 0.26 * lit + 0.22 * Math.pow(1 - aq, 0.7);
      if (aq < 0.08) l = back ? 0.75 : 0.34; // midrib
      const c = back
        ? lerp3(mul(UNDER, 0.8), UNDER, 0.4 + 0.6 * (1 - aq))
        : lerp3(LEAF_D, LEAF_L, 0.3 + 0.45 * lit + 0.25 * (1 - aq));
      set(i, clamp(l), c);
    });
  }

  // ---------------------------------------------------------------- flowers
  /** Petal colour along a petal: deep at the base, the colour mid-way, lighter at the tip. */
  const petalColor = (pal: Palette, a: number) =>
    lerp3(lerp3(pal.deep, pal.mid, a * 2.2), pal.tip, (a - 0.6) * 2);

  // Six-petalled lily in 3D, lit from the upper left; used for the three focal flowers
  function lily(
    center: Vec2,
    axis: Vec3,
    size: number,
    openness: number,
    ripe: number,
    t: number,
    seed: number,
    pal: Palette,
    twirl: number,
  ) {
    if (size <= 0.3) return;
    const a3 = norm(axis);
    const ref: Vec3 = Math.abs(a3[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0];
    const u3 = norm(cross(a3, ref));
    const v3 = cross(a3, u3);
    const c3: Vec3 = [center[0], center[1], 0];
    const spin = rad(15) + rad(3) * wave(t, 3, seed) + twirl;
    const petals: { depth: number; pts: Vec2[]; hws: number[]; normal: Vec3; facing: number }[] =
      [];
    for (let k = 0; k < 6; k++) {
      const inner = k % 2 === 1;
      const phi = spin + (k * Math.PI) / 3;
      const radial = add(mul(u3, Math.cos(phi)), mul(v3, Math.sin(phi)));
      const tangent = cross(a3, radial);
      const theta = rad(5 + (inner ? 70 : 78) * openness);
      const curl = rad(50) * Math.pow(Math.max(openness, 0), 1.5); // petal tips curl back
      const L = size * (inner ? 0.94 : 1);
      const W = size * (inner ? 0.26 : 0.2);
      const n = 9;
      const pts3: Vec3[] = [];
      const hws: number[] = [];
      let p = add(c3, mul(radial, size * 0.04));
      for (let i = 0; i < n; i++) {
        const a = i / (n - 1);
        pts3.push(p);
        hws.push(W * Math.pow(Math.sin(Math.PI * Math.pow(Math.min(a, 0.999), 0.65)), 0.85));
        const th = theta + curl * a * a;
        p = add(p, mul(add(mul(a3, Math.cos(th)), mul(radial, Math.sin(th))), L / (n - 1)));
      }
      const normal = norm(cross(norm(sub(pts3[4], pts3[0])), tangent));
      const tproj = Math.hypot(tangent[0], tangent[1]);
      petals.push({
        depth: pts3.reduce((s, q) => s + q[2], 0) / n,
        pts: pts3.map((q): Vec2 => [q[0], q[1]]),
        hws: hws.map((h) => Math.max(h * Math.max(tproj, 0.3), 0.08)),
        normal,
        facing: normal[2],
      });
    }
    petals.sort((a, b) => a.depth - b.depth);
    const av = lin(9);
    for (const pt of petals) {
      const sg = pt.facing < 0 ? -1 : 1;
      const light = 0.35 + 0.65 * Math.max(0, dot(mul(pt.normal, sg), LIGHT));
      const back = pt.facing < 0;
      brush(pt.pts, pt.hws, av, (i, a, q, r, c) => {
        const aq = Math.abs(q);
        let l = light * (0.62 + 0.38 * Math.pow(1 - aq, 0.6)) * (back ? 0.8 : 1);
        l *= 0.75 + 0.35 * clamp(a * 2);
        if (aq < 0.1) l *= 0.65;
        let col = petalColor(pal, a);
        col = lerp3(col, pal.sheen, (light - 0.75) * 2.5 * (1 - aq));
        col = lerp3(mul(BUD, 0.9), col, ripe * clamp(0.3 + a * 1.5) + ripe * 0.3);
        if (a < 0.4 && a > 0.08 && openness > 0.4 && hash3(c, r, seed) % 100 < pal.spots) l = 0.2;
        set(i, clamp(l), col);
      });
    }
    const show = smoothstep(0.35, 0.85, openness);
    if (show <= 0) return;
    for (let k = 0; k < 6; k++) {
      const phi = (k * TAU) / 6 + 0.3;
      const radial = add(mul(u3, Math.cos(phi)), mul(v3, Math.sin(phi)));
      const th = rad(28) * openness;
      const d3 = add(mul(a3, Math.cos(th)), mul(radial, Math.sin(th)));
      const tip = add(c3, mul(d3, size * 0.55 * show));
      brush(
        [
          [c3[0], c3[1]],
          [tip[0], tip[1]],
        ],
        [0.2, 0.15],
        [0, 1],
        (i) => set(i, 0.55, STAMEN),
      );
      fillDisc(tip[0], tip[1], 0.7, (i) => set(i, 0.9, ANTHER));
    }
  }

  // Flat, eight-petalled cosmos facing the viewer, with a stippled centre
  function cosmos(cx: number, cy: number, r: number, pal: Palette, open: number, rot: number) {
    const n = 8;
    for (let k = 0; k < n; k++) {
      const ang = rot + (k * TAU) / n;
      const dx = Math.cos(ang);
      const dy = Math.sin(ang) * 0.82; // tilted slightly away
      const len = r * (0.35 + 0.65 * open);
      const pts: Vec2[] = lin(5).map((a): Vec2 => [
        cx + dx * (r * 0.18 + len * a),
        cy + dy * (r * 0.18 + len * a),
      ]);
      const hws = lin(5).map(
        (a) =>
          r * 0.3 * Math.pow(Math.sin(Math.PI * Math.pow(a, 0.7)), 0.8) * (0.5 + 0.5 * open) + 0.1,
      );
      brush(pts, hws, lin(5), (i, a, q) => {
        const aq = Math.abs(q);
        if (a > 0.86 && aq < 0.18) return; // notched petal tip
        const l = (0.48 + 0.42 * (1 - aq * aq)) * (0.7 + 0.35 * a);
        set(i, clamp(l), lerp3(petalColor(pal, a), pal.sheen, (1 - aq) * 0.35 * (k % 2)));
      });
    }
    const centre = hex(COLORS.goldenYellow);
    fillDisc(cx, cy, r * 0.3 * (0.6 + 0.4 * open), (i, d, ddx, ddy) => {
      const freckle = hash3(Math.round(ddx * 4), Math.round(ddy * 4), 7) % 5 === 0;
      set(i, freckle ? 0.32 : 0.62 - 0.2 * d, tint(centre, 0, freckle ? 0.35 : 0.7));
    });
  }

  // Cupped tulip: two side petals and a front petal rising from the base
  function tulip(cx: number, cy: number, r: number, pal: Palette, open: number, lean: number) {
    // Tall, narrow cup: the two side petals rise above the front one, leaving the classic notch
    const base: Vec2 = [cx, cy + r * 0.7];
    const parts: { ang: number; len: number; shade: number }[] = [
      { ang: -0.16 - 0.14 * open, len: 1.5, shade: 0.78 },
      { ang: 0.16 + 0.14 * open, len: 1.5, shade: 0.7 },
      { ang: 0, len: 1.2, shade: 1 },
    ];
    for (const part of parts) {
      const ang = -Math.PI / 2 + part.ang + lean;
      const pts: Vec2[] = lin(7).map((a): Vec2 => {
        const inward = -part.ang * a * a * r * 0.9; // petal tips curve back toward the middle
        return [
          base[0] + Math.cos(ang) * r * part.len * a + inward,
          base[1] + Math.sin(ang) * r * part.len * a,
        ];
      });
      const hws = lin(7).map(
        (a) => r * 0.3 * Math.pow(Math.sin(Math.PI * Math.pow(a, 0.75)), 0.9) + 0.1,
      );
      brush(pts, hws, lin(7), (i, a, q) => {
        const aq = Math.abs(q);
        const l = (0.4 + 0.5 * (1 - aq)) * part.shade * (0.72 + 0.32 * a);
        set(i, clamp(l), lerp3(petalColor(pal, a), pal.sheen, (1 - aq) * 0.3 * part.shade));
      });
    }
  }

  // Rose: rings of curled petal arcs, darker toward the tight centre
  function rose(cx: number, cy: number, r: number, pal: Palette, open: number, rot: number) {
    for (let k = 0; k < 5; k++) {
      const rr = r * (1 - k * 0.19) * (0.5 + 0.5 * open);
      const arcs = Math.max(2, 5 - k);
      for (let j = 0; j < arcs; j++) {
        const a0 = rot + (j * TAU) / arcs + k * 0.7;
        const span = (TAU / arcs) * 1.15;
        const pts: Vec2[] = lin(7).map((u): Vec2 => [
          cx + Math.cos(a0 + span * u) * rr,
          cy + Math.sin(a0 + span * u) * rr * 0.85,
        ]);
        const hws = lin(7).map((u) => rr * 0.24 * Math.sin(Math.PI * u) + 0.15);
        const ring = (4 - k) / 4; // 1 for the outer ring
        brush(pts, hws, lin(7), (i, _a, q) => {
          const rim = q > 0 ? 1 - q : 1; // the outer edge of each curl catches the light
          const l = (0.3 + 0.32 * ring + 0.3 * rim) * (0.85 + 0.15 * open);
          set(i, clamp(l), lerp3(pal.deep, lerp3(pal.mid, pal.tip, rim * 0.4), 0.35 + 0.65 * ring));
        });
      }
    }
  }

  // Lavender sprig: a slim stem with small buds along its top half
  function sprig(tip: Vec2, color: ColorName, grow: number, t: number, k: number) {
    if (grow <= 0) return;
    const bulge = (k % 2 ? 4 : -4) * 1;
    tube(curve(baseOf(tip), tip, bulge, grow, 14), 0.45, 0.28, STEM);
    const buds = smoothstep(0.7, 1, grow);
    if (buds <= 0) return;
    const pal = PAL[color];
    const path = curve(baseOf(tip), tip, bulge, 1, 24);
    // Buds along the top part of the sprig
    for (let b = 0; b < 10; b++) {
      if (b / 10 > buds) break;
      const idx = 14 + b;
      const p = path[idx];
      const q = path[idx + 1] ?? tip;
      const ang = Math.atan2(q[1] - p[1], q[0] - p[0]) + (b % 2 ? 0.7 : -0.7);
      const len = 2.4 - b * 0.12;
      const flutter = wave(t, 4, b + k) * 0.15;
      brush(
        [
          [p[0], p[1]],
          [p[0] + Math.cos(ang + flutter) * len, p[1] + Math.sin(ang + flutter) * len],
        ],
        [0.7, 0.45],
        [0, 1],
        (i, a) => set(i, 0.55 + 0.25 * a, petalColor(pal, 0.3 + a * 0.6)),
      );
    }
  }

  // Baby's breath: a spray of tiny white flowers on hair-thin stems
  function babysBreath(at: Vec2, show: number, k: number) {
    if (show <= 0) return;
    tube(curve(baseOf(at), [at[0], at[1] + 6], k % 2 ? 2 : -2, 1, 12), 0.35, 0.3, mul(STEM, 0.85));
    for (let j = 0; j < 11; j++) {
      const a = rnd(k * 31 + j, 1) * TAU;
      const d = 2 + rnd(k * 31 + j, 2) * 7;
      const x = at[0] + Math.cos(a) * d;
      const y = at[1] + Math.sin(a) * d * 0.7;
      tube(
        [
          [at[0], at[1] + 6],
          [x, y],
        ],
        0.3,
        0.25,
        mul(STEM, 0.8),
      );
      fillDisc(x, y, (0.9 + rnd(j, k) * 0.5) * show, (i, dd) =>
        set(i, 0.85 - 0.3 * dd, BREATH_WHITE),
      );
    }
  }

  // ---------------------------------------------------------------- scene
  /** Extra petal twist for a flower brushed by the cursor wind. */
  function twirlAt(pos: Vec2) {
    const g = gust[Math.min(ROWS - 1, Math.max(0, Math.round(pos[1])))];
    const dx = pos[0] - pointer.x;
    const dy = pos[1] - pointer.y;
    return g * 0.05 * (0.4 + 0.6 * Math.exp(-(dx * dx + dy * dy) / 900));
  }

  function scene(t: number) {
    const dt = lastT < 0 ? 0 : clamp(t - lastT, 0, 0.05);
    lastT = t;
    for (let r = 0; r < ROWS; r++) {
      gustVel[r] += (-36 * gust[r] - 5 * gustVel[r]) * dt;
      gust[r] = clamp(gust[r] + gustVel[r] * dt, -12, 12);
      // Breeze: the higher up, the more it sways
      const h = clamp((ROWS + 10 - Yr[r]) / 140);
      const w = t - 0.4 * h;
      rowShift[r] =
        WIND * (0.65 * wave(w, 2) + 0.35 * wave(w, 3, 1)) * Math.pow(h, 1.4) +
        gust[r] * (0.3 + 0.7 * h);
    }
    lum.fill(0);
    rgb.fill(0);

    for (const L of LEAF_SPECS) leaf(L, t, smoothstep(L.tAt, L.tAt + 0.55, t));
    SPRIGS.forEach((s, k) => sprig(s.tip, s.color, easeOut((t - 1.2 - k * 0.15) / 1.1), t, k));
    BREATH_AT.forEach((b, k) => babysBreath(b, smoothstep(2.0 + k * 0.1, 2.6 + k * 0.1, t), k));

    // Stems grow up from below the frame, then each head blooms
    HEADS.forEach((h, k) => {
      const grow = easeOut((t - BLOOM[k].start) / STEM_DUR);
      if (grow <= 0) return;
      tube(curve(baseOf(h.pos), h.pos, bulgeOf(h, k), grow, 14), 0.8, 0.5, STEM);
    });
    HEADS.forEach((h, k) => {
      const { end } = BLOOM[k];
      if (t < end) return;
      const open = smoothstep(end, end + 0.8, t);
      const pal = PAL[h.color];
      const twirl = twirlAt(h.pos);
      const sway = wave(t, 3, k) * 0.08 + twirl;
      if (h.kind === "lily") {
        const ripe = smoothstep(end, end + 0.6, t);
        const opening = smoothstep(end + 0.3, end + 1.8, t);
        const breathe =
          0.15 *
          (0.5 - 0.5 * Math.cos((TAU * (t - end)) / 7 + k)) *
          smoothstep(end + 1.8, end + 3, t);
        const size = h.size * 1.6 * (0.5 + 0.5 * Math.max(opening, ripe * 0.6));
        lily(
          h.pos,
          h.axis ?? [0, -0.3, 0.95],
          size,
          opening * (1 - breathe),
          ripe,
          t,
          k * 7 + 3,
          pal,
          twirl,
        );
      } else if (h.kind === "cosmos") {
        cosmos(h.pos[0], h.pos[1], h.size * open, pal, open, k * 0.4 + sway);
      } else if (h.kind === "tulip") {
        tulip(h.pos[0], h.pos[1], h.size * (0.6 + 0.4 * open), pal, open, h.pos[0] * 0.004 + sway);
      } else {
        rose(h.pos[0], h.pos[1], h.size, pal, open, k + sway);
      }
    });

    // Ambient: stars twinkling in the navy and a few petals drifting down
    const ambient = smoothstep(AMBIENT_AT, AMBIENT_AT + 1.5, t);
    if (ambient > 0) {
      for (const s of STARS) {
        const i = cellIndex(s.x, s.y);
        if (i < 0 || lum[i] > 0.05) continue;
        const twinkle = Math.pow(Math.max(0, Math.sin(t * s.speed + s.phase)), 6);
        if (twinkle > 0.05) set(i, 0.25 + 0.55 * twinkle * ambient, STAR_LIGHT);
      }
      for (const p of PETALS) {
        const y = (((t - AMBIENT_AT) * p.speed + p.offset) % 190) - 15;
        const x = p.x0 + 7 * Math.sin(t * 0.8 + p.phase);
        const ang = t * 1.4 + p.phase;
        brush(
          [
            [x, y],
            [x + Math.cos(ang) * p.size, y + Math.sin(ang) * p.size],
          ],
          [p.size * 0.45, p.size * 0.3],
          [0, 1],
          (i) => set(i, 0.55 * ambient, p.color),
        );
      }
    }

    const fade = smoothstep(0, 0.3, t);
    if (fade < 1) for (let i = 0; i < N; i++) lum[i] *= fade;
  }

  // ---------------------------------------------------------------- characters -> image
  const ctx = canvas.getContext("2d")!;
  const W = COLS * CW;
  const H = ROWS * CH;
  canvas.width = W;
  canvas.height = H;
  const CHARS = BUCKETS.join("");
  const START: number[] = [];
  const COUNT = BUCKETS.map((b) => b.length);
  BUCKETS.reduce((s, b, k) => {
    START[k] = s;
    return s + b.length;
  }, 0);
  // Pre-render each glyph's coverage mask
  const MASKS = [...CHARS].map((ch) => {
    const g = document.createElement("canvas");
    g.width = CW;
    g.height = CH;
    const gx = g.getContext("2d")!;
    gx.font = FONT;
    gx.textBaseline = "top";
    gx.fillStyle = "#fff";
    gx.fillText(ch, 0, (CH - FONT_SIZE * 1.15) / 2);
    const d = gx.getImageData(0, 0, CW, CH).data;
    const m = new Uint8Array(CW * CH);
    for (let k = 0; k < m.length; k++) m[k] = d[k * 4 + 3];
    return m;
  });
  const ascii = document.createElement("canvas"); // glyph layer, transparent background
  ascii.width = W;
  ascii.height = H;
  const actx = ascii.getContext("2d")!;
  const img = actx.createImageData(W, H);
  const px32 = new Uint32Array(img.data.buffer);
  const glows = [2, 4, 8].map((s) => {
    const g = document.createElement("canvas");
    g.width = Math.ceil(W / s);
    g.height = Math.ceil(H / s);
    return g;
  });

  function draw(frame: number) {
    px32.fill(0);
    const fidx = Math.floor(frame / 3);
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const i = r * COLS + c;
        const L = lum[i];
        let level = 0;
        while (level < LEVELS.length && L >= LEVELS[level]) level++;
        if (level === 0) continue;
        const m = MASKS[START[level] + (hash3(r, c, fidx) % COUNT[level])];
        const k = (0.45 + 0.75 * L) * 1.6;
        const j = i * 3;
        const pr = Math.min(255, 255 * rgb[j] * k) | 0;
        const pg = Math.min(255, 255 * rgb[j + 1] * k) | 0;
        const pb = Math.min(255, 255 * rgb[j + 2] * k) | 0;
        const colour = (pb << 16) | (pg << 8) | pr;
        let o0 = r * CH * W + c * CW;
        let mi = 0;
        for (let y = 0; y < CH; y++, o0 += W) {
          for (let x = 0; x < CW; x++, mi++) {
            const v = m[mi];
            if (v) px32[o0 + x] = (v << 24) | colour; // glyph coverage becomes alpha
          }
        }
      }
    }
    actx.putImageData(img, 0, 0);
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, W, H);
    ctx.drawImage(ascii, 0, 0);
    // Glow: downsample by halves, then add the blurred result back on top
    let src: HTMLCanvasElement = ascii;
    for (const g of glows) {
      const gx = g.getContext("2d")!;
      gx.imageSmoothingEnabled = true;
      gx.clearRect(0, 0, g.width, g.height);
      gx.drawImage(src, 0, 0, g.width, g.height);
      src = g;
    }
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = GLOW;
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(glows[glows.length - 1], 0, 0, W, H);
    ctx.restore();
  }

  return {
    width: W,
    height: H,
    render: (t: number) => {
      scene(t);
      draw(Math.floor(t * 30));
    },
    push: (xFrac: number, yFrac: number, vxFrac: number) => {
      const rc = yFrac * ROWS;
      const kick = clamp(vxFrac * COLS * 0.5 * 0.12, -30, 30);
      for (let r = Math.max(0, Math.floor(rc - 40)); r < Math.min(ROWS, Math.ceil(rc + 40)); r++) {
        const d = (Yr[r] - rc) / 16;
        gustVel[r] += kick * Math.exp(-d * d);
      }
      pointer.x = (xFrac - 0.5) * COLS * 0.5;
      pointer.y = rc;
    },
  };
}
