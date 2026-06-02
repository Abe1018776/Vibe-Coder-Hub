import { X } from "lucide-react";
import { requireAdminUnlocked } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";
import { addTag, removeTag } from "@/lib/actions/admin";

export const metadata = { title: "Browse-by tags" };

type Tag = {
  id: string;
  label: string;
  source: string;
  is_hidden: boolean;
};

export default async function AdminTagsPage() {
  await requireAdminUnlocked();
  // `tags` isn't in the generated Supabase types yet (migration not applied),
  // so cast the client to `any` for this read.
  const supabase = (await createClient()) as unknown as {
    from: (t: string) => {
      select: (c: string) => {
        order: (col: string) => Promise<{ data: Tag[] | null }>;
      };
    };
  };
  const { data } = await supabase
    .from("tags")
    .select("id, label, source, is_hidden")
    .order("label");
  const tags = (data ?? []) as Tag[];

  return (
    <div>
      <h1 className="font-display text-2xl text-ink">Browse-by tags</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Tags shown in the landing-page marquee. Project tags are added
        automatically; add or remove any here.
      </p>

      <form action={addTag} className="mt-6 flex flex-wrap items-center gap-2">
        <input
          type="text"
          name="label"
          required
          placeholder="Add a tag…"
          className="h-11 w-full max-w-xs rounded-xl border border-border bg-surface px-3.5 text-sm text-ink outline-none transition-colors placeholder:text-muted-foreground focus:border-teal-600 focus:ring-2 focus:ring-teal-600/15"
        />
        <button type="submit" className="btn btn-primary">
          Add tag
        </button>
      </form>

      {tags.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">No tags yet.</p>
      ) : (
        <div className="mt-6 flex flex-wrap gap-2">
          {tags.map((t) => {
            const remove = removeTag.bind(null, t.id);
            return (
              <form
                key={t.id}
                action={remove}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface py-1.5 pl-3 pr-1.5 text-sm text-ink"
              >
                <span dir="auto">{t.label}</span>
                <button
                  type="submit"
                  aria-label={`Remove ${t.label}`}
                  className="inline-flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-clay-tint hover:text-clay-mid"
                >
                  <X size={14} />
                </button>
              </form>
            );
          })}
        </div>
      )}
    </div>
  );
}
