"use client";

import Link from "next/link";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { AvatarCircle } from "@/components/brand/avatar-circle";
import { signOut } from "@/lib/actions/auth";

type MenuProfile = { handle: string; name: string; avatar_url: string | null };

export function UserMenu({
  profile,
  isAdmin = false,
}: {
  profile: MenuProfile;
  isAdmin?: boolean;
}) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <AvatarCircle name={profile.name} src={profile.avatar_url} size={36} />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-50 min-w-56 rounded-xl border border-border bg-surface p-1.5 shadow-lg shadow-black/[0.06]"
        >
          <div className="px-2.5 py-2">
            <p className="truncate text-sm font-medium text-ink">{profile.name}</p>
            <p className="truncate text-xs text-muted-foreground">@{profile.handle}</p>
          </div>
          <DropdownMenu.Separator className="my-1 h-px bg-border" />
          <Item href="/dashboard">Dashboard</Item>
          <Item href={`/u/${profile.handle}`}>Your profile</Item>
          <Item href="/dashboard/saved">Saved</Item>
          <Item href="/dashboard/profile">Edit profile</Item>
          <Item href="/notifications">Notifications</Item>
          <Item href="/settings/notifications">Notification settings</Item>
          <Item href="/showcase/submit">Submit a project</Item>
          <Item href="/gigs/post">Post a gig</Item>
          {isAdmin && (
            <>
              <DropdownMenu.Separator className="my-1 h-px bg-border" />
              <Item href="/admin">Admin</Item>
            </>
          )}
          <DropdownMenu.Separator className="my-1 h-px bg-border" />
          <form action={signOut}>
            <DropdownMenu.Item asChild>
              <button
                type="submit"
                className="w-full cursor-pointer rounded-lg px-2.5 py-2 text-left text-sm text-ink outline-none hover:bg-secondary focus:bg-secondary"
              >
                Sign out
              </button>
            </DropdownMenu.Item>
          </form>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

function Item({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <DropdownMenu.Item asChild>
      <Link
        href={href}
        className="block rounded-lg px-2.5 py-2 text-sm text-ink outline-none hover:bg-secondary focus:bg-secondary"
      >
        {children}
      </Link>
    </DropdownMenu.Item>
  );
}
