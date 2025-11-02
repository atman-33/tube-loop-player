## Why
On small screens the standalone "add playlist" control sits beside the playlist tabs container, consuming horizontal space and crowding the tab viewport. Moving it into the scrollable tab strip keeps the tab row compact and prevents the button from overlapping the mobile layout.

## What Changes
- Place the add playlist action inside the horizontal tab scroller so it appears as the last item in the tab row.
- Ensure the control inherits the scroll behavior, navigation affordances, and tooltip messaging already used for playlist creation.
- Adjust tab navigation buttons and spacing so the tab list plus add action remain usable on both desktop and mobile widths.

## Impact
- Affected specs: playlist-navigation
- Affected code: app/routes/_app._index/components/playlist-tabs.tsx, related playlist tab layout styles or utilities
