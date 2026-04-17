import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  width?: number;
  className?: string;
}

export function SlidePanel({ open, onClose, children, width = 420, className }: Props) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 backdrop-blur-sm"
        style={{ background: "rgba(0,0,0,0.45)", animation: "admin-page-in 0.18s ease-out both" }}
      />
      {/* Panel */}
      <aside
        className={cn(
          "fixed top-0 right-0 bottom-0 z-50 flex flex-col admin-panel-in overflow-hidden",
          className,
        )}
        style={{
          width,
          maxWidth: "100vw",
          background: "var(--ad-surface)",
          borderLeft: "1px solid var(--ad-border)",
        }}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-md flex items-center justify-center transition-colors"
          style={{ color: "var(--ad-text-secondary)" }}
          aria-label="Close panel"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="flex-1 overflow-y-auto">
          <div className="min-h-full flex flex-col">{children}</div>
        </div>
      </aside>
    </>
  );
}

export function SlideSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="px-6 py-5" style={{ borderTop: "1px solid var(--ad-border-subtle)" }}>
      <h3
        className="text-[10px] uppercase font-medium mb-3"
        style={{ color: "var(--ad-text-faint)", letterSpacing: "0.08em" }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}

export function SlideRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2 text-[13px]">
      <span style={{ color: "var(--ad-text-secondary)" }}>{label}</span>
      <span style={{ color: "var(--ad-text)" }}>{value}</span>
    </div>
  );
}
