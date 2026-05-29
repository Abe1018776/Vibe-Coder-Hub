import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/types";

export type Profile = Tables<"profiles">;
export type Project = Tables<"projects">;

export type ProjectOwner = Pick<
  Profile,
  "handle" | "name" | "avatar_url" | "available_for_hire"
>;
export type ProjectWithOwner = Project & { owner: ProjectOwner | null };

export type BuilderListItem = Profile & {
  project_count: { count: number }[];
};

const PROJECT_WITH_OWNER =
  "*, owner:profiles!projects_owner_id_fkey(handle,name,avatar_url,available_for_hire)";

/** PostgREST `.or()` uses commas/parens as syntax; strip them from user input. */
function sanitize(term: string): string {
  return term.replace(/[%,()*\\]/g, " ").trim();
}

export async function getProfileByHandle(
  handle: string,
): Promise<Profile | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("handle", handle)
    .maybeSingle();
  return data;
}

export async function getProjectsByOwner(ownerId: string): Promise<Project[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("projects")
    .select("*")
    .eq("owner_id", ownerId)
    .eq("hidden", false)
    .order("upvote_count", { ascending: false })
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function getProjectById(
  id: string,
): Promise<ProjectWithOwner | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("projects")
    .select(PROJECT_WITH_OWNER)
    .eq("id", id)
    .eq("hidden", false)
    .maybeSingle();
  return (data as ProjectWithOwner | null) ?? null;
}

export async function listProjects(
  opts: {
    sort?: "top" | "new";
    q?: string;
    tag?: string;
    tool?: string;
    limit?: number;
  } = {},
): Promise<ProjectWithOwner[]> {
  const supabase = await createClient();
  let query = supabase
    .from("projects")
    .select(PROJECT_WITH_OWNER)
    .eq("hidden", false);

  if (opts.q) {
    const s = sanitize(opts.q);
    if (s) query = query.or(`name.ilike.%${s}%,description.ilike.%${s}%`);
  }
  if (opts.tag) query = query.contains("tags", [opts.tag]);
  if (opts.tool) query = query.contains("tools", [opts.tool]);

  if (opts.sort === "new") {
    query = query.order("created_at", { ascending: false });
  } else {
    query = query
      .order("upvote_count", { ascending: false })
      .order("created_at", { ascending: false });
  }
  if (opts.limit) query = query.limit(opts.limit);

  const { data } = await query;
  return (data as ProjectWithOwner[] | null) ?? [];
}

export async function listBuilders(
  opts: {
    q?: string;
    tool?: string;
    skill?: string;
    availableOnly?: boolean;
    sort?: "new" | "name";
    limit?: number;
  } = {},
): Promise<BuilderListItem[]> {
  const supabase = await createClient();
  let query = supabase
    .from("profiles")
    .select("*, project_count:projects!projects_owner_id_fkey(count)");

  if (opts.q) {
    const s = sanitize(opts.q);
    if (s)
      query = query.or(
        `name.ilike.%${s}%,handle.ilike.%${s}%,bio.ilike.%${s}%`,
      );
  }
  if (opts.tool) query = query.contains("tools", [opts.tool]);
  if (opts.skill) query = query.contains("skills", [opts.skill]);
  if (opts.availableOnly) query = query.eq("available_for_hire", true);

  query =
    opts.sort === "name"
      ? query.order("name", { ascending: true })
      : query.order("created_at", { ascending: false });
  if (opts.limit) query = query.limit(opts.limit);

  const { data } = await query;
  return (data as BuilderListItem[] | null) ?? [];
}

export function builderProjectCount(b: BuilderListItem): number {
  return b.project_count?.[0]?.count ?? 0;
}

/** Headline counts for the landing page. */
export async function getLandingStats(): Promise<{
  builders: number;
  projects: number;
  gigs: number;
}> {
  const supabase = await createClient();
  const [builders, projects, gigs] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("projects").select("id", { count: "exact", head: true }),
    supabase
      .from("gigs")
      .select("id", { count: "exact", head: true })
      .eq("status", "open"),
  ]);
  return {
    builders: builders.count ?? 0,
    projects: projects.count ?? 0,
    gigs: gigs.count ?? 0,
  };
}

export type CommentAuthor = Pick<Profile, "handle" | "name" | "avatar_url">;
export type CommentWithAuthor = Tables<"comments"> & {
  author: CommentAuthor | null;
};

export async function getComments(
  projectId: string,
): Promise<CommentWithAuthor[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("comments")
    .select(
      "*, author:profiles!comments_author_id_fkey(handle,name,avatar_url)",
    )
    .eq("project_id", projectId)
    .eq("hidden", false)
    .order("created_at", { ascending: true });
  return (data as CommentWithAuthor[] | null) ?? [];
}

/** Project ids the current user has upvoted (empty set when signed out). */
export async function getMyUpvotedProjectIds(): Promise<Set<string>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Set();
  const { data } = await supabase
    .from("upvotes")
    .select("project_id")
    .eq("user_id", user.id);
  return new Set((data ?? []).map((r) => r.project_id));
}

/** Distinct tools/tags across all projects — for filter chips. */
export async function getProjectFacets(): Promise<{
  tools: string[];
  tags: string[];
}> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("projects")
    .select("tools, tags")
    .eq("hidden", false);
  const tools = new Set<string>();
  const tags = new Set<string>();
  for (const row of data ?? []) {
    (row.tools ?? []).forEach((t) => tools.add(t));
    (row.tags ?? []).forEach((t) => tags.add(t));
  }
  return {
    tools: [...tools].sort(),
    tags: [...tags].sort(),
  };
}

/** Distinct tools/skills across all profiles — for directory filters. */
export async function getBuilderFacets(): Promise<{
  tools: string[];
  skills: string[];
}> {
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("tools, skills");
  const tools = new Set<string>();
  const skills = new Set<string>();
  for (const row of data ?? []) {
    (row.tools ?? []).forEach((t) => tools.add(t));
    (row.skills ?? []).forEach((s) => skills.add(s));
  }
  return {
    tools: [...tools].sort(),
    skills: [...skills].sort(),
  };
}
