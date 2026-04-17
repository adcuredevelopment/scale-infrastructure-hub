import { Wallet } from "lucide-react";
import type { AffiliatePayout } from "@/hooks/useAffiliate";

interface Props {
  payouts: AffiliatePayout[];
}

function badgeClass(status: string) {
  switch (status) {
    case "paid": return "aff-badge-paid";
    case "failed": return "aff-badge-failed";
    case "pending":
    case "processing": return "aff-badge-pending";
    default: return "aff-badge-pending";
  }
}

export function PayoutsTable({ payouts }: Props) {
  return (
    <div className="aff-card overflow-hidden">
      <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
        <h3 className="aff-syne font-semibold text-[14px] text-[#f1f5f9]">Payout History</h3>
      </div>

      {payouts.length === 0 ? (
        <div className="px-5 py-12 flex flex-col items-center text-center">
          <Wallet className="w-8 h-8 text-[#334155] mb-3" />
          <p className="text-[14px] text-[#64748b]">No payouts yet</p>
        </div>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="md:hidden p-4 space-y-3">
            {payouts.map((p) => (
              <div key={p.id} className="rounded-lg p-3 space-y-2"
                   style={{ background: "#0d0d11", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="flex items-center justify-between">
                  <span className="aff-mono text-[14px] font-semibold text-[#f1f5f9]">€{Number(p.amount).toFixed(2)}</span>
                  <span className={`aff-badge ${badgeClass(p.status)}`}>
                    {p.status === "paid" && <span className="dot" />}
                    {p.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[12px]">
                  <span className="aff-mono text-[#64748b]">
                    {p.payout_date ? new Date(p.payout_date).toLocaleDateString() : "—"}
                  </span>
                  <span className="text-[#94a3b8] italic truncate max-w-[60%] text-right">{p.notes || "—"}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="aff-table">
              <thead>
                <tr>
                  <th>Amount</th>
                  <th style={{ textAlign: "center" }}>Status</th>
                  <th style={{ textAlign: "right" }}>Date</th>
                  <th style={{ textAlign: "right" }}>Notes</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((p) => (
                  <tr key={p.id}>
                    <td className="aff-mono" style={{ fontWeight: 600, fontSize: 14 }}>
                      €{Number(p.amount).toFixed(2)}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <span className={`aff-badge ${badgeClass(p.status)}`}>
                        {p.status === "paid" && <span className="dot" />}
                        {p.status}
                      </span>
                    </td>
                    <td className="aff-mono dim" style={{ textAlign: "right", fontSize: 12 }}>
                      {p.payout_date ? new Date(p.payout_date).toLocaleDateString() : "—"}
                    </td>
                    <td className="dim" style={{ textAlign: "right", fontStyle: "italic", maxWidth: 200 }}>
                      {p.notes || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
