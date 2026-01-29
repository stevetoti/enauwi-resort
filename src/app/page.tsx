import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Accommodations from "@/components/Accommodations";
import Activities from "@/components/Activities";
import Gallery from "@/components/Gallery";
import Location from "@/components/Location";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <About />
      <Accommodations />
      <Activities />
      <Gallery />
      <Location />
      <Contact />
      <Footer />
      <ChatWidget />
    </main>
  );
}
