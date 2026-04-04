import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { Search, Filter } from "lucide-react";
import { motion } from "framer-motion";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";

export default function AdminPayments() {
  const [payments, setPayments] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      const { data } = await supabase
        .from("payments")
        .select("*")
        .order("created_at", { ascending: false });
      setPayments(data || []);
      setLoading(false);
    };
    fetchPayments();
  }, []);

  const filtered = payments.filter((p) => {
    const payload = p.payload as any;
    const matchesSearch =
      p.merchant_ref?.toLowerCase().includes(search.toLowerCase()) ||
      payload?.email?.toLowerCase().includes(search.toLowerCase()) ||
      payload?.plan?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-emerald-500/15 text-emerald-500";
      case "authorised": return "bg-primary/15 text-primary";
      case "pending": return "bg-amber-500/15 text-amber-500";
      case "failed": return "bg-destructive/15 text-destructive";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Payments</h1>
        <p className="text-sm text-muted-foreground mt-1">Track all payment transactions</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by email, plan or ref..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="authorised">Authorised</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

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
