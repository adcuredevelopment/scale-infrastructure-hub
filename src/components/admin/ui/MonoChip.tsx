import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Props {
  value: string;
  display?: string;
  copyable?: boolean;
  className?: string;
}

export function MonoChip({ value, display, copyable = true, className }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!copyable) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 1200);
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        "admin-mono-chip inline-flex items-center gap-1.5 transition-colors group",
        copyable && "hover:border-white/20 cursor-pointer",
        className,
      )}
    >
      <span>{display ?? value}</span>
      {copyable && (
        copied
          ? <Check className="w-3 h-3" style={{ color: "#10b981" }} />
          : <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
      )}
    </button>
  );
}
