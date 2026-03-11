import { useGetAllSongs } from "../hooks/useQueries";
import { SongCard } from "../components/SongCard";
import { Loader2 } from "lucide-react";
import { useMemo } from "react";
import type { Song } from "../backend";

export function HomePage() {
  const { data: songs = [], isLoading } = useGetAllSongs();

  // Group songs by genre
  const songsByGenre = useMemo(() => {
    const genres: Record<string, Song[]> = {};
    songs.forEach((song) => {
      if (!genres[song.genre]) {
        genres[song.genre] = [];
      }
      genres[song.genre].push(song);
    });
    return genres;
  }, [songs]);

  // Get featured songs (most liked)
  const featuredSongs = useMemo(() => {
    return [...songs]
      .sort((a, b) => Number(b.likes) - Number(a.likes))
      .slice(0, 6);
  }, [songs]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-6">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-primary/20 to-transparent rounded-lg p-8 mb-8">
        <h1 className="text-4xl font-display font-bold mb-2 animate-fade-in">
          Welcome to Trinkard
        </h1>
        <p className="text-lg text-muted-foreground animate-fade-in">
          Discover and enjoy your favorite music
        </p>
      </section>

      {/* Featured Songs */}
      {featuredSongs.length > 0 && (
        <section className="animate-fade-in">
          <h2 className="text-2xl font-display font-bold mb-4">
            Popular Right Now
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {featuredSongs.map((song) => (
              <SongCard key={song.id.toString()} song={song} songs={songs} />
            ))}
          </div>
        </section>
      )}

      {/* Browse by Genre */}
      {Object.entries(songsByGenre).map(([genre, genreSongs]) => (
        <section key={genre} className="animate-fade-in">
          <h2 className="text-2xl font-display font-bold mb-4 capitalize">
            {genre}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {genreSongs.slice(0, 6).map((song) => (
              <SongCard key={song.id.toString()} song={song} songs={genreSongs} />
            ))}
          </div>
        </section>
      ))}

      {songs.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No songs available yet. Check back later!
          </p>
        </div>
      )}
    </div>
  );
}
