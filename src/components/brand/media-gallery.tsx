"use client";

import { useState } from "react";
import { type Accent } from "@/lib/site";
import { cn } from "@/lib/utils";

/** Deep accent gradients for the no-image fallback (matches DetailHero). */
const HERO: Record<Accent, string> = {
  teal: "linear-gradient(135deg, var(--teal-400) 0%, var(--teal-800) 100%)",
  blue: "linear-gradient(135deg, var(--blue-mid) 0%, var(--blue-deep) 100%)",
  orange: "linear-gradient(135deg, var(--orange-mid) 0%, var(--orange-deep) 100%)",
  clay: "linear-gradient(135deg, var(--clay-mid) 0%, var(--clay-deep) 100%)",
  sage: "linear-gradient(135deg, var(--sage-mid) 0%, var(--sage-deep) 100%)",
  gold: "linear-gradient(135deg, var(--gold-500) 0%, var(--gold-700) 100%)",
};

function safeHost(u?: string | null): string | null {
  if (!u) return null;
  try {
    return new URL(u).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

/**
 * Screenshot-led media for a project. Shows uploaded screenshots big inside a
 * soft browser frame on a neutral mat (object-contain, never cropped), with a
 * thumbnail strip for multiples. Falls back to an accent gradient + initial when
 * there's no image.
 */
export function MediaGallery({
  name,
  coverImage,
  images = [],
  liveUrl,
  accent,
}: {
  name: string;
  coverImage?: string | null;
  images?: string[];
  liveUrl?: string | null;
  accent: Accent;
}) {
  const all = [coverImage, ...images].filter(Boolean) as string[];
  const [active, setActive] = useState(0);

  if (all.length === 0) {
    return (
      <div
        className="relative flex aspect-[16/10] items-center justify-center overflow-hidden rounded-2xl border border-border"
        style={{ backgroundImage: HERO[accent] }}
      >
        <span className="select-none font-display text-[7rem] font-bold leading-none text-white/15">
          {name.slice(0, 1).toUpperCase()}
        </span>
      </div>
    );
  }

  const host = safeHost(liveUrl);
  const current = all[Math.min(active, all.length - 1)];

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[var(--shadow-sm)]">
      <div className="flex items-center gap-1.5 border-b border-border bg-secondary/60 px-3.5 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-border" />
        <span className="h-2.5 w-2.5 rounded-full bg-border" />
        <span className="h-2.5 w-2.5 rounded-full bg-border" />
        {host && (
          <span className="ml-2 truncate rounded-full border border-border bg-surface px-2.5 py-0.5 text-[11px] text-muted-foreground">
            {host}
          </span>
        )}
      </div>

      <div className="flex items-center justify-center bg-[#eef1f3] p-3 sm:p-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={current}
          alt={name}
          className="max-h-[460px] w-full rounded-lg object-contain"
        />
      </div>

      {all.length > 1 && (
        <div className="flex gap-2 overflow-x-auto p-3">
          {all.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(i)}
              className={cn(
                "h-14 w-20 shrink-0 overflow-hidden rounded-lg border transition-colors",
                i === active
                  ? "border-teal-600 ring-2 ring-teal-600/40"
                  : "border-border hover:border-border-hover",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
