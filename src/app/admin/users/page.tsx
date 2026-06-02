import Link from "next/link";
import { Search } from "lucide-react";
import { requireAdminUnlocked } from "@/lib/admin";
import { adminListUsers } from "@/lib/queries";
import { UsersTable } from "@/components/admin/users-table";
import { InviteUser } from "@/components/admin/invite-user";
import { cn } from "@/lib/utils";

const FILTERS = [
  { value: "all", label: "All" },
  { value: "admins", label: "Admins" },
  { value: "verified", label: "Verified" },
  { value: "featured", label: "Featured" },
  { value: "builders", label: "Builders" },
] as const;

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; filter?: string }>;
}) {
  await requireAdminUnlocked();
  const sp = await searchParams;
  const active = sp.filter ?? "all";
  const users = await adminListUsers(sp.q, sp.filter);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl text-ink">Users</h1>
        <InviteUser />
      </div>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Verify, feature, or grant admin. Search and filter the directory.
      </p>

      <form method="get" className="mt-5 flex items-center gap-2">
        {sp.filter && <input type="hidden" name="filter" value={sp.filter} />}
        <div className="relative flex-1 sm:max-w-sm">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="search"
            name="q"
            defaultValue={sp.q ?? ""}
            placeholder="Search name, handle, or email…"
            className="h-10 w-full rounded-xl border border-border bg-surface pl-9 pr-3 text-sm text-ink outline-none transition-colors placeholder:text-muted-foreground focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15"
          />
        </div>
        <button type="submit" className="btn btn-ghost btn-sm">
          Search
        </button>
      </form>

      <div className="mt-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const isActive = active === f.value;
          const params = new URLSearchParams();
          if (sp.q) params.set("q", sp.q);
          if (f.value !== "all") params.set("filter", f.value);
          const qs = params.toString();
          return (
            <Link
              key={f.value}
              href={qs ? `/admin/users?${qs}` : "/admin/users"}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                isActive
                  ? "border-transparent bg-teal-50 text-teal-800"
                  : "border-border bg-surface text-muted-foreground hover:border-border-hover hover:text-ink",
              )}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      <UsersTable users={users} />
    </div>
  );
}
