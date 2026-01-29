"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Bed,
  Users,
  Maximize,
  Wifi,
  Wind,
  Coffee,
  Bath,
  Eye,
  Star,
  ArrowRight,
} from "lucide-react";
import Image from "next/image";

const rooms = [
  {
    name: "Beach Bungalow",
    tagline: "Classic Island Living",
    price: "12,000",
    image:
      "https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800&q=80",
    description:
      "Traditional thatched-roof bungalow steps from the water's edge. Fall asleep to the rhythm of gentle waves and wake to golden sunrises.",
    size: "35m²",
    guests: "2 Adults",
    bed: "Queen Bed",
    features: ["Ocean View", "Private Deck", "Outdoor Shower", "WiFi"],
    popular: false,
  },
  {
    name: "Family Villa",
    tagline: "Space for Memories",
    price: "18,000",
    image:
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80",
    description:
      "Spacious two-bedroom villa surrounded by tropical gardens. Perfect for families looking to share an unforgettable island experience together.",
    size: "65m²",
    guests: "4 Adults + 2 Kids",
    bed: "King + Twin Beds",
    features: [
      "Garden & Ocean View",
      "Living Area",
      "Kitchenette",
      "WiFi",
    ],
    popular: true,
  },
  {
    name: "Premium Suite",
    tagline: "Ultimate Luxury",
    price: "25,000",
    image:
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80",
    description:
      "Our finest accommodation with panoramic ocean views, private plunge pool, and personalised butler service. Pure indulgence in paradise.",
    size: "90m²",
    guests: "2 Adults",
    bed: "King Bed",
    features: [
      "Panoramic Ocean View",
      "Plunge Pool",
      "Butler Service",
      "Premium WiFi",
    ],
    popular: false,
  },
];

const featureIcons: Record<string, React.ElementType> = {
  WiFi: Wifi,
  "Premium WiFi": Wifi,
  "Ocean View": Eye,
  "Garden & Ocean View": Eye,
  "Panoramic Ocean View": Eye,
  "Outdoor Shower": Bath,
  "Private Deck": Maximize,
  "Living Area": Maximize,
  "Plunge Pool": Bath,
  Kitchenette: Coffee,
  "Butler Service": Star,
};

export default function Accommodations() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="accommodations"
      className="relative bg-ocean-dark overflow-hidden"
    >
      {/* Background texture */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="section-padding max-w-7xl mx-auto relative z-10" ref={ref}>
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 rounded-full mb-6"
          >
            <Bed size={14} className="text-gold-light" />
            <span className="text-white/70 text-sm font-medium uppercase tracking-wider">
              Accommodations
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4"
          >
            Your Island{" "}
            <span className="text-gold-light">Sanctuary</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-white/60 text-lg max-w-2xl mx-auto"
          >
            Each of our accommodations blends traditional Melanesian architecture
            with modern comforts, creating spaces that are as beautiful as the
            island itself.
          </motion.p>
        </div>

        {/* Room Cards */}
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {rooms.map((room, idx) => (
            <motion.div
              key={room.name}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.3 + idx * 0.15 }}
              className={`group relative bg-white/10 backdrop-blur-sm rounded-3xl overflow-hidden border transition-all duration-500 hover:bg-white/15 ${
                room.popular
                  ? "border-gold/40 ring-1 ring-gold/20 lg:scale-[1.03]"
                  : "border-white/10 hover:border-white/20"
              }`}
            >
              {room.popular && (
                <div className="absolute top-4 right-4 z-20 px-3 py-1 bg-gold text-ocean-dark text-xs font-bold uppercase tracking-wider rounded-full">
                  Most Popular
                </div>
              )}

              {/* Image */}
              <div className="relative h-64 overflow-hidden">
                <Image
                  src={room.image}
                  alt={room.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ocean-dark/80 via-ocean-dark/20 to-transparent" />

                {/* Price overlay */}
                <div className="absolute bottom-4 left-5">
                  <div className="text-3xl font-serif font-bold text-white">
                    {room.price}{" "}
                    <span className="text-sm font-sans font-normal text-white/60">
                      VT/night
                    </span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-gold-light text-xs uppercase tracking-widest mb-1 font-medium">
                  {room.tagline}
                </p>
                <h3 className="font-serif text-2xl font-bold text-white mb-3">
                  {room.name}
                </h3>
                <p className="text-white/50 text-sm leading-relaxed mb-5">
                  {room.description}
                </p>

                {/* Quick specs */}
                <div className="flex items-center gap-4 text-white/40 text-xs mb-5">
                  <span className="flex items-center gap-1">
                    <Maximize size={12} /> {room.size}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users size={12} /> {room.guests}
                  </span>
                  <span className="flex items-center gap-1">
                    <Bed size={12} /> {room.bed}
                  </span>
                </div>

                {/* Features */}
                <div className="grid grid-cols-2 gap-2 mb-6">
                  {room.features.map((feature) => {
                    const Icon = featureIcons[feature] || Wind;
                    return (
                      <div
                        key={feature}
                        className="flex items-center gap-2 text-white/60 text-xs"
                      >
                        <Icon size={12} className="text-gold/60" />
                        {feature}
                      </div>
                    );
                  })}
                </div>

                {/* CTA */}
                <a
                  href="#contact"
                  className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
                    room.popular
                      ? "bg-gold text-ocean-dark hover:bg-gold-light shadow-lg shadow-gold/20"
                      : "bg-white/10 text-white hover:bg-white/20 border border-white/10"
                  }`}
                >
                  Book This Room
                  <ArrowRight size={14} />
                </a>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 1 }}
          className="text-center text-white/30 text-sm mt-10"
        >
          All rates in Vanuatu Vatu (VT). Prices include breakfast. Seasonal rates may apply.
        </motion.p>
      </div>
    </section>
  );
}
