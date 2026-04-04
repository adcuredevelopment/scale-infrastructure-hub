import { Badge } from "@/components/ui/badge";
import type { AffiliateReferral } from "@/hooks/useAffiliate";

const typeLabels: Record<string, string> = {
  signup_bonus: "Bonus",
  recurring: "Recurring",
};

interface Props {
  referrals: AffiliateReferral[];
}

function maskEmail(email: string | null) {
  if (!email) return "—";
  const [local, domain] = email.split("@");
  return `${local.slice(0, 2)}***@${domain}`;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  approved: "bg-green-500/10 text-green-400 border-green-500/20",
  paid: "bg-primary/10 text-primary border-primary/20",
};

export function ReferralsTable({ referrals }: Props) {
  return (
    <div className="glass rounded-xl p-5 md:p-6">
      <h3 className="font-display font-semibold text-sm mb-4">Recent Referrals</h3>
      {referrals.length === 0 ? (
        <p className="text-sm text-muted-foreground">No referrals yet. Share your link to start earning!</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted-foreground text-xs border-b border-border">
                <th className="text-left py-2 font-medium">Customer</th>
                <th className="text-left py-2 font-medium">Plan</th>
                <th className="text-center py-2 font-medium">Type</th>
                <th className="text-right py-2 font-medium">Commission</th>
                <th className="text-center py-2 font-medium">Status</th>
                <th className="text-right py-2 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {referrals.slice(0, 10).map((r) => (
                <tr key={r.id} className="border-b border-border/50">
                  <td className="py-2.5">{maskEmail(r.customer_email)}</td>
                  <td className="py-2.5">{r.plan_name || "—"}</td>
                  <td className="py-2.5 text-right">€{Number(r.commission_amount).toFixed(2)}</td>
                  <td className="py-2.5 text-center">
                    <Badge variant="outline" className={statusColors[r.status] || ""}>
                      {r.status}
                    </Badge>
                  </td>
                  <td className="py-2.5 text-right text-muted-foreground">
                    {new Date(r.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
