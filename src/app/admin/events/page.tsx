import { requireAdminUnlocked } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";
import { setEventRequestStatus } from "@/lib/actions/event-requests";
import { formatRelativeTime } from "@/lib/utils";

export const metadata = { title: "Event requests" };

type Req = {
  id: string;
  title: string;
  details: string;
  contact: string;
  created_at: string;
};

export default async function AdminEventsPage() {
  await requireAdminUnlocked();
  const supabase = await createClient();
  const { data } = await supabase
    .from("event_requests")
    .select("id, title, details, contact, created_at")
    .eq("status", "pending")
    .order("created_at", { ascending: false });
  const pending = (data ?? []) as Req[];

  return (
    <div>
      <h1 className="font-display text-2xl text-ink">Event requests</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        {pending.length} awaiting review.
      </p>

      {pending.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">Nothing to review.</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {pending.map((r) => {
            const approve = setEventRequestStatus.bind(null, r.id, "approved");
            const reject = setEventRequestStatus.bind(null, r.id, "rejected");
            return (
              <li
                key={r.id}
                className="rounded-card border border-border bg-surface p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-display font-bold text-ink">{r.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {r.contact} · {formatRelativeTime(r.created_at)}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <form action={approve}>
                      <button type="submit" className="btn btn-primary btn-sm">
                        Mark handled
                      </button>
                    </form>
                    <form action={reject}>
                      <button type="submit" className="btn btn-ghost btn-sm">
                        Dismiss
                      </button>
                    </form>
                  </div>
                </div>
                <p className="mt-2 whitespace-pre-line text-sm text-ink/80" dir="auto">
                  {r.details}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
