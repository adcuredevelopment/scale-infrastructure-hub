import { cn } from "@/lib/utils";

interface Props {
  label: string;
  value?: string;
  dotColor?: string;
  className?: string;
}

export function StatChip({ label, value, dotColor = "rgba(255,255,255,0.3)", className }: Props) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-3 h-8 rounded-full text-[12px]",
        className,
      )}
      style={{
        background: "var(--ad-surface)",
        border: "1px solid var(--ad-border)",
        color: "var(--ad-text-soft)",
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: dotColor }} />
      {value && (
        <span className="font-mono-jb font-medium" style={{ color: "var(--ad-text)" }}>
          {value}
        </span>
      )}
      <span>{label}</span>
    </div>
  );
}
