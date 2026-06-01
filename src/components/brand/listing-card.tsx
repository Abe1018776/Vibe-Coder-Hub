import { Mail, Phone, Globe } from "lucide-react";
import { contactHref } from "@/lib/site";
import { AvatarCircle } from "./avatar-circle";
import { Pill } from "./pill";
import type { DirectoryListing } from "@/lib/directory";

export function ListingCard({ listing }: { listing: DirectoryListing }) {
  const c = (listing.contact ?? {}) as Record<string, string | undefined>;
  return (
    <div className="flex flex-col rounded-2xl border border-border bg-surface p-5 transition-all hover:border-border-hover hover:shadow-[var(--shadow-sm)]">
      <div className="flex items-center gap-3">
        <AvatarCircle
          name={listing.name}
          src={listing.logo_url}
          size={44}
          accent="sage"
        />
        <div className="min-w-0">
          <p className="truncate font-display font-bold text-ink">{listing.name}</p>
          <Pill accent="sage">{listing.category}</Pill>
        </div>
      </div>

      <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">
        {listing.what_you_do}
      </p>
      {listing.wants && (
        <p className="mt-2 line-clamp-2 text-sm text-ink/80">
          <span className="font-medium">Looking for:</span> {listing.wants}
        </p>
      )}

      {(c.email || c.phone || c.website) && (
        <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-3">
          {c.email && (
            <a href={contactHref("email", c.email)} className="btn btn-ghost btn-sm">
              <Mail size={14} /> Email
            </a>
          )}
          {c.phone && (
            <a href={contactHref("phone", c.phone)} className="btn btn-ghost btn-sm">
              <Phone size={14} /> Call
            </a>
          )}
          {c.website && (
            <a
              href={c.website}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost btn-sm"
            >
              <Globe size={14} /> Website
            </a>
          )}
        </div>
      )}
    </div>
  );
}
