import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, subDays, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import { LastRefreshed } from "@/components/admin/LastRefreshed";

const COLORS = ["hsl(213, 94%, 52%)", "hsl(150, 60%, 50%)", "hsl(40, 90%, 60%)", "hsl(0, 72%, 51%)"];

export default function AdminAnalytics() {
  const [dailyData, setDailyData] = useState<any[]>([]);
  const [planDist, setPlanDist] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);

  const fetchAnalytics = useCallback(async () => {
    const { data: subs } = await supabase.from("subscriptions").select("*");
    const { data: payments } = await supabase.from("payments").select("*");
    const allSubs = subs || [];
    const allPayments = payments || [];

    const daily: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
      daily[format(subDays(new Date(), i), "MMM dd")] = 0;
    }
    allPayments.forEach((p) => {
      if (p.status === "completed" || p.status === "authorised") {
        const key = format(new Date(p.created_at), "MMM dd");
        if (key in daily) daily[key] += Number((p.payload as any)?.amount || 0);
      }
    });
    setDailyData(Object.entries(daily).map(([date, revenue]) => ({ date, revenue })));

    const plans: Record<string, number> = {};
    allSubs.forEach((s) => {
      plans[s.plan_name] = (plans[s.plan_name] || 0) + 1;
    });
    setPlanDist(Object.entries(plans).map(([name, value]) => ({ name, value })));

    const monthly: { month: string; revenue: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = subMonths(new Date(), i);
      const start = startOfMonth(d);
      const end = endOfMonth(d);
      const rev = allPayments
        .filter((p) => {
          const created = new Date(p.created_at);
          return created >= start && created <= end && (p.status === "completed" || p.status === "authorised");
        })
        .reduce((acc, p) => acc + Number((p.payload as any)?.amount || 0), 0);
      monthly.push({ month: format(d, "MMM yyyy"), revenue: rev });
    }
    setMonthlyData(monthly);
  }, []);

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);
  const { lastRefreshed } = useAutoRefresh(fetchAnalytics);

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Revenue Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">Deep dive into your revenue data</p>
        </div>
        <LastRefreshed timestamp={lastRefreshed} />
      </div>

      <Tabs defaultValue="daily" className="space-y-4">
        <TabsList>
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="plans">Plans</TabsTrigger>
        </TabsList>

        <TabsContent value="daily">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-border/30 bg-card/60 p-5">
            <h2 className="text-sm font-semibold mb-4">Daily Revenue (Last 30 Days)</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyData}>
                  <defs>
                    <linearGradient id="dailyGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(213, 94%, 52%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(213, 94%, 52%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 16%, 16%)" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(215, 15%, 55%)" }} interval={4} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(215, 15%, 55%)" }} />
                  <Tooltip contentStyle={{ background: "hsl(220, 18%, 8%)", border: "1px solid hsl(220, 16%, 16%)", borderRadius: 8 }} />
                  <Area type="monotone" dataKey="revenue" stroke="hsl(213, 94%, 52%)" fill="url(#dailyGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </TabsContent>

        <TabsContent value="monthly">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-border/30 bg-card/60 p-5">
            <h2 className="text-sm font-semibold mb-4">Monthly Revenue (Last 6 Months)</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 16%, 16%)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(215, 15%, 55%)" }} />
                  <YAxis tick={{ fontSize: 11, fill: "hsl(215, 15%, 55%)" }} />
                  <Tooltip contentStyle={{ background: "hsl(220, 18%, 8%)", border: "1px solid hsl(220, 16%, 16%)", borderRadius: 8 }} />
                  <Bar dataKey="revenue" fill="hsl(213, 94%, 52%)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </TabsContent>

        <TabsContent value="plans">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-border/30 bg-card/60 p-5">
            <h2 className="text-sm font-semibold mb-4">Plan Distribution</h2>
            <div className="h-80 flex items-center justify-center">
              {planDist.length === 0 ? (
                <p className="text-muted-foreground text-sm">No subscription data yet</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={planDist} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                      {planDist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: "hsl(220, 18%, 8%)", border: "1px solid hsl(220, 16%, 16%)", borderRadius: 8 }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
