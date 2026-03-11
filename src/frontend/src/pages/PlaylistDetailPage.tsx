import { useParams } from "@tanstack/react-router";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetUserPlaylists,
  useGetLikedSongs,
  useGetAllSongs,
} from "../hooks/useQueries";
import { Play, Heart, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePlayer } from "../contexts/PlayerContext";
import { useMemo } from "react";
import type { Song } from "../backend";
import { cn } from "@/lib/utils";

export function PlaylistDetailPage() {
  const params = useParams({ from: "/playlist/$name" });
  const playlistName = params.name;
  const { identity } = useInternetIdentity();
  const principal = identity?.getPrincipal() || null;
  const { data: playlists = [], isLoading: playlistsLoading } =
    useGetUserPlaylists(principal);
  const { data: likedSongIds = [], isLoading: likedLoading } =
    useGetLikedSongs(principal);
  const { data: allSongs = [] } = useGetAllSongs();
  const { playSong, currentSong, isPlaying } = usePlayer();

  const isLikedPlaylist = playlistName === "liked";

  // Get playlist songs
  const playlistSongs = useMemo(() => {
    if (isLikedPlaylist) {
      return allSongs.filter((song) =>
        likedSongIds.some((id) => id === song.id)
      );
    }

    const playlist = playlists.find((p) => p.name === playlistName);
    if (!playlist) return [];

    return allSongs.filter((song) =>
      playlist.songIds.some((id) => id === song.id)
    );
  }, [isLikedPlaylist, playlistName, playlists, allSongs, likedSongIds]);

  const isLoading = playlistsLoading || likedLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isLikedPlaylist && !playlists.find((p) => p.name === playlistName)) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Playlist not found</p>
      </div>
    );
  }

  const formatDuration = (seconds: bigint) => {
    const sec = Number(seconds);
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const totalDuration = playlistSongs.reduce(
    (acc, song) => acc + Number(song.duration),
    0
  );
  const formatTotalDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs > 0) {
      return `${hrs} hr ${mins} min`;
    }
    return `${mins} min`;
  };

  const handlePlayAll = () => {
    if (playlistSongs.length > 0) {
      playSong(playlistSongs[0], playlistSongs);
    }
  };

  const handlePlaySong = (song: Song) => {
    playSong(song, playlistSongs);
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Playlist Header */}
      <div className="bg-gradient-to-b from-primary/20 to-transparent rounded-lg p-8">
        <div className="flex items-end gap-6">
          <div className="h-48 w-48 rounded shadow-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shrink-0">
            <Heart className="h-24 w-24 text-primary-foreground fill-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold uppercase mb-2">Playlist</p>
            <h1 className="text-5xl font-display font-bold mb-4 line-clamp-2">
              {isLikedPlaylist ? "Liked Songs" : playlistName}
            </h1>
            <p className="text-sm text-muted-foreground">
              {playlistSongs.length} song{playlistSongs.length !== 1 ? "s" : ""}
              {" • "}
              {formatTotalDuration(totalDuration)}
            </p>
          </div>
        </div>
      </div>

      {/* Play Button */}
      {playlistSongs.length > 0 && (
        <div>
          <Button
            size="lg"
            className="h-14 w-14 rounded-full bg-primary hover:bg-primary/90 hover:scale-105 transition-all shadow-lg"
            onClick={handlePlayAll}
          >
            <Play className="h-6 w-6 fill-primary-foreground ml-0.5" />
          </Button>
        </div>
      )}

      {/* Song List */}
      {playlistSongs.length > 0 ? (
        <div className="space-y-1">
          {/* Table Header */}
          <div className="grid grid-cols-[40px_1fr_1fr_1fr_60px] gap-4 px-4 py-2 text-xs text-muted-foreground border-b border-border">
            <div className="text-center">#</div>
            <div>Title</div>
            <div>Album</div>
            <div>Artist</div>
            <div className="text-center">
              <Clock className="h-4 w-4 mx-auto" />
            </div>
          </div>

          {/* Song Rows */}
          {playlistSongs.map((song, index) => {
            const isCurrentSong = currentSong?.id === song.id;
            const isCurrentPlaying = isCurrentSong && isPlaying;

            return (
              <button
                key={song.id.toString()}
                type="button"
                className={cn(
                  "grid grid-cols-[40px_1fr_1fr_1fr_60px] gap-4 px-4 py-3 rounded hover:bg-muted/50 cursor-pointer group transition-colors w-full text-left",
                  isCurrentSong && "bg-muted/50"
                )}
                onClick={() => handlePlaySong(song)}
              >
                <div className="flex items-center justify-center text-sm text-muted-foreground group-hover:text-foreground">
                  {isCurrentPlaying ? (
                    <span className="text-primary">♪</span>
                  ) : (
                    <span className="group-hover:hidden">{index + 1}</span>
                  )}
                  <Play className="h-4 w-4 hidden group-hover:block fill-current" />
                </div>
                <div className="flex items-center min-w-0">
                  <div className="min-w-0">
                    <p
                      className={cn(
                        "text-sm font-medium truncate",
                        isCurrentSong && "text-primary"
                      )}
                    >
                      {song.title}
                    </p>
                  </div>
                </div>
                <div className="flex items-center min-w-0">
                  <p className="text-sm text-muted-foreground truncate">
                    {song.album}
                  </p>
                </div>
                <div className="flex items-center min-w-0">
                  <p className="text-sm text-muted-foreground truncate">
                    {song.artist}
                  </p>
                </div>
                <div className="flex items-center justify-center text-sm text-muted-foreground">
                  {formatDuration(song.duration)}
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            This playlist is empty. Add some songs to get started!
          </p>
        </div>
      )}
    </div>
  );
}
