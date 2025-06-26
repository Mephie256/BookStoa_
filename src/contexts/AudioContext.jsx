import { createContext, useContext, useState, useRef, useEffect } from 'react';

const AudioContext = createContext();

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};

export const AudioProvider = ({ children }) => {
  const audioRef = useRef(null);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(75);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(null);

  // Format time in MM:SS format
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Update audio source when track changes
  useEffect(() => {
    if (audioRef.current && currentTrack && (currentTrack.audioLink || currentTrack.audio_link)) {
      const audioUrl = currentTrack.audioLink || currentTrack.audio_link;
      console.log('🎵 Global Audio: Loading track:', currentTrack.title, audioUrl);
      setIsLoading(true);
      audioRef.current.src = audioUrl;
      audioRef.current.load();
    }
  }, [currentTrack]);

  // Handle audio events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
      console.log('🎵 Global Audio: Loaded, duration:', audio.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      setProgress((audio.currentTime / audio.duration) * 100);
      // Ensure loading is false when audio is playing
      if (isLoading && audio.currentTime > 0) {
        setIsLoading(false);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
      setIsLoading(false);
      console.log('🎵 Global Audio: Track ended');
    };

    const handleError = (e) => {
      console.error('🎵 Global Audio: Error:', e);
      setIsLoading(false);
      setIsPlaying(false);
    };

    const handleLoadStart = () => {
      setIsLoading(true);
      
      // Clear any existing timeout
      if (loadingTimeout) {
        clearTimeout(loadingTimeout);
      }
      
      // Set a timeout to prevent infinite loading (10 seconds max)
      const timeout = setTimeout(() => {
        console.log('🎵 Global Audio: Loading timeout');
        setIsLoading(false);
      }, 10000);
      
      setLoadingTimeout(timeout);
    };

    const handleCanPlay = () => {
      setIsLoading(false);
      if (loadingTimeout) {
        clearTimeout(loadingTimeout);
        setLoadingTimeout(null);
      }
    };

    const handlePlay = () => {
      setIsLoading(false);
      if (loadingTimeout) {
        clearTimeout(loadingTimeout);
        setLoadingTimeout(null);
      }
      console.log('🎵 Global Audio: Playing');
    };

    const handlePlaying = () => {
      setIsLoading(false);
      if (loadingTimeout) {
        clearTimeout(loadingTimeout);
        setLoadingTimeout(null);
      }
    };

    const handleWaiting = () => {
      setIsLoading(true);
    };

    const handleCanPlayThrough = () => {
      setIsLoading(false);
      if (loadingTimeout) {
        clearTimeout(loadingTimeout);
        setLoadingTimeout(null);
      }
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('canplaythrough', handleCanPlayThrough);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('canplaythrough', handleCanPlayThrough);
      
      // Clear timeout on cleanup
      if (loadingTimeout) {
        clearTimeout(loadingTimeout);
      }
    };
  }, [isLoading, loadingTimeout]);

  // Handle play/pause
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack || !(currentTrack.audioLink || currentTrack.audio_link)) return;

    if (isPlaying) {
      setIsLoading(true);
      audio.play().then(() => {
        console.log('🎵 Global Audio: Play started successfully');
        setIsLoading(false);
      }).catch(error => {
        console.error('🎵 Global Audio: Play error:', error);
        setIsPlaying(false);
        setIsLoading(false);
      });
    } else {
      audio.pause();
      setIsLoading(false);
    }
  }, [isPlaying, currentTrack]);

  // Handle volume changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  // Play a new track
  const playTrack = (track) => {
    console.log('🎵 Global Audio: Playing new track:', track.title);
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  // Toggle play/pause
  const togglePlayPause = () => {
    if (!currentTrack || !(currentTrack.audioLink || currentTrack.audio_link)) {
      console.log('🎵 Global Audio: No track available');
      return;
    }
    
    if (isLoading) {
      console.log('🎵 Global Audio: Loading, please wait...');
      return;
    }
    
    setIsPlaying(!isPlaying);
  };

  // Seek to position
  const seekTo = (percentage) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;

    const newTime = (percentage / 100) * duration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
    setProgress(percentage);
  };

  // Set volume
  const changeVolume = (newVolume) => {
    setVolume(Math.max(0, Math.min(100, newVolume)));
  };

  const value = {
    // Audio element
    audioRef,
    
    // State
    currentTrack,
    isPlaying,
    volume,
    progress,
    currentTime,
    duration,
    isLoading,
    
    // Actions
    playTrack,
    togglePlayPause,
    seekTo,
    changeVolume,
    
    // Utilities
    formatTime
  };

  return (
    <AudioContext.Provider value={value}>
      {/* Global audio element */}
      <audio ref={audioRef} preload="metadata" />
      {children}
    </AudioContext.Provider>
  );
};
