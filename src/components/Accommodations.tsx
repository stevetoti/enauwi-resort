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
    id: "2br-deluxe",
    name: "Beachfront Deluxe 2 Bedroom",
    tagline: "Lagoon Beachfront",
    price: "30,000",
    image: "/images/resort/malili-rooms/living-lagoon-view-opt-pro.jpg",
    gallery: [
      "/images/resort/malili-rooms/living-lagoon-view-opt-pro.jpg",
      "/images/resort/malili-rooms/living-room-3-opt-pro.jpg",
      "/images/resort/malili-rooms/queen-bed-artistic-opt-pro.jpg",
      "/images/resort/malili-rooms/bedroom-1-opt-pro.jpg",
    ],
    description:
      "Facing the beach and tranquil lagoon, our two-bedroom lagoon beachfront suite bungalows offer a quiet, spacious retreat with refreshing breezes and breathtaking sunset views.",
    guests: "Up to 4 Guests",
    bed: "2 Bedrooms",
    popular: true,
  },
  {
    id: "2br-superior",
    name: "Lagoon View Superior 2 Bedroom",
    tagline: "Lagoon View",
    price: "27,000",
    image: "/images/resort/malili-rooms/living-room-8-opt-pro.jpg",
    gallery: [
      "/images/resort/malili-rooms/living-room-8-opt-pro.jpg",
      "/images/resort/malili-rooms/queen-bed-opt-pro.jpg",
      "/images/resort/malili-rooms/twin-bedroom-3-opt-pro.jpg",
      "/images/resort/malili-rooms/bathroom-full-opt-pro.jpg",
    ],
    description:
      "Set behind the lagoon beachfront bungalows, this two-bedroom suite is nestled among flowering gardens and local fruit trees, with gentle peek-through views of the beach.",
    guests: "Up to 4 Guests",
    bed: "2 Bedrooms",
    popular: false,
  },
  {
    id: "1br-deluxe",
    name: "Beachfront Deluxe 1 Bedroom",
    tagline: "Lagoon Beachfront",
    price: "25,000",
    image: "/images/resort/malili-rooms/living-room-5-opt-pro.jpg",
    gallery: [
      "/images/resort/malili-rooms/living-room-5-opt-pro.jpg",
      "/images/resort/malili-rooms/queen-bed-2-opt-pro.jpg",
      "/images/resort/malili-rooms/living-kitchenette-opt-pro.jpg",
      "/images/resort/malili-rooms/swan-towel-artistic-opt-pro.jpg",
    ],
    description:
      "Set directly on the lagoon beachfront, this Deluxe Single Room features sweeping lagoon and island views, with kayaking just moments from your door.",
    guests: "Up to 2 Guests",
    bed: "1 Bedroom",
    popular: false,
  },
  {
    id: "1br-superior",
    name: "Lagoon View Superior 1 Bedroom",
    tagline: "Lagoon View",
    price: "22,000",
    image: "/images/resort/malili-rooms/bungalow-patio-1-opt-pro.jpg",
    gallery: [
      "/images/resort/malili-rooms/bungalow-patio-1-opt-pro.jpg",
      "/images/resort/malili-rooms/living-room-1-opt-pro.jpg",
      "/images/resort/malili-rooms/queen-bed-3-opt-pro.jpg",
      "/images/resort/malili-rooms/amenities-tray-opt-pro.jpg",
    ],
    description:
      "Our one-bedroom back-row bungalow is tucked among lush flowers, offering a peaceful and private retreat surrounded by natural beauty.",
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
                  href={`/book?room=${room.id}`}
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
