import { useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import {
  Users, Euro, TrendingUp, Plus, FileText, CheckCircle2, AlertCircle,
  ExternalLink, RefreshCw, MoreHorizontal, Loader2, Zap, ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AdminKPICard, StatusBadge, StatChip, FilterTabs, SearchInput,
  EmptyState, KPISkeleton, TableSkeleton, LiveIndicator,
  SlidePanel, SlideSection, SlideRow, MonoChip, Avatar,
} from "@/components/admin/ui";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface Affiliate {
  id: string;
  user_id: string;
  affiliate_code: string;
  display_name: string | null;
  email: string;
  status: string;
  created_at: string;
}

interface Referral {
  id: string;
  affiliate_id: string;
  customer_email: string | null;
  plan_name: string | null;
  payment_amount: number;
  commission_rate: number;
  commission_amount: number;
  status: string;
  referral_type: string;
  created_at: string;
}

interface Payout {
  id: string;
  affiliate_id: string;
  amount: number;
  currency: string;
  status: string;
  payout_date: string | null;
  notes: string | null;
  created_at: string;
  revolut_transaction_id?: string | null;
}

interface Invoice {
  id: string;
  affiliate_id: string;
  payout_id: string;
  invoice_number: string;
  amount: number;
  currency: string;
  issued_at: string;
  pdf_path: string | null;
  created_at: string;
}

type StatusFilter = "all" | "active" | "suspended";

export default function AdminAffiliates() {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [loading, setLoading] = useState(true);
  const [payoutDialog, setPayoutDialog] = useState(false);
  const [payoutAffiliateId, setPayoutAffiliateId] = useState("");
  const [payoutAmount, setPayoutAmount] = useState("");
  const [payoutNotes, setPayoutNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [selectedAffiliate, setSelectedAffiliate] = useState<Affiliate | null>(null);
  const [cancelledEmails, setCancelledEmails] = useState<Set<string>>(new Set());
  const [executingPayoutId, setExecutingPayoutId] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    const [affRes, refRes, payRes, subRes, invRes] = await Promise.all([
      supabase.from("affiliates").select("*").order("created_at", { ascending: false }),
      supabase.from("affiliate_referrals").select("*").order("created_at", { ascending: false }),
      supabase.from("affiliate_payouts").select("*").order("created_at", { ascending: false }),
      supabase.from("subscriptions").select("customer_email, status").eq("status", "cancelled"),
      supabase.from("affiliate_invoices").select("*").order("created_at", { ascending: false }),
    ]);
    setAffiliates((affRes.data as Affiliate[]) || []);
    setReferrals((refRes.data as Referral[]) || []);
    setPayouts((payRes.data as Payout[]) || []);
    setInvoices((invRes.data as Invoice[]) || []);
    setCancelledEmails(new Set((subRes.data || []).map((s: any) => s.customer_email?.toLowerCase()).filter(Boolean)));
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);
  const { lastRefreshed } = useAutoRefresh(fetchAll);

  const counts = useMemo(() => ({
    all: affiliates.length,
    active: affiliates.filter((a) => a.status === "active").length,
    suspended: affiliates.filter((a) => a.status === "suspended").length,
  }), [affiliates]);

  const filtered = useMemo(() => {
    return affiliates.filter((a) => {
      if (statusFilter !== "all" && a.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          a.email?.toLowerCase().includes(q) ||
          a.display_name?.toLowerCase().includes(q) ||
          a.affiliate_code?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [affiliates, statusFilter, search]);

  const totalActiveReferrals = useMemo(() => {
    const emails = new Set(
      referrals
        .filter((r) => r.customer_email && !cancelledEmails.has(r.customer_email.toLowerCase()))
        .map((r) => r.customer_email)
    );
    return emails.size;
  }, [referrals, cancelledEmails]);

  const mrrCommissions = useMemo(() => referrals
    .filter((r) =>
      r.referral_type === "recurring" &&
      r.status !== "paid" &&
      r.customer_email &&
      !cancelledEmails.has(r.customer_email.toLowerCase())
    )
    .reduce((s, r) => s + Number(r.commission_amount), 0),
    [referrals, cancelledEmails]
  );

  const totalPaidOut = useMemo(() =>
    payouts.filter((p) => p.status === "paid").reduce((s, p) => s + Number(p.amount), 0),
    [payouts]
  );

  const getAffiliateReferralCount = (id: string) => {
    const emails = new Set(
      referrals
        .filter((r) => r.affiliate_id === id && r.customer_email && !cancelledEmails.has(r.customer_email.toLowerCase()))
        .map((r) => r.customer_email)
    );
    return emails.size;
  };
  const getAffiliateEarnings = (id: string) =>
    referrals
      .filter((r) => r.affiliate_id === id && !(r.customer_email && cancelledEmails.has(r.customer_email.toLowerCase())))
      .reduce((s, r) => s + Number(r.commission_amount), 0);

  const getAffiliateReferrals = (id: string) => referrals.filter((r) => r.affiliate_id === id);
  const getAffiliatePayouts = (id: string) => payouts.filter((p) => p.affiliate_id === id);
  const getAffiliateInvoices = (id: string) => invoices.filter((i) => i.affiliate_id === id);
  const getInvoiceForPayout = (payoutId: string) => invoices.find((i) => i.payout_id === payoutId);

  const handleViewInvoice = async (pdfPath: string | null) => {
    if (!pdfPath) {
      toast.error("No invoice file available");
      return;
    }
    const { data, error } = await supabase.storage.from("affiliate-invoices").createSignedUrl(pdfPath, 3600);
    if (error || !data?.signedUrl) {
      toast.error("Failed to generate invoice URL");
      return;
    }
    window.open(data.signedUrl, "_blank");
  };

  const handleRegenerateInvoice = async (payoutId: string) => {
    toast.loading("Regenerating invoice...", { id: "regen" });
    try {
      const { data, error } = await supabase.functions.invoke("generate-self-billing-invoice", {
        body: { payoutId },
      });
      if (error) {
        toast.error("Failed to regenerate invoice", { id: "regen" });
      } else {
        toast.success(`Invoice ${data?.invoiceNumber || ""} regenerated`, { id: "regen" });
        fetchAll();
      }
    } catch {
      toast.error("Failed to regenerate invoice", { id: "regen" });
    }
  };

  const handleCreatePayout = async () => {
    if (!payoutAffiliateId || !payoutAmount || Number(payoutAmount) <= 0) {
      toast.error("Please select an affiliate and enter a valid amount");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("affiliate_payouts").insert({
      affiliate_id: payoutAffiliateId,
      amount: Number(payoutAmount),
      currency: "EUR",
      status: "pending",
      notes: payoutNotes || null,
    });
    setSubmitting(false);
    if (error) {
      toast.error("Failed to create payout");
    } else {
      toast.success("Payout created");
      setPayoutDialog(false);
      setPayoutAmount("");
      setPayoutNotes("");
      fetchAll();
    }
  };

  const handleExecuteRevolutPayout = async (payoutId: string) => {
    setExecutingPayoutId(payoutId);
    toast.loading("Executing Revolut payout...", { id: "revolut-payout" });
    try {
      const { data, error } = await supabase.functions.invoke("revolut-execute-payout", {
        body: { payoutId },
      });
      if (error) {
        toast.error(`Payout failed: ${error.message}`, { id: "revolut-payout" });
        return;
      }
      if (data?.error) {
        toast.error(`Payout failed: ${data.error}`, { id: "revolut-payout" });
        return;
      }
      toast.success(`Payout executed! Transaction: ${data?.transactionId?.slice(0, 12)}...`, { id: "revolut-payout" });
      fetchAll();
    } catch {
      toast.error("Failed to execute payout", { id: "revolut-payout" });
    } finally {
      setExecutingPayoutId(null);
    }
  };

  const handleUpdatePayoutStatus = async (id: string, newStatus: string) => {
    const update: any = { status: newStatus };
    if (newStatus === "paid") update.payout_date = new Date().toISOString();
    const { error } = await supabase.from("affiliate_payouts").update(update).eq("id", id);
    if (error) {
      toast.error("Failed to update payout");
    } else {
      toast.success(`Payout marked as ${newStatus}`);
      if (newStatus === "paid") {
        const payout = payouts.find((p) => p.id === id);
        if (payout) {
          try {
            const { data: invoiceData, error: invoiceError } = await supabase.functions.invoke(
              "generate-self-billing-invoice",
              { body: { payoutId: id } }
            );
            if (invoiceError) {
              console.error("Invoice generation error:", invoiceError);
              toast.error("Payout completed but invoice generation failed");
            } else {
              toast.success(`Invoice ${invoiceData?.invoiceNumber || ""} generated and sent`);
            }
          } catch (err) {
            console.error("Invoice generation error:", err);
          }

          await supabase
            .from("affiliate_referrals")
            .update({ status: "paid" })
            .eq("affiliate_id", payout.affiliate_id)
            .eq("status", "approved");

          const affRefs = referrals.filter((r) => r.affiliate_id === payout.affiliate_id && r.customer_email);
          for (const ref of affRefs) {
            if (ref.customer_email && cancelledEmails.has(ref.customer_email.toLowerCase())) {
              await supabase.from("affiliate_referrals").update({ status: "cancelled" }).eq("id", ref.id);
            }
          }
        }
      }
      fetchAll();
    }
  };

  const handleApproveReferral = async (id: string) => {
    const { error } = await supabase.from("affiliate_referrals").update({ status: "approved" }).eq("id", id);
    if (error) toast.error("Failed to approve");
    else { toast.success("Referral approved"); fetchAll(); }
  };

  const handleToggleAffiliateStatus = async (id: string, current: string) => {
    const newStatus = current === "active" ? "suspended" : "active";
    const { error } = await supabase.from("affiliates").update({ status: newStatus }).eq("id", id);
    if (error) toast.error("Failed to update");
    else { toast.success(`Affiliate ${newStatus}`); fetchAll(); }
  };

  const affReferrals = selectedAffiliate
    ? getAffiliateReferrals(selectedAffiliate.id).filter(
        (r) => r.status !== "paid" && !(r.customer_email && cancelledEmails.has(r.customer_email.toLowerCase()))
      )
    : [];
  const affPayouts = selectedAffiliate ? getAffiliatePayouts(selectedAffiliate.id) : [];
  const affInvoices = selectedAffiliate ? getAffiliateInvoices(selectedAffiliate.id) : [];

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-[1400px] admin-page">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-syne font-semibold text-[26px]" style={{ color: "var(--ad-text)", letterSpacing: "-0.02em" }}>
            Affiliates
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--ad-text-secondary)" }}>
            Manage affiliates, referrals and payouts
          </p>
        </div>
        <div className="flex items-center gap-3">
          <LiveIndicator timestamp={lastRefreshed} />
          <button
            type="button"
            onClick={() => { setPayoutAffiliateId(""); setPayoutDialog(true); }}
            className="admin-btn-primary inline-flex items-center gap-1.5 px-3 h-8 text-[12px]"
          >
            <Plus className="w-3.5 h-3.5" /> Create Payout
          </button>
        </div>
      </div>

      {/* KPIs */}
      {loading ? (
        <KPISkeleton count={4} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <AdminKPICard label="Total Affiliates" value={affiliates.length} numericValue={affiliates.length} icon={Users} />
          <AdminKPICard label="Active Referrals" value={totalActiveReferrals} numericValue={totalActiveReferrals} icon={TrendingUp} delay={0.05} />
          <AdminKPICard
            label="MRR Commissions"
            value={mrrCommissions}
            numericValue={mrrCommissions}
            prefix="€"
            format={(n) => n.toFixed(2)}
            icon={Euro}
            delay={0.1}
          />
          <AdminKPICard
            label="Total Paid Out"
            value={totalPaidOut}
            numericValue={totalPaidOut}
            prefix="€"
            format={(n) => n.toFixed(2)}
            icon={CheckCircle2}
            delay={0.15}
          />
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <FilterTabs
          value={statusFilter}
          onChange={(v) => setStatusFilter(v as StatusFilter)}
          items={[
            { id: "all", label: "All", count: counts.all },
            { id: "active", label: "Active", count: counts.active },
            { id: "suspended", label: "Suspended", count: counts.suspended },
          ]}
        />
        <div className="flex items-center gap-2 flex-1 sm:flex-none sm:w-72">
          <StatChip label="shown" value={String(filtered.length)} />
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search affiliates..."
          />
        </div>
      </div>

      {/* Table */}
      <div className="admin-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-0 hover:bg-transparent">
              <TableHead className="admin-table-head">Affiliate</TableHead>
              <TableHead className="admin-table-head">Code</TableHead>
              <TableHead className="admin-table-head">Referrals</TableHead>
              <TableHead className="admin-table-head">Earnings</TableHead>
              <TableHead className="admin-table-head">Status</TableHead>
              <TableHead className="admin-table-head">Joined</TableHead>
              <TableHead className="admin-table-head w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7} className="p-0"><TableSkeleton rows={6} cols={7} /></TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={7}><EmptyState title="No affiliates found" description={search ? "Try adjusting your search." : "No affiliates registered yet."} icon={Users} /></TableCell></TableRow>
            ) : (
              filtered.map((a) => (
                <TableRow
                  key={a.id}
                  className="admin-row admin-table-row cursor-pointer border-0"
                  onClick={() => setSelectedAffiliate(a)}
                >
                  <TableCell className="py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar email={a.email} name={a.display_name} size={28} />
                      <div className="flex flex-col min-w-0">
                        <span className="text-[13px] truncate" style={{ color: "var(--ad-text)" }}>
                          {a.display_name || a.email.split("@")[0]}
                        </span>
                        <span className="text-[11px] truncate" style={{ color: "var(--ad-text-faint)" }}>
                          {a.email}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <MonoChip value={a.affiliate_code} />
                  </TableCell>
                  <TableCell className="py-3 font-mono-jb text-[13px]" style={{ color: "var(--ad-text)" }}>
                    {getAffiliateReferralCount(a.id)}
                  </TableCell>
                  <TableCell className="py-3 font-mono-jb text-[13px]" style={{ color: "var(--ad-text)" }}>
                    €{getAffiliateEarnings(a.id).toFixed(2)}
                  </TableCell>
                  <TableCell className="py-3">
                    <StatusBadge status={a.status} />
                  </TableCell>
                  <TableCell className="py-3 text-[12px]" style={{ color: "var(--ad-text-secondary)" }}>
                    {format(new Date(a.created_at), "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell className="py-3" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className="w-7 h-7 rounded-md inline-flex items-center justify-center transition-colors hover:bg-white/[0.05]"
                          aria-label="Open actions"
                        >
                          <MoreHorizontal className="w-4 h-4" style={{ color: "var(--ad-text-soft)" }} />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem onClick={() => setSelectedAffiliate(a)}>
                          View details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { setPayoutAffiliateId(a.id); setPayoutDialog(true); }}>
                          New payout
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => { navigator.clipboard.writeText(a.affiliate_code); toast.success("Code copied"); }}
                        >
                          Copy code
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className={a.status === "active" ? "text-destructive focus:text-destructive" : ""}
                          onClick={() => handleToggleAffiliateStatus(a.id, a.status)}
                        >
                          {a.status === "active" ? "Suspend" : "Activate"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Detail Slide Panel */}
      <SlidePanel open={!!selectedAffiliate} onClose={() => setSelectedAffiliate(null)} width={460}>
        {selectedAffiliate && (
          <>
            {/* Header */}
            <div className="px-6 pt-6 pb-5">
              <div className="flex items-start gap-3">
                <Avatar email={selectedAffiliate.email} name={selectedAffiliate.display_name} size={44} />
                <div className="flex-1 min-w-0 pr-8">
                  <h2 className="font-syne font-semibold text-[18px] truncate" style={{ color: "var(--ad-text)" }}>
                    {selectedAffiliate.display_name || selectedAffiliate.email.split("@")[0]}
                  </h2>
                  <p className="text-[12px] truncate" style={{ color: "var(--ad-text-secondary)" }}>
                    {selectedAffiliate.email}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <StatusBadge status={selectedAffiliate.status} />
                    <MonoChip value={selectedAffiliate.affiliate_code} />
                  </div>
                </div>
              </div>
            </div>

            <SlideSection title="Overview">
              <SlideRow label="Referrals" value={<span className="font-mono-jb">{getAffiliateReferralCount(selectedAffiliate.id)}</span>} />
              <SlideRow label="Total Earnings" value={<span className="font-mono-jb">€{getAffiliateEarnings(selectedAffiliate.id).toFixed(2)}</span>} />
              <SlideRow label="Joined" value={format(new Date(selectedAffiliate.created_at), "MMM dd, yyyy")} />
            </SlideSection>

            <SlideSection title={`Active Referrals (${affReferrals.length})`}>
              {affReferrals.length === 0 ? (
                <p className="text-[12px]" style={{ color: "var(--ad-text-faint)" }}>No active referrals</p>
              ) : (
                <div className="space-y-1.5 max-h-[260px] overflow-y-auto">
                  {affReferrals.map((r) => (
                    <div
                      key={r.id}
                      className="rounded-md p-2.5"
                      style={{ background: "var(--ad-surface-deep)", border: "1px solid var(--ad-border-subtle)" }}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-[12px] truncate" style={{ color: "var(--ad-text)" }}>
                          {r.customer_email || "—"}
                        </span>
                        <span className="font-mono-jb text-[12px]" style={{ color: "var(--ad-text)" }}>
                          €{Number(r.commission_amount).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <StatusBadge status={r.referral_type === "signup_bonus" ? "bonus" : r.referral_type} />
                          <StatusBadge status={r.status} />
                        </div>
                        {r.status === "pending" && (
                          <button
                            type="button"
                            onClick={() => handleApproveReferral(r.id)}
                            className="text-[11px] hover:underline"
                            style={{ color: "var(--ad-accent-soft)" }}
                          >
                            Approve
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </SlideSection>

            <SlideSection title={`Payouts (${affPayouts.length})`}>
              <div className="flex justify-end mb-2">
                <button
                  type="button"
                  onClick={() => { setPayoutAffiliateId(selectedAffiliate.id); setPayoutDialog(true); }}
                  className="admin-btn-ghost inline-flex items-center gap-1.5 px-2 h-7 text-[11px]"
                >
                  <Plus className="w-3 h-3" /> New payout
                </button>
              </div>
              {affPayouts.length === 0 ? (
                <p className="text-[12px]" style={{ color: "var(--ad-text-faint)" }}>No payouts yet</p>
              ) : (
                <div className="space-y-1.5 max-h-[280px] overflow-y-auto">
                  {affPayouts.map((p) => {
                    const invoice = getInvoiceForPayout(p.id);
                    return (
                      <div
                        key={p.id}
                        className="rounded-md p-2.5"
                        style={{ background: "var(--ad-surface-deep)", border: "1px solid var(--ad-border-subtle)" }}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-mono-jb text-[13px]" style={{ color: "var(--ad-text)" }}>
                            €{Number(p.amount).toFixed(2)}
                          </span>
                          <StatusBadge status={p.status} />
                        </div>
                        <div className="flex items-center justify-between text-[11px] mb-1.5" style={{ color: "var(--ad-text-faint)" }}>
                          <span className="truncate">{p.notes || "—"}</span>
                          <span>{p.payout_date ? format(new Date(p.payout_date), "MMM dd") : format(new Date(p.created_at), "MMM dd")}</span>
                        </div>

                        {p.status === "paid" && (
                          <div className="flex items-center justify-between gap-2 mt-2 pt-2" style={{ borderTop: "1px solid var(--ad-border-subtle)" }}>
                            {invoice ? (
                              <div className="flex items-center gap-1.5 text-[11px]" style={{ color: "var(--ad-green)" }}>
                                <CheckCircle2 className="w-3 h-3" />
                                <span className="font-mono-jb">{invoice.invoice_number}</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 text-[11px]" style={{ color: "var(--ad-amber-text)" }}>
                                <AlertCircle className="w-3 h-3" /> No invoice
                              </div>
                            )}
                            {invoice?.pdf_path ? (
                              <button
                                type="button"
                                onClick={() => handleViewInvoice(invoice.pdf_path)}
                                className="inline-flex items-center gap-1 text-[11px] hover:underline"
                                style={{ color: "var(--ad-accent-soft)" }}
                              >
                                <ExternalLink className="w-3 h-3" /> View
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleRegenerateInvoice(p.id)}
                                className="inline-flex items-center gap-1 text-[11px] hover:underline"
                                style={{ color: "var(--ad-amber-text)" }}
                              >
                                <RefreshCw className="w-3 h-3" /> Generate
                              </button>
                            )}
                          </div>
                        )}

                        {p.status === "pending" && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            <button
                              type="button"
                              disabled={executingPayoutId === p.id}
                              onClick={() => handleExecuteRevolutPayout(p.id)}
                              className="admin-btn-primary inline-flex items-center gap-1 px-2 h-6 text-[11px] disabled:opacity-60"
                            >
                              {executingPayoutId === p.id ? (
                                <><Loader2 className="w-3 h-3 animate-spin" /> Sending</>
                              ) : (
                                <><Zap className="w-3 h-3" /> Pay via Revolut</>
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdatePayoutStatus(p.id, "paid")}
                              className="admin-btn-ghost px-2 h-6 text-[11px]"
                            >
                              Mark paid
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdatePayoutStatus(p.id, "failed")}
                              className="admin-btn-destructive px-2 h-6 text-[11px]"
                            >
                              Failed
                            </button>
                          </div>
                        )}

                        {p.status === "processing" && !p.revolut_transaction_id && (
                          <div className="flex items-center gap-1.5 mt-2 text-[11px]" style={{ color: "var(--ad-accent-soft)" }}>
                            <Loader2 className="w-3 h-3 animate-spin" /> Processing via Revolut...
                          </div>
                        )}

                        {p.revolut_transaction_id && (
                          <div className="mt-2">
                            <MonoChip value={p.revolut_transaction_id} display={`TX ${p.revolut_transaction_id.slice(0, 12)}…`} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </SlideSection>

            <SlideSection title={`Invoices (${affInvoices.length})`}>
              {affInvoices.length === 0 ? (
                <p className="text-[12px]" style={{ color: "var(--ad-text-faint)" }}>No invoices yet</p>
              ) : (
                <div className="space-y-1.5 max-h-[240px] overflow-y-auto">
                  {affInvoices.map((inv) => (
                    <div
                      key={inv.id}
                      className="rounded-md p-2.5 flex items-center justify-between"
                      style={{ background: "var(--ad-surface-deep)", border: "1px solid var(--ad-border-subtle)" }}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--ad-text-faint)" }} />
                        <div className="min-w-0">
                          <div className="font-mono-jb text-[12px]" style={{ color: "var(--ad-text)" }}>
                            {inv.invoice_number}
                          </div>
                          <div className="text-[11px]" style={{ color: "var(--ad-text-faint)" }}>
                            €{Number(inv.amount).toFixed(2)} • {format(new Date(inv.issued_at), "MMM dd, yyyy")}
                          </div>
                        </div>
                      </div>
                      {inv.pdf_path && (
                        <button
                          type="button"
                          onClick={() => handleViewInvoice(inv.pdf_path)}
                          className="inline-flex items-center gap-1 text-[11px] hover:underline shrink-0"
                          style={{ color: "var(--ad-accent-soft)" }}
                        >
                          <ExternalLink className="w-3 h-3" /> View
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </SlideSection>

            <div className="px-6 py-5">
              <button
                type="button"
                onClick={() => handleToggleAffiliateStatus(selectedAffiliate.id, selectedAffiliate.status)}
                className={
                  selectedAffiliate.status === "active"
                    ? "admin-btn-destructive w-full inline-flex items-center justify-center gap-1.5 h-9 text-[12px]"
                    : "admin-btn-primary w-full inline-flex items-center justify-center gap-1.5 h-9 text-[12px]"
                }
              >
                {selectedAffiliate.status === "active" ? "Suspend affiliate" : "Activate affiliate"}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </>
        )}
      </SlidePanel>

      {/* Create Payout Dialog */}
      <Dialog open={payoutDialog} onOpenChange={setPayoutDialog}>
        <DialogContent className="sm:max-w-md" style={{ background: "var(--ad-surface)", border: "1px solid var(--ad-border)" }}>
          <DialogHeader>
            <DialogTitle className="font-syne font-semibold" style={{ color: "var(--ad-text)" }}>Create Payout</DialogTitle>
            <DialogDescription style={{ color: "var(--ad-text-secondary)" }}>
              Create a new payout for an affiliate. Use "Pay via Revolut" afterwards to send the transfer.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-[11px] uppercase tracking-wider" style={{ color: "var(--ad-text-faint)" }}>Affiliate</Label>
              <Select value={payoutAffiliateId} onValueChange={setPayoutAffiliateId}>
                <SelectTrigger><SelectValue placeholder="Select affiliate" /></SelectTrigger>
                <SelectContent>
                  {affiliates.filter((a) => a.status === "active").map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.email} ({a.affiliate_code})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] uppercase tracking-wider" style={{ color: "var(--ad-text-faint)" }}>Amount (EUR)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={payoutAmount}
                onChange={(e) => setPayoutAmount(e.target.value)}
                placeholder="0.00"
                className="font-mono-jb"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] uppercase tracking-wider" style={{ color: "var(--ad-text-faint)" }}>Notes (optional)</Label>
              <Input
                value={payoutNotes}
                onChange={(e) => setPayoutNotes(e.target.value)}
                placeholder="e.g. Monthly payout April 2026"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <button
              type="button"
              onClick={() => setPayoutDialog(false)}
              className="admin-btn-ghost px-3 h-8 text-[12px]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreatePayout}
              disabled={submitting}
              className="admin-btn-primary inline-flex items-center gap-1.5 px-3 h-8 text-[12px] disabled:opacity-60"
            >
              {submitting ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Creating</> : "Create payout"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
