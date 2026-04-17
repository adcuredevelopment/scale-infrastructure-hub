import { useState } from "react";
import { Wallet, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import type { AffiliatePayout, AffiliateInvoice } from "@/hooks/useAffiliate";

interface Props {
  payouts: AffiliatePayout[];
  invoicesByPayout: Map<string, AffiliateInvoice>;
  onOpenInvoice: (pdfPath: string) => Promise<void>;
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

export function PayoutsTable({ payouts, invoicesByPayout, onOpenInvoice }: Props) {
  const [busyId, setBusyId] = useState<string | null>(null);

  const handleOpen = async (inv: AffiliateInvoice | undefined) => {
    if (!inv?.pdf_path) {
      toast.error("Invoice PDF is not available yet");
      return;
    }
    try {
      setBusyId(inv.id);
      await onOpenInvoice(inv.pdf_path);
    } catch {
      toast.error("Could not open invoice");
    } finally {
      setBusyId(null);
    }
  };

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
            {payouts.map((p) => {
              const inv = invoicesByPayout.get(p.id);
              return (
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
                    {inv?.pdf_path ? (
                      <button
                        onClick={() => handleOpen(inv)}
                        disabled={busyId === inv.id}
                        className="inline-flex items-center gap-1 text-[12px] text-[#60a5fa] hover:text-[#93c5fd]"
                      >
                        <ExternalLink className="w-3 h-3" /> View Invoice
                      </button>
                    ) : (
                      <span className="text-[#475569]">—</span>
                    )}
                  </div>
                  {p.notes && (
                    <div className="text-[12px] text-[#94a3b8] italic">{p.notes}</div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="aff-table">
              <thead>
                <tr>
                  <th>Amount</th>
                  <th style={{ textAlign: "center" }}>Status</th>
                  <th style={{ textAlign: "right" }}>Date</th>
                  <th style={{ textAlign: "left" }}>Invoice</th>
                  <th style={{ textAlign: "right" }}>Notes</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((p) => {
                  const inv = invoicesByPayout.get(p.id);
                  return (
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
                      <td>
                        {inv?.pdf_path ? (
                          <button
                            onClick={() => handleOpen(inv)}
                            disabled={busyId === inv.id}
                            className="inline-flex items-center gap-1 text-[12px] text-[#60a5fa] hover:text-[#93c5fd]"
                          >
                            <ExternalLink className="w-3 h-3" /> View Invoice
                          </button>
                        ) : (
                          <span className="text-[#475569]">—</span>
                        )}
                      </td>
                      <td className="dim" style={{ textAlign: "right", fontStyle: "italic", maxWidth: 200 }}>
                        {p.notes || "—"}
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
