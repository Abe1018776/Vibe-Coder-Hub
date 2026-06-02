import { requireAdminUnlocked } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";
import { setFeedbackHandled } from "@/lib/actions/feedback";
import { formatRelativeTime } from "@/lib/utils";
import { Pill } from "@/components/brand/pill";

export const metadata = { title: "Feedback" };

type Item = {
  id: string;
  body: string;
  sentiment: string | null;
  page_url: string | null;
  is_anonymous: boolean;
  submitter_contact: string | null;
  submitter_id: string | null;
  created_at: string;
};

const SENTIMENT_ACCENT: Record<string, "sage" | "clay" | "gold"> = {
  like: "sage",
  dislike: "clay",
  idea: "gold",
};

export default async function AdminFeedbackPage() {
  await requireAdminUnlocked();
  const supabase = await createClient();
  const { data } = await supabase
    .from("feedback")
    .select(
      "id, body, sentiment, page_url, is_anonymous, submitter_contact, submitter_id, created_at",
    )
    .eq("status", "open")
    .order("created_at", { ascending: false });
  const items = (data ?? []) as Item[];

  return (
    <div>
      <h1 className="font-display text-2xl text-ink">Feedback</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        {items.length} open {items.length === 1 ? "note" : "notes"}.
      </p>

      {items.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">Nothing new.</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {items.map((f) => {
            const handled = setFeedbackHandled.bind(null, f.id);
            const who = f.is_anonymous
              ? "Anonymous"
              : f.submitter_id
                ? "Signed-in user"
                : "Visitor";
            return (
              <li
                key={f.id}
                className="rounded-card border border-border bg-surface p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {f.sentiment && (
                      <Pill accent={SENTIMENT_ACCENT[f.sentiment] ?? "teal"}>
                        {f.sentiment}
                      </Pill>
                    )}
                    <span className="text-sm font-medium text-ink">{who}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatRelativeTime(f.created_at)}
                    </span>
                  </div>
                  <form action={handled}>
                    <button type="submit" className="btn btn-ghost btn-sm">
                      Mark handled
                    </button>
                  </form>
                </div>
                <p className="mt-2 whitespace-pre-line text-sm text-ink/90" dir="auto">
                  {f.body}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {f.page_url && <>on {f.page_url}</>}
                  {f.submitter_contact && <> · {f.submitter_contact}</>}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
