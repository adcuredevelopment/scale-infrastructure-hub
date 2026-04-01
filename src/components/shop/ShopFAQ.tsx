import { ScrollReveal } from "@/components/ScrollReveal";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const defaultFaqs = [
  { q: "How quickly will I receive my order?", a: "Most orders are delivered within 1 hour. Facebook Structures may take up to 24 hours due to the setup complexity." },
  { q: "What payment methods do you accept?", a: "We accept all major credit/debit cards, cryptocurrency, and bank transfers through our secure payment processor." },
  { q: "What happens if my account gets banned?", a: "If your account is restricted or banned within the guarantee period before any policy violations on your part, we'll provide a free replacement." },
  { q: "Are these accounts safe to use for advertising?", a: "Yes. All accounts are carefully aged, verified, and tested before delivery. They are designed specifically for advertising use." },
  { q: "Can I get a refund?", a: "Yes — if the product doesn't meet the guarantees described, contact us and we'll issue a full refund." },
  { q: "How do I contact support?", a: "You can reach us via our contact page, email, or live chat. We typically respond within 1 hour during business hours." },
  { q: "Do you offer bulk discounts?", a: "Yes! Contact us for custom pricing on bulk orders. We offer significant discounts for larger quantities." },
  { q: "What information do I receive with my purchase?", a: "You'll receive full login credentials, setup instructions, and any relevant documentation needed to get started immediately." },
];

interface ShopFAQProps {
  faqs?: { q: string; a: string }[];
}

export const ShopFAQ = ({ faqs = defaultFaqs }: ShopFAQProps) => {
  return (
    <section className="py-16 md:py-32 px-5 md:px-8 bg-card/30">
      <div className="container mx-auto max-w-3xl">
        <ScrollReveal>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-center mb-3 md:mb-4">
            Frequently Asked <span className="text-gradient">Questions</span>
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground text-center mb-8 md:mb-10">
            Find answers to common questions about our products and services.
          </p>
        </ScrollReveal>
        <ScrollReveal delay={0.1}>
          <Accordion type="single" collapsible className="space-y-2 md:space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="glass rounded-xl border-border/30 px-4 md:px-6"
              >
                <AccordionTrigger className="text-sm font-medium text-foreground hover:text-primary py-3 md:py-4 min-h-[48px]">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground pb-3 md:pb-4 leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </ScrollReveal>
      </div>
    </section>
  );
};
