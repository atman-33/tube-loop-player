# Authentication & Database Patterns

## 1. Better Auth bootstrap (app/lib/auth/auth.server.ts)
- Always call `const auth = getAuth(context);` inside loaders/actions; the helper lazily instantiates `betterAuth` once with `new Kysely({ dialect: new D1Dialect({ database: ctx.cloudflare.env.DB }), plugins: [new CamelCasePlugin()] })`, so bypassing it will spawn duplicate connections and ignore the camelCase mapping Better Auth requires.
- Google OAuth is the only provider surfaced in the UI today, but `createBetterAuth` also enables GitHub for CLI/testing—keep both client IDs/secrets wired when touching infra or the `/auth` flows will break for scripts.
- Required env bindings when deploying Workers: `BETTER_AUTH_SECRET`, `OAUTH_GOOGLE_CLIENT_ID/SECRET`, `OAUTH_GITHUB_CLIENT_ID/SECRET`, `BETTER_AUTH_URL`, and the `DB` D1 binding. The `_app` loader already exposes `contactEmail` and `BETTER_AUTH_URL` to the client; add new auth-related env reads there so `useAuth()` sees them.

## 2. Session-gated routes
- Pattern: get the session from the incoming request headers and short-circuit if `!session?.user` (see `app/routes/api.playlists.sync.ts` and `app/routes/api.playlists.load.ts`). Example:
  ```ts
  const auth = getAuth(context);
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }
  ```
- Route loaders/actions that mutate playlist data must accept the `AppLoadContext` (React Router v7) so they can reach the Cloudflare env and reuse the Drizzle client hanging off `PlaylistService`.

## 3. Client auth + sync contract
- `useAuth()` (app/hooks/use-auth.ts) reads the `_app` loader data so every component has `user`, `isAuthenticated`, `signIn(provider)` and `signOut()`. Do not fetch Better Auth directly from the client; use this hook so navigation keeps working after sign-out reloads the page.
- `usePlaylistSync()` (app/hooks/use-playlist-sync.ts) waits for the Zustand store hydration hook (`usePlayerStore.persist.hasHydrated`) before syncing. It fetches `/api/playlists/load`, runs `ConflictResolver`, and shows `<DataConflictModal />` when `local` vs `cloud` diverge. Any new playlist-related hook must respect the `conflictData` modal and call `syncToServer()` after local mutations.

## 4. D1 schema & invariants (database/schema.ts)
- Tables: `playlist`, `playlist_item`, and `user_settings` hang off Better Auth's `user` table. `playlist.order` and `playlist_item.order` are persisted positions, so keep them in sync with `usePlayerStore`'s indexes.
- `MAX_PLAYLIST_COUNT` lives in `app/lib/playlist-limits.ts` and is set to `10`. Both the store and `sanitizeUserPlaylistData()` enforce this cap before any write hits D1—never raise the limit in one place only.
- `sanitizeUserPlaylistData()` rewrites legacy IDs (`playlist-<number>`) to the per-user prefix form (`playlist-${userId}-${uuid}`) and reassociates `activePlaylistId`. Call it on any payload headed to D1; `PlaylistService.saveUserPlaylists()` already handles this.
- `mergePlaylistsForSync()` merges cookie/localStorage payloads into the canonical DB shape by playlist name while deduping video IDs. If you add new playlist metadata, update this helper or legacy cookies will clobber fields during first-login migration.

## 5. PlaylistService usage (app/lib/playlist.server.ts)
- Construct with the route context: `const playlistService = new PlaylistService(context);`. The class caches a Drizzle client created from `context.cloudflare.env.DB`.
- `getUserPlaylists()` performs a single `SELECT` for playlists, items, and `user_settings` and returns a `UserPlaylistData` object (`{ playlists, activePlaylistId, loopMode, isShuffle }`). Prefer this instead of rolling ad-hoc queries so the `sanitize...` logic stays centralized.
- `saveUserPlaylists()` deletes the user's existing playlists and inserts sanitized data in bulk. Playlist items are chunked in `PLAYLIST_ITEM_CHUNK_SIZE` batches (20 rows = 100 D1 bound parameters) to stay inside Cloudflare limits. After writing playlists it upserts into `user_settings` to persist loop/shuffle state—any new per-user playback flag belongs there.
- `syncLocalStorageDataToDatabase()` is reserved for "first login" migrations. It loads DB data, merges it with cookie/localStorage using `mergePlaylistsForSync()`, and then reuses `saveUserPlaylists()`. Invoke this path only from migration flows so we avoid double writes.

## 6. API surface & sync flow
- `GET /api/playlists/load` (app/routes/api.playlists.load.ts) returns the exact `UserPlaylistData` shape. Clients expect `{ playlists: [], activePlaylistId: string, loopMode: "all" | "one", isShuffle: boolean }` and will fall back to an empty payload if the response is null.
- `POST /api/playlists/sync` expects the sanitized payload emitted by `usePlayerStore.syncToServer()` (`{ playlists, activePlaylistId, loopMode, isShuffle }`). On success it returns `{ success: true }`; on failure it emits `{ error: string }` with either `400`, `401`, `405`, or `500`.
- The store only calls `syncToServer()` when `user` exists and hydration finished. If you introduce new server mutations, reuse the same `fetch("/api/...", { headers: { "Content-Type": "application/json" } })` pattern so Biome's fetch mocks continue to work in tests.

## 7. Operational checklist
- D1 migrations: run `npm run db:migrate` to push `database/schema.ts` changes and keep `drizzle/` artifacts committed.
- Better Auth schema: regenerate with `npm run auth:db:generate` whenever auth tables change so `database/auth-schema.ts` stays in sync with the provider config.
- Local testing: use `wrangler dev --remote` so `context.cloudflare.env.DB` and auth envs exist while exercising the route loaders.
