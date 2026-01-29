"use client";

import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Send,
  User,
  Mail,
  Phone,
  Calendar,
  Users,
  Home,
  MessageSquare,
  CheckCircle,
  Sparkles,
} from "lucide-react";

export default function Contact() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    checkin: "",
    checkout: "",
    guests: "2",
    room: "",
    requests: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    // In production, this would send to an API
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <section id="contact" className="relative bg-ocean-dark overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gold/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-ocean-light/10 rounded-full blur-[120px]" />
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
            <Sparkles size={14} className="text-gold-light" />
            <span className="text-white/70 text-sm font-medium uppercase tracking-wider">
              Book Your Stay
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4"
          >
            Reserve Your{" "}
            <span className="text-gold-light">Paradise</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-white/60 text-lg max-w-2xl mx-auto"
          >
            Fill in your details below and our reservations team will confirm
            your booking within 24 hours.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="max-w-3xl mx-auto"
        >
          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16 bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green/20 flex items-center justify-center">
                <CheckCircle size={40} className="text-green-light" />
              </div>
              <h3 className="font-serif text-3xl font-bold text-white mb-3">
                Tankiu Tumas!
              </h3>
              <p className="text-white/60 text-lg max-w-md mx-auto mb-2">
                Your reservation request has been received. Our team will
                contact you within 24 hours to confirm your booking.
              </p>
              <p className="text-gold-light text-sm font-medium">
                We look forward to welcoming you to paradise.
              </p>
            </motion.div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-6 sm:p-10"
            >
              <div className="grid sm:grid-cols-2 gap-5">
                {/* Name */}
                <div className="relative">
                  <label className="block text-white/70 text-sm font-medium mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User
                      size={16}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
                    />
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Smith"
                      className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 transition-all"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail
                      size={16}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
                    />
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 transition-all"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone
                      size={16}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
                    />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+678 XXXX XXX"
                      className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 transition-all"
                    />
                  </div>
                </div>

                {/* Guests */}
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">
                    Number of Guests *
                  </label>
                  <div className="relative">
                    <Users
                      size={16}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
                    />
                    <select
                      name="guests"
                      required
                      value={formData.guests}
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 transition-all appearance-none"
                    >
                      <option value="1" className="bg-ocean-dark">1 Guest</option>
                      <option value="2" className="bg-ocean-dark">2 Guests</option>
                      <option value="3" className="bg-ocean-dark">3 Guests</option>
                      <option value="4" className="bg-ocean-dark">4 Guests</option>
                      <option value="5" className="bg-ocean-dark">5 Guests</option>
                      <option value="6" className="bg-ocean-dark">6+ Guests</option>
                    </select>
                  </div>
                </div>

                {/* Check-in */}
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">
                    Check-in Date *
                  </label>
                  <div className="relative">
                    <Calendar
                      size={16}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
                    />
                    <input
                      type="date"
                      name="checkin"
                      required
                      value={formData.checkin}
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 transition-all"
                    />
                  </div>
                </div>

                {/* Check-out */}
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">
                    Check-out Date *
                  </label>
                  <div className="relative">
                    <Calendar
                      size={16}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
                    />
                    <input
                      type="date"
                      name="checkout"
                      required
                      value={formData.checkout}
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 transition-all"
                    />
                  </div>
                </div>

                {/* Room Type */}
                <div className="sm:col-span-2">
                  <label className="block text-white/70 text-sm font-medium mb-2">
                    Room Type *
                  </label>
                  <div className="relative">
                    <Home
                      size={16}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
                    />
                    <select
                      name="room"
                      required
                      value={formData.room}
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 transition-all appearance-none"
                    >
                      <option value="" disabled className="bg-ocean-dark">
                        Select a room...
                      </option>
                      <option value="beach-bungalow" className="bg-ocean-dark">
                        Beach Bungalow — 12,000 VT/night
                      </option>
                      <option value="family-villa" className="bg-ocean-dark">
                        Family Villa — 18,000 VT/night
                      </option>
                      <option value="premium-suite" className="bg-ocean-dark">
                        Premium Suite — 25,000 VT/night
                      </option>
                    </select>
                  </div>
                </div>

                {/* Special Requests */}
                <div className="sm:col-span-2">
                  <label className="block text-white/70 text-sm font-medium mb-2">
                    Special Requests
                  </label>
                  <div className="relative">
                    <MessageSquare
                      size={16}
                      className="absolute left-4 top-4 text-white/30"
                    />
                    <textarea
                      name="requests"
                      rows={4}
                      value={formData.requests}
                      onChange={handleChange}
                      placeholder="Any special requirements, dietary needs, celebration details..."
                      className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 transition-all resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="mt-8 w-full flex items-center justify-center gap-3 py-4 bg-gold hover:bg-gold-light text-ocean-dark font-bold text-lg rounded-xl transition-all duration-300 shadow-xl shadow-gold/20 hover:shadow-2xl hover:shadow-gold/30 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Send size={18} />
                Submit Reservation Request
              </button>

              <p className="text-center text-white/30 text-xs mt-4">
                No payment required now. Our team will confirm availability and
                send you a secure payment link.
              </p>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}
