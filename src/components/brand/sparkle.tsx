/**
 * Brand sparkle — a soft rounded 4-point star used as the YidVibe accent motif.
 * Defaults to the amber-gold spark; pass `color` for context (e.g. teal on tints).
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
      viewBox="-12 -12 24 24"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <path
        d="M0 -10 C1.6 -10 1.2 -4.5 2.8 -2.8 C4.5 -1.2 10 -1.6 10 0 C10 1.6 4.5 1.2 2.8 2.8 C1.2 4.5 1.6 10 0 10 C-1.6 10 -1.2 4.5 -2.8 2.8 C-4.5 1.2 -10 1.6 -10 0 C-10 -1.6 -4.5 -1.2 -2.8 -2.8 C-1.2 -4.5 -1.6 -10 0 -10 Z"
        fill={color}
      />
    </svg>
  );
}

/**
 * YidVibe figure mark — two crossing rounded strokes (a raised-arms "Y") topped
 * with the brand sparkle. Scales cleanly; stroke + spark colors are themeable.
 */
export function LogoMark({
  size = 30,
  stroke = "var(--teal-600)",
  spark = "var(--gold-500)",
  className,
}: {
  size?: number;
  stroke?: string;
  spark?: string;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <g stroke={stroke} strokeWidth="10.5" strokeLinecap="round" fill="none">
        <path d="M24 24 C34 38, 45 51, 50 61 C53 69, 56 81, 59 92" />
        <path d="M76 24 C66 38, 55 51, 50 61 C47 69, 44 81, 41 92" />
      </g>
      <g transform="translate(50 13) scale(0.6)">
        <path
          d="M0 -10 C1.6 -10 1.2 -4.5 2.8 -2.8 C4.5 -1.2 10 -1.6 10 0 C10 1.6 4.5 1.2 2.8 2.8 C1.2 4.5 1.6 10 0 10 C-1.6 10 -1.2 4.5 -2.8 2.8 C-4.5 1.2 -10 1.6 -10 0 C-10 -1.6 -4.5 -1.2 -2.8 -2.8 C-1.2 -4.5 -1.6 -10 0 -10 Z"
          fill={spark}
        />
      </g>
    </svg>
  );
}
