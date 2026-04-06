import { useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Search, Filter, X } from "lucide-react";
import { motion } from "framer-motion";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import { LastRefreshed } from "@/components/admin/LastRefreshed";

const STATUS_OPTIONS = ["completed", "pending", "authorised", "failed", "expired"] as const;

export default function AdminPayments() {
  const [payments, setPayments] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const fetchPayments = useCallback(async () => {
    const { data } = await supabase
      .from("payments")
      .select("*")
      .order("created_at", { ascending: false });
    setPayments(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);
  const { lastRefreshed } = useAutoRefresh(fetchPayments);

  // Derive unique plans and status counts
  const plans = useMemo(() => {
    const set = new Set(
      payments.map((p) => (p.payload as any)?.plan).filter(Boolean)
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

  const filtered = payments.filter((p) => {
    const payload = p.payload as any;
    const matchesSearch =
      p.merchant_ref?.toLowerCase().includes(search.toLowerCase()) ||
      payload?.email?.toLowerCase().includes(search.toLowerCase()) ||
      payload?.plan?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    const matchesPlan = planFilter === "all" || (payload?.plan === planFilter);
    return matchesSearch && matchesStatus && matchesPlan;
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

  const hasActiveFilters = statusFilter !== "all" || planFilter !== "all" || search.length > 0;

  const clearFilters = () => {
    setStatusFilter("all");
    setPlanFilter("all");
    setSearch("");
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Payments</h1>
          <p className="text-sm text-muted-foreground mt-1">Track all payment transactions</p>
        </div>
        <LastRefreshed timestamp={lastRefreshed} />
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
            {status === "all" ? "All" : status.charAt(0).toUpperCase() + status.slice(1)}
            <span className="ml-1.5 opacity-70">{statusCounts[status] || 0}</span>
          </button>
        ))}
      </div>

      {/* Search + plan filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by email, plan or ref..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={planFilter} onValueChange={setPlanFilter}>
          <SelectTrigger className="w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="All Plans" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Plans</SelectItem>
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

      {/* Results count */}
      <p className="text-xs text-muted-foreground">
        Showing {filtered.length} of {payments.length} payments
      </p>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-border/30 bg-card/60 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border/20">
              <TableHead className="text-xs">Email</TableHead>
              <TableHead className="text-xs">Plan</TableHead>
              <TableHead className="text-xs">Amount</TableHead>
              <TableHead className="text-xs">Status</TableHead>
              <TableHead className="text-xs">Date</TableHead>
              <TableHead className="text-xs">Order ID</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Loading...</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No payments found</TableCell></TableRow>
            ) : (
              filtered.map((p) => {
                const payload = p.payload as any;
                return (
                  <TableRow key={p.id} className="border-border/10">
                    <TableCell className="text-sm">{payload?.email || "—"}</TableCell>
                    <TableCell className="text-sm font-medium">{payload?.plan || "—"}</TableCell>
                    <TableCell className="text-sm">€{payload?.amount || "—"}</TableCell>
                    <TableCell>
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${statusColor(p.status)}`}>{p.status}</span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{format(new Date(p.created_at), "MMM dd, yyyy HH:mm")}</TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono">{p.revolut_order_id?.slice(0, 12) || "—"}</TableCell>
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
