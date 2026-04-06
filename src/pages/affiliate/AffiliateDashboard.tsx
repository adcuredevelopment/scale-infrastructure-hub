import { useAffiliate } from "@/hooks/useAffiliate";
import { EarningsChart } from "@/components/affiliate/EarningsChart";
import { ReferralLink } from "@/components/affiliate/ReferralLink";
import { ReferralsTable } from "@/components/affiliate/ReferralsTable";
import { PayoutsTable } from "@/components/affiliate/PayoutsTable";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { DollarSign, Clock, Users, CreditCard, LogOut, Loader2, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

function KPI({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="glass rounded-xl p-5">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="w-4 h-4 text-primary" />
        </div>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className="text-2xl font-display font-bold">{value}</p>
    </div>
  );
}

export default function AffiliateDashboard() {
  const { affiliate, referrals, payouts, loading, totalEarnings, pendingEarnings, totalPaidOut, totalReferrals, bonusEarnings } = useAffiliate();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/affiliate/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!affiliate) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-28 text-center px-5">
          <h1 className="text-2xl font-display font-bold mb-4">No Affiliate Account Found</h1>
          <p className="text-muted-foreground mb-6">Your account is not linked to an affiliate profile yet.</p>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="w-4 h-4 mr-2" /> Sign Out
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 md:pt-32 pb-16 px-5 md:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold">
                Welcome back, {affiliate.display_name || affiliate.email.split("@")[0]}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">Your affiliate dashboard</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" /> Sign Out
            </Button>
          </div>

{/* KPIs - Carousel on mobile/tablet, grid on desktop */}
          <div className="hidden lg:grid grid-cols-5 gap-4 mb-6">
            <KPI icon={Users} label="Total Referrals" value={String(totalReferrals)} />
            <KPI icon={DollarSign} label="Total Earnings" value={`€${totalEarnings.toFixed(2)}`} />
            <KPI icon={Gift} label="Signup Bonuses" value={`€${bonusEarnings.toFixed(2)}`} />
            <KPI icon={Clock} label="Pending" value={`€${pendingEarnings.toFixed(2)}`} />
            <KPI icon={CreditCard} label="Paid Out" value={`€${totalPaidOut.toFixed(2)}`} />
          </div>
          <div className="lg:hidden mb-6">
            <Carousel opts={{ align: "start", loop: false }} className="w-full">
              <CarouselContent className="-ml-3">
                {[
                  { icon: Users, label: "Total Referrals", value: String(totalReferrals) },
                  { icon: DollarSign, label: "Total Earnings", value: `€${totalEarnings.toFixed(2)}` },
                  { icon: Gift, label: "Signup Bonuses", value: `€${bonusEarnings.toFixed(2)}` },
                  { icon: Clock, label: "Pending", value: `€${pendingEarnings.toFixed(2)}` },
                  { icon: CreditCard, label: "Paid Out", value: `€${totalPaidOut.toFixed(2)}` },
                ].map((kpi, i) => (
                  <CarouselItem key={i} className="pl-3 basis-[45%] sm:basis-[35%] md:basis-[30%]">
                    <KPI icon={kpi.icon} label={kpi.label} value={kpi.value} />
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>

          {/* Referral Link */}
          <div className="mb-6">
            <ReferralLink affiliateCode={affiliate.affiliate_code} />
          </div>

          {/* Chart */}
          <div className="mb-6">
            <EarningsChart referrals={referrals} />
          </div>

          {/* Tables */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
            <ReferralsTable referrals={referrals} />
            <PayoutsTable payouts={payouts} />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
