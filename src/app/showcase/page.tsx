import Link from "next/link";
import { Plus, Rocket } from "lucide-react";
import {
  listProjects,
  countProjects,
  getProjectFacets,
  getMyUpvotedProjectIds,
  getMySavedProjectIds,
} from "@/lib/queries";
import { getAuthUser } from "@/lib/current-user";
import { Container } from "@/components/brand/layout";
import { PageHeader } from "@/components/brand/page-header";
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
  const [facets, total, projects, upvoted, saved, user] = await Promise.all([
    getProjectFacets(),
    countProjects(filterOpts),
    listProjects({ ...filterOpts, sort, page, perPage: PER_PAGE }),
    getMyUpvotedProjectIds(),
    getMySavedProjectIds(),
    getAuthUser(),
  ]);
  const isAuthed = !!user;
  const totalPages = Math.ceil(total / PER_PAGE);
  // The most-upvoted project is the first item of the default "top" listing.
  const topId =
    sort === "top" && !filtering && page === 1 ? projects[0]?.id : undefined;

  return (
    <Container className="py-10 md:py-14">
      <PageHeader
        accent="teal"
        eyebrow="Explore"
        title="Showcase"
        subtitle="Discover what the community is building."
        action={
          <Link href="/showcase/submit" className="btn btn-primary shrink-0">
            <Plus size={17} /> Submit a project
          </Link>
        }
      />

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
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p, i) => (
              <ProjectCard
                key={p.id}
                project={p}
                isAuthed={isAuthed}
                upvoted={upvoted.has(p.id)}
                saved={saved.has(p.id)}
                topRank={p.id === topId}
                highlight={
                  sort === "top" && !filtering && page === 1 && i === 0
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
