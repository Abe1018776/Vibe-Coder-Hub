import { cn } from "@/lib/utils";

/** The YidVibe brand star path (4-point rounded sparkle), drawn in a 0..134 box. */
const STAR_PATH =
  "M 68.503906 1.90625 L 76.96875 47.625 C 77.875 52.511719 81.695312 56.332031 86.582031 57.238281 L 132.300781 65.703125 C 133.027344 65.839844 133.550781 66.46875 133.550781 67.207031 C 133.550781 67.941406 133.027344 68.574219 132.300781 68.707031 L 86.582031 77.175781 C 81.695312 78.082031 77.875 81.902344 76.96875 86.789062 L 68.503906 132.507812 C 68.367188 133.234375 67.738281 133.757812 67 133.757812 C 66.261719 133.757812 65.632812 133.234375 65.496094 132.507812 L 57.03125 86.789062 C 56.125 81.902344 52.304688 78.082031 47.417969 77.175781 L 1.699219 68.707031 C 0.972656 68.574219 0.449219 67.941406 0.449219 67.207031 C 0.449219 66.46875 0.972656 65.839844 1.699219 65.703125 L 47.417969 57.238281 C 52.304688 56.332031 56.125 52.511719 57.03125 47.625 L 65.496094 1.90625 C 65.632812 1.179688 66.261719 0.65625 67 0.65625 C 67.738281 0.65625 68.367188 1.179688 68.503906 1.90625 Z M 68.503906 1.90625 ";

/**
 * Brand sparkle — the YidVibe star motif. Defaults to amber-gold; pass `color`
 * to recolor it for context (e.g. teal on a tint).
 */
export function Sparkle({
  size = 16,
  color = "var(--gold-500)",
  className,
  style,
}: {
  size?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 134 134"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <path d={STAR_PATH} fill={color} />
    </svg>
  );
}

/**
 * The full YidVibe logo mark (crossing strokes + star) — served from
 * /public/brand/logo.svg so its teal/gold/white colors stay intact.
 */
export function LogoMark({
  size = 32,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/brand/logo.svg"
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      className={cn("w-auto shrink-0", className)}
      style={{ height: size }}
    />
  );
}
