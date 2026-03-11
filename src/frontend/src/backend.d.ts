import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface PlaylistView {
    name: string;
    songIds: Array<bigint>;
}
export interface Song {
    id: bigint;
    title: string;
    duration: bigint;
    album: string;
    audioBlob?: ExternalBlob;
    likes: bigint;
    genre: string;
    artist: string;
    coverUrl: string;
    uploadTime: bigint;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addSongToPlaylist(playlistName: string, songId: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createPlaylist(name: string): Promise<void>;
    getAllSongs(): Promise<Array<Song>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getLikedSongs(userId: Principal): Promise<Array<bigint>>;
    getUserPlaylists(userId: Principal): Promise<Array<PlaylistView>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    likeSong(songId: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchSongs(searchText: string): Promise<Array<Song>>;
    uploadSong(title: string, artist: string, album: string, duration: bigint, genre: string, coverUrl: string, audioBlob: ExternalBlob): Promise<void>;
}
