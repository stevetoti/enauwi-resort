import { ChevronDown } from "lucide-react";
import Image from "next/image";

export default function Hero() {
  return (
    <section id="home" className="relative h-screen min-h-[700px] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/images/hero-aerial.jpg"
          alt="E'Nauwi Beach Resort aerial view — stunning turquoise lagoon with white sand beach and palm trees on Efate Island, Vanuatu"
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
        {/* Subtle overlay for text readability - keeping images vibrant */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30" />
      </div>

      {/* Decorative particles (fixed positions; CSS-only so nothing waits for JavaScript) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {[
          ["28%", "18%", "0s"], ["42%", "76%", "0.8s"], ["63%", "34%", "1.6s"],
          ["35%", "58%", "0.4s"], ["71%", "84%", "1.2s"], ["52%", "12%", "2s"],
        ].map(([top, left, delay]) => (
          <div
            key={`${top}-${left}`}
            className="hero-particle absolute w-1 h-1 bg-gold-light/40 rounded-full"
            style={{ top, left, animationDelay: delay }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4 sm:px-6 pt-20">
        <div
          style={{ animationDelay: "0s" }}
          className="hero-rise max-w-5xl"
        >

          {/* Heading */}
          <p
            style={{ animationDelay: "0.1s" }}
            className="hero-rise text-gold-light font-medium text-sm sm:text-base uppercase tracking-[0.3em] mb-4"
          >
            Welcome to
          </p>

          <h1
            style={{ animationDelay: "0.2s" }}
            className="hero-rise font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-[0.95] drop-shadow-[0_4px_8px_rgba(0,0,0,0.4)]"
          >
            E&apos;Nauwi{" "}
            <span className="block text-gold-light mt-2">Beach Resort</span>{" "}
            <span className="mt-4 block font-sans text-base font-normal leading-relaxed sm:text-lg">on Efate Island, Vanuatu</span>
          </h1>

          <p
            style={{ animationDelay: "0.3s" }}
            className="hero-rise text-white text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-light drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
          >
            <span className="text-gold-light italic font-serif text-xl sm:text-2xl block mb-3 drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">
              &ldquo;Refreshing mornings, Restful afternoons{" "}
              <br className="hidden sm:block" />
              and Relishing nights&rdquo;
            </span>
            <span className="text-white/90 text-base drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
              A family-friendly beach resort with lagoon views and warm island hospitality{" "}
              <br className="hidden sm:block" />
              on Efate Island, Vanuatu.
            </span>
          </p>

          {/* CTAs */}
          <div
            style={{ animationDelay: "0.4s" }}
            className="hero-rise flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <a
              href="#reservations"
              className="group relative px-10 py-4 bg-gold hover:bg-gold-light text-ocean-dark font-bold text-lg rounded-full transition-all duration-300 shadow-2xl shadow-gold/30 hover:shadow-gold/50 hover:scale-105"
            >
              <span className="relative z-10">Reservation Enquiries</span>
            </a>
            <a
              href="#accommodations"
              className="px-10 py-4 border-2 border-white/30 text-white rounded-full font-semibold hover:bg-white/10 hover:border-white/50 transition-all duration-300"
            >
              Explore Resort
            </a>
          </div>

          {/* Stats */}
          <div
            style={{ animationDelay: "0.6s" }}
            className="hero-rise mt-16 flex items-center justify-center gap-8 sm:gap-12"
          >
            {[
              { value: "🌊", label: "Beachfront" },
              { value: "🏊", label: "Pool & Lagoon" },
              { value: "👨‍👩‍👧‍👦", label: "Family-Friendly" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-serif font-bold text-white">
                  {stat.value}
                </div>
                <div className="text-white/50 text-xs uppercase tracking-widest mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <a
          href="#about"
          className="hero-bob flex flex-col items-center gap-2 text-white/50 hover:text-white/80 transition-colors"
        >
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <ChevronDown size={20} />
        </a>
      </div>
    </section>
  );
}
