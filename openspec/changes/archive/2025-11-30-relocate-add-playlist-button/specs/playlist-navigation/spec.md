## ADDED Requirements
### Requirement: Scrollable playlist tabs include creation control
The system SHALL render the playlist creation control as the final item inside the horizontal playlist tab scroller so that it scrolls with the tab row across all supported viewports.

#### Scenario: Horizontal overflow
- **WHEN** the user has more playlists than can fit in the visible tab width
- **THEN** the tab row SHALL allow horizontal scrolling that reveals the playlist creation control without overlapping existing tabs

#### Scenario: Creation limit messaging
- **WHEN** the user reaches the maximum playlist count
- **THEN** the creation control SHALL remain inside the tab scroller, stay disabled, and surface the existing limit tooltip copy
