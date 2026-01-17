import React, { useState, useEffect } from 'react';
import Icon from '../common/Icon';

export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      image: '/images/banner-1.jpg',
      alt: 'Christmas Gift Card Promotion',
      link: '/promotions/gift-cards'
    },
    {
      id: 2,
      image: '/images/banner-2.jpg',
      alt: 'Special Movie Events',
      link: '/events'
    },
    {
      id: 3,
      image: '/images/banner-3.jpg',
      alt: 'Member Benefits',
      link: '/membership'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="relative bg-gradient-to-b from-gray-100 to-white overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-4 py-8">
        <div className="relative aspect-[16/7] md:aspect-[21/9] rounded-lg overflow-hidden shadow-lg">
          {/* Slides */}
          <div className="relative w-full h-full">
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-500 ${
                  index === currentSlide ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <a href={slide.link} className="block w-full h-full">
                  <div className="w-full h-full bg-gradient-to-br from-primary via-secondary to-primary flex items-center justify-center relative overflow-hidden">
                    {/* Decorative snowflakes */}
                    <div className="absolute inset-0 opacity-20">
                      <div className="absolute top-4 left-4 text-white text-2xl">❄</div>
                      <div className="absolute top-8 right-12 text-white text-xl">❄</div>
                      <div className="absolute bottom-8 left-16 text-white text-3xl">❄</div>
                      <div className="absolute bottom-4 right-8 text-white text-2xl">❄</div>
                      <div className="absolute top-1/2 left-1/4 text-white text-xl">❄</div>
                      <div className="absolute top-1/3 right-1/4 text-white text-2xl">❄</div>
                    </div>
                    
                    {/* Content */}
                    <div className="relative z-10 text-white text-center px-4">
                      <div className="text-6xl md:text-8xl font-bold mb-4" style={{ fontFamily: 'Arial, sans-serif' }}>
                        <span className="bg-white text-primary px-4 py-2 rounded-lg inline-block transform -rotate-2">
                          BKinema
                        </span>
                      </div>
                      <p className="text-2xl md:text-4xl font-bold mb-2">Christmas Gift Cards</p>
                      <p className="text-lg md:text-xl">Perfect gift for movie lovers!</p>
                    </div>

                    {/* Decorative elements */}
                    {/* <div className="absolute bottom-0 left-0 right-0">
                      <div className="flex justify-center gap-2 pb-4">
                        <span className="text-4xl">🎄</span>
                        <span className="text-4xl">⛄</span>
                        <span className="text-4xl">🎅</span>
                      </div>
                    </div> */}
                  </div>
                </a>
              </div>
            ))}
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all z-20"
            aria-label="Previous slide"
          >
            <Icon name="chevron-left" className="w-6 h-6 text-gray-800" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all z-20"
            aria-label="Next slide"
          >
            <Icon name="chevron-right" className="w-6 h-6 text-gray-800" />
          </button>

          {/* Indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  index === currentSlide
                    ? 'bg-white w-8'
                    : 'bg-white/50 hover:bg-white/75'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
