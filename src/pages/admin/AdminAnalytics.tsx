import { useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KPICard } from "@/components/admin/KPICard";
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import { LastRefreshed } from "@/components/admin/LastRefreshed";
import { TrendingUp, ShoppingBag, Users, Handshake, Receipt, Target } from "lucide-react";

const COLORS = ["hsl(213, 94%, 52%)", "hsl(150, 60%, 50%)", "hsl(40, 90%, 60%)", "hsl(0, 72%, 51%)", "hsl(280, 60%, 55%)"];

export default function AdminAnalytics() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [referrals, setReferrals] = useState<any[]>([]);

  const fetchAnalytics = useCallback(async () => {
    const [s, p, c, r] = await Promise.all([
      supabase.from("subscriptions").select("*"),
      supabase.from("payments").select("*"),
      supabase.from("customers").select("*"),
      supabase.from("affiliate_referrals").select("*"),
    ]);
    setSubscriptions(s.data || []);
    setPayments(p.data || []);
    setCustomers(c.data || []);
    setReferrals(r.data || []);
  }, []);

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);
  const { lastRefreshed } = useAutoRefresh(fetchAnalytics);

  const cancelledEmails = useMemo(() => {
    const set = new Set<string>();
    subscriptions.filter(s => s.status === "cancelled").forEach(s => set.add(s.customer_email.toLowerCase()));
    return set;
  }, [subscriptions]);

  const now = new Date();
  const thisMonthStart = startOfMonth(now);
  const thisMonthEnd = endOfMonth(now);
  const lastMonthStart = startOfMonth(subMonths(now, 1));
  const lastMonthEnd = endOfMonth(subMonths(now, 1));

  // KPI 1: MRR
  const mrr = useMemo(() => {
    return subscriptions.filter(s => s.status === "active").reduce((sum, s) => sum + Number(s.amount || 0), 0);
  }, [subscriptions]);

  // KPI 2: Shop Revenue (completed payments not tied to subscriptions)
  const completedPayments = useMemo(() => {
    return payments.filter(p => p.status === "completed" || p.status === "authorised");
  }, [payments]);

  const shopRevenue = useMemo(() => {
    return completedPayments
      .filter(p => !p.merchant_ref?.startsWith("sub_"))
      .reduce((sum, p) => sum + Number((p.payload as any)?.amount || 0), 0);
  }, [completedPayments]);

  // KPI 3: New Clients
  const newClientsThisMonth = useMemo(() => {
    return customers.filter(c => {
      const d = new Date(c.created_at);
      return d >= thisMonthStart && d <= thisMonthEnd;
    }).length;
  }, [customers, thisMonthStart, thisMonthEnd]);

  const newClientsLastMonth = useMemo(() => {
    return customers.filter(c => {
      const d = new Date(c.created_at);
      return d >= lastMonthStart && d <= lastMonthEnd;
    }).length;
  }, [customers, lastMonthStart, lastMonthEnd]);

  const clientChange = newClientsLastMonth > 0
    ? Math.round(((newClientsThisMonth - newClientsLastMonth) / newClientsLastMonth) * 100)
    : newClientsThisMonth > 0 ? 100 : 0;

  // KPI 4: MRR Affiliate Payouts
  const mrrAffiliate = useMemo(() => {
    return referrals
      .filter(r => r.referral_type === "recurring" && r.status !== "paid" &&
        !(r.customer_email && cancelledEmails.has(r.customer_email.toLowerCase())))
      .reduce((sum, r) => sum + Number(r.commission_amount || 0), 0);
  }, [referrals, cancelledEmails]);

  // KPI 5: VAT (21%)
  const totalRevenue = useMemo(() => {
    return completedPayments.reduce((sum, p) => sum + Number((p.payload as any)?.amount || 0), 0);
  }, [completedPayments]);
  const vat = totalRevenue * 0.21;

  // KPI 6: Conversion Rate
  const conversionRate = payments.length > 0
    ? ((completedPayments.length / payments.length) * 100).toFixed(1)
    : "0.0";

  // Monthly data for charts (last 6 months)
  const monthlyChartData = useMemo(() => {
    const data: any[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = subMonths(now, i);
      const start = startOfMonth(d);
      const end = endOfMonth(d);
      const label = format(d, "MMM yyyy");
      const inRange = (date: string) => {
        const dt = new Date(date);
        return dt >= start && dt <= end;
      };

      const monthPayments = completedPayments.filter(p => inRange(p.created_at));
      const subRev = monthPayments
        .filter(p => p.merchant_ref?.startsWith("sub_"))
        .reduce((s, p) => s + Number((p.payload as any)?.amount || 0), 0);
      const shopRev = monthPayments
        .filter(p => !p.merchant_ref?.startsWith("sub_"))
        .reduce((s, p) => s + Number((p.payload as any)?.amount || 0), 0);
      const rev = subRev + shopRev;

      const affCost = referrals
        .filter(r => r.referral_type === "recurring" && r.status !== "paid" && inRange(r.created_at) &&
          !(r.customer_email && cancelledEmails.has(r.customer_email.toLowerCase())))
        .reduce((s, r) => s + Number(r.commission_amount || 0), 0);

      const newClients = customers.filter(c => inRange(c.created_at)).length;

      const cancelled = subscriptions.filter(s => s.cancelled_at && inRange(s.cancelled_at)).length;
      const activeAtStart = subscriptions.filter(s => new Date(s.started_at) < start && (s.status === "active" || (s.cancelled_at && new Date(s.cancelled_at) >= start))).length;
      const churnRate = activeAtStart > 0 ? ((cancelled / activeAtStart) * 100).toFixed(1) : "0.0";

      data.push({
        month: label,
        revenue: rev,
        subscriptions: subRev,
        shop: shopRev,
        affiliateCost: affCost,
        netRevenue: rev - (rev * 0.21) - affCost,
        newClients,
        churnRate: Number(churnRate),
      });
    }
    return data;
  }, [completedPayments, referrals, customers, subscriptions, cancelledEmails]);

  // Plan distribution
  const planDist = useMemo(() => {
    const plans: Record<string, number> = {};
    subscriptions.filter(s => s.status === "active").forEach(s => {
      plans[s.plan_name] = (plans[s.plan_name] || 0) + 1;
    });
    return Object.entries(plans).map(([name, value]) => ({ name, value }));
  }, [subscriptions]);

  // Conversion funnel
  const funnel = useMemo(() => {
    const total = payments.length;
    const initiated = payments.filter(p => p.status !== "expired").length;
    const completed = completedPayments.length;
    return [
      { stage: "Payment Created", count: total },
      { stage: "Initiated", count: initiated },
      { stage: "Completed", count: completed },
    ];
  }, [payments, completedPayments]);

  const fmt = (n: number) => `€${n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">Comprehensive business metrics</p>
        </div>
        <LastRefreshed timestamp={lastRefreshed} />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KPICard title="MRR" value={fmt(mrr)} icon={TrendingUp} delay={0} />
        <KPICard title="Shop Revenue" value={fmt(shopRevenue)} icon={ShoppingBag} delay={0.05} />
        <KPICard
          title="New Clients"
          value={String(newClientsThisMonth)}
          change={`${clientChange >= 0 ? "+" : ""}${clientChange}% vs last month`}
          changeType={clientChange >= 0 ? "positive" : "negative"}
          icon={Users}
          delay={0.1}
        />
        <KPICard title="MRR Aff. Payouts" value={fmt(mrrAffiliate)} icon={Handshake} delay={0.15} />
        <KPICard title="VAT (21% BTW)" value={fmt(vat)} icon={Receipt} delay={0.2} />
        <KPICard title="Conversion Rate" value={`${conversionRate}%`} icon={Target} delay={0.25} />
      </div>

      {/* Charts */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-border/30 bg-card/60 p-5">
            <h2 className="text-sm font-semibold mb-4">Revenue vs Affiliate Costs vs Net Revenue (6 Months)</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyChartData}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(213, 94%, 52%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(213, 94%, 52%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="netGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(150, 60%, 50%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(150, 60%, 50%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 16%, 16%)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(215, 15%, 55%)" }} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(215, 15%, 55%)" }} />
                  <Tooltip contentStyle={{ background: "hsl(220, 18%, 8%)", border: "1px solid hsl(220, 16%, 16%)", borderRadius: 8 }} formatter={(v: number) => fmt(v)} />
                  <Legend />
                  <Area type="monotone" dataKey="revenue" name="Revenue" stroke="hsl(213, 94%, 52%)" fill="url(#revGrad)" strokeWidth={2} />
                  <Area type="monotone" dataKey="affiliateCost" name="Affiliate Costs" stroke="hsl(40, 90%, 60%)" fill="transparent" strokeWidth={2} strokeDasharray="5 5" />
                  <Area type="monotone" dataKey="netRevenue" name="Net Revenue" stroke="hsl(150, 60%, 50%)" fill="url(#netGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-border/30 bg-card/60 p-5">
              <h2 className="text-sm font-semibold mb-4">Monthly Revenue Breakdown</h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 16%, 16%)" />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(215, 15%, 55%)" }} />
                    <YAxis tick={{ fontSize: 11, fill: "hsl(215, 15%, 55%)" }} />
                    <Tooltip contentStyle={{ background: "hsl(220, 18%, 8%)", border: "1px solid hsl(220, 16%, 16%)", borderRadius: 8 }} formatter={(v: number) => fmt(v)} />
                    <Legend />
                    <Bar dataKey="subscriptions" name="Subscriptions" stackId="a" fill="hsl(213, 94%, 52%)" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="shop" name="Shop" stackId="a" fill="hsl(150, 60%, 50%)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-border/30 bg-card/60 p-5">
              <h2 className="text-sm font-semibold mb-4">Active Plan Distribution</h2>
              <div className="h-72 flex items-center justify-center">
                {planDist.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No active subscriptions</p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={planDist} cx="50%" cy="50%" innerRadius={50} outerRadius={85} dataKey="value" label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                        {planDist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: "hsl(220, 18%, 8%)", border: "1px solid hsl(220, 16%, 16%)", borderRadius: 8 }} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </motion.div>
          </div>
        </TabsContent>

        {/* Clients Tab */}
        <TabsContent value="clients">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-border/30 bg-card/60 p-5">
              <h2 className="text-sm font-semibold mb-4">New Clients per Month</h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 16%, 16%)" />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(215, 15%, 55%)" }} />
                    <YAxis tick={{ fontSize: 11, fill: "hsl(215, 15%, 55%)" }} allowDecimals={false} />
                    <Tooltip contentStyle={{ background: "hsl(220, 18%, 8%)", border: "1px solid hsl(220, 16%, 16%)", borderRadius: 8 }} />
                    <Line type="monotone" dataKey="newClients" name="New Clients" stroke="hsl(213, 94%, 52%)" strokeWidth={2} dot={{ r: 4, fill: "hsl(213, 94%, 52%)" }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                <span>Churn Rate (this month): <strong className="text-foreground">{monthlyChartData[monthlyChartData.length - 1]?.churnRate ?? 0}%</strong></span>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-border/30 bg-card/60 p-5">
              <h2 className="text-sm font-semibold mb-4">Conversion Funnel</h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={funnel} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 16%, 16%)" />
                    <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(215, 15%, 55%)" }} allowDecimals={false} />
                    <YAxis dataKey="stage" type="category" tick={{ fontSize: 11, fill: "hsl(215, 15%, 55%)" }} width={110} />
                    <Tooltip contentStyle={{ background: "hsl(220, 18%, 8%)", border: "1px solid hsl(220, 16%, 16%)", borderRadius: 8 }} />
                    <Bar dataKey="count" fill="hsl(213, 94%, 52%)" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
