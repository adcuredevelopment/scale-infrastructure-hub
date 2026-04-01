import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardMockup } from "./DashboardMockup";
import { useEffect, useRef, useState } from "react";

const AnimatedCounter = ({ target, suffix = "" }: { target: string; suffix?: string }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);
  const numericTarget = parseInt(target.replace(/[^0-9]/g, ""));

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const duration = 1500;
          const start = performance.now();
          const animate = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * numericTarget));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [numericTarget]);

  return <div ref={ref}>{count}{suffix}</div>;
};

export const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-start overflow-hidden pt-28 md:pt-32 pb-20">
      {/* Animated gradient background — GPU composited for crisp rendering */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-primary/5 blur-[100px] gpu-blur animate-glow-pulse" />
        <div className="absolute top-1/3 right-0 w-[400px] h-[400px] rounded-full bg-blue-500/3 blur-[80px] gpu-blur" />
        {/* Soft bottom fade instead of hard line */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </div>

      {/* Grid pattern — crisp 1px lines */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(hsl(220 16% 16% / 0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(220 16% 16% / 0.3) 1px, transparent 1px)`,
          backgroundSize: '64px 64px',
          transform: 'translateZ(0)',
        }}
      />

      <div className="container mx-auto px-4 md:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 mb-8"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-glow-pulse" />
            <span className="text-xs font-medium text-primary">Reliable Advertising Infrastructure</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-5xl md:text-7xl lg:text-8xl font-display font-bold tracking-tight leading-[0.95] mb-6"
          >
            Scale Without
            <br />
            <span className="text-gradient">Limits.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            We build the infrastructure behind high-performing e-commerce brands.
            Bulletproof ad accounts. Stable systems. Unlimited growth.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <a href="#pricing" onClick={(e) => { e.preventDefault(); document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }); }}>
              <Button
                size="lg"
                className="glow-primary text-base px-8 py-6 hover:scale-[1.03] active:scale-[0.97] transition-all duration-200 group"
              >
                Get Started
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </a>
          </motion.div>

          {/* Stats with animated counters */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="grid grid-cols-3 gap-8 max-w-lg mx-auto mt-16 pt-8 border-t border-border/30"
          >
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-display font-bold text-foreground">
                <AnimatedCounter target="500" suffix="+" />
              </div>
              <div className="text-xs text-muted-foreground mt-1">Active Clients</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-display font-bold text-foreground">4.4★</div>
              <div className="text-xs text-muted-foreground mt-1">Trustpilot</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-display font-bold text-foreground">24/7</div>
              <div className="text-xs text-muted-foreground mt-1">Support</div>
            </div>
          </motion.div>
        </div>

        {/* Dashboard Mockup */}
        <DashboardMockup />
      </div>
    </section>
  );
};
