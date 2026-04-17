import { useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Search, Filter, X, FileDown, FilePlus2, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import { LastRefreshed } from "@/components/admin/LastRefreshed";
import { toast } from "sonner";

const STATUS_OPTIONS = ["completed", "pending", "authorised", "failed", "expired"] as const;
const TYPE_OPTIONS = [
  { value: "all", label: "All Types" },
  { value: "subscription", label: "Subscriptions" },
  { value: "shop_order", label: "Shop Orders" },
] as const;

const getPaymentType = (payload: any): "subscription" | "shop_order" => {
  return payload?.type === "shop_order" ? "shop_order" : "subscription";
};

const getProductOrPlan = (payload: any): string => {
  return payload?.type === "shop_order" ? (payload?.product || "—") : (payload?.plan || "—");
};

const getCategory = (payload: any): string => {
  if (payload?.type !== "shop_order") return "Subscription";
  return payload?.category
    ? String(payload.category)
        .split("-")
        .map((s: string) => s.charAt(0).toUpperCase() + s.slice(1))
        .join(" ")
    : "Shop";
};

const getAmount = (payload: any): string => {
  if (payload?.type === "shop_order") {
    const total = payload?.total ?? payload?.amount;
    return total !== undefined ? `€${Number(total).toFixed(2)}` : "—";
  }
  return payload?.amount !== undefined ? `€${payload.amount}` : "—";
};

export default function AdminPayments() {
  const [payments, setPayments] = useState<any[]>([]);
  const [invoiceMap, setInvoiceMap] = useState<Record<string, { invoice_number: string; pdf_path: string | null }>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "subscription" | "shop_order">("all");
  const [loading, setLoading] = useState(true);

  const fetchPayments = useCallback(async () => {
    const [{ data: pays }, { data: invs }] = await Promise.all([
      supabase.from("payments").select("*").order("created_at", { ascending: false }),
      supabase.from("customer_invoices").select("payment_id, invoice_number, pdf_path"),
    ]);
    setPayments(pays || []);
    const map: Record<string, { invoice_number: string; pdf_path: string | null }> = {};
    (invs || []).forEach((i: any) => { if (i.payment_id) map[i.payment_id] = { invoice_number: i.invoice_number, pdf_path: i.pdf_path }; });
    setInvoiceMap(map);
    setLoading(false);
  }, []);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);
  const { lastRefreshed } = useAutoRefresh(fetchPayments);

  const handleDownload = async (paymentId: string) => {
    const inv = invoiceMap[paymentId];
    if (!inv?.pdf_path) return;
    setBusyId(paymentId);
    const { data, error } = await supabase.storage
      .from("customer-invoices")
      .createSignedUrl(inv.pdf_path, 60 * 5);
    setBusyId(null);
    if (error || !data?.signedUrl) {
      toast.error("Could not generate download link");
      return;
    }
    window.open(data.signedUrl, "_blank");
  };

  const handleGenerate = async (paymentId: string, type: "shop_order" | "subscription_initial") => {
    setBusyId(paymentId);
    const { error } = await supabase.functions.invoke("generate-customer-invoice", {
      body: { paymentId, type },
    });
    setBusyId(null);
    if (error) {
      toast.error("Failed to generate invoice");
      return;
    }
    toast.success("Invoice generated");
    fetchPayments();
  };

  const plans = useMemo(() => {
    const set = new Set(
      payments.map((p) => getProductOrPlan(p.payload as any)).filter((v) => v && v !== "—")
    );
    return Array.from(set).sort();
  }, [payments]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: payments.length };
    for (const p of payments) {
      counts[p.status] = (counts[p.status] || 0) + 1;
    }
    return counts;
  }, [payments]);

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = { all: payments.length, subscription: 0, shop_order: 0 };
    for (const p of payments) {
      const t = getPaymentType(p.payload as any);
      counts[t] = (counts[t] || 0) + 1;
    }
    return counts;
  }, [payments]);

  const filtered = payments.filter((p) => {
    const payload = p.payload as any;
    const productOrPlan = getProductOrPlan(payload);
    const matchesSearch =
      p.merchant_ref?.toLowerCase().includes(search.toLowerCase()) ||
      payload?.email?.toLowerCase().includes(search.toLowerCase()) ||
      productOrPlan.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    const matchesPlan = planFilter === "all" || productOrPlan === planFilter;
    const matchesType = typeFilter === "all" || getPaymentType(payload) === typeFilter;
    return matchesSearch && matchesStatus && matchesPlan && matchesType;
  });

  const statusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-emerald-500/15 text-emerald-500";
      case "authorised": return "bg-primary/15 text-primary";
      case "pending": return "bg-amber-500/15 text-amber-500";
      case "expired": return "bg-muted text-muted-foreground";
      case "failed": return "bg-destructive/15 text-destructive";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const typeBadge = (type: "subscription" | "shop_order") =>
    type === "shop_order"
      ? "bg-purple-500/15 text-purple-500"
      : "bg-blue-500/15 text-blue-500";

  const hasActiveFilters =
    statusFilter !== "all" || planFilter !== "all" || typeFilter !== "all" || search.length > 0;

  const clearFilters = () => {
    setStatusFilter("all");
    setPlanFilter("all");
    setTypeFilter("all");
    setSearch("");
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Payments</h1>
          <p className="text-sm text-muted-foreground mt-1">Track all subscriptions and shop orders</p>
        </div>
        <LastRefreshed timestamp={lastRefreshed} />
      </div>

      {/* Type chips */}
      <div className="flex flex-wrap gap-2">
        {TYPE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setTypeFilter(opt.value as any)}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all border ${
              typeFilter === opt.value
                ? "bg-primary/15 text-primary border-primary/30"
                : "bg-card/60 text-muted-foreground border-border/30 hover:border-border/60"
            }`}
          >
            {opt.label}
            <span className="ml-1.5 opacity-70">{typeCounts[opt.value] || 0}</span>
          </button>
        ))}
      </div>

      {/* Quick status chips */}
      <div className="flex flex-wrap gap-2">
        {["all", ...STATUS_OPTIONS].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all border ${
              statusFilter === status
                ? "bg-primary/15 text-primary border-primary/30"
                : "bg-card/60 text-muted-foreground border-border/30 hover:border-border/60"
            }`}
          >
            {status === "all" ? "All Statuses" : status.charAt(0).toUpperCase() + status.slice(1)}
            <span className="ml-1.5 opacity-70">{statusCounts[status] || 0}</span>
          </button>
        ))}
      </div>

      {/* Search + plan filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by email, product, plan or ref..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={planFilter} onValueChange={setPlanFilter}>
          <SelectTrigger className="w-56">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="All Products / Plans" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Products / Plans</SelectItem>
            {plans.map((p) => (
              <SelectItem key={p} value={p}>{p}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground h-10">
            <X className="w-4 h-4 mr-1" /> Clear
          </Button>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Showing {filtered.length} of {payments.length} payments
      </p>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-border/30 bg-card/60 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border/20">
              <TableHead className="text-xs">Type</TableHead>
              <TableHead className="text-xs">Email</TableHead>
              <TableHead className="text-xs">Product / Plan</TableHead>
              <TableHead className="text-xs">Category</TableHead>
              <TableHead className="text-xs">Amount</TableHead>
              <TableHead className="text-xs">Status</TableHead>
              <TableHead className="text-xs">Date</TableHead>
              <TableHead className="text-xs">Order ID</TableHead>
              <TableHead className="text-xs">Invoice</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground py-8">Loading...</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground py-8">No payments found</TableCell></TableRow>
            ) : (
              filtered.map((p) => {
                const payload = p.payload as any;
                const type = getPaymentType(payload);
                const inv = invoiceMap[p.id];
                const canGenerate = p.status === "completed";
                return (
                  <TableRow key={p.id} className="border-border/10">
                    <TableCell>
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${typeBadge(type)}`}>
                        {type === "shop_order" ? "Shop" : "Subscription"}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">{payload?.email || "—"}</TableCell>
                    <TableCell className="text-sm font-medium max-w-[240px] truncate" title={getProductOrPlan(payload)}>
                      {getProductOrPlan(payload)}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{getCategory(payload)}</TableCell>
                    <TableCell className="text-sm">{getAmount(payload)}</TableCell>
                    <TableCell>
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${statusColor(p.status)}`}>{p.status}</span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{format(new Date(p.created_at), "MMM dd, yyyy HH:mm")}</TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono">{p.revolut_order_id?.slice(0, 12) || "—"}</TableCell>
                    <TableCell>
                      {inv ? (
                        <Button size="sm" variant="ghost" className="h-7 text-xs gap-1.5"
                          onClick={() => handleDownload(p.id)}
                          disabled={busyId === p.id || !inv.pdf_path}
                          title={inv.invoice_number}>
                          {busyId === p.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <FileDown className="w-3 h-3" />}
                          PDF
                        </Button>
                      ) : canGenerate ? (
                        <Button size="sm" variant="ghost" className="h-7 text-xs gap-1.5 text-muted-foreground"
                          onClick={() => handleGenerate(p.id, type === "shop_order" ? "shop_order" : "subscription_initial")}
                          disabled={busyId === p.id}>
                          {busyId === p.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <FilePlus2 className="w-3 h-3" />}
                          Generate
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </motion.div>
    </div>
  );
}
