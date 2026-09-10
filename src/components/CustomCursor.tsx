import { useEffect } from "react";

/**
 * Custom cursor: a dot that inverts against light/dark backgrounds, with an
 * optional navy pill label when hovering elements marked data-cursor-label.
 */
export function CustomCursor() {
  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!fine.matches) return;

    const root = document.documentElement;
    root.classList.add("has-custom-cursor");

    const el = document.createElement("div");
    el.className = "custom-cursor is-dot is-dark";
    el.setAttribute("aria-hidden", "true");
    el.innerHTML =
      '<span class="custom-cursor__dot"></span><span class="custom-cursor__label"></span>';
    document.body.appendChild(el);
    const label = el.querySelector(".custom-cursor__label") as HTMLElement;

    let overCard = false;
    let lastX = 0;
    let lastY = 0;

    type Rgb = { r: number; g: number; b: number };

    const parseRgb = (color: string): Rgb | null => {
      if (!color || color === "transparent") return null;
      const m = color.match(
        /rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:\s*[,/]\s*([\d.%]+))?\s*\)/i,
      );
      if (!m) return null;
      const rawA = m[4];
      const a = rawA === undefined ? 1 : rawA.endsWith("%")
        ? parseFloat(rawA) / 100
        : parseFloat(rawA);
      if (a < 0.08) return null;
      return { r: parseFloat(m[1]), g: parseFloat(m[2]), b: parseFloat(m[3]) };
    };

    const luminance = (c: Rgb) => (0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b) / 255;

    const sampleBackground = (x: number, y: number): Rgb => {
      let node = document.elementFromPoint(x, y) as HTMLElement | null;
      while (node && node !== root) {
        if (node === el) {
          node = node.parentElement;
          continue;
        }
        const rgb = parseRgb(getComputedStyle(node).backgroundColor);
        if (rgb) return rgb;
        if (node.tagName === "IMG" || node.tagName === "VIDEO") {
          let parent = node.parentElement;
          while (parent && parent !== root) {
            const p = parseRgb(getComputedStyle(parent).backgroundColor);
            if (p) return p;
            parent = parent.parentElement;
          }
        }
        node = node.parentElement;
      }
      return parseRgb(getComputedStyle(document.body).backgroundColor) ?? {
        r: 20,
        g: 36,
        b: 59,
      };
    };

    const applyContrast = (x: number, y: number) => {
      if (overCard) return;
      const light = luminance(sampleBackground(x, y)) >= 0.55;
      el.classList.toggle("is-light", light);
      el.classList.toggle("is-dark", !light);
    };

    const move = (e: MouseEvent) => {
      lastX = e.clientX;
      lastY = e.clientY;
      el.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
      el.classList.add("is-on");
      applyContrast(e.clientX, e.clientY);
    };

    const showDot = () => {
      overCard = false;
      el.classList.add("is-dot");
      el.classList.remove("is-label");
      label.textContent = "";
      applyContrast(lastX, lastY);
    };

    const showLabel = (text: string) => {
      overCard = true;
      el.classList.add("is-label");
      el.classList.remove("is-dot", "is-light", "is-dark");
      label.textContent = text;
    };

    const onOver = (e: MouseEvent) => {
      const target = (e.target as HTMLElement | null)?.closest?.(
        "[data-cursor-label]",
      ) as HTMLElement | null;
      if (target) showLabel(target.dataset["cursorLabel"] ?? "");
      else if (overCard) showDot();
    };

    const onLeaveDoc = () => el.classList.remove("is-on");
    const onBlur = () => {
      el.classList.remove("is-on");
      showDot();
    };

    document.addEventListener("mousemove", move, { passive: true });
    document.addEventListener("mouseover", onOver, { passive: true });
    document.addEventListener("mouseleave", onLeaveDoc);
    window.addEventListener("blur", onBlur);

    return () => {
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseleave", onLeaveDoc);
      window.removeEventListener("blur", onBlur);
      root.classList.remove("has-custom-cursor");
      el.remove();
    };
  }, []);

  return null;
}
