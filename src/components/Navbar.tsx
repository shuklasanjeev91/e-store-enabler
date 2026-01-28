import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "Resources", href: "#" },
];

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { handleCTAClick, isAuthenticated, hasStore } = useAuthRedirect();

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <div className="mx-auto max-w-7xl px-4 py-4">
        <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-surface-dark/80 px-6 py-3 backdrop-blur-xl">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <span className="font-display text-lg font-bold text-primary-foreground">S</span>
            </div>
            <span className="font-display text-xl font-bold text-text-on-dark">Shopdu</span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-text-muted-on-dark transition-colors hover:text-text-on-dark"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden items-center gap-3 md:flex">
            <Button 
              variant="ghost" 
              className="text-text-on-dark hover:bg-white/10"
              onClick={handleCTAClick}
            >
              {isAuthenticated ? (hasStore ? "Dashboard" : "Setup Store") : "Log in"}
            </Button>
            <Button variant="hero" size="sm" onClick={handleCTAClick}>
              {isAuthenticated ? (hasStore ? "Go to Dashboard" : "Complete Setup") : "Get Started"}
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="rounded-lg p-2 text-text-on-dark hover:bg-white/10 md:hidden"
          >
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 rounded-2xl border border-white/10 bg-surface-dark/95 p-6 backdrop-blur-xl md:hidden"
          >
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm font-medium text-text-muted-on-dark transition-colors hover:text-text-on-dark"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <hr className="border-white/10" />
              <Button 
                variant="ghost" 
                className="justify-start text-text-on-dark hover:bg-white/10"
                onClick={() => {
                  setIsOpen(false);
                  handleCTAClick();
                }}
              >
                {isAuthenticated ? (hasStore ? "Dashboard" : "Setup Store") : "Log in"}
              </Button>
              <Button 
                variant="hero"
                onClick={() => {
                  setIsOpen(false);
                  handleCTAClick();
                }}
              >
                {isAuthenticated ? (hasStore ? "Go to Dashboard" : "Complete Setup") : "Get Started"}
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
};
