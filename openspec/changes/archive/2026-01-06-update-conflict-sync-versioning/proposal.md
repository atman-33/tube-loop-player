## Why
Local reorder operations currently trigger a false-positive conflict modal because the client refetches cloud data before the local change is synced, treating stale cloud state as a conflict.

## What Changes
- Gate cloud fetch+diff to initial load/login rather than every local-unsynced state, separating "initial unsynced" from "local change" states.
- Introduce server-side versioning (serverVersion) from existing timestamps and return it in load/sync responses.
- Gate conflict display on version comparison (cloud newer than local) plus diff, preferring auto-sync when cloud is not newer.

## Impact
- Affected specs: playlist-sync (new capability)
- Affected code: use-playlist-sync hook, player store sync flags, playlist load/sync endpoints, playlist service timestamp aggregation
