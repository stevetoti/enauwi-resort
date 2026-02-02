"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Wine,
  Sofa,
  Baby,
  ConciergeBell,
  Bus,
  Volleyball,
  Wifi,
  ParkingCircle,
  TreePalm,
  WashingMachine,
  Shirt,
  Users,
  UtensilsCrossed,
  Waves,
  Projector,
  Mic,
  Coffee,
  Droplets,
  PenTool,
  Candy,
  Tv,
  Wind,
  Star,
} from "lucide-react";

const resortFeatures = [
  { icon: Wine, label: "Bar" },
  { icon: Sofa, label: "Lounge Area" },
  { icon: Baby, label: "Children Play Area", detail: "Jumping Castle, TV screen corner for movies & cartoons" },
  { icon: ConciergeBell, label: "Room Service", detail: "With charge" },
  { icon: Bus, label: "Shuttle Service" },
  { icon: Volleyball, label: "Beach Volleyball Area" },
  { icon: Wifi, label: "Wi-Fi" },
  { icon: ParkingCircle, label: "Parking" },
  { icon: TreePalm, label: "Garden" },
  { icon: WashingMachine, label: "Guest Laundry", detail: "Charges apply" },
  { icon: Shirt, label: "Iron on request" },
  { icon: Users, label: "Kids Club" },
  { icon: UtensilsCrossed, label: "On-site Restaurant" },
  { icon: Waves, label: "Outdoor Swimming Pool" },
];

const conferenceFeatures = [
  { icon: Wifi, label: "Wi-Fi" },
  { icon: Coffee, label: "Morning Tea, Lunch, Afternoon Tea & Dinner", detail: "Buffet" },
  { icon: Droplets, label: "Water Bottles" },
  { icon: Star, label: "Enclosed Area" },
  { icon: Wind, label: "Portable air coolers" },
  { icon: Candy, label: "Mints provided" },
  { icon: PenTool, label: "Pens provided at first day" },
  { icon: Mic, label: "PA System" },
  { icon: PenTool, label: "Whiteboard with markers" },
  { icon: Projector, label: "Projector & Projector screen" },
  { icon: Tv, label: "TV screen" },
];

export default function ResortFeatures() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="features" className="relative bg-gradient-to-b from-white to-ocean/5 overflow-hidden">
      <div className="section-padding max-w-7xl mx-auto" ref={ref}>
        {/* Section Header */}
        <div className="text-center mb-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-ocean/5 rounded-full mb-6"
          >
            <Star size={14} className="text-ocean" />
            <span className="text-ocean/70 text-sm font-medium uppercase tracking-wider">
              Resort Amenities
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="section-heading"
          >
            Everything You{" "}
            <span className="text-gold-gradient">Need</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="section-subheading"
          >
            From family-friendly play areas to a relaxing poolside bar, our resort
            offers all the amenities for a perfect island stay.
          </motion.p>
        </div>

        {/* Resort Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-16"
        >
          {resortFeatures.map((feature) => (
            <div
              key={feature.label}
              className="group bg-white rounded-2xl p-5 shadow-sm border border-ocean/5 hover:shadow-md hover:border-ocean/15 transition-all duration-300 hover:-translate-y-1 text-center"
            >
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-ocean/5 flex items-center justify-center group-hover:bg-ocean/10 transition-colors">
                <feature.icon size={22} className="text-ocean/70" />
              </div>
              <h4 className="font-semibold text-ocean text-sm">{feature.label}</h4>
              {feature.detail && (
                <p className="text-ocean/40 text-xs mt-1">{feature.detail}</p>
              )}
            </div>
          ))}
        </motion.div>

        {/* Conference Facilities */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="bg-ocean-dark rounded-3xl p-8 sm:p-10"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 rounded-full mb-4">
              <Projector size={14} className="text-gold-light" />
              <span className="text-white/70 text-sm font-medium uppercase tracking-wider">
                Conference Facilities
              </span>
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white mb-3">
              Host Your Event in{" "}
              <span className="text-gold-light">Paradise</span>
            </h3>
            <p className="text-white/50 text-sm max-w-xl mx-auto">
              E&apos;Nauwi offers a fully equipped conference space ideal for
              corporate retreats, workshops, and team-building events on the island.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {conferenceFeatures.map((feature) => (
              <div
                key={feature.label}
                className="flex items-center gap-2 text-white/60 text-sm bg-white/5 rounded-xl p-3 border border-white/5"
              >
                <feature.icon size={16} className="text-gold/60 shrink-0" />
                <span>
                  {feature.label}
                  {feature.detail && (
                    <span className="text-white/30 text-xs ml-1">({feature.detail})</span>
                  )}
                </span>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <a
              href="mailto:marketing@enauwibeachresort.com"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gold text-ocean-dark rounded-xl font-semibold text-sm hover:bg-gold-light transition-all duration-300 shadow-lg shadow-gold/20"
            >
              Enquire About Conference Bookings
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
