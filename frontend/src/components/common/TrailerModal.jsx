import React, { useEffect } from 'react';
import Icon from './Icon';

export default function TrailerModal({ trailerUrl, movieName, onClose }) {
  // Helper to get embed URL for YouTube
  const getEmbedUrl = (url) => {
    if (!url) return null;
    // Handle standard watch URLs
    if (url.includes('watch?v=')) {
      return url.replace('watch?v=', 'embed/');
    }
    // Handle short URLs (youtu.be)
    if (url.includes('youtu.be/')) {
      return url.replace('youtu.be/', 'youtube.com/embed/');
    }
    return url;
  };

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div 
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-5xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
          aria-label="Close trailer"
        >
          <Icon name="close" className="w-8 h-8" />
        </button>

        {/* Video Container */}
        <div className="aspect-video bg-black rounded-lg overflow-hidden shadow-2xl">
          {trailerUrl ? (
            <iframe
              width="100%"
              height="100%"
              src={getEmbedUrl(trailerUrl)}
              title={`${movieName} Trailer`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white">
              <div className="text-center">
                <Icon name="film" className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-lg">Trailer not available</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
