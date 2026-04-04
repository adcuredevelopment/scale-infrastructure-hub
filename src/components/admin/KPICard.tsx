import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";

interface KPICardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  delay?: number;
}

export function KPICard({ title, value, change, changeType = "neutral", icon: Icon, delay = 0 }: KPICardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="rounded-xl border border-border/30 bg-card/60 p-5 hover:border-border/50 transition-colors"
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</span>
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="w-4 h-4 text-primary" />
        </div>
      </div>
      <div className="text-2xl font-display font-bold text-foreground">{value}</div>
      {change && (
        <div className="flex items-center gap-1 mt-1.5">
          {changeType === "positive" ? (
            <TrendingUp className="w-3 h-3 text-emerald-500" />
          ) : changeType === "negative" ? (
            <TrendingDown className="w-3 h-3 text-destructive" />
          ) : null}
          <span className={`text-xs font-medium ${
            changeType === "positive" ? "text-emerald-500" : changeType === "negative" ? "text-destructive" : "text-muted-foreground"
          }`}>
            {change}
          </span>
        </div>
      )}
    </motion.div>
  );
}
