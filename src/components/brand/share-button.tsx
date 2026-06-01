"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/**
 * Share a page via the native share sheet where available, falling back to
 * copy-link. `path` is a site-relative path ("/showcase/123") resolved to an
 * absolute URL at click time.
 */
export function ShareButton({
  path,
  title,
  label = "Share",
  className,
}: {
  path: string;
  title?: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function onClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const url =
      typeof window !== "undefined"
        ? new URL(path, window.location.origin).toString()
        : path;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        return; // user dismissed the share sheet
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied");
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Couldn't copy the link.");
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn("btn btn-ghost", className)}
      aria-label={label}
    >
      {copied ? <Check size={16} /> : <Share2 size={16} />} {label}
    </button>
  );
}
