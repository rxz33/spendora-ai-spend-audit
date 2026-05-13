"use client";

import {
  useLayoutEffect,
  useRef,
} from "react";

function remToPx(rem: number) {
  const root = document.documentElement;
  const base = parseFloat(
    getComputedStyle(root).fontSize || "16"
  );
  return rem * base;
}

export type AutoFitTextProps = {
  children: string;
  className?: string;
  /** Below Tailwind `md` (768px). */
  maxRem?: number;
  /** `md` breakpoint and up. Defaults to `maxRem`. */
  maxRemMd?: number;
  minRem?: number;
};

export function AutoFitText({
  children,
  className = "",
  maxRem = 2.25,
  maxRemMd,
  minRem = 0.75,
}: AutoFitTextProps) {
  const containerRef =
    useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(
    null
  );

  useLayoutEffect(() => {
    const wrap = containerRef.current;
    const el = textRef.current;
    if (!wrap || !el) {
      return;
    }

    const mdMq = window.matchMedia(
      "(min-width: 768px)"
    );
    const maxSizePx = () =>
      remToPx(
        mdMq.matches
          ? maxRemMd ?? maxRem
          : maxRem
      );
    const minSizePx = () => remToPx(minRem);

    const fit = () => {
      const maxPx = maxSizePx();
      const minPx = minSizePx();
      const width = wrap.clientWidth;
      if (width === 0) {
        return;
      }

      el.style.fontSize = `${maxPx}px`;
      if (el.scrollWidth <= width) {
        return;
      }

      let left = minPx;
      let right = maxPx;
      for (let i = 0; i < 28; i++) {
        const mid = (left + right) / 2;
        el.style.fontSize = `${mid}px`;
        if (el.scrollWidth <= width) {
          left = mid;
        } else {
          right = mid;
        }
      }

      el.style.fontSize = `${left}px`;
      if (el.scrollWidth > width) {
        el.style.fontSize = `${(left * width) / el.scrollWidth}px`;
      }
    };

    const scheduleFit = () => {
      requestAnimationFrame(fit);
    };

    scheduleFit();
    const ro = new ResizeObserver(scheduleFit);
    ro.observe(wrap);
    mdMq.addEventListener("change", scheduleFit);
    return () => {
      ro.disconnect();
      mdMq.removeEventListener(
        "change",
        scheduleFit
      );
    };
  }, [children, maxRem, maxRemMd, minRem]);

  return (
    <div
      ref={containerRef}
      className="w-full min-w-0 overflow-hidden"
    >
      <span
        ref={textRef}
        className={`inline-block max-w-full whitespace-nowrap ${className}`}
        style={{
          fontSize: `${maxRem}rem`,
          lineHeight: 1,
        }}
      >
        {children}
      </span>
    </div>
  );
}
