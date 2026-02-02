"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import {
  Bed,
  Users,
  Wifi,
  Wind,
  Coffee,
  Tv,
  Phone,
  Refrigerator,
  Bath,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Shirt,
  Fan,
  UtensilsCrossed,
} from "lucide-react";
import Image from "next/image";

const rooms = [
  {
    name: "2BR Deluxe Bungalow",
    tagline: "Lagoon Beachfront",
    price: "12,000",
    image:
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80",
    description:
      "Step outside and the lagoon is right there — turquoise, still, and stretching toward the islands on the horizon. This spacious two-bedroom bungalow sits front-row on the beachfront, where warm trade-wind breezes drift through the living area and every evening brings a sunset you'll want to photograph twice.",
    guests: "Up to 4 Guests",
    bed: "2 Bedrooms",
    popular: true,
  },
  {
    name: "2BR Superior Bungalow",
    tagline: "Tropical Garden",
    price: "18,000",
    image:
      "https://images.unsplash.com/photo-1578774204375-826dc5d996ed?w=800&q=80",
    description:
      "Tucked just behind the beachfront row, this two-bedroom retreat is wrapped in the colour and fragrance of Vanuatu's tropical gardens — flowering hibiscus, local mango and papaya trees, and the soft sound of the ocean filtering through the leaves. The beach is a short stroll away, but your private garden world feels miles from anywhere.",
    guests: "Up to 4 Guests",
    bed: "2 Bedrooms",
    popular: false,
  },
  {
    name: "Deluxe 1BR Bungalow",
    tagline: "Lagoon Beachfront",
    price: "25,000",
    image:
      "https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=800&q=80",
    description:
      "For couples and solo travellers who want the lagoon all to themselves. This intimate one-bedroom bungalow opens directly onto the beachfront with sweeping views across the water to the outer islands. Grab a kayak from the shore, snorkel at your doorstep, or simply settle into the quiet with a good book and the sound of gentle waves.",
    guests: "Up to 2 Guests",
    bed: "1 Bedroom",
    popular: false,
  },
  {
    name: "Superior 1BR Bungalow",
    tagline: "Tropical Garden",
    price: "10,000",
    image:
      "https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800&q=80",
    description:
      "Escape to your own private sanctuary, nestled among fragrant tropical flowers and swaying palms. This charming one-bedroom bungalow offers a peaceful retreat surrounded by Vanuatu's lush natural beauty — the perfect hideaway to recharge after a day of island adventure.",
    guests: "Up to 2 Guests",
    bed: "1 Bedroom",
    popular: false,
  },
];

const allRoomFeatures = [
  { icon: Bath, label: "Towels provided" },
  { icon: Wifi, label: "Internet Access" },
  { icon: Wind, label: "Air Conditioned living room" },
  { icon: Shirt, label: "Bathrobes provided" },
  { icon: Tv, label: "Television" },
  { icon: Fan, label: "Ceiling Fans" },
  { icon: Phone, label: "Telephone" },
  { icon: Refrigerator, label: "Mini Fridge" },
  { icon: Bath, label: "Toiletries" },
  { icon: UtensilsCrossed, label: "Cutlery" },
  { icon: Coffee, label: "Tea/Coffee Station" },
];

export default function Accommodations() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [showFeatures, setShowFeatures] = useState(false);

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
            Fall asleep to the rhythm of the lagoon in a beachfront bungalow, or
            wake to birdsong in a garden retreat wrapped in tropical flowers.
            Four distinct settings — one unforgettable island feeling.
          </motion.p>
        </div>

        {/* Room Cards — 2x2 grid */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {rooms.map((room, idx) => (
            <motion.div
              key={room.name}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.3 + idx * 0.12 }}
              className={`group relative bg-white/10 backdrop-blur-sm rounded-3xl overflow-hidden border transition-all duration-500 hover:bg-white/15 ${
                room.popular
                  ? "border-gold/40 ring-1 ring-gold/20"
                  : "border-white/10 hover:border-white/20"
              }`}
            >
              {room.popular && (
                <div className="absolute top-4 right-4 z-20 px-3 py-1 bg-gold text-ocean-dark text-xs font-bold uppercase tracking-wider rounded-full">
                  Most Popular
                </div>
              )}

              {/* Image */}
              <div className="relative h-56 overflow-hidden">
                <Image
                  src={room.image}
                  alt={room.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, 50vw"
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
                    <Users size={12} /> {room.guests}
                  </span>
                  <span className="flex items-center gap-1">
                    <Bed size={12} /> {room.bed}
                  </span>
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

        {/* All Room Features - Expandable */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="mt-12"
        >
          <button
            onClick={() => setShowFeatures(!showFeatures)}
            className="mx-auto flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/15 rounded-full text-white/70 text-sm font-medium transition-all duration-300 border border-white/10"
          >
            All Room Features
            {showFeatures ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {showFeatures && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-6 bg-white/5 rounded-2xl p-6 border border-white/10"
            >
              <p className="text-white/40 text-xs uppercase tracking-wider mb-4 text-center">
                Every room includes
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {allRoomFeatures.map((feature) => (
                  <div
                    key={feature.label}
                    className="flex items-center gap-2 text-white/60 text-sm"
                  >
                    <feature.icon size={14} className="text-gold/60 shrink-0" />
                    {feature.label}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 1 }}
          className="text-center text-white/30 text-sm mt-8"
        >
          All rates in Vanuatu Vatu (VT). Prices include breakfast. Seasonal rates may apply.
        </motion.p>
      </div>
    </section>
  );
}
