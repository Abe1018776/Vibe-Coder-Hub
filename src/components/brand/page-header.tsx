import type { ReactNode } from "react";
import type { Accent } from "@/lib/site";

const ACCENT: Record<Accent, { fg: string; rule: string }> = {
  teal:   { fg: "var(--teal-700)",    rule: "var(--teal-600)" },
  gold:   { fg: "var(--gold-700)",    rule: "var(--gold-500)" },
  sage:   { fg: "var(--sage-deep)",   rule: "var(--sage-mid)" },
  clay:   { fg: "var(--clay-deep)",   rule: "var(--clay-mid)" },
  blue:   { fg: "var(--blue-deep)",   rule: "var(--blue-mid)" },
  orange: { fg: "var(--orange-deep)", rule: "var(--orange-mid)" },
};

/** Consistent branded page header: eyebrow, serif title, subtitle, accent rule. */
export function PageHeader({
  eyebrow,
  title,
  subtitle,
  accent = "teal",
  action,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  accent?: Accent;
  action?: ReactNode;
}) {
  const a = ACCENT[accent];
  return (
    <div className="border-b-2 pb-4" style={{ borderBottomColor: a.rule }}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          {eyebrow && (
            <div className="text-[10.5px] font-bold uppercase tracking-[0.13em]" style={{ color: a.fg }}>{eyebrow}</div>
          )}
          <h1 className="font-display text-[clamp(1.8rem,4vw,2.4rem)] font-bold tracking-tight text-ink">{title}</h1>
          {subtitle && <p className="mt-1 text-[15px] text-muted-foreground">{subtitle}</p>}
        </div>
        {action && <div className="shrink-0 pb-1">{action}</div>}
      </div>
    </div>
  );
}
