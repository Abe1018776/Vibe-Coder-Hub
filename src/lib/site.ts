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
