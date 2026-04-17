interface Props {
  email: string;
  name?: string | null;
  size?: number;
  className?: string;
}

const PALETTE = [
  { bg: "rgba(59,130,246,0.15)", color: "#60a5fa" },   // blue
  { bg: "rgba(139,92,246,0.15)", color: "#a78bfa" },   // violet
  { bg: "rgba(16,185,129,0.15)", color: "#34d399" },   // green
  { bg: "rgba(245,158,11,0.15)", color: "#fbbf24" },   // amber
  { bg: "rgba(34,211,238,0.15)", color: "#22d3ee" },   // cyan
  { bg: "rgba(244,114,182,0.15)", color: "#f472b6" },  // pink
];

function hash(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h << 5) - h + str.charCodeAt(i);
  return Math.abs(h);
}

export function Avatar({ email, name, size = 32, className }: Props) {
  const seed = (email || name || "?").toLowerCase();
  const palette = PALETTE[hash(seed) % PALETTE.length];
  const initials = (name?.trim()?.[0] || email?.[0] || "?").toUpperCase();

  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: palette.bg,
        color: palette.color,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Syne, system-ui, sans-serif",
        fontWeight: 600,
        fontSize: Math.round(size * 0.42),
        flexShrink: 0,
        border: `1px solid ${palette.bg}`,
      }}
    >
      {initials}
    </div>
  );
}
