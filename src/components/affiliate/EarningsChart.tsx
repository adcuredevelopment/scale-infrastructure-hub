import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { AffiliateReferral } from "@/hooks/useAffiliate";

interface Props {
  referrals: AffiliateReferral[];
}

export function EarningsChart({ referrals }: Props) {
  const chartData = useMemo(() => {
    const monthMap: Record<string, number> = {};
    referrals.forEach((r) => {
      if (r.status !== "approved" && r.status !== "paid") return;
      const d = new Date(r.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthMap[key] = (monthMap[key] || 0) + Number(r.commission_amount);
    });

    const keys = Object.keys(monthMap).sort();
    if (keys.length === 0) {
      const now = new Date();
      const label = now.toLocaleDateString("en-US", { month: "long", year: "numeric" });
      return [{ month: label, earnings: 0 }];
    }

    const first = keys[0].split("-").map(Number);
    const last = keys[keys.length - 1].split("-").map(Number);
    const result: { month: string; earnings: number }[] = [];

    let y = first[0], m = first[1];
    while (y < last[0] || (y === last[0] && m <= last[1])) {
      const key = `${y}-${String(m).padStart(2, "0")}`;
      const d = new Date(y, m - 1, 1);
      const label = d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
      result.push({ month: label, earnings: monthMap[key] || 0 });
      m++;
      if (m > 12) { m = 1; y++; }
    }
    return result;
  }, [referrals]);

  return (
    <div className="glass rounded-xl p-5 md:p-6">
      <h3 className="font-display font-semibold text-sm mb-4">Earnings Per Month</h3>
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
            <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} tickFormatter={(v) => `€${v}`} width={45} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: 8,
                color: "hsl(var(--foreground))",
              }}
              formatter={(value: number) => [`€${value.toFixed(2)}`, "Earnings"]}
            />
            <Bar dataKey="earnings" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
