# Product Overview

## 1. Core Promise
- TubeLoopPlayer lets users assemble up to 10 custom YouTube playlists and loop them seamlessly; every surface should reinforce "continuous, distraction-free playback" (see `app/routes/_app._index/route.tsx` which keeps the video player, playlist tabs, and controls in a single viewport).
- Primary CTA is adding a YouTube URL via `PlaylistInputForm` (`app/routes/_app._index/components/playlist-input-form.tsx`). Keep supporting copy short, direct, and English-only—mirroring existing strings such as "Add YouTube URLs to add videos!" in `PlaylistDisplay`.

## 2. Playlist creation & management details
- Tabs (`playlist-tabs.tsx`) expose drag-and-drop reordering via `@dnd-kit` and keyboard reordering through the space/arrow instructions rendered by `PlaylistTab`. Never remove those instructions; accessibility copy is required for users who toggle `isKeyboardSorting`.
- The store (`app/stores/player.ts`) is the source of truth for playlist counts, IDs, and ordering. Features like "duplicate", "rename", or "create" must go through store actions (`createPlaylist`, `renamePlaylist`, `duplicatePlaylist`) so the `maxPlaylistCount` and ID sanitization logic fire before syncing.
- Warn users when they hit the playlist limit. `PlaylistTabs` already surfaces `canCreatePlaylist` and `maxPlaylistCount`; reuse that pattern if you add new entrypoints (e.g., context menus) so the UI consistently communicates the cap of 10 playlists.
- Each playlist item tile (`playlist-display.tsx`) shows the YouTube thumbnail, title, and remove button with tooltip fallback. Any new actions on a tile (e.g., "open on YouTube") should live inside the same item button to preserve the drag handle + tile layout.

## 3. Playback & controls
- `YouTubePlayer` (app/routes/_app._index/components/you-tube-player.tsx) relies on the Zustand store for play/pause, loop, shuffle, and next/previous. When extending playback options, add state to `usePlayerStore` first, then wire UI controls so the keyboard shortcuts and toast notifications remain in sync.
- Dragging playlist items between lists is handled in `_app._index/route.tsx` via `DndContext`, `DragOverlay`, and the `moveItemBetweenPlaylists` action. Maintain the pointer-tracking auto-scroll helper (`getHorizontalScrollIntent`) if you change layout widths, or the drag affordance will break on overflow.
- Empty states (see `PlaylistDisplay`) should stay optimistic: provide one-sentence guidance plus an action such as "Add YouTube URLs" instead of multi-step tutorials.

## 4. Auth & sync experience
- Guest mode stores data in `localStorage` through the persisted Zustand store (`tube-loop-player-storage`). As soon as `useAuth()` reports a signed-in user, `usePlaylistSync()` fetches `/api/playlists/load`, runs the `ConflictResolver`, and may open `<DataConflictModal />`. If you add new features that mutate playlists, ensure they call `syncToServer()` so the modal represents the correct state.
- Sign-in buttons should use `useAuth().signIn('google')` and keep Google as the visible provider; GitHub stays hidden until design explicitly asks for it. `signOut()` must always reload the page so the `_app` loader drops the user reference.
- Show cloud-sync status via the existing toast/sonner patterns. When server writes fail, `usePlaylistSync` logs errors silently today; if you expose UI for failures, reuse the `DataConflictModal` visual style for consistency.

## 5. Voice, tone, and guardrails
- Audience: people who need uninterrupted background audio (study, focus, chill). Copy should be optimistic and action-oriented ("Loop your set", "Drag to reorder"), matching strings already in components like `Description`.
- English is mandatory for all user-facing text, docs, and error messages (see "Language Requirements" enforced in this file). Do not include localization toggles unless product explicitly requests them.
- Keep feature explanations concise. The footer (`app/routes/_app/components/footer.tsx`) only surfaces a contact email; avoid marketing boilerplate elsewhere.
