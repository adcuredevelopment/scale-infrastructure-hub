import { useEffect, useState } from "react";

interface Props {
  timestamp?: Date;
  label?: string;
}

export function LiveIndicator({ timestamp, label }: Props) {
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!timestamp) return;
    const id = setInterval(() => setTick((t) => t + 1), 5000);
    return () => clearInterval(id);
  }, [timestamp]);

  let text = label ?? "Live";
  if (timestamp) {
    const seconds = Math.floor((Date.now() - timestamp.getTime()) / 1000);
    text =
      seconds < 5 ? "Updated just now"
      : seconds < 60 ? `Updated ${seconds}s ago`
      : `Updated ${Math.floor(seconds / 60)}m ago`;
  }

  return (
    <div className="flex items-center gap-2 text-[11px]" style={{ color: "var(--ad-text-secondary)" }}>
      <span className="relative flex h-1.5 w-1.5">
        <span
          className="absolute inline-flex h-full w-full rounded-full admin-dot-pulse"
          style={{ background: "#10b981", opacity: 0.6 }}
        />
        <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: "#10b981" }} />
      </span>
      {text}
    </div>
  );
}
