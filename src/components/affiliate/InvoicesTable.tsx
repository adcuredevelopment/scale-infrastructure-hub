import { useState } from "react";
import { FileText, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { AffiliateInvoice } from "@/hooks/useAffiliate";

interface Props {
  invoices: AffiliateInvoice[];
  onOpenInvoice: (pdfPath: string) => Promise<void>;
}

export function InvoicesTable({ invoices, onOpenInvoice }: Props) {
  const [busyId, setBusyId] = useState<string | null>(null);

  const handleDownload = async (inv: AffiliateInvoice) => {
    if (!inv.pdf_path) {
      toast.error("PDF is still being generated");
      return;
    }
    try {
      setBusyId(inv.id);
      await onOpenInvoice(inv.pdf_path);
    } catch {
      toast.error("Could not download invoice");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="aff-card overflow-hidden">
      <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
        <h3 className="aff-syne font-semibold text-[14px] text-[#f1f5f9]">Invoices</h3>
        <p className="text-[12px] text-[#64748b] mt-0.5">
          Your self-billing invoices for received payouts
        </p>
      </div>

      {invoices.length === 0 ? (
        <div className="px-5 py-12 flex flex-col items-center text-center">
          <FileText className="w-8 h-8 text-[#334155] mb-3" />
          <p className="text-[14px] text-[#64748b]">No invoices yet</p>
          <p className="text-[12px] text-[#475569] mt-1">
            Invoices are generated automatically after each payout.
          </p>
        </div>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="md:hidden p-4 space-y-3">
            {invoices.map((inv) => (
              <div key={inv.id} className="rounded-lg p-3 space-y-2"
                   style={{ background: "#0d0d11", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="flex items-center justify-between">
                  <span className="aff-mono text-[13px] text-[#f1f5f9]">{inv.invoice_number}</span>
                  <span className="aff-mono text-[13px] font-semibold text-[#f1f5f9]">
                    €{Number(inv.amount).toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="aff-mono text-[12px] text-[#64748b]">
                    {new Date(inv.issued_at).toLocaleDateString()}
                  </span>
                  {inv.pdf_path ? (
                    <button
                      onClick={() => handleDownload(inv)}
                      disabled={busyId === inv.id}
                      className="inline-flex items-center gap-1 text-[12px] text-[#60a5fa] hover:text-[#93c5fd]"
                    >
                      {busyId === inv.id
                        ? <Loader2 className="w-3 h-3 animate-spin" />
                        : <Download className="w-3 h-3" />}
                      Download PDF
                    </button>
                  ) : (
                    <span className="text-[#475569] text-[12px]">Generating…</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="aff-table">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th style={{ textAlign: "right" }}>Amount</th>
                  <th style={{ textAlign: "right" }}>Date</th>
                  <th style={{ textAlign: "center" }}>Status</th>
                  <th style={{ textAlign: "right" }}>Download</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td className="aff-mono">{inv.invoice_number}</td>
                    <td className="aff-mono" style={{ textAlign: "right", fontWeight: 500 }}>
                      €{Number(inv.amount).toFixed(2)}
                    </td>
                    <td className="aff-mono dim" style={{ textAlign: "right", fontSize: 12 }}>
                      {new Date(inv.issued_at).toLocaleDateString()}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <span className={`aff-badge ${inv.pdf_path ? "aff-badge-paid" : "aff-badge-pending"}`}>
                        {inv.pdf_path && <span className="dot" />}
                        {inv.pdf_path ? "paid" : "pending"}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {inv.pdf_path ? (
                        <button
                          onClick={() => handleDownload(inv)}
                          disabled={busyId === inv.id}
                          className="inline-flex items-center gap-1 text-[12px] text-[#60a5fa] hover:text-[#93c5fd]"
                        >
                          {busyId === inv.id
                            ? <Loader2 className="w-3 h-3 animate-spin" />
                            : <Download className="w-3 h-3" />}
                          Download PDF
                        </button>
                      ) : (
                        <span className="text-[#475569] text-[12px]">Generating…</span>
                      )}
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
