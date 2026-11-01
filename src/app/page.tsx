import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Accommodations from "@/components/Accommodations";
import ResortFeatures from "@/components/ResortFeatures";
import Activities from "@/components/Activities";
import Gallery from "@/components/Gallery";
import Location from "@/components/Location";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import VoiceCallWidget from "@/components/VoiceCallWidget";
import { resortJsonLd } from "@/lib/site";
import { publicPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/seo/JsonLd";
import seoPages from "@/data/seo-pages.json";

export const metadata = publicPageMetadata('/');

export default function Home() {
  return (
    <main className="min-h-screen">
      <JsonLd data={resortJsonLd()} />
      <Navbar />
      <Hero />
      <About intro={seoPages['/'].intro} />
      <Accommodations />
      <ResortFeatures />
      <Activities />
      <Gallery />
      <Location />
      <Contact />
      <Footer />
      <ChatWidget />
      <VoiceCallWidget />
    </main>
  );
}
