import { ScrollReveal } from "@/components/ScrollReveal";
import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const platforms = [
  {
    name: "Meta",
    tier: "HIGHEST TIER ACCOUNTS",
    description: "Enterprise-grade agency accounts with unrestricted spend capacity across Facebook & Instagram.",
    features: [
      "Platinum whitelisted infrastructure",
      "Fastest 1-2 hour onboarding",
      "Unlimited spend capacity",
      "Origin-managed accounts",
    ],
    cta: "Get Your Meta Account",
    icon: (
      <svg viewBox="0 0 36 36" className="w-7 h-7" fill="none">
        <path d="M6.5 18c0-3.1 1.2-6.3 3-8.6C11.4 7 13.8 5.6 16 5.6c1.8 0 3.2.9 5 3.5l1.2 1.8c1.5 2.2 2.2 3.2 3.3 3.2 1.6 0 2.8-2 2.8-5.1h3.2c0 4.5-2.3 8.3-6 8.3-2 0-3.4-1-5.2-3.6L19 12c-1.4-2.1-2.2-3.2-3.3-3.2-2.5 0-5.5 4.2-5.5 9.2s3 9.2 5.5 9.2c1.5 0 2.7-1.2 4.5-4.2l.8-1.3c1.5-2.5 3-4.7 5.5-4.7 3.8 0 6 3.8 6 8.3h-3.2c0-3.1-1.2-5.1-2.8-5.1-1.3 0-2 1.1-3.6 3.7l-.7 1.2C20 28.5 18.2 30.4 16 30.4c-2.2 0-4.6-1.4-6.5-3.8-1.8-2.3-3-5.5-3-8.6z" fill="currentColor" className="text-blue-500"/>
      </svg>
    ),
  },
  {
    name: "TikTok",
    tier: "HIGHEST TIER ACCOUNTS",
    description: "Battle-tested agency infrastructure engineered for TikTok advertisers who need reliability at any budget.",
    features: [
      "Platinum whitelisted infrastructure",
      "Fastest 1-2 hour onboarding",
      "Unlimited spend capacity",
      "Origin-managed accounts",
    ],
    cta: "Get Your TikTok Account",
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.8.1V9.01a6.27 6.27 0 00-.8-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.89a8.18 8.18 0 004.77 1.53V7a4.81 4.81 0 01-1-.31z"/>
      </svg>
    ),
  },
  {
    name: "Google",
    tier: "HIGHEST TIER ACCOUNTS",
    description: "Top-tier MCC access with zero throttling, built for performance marketers running at volume.",
    features: [
      "Platinum whitelisted infrastructure",
      "Fastest 1-2 hour onboarding",
      "Unlimited spend capacity",
      "Origin-managed accounts",
    ],
    cta: "Get Your Google Account",
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 001 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
    ),
  },
  {
    name: "Facebook Assets",
    tier: "COMPLETE STRUCTURES",
    description: "Professional Facebook structures including pages, Business Managers, and complete ad setups ready to scale.",
    features: [
      "Verified Business Managers",
      "Niche-aligned Facebook Pages",
      "Complete ad account structures",
      "Optimized for long-term scaling",
    ],
    cta: "Browse Facebook Assets",
    ctaLink: "/facebook-structures",
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="#1877F2">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
  },
];

export const ServicesSection = () => {
  return (
    <section className="py-16 md:py-32 px-5 md:px-8 bg-card/30">
      <div className="container mx-auto">
        <ScrollReveal>
          <div className="text-center mb-10 md:mb-16">
            <span className="text-[11px] sm:text-xs font-medium text-primary uppercase tracking-widest">Infrastructure Built For Scale</span>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-display font-bold mt-3 md:mt-4 mb-3 md:mb-4">
              Premium Whitelisted <span className="text-gradient">Ad Accounts</span>
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
              Platinum tier agency accounts across all major platforms. Enterprise grade stability, zero restrictions, instant deployment.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {platforms.map((platform, i) => (
            <ScrollReveal key={platform.name} delay={i * 0.06}>
              <div className="glass rounded-xl p-5 sm:p-6 md:p-7 hover-lift h-full flex flex-col relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 md:w-32 h-24 md:h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-all duration-500" />

                <div className="relative flex-1 flex flex-col">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-muted/80 flex items-center justify-center shrink-0">
                      {platform.icon}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-display font-bold text-base md:text-lg">{platform.name}</h3>
                      <span className="text-[9px] md:text-[10px] font-bold text-primary uppercase tracking-widest">{platform.tier}</span>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed mt-3 md:mt-4 mb-4 md:mb-6">{platform.description}</p>

                  <ul className="space-y-2.5 md:space-y-3 mb-5 md:mb-7 flex-1">
                    {platform.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <a
                    href={platform.ctaLink || "/#pricing"}
                    onClick={!platform.ctaLink ? (e: React.MouseEvent) => {
                      e.preventDefault();
                      document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
                    } : undefined}
                  >
                    <Button
                      variant="outline"
                      className="w-full border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50 group/btn min-h-[44px] text-sm"
                    >
                      {platform.cta}
                      <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </a>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};
