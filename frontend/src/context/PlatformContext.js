import React, { createContext, useContext, useEffect, useState } from 'react';

// Semantic screen categories mapped from tailwind breakpoints defined in tailwind.config.js
// Categories align with Tailwind breakpoints; include 'xs' for <sm
const SCREEN_CATEGORIES = [
  { id: 'xs', min: 0 },
  { id: 'sm', min: 640 },
  { id: 'md', min: 768 },
  { id: 'lg', min: 1024 },
  { id: 'xl', min: 1280 },
  { id: '2xl', min: 1536 },
];

const PlatformContext = createContext(null);

export function PlatformProvider({ children, showMarker = true }) {
  const [os, setOs] = useState('unknown');
  const [screen, setScreen] = useState('xs');

  useEffect(() => {
    function detectOS() {
      const ua = navigator.userAgent || navigator.vendor || window.opera;
      if (/windows phone/i.test(ua)) return 'windows-phone';
      if (/windows/i.test(ua)) return 'windows';
      if (/android/i.test(ua)) return 'android';
      if (/iPad|iPhone|iPod/.test(ua) && !window.MSStream) return 'ios';
      if (/Macintosh/.test(ua) || /Mac OS X/.test(ua)) return 'macos';
      return 'unknown';
    }

    function computeScreenCategory(width) {
      // find the largest breakpoint <= width
      let cat = SCREEN_CATEGORIES[0].id;
      for (let i = 0; i < SCREEN_CATEGORIES.length; i++) {
        if (width >= SCREEN_CATEGORIES[i].min) cat = SCREEN_CATEGORIES[i].id;
      }
      return cat;
    }

    function handleResize() {
      const w = window.innerWidth;
      const cat = computeScreenCategory(w);
      setScreen(cat);
      // set attribute for global CSS / debugging
      document.documentElement.setAttribute('data-screen', cat);
    }

    const detected = detectOS();
    setOs(detected);
    document.documentElement.setAttribute('data-os', detected);

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <PlatformContext.Provider value={{ os, screen }}>
      {children}
      {showMarker && (
        <div className="screen-marker" aria-hidden>
          {os} · {screen}
        </div>
      )}
    </PlatformContext.Provider>
  );
}

export function usePlatform() {
  const ctx = useContext(PlatformContext);
  if (!ctx) throw new Error('usePlatform must be used inside PlatformProvider');
  return ctx;
}
