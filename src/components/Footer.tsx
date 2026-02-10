"use client";

import { motion } from "framer-motion";
import {
  MapPin,
  Phone,
  Mail,
  Facebook,
  Instagram,
  ArrowUp,
} from "lucide-react";
import Image from "next/image";

const footerLinks = [
  {
    title: "Resort",
    links: [
      { label: "About Us", href: "#about" },
      { label: "Accommodations", href: "#accommodations" },
      { label: "Features & Amenities", href: "#features" },
      { label: "Activities", href: "#activities" },
      { label: "Gallery", href: "#gallery" },
    ],
  },
  {
    title: "Information",
    links: [
      { label: "Getting Here", href: "#location" },
      { label: "Services & Experiences", href: "/services" },
      { label: "Book a Room", href: "/book" },
      { label: "Terms & Policies", href: "/terms" },
      { label: "Contact Us", href: "#contact" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="relative bg-ocean-dark border-t border-white/5">
      {/* Gold accent line */}
      <div className="h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <a href="#home" className="inline-flex items-center gap-3 mb-5">
              <div className="relative w-14 h-14">
                <Image
                  src="/logo-enauwi.png"
                  alt="E'Nauwi Beach Resort"
                  fill
                  className="object-contain"
                />
              </div>
              <div>
                <span className="font-serif text-xl font-bold text-white block">
                  E&apos;Nauwi
                </span>
                <span className="text-[10px] uppercase tracking-[0.3em] text-gold-light font-medium">
                  Beach Resort
                </span>
              </div>
            </a>
            <p className="text-white/40 text-sm leading-relaxed mb-6">
              A family-friendly island retreat set along a peaceful beachfront
              with calm lagoon waters and beautiful island views on Efate
              Island, Vanuatu.
            </p>
            <div className="flex gap-3">
              {[Facebook, Instagram].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-gold-light hover:bg-white/10 hover:border-gold/30 transition-all duration-300"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {footerLinks.map((col) => (
            <div key={col.title}>
              <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-5">
                {col.title}
              </h4>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-white/40 hover:text-gold-light text-sm transition-colors duration-300"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-5">
              Contact
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-gold/60 mt-0.5 shrink-0" />
                <span className="text-white/40 text-sm">
                  South West Bay, Malekula Island,
                  <br />
                  Malampa Province, Vanuatu
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} className="text-gold/60 shrink-0" />
                <a href="tel:+67822170" className="text-white/40 text-sm hover:text-gold-light transition-colors">+678 22170</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={16} className="text-gold/60 shrink-0" />
                <span className="text-white/40 text-sm">
                  gm@enauwibeachresort.com
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/25 text-xs">
            © {new Date().getFullYear()} E&apos;Nauwi Beach Resort. All rights
            reserved.
          </p>
          <p className="text-white/25 text-xs">
            Website by{" "}
            <a
              href="https://pacificwave.digital"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold/40 hover:text-gold-light transition-colors"
            >
              Pacific Wave Digital
            </a>
          </p>
        </div>
      </div>

      {/* Back to top */}
      <motion.a
        href="#home"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-ocean text-white shadow-xl shadow-ocean/30 flex items-center justify-center border border-ocean-light/30 hover:bg-ocean-light transition-colors"
      >
        <ArrowUp size={18} />
      </motion.a>
    </footer>
  );
}
