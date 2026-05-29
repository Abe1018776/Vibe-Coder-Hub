export const SITE_NAME = "YidVibe";
export const SITE_TAGLINE = "Marketplace for AI builders";

/** Warm accent shelf — one accent per section (see BRAND.md). */
export type Accent = "teal" | "blue" | "orange" | "clay" | "sage" | "gold";

/** Primary nav (BRAND order). UI chrome stays English/LTR. */
export const NAV_LINKS: { href: string; label: string }[] = [
  { href: "/showcase", label: "Showcase" },
  { href: "/builders", label: "Builders" },
  { href: "/directory", label: "Directory" },
  { href: "/competitions", label: "Competitions" },
];

export const FOOTER_LINKS: { href: string; label: string }[] = [
  { href: "/showcase", label: "Showcase" },
  { href: "/builders", label: "Builders" },
  { href: "/directory", label: "Directory" },
  { href: "/gigs", label: "Gigs" },
  { href: "/competitions", label: "Competitions" },
  { href: "/events", label: "Events" },
  { href: "/docs", label: "How it works" },
];

/** Curated AI tools offered as quick-pick chips on the profile form. */
export const KNOWN_TOOLS = [
  "Claude",
  "Cursor",
  "Lovable",
  "Replit",
  "v0",
  "Bolt",
  "Base44",
  "ChatGPT",
  "Windsurf",
  "GitHub Copilot",
  "Gemini",
];

/**
 * Curated "what it's about" topic tags — suggestions only; users can add their own.
 * These render in the teal TagPill family, distinct from the blue tool pills.
 */
export const KNOWN_TAGS = [
  "Community",
  "Education",
  "Finance",
  "Productivity",
  "Developer Tools",
  "AI",
  "Automation",
  "SaaS",
  "Marketplace",
  "Directory",
  "Finder",
  "Safety",
  "Civic Tech",
  "Map",
  "Health",
  "Events",
  "Design",
  "Social",
  "Content",
  "Games",
];

/** Notification types the user can toggle in settings (default: all on). */
export const NOTIFICATION_TYPES: {
  key: string;
  label: string;
  description: string;
}[] = [
  { key: "comment", label: "Comments", description: "Someone comments on your project." },
  { key: "upvote", label: "Upvotes", description: "Someone upvotes your project." },
  { key: "interest", label: "Commercial interest", description: "Someone is interested in funding, buying, or partnering." },
  { key: "gig_application", label: "Gig applications", description: "Someone applies to a gig you posted." },
  { key: "message", label: "Messages", description: "A new message in one of your gig threads." },
  { key: "competition_winner", label: "Competition wins", description: "You're picked as a competition winner." },
];

/** Project-level commercial intents → badge label + accent. All optional. */
export const PROJECT_COMMERCIAL: {
  key: "seeking_funding" | "for_sale" | "open_to_partners";
  label: string;
  accent: Accent;
}[] = [
  { key: "seeking_funding", label: "Seeking funding", accent: "gold" },
  { key: "for_sale", label: "For sale", accent: "blue" },
  { key: "open_to_partners", label: "Open to partners", accent: "teal" },
];

/** Public contact channels stored in profiles.links (user chooses what to fill). */
export const CONTACT_KEYS = [
  "email",
  "phone",
  "whatsapp",
  "instagram",
  "website",
  "github",
  "x",
  "linkedin",
] as const;
export type ContactKey = (typeof CONTACT_KEYS)[number];

/** True when a profile exposes at least one way to be reached. */
export function hasAnyContact(
  links: Record<string, string | undefined> | null | undefined,
): boolean {
  if (!links) return false;
  return CONTACT_KEYS.some((k) => !!(links[k] && String(links[k]).trim()));
}

/** Build a clickable href for a stored contact value. */
export function contactHref(key: ContactKey, value: string): string {
  const v = value.trim();
  switch (key) {
    case "email":
      return `mailto:${v}`;
    case "phone":
      return `tel:${v.replace(/[^\d+]/g, "")}`;
    case "whatsapp":
      return `https://wa.me/${v.replace(/[^\d]/g, "")}`;
    case "instagram":
      return /^https?:\/\//i.test(v)
        ? v
        : `https://instagram.com/${v.replace(/^@/, "")}`;
    default:
      return /^https?:\/\//i.test(v) ? v : `https://${v}`;
  }
}

/** tint background + deep-stop text — the BRAND pill pattern. */
export const ACCENT_PILL: Record<Accent, string> = {
  teal: "bg-teal-50 text-teal-800",
  blue: "bg-blue-tint text-blue-deep",
  orange: "bg-orange-tint text-orange-deep",
  clay: "bg-clay-tint text-clay-deep",
  sage: "bg-sage-tint text-sage-deep",
  gold: "bg-gold-tint text-gold-deep",
};

/** Solid-ish avatar/initials fill per accent. */
export const ACCENT_AVATAR: Record<Accent, string> = {
  teal: "bg-teal-100 text-teal-800",
  blue: "bg-blue-tint text-blue-deep",
  orange: "bg-orange-tint text-orange-deep",
  clay: "bg-clay-tint text-clay-deep",
  sage: "bg-sage-tint text-sage-deep",
  gold: "bg-gold-tint text-gold-deep",
};

/** Stable accent pick from a string (so a builder keeps the same avatar color). */
export function accentFor(seed: string): Accent {
  const accents: Accent[] = ["teal", "blue", "orange", "clay", "sage", "gold"];
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return accents[h % accents.length];
}
