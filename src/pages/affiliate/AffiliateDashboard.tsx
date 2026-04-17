import { useAffiliate } from "@/hooks/useAffiliate";
import { ReferralLink } from "@/components/affiliate/ReferralLink";
import { ReferralsTable } from "@/components/affiliate/ReferralsTable";
import { PayoutsTable } from "@/components/affiliate/PayoutsTable";
import { InvoicesTable } from "@/components/affiliate/InvoicesTable";
import { AffiliateSettings } from "@/components/affiliate/AffiliateSettings";
import { Footer } from "@/components/Footer";
import {
  Clock, Users, LogOut, Loader2, TrendingUp, Wallet,
  AlertTriangle, CheckCircle2, Circle, X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, Link } from "react-router-dom";
import { Copy as CopyIcon, Check as CheckIcon } from "lucide-react";
import { toast } from "sonner";

type TabKey = "dashboard" | "settings";

const ONBOARDING_DISMISS_KEY = "aff_onboarding_dismissed_v1";

function KPICard({
  icon: Icon, label, value, valueColor, delay, highlight, tooltip,
}: {
  icon: any; label: string; value: string; valueColor?: string; delay: number;
  highlight?: boolean; tooltip?: string;
}) {
  return (
    <div
      className="aff-card p-5 aff-rise relative"
      style={{
        animationDelay: `${delay}ms`,
        padding: "20px 24px",
        borderColor: highlight ? "rgba(245,158,11,0.20)" : undefined,
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="aff-label inline-flex items-center gap-1.5">
          {label}
          {tooltip && (
            <span className="aff-tooltip" data-tip={tooltip} aria-label={tooltip}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
            </span>
          )}
        </span>
        <span className="aff-kpi-icon">
          <Icon className="w-3.5 h-3.5" />
        </span>
      </div>
      <p className="aff-mono font-semibold text-[24px] leading-none" style={{ color: valueColor || "#f1f5f9" }}>
        {value}
      </p>
    </div>
  );
}

export default function AffiliateDashboard() {
  const {
    affiliate, referrals, payouts, invoices, invoicesByPayout, loading,
    activeReferrals, pendingAmount, monthlyRecurring, totalEarnedPaid, cancelledEmails,
    updateAffiliate, openInvoicePdf,
  } = useAffiliate();
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabKey>("dashboard");
  const [onboardingDismissed, setOnboardingDismissed] = useState(false);

  useEffect(() => {
    setOnboardingDismissed(localStorage.getItem(ONBOARDING_DISMISS_KEY) === "1");
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/affiliate/login");
  };

  const dismissOnboarding = () => {
    localStorage.setItem(ONBOARDING_DISMISS_KEY, "1");
    setOnboardingDismissed(true);
  };

  if (loading) {
    return (
      <div className="aff-scope min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#3b82f6]" />
      </div>
    );
  }

  if (!affiliate) {
    return (
      <div className="aff-scope min-h-screen flex flex-col">
        <AppHeader onLogout={handleLogout} />
        <div className="flex-1 pt-16 text-center px-5">
          <h1 className="aff-syne font-bold text-2xl mb-4 text-[#f1f5f9]">No Affiliate Account Found</h1>
          <p className="text-[#64748b] mb-6">Your account is not linked to an affiliate profile yet.</p>
          <button onClick={handleLogout} className="aff-btn-ghost mx-auto">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const totalEarned = referrals.reduce((s, r) => s + Number(r.commission_amount), 0);

  const showOnboarding =
    !onboardingDismissed &&
    referrals.length === 0 &&
    payouts.length === 0 &&
    invoices.length === 0;

  const incompleteProfile = !affiliate.iban || affiliate.iban.trim().length === 0;

  return (
    <div className="aff-scope min-h-screen flex flex-col">
      <AppHeader onLogout={handleLogout} />

      <div className="flex-1 pt-8 md:pt-10 pb-16 px-5 md:px-8">
        <div className="container mx-auto max-w-6xl">
          {/* Welcome header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
            <div>
              <p className="text-[13px] text-[#64748b]">Welcome back,</p>
              <h1 className="aff-syne font-bold text-[26px] text-[#f1f5f9] leading-tight mt-0.5">
                {affiliate.display_name || affiliate.email.split("@")[0]}
              </h1>
              <p className="text-[12px] text-[#475569] mt-1">Your affiliate dashboard</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="aff-tabs mb-6">
            <button data-active={tab === "dashboard"} onClick={() => setTab("dashboard")} className="aff-tab">
              Dashboard
            </button>
            <button data-active={tab === "settings"} onClick={() => setTab("settings")} className="aff-tab">
              Settings
            </button>
          </div>

          {tab === "dashboard" && (
            <div key="dashboard" className="aff-rise">
              {/* Onboarding */}
              {showOnboarding && (
                <OnboardingBanner
                  ibanFilled={!!affiliate.iban}
                  hasReferral={referrals.length > 0}
                  hasEarnings={totalEarnedPaid > 0}
                  onDismiss={dismissOnboarding}
                  onGoSettings={() => setTab("settings")}
                />
              )}

              {/* KPIs */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
                <KPICard icon={Users} label="Active Referrals" value={String(activeReferrals)} delay={0} />
                <KPICard icon={TrendingUp} label="Monthly Recurring" value={`€${monthlyRecurring.toFixed(2)}`} valueColor="#22d3ee" delay={75} />
                <KPICard icon={Wallet} label="Total Earned" value={`€${totalEarnedPaid.toFixed(2)}`} delay={150} />
                <KPICard
                  icon={Clock}
                  label="Pending"
                  value={`€${pendingAmount.toFixed(2)}`}
                  valueColor={pendingAmount > 0 ? "#fbbf24" : "#f1f5f9"}
                  delay={225}
                  highlight={pendingAmount > 0}
                  tooltip="This amount is pending approval and will be paid out in the next payout cycle."
                />
              </div>

              {/* Pending payout banner */}
              {pendingAmount > 0 && (
                <div className="aff-notice aff-notice-amber mb-4">
                  <Clock className="w-4 h-4 shrink-0" style={{ color: "#fbbf24" }} />
                  <span>
                    You have a pending payout of{" "}
                    <span className="aff-mono font-medium text-[#fbbf24]">€{pendingAmount.toFixed(2)}</span>.
                    {" "}This will be processed in the next payout cycle.
                  </span>
                </div>
              )}

              <div className="mb-3">
                <ReferralLink
                  affiliateCode={affiliate.affiliate_code}
                  referralCount={referrals.length}
                  totalEarned={totalEarned}
                />
              </div>

              {/* Affiliate code chip row */}
              <AffiliateCodeChip code={affiliate.affiliate_code} />

              <div className="space-y-4 mt-4">
                <ReferralsTable referrals={referrals} cancelledEmails={cancelledEmails} />
                <PayoutsTable payouts={payouts} invoicesByPayout={invoicesByPayout} onOpenInvoice={openInvoicePdf} />
                <InvoicesTable invoices={invoices} onOpenInvoice={openInvoicePdf} />
              </div>
            </div>
          )}

          {tab === "settings" && (
            <div key="settings" className="aff-rise">
              {incompleteProfile && (
                <div className="aff-notice aff-notice-amber mb-4 items-center">
                  <AlertTriangle className="w-4 h-4 shrink-0" style={{ color: "#fbbf24" }} />
                  <span className="flex-1">
                    Your payout details are incomplete. Please add your IBAN to receive payouts.
                  </span>
                </div>
              )}
              <AffiliateSettings affiliate={affiliate} onUpdate={updateAffiliate} startInEdit={incompleteProfile} />
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

/* ---- App-style header (no marketing nav links) ---- */
function AppHeader({ onLogout }: { onLogout: () => void }) {
  return (
    <header
      className="sticky top-0 z-40"
      style={{
        background: "rgba(9,9,12,0.85)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="container mx-auto max-w-6xl px-5 md:px-8 h-14 flex items-center justify-between">
        <Link to="/" className="aff-syne font-bold text-[16px] text-[#f1f5f9] tracking-tight">
          Adcure
        </Link>
        <button onClick={onLogout} className="aff-btn-ghost group" style={{ color: "#64748b" }}>
          <LogOut className="w-3.5 h-3.5 transition-colors group-hover:text-[#f87171]" />
          <span className="transition-colors group-hover:text-[#f87171]">Sign Out</span>
        </button>
      </div>
    </header>
  );
}

/* ---- Onboarding card ---- */
function OnboardingBanner({
  ibanFilled, hasReferral, hasEarnings, onDismiss, onGoSettings,
}: {
  ibanFilled: boolean; hasReferral: boolean; hasEarnings: boolean;
  onDismiss: () => void; onGoSettings: () => void;
}) {
  const steps = [
    { label: "Complete your profile", done: ibanFilled, action: onGoSettings, actionLabel: "Open Settings" },
    { label: "Copy your referral link", done: hasReferral },
    { label: "Earn your first commission", done: hasEarnings },
  ];
  return (
    <div className="aff-onboarding mb-5">
      <button onClick={onDismiss} aria-label="Dismiss" className="aff-onboarding-x">
        <X className="w-3.5 h-3.5" />
      </button>
      <h3 className="text-[14px] font-semibold text-[#f1f5f9]">Get started with your affiliate account</h3>
      <ul className="mt-3 space-y-2">
        {steps.map((s) => (
          <li key={s.label} className="flex items-center gap-2 text-[13px]">
            {s.done
              ? <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
              : <Circle className="w-4 h-4 text-[#475569]" />}
            <span style={{ color: s.done ? "#94a3b8" : "#cbd5e1" }}>{s.label}</span>
            {!s.done && s.action && (
              <button onClick={s.action} className="ml-auto text-[12px] text-[#60a5fa] hover:text-[#93c5fd]">
                {s.actionLabel}
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---- Affiliate code chip under referral link ---- */
function AffiliateCodeChip({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Code copied!");
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="flex items-center gap-2 text-[11px] text-[#64748b]">
      <span>Your affiliate code:</span>
      <span className="aff-mono aff-code-chip">{code}</span>
      <button
        onClick={onCopy}
        className="text-[#64748b] hover:text-[#f1f5f9] transition-colors"
        aria-label="Copy affiliate code"
      >
        {copied ? <CheckIcon className="w-3.5 h-3.5 text-[#10b981]" /> : <CopyIcon className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}
