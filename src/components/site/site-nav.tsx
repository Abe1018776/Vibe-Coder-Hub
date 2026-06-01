import Link from "next/link";
import { getCurrentProfile } from "@/lib/current-user";
import { getAdminContext } from "@/lib/admin";
import {
  getNotificationSummary,
  describeNotification,
} from "@/lib/notifications";
import { Container } from "@/components/brand/layout";
import { Logo } from "./logo";
import { NavLinks } from "./nav-links";
import { NavShell } from "./nav-shell";
import { UserMenu } from "./user-menu";
import { MobileBottomNav } from "./mobile-bottom-nav";
import { NotificationBell, type BellItem } from "./notification-bell";
import { PostMenu } from "./post-menu";

export async function SiteNav() {
  const profile = await getCurrentProfile();

  const admin = profile ? await getAdminContext() : null;

  let bellItems: BellItem[] = [];
  let unread = 0;
  if (profile) {
    const summary = await getNotificationSummary();
    unread = summary.unread;
    bellItems = summary.items.map((n) => {
      const { text, href } = describeNotification(n);
      return {
        id: n.id,
        text,
        href,
        read: n.read_at != null,
        createdAt: n.created_at,
        actorName: n.actor?.name ?? null,
        actorAvatar: n.actor?.avatar_url ?? null,
      };
    });
  }

  return (
    <>
      <NavShell>
        <Container className="flex h-16 items-center gap-4">
          <Logo />
          <div className="hidden flex-1 lg:block">
            <NavLinks />
          </div>
          <div className="ml-auto flex items-center gap-1.5 sm:gap-2 lg:gap-3">
            {profile && <NotificationBell items={bellItems} unread={unread} />}
            <div className="hidden lg:block">
              <PostMenu />
            </div>
            {profile ? (
              <UserMenu
                profile={{
                  handle: profile.handle,
                  name: profile.name,
                  avatar_url: profile.avatar_url,
                }}
                isAdmin={!!admin}
              />
            ) : (
              <Link href="/login" className="btn btn-ghost btn-sm">
                Sign in
              </Link>
            )}
          </div>
        </Container>
      </NavShell>

      <MobileBottomNav />
    </>
  );
}
