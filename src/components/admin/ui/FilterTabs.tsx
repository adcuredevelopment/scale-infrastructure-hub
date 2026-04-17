import { cn } from "@/lib/utils";

export interface FilterTabItem<T extends string = string> {
  id: T;
  label: string;
  count?: number;
}

interface Props<T extends string = string> {
  items: FilterTabItem<T>[];
  value: T;
  onChange: (id: T) => void;
  className?: string;
}

export function FilterTabs<T extends string = string>({ items, value, onChange, className }: Props<T>) {
  return (
    <div className={cn("inline-flex items-center gap-1 p-0.5", className)}>
      {items.map((item) => {
        const active = item.id === value;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
            className="inline-flex items-center gap-1.5 px-3 h-8 rounded-md text-[13px] transition-colors"
            style={{
              background: active ? "rgba(255,255,255,0.07)" : "transparent",
              color: active ? "var(--ad-text)" : "var(--ad-text-secondary)",
            }}
          >
            <span>{item.label}</span>
            {typeof item.count === "number" && (
              <span
                className="font-mono-jb text-[10px] px-1.5 rounded"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  color: "var(--ad-text-soft)",
                }}
              >
                {item.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
