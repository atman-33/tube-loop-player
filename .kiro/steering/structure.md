# Project Structure

## Root Directory
- **app/** - Main application code (React Router v7 structure)
- **workers/** - Cloudflare Workers entry point
- **public/** - Static assets (favicons, images, manifest)
- **test/** - Test configuration and setup
- **docs/** - Project documentation
- **.kiro/** - Kiro AI assistant configuration and steering rules

## App Directory Structure
```
app/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (buttons, inputs, etc.)
│   ├── ad-banner.tsx   # Advertisement components
│   ├── ad-scripts.tsx
│   └── json-ld-software-app.tsx
├── config/             # Application configuration
│   └── site-config.ts
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and helpers
├── routes/             # File-based routing (React Router v7)
├── stores/             # Zustand state management
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