import { Link, useLocation, useNavigate } from "react-router-dom";
import adcureIcon from "@/assets/adcure-icon-white.png";
import { ArrowRight } from "lucide-react";

const footerLinks = {
  Product: [
    { label: "Services", path: "/#services" },
    { label: "Pricing", path: "/#pricing" },
    { label: "Contact", path: "/contact" },
    { label: "Affiliate Program", path: "/affiliate" },
  ],
  Shop: [
    { label: "Facebook Accounts", path: "/facebook-accounts" },
    { label: "Business Managers", path: "/business-managers" },
    { label: "Facebook Pages", path: "/facebook-pages" },
    { label: "Facebook Structures", path: "/facebook-structures" },
  ],
  Legal: [
    { label: "Terms of Service", path: "/terms" },
    { label: "Privacy Policy", path: "/privacy" },
    { label: "Refund Policy", path: "/refund" },
    { label: "Subscription Policy", path: "/subscription-policy" },
  ],
};

export const Footer = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavClick = (e: React.MouseEvent, path: string) => {
    if (path.startsWith("/#")) {
      e.preventDefault();
      const id = path.slice(2);
      if (location.pathname === "/") {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      } else {
        navigate("/");
        setTimeout(() => {
          document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  };

  return (
    <footer className="relative border-t border-border/30">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

      <div className="container mx-auto px-5 md:px-8 py-12 md:py-20">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-12 gap-8 md:gap-8">
          {/* Brand column */}
          <div className="col-span-2 sm:col-span-2 md:col-span-4">
            <div className="flex items-center gap-2.5 mb-4 md:mb-5">
              <img src={adcureIcon} alt="Adcure Agency" className="h-8 md:h-9" style={{ imageRendering: 'auto' }} />
              <span className="font-display font-bold text-lg text-foreground">Adcure</span>
            </div>
            <p className="text-muted-foreground text-sm max-w-sm leading-relaxed mb-5 md:mb-6">
              The scaling infrastructure behind high-performing e-commerce brands. Reliable ad accounts, stable systems, unlimited growth.
            </p>
            <a
              href="/#pricing"
              onClick={(e) => handleNavClick(e, "/#pricing")}
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors group min-h-[44px]"
            >
              Get Started
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category} className="col-span-1 md:col-span-2 md:col-start-auto">
              <h4 className="font-display font-semibold text-xs uppercase tracking-widest text-muted-foreground mb-4 md:mb-5">
                {category}
              </h4>
              <ul className="space-y-2.5 md:space-y-3">
                {links.map((link) => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      onClick={(e) => handleNavClick(e, link.path)}
                      className="text-sm text-muted-foreground/80 hover:text-foreground transition-colors duration-300 min-h-[36px] inline-flex items-center"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="section-divider mt-10 md:mt-12 mb-6 md:mb-8" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-3 md:gap-4">
          <p className="text-xs text-muted-foreground/60">
            © {new Date().getFullYear()} Adcure Agency. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground/40">
            Built for scale. Designed for performance.
          </p>
        </div>
      </div>
    </footer>
  );
};
