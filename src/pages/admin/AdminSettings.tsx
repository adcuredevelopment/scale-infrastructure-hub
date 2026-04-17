import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  User, Shield, Key, LogOut, AlertTriangle, CheckCircle2, Copy, Check, Mail, Clock,
} from "lucide-react";
import { format } from "date-fns";

export default function AdminSettings() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [signingOutAll, setSigningOutAll] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = async () => {
    if (!user?.email) return;
    try {
      await navigator.clipboard.writeText(user.email);
      setCopied(true);
      toast.success("Email copied");
      setTimeout(() => setCopied(false), 1200);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleSignOutEverywhere = async () => {
    setSigningOutAll(true);
    try {
      const { error } = await supabase.auth.signOut({ scope: "global" });
      if (error) throw error;
      toast.success("Signed out from all devices");
      navigate("/admin/login");
    } catch (err: any) {
      toast.error(err?.message || "Failed to sign out everywhere");
    } finally {
      setSigningOutAll(false);
      setConfirmOpen(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-3xl admin-page">
      {/* Header */}
      <div>
        <h1
          className="font-syne font-semibold text-[26px]"
          style={{ color: "var(--ad-text)", letterSpacing: "-0.02em" }}
        >
          Settings
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--ad-text-secondary)" }}>
          Manage your admin account and integrations
        </p>
      </div>

      {/* Account */}
      <section className="admin-card overflow-hidden">
        <div
          className="px-5 py-4"
          style={{ borderBottom: "1px solid var(--ad-border-subtle)" }}
        >
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" style={{ color: "var(--ad-accent-soft)" }} />
            <h2 className="font-syne font-semibold text-[15px]" style={{ color: "var(--ad-text)" }}>
              Account
            </h2>
          </div>
          <p className="text-[12px] mt-0.5" style={{ color: "var(--ad-text-faint)" }}>
            Your admin profile and session
          </p>
        </div>

        <div className="divide-y" style={{ borderColor: "var(--ad-border-subtle)" }}>
          <Row
            label="Email"
            icon={Mail}
            value={
              <button
                type="button"
                onClick={handleCopyEmail}
                className="inline-flex items-center gap-1.5 group"
                style={{ color: "var(--ad-text)" }}
              >
                <span className="text-[13px]">{user?.email}</span>
                {copied
                  ? <Check className="w-3 h-3" style={{ color: "var(--ad-green)" }} />
                  : <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "var(--ad-text-faint)" }} />}
              </button>
            }
          />
          <Row
            label="Role"
            icon={Shield}
            value={
              <span
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium"
                style={{
                  background: "var(--ad-blue-soft)",
                  color: "var(--ad-accent-soft)",
                  border: "1px solid var(--ad-blue-border)",
                }}
              >
                <Shield className="w-3 h-3" /> Admin
              </span>
            }
          />
          <Row
            label="Last sign-in"
            icon={Clock}
            value={
              <span className="text-[13px] font-mono-jb" style={{ color: "var(--ad-text)" }}>
                {user?.last_sign_in_at ? format(new Date(user.last_sign_in_at), "MMM dd, yyyy HH:mm") : "—"}
              </span>
            }
          />
        </div>
      </section>

      {/* Integrations */}
      <section className="admin-card overflow-hidden">
        <div
          className="px-5 py-4"
          style={{ borderBottom: "1px solid var(--ad-border-subtle)" }}
        >
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4" style={{ color: "var(--ad-accent-soft)" }} />
            <h2 className="font-syne font-semibold text-[15px]" style={{ color: "var(--ad-text)" }}>
              Integrations
            </h2>
          </div>
          <p className="text-[12px] mt-0.5" style={{ color: "var(--ad-text-faint)" }}>
            Connected services and APIs
          </p>
        </div>

        <div className="divide-y" style={{ borderColor: "var(--ad-border-subtle)" }}>
          <IntegrationRow
            name="Revolut Merchant API"
            description="Subscriptions, shop orders & webhooks"
            status="connected"
          />
          <IntegrationRow
            name="Revolut Business API"
            description="Affiliate payouts via OAuth 2.0"
            status="connected"
          />
          <IntegrationRow
            name="Resend"
            description="Transactional & auth emails"
            status="connected"
          />
        </div>
      </section>

      {/* Danger Zone */}
      <section
        className="rounded-[10px] overflow-hidden"
        style={{ background: "var(--ad-surface)", border: "1px solid var(--ad-red-border)" }}
      >
        <div
          className="px-5 py-4"
          style={{ borderBottom: "1px solid var(--ad-red-border)" }}
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" style={{ color: "var(--ad-red-text)" }} />
            <h2 className="font-syne font-semibold text-[15px]" style={{ color: "var(--ad-red-text)" }}>
              Danger zone
            </h2>
          </div>
          <p className="text-[12px] mt-0.5" style={{ color: "var(--ad-text-faint)" }}>
            These actions affect your active sessions
          </p>
        </div>

        <div className="divide-y" style={{ borderColor: "var(--ad-border-subtle)" }}>
          <div className="px-5 py-4 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[13px] font-medium" style={{ color: "var(--ad-text)" }}>
                Sign out this device
              </p>
              <p className="text-[12px] mt-0.5" style={{ color: "var(--ad-text-faint)" }}>
                End the current admin session in this browser only.
              </p>
            </div>
            <button
              type="button"
              onClick={async () => { await signOut(); navigate("/admin/login"); }}
              className="admin-btn-ghost inline-flex items-center gap-1.5 px-3 h-8 text-[12px] shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign out
            </button>
          </div>

          <div className="px-5 py-4 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[13px] font-medium" style={{ color: "var(--ad-text)" }}>
                Sign out everywhere
              </p>
              <p className="text-[12px] mt-0.5" style={{ color: "var(--ad-text-faint)" }}>
                Revoke all admin sessions on every device. You'll be signed out immediately.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              className="admin-btn-destructive inline-flex items-center gap-1.5 px-3 h-8 text-[12px] shrink-0"
            >
              <AlertTriangle className="w-3.5 h-3.5" /> Sign out everywhere
            </button>
          </div>
        </div>
      </section>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent
          style={{ background: "var(--ad-surface)", border: "1px solid var(--ad-border)" }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="font-syne font-semibold" style={{ color: "var(--ad-text)" }}>
              Sign out from all devices?
            </AlertDialogTitle>
            <AlertDialogDescription style={{ color: "var(--ad-text-secondary)" }}>
              This will revoke every active admin session, including any open browsers and mobile devices.
              You'll be redirected to the login page immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="admin-btn-ghost px-3 h-8 text-[12px]">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSignOutEverywhere}
              disabled={signingOutAll}
              className="admin-btn-destructive px-3 h-8 text-[12px]"
            >
              {signingOutAll ? "Signing out..." : "Yes, sign out everywhere"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function Row({
  label, value, icon: Icon,
}: {
  label: string;
  value: React.ReactNode;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
}) {
  return (
    <div className="px-5 py-3.5 flex items-center justify-between gap-4">
      <div className="flex items-center gap-2 min-w-0">
        <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--ad-text-faint)" }} />
        <span className="text-[12px]" style={{ color: "var(--ad-text-secondary)" }}>{label}</span>
      </div>
      <div className="min-w-0 flex justify-end">{value}</div>
    </div>
  );
}

function IntegrationRow({
  name, description, status,
}: {
  name: string;
  description: string;
  status: "connected" | "disconnected";
}) {
  const connected = status === "connected";
  return (
    <div className="px-5 py-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="w-8 h-8 rounded-md flex items-center justify-center shrink-0"
          style={{ background: "var(--ad-blue-soft)" }}
        >
          <Shield className="w-4 h-4" style={{ color: "var(--ad-accent-soft)" }} />
        </div>
        <div className="min-w-0">
          <p className="text-[13px] font-medium truncate" style={{ color: "var(--ad-text)" }}>{name}</p>
          <p className="text-[12px] truncate" style={{ color: "var(--ad-text-faint)" }}>{description}</p>
        </div>
      </div>
      <span
        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium shrink-0"
        style={{
          background: connected ? "var(--ad-green-soft)" : "var(--ad-slate-soft)",
          color: connected ? "var(--ad-green)" : "var(--ad-text-soft)",
          border: `1px solid ${connected ? "var(--ad-green-border)" : "var(--ad-slate-border)"}`,
        }}
      >
        <CheckCircle2 className="w-3 h-3" />
        {connected ? "Connected" : "Disconnected"}
      </span>
    </div>
  );
}
