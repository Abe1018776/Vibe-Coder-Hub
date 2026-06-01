"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { toggleSave } from "@/lib/actions/saves";
import { cn } from "@/lib/utils";

/**
 * Private "save / star" toggle. `overlay` floats over a card cover; `inline`
 * is a bordered icon button for detail pages. Stops propagation so it never
 * triggers the surrounding card link.
 */
export function SaveButton({
  projectId,
  initialSaved,
  isAuthed,
  redirectTo = "/showcase",
  variant = "overlay",
  className,
}: {
  projectId: string;
  initialSaved: boolean;
  isAuthed: boolean;
  redirectTo?: string;
  variant?: "overlay" | "inline";
  className?: string;
}) {
  const router = useRouter();
  const [saved, setSaved] = useState(initialSaved);
  const [, startTransition] = useTransition();

  function onClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthed) {
      router.push(`/login?next=${encodeURIComponent(redirectTo)}`);
      return;
    }
    const next = !saved;
    setSaved(next);
    startTransition(async () => {
      const res = await toggleSave(projectId);
      if (!res.ok) {
        setSaved(!next);
        if (res.error === "auth")
          router.push(`/login?next=${encodeURIComponent(redirectTo)}`);
        else toast.error("Couldn't update your saved list.");
      } else {
        router.refresh();
      }
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={saved}
      aria-label={saved ? "Remove from saved" : "Save"}
      title={saved ? "Saved" : "Save"}
      className={cn(
        "transition-colors",
        variant === "overlay"
          ? "grid h-9 w-9 place-items-center rounded-full bg-surface/90 text-muted-foreground shadow-[var(--shadow-sm)] backdrop-blur hover:text-amber-500"
          : "icon-btn hover:text-amber-500",
        saved && "text-amber-500",
        className,
      )}
    >
      <Star
        size={17}
        className={cn("transition-transform", saved && "scale-110")}
        fill={saved ? "currentColor" : "none"}
      />
    </button>
  );
}
