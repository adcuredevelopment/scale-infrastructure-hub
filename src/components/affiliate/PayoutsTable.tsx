import { Badge } from "@/components/ui/badge";
import type { AffiliatePayout } from "@/hooks/useAffiliate";

interface Props {
  payouts: AffiliatePayout[];
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  processing: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  paid: "bg-green-500/10 text-green-400 border-green-500/20",
  failed: "bg-destructive/10 text-destructive border-destructive/20",
};

export function PayoutsTable({ payouts }: Props) {
  return (
    <div className="glass rounded-xl p-5 md:p-6">
      <h3 className="font-display font-semibold text-sm mb-4">Payout History</h3>
      {payouts.length === 0 ? (
        <p className="text-sm text-muted-foreground">No payouts yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted-foreground text-xs border-b border-border">
                <th className="text-left py-2 font-medium">Amount</th>
                <th className="text-center py-2 font-medium">Status</th>
                <th className="text-right py-2 font-medium">Date</th>
                <th className="text-right py-2 font-medium">Notes</th>
              </tr>
            </thead>
            <tbody>
              {payouts.map((p) => (
                <tr key={p.id} className="border-b border-border/50">
                  <td className="py-2.5">€{Number(p.amount).toFixed(2)}</td>
                  <td className="py-2.5 text-center">
                    <Badge variant="outline" className={statusColors[p.status] || ""}>
                      {p.status}
                    </Badge>
                  </td>
                  <td className="py-2.5 text-right text-muted-foreground">
                    {p.payout_date ? new Date(p.payout_date).toLocaleDateString() : "—"}
                  </td>
                  <td className="py-2.5 text-right text-muted-foreground truncate max-w-[150px]">
                    {p.notes || "—"}
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
