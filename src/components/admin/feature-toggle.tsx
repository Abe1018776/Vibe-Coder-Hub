"use client";

import { useTransition } from "react";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { setProjectFeatured } from "@/lib/actions/admin";
import { cn } from "@/lib/utils";

/**
 * Admin-only control to feature / unfeature a project. Renders nowhere unless
 * an admin places it (the project detail page gates it). Optimistic-free —
 * relies on revalidation from the server action.
 */
export function FeatureToggle({
  projectId,
  featured,
}: {
  projectId: string;
  featured: boolean;
}) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        start(async () => {
          try {
            await setProjectFeatured(projectId, !featured);
          } catch {
            toast.error("Couldn't update the featured state.");
          }
        })
      }
      className={cn("btn btn-sm", featured ? "btn-gold" : "btn-ghost", pending && "opacity-70")}
      aria-pressed={featured}
    >
      <Sparkles size={15} />
      {featured ? "Featured" : "Feature"}
    </button>
  );
}
