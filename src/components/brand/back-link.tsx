"use client";

import { useRouter, usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

/** Parent path: strip the last segment ("/showcase/abc" -> "/showcase"). */
function parentOf(path: string): string {
  const parts = path.split("/").filter(Boolean);
  parts.pop();
  return "/" + parts.join("/");
}

/**
 * Branded "← Back". Goes to the previous page when there is history, otherwise
 * falls back to the section root (or an explicit `fallbackHref`). Client-side so
 * it can read history length + the current path.
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
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref ?? (parentOf(pathname) || "/"));
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
