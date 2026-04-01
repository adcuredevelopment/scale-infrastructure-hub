import { useState } from "react";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Check, ExternalLink, CheckCircle2, ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

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
      "One-time Strategy Call",
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

type ModalState = "checkout" | "thankyou" | null;

export const PricingSection = () => {
  const [modalState, setModalState] = useState<ModalState>(null);
  const [selectedPlan, setSelectedPlan] = useState<string>("");

  const handleCheckout = (planName: string, checkoutUrl: string) => {
    setSelectedPlan(planName);
    setModalState("checkout");
    window.open(checkoutUrl, "_blank", "noopener,noreferrer");
  };

  const handlePaymentComplete = () => {
    setModalState("thankyou");
  };

  const closeModal = () => {
    setModalState(null);
    setSelectedPlan("");
  };

  return (
    <>
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
                    <Button
                      onClick={() => handleCheckout(plan.name, plan.checkoutUrl!)}
                      className={`w-full hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 ${
                        plan.popular ? "glow-primary-sm" : ""
                      }`}
                      variant={plan.popular ? "default" : "outline"}
                    >
                      Get Started
                    </Button>
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

      {/* Checkout / Thank You Modal */}
      <AnimatePresence>
        {modalState && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={closeModal} />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-lg rounded-2xl border border-border/50 bg-card shadow-2xl shadow-primary/10 overflow-hidden"
            >
              {/* Close button */}
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors z-10"
              >
                <X className="w-4 h-4" />
              </button>

              {modalState === "checkout" && (
                <div className="p-8 text-center">
                  {/* Animated dots */}
                  <div className="flex items-center justify-center gap-1.5 mb-6">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-2.5 h-2.5 rounded-full bg-primary"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                      />
                    ))}
                  </div>

                  <h3 className="text-2xl font-display font-bold text-foreground mb-2">
                    Complete Your Payment
                  </h3>
                  <p className="text-muted-foreground text-sm mb-2">
                    A checkout page for <span className="text-foreground font-medium">{selectedPlan}</span> has been opened in a new tab.
                  </p>
                  <p className="text-muted-foreground text-xs mb-8">
                    Complete your payment there, then come back and click the button below.
                  </p>

                  <Button
                    onClick={handlePaymentComplete}
                    size="lg"
                    className="glow-primary w-full text-base py-6 group"
                  >
                    I've Completed My Payment
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>

                  <p className="text-[11px] text-muted-foreground mt-4">
                    Having trouble? <a href="mailto:support@adcure.agency" className="text-primary hover:underline">Contact support</a>
                  </p>
                </div>
              )}

              {modalState === "thankyou" && (
                <div className="p-8 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center mx-auto mb-6"
                  >
                    <CheckCircle2 className="w-8 h-8 text-primary" />
                  </motion.div>

                  <h3 className="text-2xl font-display font-bold text-foreground mb-2">
                    Thank You! 🎉
                  </h3>
                  <p className="text-muted-foreground text-sm mb-6">
                    Your <span className="text-foreground font-medium">{selectedPlan}</span> plan is being activated. Welcome to Adcure!
                  </p>

                  <div className="glass rounded-xl p-5 mb-6 text-left">
                    <h4 className="font-display font-semibold text-sm text-foreground mb-3">Next Steps:</h4>
                    <ol className="space-y-3">
                      <li className="flex items-start gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/15 text-primary text-[10px] font-bold shrink-0 mt-0.5">1</span>
                        Create your account on the Adcure Portal
                      </li>
                      <li className="flex items-start gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/15 text-primary text-[10px] font-bold shrink-0 mt-0.5">2</span>
                        Complete your profile setup
                      </li>
                      <li className="flex items-start gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/15 text-primary text-[10px] font-bold shrink-0 mt-0.5">3</span>
                        Start requesting ad accounts and scaling!
                      </li>
                    </ol>
                  </div>

                  <a
                    href="https://portal.adcure.agency"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full"
                  >
                    <Button size="lg" className="glow-primary w-full text-base py-6 group">
                      Open Adcure Portal
                      <ExternalLink className="ml-2 w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </Button>
                  </a>

                  <button
                    onClick={closeModal}
                    className="text-xs text-muted-foreground hover:text-foreground mt-4 transition-colors"
                  >
                    Close this window
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
