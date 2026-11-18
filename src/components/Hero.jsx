"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Smartphone, Sparkles, Play } from 'lucide-react';

export default function Hero({ user }) {
  const [isRotated, setIsRotated] = useState(false);
  const videoRef = useRef(null);

  const activateVideo = () => {
    if (!isRotated) {
      setIsRotated(true);
      if (videoRef.current) {
        videoRef.current.play();
      }
    }
  };

  return (
    <section id="hero" className="relative lg:min-h-screen flex items-center pt-40 pb-20 lg:pt-28 lg:pb-20 overflow-x-clip">
      {/* Background Effects */}
      <div className="absolute top-1/4 -left-1/4 w-[500px] h-[500px] bg-brand-primary/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-1/4 w-[600px] h-[600px] bg-brand-secondary/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10 w-full">
        <div className="flex flex-col gap-7">
          <div>
            <span className="inline-block px-3.5 py-1.5 rounded-full glass text-[10px] font-semibold tracking-widest text-brand-accent mb-6 uppercase">
              Nova versió disponible
            </span>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-tight text-[var(--theme-text-primary)] mb-6 leading-[1.1]">
              El teu armari, <br />
              <span className="text-gradient">intel·ligent.</span>
            </h1>
            <p className="text-base sm:text-lg text-[var(--theme-text-secondary)] max-w-xl leading-relaxed">
              Digitalitza la teva roba i deixa que la nostra Intel·ligència
              Artificial triï l'outfit perfecte per a tu cada matí.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Link 
              href={user ? "/app" : "/login"} 
              className="group relative inline-flex items-center justify-center gap-3 px-7 py-3.5 bg-[var(--theme-text-primary)] text-[var(--theme-bg)] rounded-full font-semibold text-sm transition-all duration-300 hover:scale-105"
              aria-label="Anar a l'app"
            >
              <Sparkles className="w-5 h-5 text-[var(--theme-bg)] transition-transform duration-300 group-hover:rotate-12" /> 
              Anar a l'app
            </Link>
            <Link 
              href="#" 
              className="group inline-flex items-center justify-center gap-3 px-7 py-3.5 glass text-[var(--theme-text-primary)] rounded-full font-semibold text-sm transition-all duration-300 hover:bg-[var(--theme-hover)]"
              aria-label="Disponible a Google Play"
            >
              <Smartphone className="w-5 h-5 text-[var(--theme-text-muted)] group-hover:text-[var(--theme-text-primary)] transition-colors duration-300" /> 
              Disponible a Google Play
            </Link>
          </div>
        </div>
        
        <div className="hidden lg:flex justify-center items-center">
          <div
            className={`relative w-[260px] h-[520px] bg-gradient-to-br from-[#1a1a1a] to-[#111] rounded-[36px] p-2.5 shadow-[0_50px_100px_rgba(0,0,0,0.4),0_20px_60px_rgba(99,102,241,0.1)] cursor-pointer origin-center ${
              isRotated ? "rotate-90" : ""
            }`}
            style={{ transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
            onMouseEnter={activateVideo}
            onClick={activateVideo}
            onTouchStart={activateVideo}
          >
            {/* Glass edge */}
            <div className="absolute inset-0 rounded-[36px] border border-white/[0.08] pointer-events-none" />
            
            {/* Notch */}
            <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-[100px] h-[22px] bg-[#111] rounded-b-[12px] z-20" />
            
            <div className="w-full h-full bg-black rounded-[28px] overflow-hidden relative flex items-center justify-center">
              <video
                ref={videoRef}
                className={`w-full h-full ${isRotated ? '-rotate-90 scale-[1.8] object-contain' : 'object-cover'}`}
                style={{ transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
                src="/video.mp4"
                muted
                loop
                playsInline
                poster="/logoEnteroBlanco.svg"
              ></video>
              
              <div className={`absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3 text-white p-5 text-center transition-opacity duration-400 ${isRotated ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
                <Play className="w-8 h-8 fill-current animate-bounce" />
                <span className="font-medium text-xs tracking-wide">Toca per veure el vídeo</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gradient fade-out into next section */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[var(--theme-bg)] to-transparent pointer-events-none" />
    </section>
  );
}
