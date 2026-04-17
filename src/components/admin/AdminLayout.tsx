import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { AdminSidebar } from "./AdminSidebar";
import { AdminMobileHeader } from "./AdminMobileHeader";
import { AdminFontLoader } from "./AdminFontLoader";
import { Loader2 } from "lucide-react";
import "@/styles/admin.css";

export function AdminLayout() {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div
        className="admin-scope min-h-screen flex items-center justify-center"
      >
        <AdminFontLoader />
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: "var(--ad-accent)" }} />
      </div>
    );
  }

  if (!user) return <Navigate to="/admin/login" replace />;
  if (!isAdmin) {
    return (
      <div className="admin-scope min-h-screen flex items-center justify-center">
        <AdminFontLoader />
        <div className="text-center space-y-2">
          <p className="text-lg font-syne font-semibold" style={{ color: "var(--ad-text)" }}>
            Access Denied
          </p>
          <p className="text-sm" style={{ color: "var(--ad-text-secondary)" }}>
            You don't have admin permissions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-scope min-h-screen flex flex-col md:flex-row">
      <AdminFontLoader />
      <AdminMobileHeader />
      <div className="hidden md:flex">
        <AdminSidebar />
      </div>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
