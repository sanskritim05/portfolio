import { useEffect } from "react";

/** Soft ease — settles gently so the work title doesn't feel abrupt. */
const easeOutQuint = (t: number) => 1 - Math.pow(1 - t, 5);

/** Keep a little air above "My Work" so script letterforms aren't clipped. */
const TOP_GAP = 48;

/**
 * Snap scrolling between the hero frame and the work section: one gesture in
 * the hero zone animates all the way down, scrolling up at the top of the work
 * section snaps back to the hero. Below that boundary the page scrolls freely.
 */
export function useHeroSnap(anchorId = "my-work") {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const root = document.documentElement;
    let animating = false;
    let raf = 0;

    const boundary = () => {
      const el = document.getElementById(anchorId);
      if (!el) return 0;
      const y = el.getBoundingClientRect().top + window.scrollY - TOP_GAP;
      return Math.max(0, y);
    };

    const snapTo = (targetY: number, duration = 1100) => {
      const clamped = Math.max(0, targetY);
      if (reduce) {
        window.scrollTo(0, clamped);
        return;
      }
      if (animating) return;
      animating = true;
      const prev = root.style.scrollBehavior;
      root.style.scrollBehavior = "auto";
      const startY = window.scrollY;
      const dist = clamped - startY;
      let start: number | null = null;
      const step = (ts: number) => {
        if (start === null) start = ts;
        const t = Math.min(1, (ts - start) / duration);
        window.scrollTo(0, startY + dist * easeOutQuint(t));
        if (t < 1) raf = requestAnimationFrame(step);
        else {
          root.style.scrollBehavior = prev;
          animating = false;
        }
      };
      raf = requestAnimationFrame(step);
    };

    const onWorkLink = (e: Event) => {
      const link = (e.target as HTMLElement | null)?.closest?.(
        '[data-scroll-to="my-work"]',
      );
      if (!link || !document.getElementById(anchorId)) return;
      e.preventDefault();
      snapTo(boundary());
    };
    document.addEventListener("click", onWorkLink);

    const scrollToWorkIfHashed = () => {
      if (window.location.hash !== `#${anchorId}`) return;
      // Wait a frame so layout is ready after route navigation
      requestAnimationFrame(() => {
        snapTo(boundary(), reduce ? 0 : 900);
      });
    };
    scrollToWorkIfHashed();
    window.addEventListener("hashchange", scrollToWorkIfHashed);

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) return;
      if (animating) {
        e.preventDefault();
        return;
      }
      const wt = boundary();
      const y = window.scrollY;
      if (y < wt - 1) {
        e.preventDefault();
        if (e.deltaY > 8) snapTo(wt);
        else if (e.deltaY < -8) snapTo(0, 900);
      } else if (y <= wt + 8 && e.deltaY < -8) {
        e.preventDefault();
        snapTo(0, 900);
      }
    };

    let touchY: number | null = null;
    const onTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0]!.clientY;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (touchY === null) return;
      if (animating) {
        e.preventDefault();
        return;
      }
      const wt = boundary();
      const y = window.scrollY;
      const dy = touchY - e.touches[0]!.clientY;
      if (y < wt - 1) {
        e.preventDefault();
        if (dy > 12) {
          snapTo(wt);
          touchY = null;
        } else if (dy < -12) {
          snapTo(0, 900);
          touchY = null;
        }
      } else if (y <= wt + 8 && dy < -12) {
        e.preventDefault();
        snapTo(0, 900);
        touchY = null;
      }
    };

    const onKey = (e: KeyboardEvent) => {
      if (animating) return;
      const down = e.key === "ArrowDown" || e.key === "PageDown" || e.key === " ";
      const up = e.key === "ArrowUp" || e.key === "PageUp";
      if (!down && !up) return;
      const wt = boundary();
      const y = window.scrollY;
      if (y < wt - 1) {
        e.preventDefault();
        snapTo(down ? wt : 0, 1100);
      } else if (y <= wt + 8 && up) {
        e.preventDefault();
        snapTo(0, 900);
      }
    };

    if (!reduce) {
      window.addEventListener("wheel", onWheel, { passive: false });
      window.addEventListener("touchstart", onTouchStart, { passive: true });
      window.addEventListener("touchmove", onTouchMove, { passive: false });
      window.addEventListener("keydown", onKey);
    }

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("click", onWorkLink);
      window.removeEventListener("hashchange", scrollToWorkIfHashed);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onKey);
    };
  }, [anchorId]);
}
