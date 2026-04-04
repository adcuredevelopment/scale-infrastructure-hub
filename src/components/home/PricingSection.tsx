import { ScrollReveal } from "@/components/ScrollReveal";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const plans = [
  {
    name: "Starter Advertiser",
    description: "Perfect for beginners testing the waters",
    price: "€79",
    period: "/mo",
    topUp: "5% Top-Up Fee",
    popular: false,
    amount: 79,
    currency: "EUR",
    features: [
      "24/7 Top-Up Service",
      "Mon–Sun Support (08:00-22:00)",
      "Unlimited Ad Account Requests",
      "Supplier Access",
      "FB Structure (€149)",
    ],
  },
  {
    name: "Growth Advertiser",
    description: "For scaling brands and agencies",
    price: "€119",
    period: "/mo",
    topUp: "3% Top-Up Fee",
    popular: true,
    amount: 119,
    currency: "EUR",
    features: [
      "24/7 Top-Up Service",
      "Mon–Sun Support (08:00-22:00)",
      "Unlimited Ad Accounts On Demand",
      "Supplier Access",
      "FB Structure (€124)",
    ],
  },
  {
    name: "Advanced Advertiser",
    description: "For enterprise-level operations",
    price: "€149",
    period: "/mo",
    topUp: "2% Top-Up Fee",
    popular: false,
    amount: 149,
    currency: "EUR",
    features: [
      "24/7 Top-Up Service",
      "Mon–Sun Support (08:00-22:00)",
      "Unlimited Ad Accounts On Demand",
      "Supplier Access",
      "FB Structure (€99)",
    ],
  },
];

export const PricingSection = () => {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<typeof plans[0] | null>(null);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  const handleGetStarted = (plan: typeof plans[0]) => {
    setSelectedPlan(plan);
    setEmail("");
    setEmailError("");
  };

  const handleSubmitEmail = async () => {
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    const plan = selectedPlan!;
    setSelectedPlan(null);
    setLoadingPlan(plan.name);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

      const res = await fetch(`${supabaseUrl}/functions/v1/revolut-create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
        },
        body: JSON.stringify({
          planName: plan.name,
          email: trimmed,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data?.error || 'Failed to create order');

      if (data?.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      toast.error('Unable to start checkout. Please try again.');
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <>
      <section className="py-16 md:py-32 px-5 md:px-8 bg-card/30">
        <div className="container mx-auto">
          <ScrollReveal>
            <div className="text-center mb-10 md:mb-16">
              <span className="text-[11px] sm:text-xs font-medium text-primary uppercase tracking-widest">Flexible Plans</span>
              <h2 className="text-2xl sm:text-3xl md:text-5xl font-display font-bold mt-3 md:mt-4 mb-3 md:mb-4">
                Choose Your <span className="text-gradient">Growth Plan</span>
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
                Transparent pricing that scales with your agency.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto">
            {plans.map((plan, i) => (
              <ScrollReveal key={plan.name} delay={i * 0.08}>
                <div
                  className={`rounded-xl p-5 sm:p-6 md:p-8 hover-lift h-full flex flex-col relative ${
                    plan.popular
                      ? "border-2 border-primary/50 bg-card/80 backdrop-blur-xl glow-primary"
                      : "glass"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold whitespace-nowrap">
                      Most Popular
                    </div>
                  )}

                  <div className="mb-4 md:mb-6">
                    <h3 className="font-display font-semibold text-base md:text-lg">{plan.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{plan.description}</p>
                  </div>

                  <div className="mb-2">
                    <span className="text-3xl md:text-4xl font-display font-bold">{plan.price}</span>
                    <span className="text-muted-foreground text-sm">{plan.period}</span>
                  </div>
                  <div className="text-xs text-primary font-medium mb-4 md:mb-6">{plan.topUp}</div>

                  <ul className="space-y-2.5 md:space-y-3 mb-6 md:mb-8 flex-1">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handleGetStarted(plan)}
                    disabled={loadingPlan === plan.name}
                    className={`w-full min-h-[48px] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 ${
                      plan.popular ? "glow-primary-sm" : ""
                    }`}
                    variant={plan.popular ? "default" : "outline"}
                  >
                    {loadingPlan === plan.name ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Get Started"
                    )}
                  </Button>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal delay={0.2}>
            <p className="text-center text-xs text-muted-foreground mt-6 md:mt-8">
              All plans include a 7-day money-back guarantee • Cancel anytime
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Email collection dialog */}
      <Dialog open={!!selectedPlan} onOpenChange={(open) => !open && setSelectedPlan(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Enter your email to continue</DialogTitle>
            <DialogDescription>
              We'll use this email for your {selectedPlan?.name} subscription and portal account.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="checkout-email">Email address</Label>
              <Input
                id="checkout-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError("");
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmitEmail()}
              />
              {emailError && <p className="text-sm text-destructive">{emailError}</p>}
            </div>
            <Button onClick={handleSubmitEmail} className="w-full">
              Continue to Payment
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
