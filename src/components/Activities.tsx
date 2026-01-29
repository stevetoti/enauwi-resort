"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Waves,
  TreePalm,
  Ship,
  Fish,
  Mountain,
  Sailboat,
  Clock,
  ArrowRight,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const activities = [
  {
    icon: Waves,
    title: "Snorkeling & Diving",
    slug: "snorkeling-diving",
    description:
      "Explore vibrant coral reefs teeming with tropical fish, sea turtles, and colourful marine life in Malekula's crystal-clear waters.",
    image:
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80",
    duration: "2-3 hours",
    tag: "Most Popular",
  },
  {
    icon: TreePalm,
    title: "Cultural Village Tour",
    slug: "cultural-village-tour",
    description:
      "Visit traditional kastom villages and experience ancient Melanesian customs, sand drawings, and ceremonial dances unique to Malekula.",
    image:
      "https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=800&q=80",
    duration: "Half day",
    tag: "Cultural",
  },
  {
    icon: Ship,
    title: "Island Hopping",
    slug: "island-hopping",
    description:
      "Cruise to neighbouring islands and discover secluded beaches, hidden caves, and breathtaking volcanic landscapes across the archipelago.",
    image:
      "https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=800&q=80",
    duration: "Full day",
    tag: "Adventure",
  },
  {
    icon: Fish,
    title: "Sport Fishing",
    slug: "sport-fishing",
    description:
      "Cast your line into deep Pacific waters for marlin, tuna, and mahi-mahi with our experienced local fishing guides.",
    image:
      "https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=800&q=80",
    duration: "4-6 hours",
    tag: "Sport",
  },
  {
    icon: Mountain,
    title: "Rainforest Hiking",
    slug: "jungle-trek",
    description:
      "Trek through lush tropical rainforest to hidden waterfalls, ancient banyan trees, and stunning panoramic island viewpoints.",
    image:
      "https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=800&q=80",
    duration: "3-5 hours",
    tag: "Nature",
  },
  {
    icon: Sailboat,
    title: "Ocean Kayaking",
    slug: "sunset-kayaking",
    description:
      "Paddle along the stunning coastline, exploring mangrove channels, sea caves, and pristine lagoons at your own pace.",
    image:
      "https://images.unsplash.com/photo-1472745942893-4b9f730c7668?w=800&q=80",
    duration: "2-3 hours",
    tag: "Relaxation",
  },
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
            Island{" "}
            <span className="text-gold-gradient">Adventures</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="section-subheading"
          >
            From thrilling ocean adventures to peaceful cultural experiences,
            Malekula Island offers something extraordinary for every traveller.
          </motion.p>
        </div>

        {/* Activity Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {activities.map((activity, idx) => (
            <motion.div
              key={activity.title}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 + idx * 0.1 }}
            >
              <Link
                href={`/activities/${activity.slug}`}
                className="group relative rounded-3xl overflow-hidden cursor-pointer shadow-lg shadow-ocean/5 hover:shadow-2xl hover:shadow-ocean/15 transition-all duration-500 hover:-translate-y-2 block"
              >
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

                  {/* Duration */}
                  <div className="absolute top-4 right-4 flex items-center gap-1 px-3 py-1 bg-black/30 backdrop-blur-md text-white/80 text-xs rounded-full">
                    <Clock size={10} />
                    {activity.duration}
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

                    <p className="text-white/70 text-sm leading-relaxed mb-4">
                      {activity.description}
                    </p>

                    <div className="flex items-center gap-2 text-gold-light text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
                      Learn More <ArrowRight size={14} />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

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
            Book an Experience
            <ArrowRight size={16} />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
