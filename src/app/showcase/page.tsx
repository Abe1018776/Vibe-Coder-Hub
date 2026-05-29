import Link from "next/link";
import { Search, Plus, Rocket } from "lucide-react";
import {
  listProjects,
  getProjectFacets,
  getMyUpvotedProjectIds,
} from "@/lib/queries";
import { getAuthUser } from "@/lib/current-user";
import { ProjectCard } from "@/components/brand/project-card";
import { EmptyState } from "@/components/brand/empty-state";

export const metadata = {
  title: "Showcase",
  description: "Discover AI apps and tools built by the community.",
};

const controlClass =
  "h-10 rounded-[10px] border border-border bg-surface px-3 text-sm text-ink outline-none focus:ring-2 focus:ring-ring";

export default async function ShowcasePage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    tool?: string;
    tag?: string;
    sort?: string;
  }>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const tool = sp.tool ?? "";
  const tag = sp.tag ?? "";
  const sort: "top" | "new" = sp.sort === "new" ? "new" : "top";
  const filtering = Boolean(q || tool || tag);

  const [facets, projects, upvoted, user] = await Promise.all([
    getProjectFacets(),
    listProjects({
      q: q || undefined,
      tool: tool || undefined,
      tag: tag || undefined,
      sort,
    }),
    getMyUpvotedProjectIds(),
    getAuthUser(),
  ]);
  const isAuthed = !!user;

  return (
    <div className="mx-auto max-w-[1120px] px-4 py-10 md:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl text-ink">Showcase</h1>
          <p className="mt-2 text-muted-foreground">
            Discover what the community is building.
          </p>
        </div>
        <Link
          href="/showcase/submit"
          className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-[10px] bg-teal-600 px-4 text-sm font-medium text-white transition-transform active:scale-[0.98]"
        >
          <Plus size={16} /> Submit
        </Link>
      </div>

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
            placeholder="Search projects, tools, tags…"
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
        <select name="tag" defaultValue={tag} className={controlClass} aria-label="Tag">
          <option value="">All tags</option>
          {facets.tags.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select name="sort" defaultValue={sort} className={controlClass} aria-label="Sort">
          <option value="top">Top</option>
          <option value="new">New</option>
        </select>
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
            {projects.length} {projects.length === 1 ? "project" : "projects"}
          </span>
          <Link href="/showcase" className="text-teal-800 hover:underline">
            Clear
          </Link>
        </div>
      )}

      {projects.length === 0 ? (
        <EmptyState
          className="mt-6"
          icon={<Rocket size={22} />}
          title={filtering ? "No projects found" : "Nothing here yet"}
          description={
            filtering
              ? "Try a broader search or clear your filters."
              : "Be the first to show what you built."
          }
          actionHref={filtering ? "/showcase" : "/showcase/submit"}
          actionLabel={filtering ? "Clear filters" : "Submit a project"}
        />
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p, i) => (
            <ProjectCard
              key={p.id}
              project={p}
              isAuthed={isAuthed}
              upvoted={upvoted.has(p.id)}
              highlight={sort === "top" && !filtering && i === 0}
            />
          ))}
        </div>
      )}
    </div>
  );
}
