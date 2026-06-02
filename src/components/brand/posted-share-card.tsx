"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Sparkle } from "@/components/brand/sparkle";
import { ShareButton } from "@/components/brand/share-button";

/** Celebratory "you just posted — share it" banner. Auto-dismisses after 20s. */
export function PostedShareCard({
  path,
  title,
  caption,
}: {
  path: string;
  title: string;
  caption: string;
}) {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setOpen(false), 20000);
    return () => clearTimeout(t);
  }, []);

  if (!open) return null;

  return (
    <div className="relative mb-5 flex flex-col gap-3 overflow-hidden rounded-2xl border border-sage-mid/40 bg-sage-tint/60 p-4 pr-10 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/70">
          <Sparkle size={20} color="var(--sage-deep)" />
        </span>
        <div>
          <p className="font-semibold text-ink">Posted! Now share it</p>
          <p className="text-sm text-muted-foreground">
            Let the community see what you built.
          </p>
        </div>
      </div>
      <ShareButton
        path={path}
        title={title}
        caption={caption}
        label="Share project"
        className="btn-sm shrink-0"
      />
      <button
        type="button"
        onClick={() => setOpen(false)}
        aria-label="Dismiss"
        className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-white/60"
      >
        <X size={16} />
      </button>
      <span
        aria-hidden
        className="yv-share-progress absolute bottom-0 left-0 h-0.5 bg-sage-mid/70"
      />
    </div>
  );
}
