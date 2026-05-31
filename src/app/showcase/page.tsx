import Link from "next/link";
import { Search, Plus, Rocket } from "lucide-react";
import {
  listProjects,
  getProjectFacets,
  getMyUpvotedProjectIds,
} from "@/lib/queries";
import { getAuthUser } from "@/lib/current-user";
import { Container } from "@/components/brand/layout";
import { ProjectCard } from "@/components/brand/project-card";
import { EmptyState } from "@/components/brand/empty-state";

export const metadata = {
  title: "Showcase",
  description: "Discover what the community is building.",
};

const selectClass =
  "h-11 rounded-xl border border-border bg-canvas px-3 text-sm font-medium text-ink outline-none transition-colors hover:border-border-hover focus:border-teal-600 focus:bg-surface";

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
    <Container className="py-10 md:py-14">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-[clamp(2.2rem,5vw,3.25rem)] font-bold tracking-tight text-ink">
            Showcase
          </h1>
          <p className="mt-2 text-[17px] text-muted-foreground">
            Discover what the community is building.
          </p>
        </div>
        <Link href="/showcase/submit" className="btn btn-primary shrink-0">
          <Plus size={17} /> Submit a project
        </Link>
      </div>

      <form
        method="get"
        className="mt-7 flex flex-col gap-2.5 rounded-2xl border border-border bg-surface p-3 shadow-[var(--shadow-sm)] lg:flex-row lg:items-center"
      >
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            name="q"
            defaultValue={q}
            dir="auto"
            placeholder="Search projects, tools, tags…"
            className="h-11 w-full rounded-xl border border-transparent bg-canvas pl-10 pr-3 text-sm text-ink outline-none transition-colors placeholder:text-muted-foreground focus:border-teal-600 focus:bg-surface"
          />
        </div>
        <select name="tool" defaultValue={tool} className={selectClass} aria-label="Tool">
          <option value="">All tools</option>
          {facets.tools.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select name="tag" defaultValue={tag} className={selectClass} aria-label="Tag">
          <option value="">All tags</option>
          {facets.tags.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select name="sort" defaultValue={sort} className={selectClass} aria-label="Sort">
          <option value="top">Top</option>
          <option value="new">New</option>
        </select>
        <button type="submit" className="btn btn-primary btn-sm h-11">
          Search
        </button>
      </form>

      {filtering && (
        <div className="mt-4 flex items-center gap-3 text-sm text-muted-foreground">
          <span>
            <strong className="text-ink">{projects.length}</strong>{" "}
            {projects.length === 1 ? "project" : "projects"}
          </span>
          <Link href="/showcase" className="font-medium text-teal-800 hover:underline">
            Clear
          </Link>
        </div>
      )}

      {projects.length === 0 ? (
        <EmptyState
          className="mt-8"
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
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p, i) => (
            <ProjectCard
              key={p.id}
              project={p}
              isAuthed={isAuthed}
              upvoted={upvoted.has(p.id)}
              highlight={sort === "top" && !filtering && i === 0 && !p.featured}
            />
          ))}
        </div>
      )}
    </Container>
  );
}
