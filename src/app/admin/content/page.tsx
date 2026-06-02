import Link from "next/link";
import { Plus } from "lucide-react";
import { requireAdminUnlocked } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import { ContentManager, type ContentItem } from "@/components/admin/content-manager";

export const metadata = { title: "Content" };

const TABS = [
  { key: "projects", label: "Projects" },
  { key: "gigs", label: "Gigs" },
  { key: "competitions", label: "Competitions" },
  { key: "events", label: "Events" },
  { key: "directory", label: "Directory" },
] as const;

type Tab = (typeof TABS)[number]["key"];

function isTab(v: string | undefined): v is Tab {
  return TABS.some((t) => t.key === v);
}

const ownerName = (p: { name?: string | null; handle?: string | null } | null) =>
  p?.name || (p?.handle ? `@${p.handle}` : null);

async function loadItems(type: Tab): Promise<ContentItem[]> {
  const supabase = await createClient();

  if (type === "projects") {
    const { data } = await supabase
      .from("projects")
      .select(
        "id, name, image_url, hidden, featured, created_at, owner:profiles!projects_owner_id_fkey(name,handle)",
      )
      .order("created_at", { ascending: false })
      .limit(100);
    return (data ?? []).map((r: any) => ({
      id: r.id,
      title: r.name,
      image: r.image_url,
      owner: ownerName(r.owner),
      meta: r.featured ? "Featured" : null,
      hidden: r.hidden,
      featured: r.featured,
      editHref: `/showcase/${r.id}/edit`,
    }));
  }

  if (type === "gigs") {
    const { data } = await supabase
      .from("gigs")
      .select(
        "id, title, slug, status, created_at, poster:profiles!gigs_poster_id_fkey(name,handle)",
      )
      .order("created_at", { ascending: false })
      .limit(100);
    return (data ?? []).map((r: any) => ({
      id: r.id,
      title: r.title,
      owner: ownerName(r.poster),
      meta: r.status,
      href: `/gigs/${r.slug}`,
    }));
  }

  if (type === "competitions") {
    const { data } = await supabase
      .from("competitions")
      .select(
        "id, title, slug, review_status, prize_amount, created_at, creator:profiles!competitions_creator_id_fkey(name,handle)",
      )
      .order("created_at", { ascending: false })
      .limit(100);
    return (data ?? []).map((r: any) => ({
      id: r.id,
      title: r.title,
      owner: ownerName(r.creator),
      meta: `$${Number(r.prize_amount).toLocaleString()} · ${r.review_status}`,
      reviewStatus: r.review_status,
      href: `/competitions/${r.slug}`,
    }));
  }

  if (type === "events") {
    const { data } = await supabase
      .from("events")
      .select(
        "id, title, location, starts_at, created_at, creator:profiles!events_creator_id_fkey(name,handle)",
      )
      .order("created_at", { ascending: false })
      .limit(100);
    return (data ?? []).map((r: any) => ({
      id: r.id,
      title: r.title,
      owner: ownerName(r.creator),
      meta:
        [r.starts_at ? new Date(r.starts_at).toLocaleDateString() : null, r.location]
          .filter(Boolean)
          .join(" · ") || null,
    }));
  }

  // directory
  const { data } = await supabase
    .from("directory_listings")
    .select("id, name, category, status, created_at")
    .order("created_at", { ascending: false })
    .limit(100);
  return (data ?? []).map((r: any) => ({
    id: r.id,
    title: r.name,
    owner: r.category,
    meta: r.status,
    reviewStatus: r.status,
  }));
}

export default async function AdminContentPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  await requireAdminUnlocked();
  const { type: rawType } = await searchParams;
  const type: Tab = isTab(rawType) ? rawType : "projects";
  const items = await loadItems(type);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl text-ink">Content</h1>
        <Link href="/admin/content/post" className="btn btn-primary btn-sm">
          <Plus size={16} /> Post
        </Link>
      </div>

      <div className="mt-5 flex flex-wrap gap-1.5">
        {TABS.map((t) => {
          const active = t.key === type;
          return (
            <Link
              key={t.key}
              href={`/admin/content?type=${t.key}`}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
                active
                  ? "bg-teal-600 text-white"
                  : "border border-border text-muted-foreground hover:bg-secondary",
              )}
            >
              {t.label}
            </Link>
          );
        })}
      </div>

      <p className="mt-4 text-sm text-muted-foreground">
        {items.length} {items.length === 1 ? "item" : "items"}.
      </p>

      <div className="mt-3">
        <ContentManager type={type} items={items} />
      </div>
    </div>
  );
}
