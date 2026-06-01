import Link from "next/link";
import { Plus, Rocket } from "lucide-react";
import {
  listProjects,
  countProjects,
  getProjectFacets,
  getMyUpvotedProjectIds,
} from "@/lib/queries";
import { getAuthUser } from "@/lib/current-user";
import { Container } from "@/components/brand/layout";
import { ProjectCard } from "@/components/brand/project-card";
import { EmptyState } from "@/components/brand/empty-state";
import { FilterBar } from "@/components/brand/filter-bar";
import { Pagination } from "@/components/brand/pagination";

export const metadata = {
  title: "Showcase",
  description: "Discover what the community is building.",
};

const PER_PAGE = 24;

export default async function ShowcasePage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    tool?: string;
    tag?: string;
    sort?: string;
    page?: string;
  }>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const tool = sp.tool ?? "";
  const tag = sp.tag ?? "";
  const sort: "top" | "new" = sp.sort === "new" ? "new" : "top";
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const filtering = Boolean(q || tool || tag);

  const filterOpts = {
    q: q || undefined,
    tool: tool || undefined,
    tag: tag || undefined,
  };
  const [facets, total, projects, upvoted, user] = await Promise.all([
    getProjectFacets(),
    countProjects(filterOpts),
    listProjects({ ...filterOpts, sort, page, perPage: PER_PAGE }),
    getMyUpvotedProjectIds(),
    getAuthUser(),
  ]);
  const isAuthed = !!user;
  const totalPages = Math.ceil(total / PER_PAGE);

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

      <FilterBar
        basePath="/showcase"
        searchValue={q}
        placeholder="Search projects, tools, tags…"
        selects={[
          { name: "tool", allLabel: "All tools", value: tool, options: facets.tools },
          { name: "tag", allLabel: "All tags", value: tag, options: facets.tags },
        ]}
        sort={{
          name: "sort",
          value: sort,
          options: [
            { value: "top", label: "Top" },
            { value: "new", label: "New" },
          ],
        }}
      />

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
        <>
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p, i) => (
              <ProjectCard
                key={p.id}
                project={p}
                isAuthed={isAuthed}
                upvoted={upvoted.has(p.id)}
                highlight={
                  sort === "top" && !filtering && page === 1 && i === 0 && !p.featured
                }
              />
            ))}
          </div>
          <Pagination
            pathname="/showcase"
            searchParams={sp}
            page={page}
            totalPages={totalPages}
          />
        </>
      )}
    </Container>
  );
}
