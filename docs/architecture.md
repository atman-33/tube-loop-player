# Architecture Documentation

## Routing & Layouts

TubeLoopPlayer uses [React Router v7](https://reactrouter.com/) with file-based routing. The application follows a dual-layout strategy to separate the standard ad-supported experience from the "clean mode" experience.

### Route Structure

The application routes are structured to maximize code reuse while maintaining distinct environments:

- **`app/routes/_app/`**
  - The standard application layout.
  - Wraps the main interface with ad scripts (`AdScripts`) and analytics.
  - Contains the primary user flow.

- **`app/routes/_clean/`**
  - The "Clean Mode" layout.
  - **No Ads**: Specifically excludes the `AdScripts` component.
  - **SEO Protection**: Includes `noindex, nofollow` meta tags to prevent search indexing.
  - Used for strictly private/internal or distraction-free use cases.
  - Reuses the same core components (Header, Player, etc.) as the main app.

### Clean Mode Implementation

Clean Mode (`/clean`) is implemented as a parallel route tree that reuses the logic from the main application.

*   **Layout (`_clean/route.tsx`)**: Provides the shell for clean mode. It acts similarly to the main layout but omits ad integrations.
*   **Page (`_clean._index/route.tsx`)**: Re-exports the logic and UI from `_app._index/route.tsx`. This ensures that the player functionality, playlist management, and syncing logic remain identical between both modes.

### Data Synchronization

Both modes share the same data stores and synchronization hooks (`usePlaylistSync`, `usePinnedSongsSync`). Authentication and user state are consistent across both standard and clean routes.
