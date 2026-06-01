"use client";

import { useRouter, usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Sensible section root for a path. For a detail/sub page we drop the last
 * segment ("/showcase/abc" -> "/showcase", "/dashboard/inbox/123" ->
 * "/dashboard/inbox"). Always returns at least "/".
 */
function sectionRoot(path: string): string {
  const parts = path.split("/").filter(Boolean);
  if (parts.length <= 1) return "/";
  parts.pop();
  return "/" + parts.join("/");
}

/** True when there's in-app history we can safely return to (same-origin). */
function hasSafeHistory(): boolean {
  if (typeof window === "undefined") return false;
  // A direct visit / new tab has length 1; a same-origin referrer means we
  // navigated here from within the app and router.back() is safe.
  if (window.history.length <= 1) return false;
  const ref = document.referrer;
  if (!ref) return false;
  try {
    return new URL(ref).origin === window.location.origin;
  } catch {
    return false;
  }
}

/**
 * Branded "← Back". Returns to the previous in-app page when we got here via an
 * in-app navigation; otherwise falls back to the section root (or an explicit
 * `fallbackHref`) so a deep-linked visitor always lands somewhere sensible.
 */
export function BackLink({
  label = "Back",
  fallbackHref,
  className,
}: {
  label?: string;
  fallbackHref?: string;
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  function onClick() {
    if (hasSafeHistory()) {
      router.back();
    } else {
      router.push(fallbackHref ?? sectionRoot(pathname));
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold text-teal-800 outline-none transition-colors hover:bg-teal-50 focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      <ArrowLeft size={16} />
      {label}
    </button>
  );
}
