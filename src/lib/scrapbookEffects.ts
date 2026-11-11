/*
 * One-off celebration effects (paper confetti, a shooting star) drawn on a temporary full-screen
 * canvas that removes itself once every effect has finished.
 */
import { COLORS } from "@/lib/bouquet";

type Effect = (ctx: CanvasRenderingContext2D, t: number) => boolean; // false once finished

const CONFETTI_COLORS = [
  COLORS.hotPink,
  COLORS.bubblegumPink,
  COLORS.vibrantCoral,
  COLORS.tangerine,
  COLORS.sunflowerYellow,
  COLORS.electricLavender,
  COLORS.brightLilac,
  COLORS.periwinkleBlue,
  COLORS.skyBlue,
  COLORS.turquoise,
];
const DENIM = "#5f7fb8";
const DENIM_LIGHT = "#a9c1ea";

let layer: { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D; raf: number } | null = null;
const effects: { run: Effect; start: number }[] = [];

const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function ensureLayer() {
  if (layer) return layer;
  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  // Just below the custom cursor (z-index 10000)
  Object.assign(canvas.style, {
    position: "fixed",
    inset: "0",
    pointerEvents: "none",
    zIndex: "9999",
  });
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d")!;
  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(window.innerWidth * dpr);
    canvas.height = Math.round(window.innerHeight * dpr);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  layer = { canvas, ctx, raf: 0 };
  const frame = (now: number) => {
    if (!layer) return;
    if (
      canvas.width !== Math.round(window.innerWidth * Math.min(window.devicePixelRatio || 1, 2))
    ) {
      resize();
    }
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    for (let i = effects.length - 1; i >= 0; i--) {
      const e = effects[i];
      if (!e.run(ctx, (now - e.start) / 1000)) effects.splice(i, 1);
    }
    if (effects.length === 0) {
      canvas.remove();
      layer = null;
      return;
    }
    layer.raf = requestAnimationFrame(frame);
  };
  layer.raf = requestAnimationFrame(frame);
  return layer;
}

function addEffect(run: Effect) {
  ensureLayer();
  effects.push({ run, start: performance.now() });
}

function starPath(ctx: CanvasRenderingContext2D, r: number, inner = 0.45) {
  ctx.beginPath();
  for (let k = 0; k < 10; k++) {
    const a = -Math.PI / 2 + (k * Math.PI) / 5;
    const rr = k % 2 ? r * inner : r;
    ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
  }
  ctx.closePath();
}

function heartPath(ctx: CanvasRenderingContext2D, r: number) {
  ctx.beginPath();
  ctx.moveTo(0, r * 0.35);
  ctx.bezierCurveTo(-r * 1.1, -r * 0.35, -r * 0.45, -r * 1.05, 0, -r * 0.45);
  ctx.bezierCurveTo(r * 0.45, -r * 1.05, r * 1.1, -r * 0.35, 0, r * 0.35);
  ctx.closePath();
}

function flower(ctx: CanvasRenderingContext2D, r: number, color: string) {
  ctx.fillStyle = color;
  for (let k = 0; k < 5; k++) {
    const a = (k * Math.PI * 2) / 5;
    ctx.beginPath();
    ctx.arc(Math.cos(a) * r * 0.55, Math.sin(a) * r * 0.55, r * 0.45, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = COLORS.sunflowerYellow;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.32, 0, Math.PI * 2);
  ctx.fill();
}

/** A burst of paper stars, hearts and flowers from (x, y) in viewport coordinates. */
export function confettiBurst(x: number, y: number) {
  if (prefersReducedMotion()) return;
  const pieces = Array.from({ length: 90 }, () => {
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.3;
    const speed = 380 + Math.random() * 520;
    return {
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: 5 + Math.random() * 6,
      rot: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 10,
      flip: Math.random() * Math.PI * 2, // paper turning over as it falls
      flipSpeed: 6 + Math.random() * 8,
      shape: Math.floor(Math.random() * 3),
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    };
  });
  let last = 0;
  const LIFE = 2.8;
  addEffect((ctx, t) => {
    const dt = Math.min(t - last, 0.05);
    last = t;
    const alpha = Math.min(1, (LIFE - t) / 0.7);
    for (const p of pieces) {
      p.vy += 900 * dt; // gravity
      p.vx *= 1 - 1.6 * dt; // air drag
      p.vy *= 1 - 1.1 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot += p.spin * dt;
      p.flip += p.flipSpeed * dt;
      ctx.save();
      ctx.globalAlpha = Math.max(0, alpha);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.scale(Math.cos(p.flip), 1);
      if (p.shape === 0) {
        starPath(ctx, p.size);
        ctx.fillStyle = p.color;
        ctx.fill();
      } else if (p.shape === 1) {
        heartPath(ctx, p.size);
        ctx.fillStyle = p.color;
        ctx.fill();
      } else {
        flower(ctx, p.size, p.color);
      }
      ctx.restore();
    }
    return t < LIFE;
  });
}

function sparkle(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, alpha: number) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(x, y);
  ctx.fillStyle = "#fffbe8";
  ctx.beginPath();
  for (let k = 0; k < 8; k++) {
    const a = (k * Math.PI) / 4;
    const rr = k % 2 ? r * 0.25 : r;
    ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/** A denim star that twinkles at (x, y), then shoots up and off the top-left of the screen. */
export function shootingStar(x: number, y: number, size: number) {
  if (prefersReducedMotion()) return;
  const end = { x: -size * 2, y: -size * 2 + window.innerHeight * 0.05 };
  const ctrl = { x: x * 0.55, y: Math.min(y, window.innerHeight) * 0.1 - size };
  const DELAY = 0.18; // the twinkle before launch
  const FLIGHT = 1.1;
  const trail: { x: number; y: number; born: number; r: number }[] = [];
  const at = (u: number) => {
    const k = 1 - u;
    return {
      x: k * k * x + 2 * k * u * ctrl.x + u * u * end.x,
      y: k * k * y + 2 * k * u * ctrl.y + u * u * end.y,
    };
  };
  addEffect((ctx, t) => {
    // Twinkle and ring where the star left
    const tw = Math.min(1, t / 0.5);
    if (tw < 1) {
      sparkle(ctx, x, y, size * (0.6 + tw * 0.9), 1 - tw);
      ctx.save();
      ctx.strokeStyle = DENIM_LIGHT;
      ctx.globalAlpha = 0.8 * (1 - tw);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, size * (0.4 + tw * 1.2), 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    const u = Math.min(1, Math.max(0, (t - DELAY) / FLIGHT));
    const eased = u * u * (1.6 - 0.6 * u); // starts gently, then whooshes away
    const p = at(eased);
    if (u > 0 && u < 1) {
      trail.push({ x: p.x, y: p.y, born: t, r: 2 + Math.random() * 3 });
      // Glowing streak behind the star
      const tail = at(Math.max(0, eased - 0.12));
      const g = ctx.createLinearGradient(tail.x, tail.y, p.x, p.y);
      g.addColorStop(0, "rgb(169 193 234 / 0)");
      g.addColorStop(1, "rgb(220 232 255 / 0.85)");
      ctx.save();
      ctx.strokeStyle = g;
      ctx.lineCap = "round";
      ctx.lineWidth = size * 0.35;
      ctx.beginPath();
      ctx.moveTo(tail.x, tail.y);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      ctx.restore();
    }
    for (const s of trail) {
      const age = t - s.born;
      if (age < 0.7) sparkle(ctx, s.x, s.y, s.r * (1 - age / 0.7) + 1, 1 - age / 0.7);
    }
    if (u < 1) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(-t * 7);
      const scale = 1 + Math.sin(Math.PI * u) * 0.25;
      starPath(ctx, (size / 2) * scale);
      ctx.fillStyle = DENIM;
      ctx.fill();
      ctx.setLineDash([3, 2.5]); // stitched edge, like the stars in the artwork
      ctx.strokeStyle = DENIM_LIGHT;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    }
    return t < DELAY + FLIGHT + 0.7;
  });
}
