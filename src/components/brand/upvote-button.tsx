"use client";

import { useOptimistic, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { toggleUpvote } from "@/lib/actions/upvotes";
import { cn } from "@/lib/utils";

/** Sparkle burst that fires once the teal "bottle fill" reaches the top. */
const SPARKS = [
  { dx: "-20px", dy: "-16px" },
  { dx: "20px", dy: "-18px" },
  { dx: "0px", dy: "-26px" },
  { dx: "-14px", dy: "10px" },
  { dx: "16px", dy: "9px" },
];

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
  const [burst, setBurst] = useState(0);
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
      if (next) setBurst((b) => b + 1); // animate only when voting up
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
      <span className="upvote-fill" aria-hidden />
      <ChevronUp size={16} strokeWidth={2.4} />
      <span className="upvote-num tabular-nums">{state.count}</span>
      {burst > 0 && (
        <span key={burst} className="upvote-sparkles" aria-hidden>
          {SPARKS.map((s, i) => (
            <span
              key={i}
              className="upvote-spark"
              style={{ "--dx": s.dx, "--dy": s.dy } as React.CSSProperties}
            />
          ))}
        </span>
      )}
    </button>
  );
}
