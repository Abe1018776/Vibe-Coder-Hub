import { cn } from "@/lib/utils";

/**
 * The shared soft card used across the site: rounded, hairline border, surface
 * fill, soft shadow. One source of truth so every page reads as one product.
 */
export function Panel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-surface p-4 shadow-[var(--shadow-sm)] sm:p-5",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Small uppercase section label that heads a panel. */
export function PanelLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground",
        className,
      )}
    >
      {children}
    </p>
  );
}
