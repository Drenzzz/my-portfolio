"use client";

import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Music } from "lucide-react";
import { playlist } from "@/data/playlist";

const formatTime = (value: number) => {
  if (!Number.isFinite(value) || value < 0) return "0:00";
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${seconds}`;
};

export function MusicPlayer() {
  const [currentTrackIdx, setCurrentTrackIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentTrack = playlist[currentTrackIdx];

  useEffect(() => {
    // Try to load saved volume from local storage
    if (typeof window !== "undefined") {
      try {
        const savedVolume = localStorage.getItem("drenzzz-volume");
        if (savedVolume) setVolume(parseInt(savedVolume, 10));
        const savedMuted = localStorage.getItem("drenzzz-muted");
        if (savedMuted) setIsMuted(savedMuted === "true");
        
        // Load saved track
        const savedTrackIdx = localStorage.getItem("drenzzz-track-idx");
        if (savedTrackIdx) setCurrentTrackIdx(parseInt(savedTrackIdx, 10));
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
      audioRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("drenzzz-volume", volume.toString());
        localStorage.setItem("drenzzz-muted", isMuted.toString());
        localStorage.setItem("drenzzz-track-idx", currentTrackIdx.toString());
      } catch (e) {}
    }
  }, [volume, isMuted, currentTrackIdx]);

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    setHasInteracted(true);
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => console.error("Playback failed:", e));
    }
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    setHasInteracted(true);
    setCurrentTrackIdx((prev) => (prev + 1) % playlist.length);
  };

  const handlePrev = () => {
    setHasInteracted(true);
    setCurrentTrackIdx((prev) => (prev - 1 + playlist.length) % playlist.length);
  };

  const onTimeUpdate = () => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime);
    }
  };

  const onLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const onEnded = () => {
    handleNext();
  };

  useEffect(() => {
    if (hasInteracted && isPlaying && audioRef.current) {
      audioRef.current.play().catch(e => console.error("Auto-play next track failed:", e));
    }
  }, [currentTrackIdx]);

  return (
    <div className="h-full bg-[#F4F4F5] border-4 border-black rounded-xl shadow-[8px_8px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:translate-x-1 hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all flex flex-col p-5 group relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute -right-6 -bottom-6 opacity-10 pointer-events-none transform -rotate-12 group-hover:rotate-0 transition-transform duration-500">
        <Music className="w-48 h-48" />
      </div>

      <div className="flex items-center justify-between mb-4 z-10">
        <h3 className="font-head text-2xl font-black uppercase tracking-tight text-black flex items-center gap-2">
          <span className="w-3 h-3 bg-black rounded-full animate-pulse" style={{ animationDuration: isPlaying ? '1s' : '0s' }}></span>
          Now Playing
        </h3>

        <div className="flex bg-white border-2 border-black rounded shadow-brutal-sm rounded-sm">
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className="p-1.5 hover:bg-black hover:text-white transition-colors border-r-2 border-black"
          >
            {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={volume} 
            onChange={(e) => setVolume(Number(e.target.value))}
            className="w-16 mx-2 accent-black"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 mb-4 flex-1 z-10 bg-white border-4 border-black p-4 rounded-xl shadow-[4px_4px_0px_rgba(0,0,0,1)]">
        {/* Vinyl Record */}
        <div className={`w-16 h-16 rounded-full border-4 border-black bg-neutral-900 flex items-center justify-center shrink-0 shadow-inner ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }}>
          <div className="w-5 h-5 bg-[#E6A627] rounded-full border-2 border-black"></div>
        </div>

        {/* Track Info */}
        <div className="overflow-hidden w-full">
          <div className="font-black text-xl text-black truncate leading-none mb-1">{currentTrack.title}</div>
          <div className="text-sm font-bold text-muted-foreground uppercase tracking-widest truncate">{currentTrack.artist}</div>
        </div>
      </div>

      <div className="z-10 bg-black text-[#F4F4F5] p-3 rounded-xl border-4 border-black relative">
        <div className="absolute inset-0 bg-white translate-x-1 translate-y-1 rounded-xl -z-10 border-4 border-black"></div>
        
        {/* Progress Bar */}
        <div className="flex items-center gap-2 mb-2 px-1">
          <span className="text-[10px] font-black tabular-nums">{formatTime(progress)}</span>
          <div className="h-2 flex-grow bg-white/20 rounded-full overflow-hidden border border-white/30 relative">
            <div 
              className="absolute top-0 left-0 h-full bg-[#E6A627] transition-all"
              style={{ width: `${(progress / (duration || 1)) * 100}%` }}
            ></div>
          </div>
          <span className="text-[10px] font-black tabular-nums">{formatTime(duration)}</span>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-6">
          <button onClick={handlePrev} className="hover:-translate-x-1 transition-transform" aria-label="Previous Track">
            <SkipBack className="w-5 h-5 fill-current" />
          </button>
          <button 
            onClick={handlePlayPause}
            className="w-10 h-10 bg-[#E6A627] text-black border-2 border-black rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-[2px_2px_0px_rgba(255,255,255,1)]"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-black" /> : <Play className="w-5 h-5 fill-black ml-1" />}
          </button>
          <button onClick={handleNext} className="hover:translate-x-1 transition-transform" aria-label="Next Track">
            <SkipForward className="w-5 h-5 fill-current" />
          </button>
        </div>
      </div>

      <audio
        ref={audioRef}
        src={currentTrack.src}
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoadedMetadata}
        onEnded={onEnded}
      />
    </div>
  );
}
