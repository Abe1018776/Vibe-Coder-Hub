import { cn } from "@/lib/utils";
import { type Accent, ACCENT_PILL } from "@/lib/site";

type PillAccent = Accent | "neutral";

/** Full-round pill: tint background + deep-stop text (BRAND pattern). */
export function Pill({
  accent = "teal",
  className,
  children,
}: {
  accent?: PillAccent;
  className?: string;
  children: React.ReactNode;
}) {
  const styles =
    accent === "neutral"
      ? "bg-secondary text-muted-foreground"
      : ACCENT_PILL[accent];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        styles,
        className,
      )}
    >
      {children}
    </span>
  );
}

/**
 * "Built-with" / tech chip — dusty-blue, monospace. One consistent color for every
 * tool so a developer can scan the tech at a glance.
 */
export function ToolPill({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-blue-tint px-2.5 py-0.5 font-mono text-[11px] text-blue-deep",
        className,
      )}
    >
      {children}
    </span>
  );
}

/**
 * "What it's about" / topic chip — teal. A different color family from the blue tool
 * pills so a non-technical visitor sees what a project *does*, separate from how it was built.
 */
export function TagPill({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-medium text-teal-800",
        className,
      )}
    >
      {children}
    </span>
  );
}
