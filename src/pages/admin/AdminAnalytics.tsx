import { useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import { TrendingUp, ShoppingBag, Users, Handshake, Receipt, Target } from "lucide-react";
import {
  AdminKPICard,
  LiveIndicator,
  FilterTabs,
  KPISkeleton,
  EmptyState,
  Avatar,
} from "@/components/admin/ui";

const PIE_COLORS = ["#3b82f6", "#22d3ee", "#a78bfa", "#10b981", "#f59e0b"];

const chartTooltipStyle = {
  background: "#0d0d11",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: 8,
  fontSize: 12,
};

const axisTick = { fontSize: 11, fill: "#475569" };

export default function AdminAnalytics() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [tab, setTab] = useState<"overview" | "revenue" | "clients">("overview");
  const [loading, setLoading] = useState(true);

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
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);
  const { lastRefreshed } = useAutoRefresh(fetchAnalytics);

  const cancelledEmails = useMemo(() => {
    const set = new Set<string>();
    subscriptions
      .filter((s) => s.status === "cancelled")
      .forEach((s) => set.add(s.customer_email.toLowerCase()));
    return set;
  }, [subscriptions]);

  const now = new Date();
  const thisMonthStart = startOfMonth(now);
  const thisMonthEnd = endOfMonth(now);
  const lastMonthStart = startOfMonth(subMonths(now, 1));
  const lastMonthEnd = endOfMonth(subMonths(now, 1));

  const mrr = useMemo(
    () =>
      subscriptions
        .filter((s) => s.status === "active")
        .reduce((sum, s) => sum + Number(s.amount || 0), 0),
    [subscriptions],
  );

  const completedPayments = useMemo(
    () => payments.filter((p) => p.status === "completed" || p.status === "authorised"),
    [payments],
  );

  const shopRevenue = useMemo(
    () =>
      completedPayments
        .filter((p) => !p.merchant_ref?.startsWith("sub_"))
        .reduce((sum, p) => sum + Number((p.payload as any)?.amount || 0), 0),
    [completedPayments],
  );

  const subscriptionRevenue = useMemo(
    () =>
      completedPayments
        .filter((p) => p.merchant_ref?.startsWith("sub_"))
        .reduce((sum, p) => sum + Number((p.payload as any)?.amount || 0), 0),
    [completedPayments],
  );

  const newClientsThisMonth = useMemo(
    () =>
      customers.filter((c) => {
        const d = new Date(c.created_at);
        return d >= thisMonthStart && d <= thisMonthEnd;
      }).length,
    [customers, thisMonthStart, thisMonthEnd],
  );

  const newClientsLastMonth = useMemo(
    () =>
      customers.filter((c) => {
        const d = new Date(c.created_at);
        return d >= lastMonthStart && d <= lastMonthEnd;
      }).length,
    [customers, lastMonthStart, lastMonthEnd],
  );

  const clientChange =
    newClientsLastMonth > 0
      ? Math.round(((newClientsThisMonth - newClientsLastMonth) / newClientsLastMonth) * 100)
      : newClientsThisMonth > 0
      ? 100
      : 0;

  const mrrAffiliate = useMemo(
    () =>
      referrals
        .filter(
          (r) =>
            r.referral_type === "recurring" &&
            r.status !== "paid" &&
            !(r.customer_email && cancelledEmails.has(r.customer_email.toLowerCase())),
        )
        .reduce((sum, r) => sum + Number(r.commission_amount || 0), 0),
    [referrals, cancelledEmails],
  );

  const totalRevenue = useMemo(
    () => completedPayments.reduce((sum, p) => sum + Number((p.payload as any)?.amount || 0), 0),
    [completedPayments],
  );
  const vat = totalRevenue * 0.21;
  const conversionRate =
    payments.length > 0 ? (completedPayments.length / payments.length) * 100 : 0;

  // Monthly chart data (6 months)
  const monthlyData = useMemo(() => {
    const data: any[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = subMonths(now, i);
      const start = startOfMonth(d);
      const end = endOfMonth(d);
      const label = format(d, "MMM");
      const inRange = (date: string) => {
        const dt = new Date(date);
        return dt >= start && dt <= end;
      };
      const monthPayments = completedPayments.filter((p) => inRange(p.created_at));
      const subRev = monthPayments
        .filter((p) => p.merchant_ref?.startsWith("sub_"))
        .reduce((s, p) => s + Number((p.payload as any)?.amount || 0), 0);
      const shopRev = monthPayments
        .filter((p) => !p.merchant_ref?.startsWith("sub_"))
        .reduce((s, p) => s + Number((p.payload as any)?.amount || 0), 0);
      const rev = subRev + shopRev;
      const affCost = referrals
        .filter(
          (r) =>
            r.referral_type === "recurring" &&
            r.status !== "paid" &&
            inRange(r.created_at) &&
            !(r.customer_email && cancelledEmails.has(r.customer_email.toLowerCase())),
        )
        .reduce((s, r) => s + Number(r.commission_amount || 0), 0);
      const newClients = customers.filter((c) => inRange(c.created_at)).length;
      const cancelled = subscriptions.filter(
        (s) => s.cancelled_at && inRange(s.cancelled_at),
      ).length;
      const activeAtStart = subscriptions.filter(
        (s) =>
          new Date(s.started_at) < start &&
          (s.status === "active" || (s.cancelled_at && new Date(s.cancelled_at) >= start)),
      ).length;
      const churnRate = activeAtStart > 0 ? (cancelled / activeAtStart) * 100 : 0;
      // Cumulative MRR snapshot at end of month
      const mrrAtMonth = subscriptions
        .filter((s) => {
          const started = new Date(s.started_at);
          if (started > end) return false;
          if (s.status === "cancelled" && s.cancelled_at) {
            return new Date(s.cancelled_at) > end;
          }
          return true;
        })
        .reduce((sum, s) => sum + Number(s.amount || 0), 0);
      data.push({
        month: label,
        revenue: rev,
        subscriptions: subRev,
        shop: shopRev,
        affiliateCost: affCost,
        netRevenue: rev - rev * 0.21 - affCost,
        newClients,
        churnRate: Number(churnRate.toFixed(1)),
        mrr: mrrAtMonth,
      });
    }
    return data;
  }, [completedPayments, referrals, customers, subscriptions, cancelledEmails, now]);

  const revenueSplit = useMemo(
    () => [
      { name: "Subscriptions", value: subscriptionRevenue },
      { name: "Shop Orders", value: shopRevenue },
    ],
    [subscriptionRevenue, shopRevenue],
  );

  // Top products by revenue
  const topProducts = useMemo(() => {
    const map = new Map<string, number>();
    completedPayments.forEach((p) => {
      const payload = (p.payload || {}) as any;
      const name = payload.product || payload.plan || "Unknown";
      const amount = Number(payload.total ?? payload.amount ?? 0);
      map.set(name, (map.get(name) || 0) + amount);
    });
    return Array.from(map.entries())
      .map(([name, revenue]) => ({ name, revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6);
  }, [completedPayments]);

  // Top customers by LTV
  const topCustomers = useMemo(
    () =>
      [...customers]
        .sort((a, b) => Number(b.total_spent || 0) - Number(a.total_spent || 0))
        .slice(0, 6),
    [customers],
  );

  const churnThisMonth = monthlyData[monthlyData.length - 1]?.churnRate ?? 0;

  const fmt = (n: number) =>
    n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl admin-page">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-syne font-bold" style={{ fontSize: 22, color: "var(--ad-text)" }}>
            Analytics
          </h1>
          <p className="text-[13px] mt-0.5" style={{ color: "var(--ad-text-secondary)" }}>
            Business performance metrics
          </p>
        </div>
        <LiveIndicator timestamp={lastRefreshed} />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {loading ? (
          <>
            <KPISkeleton /><KPISkeleton /><KPISkeleton />
            <KPISkeleton /><KPISkeleton /><KPISkeleton />
          </>
        ) : (
          <>
            <AdminKPICard
              label="MRR"
              value={fmt(mrr)}
              numericValue={mrr}
              prefix="€"
              format={fmt}
              icon={TrendingUp}
              delay={0}
            />
            <AdminKPICard
              label="Shop Revenue"
              value={fmt(shopRevenue)}
              numericValue={shopRevenue}
              prefix="€"
              format={fmt}
              icon={ShoppingBag}
              delay={0.05}
            />
            <AdminKPICard
              label="New Clients"
              value={String(newClientsThisMonth)}
              numericValue={newClientsThisMonth}
              icon={Users}
              change={`${clientChange >= 0 ? "+" : ""}${clientChange}% vs last month`}
              changeType={clientChange >= 0 ? "positive" : "negative"}
              delay={0.1}
            />
            <AdminKPICard
              label="MRR Aff. Payouts"
              value={fmt(mrrAffiliate)}
              numericValue={mrrAffiliate}
              prefix="€"
              format={fmt}
              icon={Handshake}
              delay={0.15}
            />
            <AdminKPICard
              label="VAT (21% BTW)"
              value={fmt(vat)}
              numericValue={vat}
              prefix="€"
              format={fmt}
              icon={Receipt}
              delay={0.2}
            />
            <AdminKPICard
              label="Conversion Rate"
              value={`${conversionRate.toFixed(1)}%`}
              numericValue={conversionRate}
              suffix="%"
              format={(n) => n.toFixed(1)}
              icon={Target}
              delay={0.25}
            />
          </>
        )}
      </div>

      {/* Tabs */}
      <FilterTabs
        items={[
          { id: "overview", label: "Overview" },
          { id: "revenue", label: "Revenue" },
          { id: "clients", label: "Clients" },
        ]}
        value={tab}
        onChange={(v) => setTab(v as any)}
      />

      {/* Overview Tab */}
      {tab === "overview" && (
        <div className="space-y-4 admin-page">
          <div className="admin-card p-5">
            <h2
              className="font-syne text-[13px] font-semibold mb-1"
              style={{ color: "var(--ad-text)" }}
            >
              Revenue vs Affiliate Costs vs Net Revenue
            </h2>
            <p className="text-[11px] mb-4" style={{ color: "var(--ad-text-secondary)" }}>
              Last 6 months
            </p>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData} margin={{ top: 5, right: 8, left: -12, bottom: 0 }}>
                  <defs>
                    <linearGradient id="aRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="aNet" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" tick={axisTick} axisLine={{ stroke: "rgba(255,255,255,0.06)" }} tickLine={false} />
                  <YAxis tick={axisTick} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={chartTooltipStyle}
                    formatter={(v: number) => `€${fmt(v)}`}
                    labelStyle={{ color: "#f1f5f9" }}
                  />
                  <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#3b82f6" fill="url(#aRev)" strokeWidth={2} />
                  <Area type="monotone" dataKey="affiliateCost" name="Affiliate Costs" stroke="#f59e0b" fill="transparent" strokeWidth={2} strokeDasharray="5 5" />
                  <Area type="monotone" dataKey="netRevenue" name="Net Revenue" stroke="#10b981" fill="url(#aNet)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <ChartLegend
              items={[
                { color: "#3b82f6", label: "Revenue" },
                { color: "#f59e0b", label: "Affiliate Costs" },
                { color: "#10b981", label: "Net Revenue" },
              ]}
            />
          </div>

          <div className="admin-card p-5">
            <h2
              className="font-syne text-[13px] font-semibold mb-1"
              style={{ color: "var(--ad-text)" }}
            >
              MRR Growth
            </h2>
            <p className="text-[11px] mb-4" style={{ color: "var(--ad-text-secondary)" }}>
              Recurring revenue per month
            </p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData} margin={{ top: 5, right: 8, left: -12, bottom: 0 }}>
                  <defs>
                    <linearGradient id="aMrr" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" tick={axisTick} axisLine={{ stroke: "rgba(255,255,255,0.06)" }} tickLine={false} />
                  <YAxis tick={axisTick} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={chartTooltipStyle} formatter={(v: number) => `€${fmt(v)}`} />
                  <Area type="monotone" dataKey="mrr" name="MRR" stroke="#22d3ee" fill="url(#aMrr)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Revenue Tab */}
      {tab === "revenue" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 admin-page">
          <div className="admin-card p-5">
            <h2
              className="font-syne text-[13px] font-semibold mb-1"
              style={{ color: "var(--ad-text)" }}
            >
              Revenue Split
            </h2>
            <p className="text-[11px] mb-4" style={{ color: "var(--ad-text-secondary)" }}>
              Subscriptions vs shop orders
            </p>
            <div className="h-64">
              {revenueSplit.every((r) => r.value === 0) ? (
                <EmptyState icon={ShoppingBag} title="No revenue yet" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={revenueSplit}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="#0d0d11"
                      strokeWidth={2}
                    >
                      <Cell fill="#3b82f6" />
                      <Cell fill="#22d3ee" />
                    </Pie>
                    <Tooltip
                      contentStyle={chartTooltipStyle}
                      formatter={(v: number) => `€${fmt(v)}`}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            <ChartLegend
              items={[
                { color: "#3b82f6", label: `Subscriptions €${fmt(subscriptionRevenue)}` },
                { color: "#22d3ee", label: `Shop €${fmt(shopRevenue)}` },
              ]}
            />
          </div>

          <div className="admin-card p-5">
            <h2
              className="font-syne text-[13px] font-semibold mb-1"
              style={{ color: "var(--ad-text)" }}
            >
              Top Products by Revenue
            </h2>
            <p className="text-[11px] mb-4" style={{ color: "var(--ad-text-secondary)" }}>
              All-time
            </p>
            {topProducts.length === 0 ? (
              <EmptyState icon={ShoppingBag} title="No products yet" />
            ) : (
              <div className="space-y-2">
                {topProducts.map((p, i) => {
                  const max = topProducts[0].revenue || 1;
                  const pct = (p.revenue / max) * 100;
                  return (
                    <div key={i} className="space-y-1">
                      <div className="flex items-center justify-between text-[12px]">
                        <span className="truncate pr-3" style={{ color: "var(--ad-text)" }}>
                          {p.name}
                        </span>
                        <span
                          className="font-mono-jb shrink-0"
                          style={{ color: "var(--ad-text-soft)" }}
                        >
                          €{fmt(p.revenue)}
                        </span>
                      </div>
                      <div
                        className="h-1 rounded-full overflow-hidden"
                        style={{ background: "rgba(255,255,255,0.05)" }}
                      >
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${pct}%`, background: PIE_COLORS[i % PIE_COLORS.length] }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="admin-card p-5 lg:col-span-2">
            <h2
              className="font-syne text-[13px] font-semibold mb-1"
              style={{ color: "var(--ad-text)" }}
            >
              Monthly Revenue Breakdown
            </h2>
            <p className="text-[11px] mb-4" style={{ color: "var(--ad-text-secondary)" }}>
              Stacked subscriptions + shop
            </p>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 5, right: 8, left: -12, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" tick={axisTick} axisLine={{ stroke: "rgba(255,255,255,0.06)" }} tickLine={false} />
                  <YAxis tick={axisTick} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={chartTooltipStyle} formatter={(v: number) => `€${fmt(v)}`} />
                  <Bar dataKey="subscriptions" name="Subscriptions" stackId="a" fill="#3b82f6" />
                  <Bar dataKey="shop" name="Shop" stackId="a" fill="#22d3ee" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <ChartLegend
              items={[
                { color: "#3b82f6", label: "Subscriptions" },
                { color: "#22d3ee", label: "Shop" },
              ]}
            />
          </div>
        </div>
      )}

      {/* Clients Tab */}
      {tab === "clients" && (
        <div className="space-y-4 admin-page">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="admin-card p-5 lg:col-span-2">
              <h2
                className="font-syne text-[13px] font-semibold mb-1"
                style={{ color: "var(--ad-text)" }}
              >
                New Clients per Month
              </h2>
              <p className="text-[11px] mb-4" style={{ color: "var(--ad-text-secondary)" }}>
                Last 6 months
              </p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData} margin={{ top: 5, right: 8, left: -12, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="month" tick={axisTick} axisLine={{ stroke: "rgba(255,255,255,0.06)" }} tickLine={false} />
                    <YAxis tick={axisTick} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={chartTooltipStyle} />
                    <Bar dataKey="newClients" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="admin-card p-5 flex flex-col justify-between">
              <div>
                <p
                  className="text-[10px] uppercase mb-3"
                  style={{ color: "var(--ad-text-faint)", letterSpacing: "0.08em" }}
                >
                  Churn Rate
                </p>
                <div className="font-mono-jb font-semibold" style={{ fontSize: 36, color: "var(--ad-text)" }}>
                  {churnThisMonth}%
                </div>
                <p className="text-[12px] mt-2" style={{ color: "var(--ad-text-secondary)" }}>
                  Cancelled this month
                </p>
              </div>
              <div className="mt-6 h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData} margin={{ top: 5, right: 5, left: -28, bottom: 0 }}>
                    <YAxis hide />
                    <Tooltip contentStyle={chartTooltipStyle} formatter={(v: number) => `${v}%`} />
                    <Line type="monotone" dataKey="churnRate" stroke="#ef4444" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="admin-card overflow-hidden">
            <div
              className="px-5 py-4"
              style={{ borderBottom: "1px solid var(--ad-border-subtle)" }}
            >
              <h2
                className="font-syne text-[13px] font-semibold"
                style={{ color: "var(--ad-text)" }}
              >
                Top Customers by LTV
              </h2>
            </div>
            {topCustomers.length === 0 ? (
              <EmptyState icon={Users} title="No customers yet" />
            ) : (
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="admin-table-head">
                    <th className="text-left px-5 py-2.5 font-medium">Customer</th>
                    <th className="text-left px-5 py-2.5 font-medium">Plan</th>
                    <th className="text-right px-5 py-2.5 font-medium">LTV</th>
                    <th className="text-center px-5 py-2.5 font-medium">Subs</th>
                  </tr>
                </thead>
                <tbody>
                  {topCustomers.map((c) => (
                    <tr
                      key={c.id}
                      className="admin-row"
                      style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar email={c.email} name={c.name} size={28} />
                          <span style={{ color: "var(--ad-text)" }}>{c.email}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3" style={{ color: "var(--ad-text-soft)" }}>
                        {c.plan || "—"}
                      </td>
                      <td
                        className="px-5 py-3 text-right font-mono-jb font-semibold"
                        style={{ color: "var(--ad-text)" }}
                      >
                        €{Number(c.total_spent).toFixed(2)}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span
                          className="font-mono-jb text-[11px] px-2 py-0.5 rounded"
                          style={{
                            background: "rgba(255,255,255,0.05)",
                            color: "var(--ad-text-soft)",
                          }}
                        >
                          {c.subscription_count || 0}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ChartLegend({ items }: { items: { color: string; label: string }[] }) {
  return (
    <div className="flex flex-wrap gap-4 mt-3">
      {items.map((it) => (
        <div key={it.label} className="flex items-center gap-1.5 text-[11px]" style={{ color: "var(--ad-text-secondary)" }}>
          <span className="w-2 h-2 rounded-full" style={{ background: it.color }} />
          {it.label}
        </div>
      ))}
    </div>
  );
}
