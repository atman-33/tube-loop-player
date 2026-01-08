## Why
The current conflict modal's "Cancel" button behavior is misleading and potentially destructive. When users click "Cancel," they expect no action to occur (standard UI convention), but the current implementation silently syncs local data to the server, potentially overwriting cloud data without user awareness. This violates user expectations and can lead to unintended data loss.

## What Changes
- Replace the "Cancel" button with a "Decide Later" button that truly postpones the decision
- When "Decide Later" is clicked, the modal closes without any data synchronization
- The conflict state is preserved so the modal can be shown again on next session if needed
- Update conflict resolution logic to distinguish between explicit choices (Use Local/Cloud) and deferred decisions

## Impact
- Affected specs: `playlist-sync`
- Affected code:
  - `app/components/data-conflict-modal.tsx` - Button label and UI
  - `app/hooks/use-playlist-sync.ts` - `cancelConflictResolution` logic
  - `app/routes/_app/route.tsx` - Prop name (minimal change)

## User Experience Improvement
- **Before**: "Cancel" → unexpected sync → potential data loss
- **After**: "Decide Later" → no action → safe decision postponement

## Breaking Changes
None. This is a UX improvement that makes the behavior match user expectations.
