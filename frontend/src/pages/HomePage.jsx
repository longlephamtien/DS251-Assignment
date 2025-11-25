import React from 'react';
import HeroCarousel from '../components/home/HeroCarousel';
import QuickLinks from '../components/home/QuickLinks';
import MovieSection from '../components/home/MovieSection';
import EventsSection from '../components/home/EventsSection';

export default function HomePage() {
  return (
    <div>
      {/* Hero Carousel Section */}
      <HeroCarousel />

      {/* Quick Access Links */}
      {/* <QuickLinks /> */}

      {/* Movie Selection Section */}
      <MovieSection title="MOVIE SELECTION" />

      {/* Events and Promotions Section */}
      <EventsSection />
    </div>
  );
}
