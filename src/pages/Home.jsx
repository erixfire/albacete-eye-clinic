import Navbar from '../components/public/Navbar';
import Hero from '../components/public/Hero';
import TrustBanner from '../components/public/TrustBanner';
import Services from '../components/public/Services';
import HowItWorks from '../components/public/HowItWorks';
import WhyUs from '../components/public/WhyUs';
import Testimonials from '../components/public/Testimonials';
import FAQ from '../components/public/FAQ';
import BookingSection from '../components/public/BookingSection';
import Footer from '../components/public/Footer';
import { useScrollReveal } from '../hooks/useScrollReveal';
import '../styles/base.css';

export default function Home() {
  useScrollReveal();

  return (
    <>
      <Navbar />
      <main id="main">
        <Hero />
        <TrustBanner />
        <Services />
        <HowItWorks />
        <WhyUs />
        <Testimonials />
        <FAQ />
        <BookingSection />
      </main>
      <Footer />
    </>
  );
}
