## MODIFIED Requirements

### Requirement: Conflict gating by version and diff
The system SHALL display the conflict modal only when the cloud serverVersion is strictly newer than the client's localVersion and a diff indicates meaningful differences; otherwise it SHALL prefer auto-sync/local state. The conflict modal SHALL provide three explicit choices: Use Local Data, Use Cloud Data, and Decide Later. The "Decide Later" option SHALL close the modal without any data synchronization, set a pending flag (persisted to localStorage) to prevent auto-sync and initial load sync, and preserve the conflict state for future resolution. A toast notification SHALL inform the user that the conflict has been postponed.

#### Scenario: Cloud newer shows conflict
- **GIVEN** cloud serverVersion is greater than localVersion
- **AND** diff shows differences between cloud and local data
- **WHEN** the sync flow evaluates conflicts
- **THEN** the system SHALL show the conflict modal to the user with three options: Use Local Data, Use Cloud Data, and Decide Later.

#### Scenario: Cloud not newer skips conflict
- **GIVEN** cloud serverVersion is equal to or older than localVersion
- **WHEN** the sync flow evaluates conflicts
- **THEN** the system SHALL skip the conflict modal and proceed with auto-sync/local state.

#### Scenario: User chooses to decide later
- **GIVEN** the conflict modal is displayed
- **WHEN** the user clicks "Decide Later"
- **THEN** the modal SHALL close
- **AND** no data synchronization SHALL occur
- **AND** a pending conflict flag SHALL be set to prevent auto-sync
- **AND** a toast notification SHALL inform the user that the conflict has been postponed
- **AND** the conflict state SHALL be preserved for potential display on the next session.

#### Scenario: Auto-sync respects pending conflict
- **GIVEN** user has clicked "Decide Later" and the pending conflict flag is set
- **WHEN** the auto-sync mechanism evaluates whether to sync
- **THEN** auto-sync SHALL be skipped to preserve user's decision to postpone
- **AND** local data SHALL remain unchanged.

#### Scenario: User explicitly chooses local or cloud
- **GIVEN** the conflict modal is displayed
- **WHEN** the user clicks "Use Local Data" or "Use Cloud Data"
- **THEN** the selected data SHALL be loaded into the application state
- **AND** the selected data SHALL be synchronized to the server
- **AND** the conflict state SHALL be cleared
- **AND** the pending conflict flag SHALL be reset.

#### Scenario: Pending conflict flag resets on logout
- **GIVEN** user has clicked "Decide Later" and the pending conflict flag is set
- **WHEN** the user logs out
- **THEN** the pending conflict flag SHALL be reset
- **AND** the conflict evaluation SHALL occur again on next login.
