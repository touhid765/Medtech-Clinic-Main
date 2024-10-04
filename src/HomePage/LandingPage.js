import React from 'react';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import Services from './components/Services';
import AboutUs from './components/AboutUs';
import Footer from './components/Footer';
import './landingPage.css';

const LandingPage = () => {
  return (
    <div className="LandingPage">
      <Header />
      <HeroSection />
      <Services />
      <AboutUs />
      <Footer />
  </div>
  );
};

export default LandingPage;
