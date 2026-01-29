"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Home, Compass, UtensilsCrossed, Waves } from "lucide-react";
import Image from "next/image";

const highlights = [
  {
    icon: Home,
    title: "Beachfront Bungalows",
    description:
      "Wake up to the sound of waves in our handcrafted traditional bungalows, built with local materials and designed for ultimate comfort.",
    image:
      "https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=600&q=80",
  },
  {
    icon: Compass,
    title: "Island Adventures",
    description:
      "Explore hidden lagoons, ancient cultural sites, and pristine coral reefs. Every day brings a new discovery on Malekula Island.",
    image:
      "https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=600&q=80",
  },
  {
    icon: UtensilsCrossed,
    title: "Local Cuisine",
    description:
      "Savour fresh seafood and traditional Melanesian dishes prepared by our local chefs using ingredients sourced from island gardens and waters.",
    image:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80",
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
              Discover Paradise
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="section-heading"
          >
            A Hidden Gem in the{" "}
            <span className="text-gold-gradient">South Pacific</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="section-subheading"
          >
            Nestled along the pristine shores of Malekula Island, E&apos;Nauwi
            Beach Resort offers an authentic escape into one of the Pacific&apos;s
            last untouched paradises. Here, turquoise waters meet lush tropical
            forests, and the warmth of Melanesian hospitality makes every guest
            feel like family.
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
                src="https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=800&q=80"
                alt="Pristine beach in Vanuatu"
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
              <div className="text-3xl font-serif font-bold text-ocean">15+</div>
              <div className="text-ocean/60 text-sm font-medium">
                Years of<br />Hospitality
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
              Where Time Slows Down & Nature Speaks
            </h3>
            <p className="text-ocean/70 leading-relaxed text-lg">
              Far from the crowds and noise, E&apos;Nauwi is a place where you
              reconnect — with nature, with culture, and with yourself. Our
              resort is built with deep respect for the land and sea, using
              sustainable practices and employing local community members.
            </p>
            <p className="text-ocean/70 leading-relaxed">
              Whether you&apos;re seeking adventure in untouched coral reefs,
              cultural immersion in traditional kastom villages, or simply the
              peace of a hammock swaying under coconut palms — this is your
              place.
            </p>
            <div className="grid grid-cols-2 gap-4 pt-4">
              {[
                { val: "12", label: "Bungalows" },
                { val: "3", label: "Dining Areas" },
                { val: "500m", label: "Private Beach" },
                { val: "24/7", label: "Guest Service" },
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
