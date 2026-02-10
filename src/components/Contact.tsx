"use client";

import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Send,
  User,
  Mail,
  Phone,
  MapPin,
  Clock,
  MessageSquare,
  CheckCircle,
  Sparkles,
  ChevronDown,
} from "lucide-react";

const subjects = [
  "General Inquiry",
  "Booking Question",
  "Activity Info",
  "Partnership",
  "Other",
];

const contactInfo = [
  {
    icon: Phone,
    label: "Phone",
    value: "+678 22170",
    href: "tel:+67822170",
  },
  {
    icon: Mail,
    label: "Email",
    value: "gm@enauwibeachresort.com",
    href: "mailto:gm@enauwibeachresort.com",
  },
  {
    icon: MapPin,
    label: "Location",
    value: "South West Bay, Efate Island, Malampa Province, Vanuatu",
    href: null,
  },
  {
    icon: Clock,
    label: "Front Desk Hours",
    value: "Mon–Sun: 8:00 AM – 5:00 PM (VUT)",
    href: null,
  },
];

export default function Contact() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to submit");
      setSubmitted(true);
    } catch (error) {
      console.error("Error submitting contact form:", error);
      alert("Something went wrong. Please try again or call us at +678 22170.");
    } finally {
      setSubmitting(false);
    }
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

      <div
        className="section-padding max-w-7xl mx-auto relative z-10"
        ref={ref}
      >
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
              Get in Touch
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4"
          >
            Contact <span className="text-gold-light">Us</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-white/60 text-lg max-w-2xl mx-auto"
          >
            Have a question or ready to plan your island escape? We&apos;d love
            to hear from you.
          </motion.p>
        </div>

        <div className="grid lg:grid-cols-5 gap-10 lg:gap-12">
          {/* Contact Info Side */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="lg:col-span-2 space-y-8"
          >
            {/* Contact Cards */}
            <div className="space-y-4">
              {contactInfo.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-4 p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10"
                >
                  <div className="w-11 h-11 rounded-xl bg-gold/20 flex items-center justify-center shrink-0">
                    <item.icon size={18} className="text-gold-light" />
                  </div>
                  <div>
                    <p className="text-white/50 text-xs uppercase tracking-wider mb-1">
                      {item.label}
                    </p>
                    {item.href ? (
                      <a
                        href={item.href}
                        className="text-white font-medium text-sm hover:text-gold-light transition-colors"
                      >
                        {item.value}
                      </a>
                    ) : (
                      <p className="text-white font-medium text-sm">
                        {item.value}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Map */}
            <div className="rounded-2xl overflow-hidden border border-white/10 h-56">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14890.41413074!2d167.42!3d-16.47!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6e8c8d1f18f1b1b1%3A0x1!2sSouth%20West%20Bay%2C%20Efate!5e0!3m2!1sen!2svu!4v1700000000000!5m2!1sen!2svu"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="E'Nauwi Beach Resort Location"
              />
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="lg:col-span-3"
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
                  Your message has been received. Our team will get back to you
                  within 24 hours.
                </p>
                <p className="text-gold-light text-sm font-medium">
                  Check your email for a confirmation.
                </p>
              </motion.div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 p-6 sm:p-10"
              >
                <div className="grid sm:grid-cols-2 gap-5">
                  {/* Name */}
                  <div>
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

                  {/* Subject */}
                  <div>
                    <label className="block text-white/70 text-sm font-medium mb-2">
                      Subject *
                    </label>
                    <div className="relative">
                      <ChevronDown
                        size={16}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
                      />
                      <select
                        name="subject"
                        required
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 transition-all appearance-none"
                      >
                        <option value="" disabled className="bg-ocean-dark">
                          Select a subject...
                        </option>
                        {subjects.map((s) => (
                          <option key={s} value={s} className="bg-ocean-dark">
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Message */}
                  <div className="sm:col-span-2">
                    <label className="block text-white/70 text-sm font-medium mb-2">
                      Message *
                    </label>
                    <div className="relative">
                      <MessageSquare
                        size={16}
                        className="absolute left-4 top-4 text-white/30"
                      />
                      <textarea
                        name="message"
                        rows={5}
                        required
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Tell us how we can help..."
                        className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 transition-all resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-8 w-full flex items-center justify-center gap-3 py-4 bg-gold hover:bg-gold-light text-ocean-dark font-bold text-lg rounded-xl transition-all duration-300 shadow-xl shadow-gold/20 hover:shadow-2xl hover:shadow-gold/30 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={18} />
                  {submitting ? "Sending..." : "Send Message"}
                </button>

                <p className="text-center text-white/30 text-xs mt-4">
                  We typically respond within 24 hours. For urgent inquiries,
                  call{" "}
                  <a
                    href="tel:+67822170"
                    className="text-gold/60 hover:text-gold-light"
                  >
                    +678 22170
                  </a>
                  .
                </p>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
