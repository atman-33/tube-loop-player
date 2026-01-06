## ADDED Requirements
### Requirement: Initial cloud fetch gating
The system SHALL only perform conflict-analysis fetch on initial authenticated load (or when cloud has not yet been fetched), distinguishing initial-unsynced from local-change-unsynced states.

#### Scenario: Initial load fetches cloud
- **GIVEN** a user signs in and no cloud fetch has occurred in the current session
- **WHEN** the playlist sync flow starts
- **THEN** the client SHALL fetch cloud playlists once and run conflict analysis.

#### Scenario: Local change does not re-trigger conflict fetch
- **GIVEN** the client already fetched cloud once in the session
- **AND** the user reorders songs locally, making local state unsynced
- **WHEN** the sync state is set to unsynced
- **THEN** the client SHALL rely on auto-sync to push the change and SHALL NOT re-fetch cloud for conflict analysis due to that local change.

### Requirement: Server version exposure
The system SHALL compute a serverVersion using existing timestamps (e.g., max of playlist.updatedAt and user_settings.updatedAt, optionally pinned timestamps) and return it in playlist load/sync responses.

#### Scenario: Load returns serverVersion
- **WHEN** the client calls GET /api/playlists/load
- **THEN** the response SHALL include serverVersion alongside playlist data.

#### Scenario: Sync returns serverVersion
- **WHEN** the client calls POST /api/playlists/sync to persist playlists
- **THEN** the response SHALL include serverVersion reflecting the persisted state.

### Requirement: Conflict gating by version and diff
The system SHALL display the conflict modal only when the cloud serverVersion is strictly newer than the client’s localVersion and a diff indicates meaningful differences; otherwise it SHALL prefer auto-sync/local state.

#### Scenario: Cloud newer shows conflict
- **GIVEN** cloud serverVersion is greater than localVersion
- **AND** diff shows differences between cloud and local data
- **WHEN** the sync flow evaluates conflicts
- **THEN** the system SHALL show the conflict modal to the user.

#### Scenario: Cloud not newer skips conflict
- **GIVEN** cloud serverVersion is equal to or older than localVersion
- **WHEN** the sync flow evaluates conflicts
- **THEN** the system SHALL skip the conflict modal and proceed with auto-sync/local state.
