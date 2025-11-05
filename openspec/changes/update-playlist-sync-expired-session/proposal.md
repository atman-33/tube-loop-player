## Why
When `/api/playlists/load` returns 401 because the Better Auth session expired, the client still thinks the user is signed in. `usePlaylistSync` displays the conflict modal with default fallback data and allows selecting “cloud” data that is not the user’s real playlist content.

## What Changes
- Detect 401 responses while loading playlists, stop the sync attempt, and surface an auth reset instead of using fallback cloud data.
- Clear the authenticated user state and mark sync as disabled until the user signs in again; optionally trigger a Better Auth sign-out to reload the shell.
- Skip conflict modal presentation when the session is invalid so local data remains active without confusing options.
- Add integration coverage for the unauthorized flow.

## Impact
- Affected specs: playlist-sync
- Affected code: `app/hooks/use-playlist-sync.ts`, `app/hooks/use-auth.ts`, `app/components/data-conflict-modal.tsx`, `app/hooks/use-playlist-sync.integration.test.ts`
