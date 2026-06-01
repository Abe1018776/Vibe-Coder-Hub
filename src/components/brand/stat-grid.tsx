import { cn } from "@/lib/utils";

export type StatItem = { value: React.ReactNode; label: string };

/** A single stat: big display number over a small uppercase label. */
export function Stat({ value, label }: StatItem) {
  return (
    <div>
      <div className="font-display text-xl font-bold leading-none text-ink">
        {value}
      </div>
      <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </div>
    </div>
  );
}

/** Responsive grid of stats — used on the dashboard overview + profile. */
export function StatGrid({
  stats,
  className,
}: {
  stats: StatItem[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-3 gap-x-4 gap-y-4 sm:grid-cols-4 lg:grid-cols-8",
        className,
      )}
    >
      {stats.map((s) => (
        <Stat key={s.label} value={s.value} label={s.label} />
      ))}
    </div>
  );
}
