import {
  LayoutDashboard, Users, CreditCard, TrendingUp, Bell, Settings, LogOut, ChevronLeft, Share2
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";

const navItems = [
  { title: "Overview", url: "/admin", icon: LayoutDashboard },
  { title: "Subscriptions", url: "/admin/subscriptions", icon: CreditCard },
  { title: "Payments", url: "/admin/payments", icon: TrendingUp },
  { title: "Customers", url: "/admin/customers", icon: Users },
  { title: "Analytics", url: "/admin/analytics", icon: TrendingUp },
  { title: "Affiliates", url: "/admin/affiliates", icon: Share2 },
  
  { title: "Notifications", url: "/admin/notifications", icon: Bell },
  { title: "Settings", url: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/admin/login");
  };

  return (
    <aside className={cn(
      "h-screen sticky top-0 border-r border-border/30 bg-secondary/30 flex flex-col transition-all duration-300",
      collapsed ? "w-16" : "w-60"
    )}>
      <div className="flex items-center justify-between p-4 border-b border-border/20">
        {!collapsed && (
          <span className="font-display font-bold text-sm text-foreground">Adcure Admin</span>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={() => setCollapsed(!collapsed)}
        >
          <ChevronLeft className={cn("w-4 h-4 transition-transform", collapsed && "rotate-180")} />
        </Button>
      </div>

      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.url}
            to={item.url}
            end={item.url === "/admin"}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors",
              collapsed && "justify-center px-2"
            )}
            activeClassName="bg-primary/10 text-primary font-medium"
          >
            <item.icon className="w-4 h-4 shrink-0" />
            {!collapsed && <span>{item.title}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-border/20">
        {!collapsed && user && (
          <p className="text-[11px] text-muted-foreground truncate mb-2 px-1">{user.email}</p>
        )}
        <Button
          variant="ghost"
          size="sm"
          className={cn("w-full text-muted-foreground hover:text-destructive", collapsed && "px-2")}
          onClick={handleSignOut}
        >
          <LogOut className="w-4 h-4" />
          {!collapsed && <span className="ml-2">Sign Out</span>}
        </Button>
      </div>
    </aside>
  );
}
