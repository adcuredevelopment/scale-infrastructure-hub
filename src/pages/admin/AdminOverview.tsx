import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { KPICard } from "@/components/admin/KPICard";
import { Users, CreditCard, TrendingUp, Wallet, Bell, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { toast } from "sonner";

export default function AdminOverview() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    activeSubscriptions: 0,
    totalCustomers: 0,
    pendingPayments: 0,
  });
  const [recentPayments, setRecentPayments] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke('revolut-sync-orders');
      if (error) throw error;
      toast.success(`Synced! ${data.new_synced} new, ${data.updated} updated from ${data.total_orders} orders`);
      await fetchDashboardData();
    } catch (err: any) {
      toast.error('Sync failed: ' + (err.message || 'Unknown error'));
    } finally {
      setSyncing(false);
    }
  };

  const fetchDashboardData = async () => {
    const [subsRes, custRes, paymentsRes, notifsRes, allPaymentsRes] = await Promise.all([
      supabase.from("subscriptions").select("*"),
      supabase.from("customers").select("*"),
      supabase.from("payments").select("*").order("created_at", { ascending: false }).limit(10),
      supabase.from("notifications").select("*").eq("read", false).order("created_at", { ascending: false }).limit(5),
      supabase.from("payments").select("*").order("created_at", { ascending: false }),
    ]);

    const subs = subsRes.data || [];
    const custs = custRes.data || [];
    const payments = paymentsRes.data || [];
    const allPayments = allPaymentsRes.data || [];
    const notifs = notifsRes.data || [];

    const activeSubs = subs.filter((s) => s.status === "active").length;
    const totalRevenue = subs.reduce((acc, s) => acc + Number(s.amount || 0), 0);

    setStats({
      totalRevenue,
      activeSubscriptions: activeSubs,
      totalCustomers: custs.length,
      pendingPayments: payments.filter((p) => p.status === "pending").length,
    });

    setRecentPayments(payments);
    setNotifications(notifs);

    // Build chart data from ALL payments (last 7 days)
    const days: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days[format(d, "MMM dd")] = 0;
    }
    allPayments
      .filter((p) => p.status === "completed")
      .forEach((p) => {
        const key = format(new Date(p.created_at), "MMM dd");
        if (key in days) {
          const payload = p.payload as any;
          days[key] += Number(payload?.amount || 0);
        }
      });
    setChartData(Object.entries(days).map(([date, amount]) => ({ date, amount })));
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-emerald-500/15 text-emerald-500";
      case "pending": return "bg-amber-500/15 text-amber-500";
      case "failed": return "bg-destructive/15 text-destructive";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Dashboard Overview</h1>
          <p className="text-sm text-muted-foreground mt-1">Real-time view of your business metrics</p>
        </div>
        <Button onClick={handleSync} disabled={syncing} variant="outline" size="sm" className="gap-2">
          <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Syncing...' : 'Sync Revolut'}
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total Revenue" value={`€${stats.totalRevenue.toLocaleString()}`} icon={Wallet} change="+12% this month" changeType="positive" delay={0} />
        <KPICard title="Active Subscriptions" value={stats.activeSubscriptions.toString()} icon={CreditCard} change="+3 this week" changeType="positive" delay={0.05} />
        <KPICard title="Total Customers" value={stats.totalCustomers.toString()} icon={Users} change="+5 new" changeType="positive" delay={0.1} />
        <KPICard title="Pending Payments" value={stats.pendingPayments.toString()} icon={TrendingUp} delay={0.15} />
      </div>

      {/* Revenue Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-xl border border-border/30 bg-card/60 p-5"
      >
        <h2 className="text-sm font-semibold text-foreground mb-4">Revenue (Last 7 Days)</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(213, 94%, 52%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(213, 94%, 52%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 16%, 16%)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(215, 15%, 55%)" }} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(215, 15%, 55%)" }} />
              <Tooltip
                contentStyle={{ background: "hsl(220, 18%, 8%)", border: "1px solid hsl(220, 16%, 16%)", borderRadius: 8 }}
                labelStyle={{ color: "hsl(210, 20%, 92%)" }}
              />
              <Area type="monotone" dataKey="amount" stroke="hsl(213, 94%, 52%)" fill="url(#revGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Payments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-border/30 bg-card/60 overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-border/20 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Recent Payments</h2>
            <a href="/admin/payments" className="text-xs text-primary font-medium">View all →</a>
          </div>
          <div className="divide-y divide-border/10">
            {recentPayments.length === 0 ? (
              <p className="p-5 text-sm text-muted-foreground">No payments yet</p>
            ) : (
              recentPayments.slice(0, 5).map((p) => (
                <div key={p.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{(p.payload as any)?.email || p.merchant_ref || "—"}</p>
                    <p className="text-xs text-muted-foreground">{format(new Date(p.created_at), "MMM dd, HH:mm")}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">€{(p.payload as any)?.amount || "—"}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${statusColor(p.status)}`}>
                      {p.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="rounded-xl border border-border/30 bg-card/60 overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-border/20 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              Notifications
              {notifications.length > 0 && (
                <Badge className="text-[10px] px-1.5 py-0">{notifications.length}</Badge>
              )}
            </h2>
            <a href="/admin/notifications" className="text-xs text-primary font-medium">View all →</a>
          </div>
          <div className="divide-y divide-border/10">
            {notifications.length === 0 ? (
              <p className="p-5 text-sm text-muted-foreground">No new notifications</p>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className="flex items-start gap-3 px-5 py-3">
                  <Bell className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{n.title}</p>
                    <p className="text-xs text-muted-foreground">{n.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
