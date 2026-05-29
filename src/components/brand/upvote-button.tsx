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
  topRanked = false,
  redirectTo = "/showcase",
}: {
  projectId: string;
  initialCount: number;
  initialUpvoted: boolean;
  isAuthed: boolean;
  topRanked?: boolean;
  redirectTo?: string;
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
      className={cn(
        "inline-flex shrink-0 flex-col items-center justify-center rounded-[10px] border px-2.5 py-1 leading-none transition-colors",
        state.upvoted
          ? "border-teal-600 bg-teal-50 text-teal-800"
          : topRanked
            ? "border-teal-600/50 bg-surface text-ink hover:bg-teal-50"
            : "border-border bg-surface text-ink hover:border-border-hover",
        isPending && "opacity-70",
      )}
    >
      <ChevronUp
        size={16}
        className={cn(state.upvoted ? "text-teal-600" : "text-muted-foreground")}
      />
      <span className="mt-0.5 text-xs font-medium tabular-nums">
        {state.count}
      </span>
    </button>
  );
}
