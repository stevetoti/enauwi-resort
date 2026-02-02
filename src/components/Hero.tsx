"use client";

import { motion } from "framer-motion";
import { ChevronDown, MapPin, Star } from "lucide-react";
import Image from "next/image";

export default function Hero() {
  return (
    <section id="home" className="relative h-screen min-h-[700px] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=1920&q=80"
          alt="Tropical paradise sunset with palm trees"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        {/* Multi-layer overlays for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-ocean-dark/40 via-ocean-dark/20 to-ocean-dark/70" />
        <div className="absolute inset-0 bg-gradient-to-r from-ocean-dark/30 via-transparent to-transparent" />
      </div>

      {/* Decorative particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-gold-light/40 rounded-full"
            style={{
              top: `${20 + Math.random() * 60}%`,
              left: `${10 + Math.random() * 80}%`,
            }}
            animate={{
              y: [-20, 20, -20],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="max-w-5xl"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8"
          >
            <MapPin size={14} className="text-gold-light" />
            <span className="text-white/90 text-sm font-medium tracking-wide">
              Malekula Island, Vanuatu
            </span>
            <span className="w-px h-3 bg-white/30" />
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={10} className="text-gold fill-gold" />
              ))}
            </div>
          </motion.div>

          {/* Heading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="text-gold-light font-medium text-sm sm:text-base uppercase tracking-[0.3em] mb-4"
          >
            Welcome to
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-[0.95]"
          >
            E&apos;Nauwi
            <span className="block text-gold-light mt-2">Beach Resort</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.1 }}
            className="text-white/80 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-light"
          >
            A family-friendly island retreat with calm lagoon waters
            <br className="hidden sm:block" />
            and genuine island hospitality on Malekula Island, Vanuatu.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <a
              href="#contact"
              className="group relative px-10 py-4 bg-gold hover:bg-gold-light text-ocean-dark font-bold text-lg rounded-full transition-all duration-300 shadow-2xl shadow-gold/30 hover:shadow-gold/50 hover:scale-105"
            >
              <span className="relative z-10">Book Your Paradise</span>
            </a>
            <a
              href="#about"
              className="px-10 py-4 border-2 border-white/30 text-white rounded-full font-semibold hover:bg-white/10 hover:border-white/50 transition-all duration-300"
            >
              Explore Resort
            </a>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.8 }}
            className="mt-16 flex items-center justify-center gap-8 sm:gap-12"
          >
            {[
              { value: "🌊", label: "Beachfront" },
              { value: "🏊", label: "Pool & Lagoon" },
              { value: "👨‍👩‍👧‍👦", label: "Family-Friendly" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-serif font-bold text-white">
                  {stat.value}
                </div>
                <div className="text-white/50 text-xs uppercase tracking-widest mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.a
          href="#about"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex flex-col items-center gap-2 text-white/50 hover:text-white/80 transition-colors"
        >
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <ChevronDown size={20} />
        </motion.a>
      </motion.div>
    </section>
  );
}
