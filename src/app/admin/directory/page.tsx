import { requireAdminUnlocked } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";
import { setDirectoryListingStatus } from "@/lib/actions/directory";
import { formatRelativeTime } from "@/lib/utils";
import { Pill } from "@/components/brand/pill";

export const metadata = { title: "Directory review" };

type Listing = {
  id: string;
  name: string;
  category: string;
  what_you_do: string;
  wants: string | null;
  contact: Record<string, string> | null;
  created_at: string;
};

export default async function AdminDirectoryPage() {
  await requireAdminUnlocked();
  const supabase = await createClient();
  const { data } = await supabase
    .from("directory_listings")
    .select("id, name, category, what_you_do, wants, contact, created_at")
    .eq("status", "pending")
    .order("created_at", { ascending: false });
  const pending = (data ?? []) as Listing[];

  return (
    <div>
      <h1 className="font-display text-2xl text-ink">Directory review</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        {pending.length} awaiting approval.
      </p>

      {pending.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">Nothing to review.</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {pending.map((l) => {
            const c = (l.contact ?? {}) as Record<string, string | undefined>;
            const approve = setDirectoryListingStatus.bind(null, l.id, "approved");
            const reject = setDirectoryListingStatus.bind(null, l.id, "rejected");
            return (
              <li
                key={l.id}
                className="rounded-card border border-border bg-surface p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-display font-bold text-ink">{l.name}</p>
                      <Pill accent="sage">{l.category}</Pill>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatRelativeTime(l.created_at)}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <form action={approve}>
                      <button type="submit" className="btn btn-primary btn-sm">
                        Approve
                      </button>
                    </form>
                    <form action={reject}>
                      <button type="submit" className="btn btn-ghost btn-sm">
                        Reject
                      </button>
                    </form>
                  </div>
                </div>
                <p className="mt-2 text-sm text-ink/80" dir="auto">
                  {l.what_you_do}
                </p>
                {l.wants && (
                  <p className="mt-1 text-sm text-muted-foreground" dir="auto">
                    <span className="font-medium">Looking for:</span> {l.wants}
                  </p>
                )}
                <p className="mt-2 text-xs text-muted-foreground">
                  {[c.email, c.phone, c.website].filter(Boolean).join("  ·  ")}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
