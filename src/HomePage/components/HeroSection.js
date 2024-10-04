import React, { useState, useEffect } from 'react';
import './HeroSection.css';
import heroImage1 from '../assets/image1.jpg';
import heroImage2 from '../assets/Doctor-and-family.jpg';
import heroImage3 from '../assets/image2.jpg';


const slides = [
    { 
        text: (
            <>
                Welcome to <br /> MedTech Clinic
            </>
        ), 
        subText: 'Your Health, Our Priority', 
        image: heroImage1 
    },
    { 
        text: (
            <>
                Expert <br /> Medical Staff
            </>
        ), 
        subText: 'Committed to Your Care', 
        image: heroImage2 
    },
    { 
        text: (
            <>
                Advanced <br /> Health Solutions
            </>
        ), 
        subText: 'Innovation for Better Health', 
        image: heroImage3 
    }
];


function HeroSection() {
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000); // Change slide every 5 seconds

        return () => clearInterval(interval);
    }, []);

    // const handleDotClick = (index) => {
    //     setCurrentSlide(index);
    // };

    return (
        <section className="hero">
            <div className={`text-container ${currentSlide === 0 ? 'slide-in-left' : ''}`}>
                <h2>{slides[currentSlide].text}</h2>
                <p>{slides[currentSlide].subText}</p>
                {/* <div className="dots">
                    {slides.map((_, index) => (
                        <span
                            key={index}
                            className={`dot ${currentSlide === index ? 'active' : ''}`}
                            onClick={() => handleDotClick(index)}
                        ></span>
                    ))}
                </div> */}
            </div>
            <div className={`hero-image-container ${currentSlide === 0 ? 'slide-in-right' : ''}`}>
                <img src={slides[currentSlide].image} alt="Healthcare" className="hero-image" />
            </div>
        </section>
    );
}

export default HeroSection;

