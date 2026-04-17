import { useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { MoreHorizontal, Inbox, Eye, Copy, Download, CreditCard, Receipt } from "lucide-react";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import { toast } from "sonner";
import {
  StatusBadge,
  LiveIndicator,
  SearchInput,
  EmptyState,
  TableSkeleton,
  StatChip,
  SlidePanel,
  SlideSection,
  SlideRow,
  Avatar,
} from "@/components/admin/ui";

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any | null>(null);
  const [customerSubs, setCustomerSubs] = useState<any[]>([]);
  const [customerPayments, setCustomerPayments] = useState<any[]>([]);
  const [drawerLoading, setDrawerLoading] = useState(false);

  const fetchCustomers = useCallback(async () => {
    const { data } = await supabase
      .from("customers")
      .select("*")
      .order("created_at", { ascending: false });
    setCustomers(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);
  const { lastRefreshed } = useAutoRefresh(fetchCustomers);

  const openCustomer = async (customer: any) => {
    setSelected(customer);
    setDrawerLoading(true);
    const [subsRes, paymentsRes] = await Promise.all([
      supabase
        .from("subscriptions")
        .select("*")
        .eq("customer_email", customer.email)
        .order("created_at", { ascending: false }),
      supabase.from("payments").select("*").order("created_at", { ascending: false }),
    ]);
    setCustomerSubs(subsRes.data || []);
    const allPayments = paymentsRes.data || [];
    setCustomerPayments(
      allPayments.filter((p: any) => (p.payload as any)?.email === customer.email),
    );
    setDrawerLoading(false);
  };

  const filtered = customers.filter((c) => {
    const q = search.toLowerCase();
    return (
      !q || c.email?.toLowerCase().includes(q) || c.name?.toLowerCase().includes(q)
    );
  });

  const totalLtv = useMemo(
    () => customers.reduce((acc, c) => acc + Number(c.total_spent || 0), 0),
    [customers],
  );
  const avgLtv = customers.length > 0 ? totalLtv / customers.length : 0;

  const copyEmail = async (email: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      await navigator.clipboard.writeText(email);
      toast.success("Email copied");
    } catch {
      toast.error("Failed to copy");
    }
  };

  const exportCsv = () => {
    toast.info("CSV export coming soon");
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl admin-page">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-syne font-bold" style={{ fontSize: 22, color: "var(--ad-text)" }}>
            Customers
          </h1>
          <p className="text-[13px] mt-0.5" style={{ color: "var(--ad-text-secondary)" }}>
            Customer base & lifetime value
          </p>
        </div>
        <div className="flex items-center gap-3">
          <LiveIndicator timestamp={lastRefreshed} />
          <button
            onClick={exportCsv}
            className="admin-btn-ghost inline-flex items-center gap-2 px-3 h-9 text-[12px]"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Stats chips */}
      <div className="flex flex-wrap gap-2">
        <StatChip
          label="Total Customers"
          value={String(customers.length)}
          dotColor="#3b82f6"
        />
        <StatChip
          label="Total LTV"
          value={`€${totalLtv.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          dotColor="#10b981"
        />
        <StatChip
          label="Avg LTV"
          value={`€${avgLtv.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          dotColor="#a78bfa"
        />
      </div>

      {/* Search */}
      <SearchInput
        placeholder="Search customers by email or name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Table */}
      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="admin-table-head">
                <th className="text-left px-5 py-2.5 font-medium">Customer</th>
                <th className="text-left px-5 py-2.5 font-medium">Name</th>
                <th className="text-left px-5 py-2.5 font-medium">Plan</th>
                <th className="text-right px-5 py-2.5 font-medium">Total Spent</th>
                <th className="text-center px-5 py-2.5 font-medium">Subs</th>
                <th className="text-left px-5 py-2.5 font-medium">Joined</th>
                <th className="text-right px-5 py-2.5 font-medium w-12">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-5">
                    <TableSkeleton rows={6} cols={7} />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <EmptyState
                      icon={Inbox}
                      title="No customers found"
                      subtitle="Customers appear here after their first payment"
                    />
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => openCustomer(c)}
                    className="admin-row cursor-pointer"
                    style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar email={c.email} name={c.name} size={30} />
                        <span style={{ color: "var(--ad-text)" }}>{c.email}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3" style={{ color: "var(--ad-text-soft)" }}>
                      {c.name || "—"}
                    </td>
                    <td className="px-5 py-3" style={{ color: "var(--ad-text-soft)" }}>
                      {c.plan || "—"}
                    </td>
                    <td
                      className="px-5 py-3 text-right font-mono-jb font-semibold"
                      style={{ color: "var(--ad-text)" }}
                    >
                      €{Number(c.total_spent).toFixed(2)}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span
                        className="font-mono-jb text-[11px] px-2 py-0.5 rounded"
                        style={{
                          background: "rgba(255,255,255,0.05)",
                          color: "var(--ad-text-soft)",
                        }}
                      >
                        {c.subscription_count || 0}
                      </span>
                    </td>
                    <td
                      className="px-5 py-3 font-mono-jb text-[12px]"
                      style={{ color: "var(--ad-text-secondary)" }}
                    >
                      {format(new Date(c.created_at), "MMM dd, yyyy")}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <button
                            className="w-7 h-7 rounded-md inline-flex items-center justify-center hover:bg-white/5 transition-colors"
                            style={{ color: "var(--ad-text-secondary)" }}
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          onClick={(e) => e.stopPropagation()}
                          className="w-44"
                        >
                          <DropdownMenuItem onClick={() => openCustomer(c)}>
                            <Eye className="w-3.5 h-3.5 mr-2" />
                            View details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => copyEmail(c.email, e as any)}>
                            <Copy className="w-3.5 h-3.5 mr-2" />
                            Copy email
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Detail Panel */}
      <SlidePanel open={!!selected} onClose={() => setSelected(null)} width={720}>
        {selected && (
          <>
            <div className="px-6 pt-6 pb-5">
              <p
                className="text-[10px] uppercase mb-3"
                style={{ color: "var(--ad-text-faint)", letterSpacing: "0.08em" }}
              >
                Customer
              </p>
              <div className="flex items-start gap-3">
                <Avatar email={selected.email} name={selected.name} size={48} />
                <div className="min-w-0 flex-1">
                  <h2
                    className="font-syne text-[16px] font-semibold break-all"
                    style={{ color: "var(--ad-text)" }}
                  >
                    {selected.name || selected.email}
                  </h2>
                  {selected.name && (
                    <p
                      className="text-[12px] break-all mt-0.5"
                      style={{ color: "var(--ad-text-secondary)" }}
                    >
                      {selected.email}
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span
                  className="font-mono-jb font-semibold"
                  style={{ fontSize: 26, color: "var(--ad-text)" }}
                >
                  €{Number(selected.total_spent).toFixed(2)}
                </span>
                <span className="text-[12px]" style={{ color: "var(--ad-text-secondary)" }}>
                  lifetime value
                </span>
              </div>
            </div>

            <SlideSection title="Profile">
              <SlideRow label="Plan" value={selected.plan || "—"} />
              <SlideRow
                label="Joined"
                value={
                  <span className="font-mono-jb">
                    {format(new Date(selected.created_at), "MMM dd, yyyy")}
                  </span>
                }
              />
              {selected.last_payment_at && (
                <SlideRow
                  label="Last payment"
                  value={
                    <span className="font-mono-jb">
                      {format(new Date(selected.last_payment_at), "MMM dd, yyyy")}
                    </span>
                  }
                />
              )}
              <SlideRow
                label="Subscriptions"
                value={String(selected.subscription_count || 0)}
              />
            </SlideSection>

            <SlideSection title={`Subscriptions (${customerSubs.length})`}>
              {drawerLoading ? (
                <p className="text-[12px]" style={{ color: "var(--ad-text-secondary)" }}>
                  Loading…
                </p>
              ) : customerSubs.length === 0 ? (
                <EmptyState icon={CreditCard} title="No subscriptions" />
              ) : (
                <div className="space-y-2">
                  {customerSubs.map((s) => (
                    <div
                      key={s.id}
                      className="rounded-lg p-3"
                      style={{
                        background: "var(--ad-surface-deep)",
                        border: "1px solid var(--ad-border-subtle)",
                      }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className="text-[13px] font-medium"
                          style={{ color: "var(--ad-text)" }}
                        >
                          {s.plan_name}
                        </span>
                        <StatusBadge status={s.status} withDot={s.status === "active"} />
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span
                          className="font-mono-jb"
                          style={{ color: "var(--ad-text-soft)" }}
                        >
                          €{Number(s.amount).toFixed(2)} / {s.currency}
                        </span>
                        <span
                          className="font-mono-jb"
                          style={{ color: "var(--ad-text-secondary)" }}
                        >
                          {format(new Date(s.started_at), "MMM dd, yyyy")}
                        </span>
                      </div>
                      {s.expires_at && (
                        <p
                          className="text-[11px] mt-1 font-mono-jb"
                          style={{ color: "var(--ad-text-faint)" }}
                        >
                          Expires {format(new Date(s.expires_at), "MMM dd, yyyy")}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </SlideSection>

            <SlideSection title={`Payments (${customerPayments.length})`}>
              {drawerLoading ? (
                <p className="text-[12px]" style={{ color: "var(--ad-text-secondary)" }}>
                  Loading…
                </p>
              ) : customerPayments.length === 0 ? (
                <EmptyState icon={Receipt} title="No payments" />
              ) : (
                <div className="space-y-2">
                  {customerPayments.map((p) => {
                    const payload = (p.payload || {}) as any;
                    return (
                      <div
                        key={p.id}
                        className="rounded-lg p-3"
                        style={{
                          background: "var(--ad-surface-deep)",
                          border: "1px solid var(--ad-border-subtle)",
                        }}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className="text-[13px] font-medium"
                            style={{ color: "var(--ad-text)" }}
                          >
                            {payload.plan || payload.product || "Payment"}
                          </span>
                          <StatusBadge status={p.status} withDot={p.status === "completed"} />
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span
                            className="font-mono-jb font-semibold"
                            style={{ color: "var(--ad-text)" }}
                          >
                            €{Number(payload.amount || payload.total || 0).toFixed(2)}
                          </span>
                          <span
                            className="font-mono-jb"
                            style={{ color: "var(--ad-text-secondary)" }}
                          >
                            {format(new Date(p.created_at), "MMM dd, HH:mm")}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </SlideSection>
          </>
        )}
      </SlidePanel>
    </div>
  );
}
