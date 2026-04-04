import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { AffiliateReferral } from "@/hooks/useAffiliate";

interface Props {
  referrals: AffiliateReferral[];
}

export function EarningsChart({ referrals }: Props) {
  const chartData = useMemo(() => {
    const monthMap: Record<string, number> = {};
    referrals.forEach((r) => {
      const d = new Date(r.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthMap[key] = (monthMap[key] || 0) + Number(r.commission_amount);
    });

    // Fill last 6 months
    const result: { month: string; earnings: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
      result.push({ month: label, earnings: monthMap[key] || 0 });
    }
    return result;
  }, [referrals]);

  return (
    <div className="glass rounded-xl p-5 md:p-6">
      <h3 className="font-display font-semibold text-sm mb-4">Earnings Over Time</h3>
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
            <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} tickFormatter={(v) => `€${v}`} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: 8,
                color: "hsl(var(--foreground))",
              }}
              formatter={(value: number) => [`€${value.toFixed(2)}`, "Earnings"]}
            />
            <Line type="monotone" dataKey="earnings" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))" }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
