import { useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Users, CreditCard, TrendingUp, Wallet, RefreshCw, Inbox, ArrowRight } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import {
  AdminKPICard,
  StatusBadge,
  LiveIndicator,
  FilterTabs,
  EmptyState,
  KPISkeleton,
} from "@/components/admin/ui";
import { RevenueMilestones } from "@/components/admin/RevenueMilestones";

type Range = "7D" | "30D" | "90D";
const RANGE_DAYS: Record<Range, number> = { "7D": 7, "30D": 30, "90D": 90 };

export default function AdminOverview() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalRevenue: 0,
    activeSubscriptions: 0,
    totalCustomers: 0,
    mrr: 0,
    mrrChange: 0,
    revenueChange: 0,
    subsChange: 0,
    custChange: 0,
  });
  const [recentPayments, setRecentPayments] = useState<any[]>([]);
  const [allPayments, setAllPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [range, setRange] = useState<Range>("7D");

  const fetchDashboardData = useCallback(async () => {
    const [subsRes, custRes, paymentsRes, allPaymentsRes] = await Promise.all([
      supabase.from("subscriptions").select("*"),
      supabase.from("customers").select("*"),
      supabase.from("payments").select("*").order("created_at", { ascending: false }).limit(10),
      supabase.from("payments").select("*").order("created_at", { ascending: false }),
    ]);

    const subs = subsRes.data || [];
    const custs = custRes.data || [];
    const payments = paymentsRes.data || [];
    const allP = allPaymentsRes.data || [];

    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const activeSubs = subs.filter((s) => s.status === "active");
    const totalRevenue = allP
      .filter((p) => p.status === "completed")
      .reduce((acc, p) => acc + Number((p.payload as any)?.amount || 0), 0);
    const mrr = activeSubs.reduce((acc, s) => acc + Number(s.amount || 0), 0);

    const lastMonthActiveSubs = subs.filter((s) => {
      const started = new Date(s.started_at);
      if (started >= thisMonthStart) return false;
      if (s.status === "cancelled" && s.cancelled_at) {
        return new Date(s.cancelled_at) >= thisMonthStart;
      }
      return true;
    });
    const lastMonthMrr = lastMonthActiveSubs.reduce((acc, s) => acc + Number(s.amount || 0), 0);
    const mrrChange = lastMonthMrr > 0 ? ((mrr - lastMonthMrr) / lastMonthMrr) * 100 : (mrr > 0 ? 100 : 0);

    const revenueThisMonth = subs
      .filter((s) => new Date(s.started_at) >= thisMonthStart)
      .reduce((acc, s) => acc + Number(s.amount || 0), 0);
    const revenueLastMonth = subs
      .filter((s) => {
        const d = new Date(s.started_at);
        return d >= lastMonthStart && d < thisMonthStart;
      })
      .reduce((acc, s) => acc + Number(s.amount || 0), 0);
    const revenueChange =
      revenueLastMonth > 0
        ? ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100
        : revenueThisMonth > 0
        ? 100
        : 0;

    const subsThisMonth = subs.filter(
      (s) => new Date(s.started_at) >= thisMonthStart && s.status === "active",
    ).length;
    const custsThisMonth = custs.filter((c) => new Date(c.created_at) >= thisMonthStart).length;

    setStats({
      totalRevenue,
      activeSubscriptions: activeSubs.length,
      totalCustomers: custs.length,
      mrr,
      mrrChange: Math.round(mrrChange),
      revenueChange: Math.round(revenueChange),
      subsChange: subsThisMonth,
      custChange: custsThisMonth,
    });

    setRecentPayments(payments);
    setAllPayments(allP);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const { lastRefreshed } = useAutoRefresh(fetchDashboardData);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke("revolut-sync-orders");
      if (error) throw error;
      toast.success(
        `Synced! ${data.new_synced} new, ${data.updated} updated from ${data.total_orders} orders`,
      );
      await fetchDashboardData();
    } catch (err: any) {
      toast.error("Sync failed: " + (err.message || "Unknown error"));
    } finally {
      setSyncing(false);
    }
  };

  const chartData = useMemo(() => {
    const days: Record<string, number> = {};
    const total = RANGE_DAYS[range];
    for (let i = total - 1; i >= 0; i--) {
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
    return Object.entries(days).map(([date, amount]) => ({ date, amount }));
  }, [allPayments, range]);

  const formatCurrency = (n: number) =>
    n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl admin-page">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-syne font-bold" style={{ fontSize: 22, color: "var(--ad-text)" }}>
            Overview
          </h1>
          <p className="text-[13px] mt-0.5" style={{ color: "var(--ad-text-secondary)" }}>
            Revenue & subscription metrics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <LiveIndicator timestamp={lastRefreshed} />
          <button
            onClick={handleSync}
            disabled={syncing}
            className="admin-btn-ghost inline-flex items-center gap-2 px-3 h-9 text-[12px] disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing..." : "Sync Revolut"}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {loading ? (
          <>
            <KPISkeleton /><KPISkeleton /><KPISkeleton /><KPISkeleton />
          </>
        ) : (
          <>
            <AdminKPICard
              label="Total Revenue"
              value={`€${formatCurrency(stats.totalRevenue)}`}
              numericValue={stats.totalRevenue}
              prefix="€"
              format={formatCurrency}
              icon={Wallet}
              change={`${stats.revenueChange >= 0 ? "+" : ""}${stats.revenueChange}% this month`}
              changeType={stats.revenueChange >= 0 ? "positive" : "negative"}
              delay={0}
            />
            <AdminKPICard
              label="MRR"
              value={`€${formatCurrency(stats.mrr)}`}
              numericValue={stats.mrr}
              prefix="€"
              format={formatCurrency}
              icon={TrendingUp}
              change={`${stats.mrrChange >= 0 ? "+" : ""}${stats.mrrChange}% vs last month`}
              changeType={stats.mrrChange >= 0 ? "positive" : "negative"}
              delay={0.06}
            />
            <AdminKPICard
              label="Active Subscriptions"
              value={stats.activeSubscriptions}
              numericValue={stats.activeSubscriptions}
              icon={CreditCard}
              change={`+${stats.subsChange} this month`}
              changeType="positive"
              delay={0.12}
            />
            <AdminKPICard
              label="Total Customers"
              value={stats.totalCustomers}
              numericValue={stats.totalCustomers}
              icon={Users}
              change={`+${stats.custChange} new`}
              changeType="positive"
              delay={0.18}
            />
          </>
        )}
      </div>

      {/* Revenue Milestones */}
      <RevenueMilestones currentValue={stats.totalRevenue} />

      {/* Revenue Chart */}
      <div
        className="admin-card p-5 admin-page"
        style={{ animationDelay: "180ms" }}
      >
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h2 className="font-syne text-[13px] font-semibold" style={{ color: "var(--ad-text)" }}>
            Revenue — Last {range === "7D" ? "7 days" : range === "30D" ? "30 days" : "90 days"}
          </h2>
          <FilterTabs
            items={[
              { id: "7D", label: "7D" },
              { id: "30D", label: "30D" },
              { id: "90D", label: "90D" },
            ]}
            value={range}
            onChange={(v) => setRange(v as Range)}
          />
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 8, left: -12, bottom: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "#475569" }}
                axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#475569" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "#0d0d11",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                labelStyle={{ color: "#f1f5f9" }}
                itemStyle={{ color: "#3b82f6" }}
                formatter={(value: any) => [`€${Number(value).toFixed(2)}`, "Revenue"]}
              />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#3b82f6"
                fill="url(#revGrad)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Payments */}
      <div
        className="admin-card overflow-hidden admin-page"
        style={{ animationDelay: "240ms" }}
      >
        <div
          className="px-5 py-4 flex items-center justify-between"
          style={{ borderBottom: "1px solid var(--ad-border-subtle)" }}
        >
          <h2 className="font-syne text-[13px] font-semibold" style={{ color: "var(--ad-text)" }}>
            Recent Payments
          </h2>
          <button
            onClick={() => navigate("/admin/payments")}
            className="text-[12px] inline-flex items-center gap-1 transition-colors"
            style={{ color: "var(--ad-accent)" }}
          >
            View all
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {recentPayments.length === 0 ? (
          <EmptyState icon={Inbox} title="No payments yet" subtitle="Payments will appear here once received" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="admin-table-head">
                  <th className="text-left px-5 py-2.5 font-medium">Email</th>
                  <th className="text-left px-5 py-2.5 font-medium">Plan</th>
                  <th className="text-right px-5 py-2.5 font-medium">Amount</th>
                  <th className="text-left px-5 py-2.5 font-medium">Status</th>
                  <th className="text-right px-5 py-2.5 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentPayments.slice(0, 5).map((p) => {
                  const payload = (p.payload || {}) as any;
                  return (
                    <tr
                      key={p.id}
                      onClick={() => navigate("/admin/payments")}
                      className="admin-row cursor-pointer"
                      style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
                    >
                      <td className="px-5 py-3" style={{ color: "var(--ad-text)" }}>
                        {payload.email || p.merchant_ref || "—"}
                      </td>
                      <td className="px-5 py-3" style={{ color: "var(--ad-text-soft)" }}>
                        {payload.plan_name || payload.product_name || "—"}
                      </td>
                      <td className="px-5 py-3 text-right font-mono-jb" style={{ color: "var(--ad-text)" }}>
                        €{Number(payload.amount || 0).toFixed(2)}
                      </td>
                      <td className="px-5 py-3">
                        <StatusBadge status={p.status} withDot={p.status === "completed"} />
                      </td>
                      <td
                        className="px-5 py-3 text-right font-mono-jb text-[11px]"
                        style={{ color: "var(--ad-text-secondary)" }}
                      >
                        {format(new Date(p.created_at), "MMM dd, HH:mm")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
