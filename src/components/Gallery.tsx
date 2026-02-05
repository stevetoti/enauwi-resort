"use client";

import { useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Camera, ZoomIn } from "lucide-react";
import Image from "next/image";

/**
 * GALLERY PHOTOS
 * ─────────────────────────────────────────────────────────────────
 * When the 22 professional drone/resort photos arrive from Dropbox:
 *
 * 1. Upload them to Supabase Storage:
 *      bucket: "gallery" (create it first)
 *      URL pattern: https://jfiqbifwueoyqtajbhed.supabase.co/storage/v1/object/public/gallery/FILENAME
 *
 * 2. Or upload to /public/gallery/ in this project and reference as:
 *      /gallery/drone-shot-1.jpg
 *
 * 3. Replace the Unsplash URLs below with the real URLs.
 *    Keep the same category/span structure.
 *
 * TIP: Use span "col-span-2 row-span-2" for hero/drone shots,
 *      "col-span-2" for wide shots, "" for standard squares.
 * ─────────────────────────────────────────────────────────────────
 */
const photos = [
  {
    src: "/images/resort/resort-lagoon-aerial.jpg",
    alt: "E'Nauwi Beach Resort aerial view — lagoon with kayaker and bungalows",
    category: "Resort",
    span: "col-span-2 row-span-2",
  },
  {
    src: "/images/resort/beach-kayaks-cove-sm.jpg",
    alt: "Beach cove with colourful kayaks at E'Nauwi",
    category: "Beach",
    span: "",
  },
  {
    src: "/images/resort/resort-buildings-aerial-sm.jpg",
    alt: "Bungalows and resort buildings from above",
    category: "Rooms",
    span: "",
  },
  {
    src: "/images/resort/resort-coral-reef-sm.jpg",
    alt: "Resort buildings and coral reef lagoon",
    category: "Resort",
    span: "",
  },
  {
    src: "/images/resort/lagoon-island-view.jpg",
    alt: "Lagoon and island views from the resort",
    category: "Island",
    span: "col-span-2",
  },
  {
    src: "/images/resort/wedding-beach-couple-sm.jpg",
    alt: "Wedding couple on the beach at E'Nauwi",
    category: "Events",
    span: "",
  },
  {
    src: "/images/resort/resort-lagoon-kayak-sm.jpg",
    alt: "Kayaking on the lagoon at E'Nauwi Beach Resort",
    category: "Activities",
    span: "",
  },
  {
    src: "/images/resort/private-island-sandbar-sm.jpg",
    alt: "Private island sandbar with turquoise waters",
    category: "Island",
    span: "",
  },
  {
    src: "/images/resort/beach-resort-overview-sm.jpg",
    alt: "Beach overview with kayaks and bungalows",
    category: "Beach",
    span: "",
  },
  {
    src: "/images/resort/beach-resort-overview.jpg",
    alt: "E'Nauwi Beach Resort panoramic view — beach, kayaks and palm trees",
    category: "Resort",
    span: "col-span-2",
  },
];

export default function Gallery() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const openLightbox = (idx: number) => setLightboxIndex(idx);
  const closeLightbox = () => setLightboxIndex(null);
  const prev = () =>
    setLightboxIndex((i) => (i !== null ? (i - 1 + photos.length) % photos.length : null));
  const next = () =>
    setLightboxIndex((i) => (i !== null ? (i + 1) % photos.length : null));

  return (
    <section id="gallery" className="relative bg-ocean-dark overflow-hidden">
      <div className="section-padding max-w-7xl mx-auto" ref={ref}>
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 rounded-full mb-6"
          >
            <Camera size={14} className="text-gold-light" />
            <span className="text-white/70 text-sm font-medium uppercase tracking-wider">
              Gallery
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4"
          >
            Capture the{" "}
            <span className="text-gold-light">Beauty</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-white/60 text-lg max-w-2xl mx-auto"
          >
            A glimpse of what awaits you at E&apos;Nauwi Beach Resort — where every
            moment is picture-perfect.
          </motion.p>
        </div>

        {/* Photo Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {photos.map((photo, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.2 + idx * 0.07 }}
              className={`group relative overflow-hidden rounded-2xl cursor-pointer ${photo.span} ${
                !photo.span ? "aspect-square" : ""
              }`}
              onClick={() => openLightbox(idx)}
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-ocean-dark/0 group-hover:bg-ocean-dark/50 transition-all duration-500 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 text-center">
                  <ZoomIn size={28} className="text-white mx-auto mb-2" />
                  <span className="text-white/80 text-xs font-medium uppercase tracking-wider">
                    {photo.category}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lightbox-overlay"
            onClick={closeLightbox}
          >
            <button
              onClick={closeLightbox}
              className="absolute top-6 right-6 z-50 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-colors border border-white/20"
            >
              <X size={20} />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
              className="absolute left-4 sm:left-8 z-50 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-colors border border-white/20"
            >
              <ChevronLeft size={20} />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
              className="absolute right-4 sm:right-8 z-50 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-colors border border-white/20"
            >
              <ChevronRight size={20} />
            </button>

            <motion.div
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="relative w-[90vw] h-[80vh] max-w-6xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={photos[lightboxIndex].src}
                alt={photos[lightboxIndex].alt}
                fill
                className="object-contain"
                sizes="90vw"
              />
            </motion.div>

            {/* Caption */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center">
              <p className="text-white/80 text-sm font-medium">
                {photos[lightboxIndex].alt}
              </p>
              <p className="text-white/40 text-xs mt-1">
                {lightboxIndex + 1} / {photos.length}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
