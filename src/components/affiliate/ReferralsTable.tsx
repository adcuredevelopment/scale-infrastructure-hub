import { useState } from "react";
import { UserX } from "lucide-react";
import type { AffiliateReferral } from "@/hooks/useAffiliate";

interface Props {
  referrals: AffiliateReferral[];
  cancelledEmails: Set<string>;
}

function maskEmail(email: string | null) {
  if (!email) return "—";
  const [local, domain] = email.split("@");
  return `${local.slice(0, 2)}***@${domain}`;
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
    <div className="aff-card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
        <h3 className="aff-syne font-semibold text-[14px] text-[#f1f5f9]">Referrals</h3>
        <div className="aff-tabs">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              data-active={filter === f.value}
              className="aff-tab aff-tab-sm"
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="px-5 py-12 flex flex-col items-center text-center">
          <UserX className="w-8 h-8 text-[#334155] mb-3" />
          <p className="text-[14px] text-[#64748b]">No referrals yet</p>
          <p className="text-[12px] text-[#475569] mt-1">Share your referral link to get started</p>
        </div>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="md:hidden p-4 space-y-3">
            {filtered.map((r) => {
              const cancelled = isCancelledReferral(r);
              return (
                <div key={r.id} className="rounded-lg p-3 space-y-2"
                     style={{ background: "#0d0d11", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[13px] text-[#94a3b8] truncate">{maskEmail(r.customer_email)}</span>
                    <span className={`aff-badge ${cancelled ? "aff-badge-cancelled" : "aff-badge-active"}`}>
                      {!cancelled && <span className="dot" />}
                      {cancelled ? "Cancelled" : "Active"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="aff-mono text-[13px] font-medium text-[#f1f5f9]">€{Number(r.commission_amount).toFixed(2)}</span>
                    <span className="aff-mono text-[12px] text-[#64748b]">
                      {new Date(r.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="aff-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Plan</th>
                  <th style={{ textAlign: "right" }}>Commission</th>
                  <th style={{ textAlign: "center" }}>Status</th>
                  <th style={{ textAlign: "right" }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => {
                  const cancelled = isCancelledReferral(r);
                  return (
                    <tr key={r.id}>
                      <td className="dim">{maskEmail(r.customer_email)}</td>
                      <td>{r.plan_name || "—"}</td>
                      <td className="aff-mono" style={{ textAlign: "right", fontWeight: 500 }}>
                        €{Number(r.commission_amount).toFixed(2)}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <span className={`aff-badge ${cancelled ? "aff-badge-cancelled" : "aff-badge-active"}`}>
                          {!cancelled && <span className="dot" />}
                          {cancelled ? "Cancelled" : "Active"}
                        </span>
                      </td>
                      <td className="aff-mono dim" style={{ textAlign: "right", fontSize: 12 }}>
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
