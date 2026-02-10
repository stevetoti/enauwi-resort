'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Building2,
  UtensilsCrossed,
  Waves,
  Truck,
  Wifi,
  Monitor,
  Presentation,
  Volume2,
  Coffee,
  Droplets,
  Wind,
  Pen,
  CheckCircle,
  Calendar,
  Phone,
  Mail,
  ChevronRight,
} from 'lucide-react'
import { Service } from '@/types'
import { formatVatu } from '@/lib/utils'

/* ─── PLACEHOLDER PRICE MARKER ─── */
// All prices marked with is_placeholder_price=true in the database
// are placeholders and will be updated with real pricing later.
// The UI shows "Indicative pricing" for these items.

const CATEGORY_CONFIG: Record<string, { label: string; icon: React.ReactNode; description: string }> = {
  food_beverage: {
    label: 'Food & Beverage',
    icon: <UtensilsCrossed className="h-6 w-6" />,
    description: 'Delicious meals and refreshments delivered to your room or enjoyed at our restaurant.',
  },
  activities: {
    label: 'Activities & Adventures',
    icon: <Waves className="h-6 w-6" />,
    description: 'Explore the beauty of Efate Island with our curated activities and excursions.',
  },
  other_services: {
    label: 'Guest Services',
    icon: <Truck className="h-6 w-6" />,
    description: 'Everything you need for a comfortable and convenient stay.',
  },
}

const CONFERENCE_AMENITY_ICONS: Record<string, React.ReactNode> = {
  'Wi-Fi': <Wifi className="h-4 w-4" />,
  'TV screen': <Monitor className="h-4 w-4" />,
  'Projector + screen': <Presentation className="h-4 w-4" />,
  'PA System': <Volume2 className="h-4 w-4" />,
  'Morning Tea': <Coffee className="h-4 w-4" />,
  'Water Bottles': <Droplets className="h-4 w-4" />,
  'Portable air coolers': <Wind className="h-4 w-4" />,
  'Pens (first day)': <Pen className="h-4 w-4" />,
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [showConferenceForm, setShowConferenceForm] = useState(false)

  const fetchServices = useCallback(async () => {
    try {
      const response = await fetch('/api/services')
      const data = await response.json()
      if (data.services) {
        setServices(data.services)
      }
    } catch (error) {
      console.error('Error fetching services:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchServices()
  }, [fetchServices])

  const conferenceServices = services.filter((s) => s.category === 'conference')
  const otherCategories = ['food_beverage', 'activities', 'other_services']

  if (loading) {
    return (
      <div className="min-h-screen bg-sand flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-ocean"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-sand">
      {/* Header */}
      <div className="bg-ocean-dark text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-ocean-100 hover:text-white mb-6 text-sm transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to E&apos;Nauwi Beach Resort
          </Link>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold mb-4">
            Services & Experiences
          </h1>
          <p className="text-ocean-100 text-lg max-w-2xl">
            From conference facilities to island adventures, we offer everything
            you need for an exceptional stay on Efate Island.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Conference Room Section */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-ocean/10 rounded-lg text-ocean">
              <Building2 className="h-6 w-6" />
            </div>
            <h2 className="font-serif text-3xl font-bold text-ocean">Conference Room</h2>
          </div>
          <p className="text-ocean/60 text-lg mb-8 max-w-2xl">
            Professional meeting space perfect for corporate retreats, workshops, and events
            in a stunning island setting.
          </p>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Conference Info Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-ocean/5 overflow-hidden">
              {/* Header Image Placeholder */}
              <div className="h-48 bg-gradient-to-br from-ocean to-ocean-light flex items-center justify-center">
                <div className="text-center text-white">
                  <Building2 className="h-16 w-16 mx-auto mb-2 opacity-80" />
                  <p className="font-serif text-xl font-bold">Conference Room</p>
                  <p className="text-sm text-white/70">E&apos;Nauwi Beach Resort</p>
                </div>
              </div>

              <div className="p-6">
                <h3 className="font-serif text-xl font-bold text-ocean mb-4">Included Amenities</h3>
                <div className="grid grid-cols-2 gap-3">
                  {conferenceServices[0]?.amenities?.map((amenity, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-ocean/70">
                      <div className="text-ocean/50">
                        {CONFERENCE_AMENITY_ICONS[amenity] || <CheckCircle className="h-4 w-4" />}
                      </div>
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Pricing & Booking Card */}
            <div className="space-y-6">
              {/* Pricing Cards */}
              {conferenceServices.map((service) => (
                <div
                  key={service.id}
                  className="bg-white rounded-2xl shadow-sm border border-ocean/5 p-6"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-serif text-lg font-bold text-ocean">{service.name}</h4>
                      <p className="text-sm text-ocean/50">{service.description}</p>
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-3xl font-bold text-ocean">
                      {formatVatu(service.unit_price)}
                    </span>
                    <span className="text-sm text-ocean/40">/{service.price_unit}</span>
                  </div>
                  {/* PLACEHOLDER PRICE INDICATOR */}
                  {service.is_placeholder_price && (
                    <p className="text-xs text-gold-dark bg-gold/10 inline-block px-2 py-1 rounded-full">
                      ✦ Indicative pricing — contact us for a quote
                    </p>
                  )}
                </div>
              ))}

              {/* Book Conference Button */}
              <button
                onClick={() => setShowConferenceForm(true)}
                className="w-full bg-ocean text-white py-4 px-6 rounded-2xl font-semibold text-lg hover:bg-ocean-light transition-colors shadow-lg shadow-ocean/20 flex items-center justify-center gap-2"
              >
                <Calendar className="h-5 w-5" />
                Inquire About Conference Booking
              </button>

              <p className="text-xs text-ocean/40 text-center">
                Our team will respond within 24 hours to confirm availability and pricing.
              </p>
            </div>
          </div>
        </section>

        {/* Guest Services Sections */}
        {otherCategories.map((catKey) => {
          const config = CATEGORY_CONFIG[catKey]
          const catServices = services.filter((s) => s.category === catKey)
          if (!config || catServices.length === 0) return null

          return (
            <section key={catKey} className="mb-16">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-ocean/10 rounded-lg text-ocean">{config.icon}</div>
                <h2 className="font-serif text-3xl font-bold text-ocean">{config.label}</h2>
              </div>
              <p className="text-ocean/60 text-lg mb-8 max-w-2xl">{config.description}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {catServices.map((service) => (
                  <div
                    key={service.id}
                    className="bg-white rounded-2xl shadow-sm border border-ocean/5 p-6 hover:shadow-md transition-shadow"
                  >
                    <h4 className="font-serif text-lg font-bold text-ocean mb-2">{service.name}</h4>
                    {service.description && (
                      <p className="text-sm text-ocean/50 mb-4">{service.description}</p>
                    )}
                    <div className="flex items-baseline gap-2">
                      {service.unit_price === 0 ? (
                        <span className="text-lg font-bold text-green">Complimentary</span>
                      ) : (
                        <>
                          <span className="text-2xl font-bold text-ocean">
                            {formatVatu(service.unit_price)}
                          </span>
                          <span className="text-sm text-ocean/40">/{service.price_unit}</span>
                        </>
                      )}
                    </div>
                    {/* PLACEHOLDER PRICE INDICATOR */}
                    {service.is_placeholder_price && service.unit_price > 0 && (
                      <p className="text-xs text-gold-dark bg-gold/10 inline-block px-2 py-1 rounded-full mt-2">
                        ✦ Indicative pricing
                      </p>
                    )}
                    {service.notes && service.notes !== 'PLACEHOLDER PRICE' && !service.notes.startsWith('PLACEHOLDER') && (
                      <p className="text-xs text-ocean/40 mt-2">{service.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )
        })}

        {/* Contact CTA */}
        <section className="bg-white rounded-2xl shadow-sm border border-ocean/5 p-8 sm:p-12 text-center">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-ocean mb-4">
            Need Something Special?
          </h2>
          <p className="text-ocean/60 mb-8 max-w-xl mx-auto">
            We&apos;re happy to accommodate special requests. Contact our team and we&apos;ll
            do our best to make your stay perfect.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:+67822170"
              className="inline-flex items-center gap-2 bg-ocean text-white px-6 py-3 rounded-xl font-semibold hover:bg-ocean-light transition-colors"
            >
              <Phone className="h-4 w-4" />
              +678 22170
            </a>
            <a
              href="mailto:gm@enauwibeachresort.com"
              className="inline-flex items-center gap-2 border-2 border-ocean text-ocean px-6 py-3 rounded-xl font-semibold hover:bg-ocean/5 transition-colors"
            >
              <Mail className="h-4 w-4" />
              Email Us
            </a>
            <Link
              href="/book"
              className="inline-flex items-center gap-2 bg-gold text-ocean-dark px-6 py-3 rounded-xl font-semibold hover:bg-gold-light transition-colors"
            >
              Book Your Stay
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        <div className="mt-8 text-center">
          <p className="text-xs text-ocean/30">
            ✦ Items marked with &quot;Indicative pricing&quot; are approximate — final prices confirmed at booking.
          </p>
        </div>
      </div>

      {/* Conference Booking Form Modal */}
      {showConferenceForm && (
        <ConferenceBookingModal onClose={() => setShowConferenceForm(false)} />
      )}
    </div>
  )
}

function ConferenceBookingModal({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    bookingDate: '',
    bookingType: 'full_day',
    startTime: '08:00',
    endTime: '17:00',
    numberOfAttendees: 10,
    specialRequirements: '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  // Set default date to tomorrow
  useEffect(() => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    setFormData((prev) => ({
      ...prev,
      bookingDate: tomorrow.toISOString().split('T')[0],
    }))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/services/conference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.error) {
        alert('Error: ' + data.error)
        return
      }

      setSuccess(true)
    } catch (error) {
      console.error('Error submitting conference booking:', error)
      alert('Failed to submit booking. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-light/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green" />
            </div>
            <h3 className="font-serif text-xl font-bold text-ocean mb-2">Inquiry Submitted!</h3>
            <p className="text-ocean/60 mb-6">
              Thank you for your interest in our conference room. Our team will review your
              request and contact you within 24 hours to confirm availability and pricing.
            </p>
            <button
              onClick={onClose}
              className="w-full bg-ocean text-white py-3 px-4 rounded-xl hover:bg-ocean-light font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="font-serif text-xl font-bold text-ocean">Conference Room Inquiry</h3>
            <p className="text-sm text-ocean/50">Fill in the details and we&apos;ll get back to you</p>
          </div>
          <button onClick={onClose} className="text-ocean/30 hover:text-ocean transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Contact Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ocean/70 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={formData.contactName}
                onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                className="w-full px-3 py-2 border border-ocean/10 rounded-xl focus:ring-2 focus:ring-ocean/20 focus:border-ocean/30 transition-all text-ocean"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ocean/70 mb-1">Phone</label>
              <input
                type="tel"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                className="w-full px-3 py-2 border border-ocean/10 rounded-xl focus:ring-2 focus:ring-ocean/20 focus:border-ocean/30 transition-all text-ocean"
                placeholder="+678 123 4567"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-ocean/70 mb-1">Email Address *</label>
            <input
              type="email"
              required
              value={formData.contactEmail}
              onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
              className="w-full px-3 py-2 border border-ocean/10 rounded-xl focus:ring-2 focus:ring-ocean/20 focus:border-ocean/30 transition-all text-ocean"
              placeholder="your.email@example.com"
            />
          </div>

          {/* Booking Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ocean/70 mb-1">Event Date *</label>
              <input
                type="date"
                required
                value={formData.bookingDate}
                onChange={(e) => setFormData({ ...formData, bookingDate: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-ocean/10 rounded-xl focus:ring-2 focus:ring-ocean/20 focus:border-ocean/30 transition-all text-ocean"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ocean/70 mb-1">Booking Type *</label>
              <select
                value={formData.bookingType}
                onChange={(e) => {
                  const type = e.target.value
                  setFormData({
                    ...formData,
                    bookingType: type,
                    startTime: type === 'half_day' ? '08:00' : '08:00',
                    endTime: type === 'half_day' ? '12:00' : '17:00',
                  })
                }}
                className="w-full px-3 py-2 border border-ocean/10 rounded-xl focus:ring-2 focus:ring-ocean/20 focus:border-ocean/30 transition-all text-ocean"
              >
                {/* PLACEHOLDER PRICES shown here */}
                <option value="half_day">Half Day (VT 25,000*)</option>
                <option value="full_day">Full Day (VT 45,000*)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-ocean/70 mb-1">Start Time</label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-3 py-2 border border-ocean/10 rounded-xl focus:ring-2 focus:ring-ocean/20 focus:border-ocean/30 transition-all text-ocean"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ocean/70 mb-1">End Time</label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-3 py-2 border border-ocean/10 rounded-xl focus:ring-2 focus:ring-ocean/20 focus:border-ocean/30 transition-all text-ocean"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ocean/70 mb-1">Attendees</label>
              <input
                type="number"
                min={1}
                max={100}
                value={formData.numberOfAttendees}
                onChange={(e) =>
                  setFormData({ ...formData, numberOfAttendees: parseInt(e.target.value) || 1 })
                }
                className="w-full px-3 py-2 border border-ocean/10 rounded-xl focus:ring-2 focus:ring-ocean/20 focus:border-ocean/30 transition-all text-ocean"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-ocean/70 mb-1">
              Special Requirements
            </label>
            <textarea
              value={formData.specialRequirements}
              onChange={(e) => setFormData({ ...formData, specialRequirements: e.target.value })}
              className="w-full px-3 py-2 border border-ocean/10 rounded-xl focus:ring-2 focus:ring-ocean/20 focus:border-ocean/30 transition-all text-ocean resize-none"
              rows={3}
              placeholder="Dietary requirements, equipment needs, seating arrangement preferences..."
            />
          </div>

          <p className="text-xs text-ocean/40">
            * Prices are indicative. Final pricing will be confirmed by our team.
          </p>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-ocean/10 text-ocean/70 rounded-xl hover:bg-ocean/5 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-ocean text-white py-3 px-4 rounded-xl hover:bg-ocean-light disabled:bg-ocean/30 font-semibold transition-colors shadow-lg shadow-ocean/20"
            >
              {loading ? 'Submitting...' : 'Submit Inquiry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
