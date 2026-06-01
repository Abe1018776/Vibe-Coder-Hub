import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/types";

export type NotificationActor = Pick<
  Tables<"profiles">,
  "handle" | "name" | "avatar_url"
>;
export type NotificationRow = Tables<"notifications"> & {
  actor: NotificationActor | null;
};

const SELECT =
  "*, actor:profiles!notifications_actor_id_fkey(handle,name,avatar_url)";

export async function getNotifications(limit = 30): Promise<NotificationRow[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase
    .from("notifications")
    .select(SELECT)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data as NotificationRow[] | null) ?? [];
}

export async function getUnreadCount(): Promise<number> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return 0;
  const { count } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .is("read_at", null);
  return count ?? 0;
}

/** Recent items + unread count for the header bell, in one place. */
export async function getNotificationSummary(): Promise<{
  items: NotificationRow[];
  unread: number;
}> {
  const [items, unread] = await Promise.all([
    getNotifications(8),
    getUnreadCount(),
  ]);
  return { items, unread };
}

/** Map a notification to display text + a destination link. */
export function describeNotification(n: NotificationRow): {
  text: string;
  href: string;
} {
  const who = n.actor?.name ?? "Someone";
  const d = (n.data ?? {}) as Record<string, string | undefined>;
  const project = n.entity_id ? `/showcase/${n.entity_id}` : "/notifications";
  const thread =
    d.slug && d.thread_id ? `/gigs/${d.slug}/thread/${d.thread_id}` : "/gigs";

  switch (n.type) {
    case "upvote":
      return { text: `${who} upvoted ${d.project_name ?? "your project"}`, href: project };
    case "comment":
      return { text: `${who} commented on ${d.project_name ?? "your project"}`, href: project };
    case "follow_post":
      return { text: `${who} posted ${d.project_name ?? "a new project"}`, href: project };
    case "interest": {
      const k = d.kind && d.kind !== "general" ? ` (${d.kind})` : "";
      return {
        text: `${who} is interested${k} in ${d.project_name ?? "your project"}`,
        href: project,
      };
    }
    case "gig_application":
      return { text: `${who} applied to ${d.gig_title ?? "your gig"}`, href: thread };
    case "message":
      return { text: `${who} messaged you about ${d.gig_title ?? "a gig"}`, href: thread };
    case "competition_winner":
      return {
        text: `You won ${d.title ?? "a competition"}!`,
        href: d.slug ? `/competitions/${d.slug}` : "/competitions",
      };
    case "content_removed":
      return { text: d.message ?? "An admin removed your content.", href: "/notifications" };
    case "report_update":
      return { text: d.message ?? "Your report was reviewed.", href: "/notifications" };
    case "private_reply":
      return {
        text: `${who} sent you a private note`,
        href: n.entity_id ? `/dashboard/inbox/${n.entity_id}` : "/dashboard/inbox",
      };
    default:
      return { text: "New notification", href: "/notifications" };
  }
}
