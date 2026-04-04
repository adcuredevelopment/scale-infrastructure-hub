import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { Search, Filter } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    const { data } = await supabase
      .from("subscriptions")
      .select("*")
      .order("created_at", { ascending: false });
    setSubscriptions(data || []);
    setLoading(false);
  };

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

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Subscriptions</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage all customer subscriptions</p>
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
              <TableHead className="text-xs">Expires</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Loading...</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No subscriptions found</TableCell></TableRow>
            ) : (
              filtered.map((s) => (
                <TableRow key={s.id} className="border-border/10">
                  <TableCell className="text-sm">{s.customer_email}</TableCell>
                  <TableCell className="text-sm font-medium">{s.plan_name}</TableCell>
                  <TableCell className="text-sm">€{Number(s.amount).toFixed(2)}</TableCell>
                  <TableCell>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${statusBadge(s.status)}`}>
                      {s.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{format(new Date(s.started_at), "MMM dd, yyyy")}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{s.expires_at ? format(new Date(s.expires_at), "MMM dd, yyyy") : "—"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </motion.div>
    </div>
  );
}
