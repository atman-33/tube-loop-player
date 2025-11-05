## ADDED Requirements
### Requirement: Handle Expired Auth Session During Playlist Sync
The system SHALL treat unauthorized responses from playlist sync endpoints as a sign-out event and keep local playlist data active instead of presenting fallback cloud data.

#### Scenario: Expired session while loading cloud playlists
- **WHEN** the client requests `/api/playlists/load` and receives a 401 Unauthorized response
- **THEN** the client SHALL clear the authenticated user state and mark playlist sync as inactive
- **AND** the client SHALL skip opening the conflict resolution modal
- **AND** the client SHALL leave local playlist data untouched
- **AND** further automatic sync attempts SHALL be skipped until a new authenticated session is established
