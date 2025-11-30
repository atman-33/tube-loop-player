# playlist-shuffle Specification

## Purpose
TBD - created by archiving change reduce-shuffle-bias. Update Purpose after archive.
## Requirements
### Requirement: Balanced Playlist Shuffle
The system SHALL ensure shuffle mode distributes playback evenly across the active playlist by preferring unplayed items before replaying previously played items.

#### Scenario: Exhaust items before repeat
- **GIVEN** shuffle mode is enabled and the playlist contains multiple entries
- **WHEN** the player advances through tracks without manual skipping
- **THEN** each entry SHALL play once before any entry repeats, unless the playlist changes

#### Scenario: Reset on playlist change
- **GIVEN** shuffle mode is enabled and the listener switches to a different playlist or edits the current playlist
- **WHEN** playback continues after the change
- **THEN** the shuffle history SHALL reset so the next track selection starts fresh against the updated playlist

