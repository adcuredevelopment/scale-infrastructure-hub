import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import { toast } from "sonner";

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

export interface AffiliateInvoice {
  id: string;
  invoice_number: string;
  amount: number;
  currency: string;
  issued_at: string;
  pdf_path: string | null;
  payout_id: string;
}

export function useAffiliate() {
  const [user, setUser] = useState<User | null>(null);
  const [affiliate, setAffiliate] = useState<AffiliateData | null>(null);
  const [referrals, setReferrals] = useState<AffiliateReferral[]>([]);
  const [payouts, setPayouts] = useState<AffiliatePayout[]>([]);
  const [invoices, setInvoices] = useState<AffiliateInvoice[]>([]);
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
      setInvoices([]);
      setCancelledEmails(new Set());
      setLoading(false);
      return;
    }
    fetchAffiliateData();
  }, [user]);

  // Realtime: listen for new invoices, payouts and referrals scoped to this affiliate
  useEffect(() => {
    if (!affiliate?.id) return;
    const filter = `affiliate_id=eq.${affiliate.id}`;
    const channel = supabase
      .channel(`affiliate-rt-${affiliate.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "affiliate_invoices", filter },
        (payload) => {
          if (payload.eventType === "INSERT") {
            toast.success("New invoice available");
          }
          fetchAffiliateData();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "affiliate_payouts", filter },
        (payload) => {
          if (payload.eventType === "INSERT") {
            toast.success("New payout received");
          } else if (payload.eventType === "UPDATE") {
            const newRow = payload.new as { status?: string };
            const oldRow = payload.old as { status?: string };
            if (newRow.status === "paid" && oldRow.status !== "paid") {
              toast.success("Payout marked as paid");
            }
          }
          fetchAffiliateData();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "affiliate_referrals", filter },
        (payload) => {
          if (payload.eventType === "INSERT") {
            toast.success("New referral commission earned");
          }
          fetchAffiliateData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [affiliate?.id]);

  async function fetchAffiliateData() {
    setLoading(true);
    try {
      const { data: aff } = await supabase
        .from("affiliates")
        .select("id, affiliate_code, display_name, email, status, iban, company_name, kvk_number, vat_number, billing_address")
        .eq("user_id", user!.id)
        .maybeSingle();

      setAffiliate(aff);

      if (aff) {
        const [refsRes, payRes, invRes, subsRes] = await Promise.all([
          supabase
            .from("affiliate_referrals")
            .select("*")
            .order("created_at", { ascending: false }),
          supabase
            .from("affiliate_payouts")
            .select("*")
            .order("created_at", { ascending: false }),
          supabase
            .from("affiliate_invoices")
            .select("id, invoice_number, amount, currency, issued_at, pdf_path, payout_id")
            .order("issued_at", { ascending: false }),
          supabase.rpc("get_affiliate_cancelled_emails"),
        ]);
        setReferrals((refsRes.data as AffiliateReferral[]) || []);
        setPayouts((payRes.data as AffiliatePayout[]) || []);
        setInvoices((invRes.data as AffiliateInvoice[]) || []);
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

  // Signup bonuses that haven't been paid out yet (kept for backward compat)
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

  // Total earned: sum of all paid payouts
  const totalEarnedPaid = payouts
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  // Map invoices by payout_id for quick lookup in PayoutsTable
  const invoicesByPayout = new Map<string, AffiliateInvoice>();
  for (const inv of invoices) invoicesByPayout.set(inv.payout_id, inv);

  async function updateAffiliate(fields: Partial<AffiliateData>) {
    if (!affiliate) throw new Error("No affiliate");
    const { error } = await supabase
      .from("affiliates")
      .update(fields)
      .eq("id", affiliate.id);
    if (error) throw error;
    setAffiliate({ ...affiliate, ...fields } as AffiliateData);
  }

  /** Open an invoice PDF (private bucket -> signed URL). */
  async function openInvoicePdf(pdfPath: string) {
    const { data, error } = await supabase
      .storage
      .from("affiliate-invoices")
      .createSignedUrl(pdfPath, 60);
    if (error || !data?.signedUrl) {
      throw error || new Error("Could not generate invoice link");
    }
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  }

  return {
    user,
    affiliate,
    referrals,
    payouts,
    invoices,
    invoicesByPayout,
    cancelledEmails,
    loading,
    activeReferrals,
    unpaidSignupBonuses,
    pendingAmount,
    monthlyRecurring,
    totalEarnedPaid,
    refetch: fetchAffiliateData,
    updateAffiliate,
    openInvoicePdf,
  };
}
