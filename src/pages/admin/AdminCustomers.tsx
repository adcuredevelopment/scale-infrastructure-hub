import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { Search, Users, CreditCard, Wallet, X } from "lucide-react";
import { motion } from "framer-motion";
import { KPICard } from "@/components/admin/KPICard";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import { LastRefreshed } from "@/components/admin/LastRefreshed";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [customerSubs, setCustomerSubs] = useState<any[]>([]);
  const [customerPayments, setCustomerPayments] = useState<any[]>([]);
  const [drawerLoading, setDrawerLoading] = useState(false);

  const fetchCustomers = useCallback(async () => {
    const { data } = await supabase.from("customers").select("*").order("created_at", { ascending: false });
    setCustomers(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);
  const { lastRefreshed } = useAutoRefresh(fetchCustomers);

  const openCustomerDrawer = async (customer: any) => {
    setSelectedCustomer(customer);
    setDrawerLoading(true);
    const [subsRes, paymentsRes] = await Promise.all([
      supabase.from("subscriptions").select("*").eq("customer_email", customer.email).order("created_at", { ascending: false }),
      supabase.from("payments").select("*").order("created_at", { ascending: false }),
    ]);
    setCustomerSubs(subsRes.data || []);
    // Filter payments by email in payload
    const allPayments = paymentsRes.data || [];
    setCustomerPayments(allPayments.filter((p: any) => (p.payload as any)?.email === customer.email));
    setDrawerLoading(false);
  };

  const filtered = customers.filter((c) =>
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.name?.toLowerCase().includes(search.toLowerCase())
  );

  const totalSpent = customers.reduce((acc, c) => acc + Number(c.total_spent || 0), 0);
  const activeCount = customers.filter((c) => c.status === "active").length;

  const statusColor = (status: string) => {
    switch (status) {
      case "active": case "completed": return "bg-emerald-500/15 text-emerald-500";
      case "pending": return "bg-amber-500/15 text-amber-500";
      case "failed": case "cancelled": return "bg-destructive/15 text-destructive";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Customers</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your customer base</p>
        </div>
        <LastRefreshed timestamp={lastRefreshed} />
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
                <TableRow key={c.id} className="border-border/10 cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => openCustomerDrawer(c)}>
                  <TableCell className="text-sm">{c.email}</TableCell>
                  <TableCell className="text-sm">{c.name || "—"}</TableCell>
                  <TableCell className="text-sm font-medium">{c.plan || "—"}</TableCell>
                  <TableCell>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${statusColor(c.status)}`}>
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

      {/* Customer Detail Drawer */}
      <Sheet open={!!selectedCustomer} onOpenChange={(open) => !open && setSelectedCustomer(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="font-display">Customer Details</SheetTitle>
          </SheetHeader>
          {selectedCustomer && (
            <div className="mt-6 space-y-6">
              {/* Customer Info */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">Profile</h3>
                <div className="rounded-lg border border-border/30 bg-card/60 p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Email</span>
                    <span className="font-medium text-foreground">{selectedCustomer.email}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Name</span>
                    <span className="text-foreground">{selectedCustomer.name || "—"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Status</span>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${statusColor(selectedCustomer.status)}`}>{selectedCustomer.status}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Plan</span>
                    <span className="text-foreground">{selectedCustomer.plan || "—"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Spent</span>
                    <span className="font-medium text-foreground">€{Number(selectedCustomer.total_spent).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Joined</span>
                    <span className="text-foreground">{format(new Date(selectedCustomer.created_at), "MMM dd, yyyy")}</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Subscriptions */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">Subscriptions ({customerSubs.length})</h3>
                {drawerLoading ? (
                  <p className="text-sm text-muted-foreground">Loading...</p>
                ) : customerSubs.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No subscriptions</p>
                ) : (
                  <div className="space-y-2">
                    {customerSubs.map((s) => (
                      <div key={s.id} className="rounded-lg border border-border/30 bg-card/60 p-3 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-foreground">{s.plan_name}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${statusColor(s.status)}`}>{s.status}</span>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>€{Number(s.amount).toFixed(2)} / {s.currency}</span>
                          <span>{format(new Date(s.started_at), "MMM dd, yyyy")}</span>
                        </div>
                        {s.expires_at && (
                          <p className="text-xs text-muted-foreground">Expires: {format(new Date(s.expires_at), "MMM dd, yyyy")}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              {/* Payments */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">Payments ({customerPayments.length})</h3>
                {drawerLoading ? (
                  <p className="text-sm text-muted-foreground">Loading...</p>
                ) : customerPayments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No payments</p>
                ) : (
                  <div className="space-y-2">
                    {customerPayments.map((p) => {
                      const payload = p.payload as any;
                      return (
                        <div key={p.id} className="rounded-lg border border-border/30 bg-card/60 p-3 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-foreground">{payload?.plan || "Payment"}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${statusColor(p.status)}`}>{p.status}</span>
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>€{payload?.amount || "—"}</span>
                            <span>{format(new Date(p.created_at), "MMM dd, yyyy HH:mm")}</span>
                          </div>
                          {p.revolut_order_id && (
                            <p className="text-xs text-muted-foreground font-mono">ID: {p.revolut_order_id.slice(0, 12)}...</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
