import type { ReactNode } from "react";
import type { Accent } from "@/lib/site";

const ACCENT: Record<Accent, { tint: string; fg: string; rule: string }> = {
  teal:   { tint: "var(--teal-50)",   fg: "var(--teal-700)",    rule: "var(--teal-600)" },
  gold:   { tint: "var(--gold-50)",   fg: "var(--gold-700)",    rule: "var(--gold-500)" },
  sage:   { tint: "var(--sage-bg)",   fg: "var(--sage-deep)",   rule: "var(--sage-mid)" },
  clay:   { tint: "var(--clay-bg)",   fg: "var(--clay-deep)",   rule: "var(--clay-mid)" },
  blue:   { tint: "var(--blue-bg)",   fg: "var(--blue-deep)",   rule: "var(--blue-mid)" },
  orange: { tint: "var(--orange-bg)", fg: "var(--orange-deep)", rule: "var(--orange-mid)" },
};

/** Consistent branded page header: tinted icon chip, eyebrow, serif title, subtitle, accent rule. */
export function PageHeader({
  eyebrow,
  title,
  subtitle,
  accent = "teal",
  icon,
  action,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  accent?: Accent;
  icon: ReactNode;
  action?: ReactNode;
}) {
  const a = ACCENT[accent];
  return (
    <div className="flex flex-wrap items-end gap-4 border-b-2 pb-4" style={{ borderBottomColor: a.rule }}>
      <span
        className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border"
        style={{ background: a.tint, color: a.fg, borderColor: `color-mix(in srgb, ${a.fg} 22%, transparent)` }}
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        {eyebrow && (
          <div className="text-[10.5px] font-bold uppercase tracking-[0.13em]" style={{ color: a.fg }}>
            {eyebrow}
          </div>
        )}
        <h1 className="font-display text-[clamp(1.8rem,4vw,2.4rem)] font-bold tracking-tight text-ink">{title}</h1>
        {subtitle && <p className="mt-1 text-[15px] text-muted-foreground">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0 pb-1">{action}</div>}
    </div>
  );
}
