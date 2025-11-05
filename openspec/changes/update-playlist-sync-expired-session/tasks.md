## 1. Implementation
- [ ] 1.1 Add 401 handling in `usePlaylistSync` to short-circuit cloud loading and set an “unauthorized” sync state.
- [ ] 1.2 Expose a helper in `useAuth` (or equivalent) to clear cached user data and optionally trigger Better Auth sign-out + reload.
- [ ] 1.3 Prevent the conflict modal from opening when the sync state is unauthorized.
- [ ] 1.4 Update Zustand sync slice logic, if needed, to avoid enqueuing further sync attempts until a new session exists.

## 2. Testing
- [ ] 2.1 Extend `usePlaylistSync` integration tests to cover a 401 response and assert no conflict modal data is produced.
- [ ] 2.2 Add unit coverage (or mocks) ensuring the auth reset helper is invoked on unauthorized responses.

## 3. Validation
- [ ] 3.1 Run `npm run test` to confirm the new coverage passes.
- [ ] 3.2 Run `openspec validate update-playlist-sync-expired-session --strict`.
