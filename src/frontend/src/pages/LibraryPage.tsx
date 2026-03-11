import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useGetUserPlaylists,
  useGetLikedSongs,
  useGetAllSongs,
} from "../hooks/useQueries";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Music2, Loader2, Lock } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useMemo } from "react";

export function LibraryPage() {
  const { identity, login, loginStatus } = useInternetIdentity();
  const principal = identity?.getPrincipal() || null;
  const { data: playlists = [], isLoading: playlistsLoading } =
    useGetUserPlaylists(principal);
  const { data: likedSongIds = [], isLoading: likedLoading } =
    useGetLikedSongs(principal);
  const { data: allSongs = [] } = useGetAllSongs();

  const likedSongs = useMemo(() => {
    return allSongs.filter((song) =>
      likedSongIds.some((id) => id === song.id)
    );
  }, [allSongs, likedSongIds]);

  const isLoading = playlistsLoading || likedLoading;

  if (!identity) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] space-y-4">
        <Lock className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-2xl font-display font-bold">Login Required</h2>
        <p className="text-muted-foreground text-center max-w-md">
          Please log in to access your library, playlists, and liked songs.
        </p>
        <Button
          onClick={login}
          disabled={loginStatus === "logging-in"}
          className="mt-4"
        >
          {loginStatus === "logging-in" ? "Logging in..." : "Log in"}
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-6">
      <h1 className="text-3xl font-display font-bold animate-fade-in">
        Your Library
      </h1>

      {/* Liked Songs */}
      <section>
        <h2 className="text-2xl font-display font-bold mb-4">Liked Songs</h2>
        {likedSongs.length > 0 ? (
          <Link to="/playlist/$name" params={{ name: "liked" }}>
            <Card className="group cursor-pointer hover:bg-card/80 transition-all border-0 bg-gradient-to-br from-primary/20 to-primary/5">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="h-20 w-20 rounded bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                  <Heart className="h-10 w-10 text-primary-foreground fill-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Liked Songs</h3>
                  <p className="text-muted-foreground">
                    {likedSongs.length} song{likedSongs.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ) : (
          <p className="text-muted-foreground py-4">
            No liked songs yet. Start liking songs to build your collection!
          </p>
        )}
      </section>

      {/* Playlists */}
      <section>
        <h2 className="text-2xl font-display font-bold mb-4">Your Playlists</h2>
        {playlists.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {playlists.map((playlist) => (
              <Link
                key={playlist.name}
                to="/playlist/$name"
                params={{ name: playlist.name }}
              >
                <Card className="group cursor-pointer hover:bg-card/80 transition-all border-0 animate-scale-in">
                  <CardContent className="p-0">
                    <div className="aspect-square bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center rounded-t">
                      <Music2 className="h-16 w-16 text-muted-foreground" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-sm line-clamp-2">
                        {playlist.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {playlist.songIds.length} song
                        {playlist.songIds.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground py-4">
            No playlists yet. Create your first playlist to get started!
          </p>
        )}
      </section>
    </div>
  );
}
