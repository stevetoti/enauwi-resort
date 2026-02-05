"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Home, UtensilsCrossed, Waves, Ship } from "lucide-react";
import Image from "next/image";

const highlights = [
  {
    icon: Home,
    title: "Beachfront Rooms & Garden Bungalows",
    description:
      "Wake to the whisper of waves in a lagoon-front bungalow, or retreat to a garden hideaway wrapped in frangipani and birdsong. Every room is designed so the island comes to you.",
    image: "/images/resort/resort-buildings-aerial-sm.jpg",
  },
  {
    icon: Ship,
    title: "Kayaking & Snorkeling",
    description:
      "Glide across the glass-calm lagoon by kayak, paddle out to our private island, or slip beneath the surface to discover coral gardens alive with tropical fish and sea turtles.",
    image: "/images/resort/beach-kayaks-cove-sm.jpg",
  },
  {
    icon: UtensilsCrossed,
    title: "Open-Air Restaurant & Bar",
    description:
      "Dine under the palms with the lagoon stretching out before you. Fresh island seafood, tropical flavours, and a well-stocked bar — all set to the gentle rhythm of live background music.",
    image: "/images/resort/resort-coral-reef-sm.jpg",
  },
];

export default function About() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="about" className="relative overflow-hidden">
      {/* Decorative wave divider */}
      <div className="absolute top-0 left-0 right-0 h-24 -mt-1">
        <svg viewBox="0 0 1440 120" className="w-full h-full" preserveAspectRatio="none">
          <path
            d="M0,60 C360,120 720,0 1080,60 C1260,90 1380,80 1440,60 L1440,0 L0,0 Z"
            fill="#0A4B78"
            opacity="0.05"
          />
        </svg>
      </div>

      <div className="section-padding max-w-7xl mx-auto" ref={ref}>
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-ocean/5 rounded-full mb-6"
          >
            <Waves size={14} className="text-ocean" />
            <span className="text-ocean/70 text-sm font-medium uppercase tracking-wider">
              Your Island Retreat
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="section-heading"
          >
            Where the Ocean Meets{" "}
            <span className="text-gold-gradient">Island Soul</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="section-subheading"
          >
            E&apos;Nauwi Beach Resort is a family-friendly island retreat set
            along a peaceful beachfront with calm lagoon waters and beautiful
            island views. The resort offers a relaxed environment ideal for
            families, couples, and groups seeking comfort, good food, and
            genuine island hospitality.
          </motion.p>
        </div>

        {/* Two-column layout with image */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-ocean/10">
              <Image
                src="/images/resort/resort-lagoon-aerial.jpg"
                alt="E'Nauwi Beach Resort aerial view of the lagoon and palm trees"
                width={800}
                height={600}
                className="w-full h-[400px] lg:h-[500px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ocean/30 to-transparent" />
            </div>
            {/* Floating badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="absolute -bottom-6 -right-4 sm:right-6 bg-white rounded-2xl p-5 shadow-xl shadow-ocean/10 border border-ocean/5"
            >
              <div className="text-3xl font-serif font-bold text-ocean">🌴</div>
              <div className="text-ocean/60 text-sm font-medium">
                Family<br />Friendly
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="space-y-6"
          >
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-ocean">
              Slow Down. Dive In. Feel at Home.
            </h3>
            <p className="text-ocean/70 leading-relaxed text-lg">
              Spend your mornings floating in a lagoon so still it mirrors the
              sky. Cool off in our pool beneath swaying coconut palms. Paddle a
              kayak to our private island for an afternoon of snorkelling. Then
              settle into the restaurant as the sun dips behind the islands
              and the aroma of freshly grilled seafood fills the evening air.
            </p>
            <p className="text-ocean/70 leading-relaxed">
              Travelling with little ones? They&apos;ll love the jumping castle
              and trampoline while you enjoy a quiet moment — our nanny service
              runs 8 am to 8 pm so you can truly relax. Whether it&apos;s a
              family holiday, a romantic escape, or a group getaway,
              E&apos;Nauwi wraps every guest in the kind of warmth you
              only find on a Melanesian island.
            </p>
            <div className="grid grid-cols-2 gap-4 pt-4">
              {[
                { val: "2:00 PM", label: "Check-in" },
                { val: "10:00 AM", label: "Check-out" },
                { val: "8–8", label: "Nanny Service" },
                { val: "8–5", label: "Front Desk" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="bg-ocean/5 rounded-xl p-4 text-center"
                >
                  <div className="text-2xl font-serif font-bold text-ocean">
                    {s.val}
                  </div>
                  <div className="text-ocean/60 text-sm mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Highlight Cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {highlights.map((item, idx) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.5 + idx * 0.15 }}
              className="group glass-card overflow-hidden hover:shadow-2xl hover:shadow-ocean/10 transition-all duration-500 hover:-translate-y-2"
            >
              <div className="relative h-52 overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ocean/60 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                    <item.icon size={22} className="text-white" />
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-serif text-xl font-bold text-ocean mb-3">
                  {item.title}
                </h3>
                <p className="text-ocean/60 leading-relaxed text-sm">
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
