import { useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Heart,
  Shuffle,
  Repeat,
  Smartphone,
  MoreHorizontal,
  List
} from 'lucide-react';
import { useAudio } from '../contexts/AudioContext';

const GlobalAudioPlayer = () => {
  const {
    currentTrack,
    isPlaying,
    volume,
    progress,
    currentTime,
    duration,
    isLoading,
    togglePlayPause,
    seekTo,
    changeVolume,
    formatTime
  } = useAudio();

  // Handle progress bar click
  const handleProgressClick = (e) => {
    if (!duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = (clickX / rect.width) * 100;
    seekTo(percentage);
  };

  // Handle volume bar click
  const handleVolumeClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newVolume = (clickX / rect.width) * 100;
    changeVolume(Math.max(0, Math.min(100, newVolume)));
  };

  // Don't show player if no track
  if (!currentTrack || !(currentTrack.audioLink || currentTrack.audio_link)) {
    return null;
  }

  return (
    <div className="hidden md:block fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-xl border-t border-gray-700/50 px-4 py-3 z-50">
      <div className="flex items-center justify-between max-w-screen-xl mx-auto">
        {/* Left: Track Info */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="relative group cursor-pointer">
            <img
              src={currentTrack.cover_file_url || currentTrack.coverUrl || currentTrack.cover_url || currentTrack.image_url || currentTrack.thumbnail || 'https://via.placeholder.com/56x56/11b53f/ffffff?text=📖'}
              alt={currentTrack.title}
              className="w-14 h-14 rounded-lg object-cover"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/56x56/11b53f/ffffff?text=📖';
              }}
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
                {currentTrack.title}
              </h4>
              {isLoading && (
                <div className="w-3 h-3 border border-green-400 border-t-transparent rounded-full animate-spin"></div>
              )}
              <Heart className="w-4 h-4 text-gray-400 hover:text-green-400 cursor-pointer transition-colors" />
            </div>
            <p className="text-gray-400 text-xs truncate hover:underline cursor-pointer">
              {currentTrack.author} {isLoading && '• Loading...'}
            </p>
          </div>
        </div>

        {/* Center: Player Controls */}
        <div className="flex flex-col items-center gap-2 flex-1 max-w-md">
          {/* Control Buttons */}
          <div className="flex items-center gap-4">
            <button className="text-gray-400 hover:text-white transition-colors">
              <Shuffle className="w-4 h-4" />
            </button>
            <button className="text-gray-400 hover:text-white transition-colors">
              <SkipBack className="w-5 h-5" />
            </button>
            <button
              onClick={togglePlayPause}
              disabled={isLoading}
              className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-70 disabled:cursor-not-allowed"
              title={isLoading ? 'Loading...' : isPlaying ? 'Pause' : 'Play'}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              ) : isPlaying ? (
                <Pause className="w-4 h-4 text-black" />
              ) : (
                <Play className="w-4 h-4 text-black ml-0.5" />
              )}
            </button>
            <button className="text-gray-400 hover:text-white transition-colors">
              <SkipForward className="w-5 h-5" />
            </button>
            <button className="text-gray-400 hover:text-white transition-colors">
              <Repeat className="w-4 h-4" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center gap-2 w-full max-w-md">
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

        {/* Right: Volume & More */}
        <div className="flex items-center gap-3 flex-1 justify-end">
          <button className="text-gray-400 hover:text-white transition-colors hidden md:block">
            <List className="w-4 h-4" />
          </button>
          <button className="text-gray-400 hover:text-white transition-colors hidden md:block">
            <Smartphone className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 hidden md:flex">
            <Volume2 className="w-4 h-4 text-gray-400" />
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
  );
};

export default GlobalAudioPlayer;
