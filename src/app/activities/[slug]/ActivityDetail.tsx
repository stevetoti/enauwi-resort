'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Clock,
  Users,
  TrendingUp,
  DollarSign,
  CheckCircle,
  Backpack,
  Sun,
  ShieldCheck,
  ArrowRight,
  Phone,
} from 'lucide-react'
import { Activity, getRelatedActivities } from '@/data/activities'

export default function ActivityDetail({ activity }: { activity: Activity }) {
  const [selectedImage, setSelectedImage] = useState(0)
  const allImages = [activity.heroImage, ...activity.gallery]
  const related = getRelatedActivities(activity.related)

  return (
    <div className="min-h-screen bg-sand-light">
      {/* Hero */}
      <div className="relative h-[60vh] min-h-[400px]">
        <Image
          src={allImages[selectedImage]}
          alt={activity.title}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ocean-dark/90 via-ocean-dark/40 to-ocean-dark/20" />

        {/* Back button */}
        <div className="absolute top-6 left-6 z-10">
          <Link
            href="/#activities"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 backdrop-blur-md text-white rounded-full border border-white/20 hover:bg-white/20 transition-all text-sm font-medium"
          >
            <ArrowLeft size={16} />
            Back to Activities
          </Link>
        </div>

        {/* Hero Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 lg:p-16">
          <div className="max-w-7xl mx-auto">
            <span className="inline-block px-3 py-1 bg-gold/80 text-ocean-dark text-xs font-bold rounded-full mb-4 uppercase tracking-wider">
              {activity.tag}
            </span>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-3"
            >
              {activity.title}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-white/80 text-lg sm:text-xl max-w-2xl"
            >
              {activity.tagline}
            </motion.p>
          </div>
        </div>
      </div>

      {/* Gallery Thumbnails */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-10">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {allImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedImage(idx)}
              className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                selectedImage === idx
                  ? 'border-gold shadow-lg scale-105'
                  : 'border-white/50 opacity-70 hover:opacity-100'
              }`}
            >
              <Image src={img} alt="" fill className="object-cover" sizes="96px" />
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-10">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-10">
            {/* Quick Info Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: Clock, label: 'Duration', value: activity.duration },
                { icon: TrendingUp, label: 'Difficulty', value: activity.difficulty },
                { icon: Users, label: 'Group Size', value: activity.groupSize },
                { icon: DollarSign, label: 'Price', value: activity.price },
              ].map((item) => (
                <div
                  key={item.label}
                  className="bg-white rounded-2xl p-4 text-center shadow-sm border border-gray-100"
                >
                  <item.icon size={20} className="mx-auto mb-2 text-ocean" />
                  <p className="text-xs text-gray-500 mb-1">{item.label}</p>
                  <p className="font-semibold text-ocean-dark text-sm">{item.value}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
              <h2 className="font-serif text-2xl font-bold text-ocean-dark mb-4">
                About This Experience
              </h2>
              {activity.description.split('\n\n').map((para, idx) => (
                <p key={idx} className="text-gray-600 leading-relaxed mb-4 last:mb-0">
                  {para}
                </p>
              ))}
            </div>

            {/* Highlights */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
              <h2 className="font-serif text-2xl font-bold text-ocean-dark mb-4">
                Highlights
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {activity.highlights.map((h, idx) => (
                  <div
                    key={idx}
                    className="bg-gold/5 rounded-xl p-4 text-ocean-dark font-medium text-sm"
                  >
                    {h}
                  </div>
                ))}
              </div>
            </div>

            {/* What to Expect */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
              <h2 className="font-serif text-2xl font-bold text-ocean-dark mb-4">
                What to Expect
              </h2>
              <ul className="space-y-3">
                {activity.whatToExpect.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircle size={18} className="text-green-light mt-0.5 shrink-0" />
                    <span className="text-gray-600">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* What's Included */}
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
                <h3 className="font-serif text-xl font-bold text-ocean-dark mb-4 flex items-center gap-2">
                  <CheckCircle size={20} className="text-green-light" />
                  What&apos;s Included
                </h3>
                <ul className="space-y-2">
                  {activity.included.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-600 text-sm">
                      <span className="text-green-light mt-1">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
                <h3 className="font-serif text-xl font-bold text-ocean-dark mb-4 flex items-center gap-2">
                  <Backpack size={20} className="text-ocean" />
                  What to Bring
                </h3>
                <ul className="space-y-2">
                  {activity.whatToBring.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-600 text-sm">
                      <span className="text-ocean mt-1">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Best Time & Safety */}
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="bg-ocean-50 rounded-3xl p-6 sm:p-8 border border-ocean-100">
                <h3 className="font-serif text-lg font-bold text-ocean-dark mb-3 flex items-center gap-2">
                  <Sun size={18} className="text-gold" />
                  Best Time
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">{activity.bestTime}</p>
              </div>

              <div className="bg-ocean-50 rounded-3xl p-6 sm:p-8 border border-ocean-100">
                <h3 className="font-serif text-lg font-bold text-ocean-dark mb-3 flex items-center gap-2">
                  <ShieldCheck size={18} className="text-green-light" />
                  Safety Info
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">{activity.safety}</p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Booking Card */}
              <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
                <div className="text-center mb-6">
                  <p className="text-sm text-gray-500 mb-1">Starting from</p>
                  <p className="font-serif text-3xl font-bold text-ocean-dark">
                    {activity.price}
                  </p>
                  <p className="text-xs text-gray-400">per person</p>
                </div>

                <Link
                  href={`/book?activity=${activity.slug}`}
                  className="block w-full text-center py-4 bg-gold hover:bg-gold-light text-ocean-dark font-bold rounded-xl transition-all duration-300 shadow-lg shadow-gold/20 hover:shadow-xl hover:shadow-gold/30 hover:scale-[1.02] active:scale-[0.98] mb-3"
                >
                  Book This Activity
                </Link>

                <a
                  href="tel:+67822170"
                  className="flex items-center justify-center gap-2 w-full py-3 border-2 border-ocean/20 text-ocean font-semibold rounded-xl hover:bg-ocean-50 transition-all text-sm"
                >
                  <Phone size={16} />
                  Call +678 22170
                </a>

                <p className="text-center text-gray-400 text-xs mt-3">
                  Free cancellation up to 24h before
                </p>
              </div>

              {/* Quick Info */}
              <div className="bg-ocean-dark rounded-3xl p-6 text-white">
                <h3 className="font-serif text-lg font-bold mb-4">Quick Info</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/60">Duration</span>
                    <span className="font-medium">{activity.duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Difficulty</span>
                    <span className="font-medium">{activity.difficulty}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Group Size</span>
                    <span className="font-medium">{activity.groupSize}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Price</span>
                    <span className="font-medium text-gold-light">{activity.price}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Activities */}
        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="font-serif text-3xl font-bold text-ocean-dark mb-8">
              You Might Also Enjoy
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((rel) => (
                <Link
                  key={rel.slug}
                  href={`/activities/${rel.slug}`}
                  className="group relative rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
                >
                  <div className="relative h-64">
                    <Image
                      src={rel.heroImage}
                      alt={rel.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ocean-dark/90 via-ocean-dark/40 to-transparent" />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-medium rounded-full border border-white/20">
                        {rel.tag}
                      </span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h3 className="font-serif text-xl font-bold text-white mb-1">
                        {rel.title}
                      </h3>
                      <p className="text-white/70 text-sm mb-3">{rel.tagline}</p>
                      <span className="text-gold-light text-sm font-medium flex items-center gap-1">
                        Learn More <ArrowRight size={14} />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
