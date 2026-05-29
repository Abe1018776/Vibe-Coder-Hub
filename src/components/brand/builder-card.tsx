import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AvatarCircle } from "./avatar-circle";
import { ToolPill, Pill } from "./pill";
import { builderProjectCount, type BuilderListItem } from "@/lib/queries";

export function BuilderCard({ builder }: { builder: BuilderListItem }) {
  const count = builderProjectCount(builder);

  return (
    <Link
      href={`/u/${builder.handle}`}
      className="group flex flex-col rounded-card border border-border bg-surface p-5 transition-colors hover:border-border-hover"
    >
      <div className="flex items-center gap-3">
        <AvatarCircle
          name={builder.name}
          src={builder.avatar_url}
          size={48}
          accent="blue"
        />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="truncate font-medium text-ink">{builder.name}</p>
            {builder.available_for_hire && <Pill accent="sage">Available</Pill>}
          </div>
          <p className="truncate text-sm text-muted-foreground">
            @{builder.handle}
            {builder.location ? ` · ${builder.location}` : ""}
          </p>
        </div>
      </div>

      {builder.bio && (
        <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
          {builder.bio}
        </p>
      )}

      {builder.tools.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {builder.tools.slice(0, 4).map((t) => (
            <ToolPill key={t}>{t}</ToolPill>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
        <span className="text-xs text-muted-foreground">
          {count} {count === 1 ? "project" : "projects"}
        </span>
        <ArrowRight
          size={15}
          className="text-muted-foreground transition-transform group-hover:translate-x-0.5"
        />
      </div>
    </Link>
  );
}
