# Spec: Conflict Resolution

## ADDED Requirements

### Requirement: Conflict Detection Logic
The system MUST distinguish between "Playlist Content" changes and "Playback State" changes when detecting conflicts.

#### Scenario: Ignoring Active Playlist ID differences
Given the user has the same playlists locally and in the cloud
And the local `activePlaylistId` is "playlist-A"
And the cloud `activePlaylistId` is "playlist-B"
When the application checks for conflicts
Then it should determine there is **NO** conflict
And it should **NOT** show the conflict modal.

#### Scenario: Ignoring Loop Mode differences
Given the user has the same playlists locally and in the cloud
And the local `loopMode` is "one"
And the cloud `loopMode` is "all"
When the application checks for conflicts
Then it should determine there is **NO** conflict.

### Requirement: Auto-Sync Behavior
When auto-syncing identical playlist content, the system MUST preserve the local playback state.

#### Scenario: Preserving Local State on Auto-Sync
Given the user has identical playlists locally and in the cloud
And the local `activePlaylistId` is "playlist-A"
And the cloud `activePlaylistId` is "playlist-B"
When the application performs an auto-sync
Then the resulting application state should have `activePlaylistId` as "playlist-A"
And the playlists should remain consistent with the cloud.

#### Scenario: True Content Conflict
Given the user has "Playlist A" with 5 songs locally
And the user has "Playlist A" with 6 songs in the cloud
When the application checks for conflicts
Then it should determine there **IS** a conflict
And it should show the conflict modal.
