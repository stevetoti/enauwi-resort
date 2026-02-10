"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Waves,
  Sailboat,
  UtensilsCrossed,
  Wine,
  Baby,
  Cake,
  Heart,
  Compass,
  ArrowRight,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const resortActivities = [
  {
    icon: Waves,
    title: "Swimming Pool",
    description:
      "Enjoy our outdoor pool nestled among coconut trees, overlooking the beach and just moments from the bar — ideal for relaxed family time and sunny afternoons.",
    image: "/images/resort/beach-resort-overview-sm.jpg",
    tag: "On-Site",
  },
  {
    icon: Sailboat,
    title: "Kayaking & Snorkeling",
    description:
      "Explore the lagoon by kayak and enjoy a gentle, relaxing way to experience the ocean. Ideal for sunny days and quiet moments on the water.",
    image: "/images/resort/beach-kayaks-cove-sm.jpg",
    tag: "Water Sports",
  },
  {
    icon: UtensilsCrossed,
    title: "Restaurant",
    description:
      "Our restaurant offers uninterrupted views toward the island and the still lagoon, with gentle, relaxing music creating a calm and enjoyable dining atmosphere.",
    image: "/images/resort/resort-coral-reef-sm.jpg",
    tag: "Dining",
  },
  {
    icon: Wine,
    title: "Bar",
    description:
      "Unwind with tropical cocktails and cold drinks at our on-site bar, perfectly positioned near the pool and beach for the ultimate island refreshment.",
    image: "/images/resort/resort-lagoon-aerial-sm.jpg",
    tag: "Dining",
  },
  {
    icon: Baby,
    title: "Kids Club",
    description:
      "Trampoline, jumping castle, and a fun daily schedule — 8am coloring & games, 10am treasure hunt, 1pm kayak adventure. Nanny service available 8am–8pm.",
    image: "/images/resort/lagoon-island-view-sm.jpg",
    tag: "Family",
  },
  {
    icon: Cake,
    title: "Birthday Celebrations",
    description:
      "Plan a surprise birthday — notify the resort a day before, and our pastry chef will bake a custom cake while staff serenade the birthday guest.",
    image: "/images/resort/private-island-sandbar-sm.jpg",
    tag: "Celebrations",
  },
  {
    icon: Heart,
    title: "Wedding Venue",
    description:
      "Say \u2018I do\u2019 in a beautiful beachfront setting with lagoon views and tropical gardens — the perfect backdrop for wedding ceremonies and photo shoots.",
    image: "/images/resort/wedding-beach-couple-sm.jpg",
    tag: "Events",
  },
];

const adventureLinks = [
  { title: "Snorkeling & Diving", slug: "snorkeling-diving" },
  { title: "Island Hopping", slug: "island-hopping" },
  { title: "Cultural Village Tour", slug: "cultural-village-tour" },
  { title: "Sport Fishing", slug: "sport-fishing" },
  { title: "Rainforest Hiking", slug: "jungle-trek" },
  { title: "Sunset Kayaking", slug: "sunset-kayaking" },
  { title: "Sand Drawing Experience", slug: "sand-drawing" },
  { title: "Cooking Class", slug: "cooking-class" },
];

export default function Activities() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="activities" className="relative overflow-hidden">
      <div className="section-padding max-w-7xl mx-auto" ref={ref}>
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-ocean/5 rounded-full mb-6"
          >
            <Waves size={14} className="text-ocean" />
            <span className="text-ocean/70 text-sm font-medium uppercase tracking-wider">
              Experiences
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="section-heading"
          >
            Resort{" "}
            <span className="text-gold-gradient">Experiences</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="section-subheading"
          >
            From poolside relaxation and lagoon kayaking to birthday celebrations
            and island adventures — there&apos;s something for everyone at E&apos;Nauwi.
          </motion.p>
        </div>

        {/* Resort Activity Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {resortActivities.map((activity, idx) => (
            <motion.div
              key={activity.title}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 + idx * 0.1 }}
            >
              <div className="group relative rounded-3xl overflow-hidden shadow-lg shadow-ocean/5 hover:shadow-2xl hover:shadow-ocean/15 transition-all duration-500 hover:-translate-y-2">
                {/* Image */}
                <div className="relative h-80">
                  <Image
                    src={activity.image}
                    alt={activity.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ocean-dark/90 via-ocean-dark/40 to-transparent" />

                  {/* Tag */}
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-medium rounded-full border border-white/20">
                      {activity.tag}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-gold/20 backdrop-blur-md flex items-center justify-center border border-gold/30">
                        <activity.icon size={18} className="text-gold-light" />
                      </div>
                      <h3 className="font-serif text-xl font-bold text-white">
                        {activity.title}
                      </h3>
                    </div>

                    <p className="text-white/70 text-sm leading-relaxed">
                      {activity.description}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Island Adventures Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.8 }}
          className="mt-16"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-ocean/5 rounded-full mb-4">
              <Compass size={14} className="text-ocean" />
              <span className="text-ocean/70 text-sm font-medium uppercase tracking-wider">
                Off-Site Adventures
              </span>
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-ocean mb-3">
              Explore{" "}
              <span className="text-gold-gradient">Efate Island</span>
            </h3>
            <p className="text-ocean/60 text-base max-w-2xl mx-auto">
              Guided excursions and island experiences available through the resort.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {adventureLinks.map((adv) => (
              <Link
                key={adv.slug}
                href={`/activities/${adv.slug}`}
                className="group flex items-center justify-between gap-3 px-5 py-4 bg-white rounded-2xl border border-ocean/10 hover:border-ocean/30 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
              >
                <span className="text-ocean font-medium text-sm group-hover:text-ocean-dark transition-colors">
                  {adv.title}
                </span>
                <ArrowRight
                  size={14}
                  className="text-ocean/30 group-hover:text-gold transition-colors shrink-0"
                />
              </Link>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 1 }}
          className="text-center mt-12"
        >
          <a
            href="#contact"
            className="inline-flex items-center gap-2 px-8 py-4 bg-ocean text-white rounded-full font-semibold hover:bg-ocean-light transition-all duration-300 shadow-lg shadow-ocean/20 hover:shadow-xl hover:shadow-ocean/30 hover:scale-105"
          >
            Enquire About Activities
            <ArrowRight size={16} />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
