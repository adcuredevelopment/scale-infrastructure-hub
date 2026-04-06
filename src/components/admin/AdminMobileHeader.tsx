import { useState } from "react";
import { Menu, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { AdminSidebar } from "./AdminSidebar";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

export function AdminMobileHeader() {
  const [open, setOpen] = useState(false);
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/admin/login");
  };

  return (
    <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border/30 bg-secondary/30">
      <span className="font-display font-bold text-sm text-foreground">Adcure Admin</span>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleSignOut}>
          <LogOut className="w-4 h-4 text-muted-foreground" />
        </Button>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-60">
            <div onClick={() => setOpen(false)}>
              <AdminSidebar />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
