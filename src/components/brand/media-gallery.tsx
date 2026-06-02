"use client";

import { useState } from "react";
import { ExternalLink } from "lucide-react";
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
    <div className="rounded-[20px] bg-[linear-gradient(150deg,var(--teal-600),var(--teal-800))] p-5 sm:p-6">
      <div className="overflow-hidden rounded-xl shadow-[0_22px_50px_-16px_rgba(0,0,0,0.55)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={current}
          alt={name}
          className="max-h-[460px] w-full bg-white object-contain"
        />
      </div>

      {host && (
        <a
          href={liveUrl ?? undefined}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3.5 py-1.5 text-xs font-bold text-teal-800 shadow-[0_4px_14px_rgba(0,0,0,0.2)] backdrop-blur transition-colors hover:bg-white"
        >
          {host} <ExternalLink size={13} />
        </a>
      )}

      {all.length > 1 && (
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {all.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(i)}
              className={cn(
                "h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-colors",
                i === active
                  ? "border-white"
                  : "border-white/30 hover:border-white/60",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-full w-full bg-white object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
