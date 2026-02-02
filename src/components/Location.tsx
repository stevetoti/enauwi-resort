"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Plane, Car, MapPin, Clock, Phone, Info } from "lucide-react";

const steps = [
  {
    icon: Plane,
    title: "Fly to Norsup Airport (NUS)",
    description:
      "Regular domestic flights from Port Vila (VLI) operate daily on Air Vanuatu and Unity Airlines. Flight time approximately 1 hour.",
    highlight: "Daily flights from Port Vila",
  },
  {
    icon: Car,
    title: "15-Minute Resort Transfer",
    description:
      "Our shuttle service meets arriving flights — sit back and enjoy the scenic coastal drive to the resort through lush tropical countryside. Contact us 72 hours prior to arrange pick-up.",
    highlight: "VUV 2,000/adult · VUV 1,000/child",
  },
  {
    icon: MapPin,
    title: "Arrive at E'Nauwi Beach Resort",
    description:
      "Be greeted with a refreshing welcome drink and a warm Melanesian 'welkam' as you step into paradise. Check-in is seamless and stress-free.",
    highlight: "Welcome drink included",
  },
];

export default function Location() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="location" className="relative overflow-hidden">
      <div className="section-padding max-w-7xl mx-auto" ref={ref}>
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-ocean/5 rounded-full mb-6"
          >
            <MapPin size={14} className="text-ocean" />
            <span className="text-ocean/70 text-sm font-medium uppercase tracking-wider">
              Getting Here
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="section-heading"
          >
            Your Journey to{" "}
            <span className="text-gold-gradient">Paradise</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="section-subheading"
          >
            Getting to E&apos;Nauwi Beach Resort is part of the adventure. Located on
            the stunning island of Malekula, Vanuatu&apos;s second largest island.
          </motion.p>
        </div>

        {/* Journey Steps */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-16">
          {steps.map((step, idx) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 + idx * 0.15 }}
              className="relative"
            >
              {/* Connector line */}
              {idx < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-px bg-gradient-to-r from-gold/40 to-gold/10" />
              )}

              <div className="glass-card p-6 lg:p-8 text-center hover:shadow-2xl hover:shadow-ocean/10 transition-all duration-500 hover:-translate-y-1">
                {/* Step number */}
                <div className="inline-flex items-center justify-center w-6 h-6 bg-gold text-ocean-dark text-xs font-bold rounded-full mb-4">
                  {idx + 1}
                </div>

                <div className="w-16 h-16 mx-auto rounded-2xl bg-ocean/5 flex items-center justify-center mb-5">
                  <step.icon size={28} className="text-ocean" />
                </div>

                <h3 className="font-serif text-lg font-bold text-ocean mb-3">
                  {step.title}
                </h3>

                <p className="text-ocean/60 text-sm leading-relaxed mb-4">
                  {step.description}
                </p>

                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green/10 text-green text-xs font-medium rounded-full">
                  <Info size={10} />
                  {step.highlight}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Map + Info */}
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Map */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="lg:col-span-3 rounded-3xl overflow-hidden shadow-2xl shadow-ocean/10 border border-ocean/10"
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d248044.26007689458!2d167.4!3d-16.1!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6e85efcdb6b27e2f%3A0x6a3e86a0a72c1b0!2sMalekula!5e0!3m2!1sen!2svu!4v1700000000000!5m2!1sen!2svu"
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="E'Nauwi Beach Resort location on Malekula Island, Vanuatu"
              className="w-full"
            />
          </motion.div>

          {/* Info Panel */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="lg:col-span-2 space-y-6"
          >
            <div className="glass-card p-6">
              <h3 className="font-serif text-xl font-bold text-ocean mb-4">
                Resort Location
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-gold mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-ocean">Address</p>
                    <p className="text-ocean/60 text-sm">
                      South West Bay, Malekula Island,
                      <br />
                      Malampa Province, Vanuatu
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Plane size={18} className="text-gold mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-ocean">Nearest Airport</p>
                    <p className="text-ocean/60 text-sm">
                      Norsup Airport (NUS)
                      <br />
                      15 minutes by road
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock size={18} className="text-gold mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-ocean">From Port Vila</p>
                    <p className="text-ocean/60 text-sm">
                      ~1 hour flight (Air Vanuatu)
                      <br />
                      Daily departures available
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone size={18} className="text-gold mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-ocean">Contact</p>
                    <p className="text-ocean/60 text-sm">
                      <a href="tel:+67822170" className="hover:text-ocean transition-colors">+678 22170</a>
                      <br />
                      <a href="mailto:gm@enauwibeachresort.com" className="hover:text-ocean transition-colors">gm@enauwibeachresort.com</a>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card p-6 bg-ocean/5">
              <h4 className="font-semibold text-ocean mb-2 flex items-center gap-2">
                <Info size={16} className="text-gold" />
                Travel Tips
              </h4>
              <ul className="space-y-2 text-ocean/60 text-sm">
                <li>• Book domestic flights in advance during peak season (Jun-Oct)</li>
                <li>• Australian & NZ citizens: 30-day visa-free entry</li>
                <li>• Currency: Vanuatu Vatu (VT) — ATMs available in Norsup</li>
                <li>• Best time to visit: April to October (dry season)</li>
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
