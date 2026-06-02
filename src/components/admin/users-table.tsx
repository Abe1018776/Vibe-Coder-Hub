"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  BadgeCheck,
  Shield,
  Star,
  MoreHorizontal,
  ExternalLink,
  FileText,
  EyeOff,
  Eye,
  Trash2,
} from "lucide-react";
import { AvatarCircle } from "@/components/brand/avatar-circle";
import { setUserFlag, setUserPublic } from "@/lib/actions/admin";
import { cn } from "@/lib/utils";

type AdminUser = {
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
};

function shortDate(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function TogglePill({
  active,
  pending,
  tone,
  label,
  onClick,
}: {
  active: boolean;
  pending: boolean;
  tone: "gold" | "teal" | "dark";
  label: string;
  onClick: () => void;
}) {
  const activeTone =
    tone === "gold"
      ? "border-transparent bg-gold-mid text-gold-900"
      : tone === "teal"
        ? "border-transparent bg-teal-600 text-white"
        : "border-transparent bg-ink text-white";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      aria-pressed={active}
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-60",
        active
          ? activeTone
          : "border-border bg-surface text-muted-foreground hover:border-border-hover hover:text-ink",
      )}
    >
      {label}
    </button>
  );
}

function UserRow({ user }: { user: AdminUser }) {
  // Optimistic local mirror so toggles feel instant; revalidatePath re-syncs on refresh.
  const [verified, setVerified] = useState(user.is_verified);
  const [featured, setFeatured] = useState(user.is_featured);
  const [admin, setAdmin] = useState(user.is_admin);
  const [isPublic, setIsPublic] = useState(user.is_public);
  const [pending, startTransition] = useTransition();

  function toggleVerified() {
    const next = !verified;
    setVerified(next);
    startTransition(() => {
      setUserFlag(user.id, "is_verified", next);
    });
  }
  function toggleFeatured() {
    const next = !featured;
    setFeatured(next);
    startTransition(() => {
      setUserFlag(user.id, "is_featured", next);
    });
  }
  function toggleAdmin() {
    const next = !admin;
    setAdmin(next);
    startTransition(() => {
      setUserFlag(user.id, "is_admin", next);
    });
  }
  function togglePublic() {
    const next = !isPublic;
    setIsPublic(next);
    startTransition(() => {
      setUserPublic(user.id, next);
    });
  }

  return (
    <tr className="border-t border-border align-middle">
      <td className="px-3 py-3">
        <div className="flex items-center gap-3">
          <AvatarCircle name={user.name} src={user.avatar_url} size={32} />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="truncate font-medium text-ink">{user.name}</span>
              {verified && (
                <BadgeCheck
                  size={15}
                  className="shrink-0 text-gold-mid"
                  aria-label="Verified"
                />
              )}
              {admin && (
                <Shield
                  size={14}
                  className="shrink-0 text-ink"
                  aria-label="Admin"
                />
              )}
              {featured && (
                <Star
                  size={14}
                  className="shrink-0 text-teal-600"
                  aria-label="Featured"
                />
              )}
            </div>
            <div className="truncate text-xs text-muted-foreground">
              @{user.handle}
              {!isPublic && " · private"}
            </div>
          </div>
        </div>
      </td>
      <td className="px-3 py-3 text-sm text-muted-foreground">
        <span className="block max-w-[200px] truncate" title={user.email}>
          {user.email || "—"}
        </span>
      </td>
      <td className="px-3 py-3 text-sm tabular-nums text-ink">
        {user.follower_count}
      </td>
      <td className="px-3 py-3 text-sm tabular-nums text-ink">
        {user.project_count}
      </td>
      <td className="whitespace-nowrap px-3 py-3 text-sm text-muted-foreground">
        {shortDate(user.created_at)}
      </td>
      <td className="px-3 py-3">
        <div className="flex items-center justify-end gap-1.5">
          <TogglePill
            active={verified}
            pending={pending}
            tone="gold"
            label="Verify"
            onClick={toggleVerified}
          />
          <TogglePill
            active={featured}
            pending={pending}
            tone="teal"
            label="Feature"
            onClick={toggleFeatured}
          />
          <TogglePill
            active={admin}
            pending={pending}
            tone="dark"
            label="Admin"
            onClick={toggleAdmin}
          />

          <DropdownMenu.Root>
            <DropdownMenu.Trigger
              aria-label="More actions"
              className="inline-flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground/70 outline-none transition-colors hover:bg-secondary hover:text-ink focus-visible:ring-2 focus-visible:ring-ring"
            >
              <MoreHorizontal size={16} />
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                align="end"
                sideOffset={6}
                className="z-50 min-w-48 rounded-xl border border-border bg-surface p-1.5 shadow-float"
              >
                <DropdownMenu.Item asChild>
                  <Link
                    href={`/u/${user.handle}`}
                    className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-ink outline-none transition-colors hover:bg-secondary focus:bg-secondary"
                  >
                    <ExternalLink size={15} /> View profile
                  </Link>
                </DropdownMenu.Item>
                <DropdownMenu.Item asChild>
                  <Link
                    href={`/u/${user.handle}`}
                    className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-ink outline-none transition-colors hover:bg-secondary focus:bg-secondary"
                  >
                    <FileText size={15} /> View posts
                  </Link>
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  onSelect={(e) => {
                    e.preventDefault();
                    togglePublic();
                  }}
                  className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-ink outline-none transition-colors hover:bg-secondary focus:bg-secondary"
                >
                  {isPublic ? (
                    <>
                      <EyeOff size={15} /> Make private
                    </>
                  ) : (
                    <>
                      <Eye size={15} /> Make public
                    </>
                  )}
                </DropdownMenu.Item>
                <DropdownMenu.Separator className="my-1 h-px bg-border" />
                <DropdownMenu.Item
                  disabled
                  title="Needs service-role key"
                  className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-muted-foreground/60 outline-none data-[disabled]:cursor-not-allowed"
                >
                  <Trash2 size={15} /> Remove user
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </td>
    </tr>
  );
}

export function UsersTable({ users }: { users: AdminUser[] }) {
  if (users.length === 0) {
    return (
      <p className="mt-6 rounded-card border border-border bg-surface px-4 py-10 text-center text-sm text-muted-foreground">
        No users match this view.
      </p>
    );
  }

  return (
    <div className="mt-5 overflow-x-auto rounded-card border border-border bg-surface">
      <table className="w-full min-w-[760px] text-left">
        <thead>
          <tr className="text-xs uppercase tracking-wide text-muted-foreground">
            <th className="px-3 py-2.5 font-medium">User</th>
            <th className="px-3 py-2.5 font-medium">Email</th>
            <th className="px-3 py-2.5 font-medium">Followers</th>
            <th className="px-3 py-2.5 font-medium">Projects</th>
            <th className="px-3 py-2.5 font-medium">Joined</th>
            <th className="px-3 py-2.5 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <UserRow key={u.id} user={u} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
