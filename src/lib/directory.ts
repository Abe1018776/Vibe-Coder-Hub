import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/types";

export type DirectoryListing = Tables<"directory_listings">;

/** PostgREST `.or()` uses commas/parens as syntax; strip them from user input. */
function sanitize(term: string): string {
  return term.replace(/[%,()*\\]/g, " ").trim();
}

export async function listDirectoryListings(
  opts: { q?: string; category?: string; page?: number; perPage?: number } = {},
): Promise<DirectoryListing[]> {
  const supabase = await createClient();
  let query = supabase
    .from("directory_listings")
    .select("*")
    .eq("status", "approved");
  if (opts.q) {
    const s = sanitize(opts.q);
    if (s) query = query.or(`name.ilike.%${s}%,what_you_do.ilike.%${s}%`);
  }
  if (opts.category) query = query.eq("category", opts.category);
  query = query.order("created_at", { ascending: false });
  if (opts.page && opts.perPage) {
    const from = (opts.page - 1) * opts.perPage;
    query = query.range(from, from + opts.perPage - 1);
  }
  const { data } = await query;
  return (data as DirectoryListing[] | null) ?? [];
}

export async function countDirectoryListings(
  opts: { q?: string; category?: string } = {},
): Promise<number> {
  const supabase = await createClient();
  let query = supabase
    .from("directory_listings")
    .select("id", { count: "exact", head: true })
    .eq("status", "approved");
  if (opts.q) {
    const s = sanitize(opts.q);
    if (s) query = query.or(`name.ilike.%${s}%,what_you_do.ilike.%${s}%`);
  }
  if (opts.category) query = query.eq("category", opts.category);
  const { count } = await query;
  return count ?? 0;
}
