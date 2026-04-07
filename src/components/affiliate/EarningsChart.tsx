import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { AffiliateReferral } from "@/hooks/useAffiliate";

interface Props {
  referrals: AffiliateReferral[];
}

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday start
  return new Date(d.getFullYear(), d.getMonth(), diff);
}

function formatWeek(date: Date): string {
  const end = new Date(date);
  end.setDate(end.getDate() + 6);
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
  return `${date.toLocaleDateString("en-US", opts)} – ${end.toLocaleDateString("en-US", opts)}`;
}

export function EarningsChart({ referrals }: Props) {
  const chartData = useMemo(() => {
    const weekMap: Record<string, number> = {};

    referrals.forEach((r) => {
      if (r.status !== "approved" && r.status !== "paid") return;
      const ws = getWeekStart(new Date(r.created_at));
      const key = ws.toISOString().slice(0, 10);
      weekMap[key] = (weekMap[key] || 0) + Number(r.commission_amount);
    });

    // Generate weeks from earliest to latest
    const keys = Object.keys(weekMap).sort();
    if (keys.length === 0) {
      const ws = getWeekStart(new Date());
      return [{ week: formatWeek(ws), earnings: 0 }];
    }

    const result: { week: string; earnings: number }[] = [];
    const start = new Date(keys[0]);
    const end = new Date(keys[keys.length - 1]);

    const cur = new Date(start);
    while (cur <= end) {
      const key = cur.toISOString().slice(0, 10);
      result.push({ week: formatWeek(cur), earnings: weekMap[key] || 0 });
      cur.setDate(cur.getDate() + 7);
    }
    return result;
  }, [referrals]);

  return (
    <div className="glass rounded-xl p-5 md:p-6">
      <h3 className="font-display font-semibold text-sm mb-4">Earnings Per Week</h3>
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="week" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
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
            <Line type="monotone" dataKey="earnings" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))" }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
