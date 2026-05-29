import Link from "next/link";
import { Search } from "lucide-react";
import { listBuilders, getBuilderFacets } from "@/lib/queries";
import { BuilderCard } from "@/components/brand/builder-card";
import { EmptyState } from "@/components/brand/empty-state";

export const metadata = {
  title: "Directory",
  description: "Find builders by skill, tool, or vibe.",
};

const controlClass =
  "h-10 rounded-[10px] border border-border bg-surface px-3 text-sm text-ink outline-none focus:ring-2 focus:ring-ring";

export default async function DirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    tool?: string;
    skill?: string;
    available?: string;
  }>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const tool = sp.tool ?? "";
  const skill = sp.skill ?? "";
  const availableOnly = sp.available === "1";
  const filtering = Boolean(q || tool || skill || availableOnly);

  const [facets, builders] = await Promise.all([
    getBuilderFacets(),
    listBuilders({
      q: q || undefined,
      tool: tool || undefined,
      skill: skill || undefined,
      availableOnly,
      sort: "new",
    }),
  ]);

  return (
    <div className="mx-auto max-w-[1120px] px-4 py-10 md:px-6">
      <h1 className="font-display text-3xl text-ink">Directory</h1>
      <p className="mt-2 text-muted-foreground">
        Find builders by skill, tool, or vibe. Every one ships fast.
      </p>

      <form
        method="get"
        className="mt-6 flex flex-col gap-3 rounded-card border border-border bg-surface p-4 lg:flex-row lg:items-center"
      >
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            name="q"
            defaultValue={q}
            dir="auto"
            placeholder="Search builders…"
            className="h-10 w-full rounded-[10px] border border-border bg-surface pl-9 pr-3 text-sm text-ink outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
          />
        </div>
        <select name="tool" defaultValue={tool} className={controlClass} aria-label="Tool">
          <option value="">All tools</option>
          {facets.tools.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select name="skill" defaultValue={skill} className={controlClass} aria-label="Skill">
          <option value="">All skills</option>
          {facets.skills.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <label className="inline-flex items-center gap-2 whitespace-nowrap px-1 text-sm text-ink">
          <input
            type="checkbox"
            name="available"
            value="1"
            defaultChecked={availableOnly}
            className="h-4 w-4 rounded border-border accent-teal-600"
          />
          Available
        </label>
        <button
          type="submit"
          className="h-10 rounded-[10px] bg-teal-600 px-5 text-sm font-medium text-white transition-transform active:scale-[0.98]"
        >
          Search
        </button>
      </form>

      {filtering && (
        <div className="mt-3 flex items-center gap-3 text-sm text-muted-foreground">
          <span>
            {builders.length} {builders.length === 1 ? "result" : "results"}
          </span>
          <Link href="/directory" className="text-teal-800 hover:underline">
            Clear
          </Link>
        </div>
      )}

      {builders.length === 0 ? (
        <EmptyState
          className="mt-6"
          title={filtering ? "No builders found" : "No builders yet"}
          description={
            filtering
              ? "Try a broader search or clear your filters."
              : "Be the first to create a profile and show what you build."
          }
          actionHref={filtering ? "/directory" : "/settings/profile"}
          actionLabel={filtering ? "Clear filters" : "Create your profile"}
        />
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {builders.map((b) => (
            <BuilderCard key={b.id} builder={b} />
          ))}
        </div>
      )}
    </div>
  );
}
