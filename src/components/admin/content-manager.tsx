"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Sparkles,
  Eye,
  EyeOff,
  Trash2,
  Pencil,
  ExternalLink,
  Check,
  X,
} from "lucide-react";
import {
  setProjectFeatured,
  setProjectHidden,
  adminDeleteProject,
  deleteGig,
  deleteCompetition,
  deleteEvent,
  setCompetitionReviewStatus,
} from "@/lib/actions/admin";
import { setDirectoryListingStatus } from "@/lib/actions/directory";
import { cn } from "@/lib/utils";

export type ContentType =
  | "projects"
  | "gigs"
  | "competitions"
  | "events"
  | "directory";

export type ContentItem = {
  id: string;
  title: string;
  image?: string | null;
  owner?: string | null;
  meta?: string | null;
  href?: string;
  editHref?: string;
  hidden?: boolean;
  featured?: boolean;
  reviewStatus?: string;
};

const pillBase =
  "inline-flex h-8 items-center gap-1.5 rounded-[10px] px-3 text-xs font-medium transition-colors disabled:opacity-60";
const ghostPill = cn(
  pillBase,
  "border border-border bg-surface text-ink hover:bg-secondary",
);
const dangerPill = cn(pillBase, "bg-clay-mid text-white hover:bg-clay-deep");
const goldPill = cn(pillBase, "bg-gold-deep text-white hover:opacity-90");

export function ContentManager({
  type,
  items,
}: {
  type: ContentType;
  items: ContentItem[];
}) {
  if (items.length === 0) {
    return (
      <p className="rounded-card border border-dashed border-border bg-surface/60 px-4 py-10 text-center text-sm text-muted-foreground">
        Nothing here yet.
      </p>
    );
  }
  return (
    <ul className="space-y-2.5">
      {items.map((item) => (
        <Row key={item.id} type={type} item={item} />
      ))}
    </ul>
  );
}

function Row({ type, item }: { type: ContentType; item: ContentItem }) {
  const [pending, start] = useTransition();
  const [confirming, setConfirming] = useState(false);

  const run = (fn: () => Promise<unknown>, msg: string) =>
    start(async () => {
      try {
        await fn();
        toast.success(msg);
      } catch {
        toast.error("Something went wrong.");
      }
    });

  const initial = item.title?.trim()?.[0]?.toUpperCase() ?? "?";

  return (
    <li className="flex items-center gap-3 rounded-card border border-border bg-surface p-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-secondary text-sm font-bold text-muted-foreground">
        {item.image ? (
          <Image
            src={item.image}
            alt=""
            width={40}
            height={40}
            className="h-full w-full object-cover"
          />
        ) : (
          initial
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {item.href ? (
            <Link
              href={item.href}
              className="truncate font-medium text-ink hover:underline"
              dir="auto"
            >
              {item.title}
            </Link>
          ) : (
            <span className="truncate font-medium text-ink" dir="auto">
              {item.title}
            </span>
          )}
          {item.hidden && (
            <span className="shrink-0 rounded-full bg-clay-tint px-2 py-0.5 text-[11px] font-medium text-clay-deep">
              Hidden
            </span>
          )}
        </div>
        <p className="truncate text-xs text-muted-foreground">
          {[item.owner, item.meta].filter(Boolean).join(" · ") || "—"}
        </p>
      </div>

      <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
        {/* Projects */}
        {type === "projects" && (
          <>
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                run(
                  () => setProjectFeatured(item.id, !item.featured),
                  item.featured ? "Unfeatured" : "Featured",
                )
              }
              className={cn(item.featured ? goldPill : ghostPill)}
            >
              <Sparkles size={14} />
              {item.featured ? "Featured" : "Feature"}
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                run(
                  () => setProjectHidden(item.id, !item.hidden),
                  item.hidden ? "Unhidden" : "Hidden",
                )
              }
              className={ghostPill}
            >
              {item.hidden ? <Eye size={14} /> : <EyeOff size={14} />}
              {item.hidden ? "Unhide" : "Hide"}
            </button>
            {item.editHref && (
              <Link href={item.editHref} className={ghostPill}>
                <Pencil size={14} /> Edit
              </Link>
            )}
          </>
        )}

        {/* Gigs */}
        {type === "gigs" && item.href && (
          <Link href={item.href} className={ghostPill}>
            <ExternalLink size={14} /> View
          </Link>
        )}

        {/* Competitions */}
        {type === "competitions" && (
          <>
            <button
              type="button"
              disabled={pending || item.reviewStatus === "approved"}
              onClick={() =>
                run(
                  () => setCompetitionReviewStatus(item.id, "approved"),
                  "Approved",
                )
              }
              className={ghostPill}
            >
              <Check size={14} /> Approve
            </button>
            <button
              type="button"
              disabled={pending || item.reviewStatus === "rejected"}
              onClick={() =>
                run(
                  () => setCompetitionReviewStatus(item.id, "rejected"),
                  "Rejected",
                )
              }
              className={ghostPill}
            >
              <X size={14} /> Reject
            </button>
          </>
        )}

        {/* Directory */}
        {type === "directory" && (
          <>
            <button
              type="button"
              disabled={pending || item.reviewStatus === "approved"}
              onClick={() =>
                run(
                  () => setDirectoryListingStatus(item.id, "approved"),
                  "Approved",
                )
              }
              className={ghostPill}
            >
              <Check size={14} /> Approve
            </button>
            <button
              type="button"
              disabled={pending || item.reviewStatus === "rejected"}
              onClick={() =>
                run(
                  () => setDirectoryListingStatus(item.id, "rejected"),
                  "Rejected",
                )
              }
              className={ghostPill}
            >
              <X size={14} /> Reject
            </button>
          </>
        )}

        {/* Delete (inline two-click confirm) — projects, gigs, competitions, events */}
        {type !== "directory" && (
          confirming ? (
            <span className="inline-flex items-center gap-1.5">
              <button
                type="button"
                disabled={pending}
                onClick={() => run(() => deleteFor(type, item.id), "Deleted")}
                className={dangerPill}
              >
                <Trash2 size={14} /> Confirm
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => setConfirming(false)}
                className={ghostPill}
              >
                Cancel
              </button>
            </span>
          ) : (
            <button
              type="button"
              disabled={pending}
              onClick={() => setConfirming(true)}
              className={dangerPill}
            >
              <Trash2 size={14} /> Delete
            </button>
          )
        )}
      </div>
    </li>
  );
}

function deleteFor(type: ContentType, id: string): Promise<unknown> {
  switch (type) {
    case "projects":
      return adminDeleteProject(id);
    case "gigs":
      return deleteGig(id);
    case "competitions":
      return deleteCompetition(id);
    case "events":
      return deleteEvent(id);
    default:
      return Promise.resolve();
  }
}
