import { Link } from "react-router-dom";
import adcureAgencyLogo from "@/assets/adcure-agency-logo.png";

const footerLinks = {
  Product: [
    { label: "Services", path: "/services" },
    { label: "Pricing", path: "/pricing" },
    { label: "Contact", path: "/contact" },
  ],
  Legal: [
    { label: "Terms & Conditions", path: "/terms" },
    { label: "Privacy Policy", path: "/privacy" },
    { label: "Refund Policy", path: "/refund" },
  ],
};

export const Footer = () => {
  return (
    <footer className="border-t border-border/50 bg-card/30">
      <div className="container mx-auto px-4 md:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center font-display font-bold text-primary-foreground text-sm">
                A
              </div>
              <span className="font-display font-bold text-lg">Adcure</span>
            </div>
            <p className="text-muted-foreground text-sm max-w-sm leading-relaxed">
              The scaling infrastructure behind high-performing e-commerce brands. Reliable ad accounts, stable systems, unlimited growth.
            </p>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-display font-semibold text-sm mb-4 text-foreground">
                {category}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors duration-300"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-border/50 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Adcure Agency. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Built for scale. Designed for performance.
          </p>
        </div>
      </div>
    </footer>
  );
};
