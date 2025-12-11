# Implementation Tasks: Add Pinned Songs Playlist

## Phase 1: Core State Management

- [ ] Add `FAVORITES_PLAYLIST_ID` constant to `app/stores/player/constants.ts`
- [ ] Create `app/stores/player/slices/pinned-songs-slice.ts` with state and actions:
  - [ ] `pinnedVideoIds: Set<string>` state
  - [ ] `pinnedOrder: string[]` state  
  - [ ] `togglePinnedSong(videoId: string)` action
  - [ ] `isPinned(videoId: string)` selector
  - [ ] `reorderPinnedSongs(fromIndex: number, toIndex: number)` action
  - [ ] `removePinnedSong(videoId: string)` action
- [ ] Integrate pinned songs slice into `app/stores/player.ts`
- [ ] Update persistence configuration to include `pinnedVideoIds` and `pinnedOrder`
- [ ] Write unit tests for pinned songs slice: `app/stores/player/slices/pinned-songs-slice.test.ts`

## Phase 2: Favorites Playlist Derivation

- [ ] Create `app/lib/player/favorites-playlist.ts` with:
  - [ ] `deriveFavoritesPlaylist(pinnedOrder, allPlaylists)` function
  - [ ] `injectFavoritesPlaylist(playlists, favoritesPlaylist)` helper
- [ ] Add selector `getFavoritesPlaylist()` to player store that derives Favorites from state
- [ ] Update `playlists` getter in store to inject Favorites at position 0
- [ ] Write unit tests for Favorites derivation: `app/lib/player/favorites-playlist.test.ts`

## Phase 3: Playlist Operation Guards

- [ ] Update `renamePlaylist()` in `playlist-slice.ts` to guard against `FAVORITES_PLAYLIST_ID`
- [ ] Update `removePlaylist()` in `playlist-slice.ts` to guard against `FAVORITES_PLAYLIST_ID`
- [ ] Update `canCreatePlaylist` logic to exclude Favorites from playlist count
- [ ] Handle `removeFromPlaylist()` for Favorites: unpin the song instead of just removing
- [ ] Handle `reorderPlaylist()` for Favorites: update `pinnedOrder` array
- [ ] Add unit tests for operation guards: `app/lib/player/playlist-guards.test.ts`

## Phase 4: Star Icon UI Component

- [ ] Create `app/routes/_app._index/components/pinned-star-icon.tsx`:
  - [ ] Render star icon (☆ or ★) based on pinned state
  - [ ] Handle click to toggle pinned state
  - [ ] Add ARIA labels for accessibility
  - [ ] Support keyboard interaction (Enter/Space to toggle)
- [ ] Add styling for star icon (hover states, active states)
- [ ] Integrate star icon into playlist item row component
- [ ] Ensure consistent spacing and alignment across playlist items

## Phase 5: Favorites Playlist UI Integration

- [ ] Update `app/routes/_app._index/route.tsx` to inject Favorites at position 0
- [ ] Modify playlist tab rendering to disable rename for Favorites
- [ ] Modify playlist tab rendering to hide delete action for Favorites
- [ ] Update playlist context menu to conditionally show/hide options for Favorites
- [ ] Add visual distinction for Favorites tab (optional: special icon or color)
- [ ] Test drag-and-drop behavior with Favorites playlist in the tab list
- [ ] Verify playlist creation limit messaging excludes Favorites

## Phase 6: Database Schema and Migration

- [ ] Create migration file: `drizzle/000X_add_pinned_songs.sql`:
  ```sql
  CREATE TABLE pinned_songs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
    video_id TEXT NOT NULL,
    pinned_at INTEGER NOT NULL,
    UNIQUE(user_id, video_id)
  );
  CREATE INDEX idx_pinned_songs_user ON pinned_songs(user_id);
  ```
- [ ] Update `database/schema.ts` to define `pinnedSongs` table with Drizzle
- [ ] Export `pinnedSongs` table from schema

## Phase 7: Cloud Sync Implementation

- [ ] Create `app/lib/pinned-songs.server.ts` with:
  - [ ] `loadPinnedSongs(userId)` function
  - [ ] `syncPinnedSongs(userId, pinnedData)` function
- [ ] Create API route `app/routes/api.pinned-songs.load.ts`:
  - [ ] Fetch pinned songs from database for authenticated user
  - [ ] Return JSON response with video IDs and order
- [ ] Create API route `app/routes/api.pinned-songs.sync.ts`:
  - [ ] Accept pinned state payload from client
  - [ ] Merge with existing cloud state (union of sets, prefer latest timestamps)
  - [ ] Return merged state to client
- [ ] Create hook `app/hooks/use-pinned-songs-sync.ts`:
  - [ ] Load pinned state on mount for authenticated users
  - [ ] Debounce sync on local pinned state changes
  - [ ] Handle sync conflicts and errors
- [ ] Integrate hook into `app/routes/_app._index/route.tsx`
- [ ] Write integration tests: `app/hooks/use-pinned-songs-sync.integration.test.ts`

## Phase 8: Testing and Validation

- [ ] Manual test: Mark song as favorite, verify star icon updates
- [ ] Manual test: Unmark favorite, verify star icon reverts
- [ ] Manual test: Mark same video ID in different playlists, verify consistency
- [ ] Manual test: Delete song from source playlist, verify remains in Favorites
- [ ] Manual test: Reorder songs in Favorites, verify order persists
- [ ] Manual test: Remove song from Favorites, verify unpinned state across playlists
- [ ] Manual test: Attempt to rename Favorites, verify disabled
- [ ] Manual test: Attempt to delete Favorites, verify disabled
- [ ] Manual test: Create playlists until limit, verify Favorites doesn't count
- [ ] Manual test: Guest user flow with localStorage persistence
- [ ] Manual test: Authenticated user flow with cloud sync
- [ ] Manual test: Shuffle mode in Favorites playlist
- [ ] Run all unit tests: `npm run test`
- [ ] Run all integration tests
- [ ] Verify no TypeScript errors: `npm run typecheck`
- [ ] Run linter: `npm run biome:check`

## Phase 9: Documentation and Cleanup

- [ ] Update `docs/coding-rule.md` if new patterns introduced (optional)
- [ ] Add comments to complex functions (favorites derivation, sync logic)
- [ ] Verify all TODOs and FIXMEs are resolved
- [ ] Confirm all checklist items in `tasks.md` are marked complete

## Dependencies and Parallelization

**Phase 1-3 can proceed sequentially** (state → derivation → guards).

**Phase 4-5 can be developed in parallel** with Phase 6-7 (UI work is independent of backend).

**Phase 6-7 must complete before Phase 8** (testing requires full stack).

**Phase 9 follows all implementation phases**.

## Validation Criteria

All tasks are complete when:
- All checkboxes in this file are marked `[x]`
- `npm run test` passes with no failures
- `npm run typecheck` passes with no errors
- `npm run biome:check` passes with no warnings
- Manual test checklist in Phase 8 is fully verified
- User can mark favorites, see Favorites playlist, and sync across devices
