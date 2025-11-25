import React, { createContext, useContext, useEffect, useState } from 'react';
import projectTheme from '../styles/theme';

const DeviceContext = createContext(null);

function detectOS() {
  if (typeof navigator === 'undefined') return 'unknown';
  const ua = navigator.userAgent || navigator.vendor || window.opera || '';
  if (/windows phone/i.test(ua)) return 'windows-phone';
  if (/windows/i.test(ua)) return 'windows';
  if (/android/i.test(ua)) return 'android';
  if (/iPad|iPhone|iPod/.test(ua) && !window.MSStream) return 'ios';
  if (/Macintosh|MacIntel|MacPPC|Mac68K/.test(navigator.platform)) return 'macos';
  return 'unknown';
}

function toPx(value) {
  // Accepts values like '40rem' or '640px' and returns numeric px
  if (!value) return NaN;
  if (String(value).endsWith('px')) return parseFloat(value.replace('px', ''));
  if (String(value).endsWith('rem')) return parseFloat(value.replace('rem', '')) * 16; // assume 16px root
  return Number(value);
}

function getDeviceType(width) {
  // Return one of: 'xs' (below sm), 'sm','md','lg','xl','2xl'
  const w = Number(width);
  const sm = toPx(projectTheme.screens.sm);
  const md = toPx(projectTheme.screens.md);
  const lg = toPx(projectTheme.screens.lg);
  const xl = toPx(projectTheme.screens.xl);
  const x2 = toPx(projectTheme.screens['2xl']);

  if (w < sm) return 'xs';
  if (w >= sm && w < md) return 'sm';
  if (w >= md && w < lg) return 'md';
  if (w >= lg && w < xl) return 'lg';
  if (w >= xl && w < x2) return 'xl';
  return '2xl';
}

export function DeviceProvider({ children }) {
  const [device, setDevice] = useState(() => {
    const width = typeof window !== 'undefined' ? window.innerWidth : 1024;
    return {
      width,
      deviceType: getDeviceType(width),
      os: detectOS(),
      isTouch: typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0),
    };
  });

  useEffect(() => {
    function handleResize() {
      const width = window.innerWidth;
      setDevice(d => ({ ...d, width, deviceType: getDeviceType(width) }));
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return <DeviceContext.Provider value={device}>{children}</DeviceContext.Provider>;
}

export function useDevice() {
  return useContext(DeviceContext);
}

export default DeviceContext;
