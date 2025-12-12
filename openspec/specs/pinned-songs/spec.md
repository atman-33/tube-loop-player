# pinned-songs Specification

## Purpose
Enable users to mark favorite songs across playlists and aggregate them into a dedicated Favorites playlist for quick access and continuous playback. The system maintains star icon state consistently across all playlist instances and ensures the Favorites playlist behaves like a standard playlist for playback while being protected from deletion, renaming, and tab reordering.

## Requirements
### Requirement: Cross-playlist favorite marking
The system SHALL allow users to mark any song as a favorite by clicking a star icon, and the favorite state SHALL be reflected across all instances of that song in different playlists.

#### Scenario: Mark song as favorite
- **GIVEN** a song with video ID `V123` exists in Playlist A
- **WHEN** the user clicks the empty star (☆) icon next to the song
- **THEN** the star icon SHALL change to filled (★) indicating the song is marked as a favorite

#### Scenario: Consistent state across playlists
- **GIVEN** a song with video ID `V456` exists in both Playlist A and Playlist B
- **WHEN** the user marks the song as favorite in Playlist A
- **THEN** the same song in Playlist B SHALL also display a filled star (★) icon without requiring user interaction

#### Scenario: Unmark favorite
- **GIVEN** a song is currently marked as a favorite (★)
- **WHEN** the user clicks the filled star icon
- **THEN** the star icon SHALL change back to empty (☆) and the song SHALL be removed from the Favorites playlist

### Requirement: Favorites playlist aggregation
The system SHALL maintain a special Favorites playlist that automatically aggregates all songs marked as favorites, positioned as the leftmost tab, and prevents duplicate entries of the same video ID.

#### Scenario: Favorites playlist appears first
- **GIVEN** the user has created multiple playlists
- **WHEN** the playlist tabs are rendered
- **THEN** the Favorites playlist SHALL appear as the leftmost tab before all other playlists

#### Scenario: Pinned song appears in Favorites
- **GIVEN** a song is not currently marked as a favorite
- **WHEN** the user marks the song as a favorite
- **THEN** the song SHALL appear in the Favorites playlist

#### Scenario: Prevent duplicate video IDs in Favorites
- **GIVEN** a song with video ID `V789` is marked as favorite and exists in multiple playlists
- **WHEN** the Favorites playlist is rendered
- **THEN** the video ID `V789` SHALL appear exactly once in the Favorites playlist regardless of how many playlists contain it

#### Scenario: Insertion order maintained
- **GIVEN** the user marks Song A as favorite, then Song B, then Song C
- **WHEN** the Favorites playlist is displayed
- **THEN** the songs SHALL appear in the order A, B, C (insertion order)

### Requirement: Favorites playlist reordering
The system SHALL allow users to reorder songs within the Favorites playlist using drag-and-drop, and the custom order SHALL persist across sessions.

#### Scenario: Drag song to new position
- **GIVEN** the Favorites playlist contains songs A, B, C in that order
- **WHEN** the user drags Song C to the first position
- **THEN** the Favorites playlist order SHALL update to C, A, B and this order SHALL persist after reload

#### Scenario: Manual order overrides insertion order
- **GIVEN** songs were pinned in order A, B, C
- **AND** the user reordered them to B, C, A
- **WHEN** the user pins a new Song D
- **THEN** the playlist SHALL display B, C, A, D (new songs append to the end of the current order)

### Requirement: Favorites playlist immutability
The system SHALL prevent users from renaming, deleting, or reordering the Favorites playlist tab, and it SHALL NOT count toward the maximum playlist limit.

#### Scenario: Rename protection
- **GIVEN** the user selects the Favorites playlist
- **WHEN** the user attempts to rename the playlist via the UI
- **THEN** the rename control SHALL be disabled or hidden for the Favorites playlist

#### Scenario: Delete protection
- **GIVEN** the user has access to playlist delete functionality
- **WHEN** the user attempts to delete the Favorites playlist
- **THEN** the delete action SHALL be disabled or hidden, and the Favorites playlist SHALL remain in the playlist tabs

#### Scenario: Tab reordering protection
- **GIVEN** the user is reordering playlist tabs using drag-and-drop or keyboard shortcuts
- **WHEN** the user attempts to reorder the Favorites playlist tab
- **THEN** the Favorites tab SHALL remain locked at the leftmost position and SHALL NOT be movable

#### Scenario: Exclusion from playlist count
- **GIVEN** the user has reached the maximum playlist limit of 10
- **WHEN** the system checks whether the user can create a new playlist
- **THEN** the Favorites playlist SHALL NOT be counted toward the limit, allowing creation of up to 10 additional user playlists

### Requirement: Remove song from Favorites
The system SHALL allow users to remove a song from the Favorites playlist by deleting it within the Favorites context, which SHALL unpin the song and update star icons across all playlists. The delete action in Favorites SHALL trigger the unpin operation rather than removing the song from the underlying playlist structure.

#### Scenario: Remove song from Favorites playlist
- **GIVEN** a song with video ID `V111` is in the Favorites playlist
- **WHEN** the user deletes the song from the Favorites playlist using the standard delete action
- **THEN** the song SHALL be removed from Favorites AND the star icon for video ID `V111` in all other playlists SHALL change to empty (☆)

#### Scenario: Remove does not delete from source playlists
- **GIVEN** video ID `V222` exists in both Playlist A and Favorites
- **WHEN** the user removes `V222` from Favorites
- **THEN** the song SHALL remain in Playlist A with an empty star (☆) icon

#### Scenario: Delete action triggers unpin operation
- **GIVEN** the user is viewing the Favorites playlist
- **WHEN** the user clicks the delete button on a song
- **THEN** the system SHALL call the removePinnedSong operation instead of the standard removeFromPlaylist operation

### Requirement: Persistence across source playlist changes
The system SHALL retain a song in the Favorites playlist even if the song is deleted from its original source playlist, allowing independent management of the Favorites collection.

#### Scenario: Delete from source playlist
- **GIVEN** video ID `V333` is marked as favorite and exists in Playlist B
- **WHEN** the user deletes `V333` from Playlist B
- **THEN** video ID `V333` SHALL remain in the Favorites playlist with its filled star (★) state intact

#### Scenario: Playback after source deletion
- **GIVEN** a song in Favorites was deleted from all other playlists
- **WHEN** the user plays that song from Favorites
- **THEN** the song SHALL play normally if the YouTube video still exists

### Requirement: Pinned state persistence and sync
The system SHALL persist the pinned state to local storage for guest users and sync to cloud storage for authenticated users using a database table with timestamp tracking, ensuring favorite marks are available across sessions and devices.

#### Scenario: Guest user persistence
- **GIVEN** a guest user (not authenticated) marks several songs as favorites
- **WHEN** the user refreshes the page or closes and reopens the browser
- **THEN** the pinned state SHALL be restored from local storage and the Favorites playlist SHALL display the same songs with correct star icons

#### Scenario: Authenticated user cloud sync
- **GIVEN** an authenticated user marks songs as favorites on Device A
- **WHEN** the user logs in on Device B
- **THEN** the system SHALL load the pinned state from cloud storage and display the Favorites playlist with all previously pinned songs

#### Scenario: Conflict resolution during sync
- **GIVEN** an authenticated user has pinned songs on Device A (offline) and Device B (online)
- **WHEN** both devices sync to the cloud
- **THEN** the system SHALL merge the pinned sets (union) and preserve the most recent order based on server timestamps

#### Scenario: Database schema for cloud storage
- **GIVEN** the system needs to store pinned songs for authenticated users
- **WHEN** a song is pinned
- **THEN** the system SHALL store a record in the `pinned_songs` table with columns: `id` (auto-increment), `userId` (foreign key to user), `videoId` (video identifier), and `pinnedAt` (timestamp for conflict resolution and ordering)

### Requirement: Standard playback support
The system SHALL support all standard playback features (play, pause, loop, shuffle, next, previous) within the Favorites playlist, treating it as a fully functional playlist for playback operations.

#### Scenario: Play Favorites playlist
- **GIVEN** the Favorites playlist contains multiple songs
- **WHEN** the user selects the Favorites playlist and starts playback
- **THEN** the player SHALL play songs from the Favorites playlist in the current order with all standard controls available

#### Scenario: Shuffle mode in Favorites
- **GIVEN** the user enables shuffle mode and selects the Favorites playlist
- **WHEN** playback starts
- **THEN** the system SHALL shuffle songs within Favorites according to the existing shuffle algorithm and reset shuffle history as it does for other playlists

