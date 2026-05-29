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

/** AI tool chip — dusty-blue, monospace. */
export function ToolPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-blue-tint px-2.5 py-0.5 font-mono text-[11px] text-blue-deep">
      {children}
    </span>
  );
}

/** Neutral tag chip. */
export function TagPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs text-muted-foreground">
      {children}
    </span>
  );
}
