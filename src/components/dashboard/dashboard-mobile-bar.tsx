"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";

/**
 * Mobile-only top strip for the dashboard. On the hub root it shows the
 * greeting; on a section sub-page it shows a "‹ Dashboard" back link so the
 * Direction-C drill-down always has a clear way home. Desktop uses the tab rail.
 */
export function DashboardMobileBar({ firstName }: { firstName: string }) {
  const pathname = usePathname();
  const onHub = pathname === "/dashboard";

  if (onHub) {
    return (
      <div className="lg:hidden">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-teal-700">
          Your dashboard
        </p>
        <h1 className="mt-1 font-display text-[22px] font-bold tracking-tight text-ink">
          Hi, {firstName}
        </h1>
      </div>
    );
  }

  return (
    <Link
      href="/dashboard"
      className="-ml-2 inline-flex items-center gap-1.5 rounded-full px-2 py-1.5 text-sm font-semibold text-teal-800 transition-colors hover:bg-teal-50 lg:hidden"
    >
      <ArrowLeft size={16} /> Dashboard
    </Link>
  );
}
