import { CreditCard, UserCheck, Rocket } from "lucide-react";

export const SubscribeMockup = () => (
  <div className="w-full h-full flex items-center justify-center p-4 md:p-6">
    <div className="w-full max-w-[280px] md:max-w-[320px] space-y-3 md:space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] md:text-xs font-semibold text-foreground">Adcure Agency</p>
          <p className="text-[8px] md:text-[10px] text-muted-foreground">Subscription</p>
        </div>
        <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-primary/20 flex items-center justify-center">
          <CreditCard className="w-3 h-3 md:w-3.5 md:h-3.5 text-primary" />
        </div>
      </div>

      {/* Plan card */}
      <div className="rounded-lg border border-border/50 bg-card/50 p-3 md:p-4 space-y-2">
        <div>
          <p className="text-[10px] md:text-xs font-bold text-foreground">Growth Advertiser</p>
          <p className="text-[8px] md:text-[9px] text-muted-foreground">Monthly billing</p>
        </div>
        <div className="border-t border-border/30 pt-2 space-y-1">
          <div className="flex justify-between text-[8px] md:text-[9px] text-muted-foreground">
            <span>Subtotal</span><span>€119</span>
          </div>
          <div className="flex justify-between text-[8px] md:text-[9px] text-muted-foreground">
            <span>Included tax</span><span>€24.99</span>
          </div>
          <div className="flex justify-between text-[9px] md:text-[10px] font-bold text-foreground pt-1">
            <span>Due now</span><span>€143.99</span>
          </div>
        </div>
      </div>

      {/* Payment button */}
      <div className="rounded-lg bg-primary/15 border border-primary/30 py-2 text-center">
        <span className="text-[9px] md:text-[10px] font-semibold text-primary">Subscribe Now →</span>
      </div>
    </div>
  </div>
);

export const OnboardMockup = () => (
  <div className="w-full h-full flex items-center justify-center p-4 md:p-6">
    <div className="w-full max-w-[280px] md:max-w-[320px] space-y-3 md:space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] md:text-xs font-semibold text-foreground">Welcome to Adcure</p>
          <p className="text-[8px] md:text-[10px] text-muted-foreground">Complete your profile</p>
        </div>
        <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-primary/20 flex items-center justify-center">
          <UserCheck className="w-3 h-3 md:w-3.5 md:h-3.5 text-primary" />
        </div>
      </div>

      {/* Form fields */}
      <div className="space-y-2">
        <div className="rounded-lg border border-border/50 bg-card/50 p-2.5 md:p-3">
          <p className="text-[7px] md:text-[8px] text-muted-foreground mb-0.5">Email</p>
          <p className="text-[9px] md:text-[10px] text-foreground/70">you@example.com</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-border/50 bg-card/50 p-2.5 md:p-3">
            <p className="text-[7px] md:text-[8px] text-muted-foreground mb-0.5">Company</p>
            <p className="text-[9px] md:text-[10px] text-foreground/70">Your Agency</p>
          </div>
          <div className="rounded-lg border border-border/50 bg-card/50 p-2.5 md:p-3">
            <p className="text-[7px] md:text-[8px] text-muted-foreground mb-0.5">Ad Spend</p>
            <p className="text-[9px] md:text-[10px] text-foreground/70">€10k+/mo</p>
          </div>
        </div>
        <div className="rounded-lg border border-border/50 bg-card/50 p-2.5 md:p-3">
          <p className="text-[7px] md:text-[8px] text-muted-foreground mb-0.5">Platforms</p>
          <div className="flex gap-1.5 mt-1">
            {["Meta", "Google", "TikTok"].map((p) => (
              <span key={p} className="text-[7px] md:text-[8px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{p}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Submit button */}
      <div className="rounded-lg bg-primary/15 border border-primary/30 py-2 text-center">
        <span className="text-[9px] md:text-[10px] font-semibold text-primary">Complete Onboarding →</span>
      </div>
    </div>
  </div>
);

export const LaunchMockup = () => (
  <div className="w-full h-full flex items-center justify-center p-4 md:p-6">
    <div className="w-full max-w-[280px] md:max-w-[320px] space-y-3 md:space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] md:text-xs font-semibold text-foreground">You're Live! 🚀</p>
          <p className="text-[8px] md:text-[10px] text-muted-foreground">Ad accounts ready</p>
        </div>
        <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-primary/20 flex items-center justify-center">
          <Rocket className="w-3 h-3 md:w-3.5 md:h-3.5 text-primary" />
        </div>
      </div>

      {/* Ad accounts */}
      <div className="space-y-1.5">
        {["Meta Ad Account", "Google Ad Account", "TikTok Ad Account"].map((account, i) => (
          <div key={account} className="rounded-lg border border-border/50 bg-card/50 p-2.5 md:p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-[9px] md:text-[10px] text-foreground">{account}</span>
            </div>
            <span className="text-[7px] md:text-[8px] text-primary font-medium">Active</span>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg border border-border/50 bg-card/50 p-2.5 md:p-3 text-center">
          <p className="text-[7px] md:text-[8px] text-muted-foreground">Setup Time</p>
          <p className="text-[11px] md:text-xs font-bold text-primary">1–2 hrs</p>
        </div>
        <div className="rounded-lg border border-border/50 bg-card/50 p-2.5 md:p-3 text-center">
          <p className="text-[7px] md:text-[8px] text-muted-foreground">Spend Limit</p>
          <p className="text-[11px] md:text-xs font-bold text-primary">Unlimited</p>
        </div>
      </div>

      {/* CTA */}
      <div className="rounded-lg bg-primary/15 border border-primary/30 py-2 text-center">
        <span className="text-[9px] md:text-[10px] font-semibold text-primary">Start Scaling →</span>
      </div>
    </div>
  </div>
);

export const stepMockups = [SubscribeMockup, OnboardMockup, LaunchMockup];
