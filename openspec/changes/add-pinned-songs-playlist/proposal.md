# Proposal: Add Pinned Songs Playlist

## Context
Users want to collect their favorite songs from multiple playlists into a single, curated playlist for quick access and playback. Currently, songs are organized within individual playlists, but there is no mechanism to mark favorites across playlists or aggregate them into a dedicated view.

This proposal introduces a "Favorites" playlist that automatically collects songs marked as favorites (pinned) from any playlist. Users can mark songs with a star icon, and all starred songs appear in this special playlist positioned at the leftmost tab.

## Goals
- Enable users to mark individual songs as favorites across all playlists
- Provide a dedicated "Favorites" playlist that aggregates all pinned songs
- Ensure the Favorites playlist behaves like a standard playlist for playback and reordering
- Prevent duplicate entries in the Favorites playlist (same video ID can only appear once)
- Persist pinned state across both local storage and cloud sync

## User Experience

### Marking Favorites
- Each song in every playlist displays a star icon (☆) on the right side
- Clicking the star icon toggles it to a filled star (★), marking the song as a favorite
- When a song is marked as favorite, it appears in the Favorites playlist
- If the same video ID exists in multiple playlists, marking it as favorite in one playlist reflects across all instances

### Favorites Playlist
- A special "Favorites" playlist appears as the leftmost tab
- This playlist is immutable: users cannot rename or delete it
- Songs appear in the order they were marked as favorites (most recent at the bottom)
- Users can reorder songs within the Favorites playlist using drag-and-drop
- The Favorites playlist supports all standard playback features (play, loop, shuffle)

### Cross-Playlist Behavior
- The same video ID can exist in multiple regular playlists
- However, each video ID can only appear once in the Favorites playlist
- Marking or unmarking a favorite updates the star state for all instances of that video ID
- Deleting a song from its source playlist does NOT remove it from Favorites

## Technical Approach
- Introduce a special playlist ID constant: `FAVORITES_PLAYLIST_ID = "playlist-favorites"`
- Store pinned state as a Set of video IDs in the Zustand store
- The Favorites playlist is dynamically maintained based on the pinned Set
- Extend database schema to persist pinned video IDs for authenticated users
- Update UI components to render star icons and handle toggle interactions
- Prevent deletion and renaming operations on the Favorites playlist

## Constraints
- Favorites playlist is immutable (no rename, no delete)
- Each video ID appears at most once in Favorites
- Pinned state is independent of playlist membership
- Guest users can use favorites with localStorage persistence
- Authenticated users sync pinned state via cloud storage

## Open Questions
None at this time. All requirements have been clarified.

## Approval Gate
This proposal requires user approval before implementation begins.
