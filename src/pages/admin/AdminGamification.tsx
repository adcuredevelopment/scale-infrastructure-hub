import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Trophy, Star, Zap, Crown, Gem, Flame, Rocket } from "lucide-react";

const iconMap: Record<string, any> = {
  trophy: Trophy, star: Star, zap: Zap, crown: Crown, gem: Gem, flame: Flame, rocket: Rocket,
};

export default function AdminGamification() {
  const [milestones, setMilestones] = useState<any[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [milestoneRes, subsRes] = await Promise.all([
      supabase.from("revenue_milestones").select("*").order("target_amount", { ascending: true }),
      supabase.from("subscriptions").select("amount"),
    ]);

    const total = (subsRes.data || []).reduce((acc, s) => acc + Number(s.amount || 0), 0);
    setTotalRevenue(total);

    const ms = (milestoneRes.data || []).map((m) => ({
      ...m,
      current_amount: total,
      achieved: total >= Number(m.target_amount),
    }));
    setMilestones(ms);
  };

  const streakDays = 12; // Placeholder - could track actual daily active streak

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Gamification</h1>
        <p className="text-sm text-muted-foreground mt-1">Track revenue milestones and achievements</p>
      </div>

      {/* Streak */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-border/30 bg-gradient-to-r from-primary/5 to-primary/10 p-6"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center">
            <Flame className="w-7 h-7 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Revenue Streak</p>
            <p className="text-3xl font-display font-bold text-foreground">{streakDays} days</p>
            <p className="text-xs text-primary mt-0.5">Keep it going! 🔥</p>
          </div>
        </div>
      </motion.div>

      {/* Total Revenue */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl border border-border/30 bg-card/60 p-6 text-center"
      >
        <p className="text-sm text-muted-foreground">Total Revenue Earned</p>
        <p className="text-4xl font-display font-bold text-foreground mt-1">€{totalRevenue.toLocaleString()}</p>
      </motion.div>

      {/* Milestones */}
      <div className="space-y-4">
        <h2 className="text-lg font-display font-semibold text-foreground">Revenue Milestones</h2>
        <div className="grid gap-4">
          {milestones.map((m, i) => {
            const Icon = iconMap[m.badge_icon] || Trophy;
            const progress = Math.min((totalRevenue / Number(m.target_amount)) * 100, 100);

            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`rounded-xl border p-5 flex items-center gap-4 transition-colors ${
                  m.achieved
                    ? "border-primary/30 bg-primary/5"
                    : "border-border/30 bg-card/60"
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  m.achieved ? "bg-primary/20" : "bg-muted"
                }`}>
                  <Icon className={`w-6 h-6 ${m.achieved ? "text-primary" : "text-muted-foreground"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-foreground">{m.name}</span>
                    <span className="text-xs text-muted-foreground">
                      €{totalRevenue.toLocaleString()} / €{Number(m.target_amount).toLocaleString()}
                    </span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  {m.achieved && (
                    <p className="text-xs text-primary mt-1.5 font-medium">✨ Achieved!</p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
