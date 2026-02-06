import { useState, useRef, useEffect } from 'react';
import {
  Volume2,
  Shuffle,
  Repeat,
  Smartphone,
  MoreHorizontal,
  List
} from 'lucide-react';
import { FaPlay, FaPause, FaForward } from 'react-icons/fa';
import { CiBookmark } from 'react-icons/ci';
import Spinner from './ui/Spinner';

const DesktopAudioPlayer = ({ currentTrack, isPlaying, setIsPlaying }) => {
  const audioRef = useRef(null);
  const [volume, setVolume] = useState(75);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(null);

  // Default track data if none provided
  const track = currentTrack || {
    title: 'The Purpose Driven Life',
    author: 'Rick Warren',
    cover_file_url: 'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1320532872i/4063.jpg',
    audioLink: null,
    audio_link: null
  };

  // Format time in MM:SS format
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Update audio source when track changes
  useEffect(() => {
    if (audioRef.current && track && (track.audioLink || track.audio_link)) {
      const audioUrl = track.audioLink || track.audio_link;
      console.log('🎵 Loading audio:', audioUrl);
      setIsLoading(true);
      audioRef.current.src = audioUrl;
      audioRef.current.load();
    }
  }, [track]);

  // Handle audio events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
      console.log('🎵 Audio loaded, duration:', audio.duration);
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
    };

    const handleError = (e) => {
      console.error('🎵 Audio error:', e);
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
        console.log('🎵 Loading timeout - stopping loading state');
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
      console.log('🎵 Audio started playing');
    };

    const handlePlaying = () => {
      setIsLoading(false);
      if (loadingTimeout) {
        clearTimeout(loadingTimeout);
        setLoadingTimeout(null);
      }
      console.log('🎵 Audio is playing');
    };

    const handleWaiting = () => {
      setIsLoading(true);
      console.log('🎵 Audio is buffering');
    };

    const handleCanPlayThrough = () => {
      setIsLoading(false);
      console.log('🎵 Audio can play through');
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
    if (!audio || !track || !(track.audioLink || track.audio_link)) return;

    if (isPlaying) {
      setIsLoading(true);
      audio.play().then(() => {
        console.log('🎵 Audio play started successfully');
        setIsLoading(false);
      }).catch(error => {
        console.error('🎵 Play error:', error);
        setIsPlaying(false);
        setIsLoading(false);
      });
    } else {
      audio.pause();
      setIsLoading(false);
    }
  }, [isPlaying, track]);

  // Handle volume changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  const togglePlayPause = () => {
    if (!track || !(track.audioLink || track.audio_link)) {
      console.log('🎵 No audio link available');
      return;
    }

    if (isLoading) {
      console.log('🎵 Audio is loading, please wait...');
      return;
    }

    setIsPlaying(!isPlaying);
  };

  const handleProgressClick = (e) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;

    audio.currentTime = newTime;
    setCurrentTime(newTime);
    setProgress((newTime / duration) * 100);
  };

  const handleVolumeClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newVolume = (clickX / rect.width) * 100;
    setVolume(Math.max(0, Math.min(100, newVolume)));
  };

  // Don't show player if no audio track
  if (!track || !(track.audioLink || track.audio_link)) {
    return null;
  }

  return (
    <>
      {/* Hidden audio element */}
      <audio ref={audioRef} preload="metadata" />

      <div className="hidden md:block fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-xl border-t border-gray-700/50 px-4 py-3 z-50">
        <div className="flex items-center justify-between max-w-screen-xl mx-auto">
          {/* Left: Track Info */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="relative group cursor-pointer w-14 h-14 flex-shrink-0">
              <img
                src={track.cover_file_url || track.coverUrl || track.cover_url || track.image_url || track.thumbnail || 'https://via.placeholder.com/56x56/11b53f/ffffff?text=📖'}
                alt={track.title}
                className="w-full h-full rounded-lg object-cover"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/56x56/11b53f/ffffff?text=📖';
                }}
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                {isLoading ? (
                  <Spinner size="sm" color="white" />
                ) : isPlaying ? (
                  <Pause className="w-5 h-5 text-white" />
                ) : (
                  <Play className="w-5 h-5 text-white" />
                )}
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h4 className="text-white text-sm font-medium truncate">
                  {track.title}
                </h4>
                {isLoading && (
                  <Spinner size="sm" color="green" />
                )}
                <CiBookmark className="w-5 h-5 text-gray-400 hover:text-green-400 cursor-pointer transition-colors" />
              </div>
              <p className="text-gray-400 text-xs truncate hover:underline cursor-pointer">
                {track.author} {isLoading && '• Loading...'}
              </p>
            </div>
          </div>

        {/* Center: Main Controls */}
        <div className="flex flex-col items-center gap-2 px-8">
          {/* Control Buttons */}
          <div className="flex items-center gap-4">
            <button className="text-gray-400 hover:text-white transition-colors">
              <Shuffle className="w-4 h-4" />
            </button>
            <button className="text-gray-400 hover:text-white transition-colors">
              <FaForward className="w-4 h-4 transform scale-x-[-1]" />
            </button>
            <button
              onClick={togglePlayPause}
              disabled={isLoading}
              className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-70 disabled:cursor-not-allowed"
              title={isLoading ? 'Loading...' : isPlaying ? 'Pause' : 'Play'}
            >
              {isLoading ? (
                <Spinner size="sm" color="black" />
              ) : isPlaying ? (
                <FaPause className="w-4 h-4 text-black" />
              ) : (
                <FaPlay className="w-4 h-4 text-black ml-0.5" />
              )}
            </button>
            <button className="text-gray-400 hover:text-white transition-colors">
              <FaForward className="w-4 h-4" />
            </button>
            <button className="text-gray-400 hover:text-white transition-colors">
              <Repeat className="w-4 h-4" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center gap-2 w-96">
            <span className="text-xs text-gray-400 w-10 text-right">{formatTime(currentTime)}</span>
            <div className="flex-1 group cursor-pointer" onClick={handleProgressClick}>
              <div className="h-1 bg-gray-600 rounded-full relative">
                <div
                  className="h-1 bg-white rounded-full relative group-hover:bg-green-400 transition-colors"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
              </div>
            </div>
            <span className="text-xs text-gray-400 w-10">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Right: Additional Controls */}
        <div className="flex items-center gap-3 min-w-0 flex-1 justify-end">
          <button className="text-gray-400 hover:text-white transition-colors">
            <List className="w-4 h-4" />
          </button>
          <button className="text-gray-400 hover:text-white transition-colors">
            <Smartphone className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <button className="text-gray-400 hover:text-white transition-colors">
              <Volume2 className="w-4 h-4" />
            </button>
            <div className="w-20 group cursor-pointer" onClick={handleVolumeClick}>
              <div className="h-1 bg-gray-600 rounded-full relative">
                <div
                  className="h-1 bg-white rounded-full relative group-hover:bg-green-400 transition-colors"
                  style={{ width: `${volume}%` }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
              </div>
            </div>
          </div>
          <button className="text-gray-400 hover:text-white transition-colors">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
    </>
  );
};

export default DesktopAudioPlayer;
