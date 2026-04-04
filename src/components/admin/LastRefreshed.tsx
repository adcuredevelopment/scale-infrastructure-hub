import { useEffect, useState } from "react";

interface LastRefreshedProps {
  timestamp: Date;
}

export function LastRefreshed({ timestamp }: LastRefreshedProps) {
  const [, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 5000);
    return () => clearInterval(id);
  }, []);

  const seconds = Math.floor((Date.now() - timestamp.getTime()) / 1000);
  const label = seconds < 5 ? "just now" : seconds < 60 ? `${seconds}s ago` : `${Math.floor(seconds / 60)}m ago`;

  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
      </span>
      Updated {label}
    </div>
  );
}
