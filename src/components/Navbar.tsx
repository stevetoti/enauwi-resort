"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Phone } from "lucide-react";
import Image from "next/image";

const navLinks = [
  { href: "#home", label: "Home" },
  { href: "#about", label: "About" },
  { href: "#accommodations", label: "Accommodations" },
  { href: "#features", label: "Features" },
  { href: "#activities", label: "Activities" },
  { href: "/services", label: "Services" },
  { href: "#gallery", label: "Gallery" },
  { href: "#location", label: "Location" },
  { href: "#contact", label: "Contact" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);

      const sections = navLinks.map((l) => l.href.replace("#", ""));
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 120) {
            setActiveSection(sections[i]);
            break;
          }
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-lg shadow-lg shadow-ocean/5 py-3"
            : "bg-gradient-to-b from-black/50 to-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo */}
          <a href="#home" className="flex items-center gap-2 group">
            <div className="relative w-12 h-12 sm:w-14 sm:h-14">
              <Image
                src="/logo-enauwi.png"
                alt="E'Nauwi Beach Resort"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="hidden sm:block">
              <span
                className={`font-serif text-xl font-bold tracking-wide transition-colors duration-300 ${
                  isScrolled ? "text-ocean" : "text-white"
                }`}
              >
                E&apos;Nauwi
              </span>
              <span
                className={`block text-[10px] uppercase tracking-[0.25em] font-medium transition-colors duration-300 ${
                  isScrolled ? "text-gold" : "text-gold-light"
                }`}
              >
                Beach Resort
              </span>
            </div>
          </a>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`relative px-4 py-2 text-sm font-medium tracking-wide transition-colors duration-300 rounded-full ${
                  isScrolled
                    ? activeSection === link.href.replace("#", "")
                      ? "text-ocean"
                      : "text-ocean/60 hover:text-ocean"
                    : activeSection === link.href.replace("#", "")
                    ? "text-white"
                    : "text-white/70 hover:text-white"
                }`}
              >
                {link.label}
                {activeSection === link.href.replace("#", "") && (
                  <motion.div
                    layoutId="activeNav"
                    className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full ${
                      isScrolled ? "bg-gold" : "bg-gold-light"
                    }`}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </a>
            ))}
          </div>

          {/* Phone + CTA + Mobile Toggle */}
          <div className="flex items-center gap-3">
            <a
              href="tel:+67822170"
              className={`hidden md:flex items-center gap-1.5 text-sm font-medium transition-colors duration-300 ${
                isScrolled ? "text-ocean/70 hover:text-ocean" : "text-white/70 hover:text-white"
              }`}
            >
              <Phone size={13} />
              +678 22170
            </a>
            <a
              href="/book"
              className={`hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                isScrolled
                  ? "bg-ocean text-white hover:bg-ocean-light shadow-lg shadow-ocean/20"
                  : "bg-white/20 backdrop-blur text-white border border-white/30 hover:bg-white/30"
              }`}
            >
              Book Now
            </a>

            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className={`lg:hidden p-2 rounded-lg transition-colors ${
                isScrolled
                  ? "text-ocean hover:bg-ocean/5"
                  : "text-white hover:bg-white/10"
              }`}
            >
              {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-white pt-24 px-6 lg:hidden overflow-y-auto"
          >
            <div className="space-y-1">
              {navLinks.map((link, i) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileOpen(false)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`block py-3 px-4 text-lg font-medium rounded-xl transition-colors ${
                    activeSection === link.href.replace("#", "")
                      ? "bg-ocean/5 text-ocean"
                      : "text-ocean/60 hover:text-ocean hover:bg-ocean/5"
                  }`}
                >
                  {link.label}
                </motion.a>
              ))}
            </div>
            <motion.a
              href="/book"
              onClick={() => setIsMobileOpen(false)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="block mt-8 text-center bg-ocean text-white py-4 rounded-2xl text-lg font-semibold shadow-xl shadow-ocean/20"
            >
              Book Your Stay
            </motion.a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
