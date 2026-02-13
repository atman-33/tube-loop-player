## Context

The tube-loop-player currently supports drag-and-drop for moving songs between playlists. While intuitive, this approach becomes unwieldy when users have many playlists (up to 10 maximum) and need to scroll horizontally through tabs to find the target playlist. The drag-and-drop interaction requires precise cursor movement across potentially large distances.

The existing `moveItemBetweenPlaylists` action in the playlist store already handles the core logic for moving songs, including duplicate detection. This design leverages that existing functionality.

## Goals / Non-Goals

**Goals:**
- Provide a right-click context menu as an alternative to drag-and-drop
- Allow users to move songs to any playlist via a nested submenu
- Maintain consistency with existing drag-and-drop behavior (same validation, same toast notifications)
- Ensure keyboard accessibility and screen reader support
- Keep the implementation simple by reusing existing store actions

**Non-Goals:**
- Replacing drag-and-drop (both methods will coexist)
- Adding "Move to Favorites" (favorites use the existing star icon pattern)
- Bulk move operations (single song only)
- Creating new playlists from the context menu

## Decisions

**Decision: Use Radix UI DropdownMenu with Sub components**
- **Rationale**: The project already uses Radix UI primitives (`app/components/ui/dropdown-menu.tsx`). Using `DropdownMenuSub`, `DropdownMenuSubTrigger`, and `DropdownMenuSubContent` provides a native-feeling nested menu without additional dependencies.
- **Alternatives considered**: 
  - Custom context menu implementation (rejected: more code to maintain)
  - Third-party context menu library (rejected: adds dependency when Radix UI suffices)

**Decision: Right-click triggers the menu (not a dedicated button)**
- **Rationale**: Right-click is the standard pattern for context menus. Adding a visible button would clutter the UI.
- **Alternatives considered**:
  - Three-dot menu button on each song (rejected: visual clutter)
  - Long-press on mobile (out of scope for now)

**Decision: Reuse `moveItemBetweenPlaylists` store action**
- **Rationale**: The existing action handles all validation (duplicate checking), state updates, and shuffle queue resets. Using it ensures identical behavior to drag-and-drop.
- **Trade-off**: The action appends to the end of the target playlist (cannot specify position), which is acceptable for this use case.

**Decision: Exclude Favorites from target playlists**
- **Rationale**: The Favorites playlist is special - songs are added via the star icon, not by moving. This maintains consistency with the existing UX pattern.

**Decision: Show toast on success/failure**
- **Rationale**: Users need feedback when an action completes, especially since the menu closes immediately. The existing toast system (`sonner`) will be used.

## Risks / Trade-offs

**Risk: Discoverability**
- Users may not know right-click is available
- **Mitigation**: This is an alternative method, not the primary one. Users who struggle with drag-and-drop will naturally try right-click.

**Risk: Mobile/touch devices don't have right-click**
- Context menus don't work on touch devices
- **Mitigation**: Drag-and-drop remains the primary method. Mobile users can continue using the existing drag-and-drop or we can add a long-press menu in the future.

**Risk: Accessibility concerns with custom context menus**
- Native context menus have built-in accessibility; custom ones need careful implementation
- **Mitigation**: Radix UI handles ARIA attributes and keyboard navigation. We'll ensure proper focus management and screen reader announcements.

**Trade-off: Cannot specify position in target playlist**
- Songs are always appended to the end
- **Acceptance**: This matches drag-and-drop behavior. Users can reorder after moving if needed.

## Migration Plan

Not applicable - this is a new feature with no migration required.

## Open Questions

None at this time.
