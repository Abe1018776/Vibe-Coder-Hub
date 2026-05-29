import Link from "next/link";
import { ShieldCheck, Lock } from "lucide-react";
import { requireAdmin } from "@/lib/admin";
import { lockAdmin } from "@/lib/actions/admin";

export const metadata = { title: "Admin", robots: { index: false, follow: false } };

// Non-admins never get here — requireAdmin() returns notFound().
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:px-6">
      <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 font-display text-lg text-ink"
        >
          <ShieldCheck size={18} className="text-teal-600" /> YidVibe Admin
        </Link>
        <form action={lockAdmin}>
          <button
            type="submit"
            className="inline-flex h-8 items-center gap-1.5 rounded-[10px] border border-border bg-surface px-3 text-xs text-ink transition-colors hover:bg-secondary"
          >
            <Lock size={13} /> Lock
          </button>
        </form>
      </div>
      {children}
    </div>
  );
}
