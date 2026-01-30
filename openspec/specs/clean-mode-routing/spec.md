# clean-mode-routing Specification

## Purpose
TBD - created by archiving change add-clean-mode-url. Update Purpose after archive.
## Requirements
### Requirement: Clean mode accessible via dedicated URL path

The system SHALL provide an ad-free version of the application accessible at the `/clean` URL path. This route SHALL maintain full feature parity with the main application except for advertisement display.

#### Scenario: User accesses clean mode URL

- **WHEN** user navigates to `/clean` URL path
- **THEN** application loads without advertisement scripts
- **AND** all core features (player, playlists, sync, auth) function identically to main application

#### Scenario: User accesses root URL

- **WHEN** user navigates to `/` or main application URL
- **THEN** application loads with advertisement scripts as normal
- **AND** all features function as expected

### Requirement: Clean mode prevents search engine indexing

The system SHALL include SEO protection meta tags on clean mode pages to prevent search engine discovery and indexing.

#### Scenario: Search engine crawls clean mode page

- **WHEN** search engine bot accesses any page under `/clean` path
- **THEN** page includes `<meta name="robots" content="noindex, nofollow">` tag
- **AND** page is excluded from search engine indexing

#### Scenario: Search engine crawls main application page

- **WHEN** search engine bot accesses main application pages (not `/clean`)
- **THEN** page does NOT include `noindex` meta tag
- **AND** page remains indexable for SEO

### Requirement: Clean mode excludes advertisement scripts

The system SHALL NOT load advertisement scripts (`AdScripts` component) when serving pages under the `/clean` URL path.

#### Scenario: Clean mode page loads

- **WHEN** user loads any page under `/clean` path
- **THEN** `AdScripts` component is NOT rendered in page `<head>`
- **AND** no advertisement-related JavaScript is executed

#### Scenario: Main application page loads

- **WHEN** user loads pages under main application path
- **THEN** `AdScripts` component IS rendered in page `<head>`
- **AND** advertisement scripts load and execute as normal

### Requirement: Clean mode maintains feature parity

The system SHALL provide identical functionality in clean mode compared to the main application, with the exception of advertisement display.

#### Scenario: User plays video in clean mode

- **WHEN** user adds a YouTube URL and plays video in clean mode
- **THEN** video playback functions identically to main application
- **AND** playlist management, loop controls, and player features work as expected

#### Scenario: User syncs data in clean mode

- **WHEN** authenticated user accesses clean mode
- **THEN** playlist sync and pinned songs sync function normally
- **AND** data synchronization between client and server operates identically to main application

#### Scenario: User authenticates in clean mode

- **WHEN** user attempts to sign in from clean mode
- **THEN** authentication flow works identically to main application
- **AND** user session persists across clean mode pages

### Requirement: Clean mode layout structure mirrors main application

The system SHALL implement clean mode using a separate layout route (`clean`) that reuses core application components while excluding advertisement integration.

#### Scenario: Clean mode layout renders

- **WHEN** clean mode page loads
- **THEN** layout includes Header, Footer, Toaster, and sync hooks
- **AND** layout structure matches main application layout except for advertisement components

#### Scenario: Clean mode index page renders

- **WHEN** user accesses `/clean` (clean mode index)
- **THEN** page renders the main player interface
- **AND** interface is functionally identical to main application index page

