# song-context-menu Specification

## Purpose
Enable users to move songs between playlists via a right-click context menu, providing an efficient alternative to drag-and-drop when managing playlists with many tabs. This feature complements the existing drag-and-drop functionality by offering a quick, precise way to reorganize songs without navigating through horizontal tab scrolling.

## Requirements

### Requirement: Right-click context menu on playlist songs
The system SHALL display a context menu when a user right-clicks on any song in a playlist, providing actions including the ability to move the song to another playlist.

#### Scenario: Open context menu on song right-click
- **GIVEN** a playlist contains one or more songs
- **WHEN** the user right-clicks on a song item
- **THEN** a context menu SHALL appear near the cursor with available actions
- **AND** the menu SHALL include a "Move to Playlist" submenu option

#### Scenario: Context menu closes on outside click
- **GIVEN** the context menu is open
- **WHEN** the user clicks outside the menu or presses Escape
- **THEN** the menu SHALL close without performing any action

### Requirement: Move to Playlist submenu
The system SHALL provide a submenu listing all available target playlists when the user selects "Move to Playlist", excluding the current playlist and the Favorites playlist (songs cannot be directly moved to Favorites).

#### Scenario: Display available playlists
- **GIVEN** the user has opened the context menu on a song in Playlist A
- **WHEN** the user hovers over or clicks "Move to Playlist"
- **THEN** a submenu SHALL appear listing all user-created playlists except Playlist A
- **AND** the Favorites playlist SHALL NOT appear in the list

#### Scenario: No available target playlists
- **GIVEN** the user has only one user-created playlist (plus Favorites)
- **WHEN** the user opens the "Move to Playlist" submenu
- **THEN** the submenu SHALL display a message indicating no other playlists are available
- **AND** it MAY provide an option to create a new playlist

#### Scenario: Move song to selected playlist
- **GIVEN** the "Move to Playlist" submenu is open
- **WHEN** the user clicks on Playlist B
- **THEN** the system SHALL move the selected song from its current playlist to Playlist B
- **AND** the menu SHALL close
- **AND** a success toast notification SHALL appear
- **AND** the song SHALL no longer appear in the source playlist

#### Scenario: Prevent duplicate songs in target playlist
- **GIVEN** the selected song already exists in the target playlist
- **WHEN** the user attempts to move the song to that playlist
- **THEN** the system SHALL NOT add a duplicate
- **AND** the menu SHALL close
- **AND** an informational toast SHALL notify the user that the song already exists in the target playlist

### Requirement: Integration with existing drag-and-drop
The system SHALL ensure that the context menu move operation uses the same underlying logic as drag-and-drop, maintaining consistency in behavior, validation, and state updates.

#### Scenario: Use existing moveItemBetweenPlaylists
- **GIVEN** a song is being moved via context menu
- **WHEN** the move operation is triggered
- **THEN** the system SHALL call the existing `moveItemBetweenPlaylists` store action
- **AND** all existing validation logic (duplicate checking, etc.) SHALL be applied

#### Scenario: Shuffle queue consistency
- **GIVEN** the user has shuffle mode enabled
- **WHEN** a song is moved between playlists via context menu
- **THEN** the shuffle queue SHALL be reset for both source and target playlists
- **AND** the behavior SHALL match the drag-and-drop shuffle reset logic

### Requirement: Accessibility support
The system SHALL ensure the context menu is accessible via keyboard navigation and screen readers.

#### Scenario: Keyboard navigation
- **GIVEN** the context menu is open
- **WHEN** the user presses Arrow Up/Down keys
- **THEN** focus SHALL move between menu items
- **AND** pressing Enter SHALL activate the focused item
- **AND** pressing Escape SHALL close the menu

#### Scenario: Screen reader support
- **GIVEN** a screen reader is active
- **WHEN** the context menu opens
- **THEN** the menu SHALL have proper ARIA labels
- **AND** the screen reader SHALL announce the menu and available actions

## Technical Implementation Notes

### UI Components
- Use existing `DropdownMenu` components from `app/components/ui/dropdown-menu.tsx`
- Leverage `DropdownMenuSub`, `DropdownMenuSubTrigger`, and `DropdownMenuSubContent` for the nested playlist selection
- Wrap song items in `DropdownMenuTrigger` with context menu event handling

### State Management
- Utilize existing `moveItemBetweenPlaylists` action from `playlist-slice.ts`
- Access playlist data via `usePlayerStore` hooks
- Use existing `getPlaylistsWithFavorites` to retrieve available playlists

### File Locations
- Modify `app/routes/_app._index/components/playlist-display.tsx` to wrap `SortableItem` with context menu
- Create new component `SongContextMenu` in `app/routes/_app._index/components/song-context-menu.tsx`

### Constraints
- Favorites playlist SHALL NOT be a valid move target (songs can only be added via star icon)
- Current playlist SHALL NOT appear in the target list (moving to same playlist is redundant)
- Maximum playlist count limits SHALL be respected (cannot create new playlist if at limit)
- English-only UI copy as per project conventions
