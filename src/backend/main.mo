import Array "mo:core/Array";
import List "mo:core/List";
import Map "mo:core/Map";
import Order "mo:core/Order";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public type Song = {
    id : Nat;
    title : Text;
    artist : Text;
    album : Text;
    duration : Nat;
    genre : Text;
    coverUrl : Text;
    likes : Nat;
    uploadTime : Int;
    audioBlob : ?Storage.ExternalBlob;
  };

  module Song {
    public func compare(song1 : Song, song2 : Song) : Order.Order {
      switch (Text.compare(song1.title, song2.title)) {
        case (#equal) {
          switch (Text.compare(song1.artist, song2.artist)) {
            case (#equal) { Text.compare(song1.album, song2.album) };
            case (other) { other };
          };
        };
        case (other) { other };
      };
    };
  };

  public type PlaylistView = {
    name : Text;
    songIds : [Nat];
  };

  var nextSongId = 1;
  let songs = List.empty<Song>();

  type Playlist = {
    name : Text;
    songIds : List.List<Nat>;
  };

  let playlists = Map.empty<Principal, List.List<Playlist>>();
  let likedSongs = Map.empty<Principal, List.List<Nat>>();

  // Public read access - no authorization needed (accessible to guests)
  public query ({ caller }) func getAllSongs() : async [Song] {
    songs.toArray().sort();
  };

  // Public read access - no authorization needed (accessible to guests)
  public query ({ caller }) func searchSongs(searchText : Text) : async [Song] {
    let searchTextLower = searchText.toLower();
    let filteredSongs = songs.filter(
      func(song) {
        let titleLower = song.title.toLower();
        let artistLower = song.artist.toLower();
        titleLower.contains(#text searchTextLower) or artistLower.contains(#text searchTextLower);
      }
    );
    filteredSongs.toArray().sort();
  };

  // Requires user role
  public shared ({ caller }) func uploadSong(
    title : Text,
    artist : Text,
    album : Text,
    duration : Nat,
    genre : Text,
    coverUrl : Text,
    audioBlob : Storage.ExternalBlob
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can upload songs");
    };

    let newSong : Song = {
      id = nextSongId;
      title;
      artist;
      album;
      duration;
      genre;
      coverUrl;
      likes = 0;
      uploadTime = Time.now();
      audioBlob = ?audioBlob;
    };

    songs.add(newSong);
    nextSongId += 1;
  };

  // Requires user role
  public shared ({ caller }) func createPlaylist(name : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create playlists");
    };

    let newPlaylist : Playlist = {
      name;
      songIds = List.empty<Nat>();
    };

    let userPlaylists = switch (playlists.get(caller)) {
      case (null) { List.empty<Playlist>() };
      case (?existing) { existing };
    };

    userPlaylists.add(newPlaylist);
    playlists.add(caller, userPlaylists);
  };

  // Requires user role
  public shared ({ caller }) func addSongToPlaylist(playlistName : Text, songId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add songs to playlists");
    };

    let userPlaylists = switch (playlists.get(caller)) {
      case (null) { Runtime.trap("Playlist does not exist") };
      case (?existing) { existing };
    };

    let updatedPlaylists = userPlaylists.map<Playlist, Playlist>(
      func(playlist) {
        if (playlist.name == playlistName) {
          playlist.songIds.add(songId);
          playlist;
        } else {
          playlist;
        };
      }
    );

    playlists.add(caller, updatedPlaylists);
  };

  // Ownership verification: only owner or admin can view
  public query ({ caller }) func getUserPlaylists(userId : Principal) : async [PlaylistView] {
    if (caller != userId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own playlists");
    };

    switch (playlists.get(userId)) {
      case (null) { [] };
      case (?userPlaylists) {
        userPlaylists.toArray().map(
          func(playlist) {
            {
              name = playlist.name;
              songIds = playlist.songIds.toArray();
            };
          }
        );
      };
    };
  };

  // Requires user role
  public shared ({ caller }) func likeSong(songId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can like songs");
    };

    let userLikedSongs = switch (likedSongs.get(caller)) {
      case (null) { List.empty<Nat>() };
      case (?existing) { existing };
    };

    userLikedSongs.add(songId);
    likedSongs.add(caller, userLikedSongs);

    // Increment song like count
    let updatedSongs = songs.map<Song, Song>(
      func(song) {
        if (song.id == songId) {
          { song with likes = song.likes + 1 };
        } else {
          song;
        };
      }
    );
    songs.clear();
    songs.addAll(updatedSongs.values());
  };

  // Ownership verification: only owner or admin can view
  public query ({ caller }) func getLikedSongs(userId : Principal) : async [Nat] {
    if (caller != userId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own liked songs");
    };

    switch (likedSongs.get(userId)) {
      case (null) { [] };
      case (?userLikedSongs) { userLikedSongs.toArray() };
    };
  };
};
