import {
  LayoutDashboard, Users, CreditCard, TrendingUp, Settings, LogOut,
  ChevronLeft, Share2, BarChart3, type LucideIcon,
} from "lucide-react";
import { NavLink as RouterNavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
  end?: boolean;
}

const mainItems: NavItem[] = [
  { title: "Overview",      url: "/admin",               icon: LayoutDashboard, end: true },
  { title: "Subscriptions", url: "/admin/subscriptions", icon: CreditCard },
  { title: "Payments",      url: "/admin/payments",      icon: TrendingUp },
  { title: "Customers",     url: "/admin/customers",     icon: Users },
  { title: "Analytics",     url: "/admin/analytics",     icon: BarChart3 },
  { title: "Affiliates",    url: "/admin/affiliates",    icon: Share2 },
];

const settingsItems: NavItem[] = [
  { title: "Settings", url: "/admin/settings", icon: Settings },
];

interface Props {
  onNavigate?: () => void;
}

export function AdminSidebar({ onNavigate }: Props) {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/admin/login");
  };

  return (
    <aside
      className={cn(
        "h-screen sticky top-0 flex flex-col transition-[width] duration-300 relative",
        collapsed ? "w-[56px]" : "w-[220px]",
      )}
      style={{
        background: "var(--ad-surface-deep)",
        borderRight: "1px solid var(--ad-border-subtle)",
      }}
    >
      {/* Brand */}
      <div className="px-3 pt-5 pb-4">
        {!collapsed ? (
          <div className="flex items-center gap-2 px-2">
            <BrandMark />
            <div className="flex flex-col leading-none">
              <span className="font-syne font-semibold text-[15px]" style={{ color: "var(--ad-text)" }}>
                Adcure
              </span>
              <span
                className="text-[10px] uppercase mt-0.5"
                style={{ color: "var(--ad-text-faint)", letterSpacing: "0.1em" }}
              >
                Admin
              </span>
            </div>
          </div>
        ) : (
          <div className="flex justify-center"><BrandMark /></div>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        className="hidden md:flex absolute -right-3 top-7 w-6 h-6 rounded-md items-center justify-center transition-colors z-10"
        style={{
          background: "var(--ad-surface-elevated)",
          border: "1px solid rgba(255,255,255,0.08)",
          color: "var(--ad-text-soft)",
        }}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <ChevronLeft className={cn("w-3.5 h-3.5 transition-transform", collapsed && "rotate-180")} />
      </button>

      {/* Nav */}
      <nav className="flex-1 px-2 pb-2 overflow-y-auto">
        <NavGroup items={mainItems} collapsed={collapsed} onNavigate={onNavigate} />
        <div className="my-2 mx-2" style={{ borderTop: "1px solid var(--ad-border-subtle)" }} />
        <NavGroup items={settingsItems} collapsed={collapsed} onNavigate={onNavigate} />
      </nav>

      {/* Footer */}
      <div className="px-3 py-3" style={{ borderTop: "1px solid var(--ad-border-subtle)" }}>
        {!collapsed && user && (
          <p
            className="text-[11px] truncate mb-2 px-1"
            style={{ color: "var(--ad-text-muted)" }}
            title={user.email ?? ""}
          >
            {user.email}
          </p>
        )}
        <button
          type="button"
          onClick={handleSignOut}
          className={cn(
            "w-full flex items-center gap-2 px-2 h-8 rounded-md text-[12px] transition-colors group",
            collapsed && "justify-center",
          )}
          style={{ color: "var(--ad-text-secondary)" }}
        >
          <LogOut className="w-3.5 h-3.5 group-hover:text-[#f87171] transition-colors" />
          {!collapsed && <span className="group-hover:text-[#f87171] transition-colors">Sign out</span>}
        </button>
      </div>
    </aside>
  );
}

function BrandMark() {
  return (
    <div
      className="w-7 h-7 rounded-md flex items-center justify-center font-syne font-bold text-[13px]"
      style={{
        background: "linear-gradient(135deg, var(--ad-accent), #1d4ed8)",
        color: "#fff",
      }}
    >
      A
    </div>
  );
}

function NavGroup({
  items, collapsed, onNavigate,
}: {
  items: NavItem[];
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  return (
    <ul className="space-y-0.5">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <li key={item.url}>
            <RouterNavLink
              to={item.url}
              end={item.end}
              onClick={onNavigate}
              className="block"
            >
              {({ isActive }) => (
                <span
                  className={cn(
                    "relative flex items-center gap-2.5 h-9 rounded-[7px] transition-colors text-[13px]",
                    collapsed ? "justify-center px-0" : "px-3",
                  )}
                  style={{
                    background: isActive ? "rgba(59,130,246,0.10)" : "transparent",
                    color: isActive ? "var(--ad-text)" : "var(--ad-text-secondary)",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.background = "transparent";
                  }}
                >
                  {isActive && (
                    <span
                      className="absolute left-0 top-1.5 bottom-1.5 w-[2px] rounded-r"
                      style={{ background: "var(--ad-accent)" }}
                    />
                  )}
                  <Icon
                    className="shrink-0"
                    size={15}
                    style={{ color: isActive ? "var(--ad-accent)" : "var(--ad-text-faint)" }}
                  />
                  {!collapsed && <span>{item.title}</span>}
                </span>
              )}
            </RouterNavLink>
          </li>
        );
      })}
    </ul>
  );
}
