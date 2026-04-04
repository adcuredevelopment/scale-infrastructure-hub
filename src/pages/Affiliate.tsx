import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, CheckCircle, Users, Banknote, ArrowRight, Share2, Trophy, BarChart3, LogIn } from "lucide-react";

const commissionCards = [
  {
    icon: DollarSign,
    title: "One-Time Signup Bonus",
    items: [
      "€50 for €149/mo Advanced plan",
      "€30 for €119/mo Growth plan",
      "€20 for €79/mo Starter plan",
    ],
    footnote: "Paid once per new subscription after 7-day guarantee period",
  },
  {
    icon: TrendingUp,
    title: "20% Recurring Commission",
    description: "Earn 20% commission on every billing cycle while the subscription remains active.",
    example: "Example: €149 plan = €29.80 per month, every month",
  },
];

const perks = [
  { icon: CheckCircle, title: "No Minimum Threshold", desc: "Get paid for every referral, no minimum required" },
  { icon: Users, title: "30-Day Cookie", desc: "Last-click attribution with 30-day tracking window" },
  { icon: Banknote, title: "Monthly Payouts", desc: "Reliable monthly payments via bank transfer" },
];

const steps = [
  { icon: ArrowRight, title: "Apply", desc: "Submit your application and get approved" },
  { icon: Share2, title: "Share", desc: "Share your unique referral link" },
  { icon: Trophy, title: "Earn", desc: "Get paid for every successful referral" },
  { icon: BarChart3, title: "Track", desc: "Monitor your earnings in real-time" },
];

export default function Affiliate() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-28 md:pt-40 pb-16 md:pb-24 px-5 md:px-8">
        <div className="container mx-auto text-center max-w-3xl">
          <ScrollReveal>
            <span className="text-[11px] sm:text-xs font-medium text-primary uppercase tracking-widest">
              Affiliate Program
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-display font-bold mt-4 mb-5">
              Join the Adcure{" "}
              <span className="text-gradient">Affiliate Program</span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto mb-8">
              Earn generous commissions by referring businesses to premium ad account structures and services.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" className="min-h-[48px] glow-primary-sm" asChild>
                <a href="/affiliate/register">Apply Now</a>
              </Button>
              <Button size="lg" variant="outline" className="min-h-[48px]" asChild>
                <a href="/affiliate/login">
                  <LogIn className="w-4 h-4 mr-2" />
                  Affiliate Login
                </a>
              </Button>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Commission Structure */}
      <section className="py-16 md:py-24 px-5 md:px-8 bg-card/30">
        <div className="container mx-auto max-w-5xl">
          <ScrollReveal>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-center mb-10 md:mb-14">
              Commission Structure
            </h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
            {commissionCards.map((card, i) => (
              <ScrollReveal key={card.title} delay={i * 0.1}>
                <div className="glass rounded-xl p-6 md:p-8 h-full">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <card.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-display font-bold text-lg md:text-xl mb-3">{card.title}</h3>
                  {card.items && (
                    <ul className="space-y-2 mb-3">
                      {card.items.map((item) => (
                        <li key={item} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-primary mt-1.5">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                  {card.footnote && (
                    <p className="text-xs text-muted-foreground/70">{card.footnote}</p>
                  )}
                  {card.description && (
                    <p className="text-sm text-muted-foreground mb-3">{card.description}</p>
                  )}
                  {card.example && (
                    <p className="text-xs text-primary font-medium">{card.example}</p>
                  )}
                </div>
              </ScrollReveal>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {perks.map((perk, i) => (
              <ScrollReveal key={perk.title} delay={i * 0.08}>
                <div className="glass rounded-xl p-5 md:p-6 h-full">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                    <perk.icon className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="font-display font-semibold text-sm md:text-base mb-1">{perk.title}</h3>
                  <p className="text-xs text-muted-foreground">{perk.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24 px-5 md:px-8">
        <div className="container mx-auto max-w-4xl">
          <ScrollReveal>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-center mb-10 md:mb-14">
              How It Works
            </h2>
          </ScrollReveal>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {steps.map((step, i) => (
              <ScrollReveal key={step.title} delay={i * 0.1}>
                <div className="text-center">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <step.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">
                    Step {i + 1}
                  </div>
                  <h3 className="font-display font-bold text-base mb-1">{step.title}</h3>
                  <p className="text-xs text-muted-foreground">{step.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal delay={0.3}>
            <div className="text-center mt-12">
              <Button size="lg" className="min-h-[48px] glow-primary-sm" asChild>
                <a href="/affiliate/register">
                  Apply Now
                  <ArrowRight className="w-4 h-4 ml-2" />
                </a>
              </Button>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <Footer />
    </div>
  );
}
