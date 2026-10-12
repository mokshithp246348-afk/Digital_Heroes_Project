'use client';

import { useState, useEffect } from 'react';
import { Camera, Play, Pause, ChevronRight, ChevronLeft, Image as ImageIcon } from 'lucide-react';

const BACKGROUND_IMAGES = [
  {
    id: 1,
    url: '/images/golf_bg_1.jpg',
    title: 'Sunset Championship Course',
    subtitle: 'Golden hour over 18th hole fairway',
  },
  {
    id: 2,
    url: '/images/golf_bg_2.jpg',
    title: 'Floodlit Night Resort',
    subtitle: 'Atmospheric evening green under floodlights',
  },
  {
    id: 3,
    url: '/images/golf_bg_3.jpg',
    title: 'Coastal Ocean Cliffside',
    subtitle: 'Dramatic cliffside green overlooking sea',
  },
  {
    id: 4,
    url: '/images/golf_bg_4.jpg',
    title: 'PGA Championship Pin',
    subtitle: 'Morning mist with glowing pin & cup',
  },
  {
    id: 5,
    url: '/images/golf_bg_5.jpg',
    title: 'Aerial Dusk Vista',
    subtitle: 'Panoramic aerial view of luxury golf estate',
  },
];

export default function AnimatedGolfBackground() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [showControls, setShowControls] = useState(false);

  useEffect(() => {
    if (!isAutoPlay) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % BACKGROUND_IMAGES.length);
    }, 9000);
    return () => clearInterval(interval);
  }, [isAutoPlay]);

  const currentBg = BACKGROUND_IMAGES[currentIndex];

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* Background Image Carousel with Ken Burns Animation */}
      {BACKGROUND_IMAGES.map((bg, idx) => {
        const isActive = idx === currentIndex;
        return (
          <div
            key={bg.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isActive ? 'opacity-35 scale-105' : 'opacity-0 scale-100'
            }`}
            style={{
              backgroundImage: `url(${bg.url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              transition: 'opacity 1.2s ease-in-out, transform 12s ease-out',
            }}
          />
        );
      })}

      {/* Atmospheric Overlays for Ultra-Premium Contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#070b12]/90 via-[#0a101d]/85 to-[#060911]/95" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-500/10 via-emerald-500/5 to-transparent opacity-60" />

      {/* Floating Interactive Background Control Bar (Pointer events enabled for control widget) */}
      <div className="pointer-events-auto fixed bottom-6 right-6 z-40">
        <div className="relative group">
          <button
            onClick={() => setShowControls(!showControls)}
            className="px-3.5 py-2 rounded-full bg-slate-900/90 border border-white/20 backdrop-blur-xl text-xs font-semibold text-slate-200 shadow-2xl hover:border-orange-500/50 hover:bg-slate-800 transition flex items-center gap-2"
            title="Change World-Class Golf Background"
          >
            <Camera className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
            <span className="hidden sm:inline text-[11px] font-mono tracking-wider">
              GOLF BG {currentIndex + 1}/5
            </span>
          </button>

          {/* Control Dropdown Widget */}
          {showControls && (
            <div className="absolute bottom-12 right-0 w-72 bg-[#0e1422]/95 border border-white/15 rounded-2xl p-4 shadow-2xl backdrop-blur-2xl text-slate-200 space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-xs font-bold text-orange-400 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5" />
                  Select Golf View (5 Available)
                </span>
                <button
                  onClick={() => setIsAutoPlay(!isAutoPlay)}
                  className={`p-1 rounded-lg text-xs transition ${
                    isAutoPlay ? 'bg-orange-500/20 text-orange-400' : 'bg-slate-800 text-slate-400'
                  }`}
                  title={isAutoPlay ? 'Pause Slideshow' : 'Play Slideshow'}
                >
                  {isAutoPlay ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Thumbnails */}
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {BACKGROUND_IMAGES.map((bg, idx) => (
                  <button
                    key={bg.id}
                    onClick={() => {
                      setCurrentIndex(idx);
                    }}
                    className={`w-full p-2 rounded-xl text-left transition flex items-center gap-2.5 border ${
                      idx === currentIndex
                        ? 'bg-orange-500/15 border-orange-500/40 text-white font-semibold'
                        : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200'
                    }`}
                  >
                    <div
                      className="w-10 h-7 rounded-lg shrink-0 bg-cover bg-center border border-white/10"
                      style={{ backgroundImage: `url(${bg.url})` }}
                    />
                    <div className="overflow-hidden text-left">
                      <div className="text-[11px] truncate">{bg.title}</div>
                      <div className="text-[9px] text-slate-400 truncate">{bg.subtitle}</div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="text-[10px] text-slate-500 text-center border-t border-white/10 pt-2">
                {isAutoPlay ? 'Auto-rotating every 9s' : 'Auto-rotation paused'}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
