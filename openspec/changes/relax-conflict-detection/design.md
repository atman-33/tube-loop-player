# Design: Relaxed Conflict Detection

## Problem
The current `DataComparator` enforces strict equality.
```typescript
  private compareNormalizedData(
    local: NormalizedUserPlaylistData,
    cloud: NormalizedUserPlaylistData,
  ): boolean {
    // Compare top-level properties first (fastest comparison)
    if (
      local.activePlaylistId !== cloud.activePlaylistId ||
      local.loopMode !== cloud.loopMode ||
      local.isShuffle !== cloud.isShuffle
    ) {
      return false; // <--- This triggers conflict if only these changed
    }
    // ...
```

## Solution Design

### 1. Scoped Comparison
Introduce a comparison strategy that separates "Content Data" from "Playback State".

*   **Content Data**: `playlists` (id, name, items).
*   **Playback State**: `activePlaylistId`, `loopMode`, `isShuffle`.

The `ConflictResolver` should primarily check **Content Data**.

### 2. Resolution Logic
When `ConflictResolver.analyzeConflict(local, cloud)` is called:

1.  Check if **Content Data** is identical.
2.  If **Content Data** is identical:
    *   Return `auto-sync` (or a new status like `merged`).
    *   The resulting data for the application to use should be:
        *   `playlists`: from Cloud (trusted source, identical to local anyway).
        *   `activePlaylistId`: from Local (user's current context).
        *   `loopMode`/`isShuffle`: from Local.
3.  If **Content Data** differs:
    *   Return `show-modal` (existing behavior).

### 3. Implementation Details

*   Modify `DataComparator.areDataSetsIdentical` to accept an options object or create a new method `arePlaylistsIdentical`.
*   Update `ConflictResolver.analyzeConflict` to use `arePlaylistsIdentical`.
*   If playlists are identical, construct a merged result:
    ```typescript
    const mergedData = {
      ...cloud,
      activePlaylistId: local.activePlaylistId,
      loopMode: local.loopMode,
      isShuffle: local.isShuffle
    };
    return { type: 'auto-sync', data: mergedData };
    ```
    *Note: We must ensure `local.activePlaylistId` is valid within `cloud.playlists`. Since playlists are identical, it should be.*

### 4. Edge Cases
*   **Local is empty**: Full sync from cloud (overwrite local state).
*   **Cloud is empty**: No action (or sync local to cloud).
*   **Local active ID not in Cloud playlists**: This shouldn't happen if playlists are identical. If they differ, we show the modal.

## Impact on Sync
The `syncToServer` function currently sends all state. We can continue sending it, but when *loading* (pulling), we prioritize local playback state. This satisfies the requirement "no need to check it" (for conflicts).
