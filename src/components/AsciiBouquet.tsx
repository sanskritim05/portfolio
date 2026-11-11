import { useEffect, useRef } from "react";
import { BOUQUET_ASPECT, createBouquet } from "@/lib/bouquet";

const FPS = 30;
// The site's navy, oklch(0.235 0.048 264), as hex for the canvas
const BACKGROUND = "#121d35";
/** A moment after every flower has fully opened, used for the still (reduced-motion) frame. */
const STILL_T = 9;

export function AsciiBouquet() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const bouquet = createBouquet(canvas, BACKGROUND);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      bouquet.render(STILL_T);
      return;
    }

    let raf = 0;
    let last = -1e9;
    let visible = true;
    // Time only advances while the bouquet is actually being drawn, so it never skips its bloom
    let elapsed = 0;
    let prev = performance.now();

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(now - prev, 100);
      prev = now;
      if (!visible || document.hidden) return;
      elapsed += dt;
      if (now - last < 1000 / FPS - 2) return;
      last = now;
      bouquet.render(elapsed / 1000);
    };
    raf = requestAnimationFrame(tick);

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    io.observe(canvas);

    // Cursor wind: the pointer's horizontal speed pushes the flowers it passes over
    let prevPointer: { x: number; y: number; time: number } | null = null;
    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const time = performance.now();
      if (prevPointer) {
        const secs = Math.max((time - prevPointer.time) / 1000, 1 / 120);
        bouquet.push(x, y, (x - prevPointer.x) / secs);
      }
      prevPointer = { x, y, time };
    };
    const onLeave = () => {
      prevPointer = null;
    };
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div className="mx-auto w-full max-w-[520px] overflow-hidden rounded-2xl shadow-[0_20px_50px_-25px_rgba(18,29,52,0.6)]">
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="An animated hand-tied bouquet of lilies, cosmos, tulips and roses drawn in glowing coloured ASCII characters"
        className="block h-auto w-full"
        style={{ aspectRatio: BOUQUET_ASPECT, backgroundColor: BACKGROUND }}
      />
    </div>
  );
}
