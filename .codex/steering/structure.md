# Project Structure

## 1. Entry points & layouts
- `app/root.tsx` wires global providers (Tailwind classes, `<Links>`, `<Scripts>`, `<Toaster>`). Keep new global CSS imports here to avoid breaking SSR.
- `app/routes.ts` declares the flat React Router tree. Register new routes here and keep `_app` as the authenticated shell around `_app._index`.
- `app/routes/_app/route.tsx` is the authenticated layout that loads Better Auth session data, exposes `contactEmail`, and renders shared chrome (`Header`, `Footer`, `<DataConflictModal />`). Any route that requires auth should live under `_app/*` so it inherits this loader.
- `app/routes/_app._index/route.tsx` is the landing/primary experience. It mounts `YouTubePlayer`, `PlaylistTabs`, `PlaylistDisplay`, and the playlist form inside a single drag-aware `DndContext`—extend this file when changing the main UX.

## 2. Feature modules inside `app/routes/_app._index`
- `components/playlist-tabs.tsx`, `playlist-tab.tsx`, and `playlist-display.tsx` own playlist management UI (drag handles, rename inputs, delete buttons). Keep each component focused: tabs manage lists, display renders items, and the parent route coordinates drag state.
- `components/playlist-input-form.tsx` validates YouTube URLs and calls `usePlayerStore.addToPlaylist`; reuse its helper methods if you add new entrypoints (e.g., a floating action button) so parsing stays consistent.
- `components/you-tube-player.tsx` wraps the YouTube iframe API. If you add playback controls, wire them here so the iframe reference stays encapsulated.
- `scroll-utils.ts` contains `getHorizontalScrollIntent`, which auto-scrolls tab containers during drags. Update this helper whenever tab widths change to avoid regressions on touch devices.

## 3. Shared UI, hooks, and libs
- `app/components/ui/*` contains reusable primitives (button, tooltip, sonner). Follow the same directory when introducing new design-system elements so Tailwind tokens stay centralized.
- `app/components/data-conflict-modal.tsx` is shared between sync flows; add new conflict-resolution UI there instead of duplicating modal markup.
- `app/hooks/use-auth.ts` and `app/hooks/use-playlist-sync.ts` are the only customer-facing auth/sync hooks. Import them instead of hitting APIs directly.
- `app/lib/*` houses non-UI logic: `auth/` for Better Auth, `playlist.server.ts` for D1 access, `conflict-resolver.ts` and `data-normalizer.ts` for merging heuristics, and `playlist-limits.ts` for constants. Reuse these modules instead of sprinkling helpers throughout routes.

## 4. State & persistence
- `app/stores/player.ts` is the single Zustand store for playback and playlist data. Add new playlist behaviors (duplicate, shuffle, loop) here first; the store already persists to `localStorage` and exposes hydration hooks consumed by `usePlaylistSync`.
- Store tests live alongside the implementation (`app/stores/player.test.ts`). When you touch store logic, update these tests plus the helper specs in `app/lib/playlist.server.test.ts` to cover the new invariants.

## 5. Server endpoints & workers
- REST-style endpoints live under `app/routes/api.*.ts`. `api.playlists.load` and `api.playlists.sync` both call `PlaylistService`; follow that pattern for any new data endpoints so auth and sanitization stay consistent.
- `workers/` contains the Cloudflare Worker entry (SSR adapter). Keep Worker-specific utilities here instead of inside `app/` so they can be bundled separately.

## 6. Data & configuration
- `database/` holds Drizzle schema (`schema.ts`) and the Better Auth schema mirror (`auth-schema.ts`). Migrations compile into `drizzle/`; never edit generated SQL by hand.
- `auth.ts`, `drizzle.config.ts`, `react-router.config.ts`, `vite.config.ts`, and `wrangler.jsonc` sit at repo root. When toolchain settings change, update these configs and commit the generated artifacts.
- `public/` stores static assets (favicons, OGP images). Reference them via `/public` imports from `site-config.ts` so `meta` functions can build absolute URLs.
- `.codex/steering/*.md` (this file plus product/tech/auth-database) steer agents. Do not edit `.codex/steering` from product code—use dedicated tasks like this one.

## 7. Conventions & paths
- Files inside `app/` use kebab-case (`playlist-tabs.tsx`), utilities in `app/lib` can use camelCase when exporting singletons, and tests use `.test.ts`/`.test.tsx` next to their subjects.
- Prefer the `~/` alias for imports (configured in `tsconfig.json`). Example: `import { usePlayerStore } from "~/stores/player";` keeps refactors stable when files move.
- Only write within the workspace or `.codex/**`. Use `vscode.workspace.fs` or the provided tooling for file access when building features.
