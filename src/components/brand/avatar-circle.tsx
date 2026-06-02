import { cn } from "@/lib/utils";
import { type Accent, ACCENT_AVATAR, accentFor } from "@/lib/site";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 1).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

/**
 * Circular avatar. Shows the photo when present, otherwise initials on a
 * stable section-accent fill. Uses a plain img (user/Google/storage URLs).
 */
export function AvatarCircle({
  name,
  src,
  size = 40,
  accent,
  className,
}: {
  name: string;
  src?: string | null;
  size?: number;
  accent?: Accent;
  className?: string;
}) {
  const fill = ACCENT_AVATAR[accent ?? accentFor(name)];
  const fontSize = Math.round(size * 0.4);

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-medium",
        fill,
        className,
      )}
      style={{ width: size, height: size, fontSize }}
      aria-hidden={false}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={name}
          width={size}
          height={size}
          className="h-full w-full object-cover"
          referrerPolicy="no-referrer"
        />
      ) : (
        <span>{initials(name)}</span>
      )}
    </span>
  );
}
