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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { format } from "date-fns";
import {
  MoreHorizontal,
  Inbox,
  AlertTriangle,
  Ban,
  Eye,
  Copy,
  Filter as FilterIcon,
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
  StatChip,
  SlidePanel,
  SlideSection,
  SlideRow,
  MonoChip,
} from "@/components/admin/ui";

const STATUS_OPTIONS = ["active", "cancelled", "expired", "pending"] as const;

export default function AdminSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [planFilter, setPlanFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any | null>(null);
  const [pendingCancel, setPendingCancel] = useState<any | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchSubscriptions = useCallback(async () => {
    const { data } = await supabase
      .from("subscriptions")
      .select("*")
      .order("created_at", { ascending: false });
    setSubscriptions(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);
  const { lastRefreshed } = useAutoRefresh(fetchSubscriptions);

  const plans = useMemo(() => {
    const set = new Set(subscriptions.map((s) => s.plan_name).filter(Boolean));
    return Array.from(set).sort();
  }, [subscriptions]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: subscriptions.length };
    for (const s of subscriptions) {
      counts[s.status] = (counts[s.status] || 0) + 1;
    }
    return counts;
  }, [subscriptions]);

  const mrr = useMemo(
    () =>
      subscriptions
        .filter((s) => s.status === "active")
        .reduce((acc, s) => acc + Number(s.amount || 0), 0),
    [subscriptions],
  );

  const filtered = subscriptions.filter((s) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      s.customer_email?.toLowerCase().includes(q) ||
      s.plan_name?.toLowerCase().includes(q) ||
      s.customer_name?.toLowerCase().includes(q);
    const matchesStatus = statusFilter === "all" || s.status === statusFilter;
    const matchesPlan = planFilter === "all" || s.plan_name === planFilter;
    return matchesSearch && matchesStatus && matchesPlan;
  });

  const isUpcomingLateCancellation = (sub: any) => {
    if (sub.status !== "active" || !sub.expires_at) return false;
    const expires = new Date(sub.expires_at).getTime();
    return expires - Date.now() < 14 * 24 * 60 * 60 * 1000;
  };

  const isLateCancellation = (sub: any) => {
    if (sub.status !== "cancelled" || !sub.cancelled_at || !sub.expires_at) return false;
    const cancelled = new Date(sub.cancelled_at).getTime();
    const expires = new Date(sub.expires_at).getTime();
    return expires - cancelled < 14 * 24 * 60 * 60 * 1000;
  };

  const copyEmail = async (email: string) => {
    try {
      await navigator.clipboard.writeText(email);
      toast.success("Email copied");
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleCancel = async () => {
    if (!pendingCancel) return;
    setCancelling(true);
    try {
      const { data, error } = await supabase.functions.invoke("cancel-subscription", {
        body: { subscriptionId: pendingCancel.id },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const msg = data?.late_cancellation
        ? "Subscription cancelled (late cancellation — final billing cycle applies)"
        : "Subscription cancelled successfully";
      toast.success(msg);
      setPendingCancel(null);
      setSelected(null);
      await fetchSubscriptions();
    } catch (err: any) {
      toast.error(err.message || "Failed to cancel subscription");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl admin-page">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-syne font-bold" style={{ fontSize: 22, color: "var(--ad-text)" }}>
            Subscriptions
          </h1>
          <p className="text-[13px] mt-0.5" style={{ color: "var(--ad-text-secondary)" }}>
            Manage all customer subscriptions
          </p>
        </div>
        <LiveIndicator timestamp={lastRefreshed} />
      </div>

      {/* Stats chips */}
      <div className="flex flex-wrap gap-2">
        <StatChip
          label="Active"
          value={String(statusCounts["active"] || 0)}
          dotColor="#10b981"
        />
        <StatChip
          label="Cancelled"
          value={String(statusCounts["cancelled"] || 0)}
          dotColor="#94a3b8"
        />
        <StatChip
          label="MRR"
          value={`€${mrr.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          dotColor="#3b82f6"
        />
      </div>

      {/* Filter tabs */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <FilterTabs
          items={[
            { id: "all", label: "All", count: statusCounts.all || 0 },
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

      {/* Search + plan filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <SearchInput
            placeholder="Search by email, name or plan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={planFilter} onValueChange={setPlanFilter}>
          <SelectTrigger
            className="w-48 h-10 text-[13px]"
            style={{
              background: "var(--ad-surface-deep)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "var(--ad-text-soft)",
              borderRadius: 8,
            }}
          >
            <FilterIcon className="w-3.5 h-3.5 mr-2" />
            <SelectValue placeholder="All Plans" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Plans</SelectItem>
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
                <th className="text-left px-5 py-2.5 font-medium">Customer</th>
                <th className="text-left px-5 py-2.5 font-medium">Plan</th>
                <th className="text-right px-5 py-2.5 font-medium">Amount</th>
                <th className="text-left px-5 py-2.5 font-medium">Status</th>
                <th className="text-left px-5 py-2.5 font-medium">Started</th>
                <th className="text-left px-5 py-2.5 font-medium">Next Billing</th>
                <th className="text-right px-5 py-2.5 font-medium w-12">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-5">
                    <TableSkeleton rows={5} cols={7} />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <EmptyState
                      icon={Inbox}
                      title="No subscriptions found"
                      subtitle="Try adjusting your filters or search"
                    />
                  </td>
                </tr>
              ) : (
                <TooltipProvider delayDuration={200}>
                  {filtered.map((s) => {
                    const cancelled = s.status === "cancelled";
                    const upcomingLate = isUpcomingLateCancellation(s);
                    return (
                      <tr
                        key={s.id}
                        onClick={() => setSelected(s)}
                        className="admin-row cursor-pointer"
                        style={{
                          borderTop: "1px solid rgba(255,255,255,0.05)",
                          opacity: cancelled ? 0.7 : 1,
                        }}
                      >
                        <td className="px-5 py-3" style={{ color: "var(--ad-text)" }}>
                          {s.customer_email}
                        </td>
                        <td className="px-5 py-3" style={{ color: "var(--ad-text-soft)" }}>
                          {s.plan_name}
                        </td>
                        <td
                          className="px-5 py-3 text-right font-mono-jb"
                          style={{ color: "var(--ad-text)" }}
                        >
                          €{Number(s.amount).toFixed(2)}
                        </td>
                        <td className="px-5 py-3">
                          <StatusBadge status={s.status} withDot={s.status === "active"} />
                        </td>
                        <td
                          className="px-5 py-3 font-mono-jb text-[12px]"
                          style={{ color: "var(--ad-text-secondary)" }}
                        >
                          {format(new Date(s.started_at), "MMM dd, yyyy")}
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-1.5">
                            <span
                              className="font-mono-jb text-[12px]"
                              style={{ color: "var(--ad-text-secondary)" }}
                            >
                              {s.expires_at && s.status === "active"
                                ? format(new Date(s.expires_at), "MMM dd, yyyy")
                                : "—"}
                            </span>
                            {upcomingLate && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <AlertTriangle
                                    className="w-3.5 h-3.5"
                                    style={{ color: "var(--ad-amber)" }}
                                  />
                                </TooltipTrigger>
                                <TooltipContent side="top" className="text-[11px]">
                                  Renewal within 14 days
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </div>
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
                              className="w-48"
                            >
                              <DropdownMenuItem onClick={() => setSelected(s)}>
                                <Eye className="w-3.5 h-3.5 mr-2" />
                                View details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => copyEmail(s.customer_email)}>
                                <Copy className="w-3.5 h-3.5 mr-2" />
                                Copy email
                              </DropdownMenuItem>
                              {s.status === "active" && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => setPendingCancel(s)}
                                    className="text-red-400 focus:text-red-400"
                                  >
                                    <Ban className="w-3.5 h-3.5 mr-2" />
                                    Cancel subscription
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
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
        {selected && (
          <>
            <div className="px-6 pt-6 pb-5">
              <p
                className="text-[10px] uppercase mb-2"
                style={{ color: "var(--ad-text-faint)", letterSpacing: "0.08em" }}
              >
                Subscription
              </p>
              <h2
                className="font-syne text-[18px] font-semibold break-all"
                style={{ color: "var(--ad-text)" }}
              >
                {selected.customer_email}
              </h2>
              <div className="flex items-center gap-2 mt-3">
                <StatusBadge status={selected.status} withDot={selected.status === "active"} />
                {isLateCancellation(selected) && (
                  <span
                    className="text-[11px] px-2 py-0.5 rounded-full font-medium border"
                    style={{
                      background: "var(--ad-amber-soft)",
                      color: "var(--ad-amber-text)",
                      borderColor: "var(--ad-amber-border)",
                    }}
                  >
                    Late cancellation
                  </span>
                )}
              </div>
              <div className="mt-4 flex items-baseline gap-1">
                <span
                  className="font-mono-jb font-semibold"
                  style={{ fontSize: 26, color: "var(--ad-text)" }}
                >
                  €{Number(selected.amount).toFixed(2)}
                </span>
                <span className="text-[12px]" style={{ color: "var(--ad-text-secondary)" }}>
                  / month {selected.currency}
                </span>
              </div>
            </div>

            <SlideSection title="Details">
              <SlideRow label="Plan" value={selected.plan_name} />
              {selected.customer_name && (
                <SlideRow label="Customer name" value={selected.customer_name} />
              )}
              <SlideRow
                label="Started"
                value={
                  <span className="font-mono-jb">
                    {format(new Date(selected.started_at), "MMM dd, yyyy")}
                  </span>
                }
              />
              <SlideRow
                label="Next billing"
                value={
                  <span className="font-mono-jb">
                    {selected.expires_at && selected.status === "active"
                      ? format(new Date(selected.expires_at), "MMM dd, yyyy")
                      : "—"}
                  </span>
                }
              />
              {selected.cancelled_at && (
                <SlideRow
                  label="Cancelled"
                  value={
                    <span className="font-mono-jb">
                      {format(new Date(selected.cancelled_at), "MMM dd, yyyy")}
                    </span>
                  }
                />
              )}
              {selected.affiliate_code && (
                <SlideRow
                  label="Affiliate"
                  value={<MonoChip value={selected.affiliate_code} />}
                />
              )}
              {selected.revolut_subscription_id && (
                <SlideRow
                  label="Revolut ID"
                  value={
                    <MonoChip
                      value={selected.revolut_subscription_id}
                      display={`${selected.revolut_subscription_id.slice(0, 10)}…`}
                    />
                  }
                />
              )}
            </SlideSection>

            {selected.status === "active" && (
              <div
                className="px-6 py-5 mt-auto"
                style={{ borderTop: "1px solid var(--ad-border-subtle)" }}
              >
                <button
                  onClick={() => setPendingCancel(selected)}
                  className="admin-btn-destructive w-full h-10 inline-flex items-center justify-center gap-2 text-[13px]"
                >
                  <Ban className="w-3.5 h-3.5" />
                  Cancel subscription
                </button>
              </div>
            )}
          </div>
        )}
      </SlidePanel>

      {/* Cancellation confirm dialog */}
      <AlertDialog open={!!pendingCancel} onOpenChange={(o) => !o && setPendingCancel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
            <AlertDialogDescription>
              This will cancel <strong>{pendingCancel?.customer_email}</strong>'s{" "}
              <strong>{pendingCancel?.plan_name}</strong> subscription. They will be notified by
              email. This action cannot be undone.
              {pendingCancel && isUpcomingLateCancellation(pendingCancel) && (
                <span
                  className="block mt-3 p-3 rounded-lg text-[12px] border"
                  style={{
                    background: "var(--ad-amber-soft)",
                    color: "var(--ad-amber-text)",
                    borderColor: "var(--ad-amber-border)",
                  }}
                >
                  ⚠ Late cancellation — within 14 days of renewal on{" "}
                  {format(new Date(pendingCancel.expires_at), "MMM dd, yyyy")}. Final billing
                  cycle still applies.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelling}>Keep Subscription</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              disabled={cancelling}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {cancelling ? "Cancelling..." : "Cancel Subscription"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
