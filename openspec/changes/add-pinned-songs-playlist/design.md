# Design: Pinned Songs Playlist

## Overview
This design introduces a special "Favorites" playlist that aggregates songs marked as favorites across all playlists. The implementation extends the existing playlist and player state management patterns while introducing new primitives for tracking pinned songs.

## Architecture

### State Management

#### Zustand Store Extension
Add new state slice for pinned songs:

```typescript
interface PinnedSongsState {
  pinnedVideoIds: Set<string>;
  togglePinnedSong: (videoId: string) => void;
  isPinned: (videoId: string) => boolean;
  getPinnedPlaylist: () => Playlist;
}
```

The `pinnedVideoIds` Set stores video IDs that are marked as favorites. This Set is:
- Persisted to localStorage for guest users
- Synced to cloud storage for authenticated users
- Used to determine star icon state across all playlist instances

The Favorites playlist is derived dynamically from this Set, maintaining the order songs were pinned (stored as an ordered array internally).

#### Favorites Playlist Identity
- Constant ID: `FAVORITES_PLAYLIST_ID = "playlist-favorites"`
- This ID is never generated via `generatePlaylistId()`
- The Favorites playlist is injected at position 0 in the playlists array
- All existing playlist operations skip or guard against this special ID

### Data Model

#### Client-Side Schema
Extend `PlayerState` with:

```typescript
interface PlayerState {
  // ... existing fields
  pinnedVideoIds: Set<string>;
  pinnedOrder: string[]; // Maintains insertion order for Favorites playlist
}
```

Persistence format in localStorage:
```json
{
  "pinnedVideoIds": ["video-id-1", "video-id-2"],
  "pinnedOrder": ["video-id-1", "video-id-2"]
}
```

#### Database Schema Extension
Add new table for authenticated users:

```sql
CREATE TABLE pinned_songs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  video_id TEXT NOT NULL,
  pinned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, video_id)
);

CREATE INDEX idx_pinned_songs_user ON pinned_songs(user_id);
```

The `pinned_at` timestamp maintains insertion order for the Favorites playlist.

### UI Components

#### Star Icon Component
New component: `app/routes/_app._index/components/pinned-star-icon.tsx`

```typescript
interface PinnedStarIconProps {
  videoId: string;
  className?: string;
}
```

Responsibilities:
- Render star icon (☆ unpinned, ★ pinned)
- Handle click events to toggle pinned state
- Update Zustand store on interaction

#### Playlist Item Row Extension
Modify existing playlist item row component to include star icon:
- Add star icon to the right side of each song
- Ensure consistent spacing and alignment
- Maintain accessibility (ARIA labels, keyboard support)

#### Playlist Tab Guards
Update `playlist-tab.tsx` and related components:
- Disable rename button for Favorites playlist
- Hide delete/remove actions for Favorites playlist
- Render Favorites tab with distinct styling (optional)

### Playlist Operations

#### Protected Operations
The following operations must guard against the Favorites playlist:

1. **Rename**: `renamePlaylist(playlistId, newName)` should early-return or no-op if `playlistId === FAVORITES_PLAYLIST_ID`
2. **Delete**: `removePlaylist(playlistId)` should early-return `false` if `playlistId === FAVORITES_PLAYLIST_ID`
3. **Creation Limits**: Favorites playlist does NOT count toward `MAX_PLAYLIST_COUNT`

#### Allowed Operations
The Favorites playlist supports:
- **Reordering songs**: `reorderPlaylist(fromIndex, toIndex, FAVORITES_PLAYLIST_ID)` updates `pinnedOrder` array
- **Removing songs**: `removeFromPlaylist(index, FAVORITES_PLAYLIST_ID)` unpins the song (removes from Set and order array)
- **Playback**: All standard playback controls work normally
- **Selection**: Can be set as `activePlaylistId`

### Sync Strategy

#### Cloud Sync Flow
1. On initial load for authenticated users, fetch `pinned_songs` table
2. Merge cloud pinned state with local state (union of both sets, prefer cloud order)
3. On pinned state change, debounce sync to cloud endpoint
4. Use existing conflict resolution patterns if timestamp mismatches occur

#### Sync Endpoints
New API routes:
- `POST /api/pinned-songs/sync` - Upload local pinned state
- `GET /api/pinned-songs/load` - Fetch cloud pinned state

Similar patterns to existing `/api/playlists/sync` and `/api/playlists/load`.

### Edge Cases

#### Duplicate Video IDs Across Playlists
- Video ID `V123` exists in Playlist A and Playlist B
- User marks star in Playlist A → both instances show ★
- User removes star in Playlist B → both instances show ☆
- Favorites playlist has at most one entry for `V123`

#### Deleting Source Song
- Video ID `V456` is pinned and exists in Playlist C
- User deletes `V456` from Playlist C
- `V456` remains in Favorites playlist (can still be played if YouTube video exists)
- User can remove `V456` from Favorites manually to unpin it

#### Initial Playlist Creation
- On first load, if no playlists exist, create default playlists as usual
- Favorites playlist is always injected at position 0
- If user has no pinned songs, Favorites playlist is empty

#### Migration from Existing Data
- Users upgrading from previous versions have no pinned songs initially
- No migration required; `pinnedVideoIds` and `pinnedOrder` default to empty
- Users manually mark favorites going forward

## Implementation Patterns

### Favorites Playlist Derivation
The Favorites playlist is computed from state:

```typescript
const getFavoritesPlaylist = (
  pinnedOrder: string[],
  allPlaylists: Playlist[]
): Playlist => {
  const videoMap = new Map<string, PlaylistItem>();
  
  // Build map of all available videos
  for (const playlist of allPlaylists) {
    for (const item of playlist.items) {
      if (!videoMap.has(item.id)) {
        videoMap.set(item.id, item);
      }
    }
  }
  
  // Build Favorites playlist from pinned order
  const items = pinnedOrder
    .map(videoId => videoMap.get(videoId))
    .filter(Boolean) as PlaylistItem[];
  
  return {
    id: FAVORITES_PLAYLIST_ID,
    name: "Favorites",
    items,
  };
};
```

This function is called whenever:
- Playlists array is accessed (via selector or getter)
- Pinned state changes
- Playlist items are added/removed/reordered

### Component Integration
Modify `app/routes/_app._index/route.tsx`:
- Inject Favorites playlist at position 0 when rendering tabs
- Pass derived Favorites playlist to drag-and-drop context
- Ensure playlist count checks exclude Favorites

## Testing Strategy

### Unit Tests
- `pinned-songs.test.ts`: Test pinned state logic, toggle, duplicate handling
- `favorites-playlist.test.ts`: Test playlist derivation, ordering, edge cases
- `playlist-guards.test.ts`: Verify rename/delete protections

### Integration Tests
- `use-playlist-sync.integration.test.ts`: Extend to cover pinned songs sync
- Test cross-playlist star state consistency
- Test Favorites playlist drag-and-drop behavior

### Manual Testing Checklist
- [ ] Mark song as favorite, verify star icon updates
- [ ] Unmark favorite, verify star icon reverts
- [ ] Mark same video ID in different playlists, verify both show ★
- [ ] Delete song from source playlist, verify remains in Favorites
- [ ] Reorder songs in Favorites, verify order persists
- [ ] Remove song from Favorites, verify unpinned state
- [ ] Attempt to rename Favorites, verify no-op
- [ ] Attempt to delete Favorites, verify no-op
- [ ] Create new playlists until limit, verify Favorites doesn't count
- [ ] Test as guest user, verify localStorage persistence
- [ ] Test as authenticated user, verify cloud sync

## Future Enhancements (Out of Scope)
- Bulk pin/unpin operations
- Smart playlists (e.g., "Recently Pinned", "Most Played")
- Pin count indicators on playlist tabs
- Export Favorites as shareable playlist
