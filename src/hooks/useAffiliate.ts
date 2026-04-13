import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

export interface AffiliateData {
  id: string;
  affiliate_code: string;
  display_name: string | null;
  email: string;
  status: string;
  iban: string | null;
  company_name: string | null;
  kvk_number: string | null;
  vat_number: string | null;
  billing_address: string | null;
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
  const [cancelledEmails, setCancelledEmails] = useState<Set<string>>(new Set());
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
      setCancelledEmails(new Set());
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
        const [refsRes, payRes, subsRes] = await Promise.all([
          supabase
            .from("affiliate_referrals")
            .select("*")
            .order("created_at", { ascending: false }),
          supabase
            .from("affiliate_payouts")
            .select("*")
            .order("created_at", { ascending: false }),
          supabase.rpc("get_affiliate_cancelled_emails"),
        ]);
        setReferrals((refsRes.data as AffiliateReferral[]) || []);
        setPayouts((payRes.data as AffiliatePayout[]) || []);
        const cancelled = new Set<string>(
          (subsRes.data || []).map((s) => s.customer_email.toLowerCase())
        );
        setCancelledEmails(cancelled);
      }
    } catch (err) {
      console.error("Error fetching affiliate data:", err);
    } finally {
      setLoading(false);
    }
  }

  // Active referrals: count unique referred customers with active subscriptions
  const uniqueReferralEmails = new Set(
    referrals
      .filter((r) => r.customer_email)
      .map((r) => r.customer_email!.toLowerCase())
  );
  const activeReferrals = [...uniqueReferralEmails].filter(
    (email) => !cancelledEmails.has(email)
  ).length;

  // Signup bonuses that haven't been paid out yet
  const unpaidSignupBonuses = referrals
    .filter((r) => r.referral_type === "signup_bonus" && r.status !== "paid")
    .reduce((sum, r) => sum + Number(r.commission_amount), 0);

  // Pending: total € amount of referrals not yet paid out
  const pendingAmount = referrals
    .filter((r) => r.status !== "paid")
    .reduce((sum, r) => sum + Number(r.commission_amount), 0);

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthlyRecurring = referrals
    .filter((r) => r.referral_type === "recurring" && (r.status === "approved" || r.status === "paid") && new Date(r.created_at) >= monthStart)
    .reduce((sum, r) => sum + Number(r.commission_amount), 0);

  return {
    user,
    affiliate,
    referrals,
    payouts,
    cancelledEmails,
    loading,
    activeReferrals,
    unpaidSignupBonuses,
    pendingAmount,
    monthlyRecurring,
    refetch: fetchAffiliateData,
  };
}
