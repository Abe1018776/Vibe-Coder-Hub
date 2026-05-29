import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Designed empty state — friendly, intentional, never a blank void (BRAND).
 * Optional faint ghost cards behind the message so the layout reads full.
 */
export function EmptyState({
  icon,
  title,
  description,
  actionHref,
  actionLabel,
  className,
}: {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-card border border-dashed border-border bg-surface/60 px-6 py-16 text-center",
        className,
      )}
    >
      {icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
          {icon}
        </div>
      )}
      <h3 className="font-display text-lg text-ink">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
        {description}
      </p>
      {actionHref && actionLabel && (
        <Link
          href={actionHref}
          className="mt-5 inline-flex h-10 items-center rounded-[10px] bg-teal-600 px-5 text-sm font-medium text-white transition-transform active:scale-[0.98]"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
