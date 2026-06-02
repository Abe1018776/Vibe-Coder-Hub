import Link from "next/link";

export type GlanceStat = { value: number; label: string; href: string };

/** Bold, clickable single-row stats. Solid teal, gentle gold wash on hover. */
export function GlanceRow({ stats }: { stats: GlanceStat[] }) {
  return (
    <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
      {stats.map((s) => (
        <Link
          key={s.label}
          href={s.href}
          className="yv-glance-tile rounded-xl px-2 py-3.5 text-center"
        >
          <div className="font-display text-2xl font-bold leading-none">{s.value}</div>
          <div className="mt-1.5 text-[9px] font-semibold uppercase tracking-[0.06em] opacity-90">
            {s.label}
          </div>
        </Link>
      ))}
    </div>
  );
}
