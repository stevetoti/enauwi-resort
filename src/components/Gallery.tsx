"use client";

import { useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Camera, ZoomIn } from "lucide-react";
import Image from "next/image";

const photos = [
  {
    src: "https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=1200&q=80",
    alt: "Tropical sunset with palm trees",
    category: "Resort",
    span: "col-span-2 row-span-2",
  },
  {
    src: "https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=800&q=80",
    alt: "Crystal clear beach waters",
    category: "Beach",
    span: "",
  },
  {
    src: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80",
    alt: "Luxury resort room interior",
    category: "Rooms",
    span: "",
  },
  {
    src: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80",
    alt: "Snorkeling in coral reefs",
    category: "Activities",
    span: "",
  },
  {
    src: "https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=1200&q=80",
    alt: "Aerial view of tropical island",
    category: "Island",
    span: "col-span-2",
  },
  {
    src: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
    alt: "Fine dining experience",
    category: "Dining",
    span: "",
  },
  {
    src: "https://images.unsplash.com/photo-1472745942893-4b9f730c7668?w=800&q=80",
    alt: "Ocean kayaking adventure",
    category: "Activities",
    span: "",
  },
  {
    src: "https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=800&q=80",
    alt: "Relaxing hammock by the beach",
    category: "Relaxation",
    span: "",
  },
  {
    src: "https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800&q=80",
    alt: "Beachfront bungalow",
    category: "Rooms",
    span: "",
  },
  {
    src: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=80",
    alt: "Resort pool and ocean view",
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
