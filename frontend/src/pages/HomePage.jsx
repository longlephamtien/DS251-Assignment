import React from 'react';
import HeroCarousel from '../components/home/HeroCarousel';
import MovieSection from '../components/home/MovieSection';
import EventsSection from '../components/home/EventsSection';

export default function HomePage() {
  return (
    <div>
      {/* Hero Carousel Section */}
      <HeroCarousel />

      {/* Movie Selection Section */}
      <MovieSection />

      {/* Events and Promotions Section */}
      <EventsSection />
    </div>
  );
}
