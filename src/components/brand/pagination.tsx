import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/** Build an href for a target page, preserving every other search param. */
function pageHref(
  pathname: string,
  params: Record<string, string | undefined>,
  page: number,
): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v && k !== "page") sp.set(k, v);
  }
  if (page > 1) sp.set("page", String(page));
  const qs = sp.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}

/** 1 … (p-1) p (p+1) … N with collapsing ellipses. */
function pageItems(current: number, total: number): (number | "ellipsis")[] {
  const nums = new Set<number>([1, total, current - 1, current, current + 1]);
  const sorted = [...nums].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
  const out: (number | "ellipsis")[] = [];
  let prev = 0;
  for (const n of sorted) {
    if (n - prev > 1) out.push("ellipsis");
    out.push(n);
    prev = n;
  }
  return out;
}

const cell =
  "inline-flex h-10 min-w-10 items-center justify-center rounded-xl border px-3 text-sm font-medium transition-colors";

export function Pagination({
  pathname,
  searchParams,
  page,
  totalPages,
}: {
  pathname: string;
  searchParams: Record<string, string | undefined>;
  page: number;
  totalPages: number;
}) {
  if (totalPages <= 1) return null;

  return (
    <nav
      className="mt-10 flex items-center justify-center gap-1.5"
      aria-label="Pagination"
    >
      {page > 1 ? (
        <Link
          href={pageHref(pathname, searchParams, page - 1)}
          rel="prev"
          aria-label="Previous page"
          className={cn(cell, "border-border bg-surface text-ink hover:border-border-hover")}
        >
          <ChevronLeft size={16} />
        </Link>
      ) : (
        <span aria-disabled className={cn(cell, "border-border bg-canvas text-muted-foreground/50")}>
          <ChevronLeft size={16} />
        </span>
      )}

      {pageItems(page, totalPages).map((it, i) =>
        it === "ellipsis" ? (
          <span key={`e${i}`} className="px-1.5 text-sm text-muted-foreground">
            …
          </span>
        ) : (
          <Link
            key={it}
            href={pageHref(pathname, searchParams, it)}
            aria-current={it === page ? "page" : undefined}
            className={cn(
              cell,
              it === page
                ? "border-teal-600 bg-teal-600 text-white"
                : "border-border bg-surface text-ink hover:border-border-hover",
            )}
          >
            {it}
          </Link>
        ),
      )}

      {page < totalPages ? (
        <Link
          href={pageHref(pathname, searchParams, page + 1)}
          rel="next"
          aria-label="Next page"
          className={cn(cell, "border-border bg-surface text-ink hover:border-border-hover")}
        >
          <ChevronRight size={16} />
        </Link>
      ) : (
        <span aria-disabled className={cn(cell, "border-border bg-canvas text-muted-foreground/50")}>
          <ChevronRight size={16} />
        </span>
      )}
    </nav>
  );
}
