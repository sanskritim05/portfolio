/*
 * ASCII lily bouquet. The scene (3D lilies, buds, stems, leaves, wind, fireflies) is painted
 * into a grid of brightness + colour values, then each cell is drawn as a glyph whose density
 * matches its brightness, with a soft glow added on top.
 */

type Vec2 = [number, number];
type Vec3 = [number, number, number];
type Palette = { deep: Vec3; mid: Vec3; tip: Vec3; sheen: Vec3; spots: number; anther?: Vec3 };
type CellFn = (i: number, a: number, q: number, r: number, c: number) => void;

const FONT_SIZE = 8;
const FONT = `${FONT_SIZE}px Menlo, Consolas, "DejaVu Sans Mono", "Courier New", monospace`;
const ROWS = 160;
// Wide enough for the outermost lilies (about ±70 scene units at 2 columns per unit)
const BOUQUET_COLS = 300;
/** Width / height of the rendered image: cells are twice as tall as wide. */
export const BOUQUET_ASPECT = BOUQUET_COLS / (ROWS * 2);
const WAVE_PERIOD = 14;
const BREATH = 7;
const BREATH_DEPTH = 0.18;
const SETTINGS = { wind: 3, size: 1.8, glow: 0.6 };

const BUCKETS = [
  " ",
  ".'`",
  ":;,-~",
  "!/\\|()[]{}<>?+=",
  "tfjrxnuvczil",
  "XYUJCLQ0OZmwqpdbkhao",
  "#MW&8%B",
  "@$",
];
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

const COLORS = {
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

const SPRING = hex(COLORS.springGreen);
const EMERALD = hex(COLORS.emeraldGreen);
const BUD = tint(SPRING, 0, 0.75);
const STEM = tint(EMERALD, 0, 0.6);
const ANTHER: Vec3 = [0.95, 0.42, 0.1];
const PALETTES: Record<string, Palette> = {
  hotPink: petalPalette(COLORS.hotPink, 10),
  electricPink: petalPalette(COLORS.electricPink, 10),
  bubblegumPink: petalPalette(COLORS.bubblegumPink, 8),
  vibrantCoral: petalPalette(COLORS.vibrantCoral, 10),
  watermelon: petalPalette(COLORS.watermelon, 10),
  tangerine: petalPalette(COLORS.tangerine, 14),
  sunflowerYellow: petalPalette(COLORS.sunflowerYellow, 4),
  goldenYellow: petalPalette(COLORS.goldenYellow, 6),
  electricLavender: petalPalette(COLORS.electricLavender, 4),
  vividViolet: petalPalette(COLORS.vividViolet, 4),
  brightLilac: petalPalette(COLORS.brightLilac, 3),
  periwinkleBlue: petalPalette(COLORS.periwinkleBlue, 2),
  skyBlue: petalPalette(COLORS.skyBlue, 2),
  turquoise: petalPalette(COLORS.turquoise, 2),
};

// [position, size, 3D facing, colour, second it starts opening, brightness], back to front
const FLOWERS_BASE: [Vec2, number, Vec3, string, number, number][] = [
  [[-25, 34], 15, [-0.5, -0.55, 0.68], "skyBlue", 5.4, 0.78],
  [[24, 30], 15, [0.5, -0.6, 0.62], "bubblegumPink", 5.8, 0.78],
  [[0, 18], 13, [0.08, -0.85, 0.5], "goldenYellow", 6.2, 0.78],
  [[-32, 64], 18, [-0.72, -0.2, 0.66], "vividViolet", 4.8, 0.9],
  [[32, 60], 18, [0.68, -0.25, 0.68], "turquoise", 5.1, 0.9],
  [[-3, 46], 19, [-0.12, -0.42, 0.9], "hotPink", 4.5, 0.9],
  [[-36, 112], 16, [-0.82, 0.1, 0.55], "sunflowerYellow", 5.2, 1.0],
  [[37, 114], 16, [0.82, 0.12, 0.55], "tangerine", 5.5, 1.0],
  [[-16, 86], 22, [-0.3, -0.18, 0.93], "vibrantCoral", 3.9, 1.0],
  [[18, 88], 21, [0.3, -0.14, 0.94], "electricLavender", 4.2, 1.0],
  [[1, 114], 20, [0.02, -0.28, 0.96], "periwinkleBlue", 4.6, 1.0],
];
// [position, size, facing, ripeness, colour]
const BUDS_BASE: [Vec2, number, Vec3, number, string][] = [
  [[-12, 10], 9, [-0.3, -0.95, 0.1], 0.0, "electricPink"],
  [[13, 7], 9, [0.35, -0.93, 0.1], 0.9, "brightLilac"],
  [[39, 40], 8, [0.8, -0.55, 0.2], 0.0, "watermelon"],
  [[-41, 42], 8, [-0.8, -0.5, 0.2], 0.7, "tangerine"],
  [[24, 68], 7, [0.6, -0.7, 0.3], 0.0, "goldenYellow"],
];

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

const rnd = (k: number) => hash3(k, 911, 37) / 4294967296; // fixed pseudo-random 0..1
const STEM_DUR = 1.0; // seconds for a stem to grow from the base to its tip
const easeOut = (x: number) => 1 - Math.pow(1 - clamp(x), 3);

type Leaf = {
  x: number;
  y: number;
  stemAng: number;
  ang: number;
  dir: number;
  seed: number;
  len: number;
  wid: number;
  droop: number;
  kink: number;
  kinkAt: number;
  twist: number;
  phase: number;
  old: boolean;
  tAt: number;
};
type Stemmed = {
  pos: Vec2;
  baseX: number;
  bulge: number;
  start: number;
  end: number;
  path: Vec2[];
};
type FlowerSpec = Stemmed & {
  size: number;
  axis: Vec3;
  col: string;
  bright: number;
  tOpen: number;
  leaves: Leaf[];
};
type BudSpec = Stemmed & { size: number; axis: Vec3; ripe: number; col: string };

export type LilyBouquet = { width: number; height: number; render: (t: number) => void };

/**
 * Sets up the bouquet on `canvas` with a square character grid and returns its pixel size and a
 * `render(t)` function that draws the scene `t` seconds into the animation.
 */
export function createLilyBouquet(canvas: HTMLCanvasElement, background: string): LilyBouquet {
  const probe = document.createElement("canvas").getContext("2d")!;
  probe.font = FONT;
  const CW = Math.max(1, Math.round(probe.measureText("M").width));
  const CH = CW * 2; // cells are exactly twice as tall as wide, which the scene's x scale assumes
  const COLS = BOUQUET_COLS;
  const N = COLS * ROWS;

  // ---------------------------------------------------------------- canvas of brightness + colour
  const Xc = new Float32Array(COLS);
  const Yr = new Float32Array(ROWS);
  for (let c = 0; c < COLS; c++) Xc[c] = (c + 0.5 - COLS / 2) * 0.5;
  for (let r = 0; r < ROWS; r++) Yr[r] = r + 0.5;
  const lum = new Float32Array(N);
  const rgb = new Float32Array(N * 3);
  const rowShift = new Float32Array(ROWS);
  const bgLum = new Float32Array(N);
  const bgRgb = new Float32Array(N * 3);
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      // Faint purple haze behind the bouquet
      const r2 = (Xc[c] / Math.max(40, COLS * 0.21)) ** 2 + ((Yr[r] - 75) / 80) ** 2;
      const i = r * COLS + c;
      if (hash3(r, c, 1) % 100 < 35) {
        bgLum[i] = 0.13 * Math.exp(-r2 * 1.6);
        bgRgb.set([0.45, 0.2, 0.55], i * 3);
      }
    }
  }
  function set(i: number, l: number, cr: number, cg: number, cb: number) {
    lum[i] = l;
    const j = i * 3;
    rgb[j] = cr;
    rgb[j + 1] = cg;
    rgb[j + 2] = cb;
  }

  // Paints a tapered shape along a polyline: calls fn(cell, distance along a, signed offset q -1..1)
  const SEG = new Float64Array(16 * 9);
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
      const sh = rowShift[r]; // wind offset for this row
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

  // ---------------------------------------------------------------- stems and leaves
  function tube(pts: Vec2[], w0: number, w1: number, col: Vec3) {
    const n = pts.length;
    if (n < 2) return;
    const hws = lin(n).map((k) => w0 + (w1 - w0) * k);
    const dark = mul(col, 0.6);
    const lite = mul(col, 1.25);
    brush(pts, hws, lin(n), (i, _a, q) => {
      const k = clamp(0.5 - 0.5 * q);
      set(
        i,
        0.42 + 0.35 * (1 - Math.abs(q)) - 0.18 * q,
        dark[0] + (lite[0] - dark[0]) * k,
        dark[1] + (lite[1] - dark[1]) * k,
        dark[2] + (lite[2] - dark[2]) * k,
      );
    });
  }

  // Emerald in shadow, spring green where lit, golden on older leaf tips
  const LEAF_D = tint(EMERALD, 0, 0.3);
  const LEAF_L = tint(SPRING, 0, 0.66);
  const UNDER = tint(SPRING, 0.25, 0.62);
  const OLD_TIP = tint(hex(COLORS.goldenYellow), 0, 0.6);
  // Long, narrow, pointed lily leaves that droop under their weight; some kink, some twist to
  // show their paler underside.
  function leaf(L: Leaf, t: number, unfurl: number) {
    if (unfurl <= 0.01) return;
    const n = 12;
    const len = L.len * (0.3 + 0.7 * unfurl);
    const wid = L.wid * (0.4 + 0.6 * unfurl);
    const ang0 = L.stemAng + (L.ang - L.stemAng) * unfurl; // unfurls away from the stem
    const sway = rad(4) * wave(t, 3, L.seed);
    const pts: Vec2[] = [];
    const hws: number[] = [];
    let x = L.x;
    let y = L.y;
    for (let k = 0; k < n; k++) {
      const a = k / (n - 1);
      pts.push([x, y]);
      const tw = Math.cos(L.twist * a + L.phase); // twisting changes the visible width
      hws.push(
        Math.max(
          0.06,
          wid * Math.pow(Math.sin(Math.PI * Math.pow(a, 0.5)), 0.85) * (0.2 + 0.8 * Math.abs(tw)),
        ),
      );
      const bend =
        L.droop * Math.pow(a, 1.6) + L.kink * smoothstep(L.kinkAt - 0.05, L.kinkAt + 0.05, a);
      const ang = ang0 + sway * a + L.dir * bend * unfurl;
      x += (Math.cos(ang) * len) / (n - 1);
      y += (Math.sin(ang) * len) / (n - 1);
    }
    brush(pts, hws, lin(n), (i, a, q) => {
      const aq = Math.abs(q);
      const back = Math.cos(L.twist * a + L.phase) < 0;
      const lit = q > 0 !== back ? 1 : 0; // V-folded leaf: one half catches the light
      let l =
        (0.42 + 0.28 * lit + 0.22 * Math.pow(1 - aq, 0.7)) *
        (0.88 + 0.12 * Math.cos(q * Math.PI * 6));
      if (aq < 0.08)
        l = back ? 0.78 : 0.34; // midrib: a groove on top, a ridge underneath
      else if (aq > 0.88) l += 0.12; // lit leaf edge
      l *= 0.8 + 0.2 * clamp(a * 6); // leaf base sits in the stem's shadow
      let c = back
        ? lerp3(mul(UNDER, 0.8), UNDER, 0.4 + 0.6 * (1 - aq)) // underside: pale blue-green
        : lerp3(LEAF_D, LEAF_L, 0.3 + 0.45 * lit + 0.25 * (1 - aq));
      if (L.old) c = lerp3(c, OLD_TIP, (a - 0.8) * 4); // older leaves yellow at the tip
      set(i, clamp(l), c[0], c[1], c[2]);
    });
  }

  // ---------------------------------------------------------------- 3D lily
  const BUD09 = mul(BUD, 0.9);
  const STAMEN: Vec3 = [0.78, 0.55, 0.45];
  function lily(
    center: Vec2,
    axis: Vec3,
    size: number,
    openness: number,
    ripe: number,
    t: number,
    seed: number,
    pal: Palette,
    bright: number,
  ) {
    if (size <= 0.3) return;
    const anther = pal.anther ?? ANTHER;
    const spotRate = pal.spots;
    const a3 = norm(axis);
    const ref: Vec3 = Math.abs(a3[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0];
    const u3 = norm(cross(a3, ref));
    const v3 = cross(a3, u3);
    const c3: Vec3 = [center[0], center[1], 0];
    const spin = rad(15) + rad(3) * wave(t, 3, seed);
    const petals: {
      depth: number;
      pts: Vec2[];
      hws: number[];
      normal: Vec3;
      facing: number;
      pseed: number;
    }[] = [];
    for (let k = 0; k < 6; k++) {
      const inner = k % 2 === 1;
      const phi = spin + (k * Math.PI) / 3;
      const radial = add(mul(u3, Math.cos(phi)), mul(v3, Math.sin(phi)));
      const tangent = cross(a3, radial);
      const theta = rad(5 + (inner ? 70 : 78) * openness); // how far the petal opens
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
      const tproj = Math.hypot(tangent[0], tangent[1]); // edge-on petals look narrower
      petals.push({
        depth: pts3.reduce((s, q) => s + q[2], 0) / n,
        pts: pts3.map((q): Vec2 => [q[0], q[1]]),
        hws: hws.map((h) => Math.max(h * Math.max(tproj, 0.3), 0.08)),
        normal,
        facing: normal[2],
        pseed: seed * 10 + k,
      });
    }
    petals.sort((a, b) => a.depth - b.depth); // far petals first
    const dim = 0.55 + 0.45 * bright;
    const av = lin(9);
    for (const pt of petals) {
      const sg = pt.facing < 0 ? -1 : 1;
      const light = 0.35 + 0.65 * Math.max(0, dot(mul(pt.normal, sg), LIGHT));
      const back = pt.facing < 0;
      brush(pt.pts, pt.hws, av, (i, a, q, r, c) => {
        const aq = Math.abs(q);
        let l = light * (0.62 + 0.38 * Math.pow(1 - aq, 0.6)) * (back ? 0.8 : 1);
        l *= 0.75 + 0.35 * clamp(a * 2); // darker at the petal base
        if (aq < 0.1) l *= 0.65; // central groove
        let col = lerp3(pal.deep, pal.mid, a * 2.4);
        col = lerp3(col, pal.tip, (a - 0.55) * 1.8 + (aq - 0.7) * 1.6);
        col = lerp3(col, pal.sheen, (light - 0.75) * 2.5 * (1 - aq)); // glossy where lit
        col = lerp3(BUD09, col, ripe * clamp(0.3 + a * 1.5) + ripe * 0.3); // unripe buds are green
        if (a < 0.4 && a > 0.08 && openness > 0.4 && hash3(c, r, pt.pseed) % 100 < spotRate) {
          l = 0.2; // freckles
        }
        set(i, clamp(l) * bright, col[0] * dim, col[1] * dim, col[2] * dim);
      });
    }
    const show = smoothstep(0.35, 0.85, openness); // stamens
    if (show <= 0) return;
    for (let k = 0; k < 7; k++) {
      const pistil = k === 6;
      const phi = (k * TAU) / 6 + 0.3;
      const radial = add(mul(u3, Math.cos(phi)), mul(v3, Math.sin(phi)));
      const th = pistil ? 0 : rad(28) * openness;
      const d3 = add(mul(a3, Math.cos(th)), mul(radial, Math.sin(th)));
      const ln = size * (pistil ? 0.62 : 0.55) * show;
      const mid = add(add(c3, mul(d3, ln * 0.5)), mul(radial, pistil ? 0 : 0.4));
      const tip = add(c3, mul(d3, ln));
      brush(
        [
          [c3[0], c3[1]],
          [mid[0], mid[1]],
          [tip[0], tip[1]],
        ],
        [0.22, 0.18, 0.15],
        [0, 0.5, 1],
        (i) => set(i, 0.55 * bright, STAMEN[0], STAMEN[1], STAMEN[2]),
      );
      if (!pistil) {
        brush(
          [
            [tip[0] - d3[0] * 0.9, tip[1] - d3[1] * 0.9],
            [tip[0] + d3[0] * 0.4, tip[1] + d3[1] * 0.4],
          ],
          [0.55, 0.55],
          [0, 1],
          (i) => set(i, 0.9 * bright, anther[0], anther[1], anther[2]),
        );
      }
    }
  }

  // ---------------------------------------------------------------- layout
  const FLOWERS: FlowerSpec[] = FLOWERS_BASE.map(([pos, size, axis, col, tOpen, bright], i) => ({
    pos,
    size,
    axis,
    col,
    bright,
    baseX: pos[0] * 0.12, // stems gather at the base
    bulge: 2.5 * Math.sign(pos[0] || 1) * (i % 2 ? 1 : -0.6),
    start: 0.05 + 0.035 * i,
    end: 0,
    path: [],
    tOpen: 1.7 + (tOpen - 3.9) * 0.55,
    leaves: [],
  }));
  const BUDS: BudSpec[] = BUDS_BASE.map(([pos, size, axis, ripe, col], i) => ({
    pos,
    size,
    axis,
    ripe,
    col,
    baseX: pos[0] * 0.12,
    bulge: 2.5 * Math.sign(pos[0] || 1) * (i % 2 ? -0.6 : 1),
    start: 0.15 + 0.05 * i,
    end: 0,
    path: [],
  }));
  for (const o of [...FLOWERS, ...BUDS]) {
    o.end = o.start + STEM_DUR; // when the stem reaches its tip
    o.path = curve([o.baseX, 172], o.pos, o.bulge, 1, 14);
  }
  FLOWERS.forEach((f, i) => {
    f.tOpen = Math.max(f.tOpen, f.end + 0.6); // flowers open only after their stem is grown
    const front = f.bright > 0.8;
    // Leaves only on the part of the stem that's on screen (the base is below the bottom edge)
    const fv0 = clamp((172 - (ROWS - 4)) / (172 - f.pos[1]), 0.04, 0.6);
    const fv1 = Math.min(0.78, fv0 + 0.62);
    const fracs = front ? [0, 0.25, 0.5, 0.75, 1].map((u) => fv0 + (fv1 - fv0) * u) : [0.55, 0.72];
    f.leaves = fracs.map((fr, j) => {
      const sd = i * 31 + j * 7 + 3;
      const frac = clamp(fr + (rnd(sd) - 0.5) * 0.05, 0.04, 0.82);
      const p = pathAt(f.path, frac);
      const side = (i + j) % 2 ? 1 : -1;
      const ang = p.ang + side * rad(28 + rnd(sd + 1) * 30);
      return {
        x: p.x,
        y: p.y,
        stemAng: p.ang,
        ang,
        dir: Math.cos(ang) >= 0 ? 1 : -1,
        seed: sd,
        len: (34 - j * 4.5) * (0.8 + rnd(sd + 2) * 0.4) * (front ? 1 : 0.75),
        wid: 3.0 + rnd(sd + 3) * 1.1,
        droop: rad(25 + rnd(sd + 4) * 45) * (1 - frac * 0.6),
        kink: rnd(sd + 5) < 0.45 ? rad(40 + rnd(sd + 6) * 45) : 0,
        kinkAt: 0.4 + rnd(sd + 7) * 0.3,
        twist: 1 + rnd(sd + 8) * 2.6,
        phase: rnd(sd + 9) * TAU,
        old: rnd(sd + 10) < 0.25,
        tAt: f.start + STEM_DUR * (1 - Math.cbrt(1 - frac)), // when the growing stem passes this leaf
      };
    });
  });

  // ---------------------------------------------------------------- scene
  function scene(t: number) {
    for (let r = 0; r < ROWS; r++) {
      // Wind: the higher up, the more it sways
      const h = clamp((ROWS + 10 - Yr[r]) / 140);
      const w = t - 0.4 * h;
      rowShift[r] =
        SETTINGS.wind *
        (0.6 * wave(w, 2) + 0.3 * wave(w, 3, 1) + 0.1 * wave(w, 5, 2)) *
        Math.pow(h, 1.5);
    }
    lum.set(bgLum);
    rgb.set(bgRgb);
    const growOf = (o: Stemmed) => easeOut((t - o.start) / STEM_DUR);

    for (const f of FLOWERS) {
      for (const L of f.leaves) leaf(L, t, smoothstep(L.tAt, L.tAt + 0.55, t));
    }
    for (const b of BUDS)
      tube(curve([b.baseX, 172], b.pos, b.bulge, growOf(b), 14), 0.7, 0.45, STEM);
    for (const f of FLOWERS)
      tube(curve([f.baseX, 172], f.pos, f.bulge, growOf(f), 14), 0.85, 0.5, STEM);

    FLOWERS.forEach((f, i) => {
      if (t < f.end) return; // flowers appear only once their stem is fully grown
      const swell = smoothstep(f.end, f.end + 0.6, t);
      const ripe = smoothstep(f.tOpen - 1.0, f.tOpen + 0.3, t);
      const opening = smoothstep(f.tOpen, f.tOpen + 1.6, t);
      const breathe =
        BREATH_DEPTH *
        (0.5 - 0.5 * Math.cos((TAU * (t - f.tOpen - 3)) / BREATH + i * 0.9)) *
        smoothstep(f.tOpen + 1.6, f.tOpen + 3, t);
      const openness = opening * (1 - breathe);
      const s =
        f.size *
        SETTINGS.size *
        (0.35 + 0.65 * swell) *
        (0.5 + 0.5 * Math.max(openness, ripe * 0.6));
      lily(f.pos, f.axis, s, openness, ripe, t, i * 7 + 3, PALETTES[f.col], f.bright);
    });
    BUDS.forEach((b, i) => {
      if (t < b.end) return;
      const swell = smoothstep(b.end, b.end + 0.6, t);
      lily(
        b.pos,
        b.axis,
        b.size * (0.4 + 0.6 * swell),
        0.04 + 0.03 * wave(t, 2, i),
        b.ripe * swell,
        t,
        90 + i,
        PALETTES[b.col],
        0.9,
      );
    });

    // Gold specks drifting slowly upward, like fireflies
    const pv = 0.5 * smoothstep(3, 4.5, t);
    const off = Math.floor(t * 4);
    if (pv > 0) {
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const i = r * COLS + c;
          if (lum[i] < 0.1 && hash3(c, r + off, 77) % 1000 < 2) set(i, pv, 1, 0.8, 0.4);
        }
      }
    }
    const fade = smoothstep(0, 0.2, t);
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
    ctx.globalAlpha = SETTINGS.glow;
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
  };
}
