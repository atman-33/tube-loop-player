## Context
False-positive conflict modals arise when local edits set isDataSynced=false and trigger immediate cloud refetch/diff before local changes sync. Existing DB tables already capture updatedAt; API does not expose a version.

## Goals / Non-Goals
- Goals: avoid conflict modal after local-only edits; expose serverVersion for newer-data detection; keep auto-sync behavior.
- Non-Goals: UI redesign of conflict modal; DB schema changes.

## Decisions
- Decision: Add serverVersion computed as max(updatedAt across playlist, user_settings; optionally include pinned) and return in load/sync responses.
- Decision: Introduce hasFetchedCloudOnce + hasLocalChanges flags to separate initial fetch vs local-change flows; auto-sync handles local edits.
- Decision: Gate modal on (cloud.serverVersion > localVersion) AND diff indicates change; otherwise prefer auto-sync/local state.

## Risks / Trade-offs
- Risk: Missing pinned timestamps could undercount serverVersion; mitigate by optionally including pinnedAt if needed.
- Risk: Clock skew on client for localVersion; acceptable because we only require strictly greater serverVersion to show modal.

## Migration Plan
- Ship server changes first to include serverVersion; client tolerates missing field with fallback to initial-fetch-only diff.
- Add client gating and version tracking; maintain backward compatibility when serverVersion absent.

## Open Questions
- Should pinned songs’ pinnedAt be included in serverVersion aggregation?
- Need additional throttling for conflict checks under high latency?
