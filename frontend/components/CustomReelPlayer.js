"use client";

import { useState, useRef, useEffect } from "react";
import { Volume2, VolumeX, Play, Pause } from "lucide-react";

export default function CustomReelPlayer({ src, poster }) {
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = useRef(null);

  const toggleMute = (e) => {
    e.preventDefault();
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const togglePlay = (e) => {
    e.preventDefault();
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  // Ensure video plays continuously on mount
  useEffect(() => {
    if (videoRef.current) {
      // Force play promise handling to avoid play() interruption errors
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(error => {
        console.warn("Autoplay was prevented, requires user interaction", error);
        setIsPlaying(false);
      });
    }
  }, []);

  return (
    <div className="relative w-[280px] h-[500px] overflow-hidden rounded-[24px] border border-white/10 bg-[#0B0B0B] shadow-xl transition-all hover:border-[var(--saffron)] hover:shadow-[0_10px_40px_rgba(212,175,55,0.15)] group mx-auto">
      
      {/* Golden Corner Highlights */}
      <div className="absolute top-0 left-0 w-12 h-12 border-t-[3px] border-l-[3px] border-[var(--saffron)] rounded-tl-[24px] pointer-events-none z-10 opacity-90" />
      <div className="absolute top-0 right-0 w-12 h-12 border-t-[3px] border-r-[3px] border-[var(--saffron)] rounded-tr-[24px] pointer-events-none z-10 opacity-90" />
      <div className="absolute bottom-0 left-0 w-12 h-12 border-b-[3px] border-l-[3px] border-[var(--saffron)] rounded-bl-[24px] pointer-events-none z-10 opacity-90" />
      <div className="absolute bottom-0 right-0 w-12 h-12 border-b-[3px] border-r-[3px] border-[var(--saffron)] rounded-br-[24px] pointer-events-none z-10 opacity-90" />

      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-full object-cover"
        onClick={togglePlay}
      />
      
      {/* Overlay gradient for better icon visibility */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
      
      {/* Play/Pause Button */}
      <button
        onClick={togglePlay}
        className="absolute bottom-4 left-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition hover:bg-[var(--saffron)] hover:text-black hover:scale-105 active:scale-95 border border-white/20"
        aria-label={isPlaying ? "Pause video" : "Play video"}
      >
        {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-1" />}
      </button>

      {/* Mute/Unmute Button */}
      <button
        onClick={toggleMute}
        className="absolute bottom-4 right-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition hover:bg-[var(--saffron)] hover:text-black hover:scale-105 active:scale-95 border border-white/20"
        aria-label={isMuted ? "Unmute video" : "Mute video"}
      >
        {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
      </button>
    </div>
  );
}
