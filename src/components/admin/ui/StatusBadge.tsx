import { cn } from "@/lib/utils";

export type AdminStatus =
  | "active"
  | "completed"
  | "cancelled"
  | "failed"
  | "expired"
  | "pending"
  | "paid"
  | "authorised"
  | "shop"
  | "subscription";

interface Props {
  status: string;
  className?: string;
  withDot?: boolean;
}

const STYLES: Record<AdminStatus, { bg: string; color: string; border: string; dot?: string }> = {
  active:       { bg: "rgba(16,185,129,0.12)",  color: "#10b981", border: "rgba(16,185,129,0.25)", dot: "#10b981" },
  paid:         { bg: "rgba(16,185,129,0.12)",  color: "#10b981", border: "rgba(16,185,129,0.25)" },
  completed:    { bg: "rgba(59,130,246,0.12)",  color: "#60a5fa", border: "rgba(59,130,246,0.25)" },
  authorised:   { bg: "rgba(59,130,246,0.10)",  color: "#60a5fa", border: "rgba(59,130,246,0.20)" },
  subscription: { bg: "rgba(59,130,246,0.12)",  color: "#60a5fa", border: "rgba(59,130,246,0.25)" },
  cancelled:    { bg: "rgba(239,68,68,0.10)",   color: "#f87171", border: "rgba(239,68,68,0.20)" },
  failed:       { bg: "rgba(239,68,68,0.10)",   color: "#f87171", border: "rgba(239,68,68,0.20)" },
  expired:      { bg: "rgba(100,116,139,0.12)", color: "#94a3b8", border: "rgba(100,116,139,0.20)" },
  pending:      { bg: "rgba(245,158,11,0.10)",  color: "#fbbf24", border: "rgba(245,158,11,0.20)" },
  shop:         { bg: "rgba(139,92,246,0.12)",  color: "#a78bfa", border: "rgba(139,92,246,0.20)" },
};

export function StatusBadge({ status, className, withDot = false }: Props) {
  const key = (status?.toLowerCase() as AdminStatus) ?? "pending";
  const s = STYLES[key] ?? STYLES.pending;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium border whitespace-nowrap",
        className,
      )}
      style={{ background: s.bg, color: s.color, borderColor: s.border }}
    >
      {(withDot && s.dot) && (
        <span className="w-1 h-1 rounded-full" style={{ background: s.dot }} />
      )}
      {status?.charAt(0).toUpperCase() + status?.slice(1)}
    </span>
  );
}
