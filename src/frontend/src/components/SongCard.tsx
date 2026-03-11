import { Play, Pause, Heart } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePlayer } from "../contexts/PlayerContext";
import { useLikeSong, useGetLikedSongs } from "../hooks/useQueries";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import type { Song } from "../backend";
import { cn } from "@/lib/utils";

interface SongCardProps {
  song: Song;
  songs?: Song[];
}

export function SongCard({ song, songs = [] }: SongCardProps) {
  const { playSong, pauseSong, currentSong, isPlaying } = usePlayer();
  const { identity } = useInternetIdentity();
  const likeMutation = useLikeSong();
  const { data: likedSongIds = [] } = useGetLikedSongs(
    identity?.getPrincipal() || null
  );

  const isCurrentSong = currentSong?.id === song.id;
  const isLiked = likedSongIds.some((id) => id === song.id);

  const handlePlayPause = () => {
    if (isCurrentSong && isPlaying) {
      pauseSong();
    } else {
      playSong(song, songs.length > 0 ? songs : [song]);
    }
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (identity) {
      likeMutation.mutate(song.id);
    }
  };

  const formatDuration = (seconds: bigint) => {
    const sec = Number(seconds);
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Card
      className="group relative overflow-hidden bg-card hover:bg-card/80 transition-all cursor-pointer border-0 animate-scale-in"
      onClick={handlePlayPause}
    >
      <div className="aspect-square relative">
        <img
          src={song.coverUrl || "/placeholder-album.png"}
          alt={song.title}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <Button
          size="icon"
          className={cn(
            "absolute bottom-4 right-4 h-12 w-12 rounded-full bg-primary shadow-lg transition-all",
            "opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0",
            isCurrentSong && isPlaying && "opacity-100 translate-y-0"
          )}
          onClick={handlePlayPause}
        >
          {isCurrentSong && isPlaying ? (
            <Pause className="h-5 w-5 fill-primary-foreground" />
          ) : (
            <Play className="h-5 w-5 fill-primary-foreground ml-0.5" />
          )}
        </Button>
      </div>
      <div className="p-4 space-y-1">
        <h3 className="font-semibold text-sm line-clamp-1 text-foreground">
          {song.title}
        </h3>
        <p className="text-xs text-muted-foreground line-clamp-1">
          {song.artist}
        </p>
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-muted-foreground">
            {formatDuration(song.duration)}
          </span>
          {identity && (
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 hover:scale-110 transition-transform"
              onClick={handleLike}
            >
              <Heart
                className={cn(
                  "h-4 w-4",
                  isLiked
                    ? "fill-primary text-primary"
                    : "text-muted-foreground"
                )}
              />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
