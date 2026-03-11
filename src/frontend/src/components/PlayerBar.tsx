import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { usePlayer } from "../contexts/PlayerContext";
import { useState } from "react";

export function PlayerBar() {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    togglePlayPause,
    nextSong,
    previousSong,
    seekTo,
    setVolume,
  } = usePlayer();
  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(volume);

  if (!currentSong) {
    return null;
  }

  const formatTime = (seconds: number) => {
    if (!isFinite(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSeek = (value: number[]) => {
    seekTo(value[0]);
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (newVolume > 0) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      setVolume(previousVolume);
      setIsMuted(false);
    } else {
      setPreviousVolume(volume);
      setVolume(0);
      setIsMuted(true);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-sidebar border-t border-sidebar-border shadow-player z-50">
      <div className="flex items-center justify-between px-4 py-3 gap-4">
        {/* Song Info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <img
            src={currentSong.coverUrl || "/placeholder-album.png"}
            alt={currentSong.title}
            className="w-14 h-14 rounded object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-sm truncate text-sidebar-foreground">
              {currentSong.title}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {currentSong.artist}
            </p>
          </div>
        </div>

        {/* Player Controls */}
        <div className="flex flex-col items-center gap-2 flex-1 max-w-2xl">
          <div className="flex items-center gap-4">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-sidebar-foreground hover:text-primary"
              onClick={previousSong}
            >
              <SkipBack className="h-5 w-5 fill-current" />
            </Button>
            <Button
              size="icon"
              className="h-10 w-10 rounded-full bg-primary hover:bg-primary/90 hover:scale-105 transition-all"
              onClick={togglePlayPause}
            >
              {isPlaying ? (
                <Pause className="h-5 w-5 fill-primary-foreground" />
              ) : (
                <Play className="h-5 w-5 fill-primary-foreground ml-0.5" />
              )}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-sidebar-foreground hover:text-primary"
              onClick={nextSong}
            >
              <SkipForward className="h-5 w-5 fill-current" />
            </Button>
          </div>
          <div className="flex items-center gap-2 w-full">
            <span className="text-xs text-muted-foreground w-10 text-right">
              {formatTime(currentTime)}
            </span>
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={1}
              onValueChange={handleSeek}
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground w-10">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-2 flex-1 justify-end">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-sidebar-foreground hover:text-primary"
            onClick={toggleMute}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="h-5 w-5" />
            ) : (
              <Volume2 className="h-5 w-5" />
            )}
          </Button>
          <Slider
            value={[isMuted ? 0 : volume]}
            max={1}
            step={0.01}
            onValueChange={handleVolumeChange}
            className="w-24"
          />
        </div>
      </div>
    </div>
  );
}
