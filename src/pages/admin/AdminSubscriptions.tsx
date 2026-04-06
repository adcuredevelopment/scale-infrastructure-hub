import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { Search, Filter, X, CalendarDays, Mail, CreditCard, Tag, Clock, Ban } from "lucide-react";
import { motion } from "framer-motion";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import { LastRefreshed } from "@/components/admin/LastRefreshed";
import { toast } from "sonner";

export default function AdminSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const fetchSubscriptions = useCallback(async () => {
    const { data } = await supabase
      .from("subscriptions")
      .select("*")
      .order("created_at", { ascending: false });
    setSubscriptions(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchSubscriptions(); }, [fetchSubscriptions]);
  const { lastRefreshed } = useAutoRefresh(fetchSubscriptions);

  const filtered = subscriptions.filter((s) => {
    const matchesSearch =
      s.customer_email?.toLowerCase().includes(search.toLowerCase()) ||
      s.plan_name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: "bg-emerald-500/15 text-emerald-500",
      cancelled: "bg-destructive/15 text-destructive",
      expired: "bg-amber-500/15 text-amber-500",
      pending: "bg-amber-500/15 text-amber-500",
    };
    return colors[status] || "bg-muted text-muted-foreground";
  };

  const handleCancel = async () => {
    if (!selected) return;
    setCancelling(true);
    try {
      const { data, error } = await supabase.functions.invoke("cancel-subscription", {
        body: { subscriptionId: selected.id },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success("Subscription cancelled successfully");
      setSelected(null);
      setShowConfirm(false);
      await fetchSubscriptions();
    } catch (err: any) {
      toast.error(err.message || "Failed to cancel subscription");
    } finally {
      setCancelling(false);
    }
  };

  const DetailRow = ({ icon: Icon, label, value }: { icon: any; label: string; value: React.ReactNode }) => (
    <div className="flex items-start gap-3 py-3 border-b border-border/20 last:border-0">
      <Icon className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm text-foreground mt-0.5 break-all">{value || "—"}</p>
      </div>
    </div>
  );

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Subscriptions</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage all customer subscriptions</p>
        </div>
        <LastRefreshed timestamp={lastRefreshed} />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by email or plan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-xl border border-border/30 bg-card/60 overflow-hidden"
      >
        <Table>
          <TableHeader>
            <TableRow className="border-border/20">
              <TableHead className="text-xs">Customer</TableHead>
              <TableHead className="text-xs">Plan</TableHead>
              <TableHead className="text-xs">Amount</TableHead>
              <TableHead className="text-xs">Status</TableHead>
              <TableHead className="text-xs">Started</TableHead>
              <TableHead className="text-xs">Next Billing</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Loading...</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No subscriptions found</TableCell></TableRow>
            ) : (
              filtered.map((s) => (
                <TableRow
                  key={s.id}
                  className="border-border/10 cursor-pointer hover:bg-muted/40 transition-colors"
                  onClick={() => setSelected(s)}
                >
                  <TableCell className="text-sm">{s.customer_email}</TableCell>
                  <TableCell className="text-sm font-medium">{s.plan_name}</TableCell>
                  <TableCell className="text-sm">€{Number(s.amount).toFixed(2)}</TableCell>
                  <TableCell>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${statusBadge(s.status)}`}>
                      {s.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{format(new Date(s.started_at), "MMM dd, yyyy")}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{s.expires_at && s.status === "active" ? format(new Date(s.expires_at), "MMM dd, yyyy") : "—"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </motion.div>

      {/* Subscription Detail Drawer */}
      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-lg font-display">Subscription Details</SheetTitle>
            <SheetDescription>View and manage this subscription</SheetDescription>
          </SheetHeader>

          {selected && (
            <div className="mt-6 space-y-1">
              <div className="flex items-center justify-between mb-4">
                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${statusBadge(selected.status)}`}>
                  {selected.status}
                </span>
                <span className="text-lg font-bold text-foreground">
                  €{Number(selected.amount).toFixed(2)}
                  <span className="text-xs font-normal text-muted-foreground ml-1">{selected.currency}</span>
                </span>
              </div>

              <DetailRow icon={Mail} label="Customer Email" value={selected.customer_email} />
              <DetailRow icon={CreditCard} label="Plan" value={selected.plan_name} />
              <DetailRow icon={CalendarDays} label="Started" value={format(new Date(selected.started_at), "MMMM dd, yyyy")} />
              <DetailRow icon={Clock} label="Next Billing" value={selected.expires_at && selected.status === "active" ? format(new Date(selected.expires_at), "MMMM dd, yyyy") : "—"} />
              {selected.cancelled_at && (
                <DetailRow icon={Ban} label="Cancelled" value={format(new Date(selected.cancelled_at), "MMMM dd, yyyy")} />
              )}
              {selected.customer_name && (
                <DetailRow icon={Mail} label="Customer Name" value={selected.customer_name} />
              )}
              {selected.affiliate_code && (
                <DetailRow icon={Tag} label="Affiliate Code" value={selected.affiliate_code} />
              )}
              {selected.revolut_subscription_id && (
                <DetailRow icon={CreditCard} label="Revolut ID" value={selected.revolut_subscription_id} />
              )}

              {selected.status === "active" && (
                <div className="pt-6">
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => setShowConfirm(true)}
                  >
                    <Ban className="w-4 h-4 mr-2" />
                    Cancel Subscription
                  </Button>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Cancellation Confirmation Dialog */}
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this subscription?</AlertDialogTitle>
            <AlertDialogDescription>
              This will cancel the subscription for <strong>{selected?.customer_email}</strong> ({selected?.plan_name}). 
              A cancellation email will be sent to the customer. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelling}>Keep Active</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              disabled={cancelling}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {cancelling ? "Cancelling..." : "Yes, Cancel Subscription"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
