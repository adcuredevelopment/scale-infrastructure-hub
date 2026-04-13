import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { Search, Users, DollarSign, TrendingUp, Plus, FileText, CheckCircle2, AlertCircle, ExternalLink, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { KPICard } from "@/components/admin/KPICard";
import { toast } from "sonner";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import { LastRefreshed } from "@/components/admin/LastRefreshed";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

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

const statusColors: Record<string, string> = {
  active: "bg-emerald-500/15 text-emerald-500 border-emerald-500/20",
  suspended: "bg-destructive/15 text-destructive border-destructive/20",
  pending: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
  approved: "bg-emerald-500/15 text-emerald-500 border-emerald-500/20",
  paid: "bg-primary/15 text-primary border-primary/20",
  processing: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  failed: "bg-destructive/15 text-destructive border-destructive/20",
};

export default function AdminAffiliates() {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [search, setSearch] = useState("");
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
    setCancelledEmails(new Set((subRes.data || []).map((s: any) => s.customer_email?.toLowerCase())));
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);
  const { lastRefreshed } = useAutoRefresh(fetchAll);

  const filtered = affiliates.filter((a) =>
    a.email?.toLowerCase().includes(search.toLowerCase()) ||
    a.display_name?.toLowerCase().includes(search.toLowerCase()) ||
    a.affiliate_code?.toLowerCase().includes(search.toLowerCase())
  );

  const mrrCommissions = referrals
    .filter((r) => r.referral_type === "recurring" && r.status !== "paid" && r.customer_email && !cancelledEmails.has(r.customer_email.toLowerCase()))
    .reduce((s, r) => s + Number(r.commission_amount), 0);

  const getAffiliateReferralCount = (id: string) => {
    const emails = new Set(referrals.filter((r) => r.affiliate_id === id && r.customer_email && !cancelledEmails.has(r.customer_email.toLowerCase())).map((r) => r.customer_email));
    return emails.size;
  };
  const getAffiliateEarnings = (id: string) => referrals.filter((r) => r.affiliate_id === id && !(r.customer_email && cancelledEmails.has(r.customer_email.toLowerCase()))).reduce((s, r) => s + Number(r.commission_amount), 0);

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
    } catch (err) {
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
              toast.success(`Invoice ${invoiceData?.invoiceNumber || ''} generated and sent`);
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
              await supabase.from("affiliate_referrals").delete().eq("id", ref.id);
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
        (r) => r.status !== "paid" && 
               !(r.customer_email && cancelledEmails.has(r.customer_email.toLowerCase()))
      )
    : [];
  const affPayouts = selectedAffiliate ? getAffiliatePayouts(selectedAffiliate.id) : [];
  const affInvoices = selectedAffiliate ? getAffiliateInvoices(selectedAffiliate.id) : [];

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Affiliates</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage affiliates, referrals and payouts</p>
          <LastRefreshed timestamp={lastRefreshed} />
        </div>
        <Button onClick={() => setPayoutDialog(true)} size="sm">
          <Plus className="w-4 h-4 mr-2" /> Create Payout
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard title="Affiliates" value={affiliates.length.toString()} icon={Users} />
        <KPICard title="Total Referrals" value={new Set(referrals.filter(r => r.customer_email && !cancelledEmails.has(r.customer_email.toLowerCase())).map(r => r.customer_email)).size.toString()} icon={TrendingUp} delay={0.05} />
        <KPICard title="MRR Commissions" value={`€${mrrCommissions.toFixed(2)}`} icon={DollarSign} delay={0.1} />
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search affiliates..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-border/30 bg-card/60 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border/20">
              <TableHead className="text-xs">Email</TableHead>
              <TableHead className="text-xs">Name</TableHead>
              <TableHead className="text-xs">Code</TableHead>
              <TableHead className="text-xs">Referrals</TableHead>
              <TableHead className="text-xs">Earnings</TableHead>
              <TableHead className="text-xs">Status</TableHead>
              <TableHead className="text-xs">Joined</TableHead>
              <TableHead className="text-xs">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">Loading...</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">No affiliates found</TableCell></TableRow>
            ) : (
              filtered.map((a) => (
                <TableRow key={a.id} className="border-border/10 cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => setSelectedAffiliate(a)}>
                  <TableCell className="text-sm">{a.email}</TableCell>
                  <TableCell className="text-sm">{a.display_name || "—"}</TableCell>
                  <TableCell className="text-sm font-mono text-primary">{a.affiliate_code}</TableCell>
                  <TableCell className="text-sm">{getAffiliateReferralCount(a.id)}</TableCell>
                  <TableCell className="text-sm">€{getAffiliateEarnings(a.id).toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusColors[a.status] || ""}>{a.status}</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{format(new Date(a.created_at), "MMM dd, yyyy")}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" className="text-xs" onClick={(e) => { e.stopPropagation(); handleToggleAffiliateStatus(a.id, a.status); }}>
                      {a.status === "active" ? "Suspend" : "Activate"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </motion.div>

      {/* Affiliate Detail Drawer */}
      <Sheet open={!!selectedAffiliate} onOpenChange={(open) => !open && setSelectedAffiliate(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="font-display">Affiliate Details</SheetTitle>
          </SheetHeader>
          {selectedAffiliate && (
            <div className="mt-6 space-y-6">
              {/* Profile */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">Profile</h3>
                <div className="rounded-lg border border-border/30 bg-card/60 p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Email</span>
                    <span className="font-medium text-foreground">{selectedAffiliate.email}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Name</span>
                    <span className="text-foreground">{selectedAffiliate.display_name || "—"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Code</span>
                    <span className="font-mono text-primary">{selectedAffiliate.affiliate_code}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Status</span>
                    <Badge variant="outline" className={statusColors[selectedAffiliate.status] || ""}>{selectedAffiliate.status}</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Earnings</span>
                    <span className="font-medium text-foreground">€{getAffiliateEarnings(selectedAffiliate.id).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Joined</span>
                    <span className="text-foreground">{format(new Date(selectedAffiliate.created_at), "MMM dd, yyyy")}</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Referrals */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">Referrals ({getAffiliateReferralCount(selectedAffiliate.id)})</h3>
                {affReferrals.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No referrals yet</p>
                ) : (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                    {affReferrals.map((r) => {
                      const isCancelled = r.referral_type === "recurring" && r.customer_email && cancelledEmails.has(r.customer_email.toLowerCase());
                      return (
                        <div key={r.id} className="rounded-lg border border-border/30 bg-card/60 p-3 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-foreground">{r.customer_email || "—"}</span>
                            <Badge variant="outline" className={
                              r.referral_type === "signup_bonus"
                                ? "bg-purple-500/15 text-purple-400 border-purple-500/20"
                                : isCancelled
                                  ? "bg-destructive/10 text-destructive border-destructive/20"
                                  : "bg-blue-500/15 text-blue-400 border-blue-500/20"
                            }>
                              {r.referral_type === "signup_bonus" ? "Bonus" : isCancelled ? "Cancelled" : "Recurring"}
                            </Badge>
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{r.plan_name || "—"}</span>
                            <span>€{Number(r.commission_amount).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <Badge variant="outline" className={`text-[10px] ${statusColors[r.status] || ""}`}>{r.status}</Badge>
                            <span>{format(new Date(r.created_at), "MMM dd, yyyy")}</span>
                          </div>
                          {r.status === "pending" && (
                            <Button variant="ghost" size="sm" className="text-xs text-primary h-6 px-2 mt-1" onClick={() => handleApproveReferral(r.id)}>
                              Approve
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <Separator />

              {/* Payouts */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">Payouts ({affPayouts.length})</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => {
                      setPayoutAffiliateId(selectedAffiliate.id);
                      setPayoutDialog(true);
                    }}
                  >
                    <Plus className="w-3 h-3 mr-1" /> New Payout
                  </Button>
                </div>
                {affPayouts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No payouts yet</p>
                ) : (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                    {affPayouts.map((p) => {
                      const invoice = getInvoiceForPayout(p.id);
                      return (
                        <div key={p.id} className="rounded-lg border border-border/30 bg-card/60 p-3 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-foreground">€{Number(p.amount).toFixed(2)}</span>
                            <Badge variant="outline" className={statusColors[p.status] || ""}>{p.status}</Badge>
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{p.notes || "—"}</span>
                            <span>{p.payout_date ? format(new Date(p.payout_date), "MMM dd, yyyy") : "—"}</span>
                          </div>
                          {/* Invoice info */}
                          {p.status === "paid" && (
                            <div className="flex items-center justify-between text-xs mt-1">
                              {invoice ? (
                                <div className="flex items-center gap-1.5 text-emerald-500">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>{invoice.invoice_number}</span>
                                  <span className="text-muted-foreground">• {format(new Date(invoice.issued_at), "MMM dd, yyyy")}</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5 text-yellow-400">
                                  <AlertCircle className="w-3 h-3" />
                                  <span>No invoice</span>
                                </div>
                              )}
                              <div className="flex gap-1">
                                {invoice?.pdf_path && (
                                  <Button variant="ghost" size="sm" className="text-xs h-6 px-2 text-primary" onClick={() => handleViewInvoice(invoice.pdf_path)}>
                                    <ExternalLink className="w-3 h-3 mr-1" /> View
                                  </Button>
                                )}
                                {!invoice && (
                                  <Button variant="ghost" size="sm" className="text-xs h-6 px-2 text-yellow-400" onClick={() => handleRegenerateInvoice(p.id)}>
                                    <RefreshCw className="w-3 h-3 mr-1" /> Generate
                                  </Button>
                                )}
                              </div>
                            </div>
                          )}
                          {/* Action buttons */}
                          {p.status === "pending" && (
                            <div className="flex gap-1 mt-1">
                              <Button variant="ghost" size="sm" className="text-xs text-blue-400 h-6 px-2" onClick={() => handleUpdatePayoutStatus(p.id, "processing")}>
                                Process
                              </Button>
                              <Button variant="ghost" size="sm" className="text-xs text-primary h-6 px-2" onClick={() => handleUpdatePayoutStatus(p.id, "paid")}>
                                Mark Paid
                              </Button>
                              <Button variant="ghost" size="sm" className="text-xs text-destructive h-6 px-2" onClick={() => handleUpdatePayoutStatus(p.id, "failed")}>
                                Failed
                              </Button>
                            </div>
                          )}
                          {p.status === "processing" && (
                            <div className="flex gap-1 mt-1">
                              <Button variant="ghost" size="sm" className="text-xs text-primary h-6 px-2" onClick={() => handleUpdatePayoutStatus(p.id, "paid")}>
                                Mark Paid
                              </Button>
                              <Button variant="ghost" size="sm" className="text-xs text-destructive h-6 px-2" onClick={() => handleUpdatePayoutStatus(p.id, "failed")}>
                                Failed
                              </Button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <Separator />

              {/* Invoices */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                  <FileText className="w-4 h-4" /> Invoices ({affInvoices.length})
                </h3>
                {affInvoices.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No invoices yet</p>
                ) : (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                    {affInvoices.map((inv) => (
                      <div key={inv.id} className="rounded-lg border border-border/30 bg-card/60 p-3 flex items-center justify-between">
                        <div className="space-y-0.5">
                          <span className="text-sm font-medium text-foreground">{inv.invoice_number}</span>
                          <div className="flex gap-2 text-xs text-muted-foreground">
                            <span>€{Number(inv.amount).toFixed(2)}</span>
                            <span>•</span>
                            <span>{format(new Date(inv.issued_at), "MMM dd, yyyy")}</span>
                          </div>
                        </div>
                        {inv.pdf_path && (
                          <Button variant="ghost" size="sm" className="text-xs h-7 text-primary" onClick={() => handleViewInvoice(inv.pdf_path)}>
                            <ExternalLink className="w-3 h-3 mr-1" /> View
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Create Payout Dialog */}
      <Dialog open={payoutDialog} onOpenChange={setPayoutDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Create Payout</DialogTitle>
            <DialogDescription>Create a new payout for an affiliate</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Affiliate</Label>
              <Select value={payoutAffiliateId} onValueChange={setPayoutAffiliateId}>
                <SelectTrigger><SelectValue placeholder="Select affiliate" /></SelectTrigger>
                <SelectContent>
                  {affiliates.filter((a) => a.status === "active").map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.email} ({a.affiliate_code})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Amount (EUR)</Label>
              <Input type="number" min="0" step="0.01" value={payoutAmount} onChange={(e) => setPayoutAmount(e.target.value)} placeholder="0.00" />
            </div>
            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Input value={payoutNotes} onChange={(e) => setPayoutNotes(e.target.value)} placeholder="e.g. Monthly payout April 2026" />
            </div>
            <Button onClick={handleCreatePayout} className="w-full" disabled={submitting}>
              {submitting ? "Creating..." : "Create Payout"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
