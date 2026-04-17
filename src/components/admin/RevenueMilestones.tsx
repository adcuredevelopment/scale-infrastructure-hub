import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Star, Zap, Crown, Gem, Flame, Rocket, CheckCircle2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Milestone {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  achieved: boolean;
  badge_icon: string;
}

const ICONS: Record<string, any> = {
  trophy: Trophy, star: Star, zap: Zap, crown: Crown,
  gem: Gem, flame: Flame, rocket: Rocket,
};

interface Props {
  /** Live MRR/revenue value used to compute progress (overrides DB current_amount). */
  currentValue?: number;
}

export function RevenueMilestones({ currentValue }: Props) {
  const [milestones, setMilestones] = useState<Milestone[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("revenue_milestones")
        .select("*")
        .order("target_amount", { ascending: true });
      setMilestones(data || []);
    })();
  }, []);

  if (!milestones.length) return null;

  // Show next 3 unachieved (or last 3 if all achieved)
  const unachieved = milestones.filter((m) => !m.achieved);
  const display = (unachieved.length >= 3 ? unachieved : milestones).slice(0, 3);

  const liveValue = typeof currentValue === "number" ? currentValue : null;

  return (
    <div className="admin-card p-5 admin-page" style={{ animationDelay: "120ms" }}>
      <div className="flex items-center justify-between mb-4">
        <h2
          className="text-[11px] font-medium uppercase"
          style={{ color: "var(--ad-text-faint)", letterSpacing: "0.08em" }}
        >
          Revenue Milestones
        </h2>
        <span className="text-[11px]" style={{ color: "var(--ad-text-secondary)" }}>
          {milestones.filter((m) => m.achieved).length} / {milestones.length} achieved
        </span>
      </div>

      <div className="space-y-4">
        <TooltipProvider delayDuration={200}>
          {display.map((m) => {
            const Icon = ICONS[m.badge_icon] || Trophy;
            const value = liveValue ?? Number(m.current_amount);
            const pct = Math.min(100, Math.max(0, (value / Number(m.target_amount)) * 100));
            const achieved = m.achieved || value >= Number(m.target_amount);

            return (
              <Tooltip key={m.id}>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
                      style={{
                        background: achieved ? "rgba(16,185,129,0.10)" : "rgba(59,130,246,0.10)",
                        color: achieved ? "var(--ad-green)" : "var(--ad-accent)",
                      }}
                    >
                      {achieved ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[12px]" style={{ color: "var(--ad-text)" }}>
                          {m.name}
                        </span>
                        <span
                          className="font-mono-jb text-[11px]"
                          style={{ color: "var(--ad-text-secondary)" }}
                        >
                          €{value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                          <span style={{ color: "var(--ad-text-faint)" }}>
                            {" / "}€{Number(m.target_amount).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                          </span>
                        </span>
                      </div>
                      <div
                        className="h-1 rounded-full overflow-hidden"
                        style={{ background: "rgba(255,255,255,0.05)" }}
                      >
                        <div
                          className="h-full rounded-full transition-[width] duration-700 ease-out"
                          style={{
                            width: `${pct}%`,
                            background: achieved ? "var(--ad-green)" : "var(--ad-accent)",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-[11px]">
                  {pct.toFixed(1)}% — €{(Number(m.target_amount) - value).toLocaleString(undefined, { maximumFractionDigits: 0 })} to go
                </TooltipContent>
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </div>
    </div>
  );
}
