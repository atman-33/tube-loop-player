## Context

TubeLoopPlayer currently serves all users with an ad-supported experience. The application uses React Router v7 file-based routing with layout routes (`_app`) that wrap feature pages. Ad scripts are globally loaded in `root.tsx` via the `AdScripts` component, affecting all pages universally.

**Current Architecture:**
- Main route: `app/routes/_app/` - Layout with header, footer, sync hooks, and ad integration
- Index page: `app/routes/_app._index/` - Main player interface
- Global ad injection: `root.tsx` loads `AdScripts` in the document `<head>`

**Constraint:**
- Must maintain feature parity (player, playlists, sync, auth) between normal and clean modes
- Clean mode should be discoverable only by direct URL access
- No infrastructure changes (DNS, additional services)

## Goals / Non-Goals

**Goals:**
- Create `/clean` URL path that provides ad-free experience
- Reuse all existing application logic and components
- Add SEO protection (noindex, nofollow) to clean mode pages
- Keep implementation simple and maintainable

**Non-Goals:**
- Authentication or access control for clean mode (open to anyone with the URL)
- Feature differences between modes beyond advertising
- Analytics segregation (both modes use same analytics)
- UI/UX changes specific to clean mode

## Decisions

### Decision 1: Separate Layout Route vs. Conditional Logic

**Chosen: Create separate `_clean` layout route**

**Rationale:**
- Clean separation of concerns - ad logic stays with `_app`, clean mode naturally excludes it
- React Router v7 file-based routing makes creating parallel route trees straightforward
- No conditional logic scattered throughout components
- Easy to maintain and reason about - each mode has its own entry point

**Alternative Considered:**
- Conditional `AdScripts` rendering in `root.tsx` based on URL path
- **Why not:** Would require URL checking in root layout, mixing concerns; less idiomatic with React Router patterns

### Decision 2: Content Reuse Strategy

**Chosen: Create new route structure that imports shared components**

**Rationale:**
- `_app._index/route.tsx` contains the main player logic - can be imported and reused
- Layout components (Header, Footer) can be shared between `_app` and `_clean`
- Hooks (`usePlaylistSync`, `usePinnedSongsSync`) are independent of routing

**Implementation:**
```
app/routes/
  _app/              # Normal ad-supported mode
    route.tsx        # Layout with ads
    _index/
      route.tsx      # Player page
  _clean/            # Clean ad-free mode
    route.tsx        # Layout without ads
    _index/
      route.tsx      # Player page (reuses logic from _app._index)
```

### Decision 3: SEO Protection

**Chosen: Add `<meta name="robots">` in clean mode layout's `meta` export**

**Rationale:**
- React Router v7's meta function is the standard way to inject meta tags
- Prevents search engines from indexing clean mode pages
- Keeps clean mode "hidden" from public discovery while accessible via direct URL

**Implementation:**
```typescript
export function meta() {
  return [
    { name: 'robots', content: 'noindex, nofollow' }
  ];
}
```

### Decision 4: Ad Script Exclusion

**Chosen: Do not import `AdScripts` component in `_clean` layout**

**Rationale:**
- `AdScripts` is currently only imported in `root.tsx`
- Since we're creating a separate layout route, we simply omit the import
- No conditional logic needed - the clean layout naturally doesn't reference ad code

**Alternative Considered:**
- Modify `root.tsx` to conditionally load `AdScripts` based on route
- **Why not:** Root layout should remain route-agnostic; route-specific concerns belong in route layouts

## Risks / Trade-offs

**[Risk] Code duplication between `_app` and `_clean` layouts**
- **Mitigation:** Extract shared layout logic (Header, Footer, sync hooks initialization) into shared components or composition functions. Monitor for drift during updates.

**[Risk] Users discover clean mode and stop using ad-supported version**
- **Mitigation:** No links to clean mode from within the app; only accessible by direct URL. This is acceptable per product requirements ("those who know").

**[Risk] Analytics confusion between modes**
- **Mitigation:** Both modes use same analytics. If segregation becomes needed later, add URL path filtering in analytics dashboard or inject mode identifier in tracking code.

**[Trade-off] Maintenance burden of parallel route trees**
- **Trade-off accepted:** The simplicity of separation outweighs the cost of maintaining two routes. Changes to core functionality affect shared components, not route structures.

## Migration Plan

**Deployment:**
1. Add new `_clean` route files without touching existing `_app` routes
2. Deploy to production - new route becomes immediately accessible at `/clean`
3. No user migration needed - both routes coexist

**Rollback Strategy:**
- Simply remove `app/routes/_clean/` directory
- No database changes, no state migrations - rollback is instant

**Verification:**
1. Test `/clean` URL loads without ads
2. Verify feature parity (playlists, sync, auth work identically)
3. Confirm robots meta tag present on clean mode pages
4. Test that existing `/` URL still shows ads

## Open Questions

None - design is straightforward with minimal unknowns.
