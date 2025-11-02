## 1. Planning
- [x] 1.1 Review existing shuffle implementation in `app/stores/player.ts` and related tests to document current behavior.
- [x] 1.2 Define data shape for tracking recently played items that fits within the persisted player store.

## 2. Implementation
- [x] 2.1 Update the player store shuffle logic to exhaust unplayed items before selecting repeats, resetting state on playlist changes.
- [x] 2.2 Ensure shuffle state cleanup occurs when playlists mutate (add/remove/reorder) and when shuffle mode is disabled.

## 3. Validation
- [x] 3.1 Add or update unit tests in `app/stores/player.test.ts` capturing the new shuffle sequencing behavior.
- [x] 3.2 Add integration coverage if necessary to confirm playlist switching resets shuffle history without bias.
- [x] 3.3 Run `npm run test` and `npm run biome:check` to confirm the suite and formatting pass.
