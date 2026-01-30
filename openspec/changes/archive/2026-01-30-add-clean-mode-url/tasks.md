## 1. Create Clean Mode Layout Route

- [x] 1.1 Create directory structure `app/routes/_clean/`
- [x] 1.2 Create `app/routes/_clean/route.tsx` with layout component
- [x] 1.3 Implement loader function for auth and environment data (mirror `_app/route.tsx`)
- [x] 1.4 Add Header, Footer, Toaster, sync hooks to layout (reuse components from `_app`)
- [x] 1.5 Add meta function with `robots: noindex, nofollow` tags
- [x] 1.6 Verify layout does NOT import or render `AdScripts` component

## 2. Create Clean Mode Index Page

- [x] 2.1 Create directory structure `app/routes/_clean._index/`
- [x] 2.2 Create `app/routes/_clean._index/route.tsx`
- [x] 2.3 Implement meta function (without robots tag - inherited from layout)
- [x] 2.4 Implement default component with player interface
- [x] 2.5 Reuse or import player logic from `_app._index/route.tsx`

## 3. Testing and Verification

- [ ] 3.1 Test `/clean` URL loads without errors
- [ ] 3.2 Verify AdScripts NOT present in page source for `/clean`
- [ ] 3.3 Verify AdScripts IS present in page source for `/` (main app)
- [ ] 3.4 Verify robots meta tag present on `/clean` pages
- [ ] 3.5 Test video playback works identically in clean mode
- [ ] 3.6 Test playlist operations (add, remove, reorder) in clean mode
- [ ] 3.7 Test authentication flow in clean mode
- [ ] 3.8 Test data sync (playlists, pinned songs) in clean mode
- [ ] 3.9 Verify clean mode works on mobile and desktop viewports

## 4. Edge Cases and Polish

- [ ] 4.1 Verify all links and navigation work correctly within clean mode
- [ ] 4.2 Test that conflict resolution modal works in clean mode
- [ ] 4.3 Verify theme toggle works in clean mode
- [ ] 4.4 Test deep linking to specific functionality within clean mode
