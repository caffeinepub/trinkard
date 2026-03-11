# Trinkard Music Streaming App

## Current State

Fresh Caffeine project with:
- React + TypeScript + Tailwind CSS frontend scaffold
- shadcn/ui component library
- Internet Identity authentication system
- Authorization and blob-storage components selected
- No backend APIs or frontend features implemented yet

## Requested Changes (Diff)

### Add

**Backend:**
- Music library management (songs, albums, artists) with real-life song data
- User playlists (create, update, delete)
- Song storage and metadata
- User favorites/liked songs
- Search functionality for songs, albums, and artists
- Playback history tracking
- Pre-populated library with real songs from popular artists

**Frontend:**
- Home/Browse page with featured playlists and recently played
- Library page showing user's playlists and liked songs
- Search page with filters
- Playlist detail view with track list
- Music player bar (bottom) with play/pause, skip, progress, volume controls
- Sidebar navigation (Home, Search, Library, Create Playlist)
- Album and artist detail pages
- Branding as "Trinkard" throughout the interface
- SEO optimization with proper meta tags, titles, and descriptions for search engine indexing
- Public pages accessible without login (browse, search, view songs/albums/artists)
- Authentication required only for user-specific features (playlists, liked songs, history)

### Modify

None (new project)

### Remove

None (new project)

## Implementation Plan

1. **Select Caffeine Components:**
   - `authorization` - for user-specific playlists and liked songs
   - `blob-storage` - for storing music files and album artwork

2. **Backend (Motoko):**
   - User profile with playlists and liked songs
   - Song library with metadata (title, artist, album, duration, file URL)
   - Playlist CRUD operations
   - Search and filter functionality
   - Playback history tracking

3. **Frontend (React + TypeScript):**
   - Main layout with sidebar navigation and bottom player bar
   - Home page with featured content
   - Library page for user collections
   - Search page with real-time filtering
   - Playlist and album detail views
   - Persistent music player component with audio controls
   - Upload interface for adding new songs (admin/demo)

4. **Integration:**
   - Wire authentication flow with Internet Identity
   - Connect player to blob-storage URLs
   - Implement real-time search
   - State management for current track and player state

## UX Notes

- Classic Spotify layout: sidebar (left), main content (center), player bar (bottom)
- Dark theme with green accents (Spotify-style design language)
- Branding as "Trinkard" in logo and headers
- Player persists across page navigation
- Smooth transitions between tracks
- Visual feedback for currently playing track
- Responsive design for desktop and mobile
- Real song data to make the app feel authentic
- **Public accessibility**: All content browsable without login; login only for personalization
- **SEO-friendly**: Proper HTML semantics, meta tags, Open Graph tags for search engine discoverability
