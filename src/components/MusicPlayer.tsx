import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward } from 'lucide-react';

const COVER_ART = "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?q=80&w=1000&auto=format&fit=crop"; // Guitar-themed cover art
const AUDIO_SRC = `${import.meta.env.BASE_URL}audio/cover.mp3`;

export default function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const [hasError, setHasError] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  // Handle Play/Pause
  const togglePlayPause = () => {
    if (audioRef.current && !hasError) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.error("Playback failed:", error);
            setHasError(true);
            setIsPlaying(false);
          });
        }
      }
      if (!hasError) {
        setIsPlaying(!isPlaying);
      }
    }
  };

  // Set up audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const setAudioData = () => {
      setDuration(audio.duration);
      setHasError(false);
    };

    const setAudioTime = () => {
      setCurrentTime(audio.currentTime);
      // Trigger lyric appearance roughly around 10 seconds for the effect
      if (audio.currentTime > 5 && !showLyrics) {
        setShowLyrics(true);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };
    
    const handleError = () => {
        setHasError(true);
        setIsPlaying(false);
    }

    audio.addEventListener('loadedmetadata', setAudioData);
    audio.addEventListener('timeupdate', setAudioTime);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('loadedmetadata', setAudioData);
      audio.removeEventListener('timeupdate', setAudioTime);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [showLyrics]);

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const formatTime = (time: number) => {
    if (time && !isNaN(time)) {
      const minutes = Math.floor(time / 60);
      const formatMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
      const seconds = Math.floor(time % 60);
      const formatSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;
      return `${formatMinutes}:${formatSeconds}`;
    }
    return '00:00';
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressBarRef.current && audioRef.current) {
      const rect = progressBarRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const progressRatio = clickX / rect.width;
      const newTime = progressRatio * duration;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const progressPercentage = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="flex flex-col items-center justify-center w-full h-full max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-24 relative z-10">
      
      {/* Hidden Audio Element */}
      <audio ref={audioRef} src={AUDIO_SRC} preload="metadata" />

      {/* Main Glass Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="glass-panel w-full max-w-sm rounded-[2.5rem] p-6 md:p-8 flex flex-col items-center relative overflow-hidden"
      >
        {/* Soft Glow behind cover art */}
        <div 
          className="absolute top-10 left-1/2 -translate-x-1/2 w-48 h-48 bg-blue-500/20 blur-[60px] rounded-full pointer-events-none"
        />

        {/* Cover Art */}
        <motion.div 
          className="relative w-64 h-64 md:w-72 md:h-72 rounded-2xl overflow-hidden shadow-2xl mb-8 z-10"
          animate={{ scale: isPlaying ? 1.02 : 1 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          style={{
            boxShadow: isPlaying ? '0 20px 40px -10px rgba(0, 50, 100, 0.4)' : '0 10px 30px -10px rgba(0,0,0,0.5)'
          }}
        >
          <img 
            src={COVER_ART} 
            alt="Cover Art" 
            className="w-full h-full object-cover transition-transform duration-700 ease-out hover:scale-105"
            draggable="false"
          />
        </motion.div>

        {/* Track Info */}
        <div className="text-center w-full mb-8 z-10">
          <h1 className="font-serif text-3xl md:text-4xl font-medium tracking-tight mb-2 text-white/90">
            If You Love Her
          </h1>
          <p className="font-sans text-sm md:text-base text-white/50 tracking-wider uppercase font-medium">
            Forest Blakk
          </p>
          {hasError && (
             <p className="text-xs text-red-400 mt-2">Audio file failed to load or is empty.</p>
          )}
        </div>

        {/* Progress Bar */}
        <div className="w-full mb-8 z-10">
          <div 
            ref={progressBarRef}
            className="h-1.5 w-full bg-white/10 rounded-full cursor-pointer overflow-hidden relative group"
            onClick={handleProgressClick}
          >
            <div 
              className="h-full bg-gradient-to-r from-blue-300 to-purple-400 rounded-full absolute top-0 left-0 transition-opacity duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
            {/* Hover thumb indicator could go here */}
          </div>
          <div className="flex items-center justify-between mt-2 text-xs font-mono text-white/40">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between w-full px-4 z-10">
          <button 
            onClick={toggleMute}
            className="p-2 sm:p-3 text-white/50 hover:text-white/90 transition-colors focus:outline-none"
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          
          <div className="flex items-center gap-4 sm:gap-6">
            <button className="text-white/50 hover:text-white/90 transition-colors focus:outline-none">
              <SkipBack size={24} className="fill-current" />
            </button>
            
            <motion.button 
              onClick={togglePlayPause}
              animate={!isPlaying ? { scale: [1, 1.05, 1] } : { scale: 1 }}
              transition={{ repeat: !isPlaying ? Infinity : 0, duration: 2, ease: "easeInOut" }}
              className="w-16 h-16 sm:w-18 sm:h-18 flex items-center justify-center bg-white text-black rounded-full shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:scale-105 transition-transform focus:outline-none relative group"
            >
              {isPlaying ? (
                <Pause size={28} className="fill-current group-hover:scale-110 transition-transform" />
              ) : (
                <Play size={28} className="fill-current ml-1 group-hover:scale-110 transition-transform" />
              )}
            </motion.button>
            
            <button className="text-white/50 hover:text-white/90 transition-colors focus:outline-none">
              <SkipForward size={24} className="fill-current" />
            </button>
          </div>

          <div className="w-[36px]" /> {/* Spacer to balance volume icon */}
        </div>
      </motion.div>

      {/* Lyrics Scroll / Float */}
      <AnimatePresence>
        {showLyrics && (
          <motion.div
            initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute bottom-8 md:bottom-12 left-0 right-0 text-center px-4 pointer-events-none"
          >
            <p className="font-serif italic text-lg md:text-xl text-white/40 tracking-wider">
              "If you love her, let her know..."
            </p>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
