import { useState, useMemo } from "react";
import { useGetAllSongs } from "../hooks/useQueries";
import { SongCard } from "../components/SongCard";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string>("all");
  const { data: allSongs = [], isLoading } = useGetAllSongs();

  // Get unique genres
  const genres = useMemo(() => {
    const uniqueGenres = new Set(allSongs.map((song) => song.genre));
    return Array.from(uniqueGenres).sort();
  }, [allSongs]);

  // Filter songs based on search and genre
  const filteredSongs = useMemo(() => {
    let results = allSongs;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        (song) =>
          song.title.toLowerCase().includes(query) ||
          song.artist.toLowerCase().includes(query) ||
          song.album.toLowerCase().includes(query)
      );
    }

    // Filter by genre
    if (selectedGenre !== "all") {
      results = results.filter((song) => song.genre === selectedGenre);
    }

    return results;
  }, [allSongs, searchQuery, selectedGenre]);

  return (
    <div className="space-y-6 pb-6">
      {/* Search Header */}
      <div className="space-y-4">
        <h1 className="text-3xl font-display font-bold animate-fade-in">
          Search
        </h1>

        {/* Search Input */}
        <div className="relative max-w-2xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search for songs, artists, or albums..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 text-base"
          />
        </div>

        {/* Genre Filter */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Filter by genre:</span>
          <Select value={selectedGenre} onValueChange={setSelectedGenre}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Genres</SelectItem>
              {genres.map((genre) => (
                <SelectItem key={genre} value={genre} className="capitalize">
                  {genre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredSongs.length > 0 ? (
        <div>
          <p className="text-sm text-muted-foreground mb-4">
            {filteredSongs.length} song{filteredSongs.length !== 1 ? "s" : ""}{" "}
            found
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {filteredSongs.map((song) => (
              <SongCard
                key={song.id.toString()}
                song={song}
                songs={filteredSongs}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchQuery || selectedGenre !== "all"
              ? "No songs found matching your criteria"
              : "Start searching to discover music"}
          </p>
        </div>
      )}
    </div>
  );
}
