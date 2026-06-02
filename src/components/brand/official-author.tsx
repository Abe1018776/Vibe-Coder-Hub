import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Author byline for content posted by the platform itself ("Official YidVibe").
 * Shown INSTEAD of an owner's name/avatar when `posted_as_official` is true.
 * Brand teal badge, lucide BadgeCheck.
 */
export function OfficialAuthor({
  size = "sm",
  className,
}: {
  size?: "sm" | "md";
  className?: string;
}) {
  const icon = size === "md" ? 18 : 15;
  const dot = size === "md" ? "h-10 w-10" : "h-6 w-6";
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700",
          dot,
        )}
      >
        <BadgeCheck size={icon} />
      </span>
      <span className="inline-flex items-center gap-1 font-medium text-ink">
        YidVibe
        <BadgeCheck size={14} className="text-teal-600" />
      </span>
    </span>
  );
}
