import { motion } from "framer-motion";
import { TrendingUp, Wallet, CreditCard, LayoutDashboard, Monitor, FileText, HelpCircle, Settings, Search } from "lucide-react";
import adcureLogo from "@/assets/adcure-logo.png";

const kpiData = [
  { label: "Ad Accounts", value: "4", trend: "+1 this month", icon: CreditCard },
  { label: "Meta Balance", value: "€12,840", trend: "+€2,400 this week", icon: TrendingUp },
  { label: "Wallet Balance", value: "€3,200", trend: "+€1,000 deposited", icon: Wallet },
];

const tableRows = [
  { name: "Ad Account 1", balance: "€4,200", status: "Active" },
  { name: "Ad Account 2", balance: "€3,840", status: "Active" },
  { name: "Ad Account 3", balance: "€2,100", status: "Active" },
  { name: "Ad Account 4", balance: "€2,700", status: "Inactive" },
];

const activityItems = [
  { text: "Top-up approved — Brand Awareness", time: "2 hours ago", color: "bg-primary" },
  { text: "Wallet deposit confirmed — €1,000", time: "Yesterday", color: "bg-emerald-500" },
  { text: "New ad account request submitted", time: "Mar 18", color: "bg-amber-500" },
];

export const DashboardMockup = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="relative mx-auto mt-10 md:mt-16 max-w-5xl"
      style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden' }}
    >
      {/* Glow behind dashboard */}
      <div className="absolute -inset-4 md:-inset-8 bg-primary/8 blur-[40px] md:blur-[60px] rounded-3xl gpu-blur" />

      {/* Browser chrome */}
      <div className="relative rounded-lg md:rounded-xl overflow-hidden border border-border/60 shadow-2xl shadow-primary/10" style={{ transform: 'translateZ(0)' }}>
        {/* Title bar */}
        <div className="flex items-center gap-2 px-3 md:px-4 py-2 md:py-2.5 bg-secondary border-b border-border/40">
          <div className="flex gap-1.5">
            <div className="w-2 md:w-2.5 h-2 md:h-2.5 rounded-full bg-destructive/70" />
            <div className="w-2 md:w-2.5 h-2 md:h-2.5 rounded-full bg-amber-500/70" />
            <div className="w-2 md:w-2.5 h-2 md:h-2.5 rounded-full bg-emerald-500/70" />
          </div>
          <div className="flex-1" />
        </div>

        {/* App layout */}
        <div className="flex bg-background">
          {/* Sidebar — hidden on mobile */}
          <div className="w-48 min-h-[280px] border-r border-border/30 bg-secondary/50 p-3 hidden md:flex flex-col">
            <div className="flex items-center gap-2.5 mb-4 px-1">
              <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center">
                <img src={adcureLogo} alt="Adcure" className="w-5 h-5 object-contain" style={{ imageRendering: 'auto' }} />
              </div>
              <span className="text-[12px] font-bold text-foreground">Adcure</span>
            </div>
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-muted/50 border border-border/20 mb-4">
              <Search className="w-3 h-3 text-muted-foreground" />
              <span className="text-[9px] text-muted-foreground">Search...</span>
            </div>
            <div className="text-[8px] font-semibold text-primary uppercase tracking-widest px-2 mb-1.5">Overview</div>
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-md text-[10px] font-medium mb-0.5 bg-primary/10 text-primary">
              <LayoutDashboard className="w-3 h-3" />
              Dashboard
            </div>
            <div className="text-[8px] font-semibold text-primary uppercase tracking-widest px-2 mt-3 mb-1.5">Advertising</div>
            <div className="flex items-center justify-between px-2 py-1.5 rounded-md text-[10px] font-medium mb-0.5 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Monitor className="w-3 h-3" />
                Ad Accounts
              </div>
              <span className="text-[7px] px-1.5 py-0.5 rounded-full bg-primary/20 text-primary font-bold">3</span>
            </div>
            <div className="text-[8px] font-semibold text-primary uppercase tracking-widest px-2 mt-3 mb-1.5">Finance</div>
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-md text-[10px] font-medium mb-0.5 text-muted-foreground">
              <Wallet className="w-3 h-3" />
              Wallet
            </div>
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-md text-[10px] font-medium mb-0.5 text-muted-foreground">
              <FileText className="w-3 h-3" />
              Invoices
            </div>
            <div className="text-[8px] font-semibold text-primary uppercase tracking-widest px-2 mt-3 mb-1.5">Help</div>
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-md text-[10px] font-medium mb-0.5 text-muted-foreground">
              <HelpCircle className="w-3 h-3" />
              Support
            </div>
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-md text-[10px] font-medium mb-0.5 text-muted-foreground">
              <Settings className="w-3 h-3" />
              Settings
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 p-3 sm:p-4 md:p-5 min-h-[200px] md:min-h-[340px]">
            {/* Header */}
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <div className="min-w-0">
                <h3 className="text-[10px] sm:text-xs md:text-sm font-bold text-foreground truncate">Good morning, Simon 👋</h3>
                <p className="text-[8px] sm:text-[9px] md:text-[10px] text-muted-foreground truncate">Here's what's happening with your campaigns today.</p>
              </div>
              <div className="px-2 py-0.5 md:px-2.5 md:py-1 rounded-md bg-gradient-to-r from-primary to-blue-400 text-[8px] md:text-[9px] font-semibold text-primary-foreground shrink-0 ml-2">
                New Request
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2 md:gap-3 mb-3 md:mb-4">
              {kpiData.map((kpi) => (
                <div
                  key={kpi.label}
                  className="rounded-md md:rounded-lg border border-border/30 bg-card/60 p-1.5 sm:p-2 md:p-3"
                >
                  <div className="flex items-start justify-between mb-0.5 md:mb-1">
                    <span className="text-[7px] sm:text-[8px] md:text-[9px] font-medium text-muted-foreground uppercase tracking-wider">{kpi.label}</span>
                    <kpi.icon className="w-2.5 md:w-3 h-2.5 md:h-3 text-primary" />
                  </div>
                  <div className="text-[10px] sm:text-sm md:text-base font-bold text-foreground">{kpi.value}</div>
                  <div className="flex items-center gap-0.5 md:gap-1 mt-0.5 md:mt-1">
                    <TrendingUp className="w-1.5 md:w-2 h-1.5 md:h-2 text-emerald-500" />
                    <span className="text-[6px] sm:text-[7px] md:text-[8px] font-medium text-emerald-500">{kpi.trend}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Two columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
              <div className="rounded-md md:rounded-lg border border-border/30 bg-card/60 overflow-hidden">
                <div className="flex items-center justify-between px-2 md:px-3 py-1.5 md:py-2 border-b border-border/20">
                  <span className="text-[9px] md:text-[10px] font-semibold text-foreground">Ad Accounts</span>
                  <span className="text-[8px] md:text-[9px] text-primary font-medium">View all →</span>
                </div>
                <div className="px-2 md:px-3 py-0.5 md:py-1">
                  {tableRows.map((row) => (
                    <div key={row.name} className="flex items-center justify-between py-1 md:py-1.5 border-b border-border/10 last:border-0">
                      <span className="text-[8px] md:text-[9px] font-medium text-foreground">{row.name}</span>
                      <div className="flex items-center gap-1.5 md:gap-2">
                        <span className="text-[8px] md:text-[9px] text-muted-foreground">{row.balance}</span>
                        <span className={`text-[6px] md:text-[7px] px-1 md:px-1.5 py-0.5 rounded-full font-semibold ${
                          row.status === "Active"
                            ? "bg-emerald-500/15 text-emerald-500"
                            : "bg-muted text-muted-foreground"
                        }`}>
                          {row.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Activity — hidden on very small screens */}
              <div className="rounded-md md:rounded-lg border border-border/30 bg-card/60 overflow-hidden hidden sm:block">
                <div className="px-2 md:px-3 py-1.5 md:py-2 border-b border-border/20">
                  <span className="text-[9px] md:text-[10px] font-semibold text-foreground">Recent Activity</span>
                </div>
                <div className="px-2 md:px-3 py-0.5 md:py-1">
                  {activityItems.map((item) => (
                    <div key={item.text} className="flex items-start gap-1.5 md:gap-2 py-1 md:py-1.5 border-b border-border/10 last:border-0">
                      <div className={`w-1.5 h-1.5 rounded-full mt-1 ${item.color} shrink-0`} />
                      <div className="min-w-0">
                        <div className="text-[8px] md:text-[9px] font-medium text-foreground leading-tight truncate">{item.text}</div>
                        <div className="text-[6px] md:text-[7px] text-muted-foreground mt-0.5">{item.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reflection effect */}
      <div className="absolute -bottom-6 md:-bottom-8 left-4 right-4 h-12 md:h-16 bg-gradient-to-b from-primary/5 to-transparent blur-xl rounded-full gpu-blur" />
    </motion.div>
  );
};
