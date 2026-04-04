import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Bell, Check, AlertTriangle, Info, CreditCard } from "lucide-react";
import { format } from "date-fns";

const typeIcons: Record<string, any> = {
  info: Info,
  warning: AlertTriangle,
  payment: CreditCard,
  alert: Bell,
};

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    const { data } = await supabase.from("notifications").select("*").order("created_at", { ascending: false });
    setNotifications(data || []);
    setLoading(false);
  };

  const markAsRead = async (id: string) => {
    await supabase.from("notifications").update({ read: true }).eq("id", id);
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = async () => {
    const unread = notifications.filter((n) => !n.read).map((n) => n.id);
    if (unread.length === 0) return;
    await supabase.from("notifications").update({ read: true }).in("id", unread);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Notifications</h1>
          <p className="text-sm text-muted-foreground mt-1">{unreadCount} unread notifications</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead}>
            <Check className="w-4 h-4 mr-1" /> Mark all read
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {loading ? (
          <p className="text-center text-muted-foreground py-8">Loading...</p>
        ) : notifications.length === 0 ? (
          <div className="text-center py-16">
            <Bell className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No notifications yet</p>
          </div>
        ) : (
          notifications.map((n, i) => {
            const Icon = typeIcons[n.type] || Bell;
            return (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className={`rounded-xl border p-4 flex items-start gap-3 transition-colors cursor-pointer ${
                  n.read ? "border-border/20 bg-card/40" : "border-primary/20 bg-primary/5"
                }`}
                onClick={() => !n.read && markAsRead(n.id)}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                  n.read ? "bg-muted" : "bg-primary/15"
                }`}>
                  <Icon className={`w-4 h-4 ${n.read ? "text-muted-foreground" : "text-primary"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm ${n.read ? "text-muted-foreground" : "text-foreground font-medium"}`}>{n.title}</p>
                    <span className="text-[10px] text-muted-foreground shrink-0">{format(new Date(n.created_at), "MMM dd, HH:mm")}</span>
                  </div>
                  {n.message && <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>}
                </div>
                {!n.read && <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />}
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
