## 1. Specification
- [x] 1.1 Draft playlist-sync spec delta covering fetch gating, version return, and conflict gating.
- [x] 1.2 Validate change with openspec validate update-conflict-sync-versioning --strict.

## 2. Server
- [x] 2.1 Compute serverVersion (max playlist.updatedAt, user_settings.updatedAt; consider pinned) in playlist service.
- [x] 2.2 Return serverVersion from GET /api/playlists/load and POST /api/playlists/sync responses.

## 3. Client
- [x] 3.1 Track hasFetchedCloudOnce and hasLocalChanges to avoid re-running conflict checks after local edits.
- [x] 3.2 Track localVersion vs cloud serverVersion; only show conflict when cloud is newer and diff differs.
- [x] 3.3 Keep auto-sync debounce (~1s) and clear hasLocalChanges after successful sync.

## 4. Validation
- [x] 4.1 Add/adjust tests for sync hook and endpoints to cover versioning and conflict gating.
- [x] 4.2 Run lint/tests as appropriate.
