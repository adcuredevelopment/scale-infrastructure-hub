import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import type { AffiliateReferral } from "@/hooks/useAffiliate";

const typeLabels: Record<string, string> = {
  signup_bonus: "Bonus",
  recurring: "Recurring",
};

interface Props {
  referrals: AffiliateReferral[];
  cancelledEmails: Set<string>;
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

function TypeBadge({ type, isCancelled }: { type: string; isCancelled: boolean }) {
  return (
    <Badge
      variant="outline"
      className={
        isCancelled
          ? "bg-destructive/10 text-destructive border-destructive/20"
          : type === "signup_bonus"
          ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
          : "bg-blue-500/10 text-blue-400 border-blue-500/20"
      }
    >
      {isCancelled ? "Cancelled" : typeLabels[type] || type}
    </Badge>
  );
}

type FilterType = "all" | "active" | "cancelled";

export function ReferralsTable({ referrals, cancelledEmails }: Props) {
  const [filter, setFilter] = useState<FilterType>("all");

  const isCancelledReferral = (r: AffiliateReferral) =>
    !!(r.customer_email && cancelledEmails.has(r.customer_email.toLowerCase()));

  const filtered = referrals.filter((r) => {
    const cancelled = isCancelledReferral(r);
    if (filter === "active") return !cancelled;
    if (filter === "cancelled") return cancelled;
    return true;
  });

  const filters: { label: string; value: FilterType }[] = [
    { label: "All", value: "all" },
    { label: "Active", value: "active" },
    { label: "Cancelled", value: "cancelled" },
  ];

  return (
    <div className="glass rounded-xl p-4 sm:p-5 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-sm">Referrals</h3>
        <div className="flex gap-1.5">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                filter === f.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {filter === "all" ? "No referrals yet. Share your link to start earning!" : `No ${filter} referrals.`}
        </p>
      ) : (
        <>
          {/* Mobile card layout */}
          <div className="space-y-3 md:hidden">
            {filtered.map((r) => {
              const cancelled = isCancelledReferral(r);
              return (
                <div key={r.id} className="rounded-lg border border-border/50 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate max-w-[60%]">{maskEmail(r.customer_email)}</span>
                    <Badge variant="outline" className={statusColors[r.status] || ""}>
                      {r.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{r.plan_name || "—"}</span>
                    <TypeBadge type={r.referral_type} isCancelled={cancelled} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">€{Number(r.commission_amount).toFixed(2)}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(r.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop table layout */}
          <div className="hidden md:block overflow-x-auto">
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
                {filtered.map((r) => {
                  const cancelled = isCancelledReferral(r);
                  return (
                    <tr key={r.id} className="border-b border-border/50">
                      <td className="py-2.5">{maskEmail(r.customer_email)}</td>
                      <td className="py-2.5">{r.plan_name || "—"}</td>
                      <td className="py-2.5 text-center">
                        <TypeBadge type={r.referral_type} isCancelled={cancelled} />
                      </td>
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
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
