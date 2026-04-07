import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, ChevronDown, Users, Building2, FileText, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import adcureIcon from "@/assets/adcure-icon-white.png";

const navLinksBefore = [
  { label: "Home", path: "/#hero" },
  { label: "Services", path: "/#services" },
  { label: "Pricing", path: "/#pricing" },
];

const navLinksAfter = [
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
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [mobileShopOpen, setMobileShopOpen] = useState(false);
  const shopRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  useEffect(() => {
    let totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    const onResize = () => { totalHeight = document.documentElement.scrollHeight - window.innerHeight; };
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
      setScrollProgress(totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
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
      setMobileOpen(false);
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
      <div className="container mx-auto flex items-center justify-between h-14 sm:h-16 md:h-20 px-4 md:px-8">
        <Link to="/" className="flex items-center gap-2">
          <img src={adcureIcon} alt="Adcure Agency" className="h-8 sm:h-9 md:h-10" style={{ imageRendering: 'auto' }} />
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navLinksBefore.map((link) => (
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
                  className="absolute top-full right-0 mt-3 w-[520px] rounded-xl border border-border/40 bg-card/95 backdrop-blur-xl shadow-2xl shadow-background/80 overflow-hidden"
                >
                  <div className="p-3">
                    <div className="text-[10px] font-semibold text-primary uppercase tracking-widest px-3 pt-1 pb-3">Assets</div>
                    <div className="grid grid-cols-2 gap-2">
                      {shopLinks.map((link) => (
                        <Link
                          key={link.path}
                          to={link.path}
                          className={`flex items-start gap-3 px-3 py-3 rounded-lg transition-colors duration-200 ${
                            location.pathname === link.path ? "bg-primary/10" : "hover:bg-muted/50"
                          }`}
                        >
                          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                            <link.icon className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <div className={`text-sm font-semibold ${location.pathname === link.path ? "text-primary" : "text-foreground"}`}>{link.label}</div>
                            <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{link.description}</div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {navLinksAfter.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={(e) => handleNavClick(e, link.path)}
              className={`text-sm font-medium transition-colors duration-300 hover:text-primary ${
                location.pathname === link.path ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <a href="https://portal.adcure.agency/" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="hover:scale-[1.03] active:scale-[0.97] transition-all duration-200">
              Sign In
            </Button>
          </a>
          <a href="/#pricing" onClick={(e) => { e.preventDefault(); if (window.location.pathname === '/') { document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }); } else { window.location.href = '/#pricing'; } }}>
            <Button className="glow-primary-sm hover:scale-[1.03] active:scale-[0.97] transition-all duration-200">
              Get Started
            </Button>
          </a>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-foreground min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden glass border-t border-border/30 max-h-[calc(100svh-56px)] overflow-y-auto"
          >
            <div className="container mx-auto px-5 py-5 flex flex-col gap-1">
              {navLinksBefore.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={(e) => handleNavClick(e, link.path)}
                  className={`text-base font-medium py-3 transition-colors min-h-[48px] flex items-center ${
                    location.pathname === link.path ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              <button
                onClick={() => setMobileShopOpen(!mobileShopOpen)}
                className={`flex items-center justify-between text-base font-medium py-3 transition-colors min-h-[48px] ${
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
                    transition={{ duration: 0.15 }}
                    className="pl-4 flex flex-col gap-0.5"
                  >
                    {shopLinks.map((link) => (
                      <Link
                        key={link.path}
                        to={link.path}
                        className={`text-sm py-3 transition-colors min-h-[44px] flex items-center ${
                          location.pathname === link.path ? "text-primary" : "text-muted-foreground"
                        }`}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {navLinksAfter.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={(e) => handleNavClick(e, link.path)}
                  className={`text-base font-medium py-3 transition-colors min-h-[48px] flex items-center ${
                    location.pathname === link.path ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              <a href="https://portal.adcure.agency/" target="_blank" rel="noopener noreferrer" className="block mt-2">
                <Button variant="outline" className="w-full min-h-[48px]">Sign In</Button>
              </a>
              <a href="/#pricing" className="block mt-2" onClick={(e) => { e.preventDefault(); setMobileOpen(false); if (window.location.pathname === '/') { document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }); } else { window.location.href = '/#pricing'; } }}>
                <Button className="w-full min-h-[48px]">Get Started</Button>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scroll progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-transparent">
        <div
          className="h-full bg-gradient-to-r from-primary to-blue-400 transition-[width] duration-100"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>
    </motion.header>
  );
};
