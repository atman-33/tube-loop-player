# Tasks: Relax Conflict Detection

- [ ] **Update DataComparator** <!-- id: 0 -->
    - [ ] Add `arePlaylistsIdentical` method to `DataComparator` class in `app/lib/data-comparator.ts`.
    - [ ] Ensure it compares only the `playlists` array and its contents, ignoring top-level playback state.
    - [ ] Add unit tests in `app/lib/data-comparator.test.ts` verifying it returns true for identical playlists with different `activePlaylistId`.

- [ ] **Update ConflictResolver** <!-- id: 1 -->
    - [ ] Modify `analyzeConflict` in `app/lib/conflict-resolver.ts` to use `arePlaylistsIdentical` instead of strict equality.
    - [ ] Implement logic to merge local playback state (`activePlaylistId`, `loopMode`, `isShuffle`) with cloud playlist data when content is identical.
    - [ ] Ensure `auto-sync` returns this merged data object.
    - [ ] Update `app/lib/conflict-resolver.test.ts` to verify that differences in `activePlaylistId` no longer trigger `show-modal`.

- [ ] **Verify Integration** <!-- id: 2 -->
    - [ ] Verify `usePlaylistSync` hook correctly handles the `auto-sync` response with merged data. (Likely no code change needed if `ConflictResolver` returns the correct data structure, but manual verification required).
