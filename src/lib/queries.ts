import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/types";

export type Profile = Tables<"profiles">;
export type Project = Tables<"projects">;

export type ProjectOwner = Pick<
  Profile,
  "handle" | "name" | "avatar_url" | "available_for_hire" | "show_real_name"
>;
export type ProjectWithOwner = Project & { owner: ProjectOwner | null };

export type BuilderListItem = Profile & {
  project_count: { count: number }[];
};

const PROJECT_WITH_OWNER =
  "*, owner:profiles!projects_owner_id_fkey(handle,name,avatar_url,available_for_hire,show_real_name)";

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
    sort?: "new" | "name" | "followers";
    limit?: number;
    page?: number;
    perPage?: number;
  } = {},
): Promise<BuilderListItem[]> {
  const supabase = await createClient();
  let query = supabase
    .from("profiles")
    .select("*, project_count:projects!projects_owner_id_fkey(count)")
    // Only self-declared builders who have gone public appear in the directory.
    .eq("is_builder", true)
    .eq("is_public", true);

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

  if (opts.sort === "name") {
    query = query
      .order("is_featured", { ascending: false })
      .order("name", { ascending: true });
  } else if (opts.sort === "followers") {
    query = query
      .order("is_featured", { ascending: false })
      .order("follower_count", { ascending: false })
      .order("created_at", { ascending: false });
  } else {
    query = query
      .order("is_featured", { ascending: false })
      .order("created_at", { ascending: false });
  }
  if (opts.page && opts.perPage) {
    const from = (opts.page - 1) * opts.perPage;
    query = query.range(from, from + opts.perPage - 1);
  } else if (opts.limit) {
    query = query.limit(opts.limit);
  }

  const { data } = await query;
  return (data as BuilderListItem[] | null) ?? [];
}

/** Most-followed builders, for the landing-page "Top Creators" row. */
export async function listTopBuilders(
  limit = 5,
): Promise<BuilderListItem[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*, project_count:projects!projects_owner_id_fkey(count)")
    .eq("is_builder", true)
    .eq("is_public", true)
    .order("is_featured", { ascending: false })
    .order("follower_count", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data as BuilderListItem[] | null) ?? [];
}

/** Admin-only: list all users (with email + project count) via the RPC. */
export async function adminListUsers(search?: string, filter?: string) {
  const supabase = await createClient();
  const { data } = await (supabase as any).rpc("admin_list_users", {
    search: search ?? null,
    filter: filter ?? "all",
  });
  return (data ?? []) as Array<{
    id: string;
    handle: string;
    name: string;
    avatar_url: string | null;
    email: string;
    follower_count: number;
    is_admin: boolean;
    is_verified: boolean;
    is_featured: boolean;
    is_builder: boolean;
    is_public: boolean;
    created_at: string;
    project_count: number;
  }>;
}

/** Total builders matching the given filters (for pagination). */
export async function countBuilders(
  opts: { q?: string; tool?: string; skill?: string; availableOnly?: boolean } = {},
): Promise<number> {
  const supabase = await createClient();
  let query = supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("is_builder", true)
    .eq("is_public", true);
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

export type CommentAuthor = Pick<
  Profile,
  "handle" | "name" | "avatar_url" | "show_real_name"
>;
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
      "*, author:profiles!comments_author_id_fkey(handle,name,avatar_url,show_real_name)",
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

export function normalizeTag(label: string): string {
  return label.trim().toLowerCase().replace(/\s+/g, " ");
}

/** All visible browse-by tags (labels) for the marquee. */
export async function getBrowseTags(): Promise<string[]> {
  // `tags` isn't in the generated Supabase types yet (migration not applied),
  // so cast the client to `any` for this one query only.
  const supabase = (await createClient()) as unknown as {
    from: (t: string) => {
      select: (c: string) => {
        eq: (
          col: string,
          val: boolean,
        ) => {
          order: (
            col: string,
          ) => Promise<{ data: { label: string }[] | null }>;
        };
      };
    };
  };
  const { data } = await supabase
    .from("tags")
    .select("label")
    .eq("is_hidden", false)
    .order("label");
  return (data ?? []).map((t) => t.label as string);
}

/** The current user's own directory listing, if any. */
export async function getMyDirectoryListing() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("directory_listings")
    .select("id, status, category")
    .eq("submitted_by", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data ?? null;
}
