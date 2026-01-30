## Why

Some users prefer an ad-free experience while using TubeLoopPlayer. To accommodate these users without compromising the primary revenue model, we need a "clean mode" accessible through a specific URL path that only those who know about it can use. This maintains the main ad-supported version while providing an alternative for users who seek it.

## What Changes

- Add a new clean mode route at `/clean` URL path
- Create a dedicated layout for clean mode that excludes ad scripts (`AdScripts`)
- Reuse existing application functionality (player, playlists, sync) in the clean mode
- Add SEO protection to prevent search engines from indexing the clean mode page (`noindex, nofollow`)
- Maintain feature parity between normal and clean modes (only advertising differs)

## Capabilities

### New Capabilities

- `clean-mode-routing`: URL path routing to access ad-free version of the application with SEO protection

### Modified Capabilities

<!-- No existing capabilities require requirement changes. This is a new feature that adds an alternative route without modifying existing functionality. -->

## Impact

**New Files:**
- `app/routes/_clean/route.tsx` - Clean mode layout component
- `app/routes/_clean._index/route.tsx` - Clean mode index page

**Modified Files:**
- `app/root.tsx` - May need conditional logic for ad script loading (or handle via separate layout)
- Route configuration - Add new route definitions

**User Impact:**
- Users who discover the `/clean` URL can access the app without ads
- No impact on existing users using the main URL
- Bookmark-friendly URL for returning users

**SEO Impact:**
- Clean mode pages will have `noindex, nofollow` meta tags
- No negative impact on search engine rankings for main pages

**Infrastructure:**
- No infrastructure changes required
- No additional dependencies needed
