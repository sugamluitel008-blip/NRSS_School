import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CampusPhoto } from '../types';
import { INITIAL_CAMPUS_PHOTOS } from '../lib/firebase';
import { ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';

interface CampusGalleryProps {
  photos?: CampusPhoto[];
}

// Clean title helper: ensures no raw UUIDs, timestamps, or technical file strings are shown
function cleanPhotoTitle(title?: string): string {
  if (!title) return 'N.R. College Campus Showcase';
  const trimmed = title.trim();
  // If title looks like a UUID / ID / file name
  if (
    /^[a-zA-Z0-9_-]{12,}$/.test(trimmed) ||
    /^(adm_req|usr_|photo_|campus-|img_)/i.test(trimmed) ||
    /\.(jpg|jpeg|png|webp|gif)$/i.test(trimmed)
  ) {
    return 'N.R. College Campus Showcase';
  }
  return trimmed;
}

function cleanPhotoDescription(desc?: string): string {
  if (!desc) return '';
  const trimmed = desc.trim();
  if (
    /^[a-zA-Z0-9_-]{12,}$/.test(trimmed) ||
    /^(adm_req|usr_|photo_|campus-|img_)/i.test(trimmed)
  ) {
    return '';
  }
  return trimmed;
}

export const CampusGallery: React.FC<CampusGalleryProps> = ({
  photos = INITIAL_CAMPUS_PHOTOS
}) => {
  const activePhotos = photos.length > 0 ? photos : INITIAL_CAMPUS_PHOTOS;
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Keep currentIndex in bounds when activePhotos length changes (e.g. on deletion)
  useEffect(() => {
    if (currentIndex >= activePhotos.length) {
      setCurrentIndex(Math.max(0, activePhotos.length - 1));
    }
  }, [activePhotos.length, currentIndex]);

  // Always Auto-swipe: continuously advances slides every 3.8 seconds without stopping
  useEffect(() => {
    if (activePhotos.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activePhotos.length);
    }, 3800);
    return () => clearInterval(timer);
  }, [activePhotos.length]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    if (distance > 40) {
      setCurrentIndex((prev) => (prev + 1) % activePhotos.length);
    } else if (distance < -40) {
      setCurrentIndex((prev) => (prev - 1 + activePhotos.length) % activePhotos.length);
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + activePhotos.length) % activePhotos.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % activePhotos.length);
  };

  const currentPhoto = activePhotos[currentIndex] || activePhotos[0];

  if (!currentPhoto) {
    return (
      <div className="w-full py-16 rounded-3xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
        <ImageIcon className="w-10 h-10 text-slate-600 mx-auto" />
        <p className="text-sm font-semibold text-slate-400">No campus photos uploaded yet.</p>
      </div>
    );
  }

  const displayTitle = cleanPhotoTitle(currentPhoto.title);
  const displayDesc = cleanPhotoDescription(currentPhoto.description);

  return (
    <div
      id="campus-photo-autoswiper"
      className="group relative w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-slate-800 bg-slate-950 aspect-[16/9] sm:aspect-[21/9] select-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Auto-Swiping Photo Transition */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPhoto.id || currentPhoto.url || currentIndex}
          initial={{ opacity: 0, scale: 1.03 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0"
        >
          <img
            src={currentPhoto.url}
            alt={displayTitle}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
            loading="lazy"
            onError={(e) => {
              // Fallback placeholder if custom image fails to load
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1600&q=80';
            }}
          />
          {/* Subtle Bottom Vignette for Caption readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/25 to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Manual Chevron Navigation Arrows on Hover (Desktop) */}
      {activePhotos.length > 1 && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous photo"
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-slate-950/60 hover:bg-slate-900 text-white/80 hover:text-white border border-white/10 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-200 z-20 shadow-lg"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={handleNext}
            aria-label="Next photo"
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-slate-950/60 hover:bg-slate-900 text-white/80 hover:text-white border border-white/10 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-200 z-20 shadow-lg"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Sleek Bottom Caption & Progress Controls */}
      <div className="absolute bottom-3.5 sm:bottom-5 left-4 sm:left-6 right-4 sm:right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-2 pointer-events-none z-10">
        <div className="max-w-xl pr-3">
          <div className="text-xs sm:text-base font-bold text-white drop-shadow-md truncate">
            {displayTitle}
          </div>
          {displayDesc && (
            <div className="text-[11px] sm:text-xs text-slate-300 drop-shadow line-clamp-1 hidden sm:block mt-0.5">
              {displayDesc}
            </div>
          )}
        </div>

        {/* Minimal Progress Dots */}
        {activePhotos.length > 1 && (
          <div className="flex items-center gap-1.5 shrink-0 pointer-events-auto self-end sm:self-auto pb-1">
            {activePhotos.map((photo, idx) => (
              <button
                key={photo.id || idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  currentIndex === idx
                    ? 'w-6 bg-emerald-400 shadow-md shadow-emerald-400/50'
                    : 'w-1.5 bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};


