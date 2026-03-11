import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import type { Song } from "../backend";

interface PlayerContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  queue: Song[];
  currentTime: number;
  duration: number;
  volume: number;
  playSong: (song: Song, newQueue?: Song[]) => void;
  pauseSong: () => void;
  resumeSong: () => void;
  nextSong: () => void;
  previousSong: () => void;
  seekTo: (time: number) => void;
  setVolume: (volume: number) => void;
  togglePlayPause: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [queue, setQueue] = useState<Song[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.7);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const nextSongRef = useRef<(() => void) | undefined>(undefined);

  // Initialize audio element
  useEffect(() => {
    const audio = new Audio();
    audio.volume = volume;
    audioRef.current = audio;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      if (nextSongRef.current) {
        nextSongRef.current();
      }
    };
    const handleError = (e: ErrorEvent) => {
      console.error("Audio playback error:", e);
      setIsPlaying(false);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("durationchange", handleDurationChange);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError as EventListener);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("durationchange", handleDurationChange);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError as EventListener);
      audio.pause();
      audio.src = "";
    };
  }, [volume]);

  const playSong = useCallback(
    async (song: Song, newQueue?: Song[]) => {
      if (!audioRef.current) return;

      setCurrentSong(song);
      if (newQueue) {
        setQueue(newQueue);
      }

      try {
        // Get audio URL from blob
        if (song.audioBlob) {
          const audioBytes = await song.audioBlob.getBytes();
          const blob = new Blob([audioBytes], { type: "audio/mpeg" });
          const url = URL.createObjectURL(blob);

          // Clean up previous URL
          if (audioRef.current.src) {
            URL.revokeObjectURL(audioRef.current.src);
          }

          audioRef.current.src = url;
          await audioRef.current.play();
          setIsPlaying(true);
        }
      } catch (error) {
        console.error("Error playing song:", error);
        setIsPlaying(false);
      }
    },
    []
  );

  const pauseSong = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const resumeSong = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play().catch(console.error);
      setIsPlaying(true);
    }
  }, []);

  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      pauseSong();
    } else {
      resumeSong();
    }
  }, [isPlaying, pauseSong, resumeSong]);

  const seekTo = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const nextSong = useCallback(() => {
    if (!currentSong || queue.length === 0) return;

    const currentIndex = queue.findIndex((s) => s.id === currentSong.id);
    if (currentIndex < queue.length - 1) {
      playSong(queue[currentIndex + 1], queue);
    }
  }, [currentSong, queue, playSong]);

  // Update ref for nextSong
  useEffect(() => {
    nextSongRef.current = nextSong;
  }, [nextSong]);

  const previousSong = useCallback(() => {
    if (!currentSong || queue.length === 0) return;

    const currentIndex = queue.findIndex((s) => s.id === currentSong.id);
    if (currentIndex > 0) {
      playSong(queue[currentIndex - 1], queue);
    } else {
      // Restart current song if at the beginning
      seekTo(0);
    }
  }, [currentSong, queue, playSong, seekTo]);

  const setVolume = useCallback((newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolumeState(clampedVolume);
    if (audioRef.current) {
      audioRef.current.volume = clampedVolume;
    }
  }, []);

  const value: PlayerContextType = {
    currentSong,
    isPlaying,
    queue,
    currentTime,
    duration,
    volume,
    playSong,
    pauseSong,
    resumeSong,
    nextSong,
    previousSong,
    seekTo,
    setVolume,
    togglePlayPause,
  };

  return (
    <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return context;
}
