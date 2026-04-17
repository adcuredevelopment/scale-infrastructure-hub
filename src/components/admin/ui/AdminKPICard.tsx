import { LucideIcon, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Props {
  label: string;
  value: string | number;
  /** Numeric value for count-up animation (overrides string parsing if provided) */
  numericValue?: number;
  prefix?: string;
  suffix?: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  delay?: number;
  /** Format function applied to the animated number */
  format?: (n: number) => string;
}

function useCountUp(target: number, durationMs = 600, delayMs = 0) {
  const [value, setValue] = useState(0);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    let raf = 0;
    const timer = setTimeout(() => {
      const step = (ts: number) => {
        if (startRef.current === null) startRef.current = ts;
        const elapsed = ts - startRef.current;
        const t = Math.min(elapsed / durationMs, 1);
        // ease-out cubic
        const eased = 1 - Math.pow(1 - t, 3);
        setValue(target * eased);
        if (t < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }, delayMs);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(raf);
      startRef.current = null;
    };
  }, [target, durationMs, delayMs]);

  return value;
}

export function AdminKPICard({
  label,
  value,
  numericValue,
  prefix,
  suffix,
  change,
  changeType = "neutral",
  icon: Icon,
  delay = 0,
  format,
}: Props) {
  const target = typeof numericValue === "number" ? numericValue
    : typeof value === "number" ? value
    : NaN;

  const animated = useCountUp(Number.isFinite(target) ? target : 0, 600, delay * 1000);

  const display =
    Number.isFinite(target)
      ? `${prefix ?? ""}${format ? format(animated) : Math.round(animated).toLocaleString()}${suffix ?? ""}`
      : String(value);

  const positive = changeType === "positive";
  const negative = changeType === "negative";

  return (
    <div
      className="admin-card admin-card-hover p-4 admin-page"
      style={{ animationDelay: `${delay * 80}ms` }}
    >
      <div className="flex items-start justify-between mb-3">
        <span
          className="text-[10px] font-medium uppercase"
          style={{ color: "var(--ad-text-faint)", letterSpacing: "0.08em" }}
        >
          {label}
        </span>
        <div
          className="w-7 h-7 rounded-md flex items-center justify-center"
          style={{ background: "rgba(59,130,246,0.10)" }}
        >
          <Icon className="w-3.5 h-3.5" style={{ color: "var(--ad-accent)" }} />
        </div>
      </div>

      <div
        className="font-mono-jb font-semibold"
        style={{ fontSize: "26px", color: "var(--ad-text)", lineHeight: 1.1 }}
      >
        {display}
      </div>

      {change && (
        <div
          className="flex items-center gap-1 mt-2 text-[11px] font-medium"
          style={{ color: positive ? "#10b981" : negative ? "#ef4444" : "var(--ad-text-secondary)" }}
        >
          {positive && <ArrowUpRight className="w-3 h-3" />}
          {negative && <ArrowDownRight className="w-3 h-3" />}
          <span>{change}</span>
        </div>
      )}
    </div>
  );
}
