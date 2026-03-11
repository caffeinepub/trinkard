import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";
import type { Song, PlaylistView, UserProfile } from "../backend";
import { Principal } from "@icp-sdk/core/principal";

// Songs
export function useGetAllSongs() {
  const { actor, isFetching } = useActor();
  return useQuery<Song[]>({
    queryKey: ["songs"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllSongs();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSearchSongs(searchText: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Song[]>({
    queryKey: ["songs", "search", searchText],
    queryFn: async () => {
      if (!actor || !searchText) return [];
      return actor.searchSongs(searchText);
    },
    enabled: !!actor && !isFetching && searchText.length > 0,
  });
}

// User Profile
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Actor not available");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
  });
}

// Playlists
export function useGetUserPlaylists(userId: Principal | null) {
  const { actor, isFetching } = useActor();
  return useQuery<PlaylistView[]>({
    queryKey: ["playlists", userId?.toString()],
    queryFn: async () => {
      if (!actor || !userId) return [];
      return actor.getUserPlaylists(userId);
    },
    enabled: !!actor && !isFetching && !!userId,
  });
}

export function useCreatePlaylist() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createPlaylist(name);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playlists"] });
    },
  });
}

export function useAddSongToPlaylist() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      playlistName,
      songId,
    }: {
      playlistName: string;
      songId: bigint;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addSongToPlaylist(playlistName, songId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["playlists"] });
    },
  });
}

// Liked Songs
export function useGetLikedSongs(userId: Principal | null) {
  const { actor, isFetching } = useActor();
  return useQuery<bigint[]>({
    queryKey: ["likedSongs", userId?.toString()],
    queryFn: async () => {
      if (!actor || !userId) return [];
      return actor.getLikedSongs(userId);
    },
    enabled: !!actor && !isFetching && !!userId,
  });
}

export function useLikeSong() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (songId: bigint) => {
      if (!actor) throw new Error("Actor not available");
      return actor.likeSong(songId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["likedSongs"] });
      queryClient.invalidateQueries({ queryKey: ["songs"] });
    },
  });
}
