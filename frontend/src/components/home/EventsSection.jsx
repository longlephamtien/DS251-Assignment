import React from 'react';

export default function EventsSection() {
  const events = [
    {
      id: 1,
      title: 'Zalopay Partnership',
      image: '/images/events/zalopay.jpg',
      badge: 'News & Offers | Member CGV',
      description: '1400đ for all movies',
      link: '/events/zalopay'
    },
    {
      id: 2,
      title: 'Mother\'s Day Special',
      image: '/images/events/mothers-day.jpg',
      badge: 'News & Offers | Member CGV',
      description: 'Special gift vouchers',
      link: '/events/mothers-day'
    },
    {
      id: 3,
      title: 'VIB Credit Card Offer',
      image: '/images/events/vib-offer.jpg',
      badge: 'News & Offers',
      description: '100K discount voucher',
      link: '/events/vib'
    },
    {
      id: 4,
      title: 'Weekend Special',
      image: '/images/events/weekend.jpg',
      badge: 'News & Offers',
      description: 'Weekend movie promotions',
      link: '/events/weekend'
    }
  ];

  return (
    <div className="bg-gray-50 py-12">
      <div className="max-w-[1200px] mx-auto px-4">
        {/* Section Header */}
        <div className="relative mb-8">
          <h2 className="text-3xl md:text-5xl font-bold text-center tracking-wider relative inline-block w-full">
            <span className="relative z-10 bg-gray-50 px-6 text-gray-800" style={{ 
              textShadow: '2px 2px 0px #e5e5e5, 4px 4px 0px #d4d4d4',
              letterSpacing: '0.05em'
            }}>
              EVENT
            </span>
            <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent -z-0" />
          </h2>
        </div>

        {/* Banner */}
        <div className="bg-gradient-to-r from-primary to-secondary rounded-lg py-3 px-6 mb-8 flex items-center justify-center gap-4 shadow-lg">
          <div className="flex items-center gap-2">
            <span className="text-white text-sm md:text-base font-semibold">News & Offers</span>
          </div>
          <div className="h-6 w-px bg-white/30" />
          <div className="flex items-center gap-2">
            <span className="text-white text-sm md:text-base font-semibold">Member BKinema</span>
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {events.map((event) => (
            <a
              key={event.id}
              href={event.link}
              className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow group"
            >
              <div className="relative aspect-[4/3] bg-gradient-to-br from-blue-100 via-green-100 to-yellow-100">
                {/* Event Image Placeholder */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center p-4">
                    <p className="text-sm font-semibold text-gray-700">{event.title}</p>
                    <p className="text-xs text-gray-500 mt-2">{event.description}</p>
                  </div>
                </div>
                
                {/* Badge */}
                {event.badge && (
                  <div className="absolute top-3 left-3 bg-accent text-white text-xs px-3 py-1 rounded-full font-semibold shadow-lg">
                    {event.badge.split('|')[0].trim()}
                  </div>
                )}
              </div>
              
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 group-hover:text-primary transition-colors line-clamp-2">
                  {event.title}
                </h3>
                <p className="text-sm text-gray-500 mt-1">{event.description}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
