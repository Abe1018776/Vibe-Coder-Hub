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

/** Is the current user following this builder? (false when signed out). */
export async function isFollowing(builderId: string): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;
  const { data } = await supabase
    .from("follows")
    .select("builder_id")
    .eq("follower_id", user.id)
    .eq("builder_id", builderId)
    .maybeSingle();
  return !!data;
}

/** Public profile stats: visible (non-anonymous, non-hidden) project count and
 *  the sum of their upvotes. */
export async function getProfileStats(
  profileId: string,
): Promise<{ projects: number; upvotes: number }> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("projects")
    .select("upvote_count")
    .eq("owner_id", profileId)
    .eq("hidden", false)
    .eq("is_anonymous", false);
  const rows = data ?? [];
  return {
    projects: rows.length,
    upvotes: rows.reduce((s, r) => s + (r.upvote_count ?? 0), 0),
  };
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
    page?: number;
    perPage?: number;
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
  if (opts.page && opts.perPage) {
    const from = (opts.page - 1) * opts.perPage;
    query = query.range(from, from + opts.perPage - 1);
  } else if (opts.limit) {
    query = query.limit(opts.limit);
  }

  const { data } = await query;
  return (data as ProjectWithOwner[] | null) ?? [];
}

/** Total projects matching the given filters (for pagination). */
export async function countProjects(
  opts: { q?: string; tag?: string; tool?: string } = {},
): Promise<number> {
  const supabase = await createClient();
  let query = supabase
    .from("projects")
    .select("id", { count: "exact", head: true })
    .eq("hidden", false);
  if (opts.q) {
    const s = sanitize(opts.q);
    if (s) query = query.or(`name.ilike.%${s}%,description.ilike.%${s}%`);
  }
  if (opts.tag) query = query.contains("tags", [opts.tag]);
  if (opts.tool) query = query.contains("tools", [opts.tool]);
  const { count } = await query;
  return count ?? 0;
}

export async function listBuilders(
  opts: {
    q?: string;
    tool?: string;
    skill?: string;
    availableOnly?: boolean;
    sort?: "new" | "name";
    limit?: number;
    page?: number;
    perPage?: number;
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
  if (opts.page && opts.perPage) {
    const from = (opts.page - 1) * opts.perPage;
    query = query.range(from, from + opts.perPage - 1);
  } else if (opts.limit) {
    query = query.limit(opts.limit);
  }

  const { data } = await query;
  return (data as BuilderListItem[] | null) ?? [];
}

/** Total builders matching the given filters (for pagination). */
export async function countBuilders(
  opts: { q?: string; tool?: string; skill?: string; availableOnly?: boolean } = {},
): Promise<number> {
  const supabase = await createClient();
  let query = supabase
    .from("profiles")
    .select("id", { count: "exact", head: true });
  if (opts.q) {
    const s = sanitize(opts.q);
    if (s)
      query = query.or(`name.ilike.%${s}%,handle.ilike.%${s}%,bio.ilike.%${s}%`);
  }
  if (opts.tool) query = query.contains("tools", [opts.tool]);
  if (opts.skill) query = query.contains("skills", [opts.skill]);
  if (opts.availableOnly) query = query.eq("available_for_hire", true);
  const { count } = await query;
  return count ?? 0;
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

/** Project ids the current user has saved (empty set when signed out). */
export async function getMySavedProjectIds(): Promise<Set<string>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Set();
  const { data } = await supabase
    .from("saves")
    .select("project_id")
    .eq("user_id", user.id);
  return new Set((data ?? []).map((r) => r.project_id));
}

/** The current user's saved projects, most-recently-saved first. */
export async function listSavedProjects(): Promise<ProjectWithOwner[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  const { data: saves } = await supabase
    .from("saves")
    .select("project_id, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  const ids = (saves ?? []).map((s) => s.project_id);
  if (ids.length === 0) return [];

  const { data } = await supabase
    .from("projects")
    .select(PROJECT_WITH_OWNER)
    .in("id", ids)
    .eq("hidden", false);
  const rows = (data as ProjectWithOwner[] | null) ?? [];
  const order = new Map(ids.map((id, i) => [id, i]));
  return rows.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
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
