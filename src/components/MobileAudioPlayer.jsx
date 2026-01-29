import { useState } from 'react';

import {

  Play,

  Pause,

  SkipBack,

  SkipForward,

  Heart,

  MoreHorizontal,

  ChevronDown,

  Shuffle,

  Repeat,

  Volume2,

  Share,

  List

} from 'lucide-react';

import { useAudio } from '../contexts/AudioContext';



const MobileAudioPlayer = () => {

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

  const [isExpanded, setIsExpanded] = useState(false);

  const [isLiked, setIsLiked] = useState(false);

  const [isShuffled, setIsShuffled] = useState(false);

  const [repeatMode, setRepeatMode] = useState(0); // 0: off, 1: all, 2: one



  const toggleRepeat = () => {

    setRepeatMode((prev) => (prev + 1) % 3);

  };



  const getRepeatIcon = () => {

    if (repeatMode === 2) return <Repeat className="w-6 h-6 text-green-400" />;

    if (repeatMode === 1) return <Repeat className="w-6 h-6 text-white" />;

    return <Repeat className="w-6 h-6 text-gray-400" />;

  };



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



  // Don't render if no current track

  if (!currentTrack) {

    return null;

  }



  return (

    <>

      {/* Compact Player */}

      <div

        className="md:hidden fixed bottom-16 left-0 right-0 z-40 bg-gray-900/95 backdrop-blur-xl border-t border-gray-700/50 px-4 py-3 cursor-pointer shadow-2xl"

        onClick={() => setIsExpanded(true)}

      >

        <div className="flex items-center gap-4">

          {/* Track Info */}

          <div className="relative">

            <img

              src={currentTrack.cover_file_url || currentTrack.coverUrl || currentTrack.cover_url || currentTrack.image_url || currentTrack.thumbnail || 'https://via.placeholder.com/48x48/11b53f/ffffff?text=📖'}

              alt={currentTrack.title}

              className="w-12 h-12 rounded-lg object-cover shadow-lg border border-gray-700/50"

              onError={(e) => {

                e.target.src = 'https://via.placeholder.com/48x48/11b53f/ffffff?text=📖';

              }}

            />

            <div className="absolute inset-0 rounded-lg bg-gradient-to-t from-black/20 to-transparent"></div>

          </div>



          <div className="flex-1 min-w-0">

            <h4 className="text-white text-sm font-semibold truncate mb-0.5">{currentTrack.title}</h4>

            <p className="text-gray-400 text-xs truncate">{currentTrack.author}</p>

          </div>



          {/* Mobile Controls */}

          <div className="flex items-center gap-3">

            <button

              onClick={(e) => {

                e.stopPropagation();

                setIsLiked(!isLiked);

              }}

              className="text-gray-400 hover:text-green-400 transition-colors p-1.5 hover:bg-gray-800/50 rounded-full"

            >

              <Heart className={`w-5 h-5 ${isLiked ? 'fill-green-400 text-green-400' : ''}`} />

            </button>

            <button

              onClick={(e) => {

                e.stopPropagation();

                togglePlayPause();

              }}

              disabled={isLoading}

              className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-lg disabled:opacity-70"

            >

              {isLoading ? (

                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>

              ) : isPlaying ? (

                <Pause className="w-5 h-5 text-white" />

              ) : (

                <Play className="w-5 h-5 text-white ml-0.5" />

              )}

            </button>

          </div>

        </div>



        {/* Progress Bar */}

        <div className="mt-3">

          <div

            className="w-full bg-gray-700/50 rounded-full h-1.5 cursor-pointer"

            onClick={handleProgressClick}

          >

            <div

              className="bg-gradient-to-r from-green-400 to-green-500 h-1.5 rounded-full transition-all duration-150 relative"

              style={{ width: `${progress || 0}%` }}

            >

              <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-green-400 rounded-full shadow-lg"></div>

            </div>

          </div>

        </div>

      </div>



      {/* Full Screen Player Modal */}

      {isExpanded && (

        <div className="fixed inset-0 z-50 bg-gradient-to-b from-gray-900 via-gray-800 to-black">

          {/* Aurora Background Overlay */}

          <div className="absolute inset-0 opacity-40">

            <div className="w-full h-full bg-gradient-to-br from-green-900/50 via-green-800/20 to-gray-900/80"></div>

          </div>

          {/* Header */}

          <div className="relative z-10 flex items-center justify-between p-4 pt-12">

            <button

              onClick={() => setIsExpanded(false)}

              className="w-10 h-10 bg-gray-800/50 backdrop-blur-sm rounded-full flex items-center justify-center border border-gray-700/50 hover:bg-gray-700/50 transition-colors"

            >

              <ChevronDown className="w-6 h-6 text-white" />

            </button>

            <div className="text-center">

              <p className="text-white text-sm font-medium">PLAYING FROM LIBRARY</p>

              <p className="text-gray-300 text-xs">Christian Books</p>

            </div>

            <button className="w-10 h-10 bg-gray-800/50 backdrop-blur-sm rounded-full flex items-center justify-center border border-gray-700/50 hover:bg-gray-700/50 transition-colors">

              <MoreHorizontal className="w-6 h-6 text-white" />

            </button>

          </div>



          {/* Album Art */}

          <div className="relative z-10 px-8 py-8">

            <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl border border-gray-700/30">

              <img

                src={currentTrack.cover_file_url || currentTrack.coverUrl || currentTrack.cover_url || currentTrack.image_url || currentTrack.thumbnail || 'https://via.placeholder.com/400x400/11b53f/ffffff?text=📖'}

                alt={currentTrack.title}

                className="w-full h-full object-cover"

                onError={(e) => {

                  e.target.src = 'https://via.placeholder.com/400x400/11b53f/ffffff?text=📖';

                }}

              />

            </div>

          </div>



          {/* Track Info */}

          <div className="relative z-10 px-8 mb-6">

            <div className="flex items-start justify-between mb-2">

              <div className="flex-1 min-w-0">

                <h1 className="text-white text-2xl font-bold mb-1 truncate">{currentTrack.title}</h1>

                <p className="text-gray-300 text-lg truncate">{currentTrack.author}</p>

              </div>

              <button

                onClick={() => setIsLiked(!isLiked)}

                className="ml-4 p-2 hover:bg-gray-800/50 rounded-full transition-colors"

              >

                <Heart className={`w-7 h-7 ${isLiked ? 'fill-green-400 text-green-400' : 'text-gray-300 hover:text-white'}`} />

              </button>

            </div>

          </div>



          {/* Progress Section */}

          <div className="relative z-10 px-8 mb-8">

            <div className="relative mb-2">

              <div

                className="w-full bg-gray-600 rounded-full h-1 cursor-pointer"

                onClick={handleProgressClick}

              >

                <div

                  className="bg-green-400 h-1 rounded-full relative transition-all duration-150"

                  style={{ width: `${progress || 0}%` }}

                >

                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-green-400 rounded-full shadow-lg"></div>

                </div>

              </div>

            </div>

            <div className="flex justify-between text-gray-300 text-sm">

              <span>{formatTime(currentTime)}</span>

              <span>{formatTime(duration)}</span>

            </div>

          </div>



          {/* Controls */}

          <div className="relative z-10 px-8 mb-8">

            <div className="flex items-center justify-between mb-8">

              <button

                onClick={() => setIsShuffled(!isShuffled)}

                className="p-3 hover:bg-gray-800/50 rounded-full transition-colors"

              >

                <Shuffle className={`w-6 h-6 ${isShuffled ? 'text-green-400' : 'text-gray-300 hover:text-white'}`} />

              </button>

              <button className="p-3 hover:bg-gray-800/50 rounded-full transition-colors">

                <SkipBack className="w-8 h-8 text-white" />

              </button>

              <button

                onClick={togglePlayPause}

                disabled={isLoading}

                className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-2xl hover:scale-105 transition-transform border-2 border-green-400/30 disabled:opacity-70"

              >

                {isLoading ? (

                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>

                ) : isPlaying ? (

                  <Pause className="w-8 h-8 text-white" />

                ) : (

                  <Play className="w-8 h-8 text-white ml-1" />

                )}

              </button>

              <button className="p-3 hover:bg-gray-800/50 rounded-full transition-colors">

                <SkipForward className="w-8 h-8 text-white" />

              </button>

              <button

                onClick={toggleRepeat}

                className="p-3 hover:bg-gray-800/50 rounded-full transition-colors"

              >

                {getRepeatIcon()}

              </button>

            </div>

          </div>



          {/* Volume Control */}

          <div className="relative z-10 px-8 mb-6">

            <div className="flex items-center gap-4">

              <Volume2 className="w-5 h-5 text-gray-300" />

              <div

                className="flex-1 h-1 bg-gray-600 rounded-full cursor-pointer"

                onClick={handleVolumeClick}

              >

                <div

                  className="h-1 bg-green-400 rounded-full transition-all duration-150"

                  style={{ width: `${volume}%` }}

                ></div>

              </div>

              <span className="text-gray-300 text-sm w-8">{Math.round(volume)}</span>

            </div>

          </div>



          {/* Bottom Actions */}

          <div className="relative z-10 px-8 pb-8">

            <div className="flex items-center justify-between">

              <button className="p-3 hover:bg-gray-800/50 rounded-full transition-colors">

                <Share className="w-6 h-6 text-gray-300 hover:text-white" />

              </button>

              <button className="p-3 hover:bg-gray-800/50 rounded-full transition-colors">

                <List className="w-6 h-6 text-gray-300 hover:text-white" />

              </button>

            </div>

          </div>

        </div>

      )}

    </>

  );

};



export default MobileAudioPlayer;

