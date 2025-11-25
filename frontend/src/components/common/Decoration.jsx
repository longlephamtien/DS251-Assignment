import React from 'react';

const Decoration = () => {
  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Gift Box Illustration */}
      <div className="relative mb-6">
        {/* Balloons */}
        <div className="absolute -top-8 left-16 w-12 h-16">
          <div className="w-10 h-12 bg-secondary rounded-full"></div>
          <div className="w-1 h-12 bg-gray-400 absolute left-1/2 top-12"></div>
        </div>
        <div className="absolute -top-8 left-32 w-12 h-16">
          <div className="w-10 h-12 bg-green-400 rounded-full"></div>
          <div className="w-1 h-12 bg-gray-400 absolute left-1/2 top-12"></div>
        </div>
        <div className="absolute -top-4 right-16 w-12 h-16">
          <div className="w-10 h-12 bg-gray-800 rounded-full"></div>
          <div className="w-1 h-12 bg-gray-400 absolute left-1/2 top-12"></div>
        </div>

        {/* Confetti */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 w-16 h-16">
          <div className="absolute w-2 h-2 bg-gray-400 rounded-full top-0 left-8"></div>
          <div className="absolute w-3 h-1 bg-gray-300 top-2 left-4"></div>
          <div className="absolute w-2 h-2 bg-gray-500 rounded-full top-4 left-12"></div>
          <div className="absolute w-1 h-3 bg-gray-300 top-1 right-2"></div>
        </div>

        {/* Main Gift Box */}
        <div className="bg-gray-800 rounded-lg p-8 mx-auto w-64 h-40 relative shadow-lg">
          {/* CGV Logo */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="text-white text-5xl font-bold">BKinema*</div>
          </div>
          
          {/* Ribbon */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-full bg-primary opacity-80"></div>
          
          {/* Bow */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-20 h-8">
            <div className="w-10 h-8 bg-primary rounded-full absolute left-0"></div>
            <div className="w-10 h-8 bg-primary rounded-full absolute right-0"></div>
            <div className="w-6 h-6 bg-primary rounded-full absolute left-1/2 -translate-x-1/2 top-1"></div>
          </div>
        </div>

        {/* Cloud decoration */}
        <div className="absolute -top-12 left-0 w-24 h-12">
          <div className="w-12 h-8 bg-gray-200 rounded-full absolute left-0 top-2"></div>
          <div className="w-16 h-10 bg-gray-300 rounded-full absolute left-4 top-0"></div>
          <div className="w-12 h-8 bg-gray-200 rounded-full absolute right-0 top-2"></div>
        </div>
        <div className="absolute -top-8 right-0 w-20 h-10">
          <div className="w-10 h-6 bg-gray-200 rounded-full absolute left-0 top-2"></div>
          <div className="w-14 h-8 bg-gray-300 rounded-full absolute left-3 top-0"></div>
          <div className="w-10 h-6 bg-gray-200 rounded-full absolute right-0 top-2"></div>
        </div>

        {/* Bottom gift */}
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-32 h-16 bg-gray-800 rounded shadow-md"></div>
      </div>

      {/* Text Content */}
      <div className="text-center mt-24 pt-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          BIRTHDAY GIFT
        </h2>
        <p className="text-gray-600 text-base leading-relaxed">
          A special gift for all CGV members<br />
          in the birth month
        </p>
      </div>

      {/* Carousel Dots */}
      <div className="flex justify-center gap-2 mt-6">
        <button className="w-3 h-3 rounded-full bg-gray-400"></button>
        <button className="w-3 h-3 rounded-full bg-gray-800"></button>
        <button className="w-3 h-3 rounded-full bg-gray-400"></button>
      </div>
    </div>
  );
};

export default Decoration;
