import { useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { format } from "date-fns";
import {
  FileDown,
  FilePlus2,
  Loader2,
  Filter as FilterIcon,
  Inbox,
  Receipt,
} from "lucide-react";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import { toast } from "sonner";
import {
  StatusBadge,
  LiveIndicator,
  FilterTabs,
  SearchInput,
  EmptyState,
  TableSkeleton,
  SlidePanel,
  SlideSection,
  SlideRow,
  MonoChip,
} from "@/components/admin/ui";

const STATUS_OPTIONS = ["completed", "pending", "authorised", "failed", "expired"] as const;

const getPaymentType = (payload: any): "subscription" | "shop_order" =>
  payload?.type === "shop_order" ? "shop_order" : "subscription";

const getProductOrPlan = (payload: any): string =>
  payload?.type === "shop_order" ? payload?.product || "—" : payload?.plan || "—";

const getAmountNum = (payload: any): number => {
  if (payload?.type === "shop_order") {
    const total = payload?.total ?? payload?.amount;
    return total !== undefined ? Number(total) : 0;
  }
  return payload?.amount !== undefined ? Number(payload.amount) : 0;
};

export default function AdminPayments() {
  const [payments, setPayments] = useState<any[]>([]);
  const [invoiceMap, setInvoiceMap] = useState<
    Record<string, { invoice_number: string; pdf_path: string | null }>
  >({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [planFilter, setPlanFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "subscription" | "shop_order">("all");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any | null>(null);

  const fetchPayments = useCallback(async () => {
    const [{ data: pays }, { data: invs }] = await Promise.all([
      supabase.from("payments").select("*").order("created_at", { ascending: false }),
      supabase.from("customer_invoices").select("payment_id, invoice_number, pdf_path"),
    ]);
    setPayments(pays || []);
    const map: Record<string, { invoice_number: string; pdf_path: string | null }> = {};
    (invs || []).forEach((i: any) => {
      if (i.payment_id) map[i.payment_id] = { invoice_number: i.invoice_number, pdf_path: i.pdf_path };
    });
    setInvoiceMap(map);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);
  const { lastRefreshed } = useAutoRefresh(fetchPayments);

  const handleDownload = async (paymentId: string) => {
    const inv = invoiceMap[paymentId];
    if (!inv?.pdf_path) return;
    setBusyId(paymentId);
    const { data, error } = await supabase.storage
      .from("customer-invoices")
      .createSignedUrl(inv.pdf_path, 60 * 5);
    setBusyId(null);
    if (error || !data?.signedUrl) {
      toast.error("Could not generate download link");
      return;
    }
    window.open(data.signedUrl, "_blank");
  };

  const handleGenerate = async (
    paymentId: string,
    type: "shop_order" | "subscription_initial",
  ) => {
    setBusyId(paymentId);
    const { error } = await supabase.functions.invoke("generate-customer-invoice", {
      body: { paymentId, type },
    });
    setBusyId(null);
    if (error) {
      toast.error("Failed to generate invoice");
      return;
    }
    toast.success("Invoice generated");
    fetchPayments();
  };

  const plans = useMemo(() => {
    const set = new Set(
      payments.map((p) => getProductOrPlan(p.payload as any)).filter((v) => v && v !== "—"),
    );
    return Array.from(set).sort();
  }, [payments]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: payments.length };
    for (const p of payments) counts[p.status] = (counts[p.status] || 0) + 1;
    return counts;
  }, [payments]);

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: payments.length,
      subscription: 0,
      shop_order: 0,
    };
    for (const p of payments) {
      const t = getPaymentType(p.payload as any);
      counts[t] = (counts[t] || 0) + 1;
    }
    return counts;
  }, [payments]);

  const filtered = payments.filter((p) => {
    const payload = p.payload as any;
    const productOrPlan = getProductOrPlan(payload);
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      p.merchant_ref?.toLowerCase().includes(q) ||
      p.revolut_order_id?.toLowerCase().includes(q) ||
      payload?.email?.toLowerCase().includes(q) ||
      productOrPlan.toLowerCase().includes(q);
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    const matchesPlan = planFilter === "all" || productOrPlan === planFilter;
    const matchesType = typeFilter === "all" || getPaymentType(payload) === typeFilter;
    return matchesSearch && matchesStatus && matchesPlan && matchesType;
  });

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl admin-page">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-syne font-bold" style={{ fontSize: 22, color: "var(--ad-text)" }}>
            Payments
          </h1>
          <p className="text-[13px] mt-0.5" style={{ color: "var(--ad-text-secondary)" }}>
            All transactions — subscriptions & shop orders
          </p>
        </div>
        <LiveIndicator timestamp={lastRefreshed} />
      </div>

      {/* Two-level filter rows */}
      <div className="space-y-2">
        <FilterTabs
          items={[
            { id: "all", label: "All", count: typeCounts.all || 0 },
            { id: "subscription", label: "Subscriptions", count: typeCounts.subscription || 0 },
            { id: "shop_order", label: "Shop Orders", count: typeCounts.shop_order || 0 },
          ]}
          value={typeFilter}
          onChange={(v) => setTypeFilter(v as any)}
        />
        <FilterTabs
          items={[
            { id: "all", label: "All Statuses", count: statusCounts.all || 0 },
            ...STATUS_OPTIONS.map((s) => ({
              id: s,
              label: s.charAt(0).toUpperCase() + s.slice(1),
              count: statusCounts[s] || 0,
            })),
          ]}
          value={statusFilter}
          onChange={setStatusFilter}
        />
      </div>

      {/* Search + product filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <SearchInput
            placeholder="Search by email, product, plan or order ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={planFilter} onValueChange={setPlanFilter}>
          <SelectTrigger
            className="w-56 h-10 text-[13px]"
            style={{
              background: "var(--ad-surface-deep)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "var(--ad-text-soft)",
              borderRadius: 8,
            }}
          >
            <FilterIcon className="w-3.5 h-3.5 mr-2" />
            <SelectValue placeholder="All Products / Plans" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Products / Plans</SelectItem>
            {plans.map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="admin-table-head">
                <th className="text-left px-4 py-2.5 font-medium">Type</th>
                <th className="text-left px-4 py-2.5 font-medium">Email</th>
                <th className="text-left px-4 py-2.5 font-medium">Product / Plan</th>
                <th className="text-right px-4 py-2.5 font-medium">Amount</th>
                <th className="text-left px-4 py-2.5 font-medium">Status</th>
                <th className="text-left px-4 py-2.5 font-medium">Date</th>
                <th className="text-left px-4 py-2.5 font-medium">Order ID</th>
                <th className="text-left px-4 py-2.5 font-medium">Invoice</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-5">
                    <TableSkeleton rows={6} cols={8} />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <EmptyState
                      icon={Inbox}
                      title="No payments found"
                      subtitle="Try adjusting your filters"
                    />
                  </td>
                </tr>
              ) : (
                <TooltipProvider delayDuration={250}>
                  {filtered.map((p) => {
                    const payload = (p.payload || {}) as any;
                    const type = getPaymentType(payload);
                    const inv = invoiceMap[p.id];
                    const canGenerate = p.status === "completed";
                    const amount = getAmountNum(payload);
                    return (
                      <tr
                        key={p.id}
                        onClick={() => setSelected(p)}
                        className="admin-row cursor-pointer"
                        style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
                      >
                        <td className="px-4 py-3">
                          <StatusBadge status={type === "shop_order" ? "shop" : "subscription"} />
                        </td>
                        <td className="px-4 py-3" style={{ color: "var(--ad-text)" }}>
                          {payload.email || "—"}
                        </td>
                        <td
                          className="px-4 py-3 max-w-[220px] truncate"
                          title={getProductOrPlan(payload)}
                          style={{ color: "var(--ad-text-soft)" }}
                        >
                          {getProductOrPlan(payload)}
                        </td>
                        <td
                          className="px-4 py-3 text-right font-mono-jb"
                          style={{ color: "var(--ad-text)" }}
                        >
                          €{amount.toFixed(2)}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={p.status} withDot={p.status === "completed"} />
                        </td>
                        <td className="px-4 py-3" style={{ color: "var(--ad-text-secondary)" }}>
                          <div className="font-mono-jb text-[12px]">
                            {format(new Date(p.created_at), "MMM dd, yyyy")}
                          </div>
                          <div
                            className="font-mono-jb text-[11px]"
                            style={{ color: "var(--ad-text-faint)" }}
                          >
                            {format(new Date(p.created_at), "HH:mm")}
                          </div>
                        </td>
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          {p.revolut_order_id ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="inline-block">
                                  <MonoChip
                                    value={p.revolut_order_id}
                                    display={`${p.revolut_order_id.slice(0, 10)}…`}
                                  />
                                </span>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="text-[11px] font-mono">
                                {p.revolut_order_id}
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            <span style={{ color: "var(--ad-text-faint)" }}>—</span>
                          )}
                        </td>
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          {inv ? (
                            <button
                              onClick={() => handleDownload(p.id)}
                              disabled={busyId === p.id || !inv.pdf_path}
                              className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md text-[11px] font-medium transition-colors disabled:opacity-50"
                              style={{
                                background: "var(--ad-blue-soft-2)",
                                color: "var(--ad-accent-soft)",
                                border: "1px solid var(--ad-blue-border)",
                              }}
                              title={inv.invoice_number}
                            >
                              {busyId === p.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <FileDown className="w-3 h-3" />
                              )}
                              PDF
                            </button>
                          ) : canGenerate ? (
                            <button
                              onClick={() =>
                                handleGenerate(
                                  p.id,
                                  type === "shop_order" ? "shop_order" : "subscription_initial",
                                )
                              }
                              disabled={busyId === p.id}
                              className="admin-btn-ghost inline-flex items-center gap-1.5 h-7 px-2.5 text-[11px] disabled:opacity-50"
                            >
                              {busyId === p.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <FilePlus2 className="w-3 h-3" />
                              )}
                              Generate
                            </button>
                          ) : (
                            <span style={{ color: "var(--ad-text-faint)" }}>—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </TooltipProvider>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Slide Panel */}
      <SlidePanel open={!!selected} onClose={() => setSelected(null)} width={460}>
        {selected &&
          (() => {
            const payload = (selected.payload || {}) as any;
            const type = getPaymentType(payload);
            const amount = getAmountNum(payload);
            const inv = invoiceMap[selected.id];
            return (
              <div>
                <div className="px-6 pt-6 pb-5">
                  <p
                    className="text-[10px] uppercase mb-2"
                    style={{ color: "var(--ad-text-faint)", letterSpacing: "0.08em" }}
                  >
                    Payment
                  </p>
                  <h2
                    className="font-syne text-[18px] font-semibold break-all"
                    style={{ color: "var(--ad-text)" }}
                  >
                    {payload.email || selected.merchant_ref || "—"}
                  </h2>
                  <div className="flex items-center gap-2 mt-3">
                    <StatusBadge status={selected.status} withDot={selected.status === "completed"} />
                    <StatusBadge status={type === "shop_order" ? "shop" : "subscription"} />
                  </div>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span
                      className="font-mono-jb font-semibold"
                      style={{ fontSize: 26, color: "var(--ad-text)" }}
                    >
                      €{amount.toFixed(2)}
                    </span>
                    <span className="text-[12px]" style={{ color: "var(--ad-text-secondary)" }}>
                      {payload.currency || "EUR"}
                    </span>
                  </div>
                </div>

                <SlideSection title="Details">
                  <SlideRow label="Product / Plan" value={getProductOrPlan(payload)} />
                  {payload.category && <SlideRow label="Category" value={payload.category} />}
                  <SlideRow
                    label="Date"
                    value={
                      <span className="font-mono-jb">
                        {format(new Date(selected.created_at), "MMM dd, yyyy HH:mm")}
                      </span>
                    }
                  />
                  {selected.merchant_ref && (
                    <SlideRow
                      label="Merchant ref"
                      value={<MonoChip value={selected.merchant_ref} />}
                    />
                  )}
                  {selected.revolut_order_id && (
                    <SlideRow
                      label="Revolut order"
                      value={
                        <MonoChip
                          value={selected.revolut_order_id}
                          display={`${selected.revolut_order_id.slice(0, 14)}…`}
                        />
                      }
                    />
                  )}
                </SlideSection>

                <SlideSection title="Invoice">
                  {inv ? (
                    <div className="space-y-3">
                      <SlideRow
                        label="Invoice #"
                        value={<MonoChip value={inv.invoice_number} />}
                      />
                      <button
                        onClick={() => handleDownload(selected.id)}
                        disabled={busyId === selected.id || !inv.pdf_path}
                        className="admin-btn-primary w-full h-10 inline-flex items-center justify-center gap-2 text-[13px] disabled:opacity-50"
                      >
                        {busyId === selected.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <FileDown className="w-3.5 h-3.5" />
                        )}
                        Download PDF
                      </button>
                    </div>
                  ) : selected.status === "completed" ? (
                    <button
                      onClick={() =>
                        handleGenerate(
                          selected.id,
                          type === "shop_order" ? "shop_order" : "subscription_initial",
                        )
                      }
                      disabled={busyId === selected.id}
                      className="admin-btn-ghost w-full h-10 inline-flex items-center justify-center gap-2 text-[13px] disabled:opacity-50"
                    >
                      {busyId === selected.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <FilePlus2 className="w-3.5 h-3.5" />
                      )}
                      Generate Invoice
                    </button>
                  ) : (
                    <EmptyState
                      icon={Receipt}
                      title="Invoice not available"
                      subtitle="Only completed payments can have invoices"
                    />
                  )}
                </SlideSection>
              </>
            );
          })()}
      </SlidePanel>
    </div>
  );
}
