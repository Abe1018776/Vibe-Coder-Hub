"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, X, Rocket, Briefcase, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

const OPTIONS = [
  {
    href: "/showcase/submit",
    Icon: Rocket,
    label: "Project",
    desc: "Show what you built",
    tint: "tint-teal",
  },
  {
    href: "/gigs/post",
    Icon: Briefcase,
    label: "Gig",
    desc: "A job you need done",
    tint: "tint-orange",
  },
  {
    href: "/competitions/post",
    Icon: Trophy,
    label: "Competition",
    desc: "Run a challenge with a prize",
    tint: "tint-gold",
  },
];

/**
 * "Post" trigger + a chooser sheet (Project / Gig / Competition). `button` for
 * the desktop nav; `fab` is the raised + in the mobile bottom bar.
 */
export function PostMenu({ variant = "button" }: { variant?: "button" | "fab" }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {variant === "button" ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="btn btn-primary btn-sm"
        >
          <Plus size={16} /> Post
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Post"
          className="flex flex-col items-center justify-center pt-1.5"
        >
          <span className="-mt-5 grid h-12 w-12 place-items-center rounded-full bg-teal-600 text-white shadow-[0_4px_14px_rgba(31,110,102,0.4)] ring-4 ring-canvas">
            <Plus size={22} />
          </span>
          <span className="mt-0.5 text-[11px] font-medium text-muted-foreground">
            Post
          </span>
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true">
          <button
            aria-label="Close"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/30"
          />
          <div className="absolute inset-x-0 bottom-0 rounded-t-3xl border-t border-border bg-surface p-5 pb-8 shadow-float sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:w-[440px] sm:max-w-[92vw] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl sm:border">
            <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-border sm:hidden" />
            <div className="mb-4 flex items-center justify-between">
              <span className="font-display text-lg font-semibold text-ink">
                What do you want to post?
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="icon-btn"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {OPTIONS.map((o) => (
                <Link
                  key={o.href}
                  href={o.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-2xl border border-border p-3.5 transition-colors hover:border-border-hover hover:bg-secondary"
                >
                  <span
                    className={cn(
                      "grid h-10 w-10 shrink-0 place-items-center rounded-xl",
                      o.tint,
                    )}
                  >
                    <o.Icon size={18} />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-semibold text-ink">{o.label}</span>
                    <span className="block text-sm text-muted-foreground">
                      {o.desc}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
