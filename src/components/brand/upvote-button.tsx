"use client";

import { useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { toggleUpvote } from "@/lib/actions/upvotes";
import { cn } from "@/lib/utils";

export function UpvoteButton({
  projectId,
  initialCount,
  initialUpvoted,
  isAuthed,
  redirectTo = "/showcase",
  className,
}: {
  projectId: string;
  initialCount: number;
  initialUpvoted: boolean;
  isAuthed: boolean;
  /** kept for call-site compatibility; styling now lives in the .upvote class */
  topRanked?: boolean;
  redirectTo?: string;
  className?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [state, applyOptimistic] = useOptimistic(
    { count: initialCount, upvoted: initialUpvoted },
    (s, next: boolean) => ({
      count: Math.max(0, s.count + (next ? 1 : -1)),
      upvoted: next,
    }),
  );

  function onClick() {
    if (!isAuthed) {
      router.push(`/login?next=${encodeURIComponent(redirectTo)}`);
      return;
    }
    const next = !state.upvoted;
    startTransition(async () => {
      applyOptimistic(next);
      const res = await toggleUpvote(projectId);
      if (!res.ok) {
        if (res.error === "auth")
          router.push(`/login?next=${encodeURIComponent(redirectTo)}`);
        else toast.error("Couldn't register your vote. Please try again.");
      }
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isPending}
      aria-pressed={state.upvoted}
      aria-label={state.upvoted ? "Remove upvote" : "Upvote"}
      className={cn("upvote shrink-0", className)}
    >
      <ChevronUp size={16} strokeWidth={2.4} />
      <span className="tabular-nums">{state.count}</span>
    </button>
  );
}
