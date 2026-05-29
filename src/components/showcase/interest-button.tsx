"use client";

import { useState, useTransition } from "react";
import { Sparkles, Check } from "lucide-react";
import { toast } from "sonner";
import { expressInterest } from "@/lib/actions/notifications";

/**
 * "I'm interested" ping for commercial projects. Records the interest (the DB
 * trigger notifies the owner), then nudges the viewer toward the contact links.
 */
export function InterestButton({ projectId }: { projectId: string }) {
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);

  return (
    <button
      type="button"
      disabled={pending || done}
      onClick={() =>
        startTransition(async () => {
          const res = await expressInterest(projectId, "general");
          if (res.error) {
            toast.error(res.error);
            return;
          }
          setDone(true);
          toast.success("The builder has been notified you're interested.");
        })
      }
      className="inline-flex h-9 items-center gap-1.5 rounded-[10px] border border-border bg-surface px-4 text-sm font-medium text-ink transition-colors hover:bg-secondary disabled:opacity-70"
    >
      {done ? (
        <>
          <Check size={15} /> Interest sent
        </>
      ) : (
        <>
          <Sparkles size={15} /> {pending ? "Sending…" : "I'm interested"}
        </>
      )}
    </button>
  );
}
