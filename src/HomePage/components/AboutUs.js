// AboutUs.js
import React, { useEffect, useState } from 'react';
import './AboutUs.css';
import aboutImage from '../assets/health.jpg';

const AboutUs = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const aboutSection = document.querySelector('.about-section');
      const sectionTop = aboutSection.getBoundingClientRect().top;
      const screenPosition = window.innerHeight / 1.3;

      if (sectionTop < screenPosition) {
        setIsVisible(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="about-container">
      <section className={`about-section ${isVisible ? 'animate' : ''}`}>
        <div className="about-content">
          <div className="about-text">
            <h2>About Us</h2>
            <p>
              At <strong>MedTech Clinic</strong>, we are committed to providing exceptional healthcare services with a patient-centered approach.
              Our highly skilled team of doctors, nurses, and specialists ensure that every patient receives the personalized attention and care they deserve.
            </p>
            <p>
              With a focus on advanced medical treatments and compassionate care, we combine cutting-edge technology with a human touch to deliver the best possible outcomes for our patients.
            </p>
          </div>
          <div className="about-image">
            <img src={aboutImage} alt="Our Clinic" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
