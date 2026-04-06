import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MessageSquare } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      toast({ title: "Message sent!", description: "We'll get back to you within 24 hours." });
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="noise-overlay">
      <Navbar />
      <main className="pt-24 sm:pt-28 md:pt-32 pb-16 md:pb-32 px-5 md:px-8">
        <div className="container mx-auto max-w-4xl">
          <ScrollReveal>
            <div className="text-center mb-10 md:mb-16">
              <span className="text-[11px] sm:text-xs font-medium text-primary uppercase tracking-widest">Contact</span>
              <h1 className="text-3xl sm:text-4xl md:text-6xl font-display font-bold mt-3 md:mt-4 mb-3 md:mb-4">
                Let's <span className="text-gradient">Talk</span>
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
                Ready to scale? Get in touch and we'll set you up within 24 hours.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <ScrollReveal delay={0.1}>
              <form onSubmit={handleSubmit} className="glass rounded-xl p-5 sm:p-6 md:p-8 space-y-4 md:space-y-5">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Name</label>
                  <Input placeholder="Your name" required className="bg-secondary/50 border-border/50 min-h-[44px]" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Email</label>
                  <Input type="email" placeholder="you@example.com" required className="bg-secondary/50 border-border/50 min-h-[44px]" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Message</label>
                  <Textarea placeholder="Tell us about your needs..." rows={5} required className="bg-secondary/50 border-border/50" />
                </div>
                <Button type="submit" className="w-full min-h-[48px] glow-primary-sm hover:scale-[1.02] active:scale-[0.98] transition-all duration-200" disabled={loading}>
                  {loading ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <div className="space-y-4 md:space-y-6">
                <div className="glass rounded-xl p-5 sm:p-6 md:p-8">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3 md:mb-4">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-display font-semibold mb-1.5 md:mb-2">Email Us</h3>
                  <p className="text-sm text-muted-foreground">hello@adcure.agency</p>
                </div>
                <div className="glass rounded-xl p-5 sm:p-6 md:p-8">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3 md:mb-4">
                    <MessageSquare className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-display font-semibold mb-1.5 md:mb-2">Live Chat</h3>
                  <p className="text-sm text-muted-foreground">Available Mon–Sun, 08:00–22:00</p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
