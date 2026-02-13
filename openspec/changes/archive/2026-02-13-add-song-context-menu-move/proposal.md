## Why

Currently, users must drag and drop songs to move them between playlists. When managing many playlists (up to 10), horizontal tab scrolling makes drag-and-drop cumbersome. A right-click context menu provides a precise, efficient alternative for reorganizing songs without navigating through tabs.

## What Changes

- Add right-click context menu on playlist song items
- Implement "Move to Playlist" submenu listing available target playlists
- Use existing `moveItemBetweenPlaylists` store action for consistency
- Show toast notifications for move success/duplicate prevention
- Maintain keyboard accessibility and screen reader support

## Capabilities

### New Capabilities
- `song-context-menu`: Right-click context menu on songs with "Move to Playlist" functionality

### Modified Capabilities
- None (implementation-only change, no spec-level requirement changes)

## Impact

- **UI Components**: `playlist-display.tsx` - Wrap song items with context menu
- **New Component**: `song-context-menu.tsx` - Context menu implementation
- **Store**: Uses existing `moveItemBetweenPlaylists` action, no store changes
- **Dependencies**: Uses existing `DropdownMenu` from Radix UI
- **Accessibility**: Must maintain keyboard navigation and ARIA labels
