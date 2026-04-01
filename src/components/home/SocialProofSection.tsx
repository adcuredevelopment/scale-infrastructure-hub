import { ScrollReveal } from "@/components/ScrollReveal";
import { Star } from "lucide-react";

const testimonials = [
  {
    text: "Adcure delivered our new ad accounts within hours. No limits, no spending caps — finally scaling without random shutdowns.",
    author: "Lucas V.",
    role: "Verified Client",
  },
  {
    text: "Every time an account gets unstable, they replace it instantly. Genuinely the best service for advertisers right now.",
    author: "Matteo Rossi",
    role: "Verified Client",
  },
  {
    text: "We switched 100% of our Meta spend to Adcure accounts. CPM dropped by 22% in the first week and stability is insane.",
    author: "Jana Müller",
    role: "Verified Client",
  },
];

export const SocialProofSection = () => {
  return (
    <section className="section-padding">
      <div className="container mx-auto">
        <ScrollReveal>
          <div className="text-center mb-16">
            <span className="text-xs font-medium text-primary uppercase tracking-widest">Trusted by Top Advertisers</span>
            <h2 className="text-3xl md:text-5xl font-display font-bold mt-4 mb-4">
              What Our Clients <span className="text-gradient">Are Saying</span>
            </h2>
            <div className="flex items-center justify-center gap-1 mt-4">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${i < 4 ? "text-yellow-400 fill-yellow-400" : "text-yellow-400/50 fill-yellow-400/50"}`}
                />
              ))}
              <span className="ml-2 text-sm font-medium text-foreground">4.4</span>
              <span className="text-sm text-muted-foreground ml-1">on Trustpilot</span>
            </div>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <ScrollReveal key={t.author} delay={i * 0.1}>
              <div className="glass rounded-xl p-8 hover-lift h-full flex flex-col">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed mb-6 flex-1">"{t.text}"</p>
                <div>
                  <div className="font-display font-semibold text-sm">{t.author}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};
