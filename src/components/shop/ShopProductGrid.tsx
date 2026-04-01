import { ScrollReveal } from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

interface Product {
  name: string;
  description: string;
  price: string;
  popular?: boolean;
  includes?: string[];
}

interface ShopProductGridProps {
  title: string;
  titleGradient: string;
  products: Product[];
  columns?: 2 | 3;
}

export const ShopProductGrid = ({ title, titleGradient, products, columns = 2 }: ShopProductGridProps) => {
  return (
    <section className="section-padding bg-card/20">
      <div className="container mx-auto px-4 md:px-8">
        <ScrollReveal>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-center mb-12">
            {title} <span className="text-gradient">{titleGradient}</span>
          </h2>
        </ScrollReveal>
        <div className={`grid grid-cols-1 ${columns === 3 ? "md:grid-cols-3 max-w-5xl" : "md:grid-cols-2 max-w-4xl"} gap-5 mx-auto`}>
          {products.map((product, i) => (
            <ScrollReveal key={product.name} delay={i * 0.1}>
              <div className={`group relative rounded-xl p-7 hover-lift h-full flex flex-col overflow-hidden transition-all duration-500 ${
                product.popular
                  ? "border-2 border-primary/40 bg-card/80 backdrop-blur-xl"
                  : "bg-card/40 border border-border/30 hover:border-primary/15"
              }`}>
                {/* Hover gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {product.popular && (
                  <div className="absolute -top-px left-1/2 -translate-x-1/2 px-4 py-1 rounded-b-lg bg-primary text-primary-foreground text-[10px] font-semibold">
                    Most Popular
                  </div>
                )}

                <div className="relative flex-1 flex flex-col">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-display font-semibold text-base text-foreground pr-4 leading-snug">{product.name}</h3>
                    <span className="text-2xl font-display font-bold text-primary shrink-0">{product.price}</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-5 flex-1">{product.description}</p>

                  {product.includes && (
                    <div className="rounded-lg bg-muted/30 border border-border/20 p-4 mb-5">
                      <span className="text-[10px] font-semibold text-primary uppercase tracking-widest">Includes</span>
                      <ul className="mt-2 space-y-1.5">
                        {product.includes.map((item) => (
                          <li key={item} className="flex items-center gap-2 text-xs text-muted-foreground">
                            <CheckCircle2 className="w-3 h-3 text-primary shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <Link to="/contact">
                    <Button className="w-full group/btn" variant={product.popular ? "default" : "outline"}>
                      Order Now
                    </Button>
                  </Link>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};
