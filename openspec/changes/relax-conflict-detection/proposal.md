# Relax Conflict Detection for Local-Only State

## Summary
Modify the data synchronization and conflict resolution logic to treat `activePlaylistId` (and potentially `loopMode`, `isShuffle`) as local-preference state. Differences in these fields between local and cloud storage should not trigger a data conflict modal. When synchronizing, the application should prioritize local values for these fields while ensuring playlist content consistency.

## Why
Currently, the `DataComparator` performs a strict deep equality check on the entire `UserPlaylistData` object, including `activePlaylistId`. This causes the "Data Conflict" modal to appear even when the actual playlist content (songs, order) is identical, simply because the user selected a different playlist or changed playback modes locally. This interrupts the user experience unnecessarily. The user intends for the "active playlist" selection to be a local concern that doesn't require strict cloud synchronization or conflict resolution.

## Proposed Changes
1.  **Update Data Comparison**: Modify `DataComparator` to support a "content-only" comparison mode that ignores `activePlaylistId`, `loopMode`, and `isShuffle`.
2.  **Refine Conflict Resolution**: Update `ConflictResolver` to use this content-only comparison.
    *   If playlist content is identical but local-only state differs, treat it as "no conflict" (or auto-sync).
    *   Ensure that during such an auto-sync, the local `activePlaylistId` is preserved (or not overwritten by stale cloud data), effectively treating it as local state.
3.  **Adjust Sync Logic**: Ensure that when loading data from the cloud, we respect the user's preference to keep the active playlist selection local.

## Open Questions
- Should `loopMode` and `isShuffle` also be strictly local? The user explicitly mentioned `activePlaylistId`, but these usually go together as "playback state". I will assume yes for consistency, as they don't affect data integrity.
- Does the server still need to receive `activePlaylistId`? The user said "no need to leave data in the cloud". We might stop sending it, or just ignore it on receipt. For now, we will focus on the client-side conflict resolution to avoid the modal.

## Alternatives Considered
- **Stop syncing `activePlaylistId` entirely**: We could remove it from the payload sent to the server. This is a cleaner long-term solution but requires API/Schema changes. The current proposal focuses on the client-side check to solve the immediate UX issue without necessarily breaking the existing API contract immediately.
