import { useAffiliate } from "@/hooks/useAffiliate";
import { ReferralLink } from "@/components/affiliate/ReferralLink";
import { ReferralsTable } from "@/components/affiliate/ReferralsTable";
import { PayoutsTable } from "@/components/affiliate/PayoutsTable";
import { AffiliateSettings } from "@/components/affiliate/AffiliateSettings";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Clock, Users, LogOut, Loader2, Gift, TrendingUp } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

type TabKey = "dashboard" | "settings";

function KPICard({
  icon: Icon, label, value, valueColor, delay,
}: {
  icon: any; label: string; value: string; valueColor?: string; delay: number;
}) {
  return (
    <div
      className="aff-card p-5 aff-rise"
      style={{ animationDelay: `${delay}ms`, padding: "20px 24px" }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="aff-label">{label}</span>
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
    affiliate, referrals, payouts, loading,
    activeReferrals, unpaidSignupBonuses, pendingAmount, monthlyRecurring, cancelledEmails,
    updateAffiliate,
  } = useAffiliate();
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabKey>("dashboard");

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/affiliate/login");
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
      <div className="aff-scope min-h-screen">
        <Navbar />
        <div className="pt-28 text-center px-5">
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

  return (
    <div className="aff-scope min-h-screen">
      <Navbar />
      <div className="pt-24 md:pt-32 pb-16 px-5 md:px-8">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
            <div>
              <p className="text-[13px] text-[#64748b]">Welcome back,</p>
              <h1 className="aff-syne font-bold text-[26px] text-[#f1f5f9] leading-tight mt-0.5">
                {affiliate.display_name || affiliate.email.split("@")[0]}
              </h1>
              <p className="text-[12px] text-[#475569] mt-1">Your affiliate dashboard</p>
            </div>
            <button onClick={handleLogout} className="aff-btn-ghost self-start sm:self-auto group" style={{ color: "#64748b" }}>
              <LogOut className="w-3.5 h-3.5 transition-colors group-hover:text-[#f87171]" />
              <span className="transition-colors group-hover:text-[#f87171]">Sign Out</span>
            </button>
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
              {/* KPIs */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
                <KPICard icon={Users} label="Active Referrals" value={String(activeReferrals)} delay={0} />
                <KPICard icon={TrendingUp} label="Monthly Recurring" value={`€${monthlyRecurring.toFixed(2)}`} valueColor="#22d3ee" delay={75} />
                <KPICard icon={Gift} label="Signup Bonuses" value={`€${unpaidSignupBonuses.toFixed(2)}`} delay={150} />
                <KPICard
                  icon={Clock} label="Pending"
                  value={`€${pendingAmount.toFixed(2)}`}
                  valueColor={pendingAmount > 0 ? "#fbbf24" : "#f1f5f9"}
                  delay={225}
                />
              </div>

              <div className="mb-4">
                <ReferralLink
                  affiliateCode={affiliate.affiliate_code}
                  referralCount={referrals.length}
                  totalEarned={totalEarned}
                />
              </div>

              <div className="space-y-4">
                <ReferralsTable referrals={referrals} cancelledEmails={cancelledEmails} />
                <PayoutsTable payouts={payouts} />
              </div>
            </div>
          )}

          {tab === "settings" && (
            <div key="settings" className="aff-rise">
              <AffiliateSettings affiliate={affiliate} onUpdate={updateAffiliate} />
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
