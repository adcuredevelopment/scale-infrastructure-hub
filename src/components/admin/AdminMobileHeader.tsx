import { useState } from "react";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { AdminSidebar } from "./AdminSidebar";

export function AdminMobileHeader() {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="md:hidden flex items-center justify-between px-4 h-14"
      style={{
        background: "var(--ad-surface-deep)",
        borderBottom: "1px solid var(--ad-border-subtle)",
      }}
    >
      <div className="flex items-center gap-2">
        <div
          className="w-7 h-7 rounded-md flex items-center justify-center font-syne font-bold text-[13px]"
          style={{
            background: "linear-gradient(135deg, var(--ad-accent), #1d4ed8)",
            color: "#fff",
          }}
        >
          A
        </div>
        <div className="flex flex-col leading-none">
          <span className="font-syne font-semibold text-[14px]" style={{ color: "var(--ad-text)" }}>
            Adcure
          </span>
          <span
            className="text-[9px] uppercase mt-0.5"
            style={{ color: "var(--ad-text-faint)", letterSpacing: "0.1em" }}
          >
            Admin
          </span>
        </div>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button
            type="button"
            className="w-9 h-9 rounded-md flex items-center justify-center"
            style={{
              background: "var(--ad-surface)",
              border: "1px solid var(--ad-border)",
              color: "var(--ad-text-soft)",
            }}
            aria-label="Open menu"
          >
            <Menu className="w-4 h-4" />
          </button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="p-0 w-[240px] border-0 admin-scope"
          style={{ background: "var(--ad-surface-deep)" }}
        >
          <AdminSidebar onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
