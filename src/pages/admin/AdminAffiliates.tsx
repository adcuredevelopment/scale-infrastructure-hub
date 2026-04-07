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
import { Search, Users, DollarSign, TrendingUp, CreditCard, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { KPICard } from "@/components/admin/KPICard";
import { toast } from "sonner";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import { LastRefreshed } from "@/components/admin/LastRefreshed";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [payoutDialog, setPayoutDialog] = useState(false);
  const [payoutAffiliateId, setPayoutAffiliateId] = useState("");
  const [payoutAmount, setPayoutAmount] = useState("");
  const [payoutNotes, setPayoutNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [cancelledEmails, setCancelledEmails] = useState<Set<string>>(new Set());

  const fetchAll = useCallback(async () => {
    const [affRes, refRes, payRes, subRes] = await Promise.all([
      supabase.from("affiliates").select("*").order("created_at", { ascending: false }),
      supabase.from("affiliate_referrals").select("*").order("created_at", { ascending: false }),
      supabase.from("affiliate_payouts").select("*").order("created_at", { ascending: false }),
      supabase.from("subscriptions").select("customer_email, status").eq("status", "cancelled"),
    ]);
    setAffiliates((affRes.data as Affiliate[]) || []);
    setReferrals((refRes.data as Referral[]) || []);
    setPayouts((payRes.data as Payout[]) || []);
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

  const totalCommissions = referrals.reduce((s, r) => s + Number(r.commission_amount), 0);
  const pendingCommissions = referrals.filter((r) => r.status === "pending").reduce((s, r) => s + Number(r.commission_amount), 0);
  const totalPaidOut = payouts.filter((p) => p.status === "paid").reduce((s, p) => s + Number(p.amount), 0);

  const getAffiliateEmail = (id: string) => affiliates.find((a) => a.id === id)?.email || "—";
  const getAffiliateReferralCount = (id: string) => {
    const emails = new Set(referrals.filter((r) => r.affiliate_id === id && r.customer_email).map((r) => r.customer_email));
    return emails.size;
  };
  const getAffiliateEarnings = (id: string) => referrals.filter((r) => r.affiliate_id === id).reduce((s, r) => s + Number(r.commission_amount), 0);

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

  const handleUpdatePayoutStatus = async (id: string, newStatus: string) => {
    const update: any = { status: newStatus };
    if (newStatus === "paid") update.payout_date = new Date().toISOString();
    const { error } = await supabase.from("affiliate_payouts").update(update).eq("id", id);
    if (error) {
      toast.error("Failed to update payout");
    } else {
      toast.success(`Payout marked as ${newStatus}`);
      // Also mark referrals as paid if payout is paid
      if (newStatus === "paid") {
        const payout = payouts.find((p) => p.id === id);
        if (payout) {
          await supabase
            .from("affiliate_referrals")
            .update({ status: "paid" })
            .eq("affiliate_id", payout.affiliate_id)
            .eq("status", "approved");
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

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <KPICard title="Affiliates" value={affiliates.length.toString()} icon={Users} />
        <KPICard title="Total Referrals" value={new Set(referrals.filter(r => r.customer_email).map(r => r.customer_email)).size.toString()} icon={TrendingUp} delay={0.05} />
        <KPICard title="Total Commissions" value={`€${totalCommissions.toFixed(2)}`} icon={DollarSign} delay={0.1} />
        <KPICard title="Paid Out" value={`€${totalPaidOut.toFixed(2)}`} icon={CreditCard} change={`€${pendingCommissions.toFixed(2)} pending`} changeType="neutral" delay={0.15} />
      </div>

      <Tabs defaultValue="affiliates">
        <TabsList>
          <TabsTrigger value="affiliates">Affiliates</TabsTrigger>
          <TabsTrigger value="referrals">Referrals</TabsTrigger>
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
        </TabsList>

        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>

        <TabsContent value="affiliates" className="mt-4">
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
                    <TableRow key={a.id} className="border-border/10">
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
                        <Button variant="ghost" size="sm" className="text-xs" onClick={() => handleToggleAffiliateStatus(a.id, a.status)}>
                          {a.status === "active" ? "Suspend" : "Activate"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </motion.div>
        </TabsContent>

        <TabsContent value="referrals" className="mt-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-border/30 bg-card/60 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border/20">
                  <TableHead className="text-xs">Affiliate</TableHead>
                  <TableHead className="text-xs">Customer</TableHead>
                   <TableHead className="text-xs">Plan</TableHead>
                   <TableHead className="text-xs">Type</TableHead>
                   <TableHead className="text-xs">Amount</TableHead>
                   <TableHead className="text-xs">Commission</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Date</TableHead>
                  <TableHead className="text-xs">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">Loading...</TableCell></TableRow>
                 ) : referrals.length === 0 ? (
                   <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground py-8">No referrals yet</TableCell></TableRow>
                ) : (
                  referrals.map((r) => (
                    <TableRow key={r.id} className="border-border/10">
                      <TableCell className="text-sm">{getAffiliateEmail(r.affiliate_id)}</TableCell>
                      <TableCell className="text-sm">{r.customer_email || "—"}</TableCell>
                      <TableCell className="text-sm">{r.plan_name || "—"}</TableCell>
                       <TableCell>
                         {(() => {
                           const isCancelled = r.referral_type === "recurring" && r.customer_email && cancelledEmails.has(r.customer_email.toLowerCase());
                           return (
                             <Badge variant="outline" className={
                               r.referral_type === "signup_bonus"
                                 ? "bg-purple-500/15 text-purple-400 border-purple-500/20"
                                 : isCancelled
                                   ? "bg-red-500/15 text-red-400 border-red-500/20"
                                   : "bg-blue-500/15 text-blue-400 border-blue-500/20"
                             }>
                               {r.referral_type === "signup_bonus" ? "Bonus" : isCancelled ? "Cancelled" : "Recurring"}
                             </Badge>
                           );
                         })()}
                        </TableCell>
                       <TableCell className="text-sm">€{Number(r.payment_amount).toFixed(2)}</TableCell>
                      <TableCell className="text-sm font-medium">€{Number(r.commission_amount).toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusColors[r.status] || ""}>{r.status}</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{format(new Date(r.created_at), "MMM dd, yyyy")}</TableCell>
                      <TableCell>
                        {r.status === "pending" && (
                          <Button variant="ghost" size="sm" className="text-xs text-primary" onClick={() => handleApproveReferral(r.id)}>
                            Approve
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </motion.div>
        </TabsContent>

        <TabsContent value="payouts" className="mt-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-border/30 bg-card/60 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border/20">
                  <TableHead className="text-xs">Affiliate</TableHead>
                  <TableHead className="text-xs">Amount</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Payout Date</TableHead>
                  <TableHead className="text-xs">Notes</TableHead>
                  <TableHead className="text-xs">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Loading...</TableCell></TableRow>
                ) : payouts.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No payouts yet</TableCell></TableRow>
                ) : (
                  payouts.map((p) => (
                    <TableRow key={p.id} className="border-border/10">
                      <TableCell className="text-sm">{getAffiliateEmail(p.affiliate_id)}</TableCell>
                      <TableCell className="text-sm font-medium">€{Number(p.amount).toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusColors[p.status] || ""}>{p.status}</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {p.payout_date ? format(new Date(p.payout_date), "MMM dd, yyyy") : "—"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[150px] truncate">{p.notes || "—"}</TableCell>
                      <TableCell>
                        {p.status === "pending" && (
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" className="text-xs text-blue-400" onClick={() => handleUpdatePayoutStatus(p.id, "processing")}>
                              Process
                            </Button>
                            <Button variant="ghost" size="sm" className="text-xs text-primary" onClick={() => handleUpdatePayoutStatus(p.id, "paid")}>
                              Mark Paid
                            </Button>
                          </div>
                        )}
                        {p.status === "processing" && (
                          <Button variant="ghost" size="sm" className="text-xs text-primary" onClick={() => handleUpdatePayoutStatus(p.id, "paid")}>
                            Mark Paid
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </motion.div>
        </TabsContent>
      </Tabs>

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
