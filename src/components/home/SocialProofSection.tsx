import { ScrollReveal } from "@/components/ScrollReveal";
import { Star } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const testimonials = [
  { text: "Truly recommended! Quick response, friendly, helpful and everything is arranged in no time. If you don't want to sit still for days with your ads, this is genuinely the right choice.", author: "Anonymous", date: "Feb 2026", stars: 5 },
  { text: "Been working with Adcure Agency for two months now. Service & speed is top! Definitely recommended. Available 24/7 and always focused on fast solutions. Great company.", author: "Anonymous", date: "Nov 2025", stars: 5 },
  { text: "This company is truly amazing. The knowledge and expertise I searched for for years, I found here within two months. A whole new world has opened up for me in terms of entrepreneurship.", author: "Anonymous", date: "Sep 2025", stars: 5 },
  { text: "Everything always runs smoothly. If something does go wrong, they pick it up immediately and resolve the issue properly. Very satisfied and would definitely recommend this agency.", author: "Anonymous", date: "Jul 2025", stars: 5 },
  { text: "More than satisfied! Great people who definitely deserve more recognition!", author: "Anonymous", date: "Jul 2025", stars: 5 },
  { text: "Had an issue with my ad account, quick action was taken and we checked via a Zoom call what went wrong. The problem has been solved ever since! 👍", author: "Anonymous", date: "May 2025", stars: 5 },
  { text: "Great service, I've always been able to keep running. Even small issues were resolved quickly. Super!", author: "Anonymous", date: "May 2025", stars: 5 },
  { text: "I can wholeheartedly recommend Adcure Agency! The team radiates professionalism and expertise. They don't just think along, but come up with creative and effective solutions that truly make a difference.", author: "Anonymous", date: "Mar 2025", stars: 5 },
  { text: "Super agency. Everything is well organized.", author: "Anonymous", date: "Jan 2025", stars: 5 },
  { text: "They work neatly and accurately, they stick to their rules and you don't have to wait months for them to respond like other agencies.", author: "Anonymous", date: "Jan 2025", stars: 5 },
  { text: "Top service! Great collaboration with the help that's needed 👌🏼", author: "Anonymous", date: "Dec 2024", stars: 5 },
];

const TestimonialCard = ({ t }: { t: typeof testimonials[0] }) => (
  <div className="glass rounded-xl p-5 sm:p-6 md:p-8 hover-lift flex flex-col min-w-[280px] sm:min-w-[320px] md:min-w-[340px] w-[280px] sm:w-[320px] md:w-[340px] shrink-0">
    <div className="flex gap-1 mb-3 md:mb-4">
      {[...Array(t.stars)].map((_, j) => (
        <Star key={j} className="w-3.5 md:w-4 h-3.5 md:h-4 text-yellow-400 fill-yellow-400" />
      ))}
    </div>
    <p className="text-sm text-foreground/80 leading-relaxed mb-4 md:mb-6 flex-1">"{t.text}"</p>
    <div className="flex items-center justify-between">
      <div>
        <div className="font-display font-semibold text-sm">{t.author}</div>
        <div className="text-[11px] md:text-xs text-muted-foreground">Verified on Trustpilot</div>
      </div>
      <div className="text-[11px] md:text-xs text-muted-foreground">{t.date}</div>
    </div>
  </div>
);

export const SocialProofSection = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let animationId: number;
    let scrollPos = 0;
    const speed = 0.4;

    const step = () => {
      if (!isPaused) {
        scrollPos += speed;
        const halfWidth = el.scrollWidth / 2;
        if (scrollPos >= halfWidth) {
          scrollPos = 0;
        }
        el.scrollLeft = scrollPos;
      }
      animationId = requestAnimationFrame(step);
    };

    animationId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationId);
  }, [isPaused]);

  const doubled = [...testimonials, ...testimonials];

  return (
    <section className="py-16 md:py-32 px-0">
      <div className="container mx-auto px-5 md:px-8">
        <ScrollReveal>
          <div className="text-center mb-10 md:mb-16">
            <span className="text-[11px] sm:text-xs font-medium text-primary uppercase tracking-widest">Trusted by Top Advertisers</span>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-display font-bold mt-3 md:mt-4 mb-3 md:mb-4">
              What Our Clients <span className="text-gradient">Are Saying</span>
            </h2>
            <div className="flex items-center justify-center gap-1 mt-3 md:mt-4 flex-wrap">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 md:w-5 h-4 md:h-5 ${i < 4 ? "text-yellow-400 fill-yellow-400" : "text-yellow-400/50 fill-yellow-400/50"}`}
                />
              ))}
              <span className="ml-1.5 text-sm font-medium text-foreground">4.4</span>
              <span className="text-sm text-muted-foreground ml-1">on Trustpilot</span>
              <span className="text-xs text-muted-foreground ml-1">• 13 reviews</span>
            </div>
          </div>
        </ScrollReveal>
      </div>

      <div className="relative">
        {/* Scroll hint gradients */}
        <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-12 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-12 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

        <div
          ref={scrollRef}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setTimeout(() => setIsPaused(false), 3000)}
          className="overflow-hidden"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <div className="flex gap-4 md:gap-6 px-4 w-max">
            {doubled.map((t, i) => (
              <TestimonialCard key={i} t={t} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
