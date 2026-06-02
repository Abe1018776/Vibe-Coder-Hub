"use client";
import { useEffect, useRef, useState } from "react";

/** Auto-advancing row of cards. Pauses on hover; static under reduced-motion. */
export function RotatingRow({ children }: { children: React.ReactNode[] }) {
  const items = Array.isArray(children) ? children : [children];
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (paused || items.length <= 1) return;
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % items.length), 4500);
    return () => clearInterval(t);
  }, [paused, items.length]);

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="overflow-hidden">
        <div
          ref={trackRef}
          className="flex transition-transform duration-700 ease-out"
          style={{ transform: `translateX(-${idx * 100}%)` }}
        >
          {items.map((c, i) => (
            <div key={i} className="w-full shrink-0 px-1 sm:w-1/2 lg:w-1/3">
              {c}
            </div>
          ))}
        </div>
      </div>
      {items.length > 1 && (
        <div className="mt-4 flex justify-center gap-1.5">
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to ${i + 1}`}
              onClick={() => setIdx(i)}
              className={
                i === idx
                  ? "h-1.5 w-4 rounded-full bg-teal-600"
                  : "h-1.5 w-1.5 rounded-full bg-border"
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
