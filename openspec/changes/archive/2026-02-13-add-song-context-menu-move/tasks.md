## 1. Component Setup

- [x] 1.1 Create `SongContextMenu` component file at `app/routes/_app._index/components/song-context-menu.tsx`
- [x] 1.2 Set up imports (DropdownMenu components, PlayerStore hooks, Lucide icons)
- [x] 1.3 Define component props interface (item, index, children, etc.)

## 2. Context Menu UI

- [x] 2.1 Wrap song item with DropdownMenu root and Trigger
- [x] 2.2 Create context menu Content with "Move to Playlist" submenu
- [x] 2.3 Build submenu listing available playlists (excluding current and Favorites)
- [x] 2.4 Handle empty state when no target playlists available
- [x] 2.5 Add keyboard navigation support (arrow keys, Enter, Escape)

## 3. Move Functionality

- [x] 3.1 Get available playlists from store (filter out current and Favorites)
- [x] 3.2 Call `moveItemBetweenPlaylists` action on playlist selection
- [x] 3.3 Handle duplicate song detection (show info toast if already exists)
- [x] 3.4 Show success toast notification on successful move
- [x] 3.5 Close menu after move operation completes

## 4. Integration

- [x] 4.1 Import and integrate SongContextMenu in `playlist-display.tsx`
- [x] 4.2 Wrap existing SortableItem with context menu component
- [x] 4.3 Ensure drag-and-drop still works alongside context menu
- [x] 4.4 Test that right-click doesn't interfere with left-click play action

## 5. Testing & Validation

- [x] 5.1 Test moving song to another playlist via context menu
- [x] 5.2 Test duplicate prevention (try moving song that already exists in target)
- [x] 5.3 Test keyboard navigation (arrow keys, Enter, Escape)
- [x] 5.4 Test with Favorites playlist active (should not show Favorites as target)
- [x] 5.5 Verify toast notifications appear correctly
- [x] 5.6 Run `npm run biome:check` and fix any linting issues
- [x] 5.7 Run `npm run test` and ensure existing tests pass
