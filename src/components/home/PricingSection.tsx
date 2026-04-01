import { ScrollReveal } from "@/components/ScrollReveal";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Starter Advertiser",
    description: "Perfect for beginners testing the waters",
    price: "€79",
    period: "/mo",
    topUp: "5% Top-Up Fee",
    popular: false,
    checkoutUrl: "https://checkout.revolut.com/subscription/0d6b1ba4-3865-4820-a4ae-44a1ae5c0bdb",
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
    checkoutUrl: "https://checkout.revolut.com/subscription/38554aa4-d15d-4246-b1c7-9a6cb6c606a3",
    features: [
      "24/7 Top-Up Service",
      "Mon–Sun Support (08:00-22:00)",
      "Monthly Strategic Meeting",
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
    checkoutUrl: "https://checkout.revolut.com/subscription/d905f7d4-fa9f-450d-b9e8-b2b397fc36a7",
    features: [
      "0% Fee available on request",
      "24/7 Top-Up Service",
      "Mon–Sun Support (08:00-22:00)",
      "Monthly Strategic Meeting",
      "Unlimited Ad Accounts On Demand",
      "Supplier Access",
      "FB Structure (€99)",
    ],
  },
];

export const PricingSection = () => {
  return (
    <section className="section-padding bg-card/30">
      <div className="container mx-auto">
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="text-xs font-medium text-primary uppercase tracking-widest">Flexible Plans</span>
            <h2 className="text-3xl md:text-5xl font-display font-bold mt-4 mb-4">
              Choose Your <span className="text-gradient">Growth Plan</span>
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Transparent pricing that scales with your agency.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <ScrollReveal key={plan.name} delay={i * 0.1}>
              <div
                className={`rounded-xl p-8 hover-lift h-full flex flex-col relative ${
                  plan.popular
                    ? "border-2 border-primary/50 bg-card/80 backdrop-blur-xl glow-primary"
                    : "glass"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                    Most Popular
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="font-display font-semibold text-lg">{plan.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{plan.description}</p>
                </div>

                <div className="mb-2">
                  <span className="text-4xl font-display font-bold">{plan.price}</span>
                  <span className="text-muted-foreground text-sm">{plan.period}</span>
                </div>
                <div className="text-xs text-primary font-medium mb-6">{plan.topUp}</div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {plan.checkoutUrl ? (
                  <a href={plan.checkoutUrl} target="_blank" rel="noopener noreferrer" className="block w-full">
                    <Button
                      className={`w-full hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 ${
                        plan.popular ? "glow-primary-sm" : ""
                      }`}
                      variant={plan.popular ? "default" : "outline"}
                    >
                      Get Started
                    </Button>
                  </a>
                ) : (
                  <Link to="/contact">
                    <Button
                      className={`w-full hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 ${
                        plan.popular ? "glow-primary-sm" : ""
                      }`}
                      variant={plan.popular ? "default" : "outline"}
                    >
                      Get Started
                    </Button>
                  </Link>
                )}
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={0.3}>
          <p className="text-center text-xs text-muted-foreground mt-8">
            All plans include a 7-day money-back guarantee • Cancel anytime
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
};
