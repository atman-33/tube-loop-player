# Project Structure

## Root Directory
- **app/** - Main application code (React Router v7 structure)
- **workers/** - Cloudflare Workers entry point
- **database/** - Database schema and migrations
- **drizzle/** - Drizzle ORM generated files
- **public/** - Static assets (favicons, images, manifest)
- **test/** - Test configuration and setup
- **docs/** - Project documentation
- **.kiro/** - Kiro AI assistant configuration and steering rules
- **auth.ts** - Better Auth CLI configuration
- **drizzle.config.ts** - Database configuration

## App Directory Structure
```
app/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (buttons, inputs, etc.)
│   ├── user-avatar.tsx # User profile avatar component
│   ├── ad-banner.tsx   # Advertisement components
│   ├── ad-scripts.tsx
│   └── json-ld-software-app.tsx
├── config/             # Application configuration
│   └── site-config.ts
├── hooks/              # Custom React hooks
│   ├── use-auth.ts     # Authentication state management
│   └── use-playlist-sync.ts  # Playlist synchronization logic
├── lib/                # Utility functions and helpers
│   ├── auth/           # Authentication configuration
│   │   ├── auth.server.ts    # Server-side auth setup
│   │   └── auth.client.ts    # Client-side auth utilities
│   ├── playlist.server.ts    # Server-side playlist operations
│   └── cookie.ts       # Cookie management utilities
├── routes/             # File-based routing (React Router v7)
│   ├── _app/           # Authenticated app layout
│   │   └── components/ # App-specific components (user-menu, etc.)
│   ├── api.playlists.sync.ts   # Playlist sync API endpoint
│   ├── api.playlists.load.ts   # Playlist load API endpoint
│   └── _.demo.auth/    # Authentication demo route
├── stores/             # Zustand state management
│   └── player.ts       # Enhanced player store with auth & sync
├── app.css            # Global styles
├── entry.server.tsx   # Server entry point
├── root.tsx           # Root component
└── routes.ts          # Route configuration
```

## Key Conventions

### File Naming
- Use kebab-case for component files: `ad-banner.tsx`
- Use camelCase for utility files: `siteConfig.ts`
- Test files use `.test.tsx` suffix

### Import Paths
- Use `~/` alias for app directory imports
- Configured in tsconfig.json: `"~/*": ["./app/*"]`

### Component Organization
- UI components in `app/components/ui/` for reusable elements
- Feature-specific components in `app/components/`
- Custom hooks in `app/hooks/`
- State stores in `app/stores/`

### Routing
- File-based routing using React Router v7
- Routes defined in `app/routes/` directory
- Configuration in `app/routes.ts` using `flatRoutes()`

### Configuration Files
- **biome.json** - Code formatting and linting rules
- **wrangler.jsonc** - Cloudflare Workers deployment config
- **react-router.config.ts** - React Router configuration
- **vite.config.ts** - Build tool configuration
- **components.json** - UI component configuration