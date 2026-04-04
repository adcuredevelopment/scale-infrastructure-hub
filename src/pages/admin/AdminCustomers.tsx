import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { Search, Users } from "lucide-react";
import { motion } from "framer-motion";
import { KPICard } from "@/components/admin/KPICard";
import { CreditCard, Wallet } from "lucide-react";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("customers").select("*").order("created_at", { ascending: false });
      setCustomers(data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  const filtered = customers.filter((c) =>
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.name?.toLowerCase().includes(search.toLowerCase())
  );

  const totalSpent = customers.reduce((acc, c) => acc + Number(c.total_spent || 0), 0);
  const activeCount = customers.filter((c) => c.status === "active").length;

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Customers</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your customer base</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KPICard title="Total Customers" value={customers.length.toString()} icon={Users} />
        <KPICard title="Active" value={activeCount.toString()} icon={CreditCard} change={`${((activeCount / Math.max(customers.length, 1)) * 100).toFixed(0)}% active`} changeType="positive" delay={0.05} />
        <KPICard title="Total Revenue" value={`€${totalSpent.toLocaleString()}`} icon={Wallet} delay={0.1} />
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search customers..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-border/30 bg-card/60 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border/20">
              <TableHead className="text-xs">Email</TableHead>
              <TableHead className="text-xs">Name</TableHead>
              <TableHead className="text-xs">Plan</TableHead>
              <TableHead className="text-xs">Status</TableHead>
              <TableHead className="text-xs">Total Spent</TableHead>
              <TableHead className="text-xs">Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Loading...</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No customers found</TableCell></TableRow>
            ) : (
              filtered.map((c) => (
                <TableRow key={c.id} className="border-border/10">
                  <TableCell className="text-sm">{c.email}</TableCell>
                  <TableCell className="text-sm">{c.name || "—"}</TableCell>
                  <TableCell className="text-sm font-medium">{c.plan || "—"}</TableCell>
                  <TableCell>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${c.status === "active" ? "bg-emerald-500/15 text-emerald-500" : "bg-muted text-muted-foreground"}`}>
                      {c.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm">€{Number(c.total_spent).toFixed(2)}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{format(new Date(c.created_at), "MMM dd, yyyy")}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </motion.div>
    </div>
  );
}
