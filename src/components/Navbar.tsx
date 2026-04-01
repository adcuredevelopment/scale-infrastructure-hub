import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, ChevronDown, Users, Building2, FileText, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import adcureIcon from "@/assets/adcure-icon-white.png";

const navLinks = [
  { label: "Home", path: "/#hero" },
  { label: "Services", path: "/#services" },
  { label: "Pricing", path: "/#pricing" },
  { label: "Contact", path: "/contact" },
];

const shopLinks = [
  { label: "Facebook Accounts", path: "/facebook-accounts", icon: Users, description: "Aged, verified and stable profiles ready for ad scalability." },
  { label: "Business Managers", path: "/business-managers", icon: Building2, description: "Verified BMs with correct permissions and billing." },
  { label: "Facebook Pages", path: "/facebook-pages", icon: FileText, description: "Niche-aligned pages to boost credibility and ad delivery." },
  { label: "Facebook Structures", path: "/facebook-structures", icon: Layers, description: "Complete ad account structures optimized for long-term scaling." },
];

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [mobileShopOpen, setMobileShopOpen] = useState(false);
  const shopRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setShopOpen(false);
    setMobileShopOpen(false);
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (shopRef.current && !shopRef.current.contains(e.target as Node)) {
        setShopOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const isShopActive = shopLinks.some((l) => location.pathname === l.path);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "glass border-b border-border/30 shadow-lg shadow-background/50"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto flex items-center justify-between h-16 md:h-20 px-4 md:px-8">
        <Link to="/" className="flex items-center gap-2">
          <img src={adcureIcon} alt="Adcure Agency" className="h-9 md:h-10" />
          
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={(e) => handleNavClick(e, link.path)}
              className={`text-sm font-medium transition-colors duration-300 hover:text-primary ${
                location.pathname === link.path || (link.path === "/#hero" && location.pathname === "/")
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}

          {/* Shop dropdown */}
          <div ref={shopRef} className="relative">
            <button
              onClick={() => setShopOpen(!shopOpen)}
              className={`flex items-center gap-1 text-sm font-medium transition-colors duration-300 hover:text-primary ${
                isShopActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Shop
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${shopOpen ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
              {shopOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full right-0 mt-3 w-56 rounded-xl border border-border/40 bg-card/95 backdrop-blur-xl shadow-2xl shadow-background/80 overflow-hidden"
                >
                  <div className="p-2">
                    {shopLinks.map((link) => (
                      <Link
                        key={link.path}
                        to={link.path}
                        className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
                          location.pathname === link.path
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        }`}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Link to="/contact">
            <Button className="glow-primary-sm hover:scale-[1.03] active:scale-[0.97] transition-all duration-200">
              Get Started
            </Button>
          </Link>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-foreground"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass border-t border-border/30"
          >
            <div className="container mx-auto px-4 py-6 flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={(e) => handleNavClick(e, link.path)}
                  className={`text-sm font-medium py-2 transition-colors ${
                    location.pathname === link.path
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              {/* Mobile Shop */}
              <button
                onClick={() => setMobileShopOpen(!mobileShopOpen)}
                className={`flex items-center justify-between text-sm font-medium py-2 transition-colors ${
                  isShopActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                Shop
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${mobileShopOpen ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {mobileShopOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="pl-4 flex flex-col gap-2"
                  >
                    {shopLinks.map((link) => (
                      <Link
                        key={link.path}
                        to={link.path}
                        className={`text-sm py-1.5 transition-colors ${
                          location.pathname === link.path
                            ? "text-primary"
                            : "text-muted-foreground"
                        }`}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <Link to="/contact">
                <Button className="w-full mt-2">Get Started</Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};
