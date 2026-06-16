import { useEffect } from 'react';
import Navbar from '../components/public/Navbar';
import Hero from '../components/public/Hero';
import Services from '../components/public/Services';
import Testimonials from '../components/public/Testimonials';
import Footer from '../components/public/Footer';
import BookingSection from '../components/public/BookingSection';
import WhyUs from '../components/public/WhyUs';
import { useScrollReveal } from '../hooks/useScrollReveal';
import '../styles/base.css';

export default function Home() {
  useScrollReveal();

  return (
    <>
      <Navbar />
      <main id="main">
        <Hero />
        <Services />
        <WhyUs />
        <Testimonials />
        <BookingSection />
      </main>
      <Footer />
    </>
  );
}
