import Link from "next/link";
import { requireAdminUnlocked } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";
import { setCompetitionReviewStatus } from "@/lib/actions/admin";
import { formatRelativeTime } from "@/lib/utils";

export const metadata = { title: "Competition review" };

type PendingComp = {
  id: string;
  title: string;
  slug: string;
  prize_amount: number;
  description: string;
  created_at: string;
};

export default async function AdminCompetitionsPage() {
  await requireAdminUnlocked();
  const supabase = await createClient();
  const { data } = await supabase
    .from("competitions")
    .select("id, title, slug, prize_amount, description, created_at")
    .eq("review_status", "pending")
    .order("created_at", { ascending: false });
  const pending = (data ?? []) as PendingComp[];

  return (
    <div>
      <h1 className="font-display text-2xl text-ink">Competition review</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        {pending.length} awaiting approval.
      </p>

      {pending.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">Nothing to review.</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {pending.map((c) => {
            const approve = setCompetitionReviewStatus.bind(null, c.id, "approved");
            const reject = setCompetitionReviewStatus.bind(null, c.id, "rejected");
            return (
              <li
                key={c.id}
                className="rounded-card border border-border bg-surface p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      href={`/competitions/${c.slug}`}
                      className="font-display font-bold text-ink hover:underline"
                    >
                      {c.title}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      ${c.prize_amount?.toLocaleString()} ·{" "}
                      {formatRelativeTime(c.created_at)}
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
                <p className="mt-2 line-clamp-2 text-sm text-ink/80" dir="auto">
                  {c.description}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
