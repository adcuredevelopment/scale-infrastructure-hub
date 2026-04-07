import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

export interface AffiliateData {
  id: string;
  affiliate_code: string;
  display_name: string | null;
  email: string;
  status: string;
}

export interface AffiliateReferral {
  id: string;
  customer_email: string | null;
  plan_name: string | null;
  payment_amount: number;
  commission_rate: number;
  commission_amount: number;
  status: string;
  referral_type: string;
  created_at: string;
}

export interface AffiliatePayout {
  id: string;
  amount: number;
  currency: string;
  status: string;
  payout_date: string | null;
  notes: string | null;
  created_at: string;
}

export function useAffiliate() {
  const [user, setUser] = useState<User | null>(null);
  const [affiliate, setAffiliate] = useState<AffiliateData | null>(null);
  const [referrals, setReferrals] = useState<AffiliateReferral[]>([]);
  const [payouts, setPayouts] = useState<AffiliatePayout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setAffiliate(null);
      setReferrals([]);
      setPayouts([]);
      setLoading(false);
      return;
    }
    fetchAffiliateData();
  }, [user]);

  async function fetchAffiliateData() {
    setLoading(true);
    try {
      const { data: aff } = await supabase
        .from("affiliates")
        .select("id, affiliate_code, display_name, email, status")
        .eq("user_id", user!.id)
        .maybeSingle();

      setAffiliate(aff);

      if (aff) {
        const [refsRes, payRes] = await Promise.all([
          supabase
            .from("affiliate_referrals")
            .select("*")
            .order("created_at", { ascending: false }),
          supabase
            .from("affiliate_payouts")
            .select("*")
            .order("created_at", { ascending: false }),
        ]);
        setReferrals((refsRes.data as AffiliateReferral[]) || []);
        setPayouts((payRes.data as AffiliatePayout[]) || []);
      }
    } catch (err) {
      console.error("Error fetching affiliate data:", err);
    } finally {
      setLoading(false);
    }
  }

  const totalEarnings = referrals
    .filter((r) => r.status === "approved" || r.status === "paid")
    .reduce((sum, r) => sum + Number(r.commission_amount), 0);

  const pendingEarnings = referrals
    .filter((r) => r.status === "pending")
    .reduce((sum, r) => sum + Number(r.commission_amount), 0);

  const totalPaidOut = payouts
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const bonusEarnings = referrals
    .filter((r) => r.referral_type === "signup_bonus" && (r.status === "approved" || r.status === "paid"))
    .reduce((sum, r) => sum + Number(r.commission_amount), 0);

  return {
    user,
    affiliate,
    referrals,
    payouts,
    loading,
    totalEarnings,
    pendingEarnings,
    totalPaidOut,
    totalReferrals: referrals.filter((r) => r.referral_type !== "signup_bonus").length,
    bonusEarnings,
    refetch: fetchAffiliateData,
  };
}
