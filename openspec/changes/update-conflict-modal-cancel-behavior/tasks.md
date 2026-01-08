## 1. Implementation

### 1.1 Update conflict resolution hook
- [x] 1.1.1 Rename `cancelConflictResolution` to `decideLater` in `app/hooks/use-playlist-sync.ts`
- [x] 1.1.2 Remove `syncToServer()` call from the function
- [x] 1.1.3 Keep only `setConflictData(null)` to close modal without sync
- [x] 1.1.4 Update return value to export `decideLater` instead of `cancelConflictResolution`
- [x] 1.1.5 Add `isConflictPending` state to track postponed conflicts
- [x] 1.1.6 Update `decideLater` to set `isConflictPending` flag and show toast notification
- [x] 1.1.7 Update auto-sync useEffect to skip when `isConflictPending` is true
- [x] 1.1.8 Reset `isConflictPending` when user explicitly resolves conflict
- [x] 1.1.9 Reset `isConflictPending` when user logs out
- [x] 1.1.10 Persist `isConflictPending` to localStorage for page reload persistence
- [x] 1.1.11 Add `isConflictPending` check to initial load useEffect
- [x] 1.1.12 Add `isConflictPending` to initial load useEffect dependency array
- [x] 1.1.13 Clear localStorage on logout and conflict resolution

### 1.2 Update modal component
- [x] 1.2.1 Change button label from "Cancel" to "Decide Later" in `app/components/data-conflict-modal.tsx`
- [x] 1.2.2 Update prop name from `onCancel` to `onDecideLater` in interface
- [x] 1.2.3 Update button variant or styling if needed for clarity

### 1.3 Update parent component
- [x] 1.3.1 Update prop binding in `app/routes/_app/route.tsx` from `onCancel={cancelConflictResolution}` to `onDecideLater={decideLater}`

### 1.4 Update investigation memory
- [x] 1.4.1 Update the investigation memory file to reflect the new behavior
- [x] 1.4.2 Document that "Decide Later" now truly postpones the decision

## 2. Testing

### 2.1 Manual testing scenarios
- [ ] 2.1.1 Trigger conflict modal and click "Decide Later"
- [ ] 2.1.2 Verify modal closes without server sync (check network tab)
- [ ] 2.1.3 Verify conflict modal appears again on next session/reload
- [ ] 2.1.4 Verify "Use Local Data" still syncs correctly
- [ ] 2.1.5 Verify "Use Cloud Data" still syncs correctly

### 2.2 Edge case testing
- [ ] 2.2.1 Test "Decide Later" with network offline (should not attempt sync)
- [ ] 2.2.2 Test multiple "Decide Later" clicks (idempotent behavior)

## 3. Documentation
- [x] 3.1 Update code comments explaining the new behavior
- [x] 3.2 No user-facing docs needed (UI is self-explanatory)
