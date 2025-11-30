## Why
Shuffle playback currently selects the next track using naive random choice, causing noticeable clustering and repeat plays that break the continuous, balanced listening experience the product promises.

## What Changes
- Introduce shuffle state that tracks which playlist entries have been played and prioritizes unplayed items before repeats so playback stays evenly distributed.
- Reset the shuffle history whenever the active playlist changes or its contents mutate to avoid stale bias while respecting new ordering.
- Add automated coverage around the shuffle queue and player store to prevent regressions and document the expected behavior.

## Impact
- Affected specs: playlist-shuffle
- Affected code: app/stores/player.ts, app/stores/player.test.ts, any helpers coordinating shuffle playback
