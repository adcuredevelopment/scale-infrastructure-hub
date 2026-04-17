import { LucideIcon } from "lucide-react";

interface Props {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, subtitle, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--ad-border-subtle)" }}
      >
        <Icon className="w-5 h-5" style={{ color: "var(--ad-text-muted)" }} strokeWidth={1.5} />
      </div>
      <p className="text-[13px] font-medium" style={{ color: "var(--ad-text-secondary)" }}>{title}</p>
      {subtitle && (
        <p className="text-[12px] mt-1" style={{ color: "var(--ad-text-faint)" }}>{subtitle}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
