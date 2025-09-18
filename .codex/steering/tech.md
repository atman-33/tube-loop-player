# Tech Stack

## Core Technologies
- **React 19** - UI framework
- **React Router v7** - Routing and SSR framework (successor to Remix)
- **TypeScript** - Type safety and development experience
- **Tailwind CSS v4** - Utility-first styling
- **Vite** - Build tool and dev server
- **Cloudflare Workers** - Serverless deployment platform
- **Cloudflare D1** - SQLite-compatible serverless database
- **Better Auth** - Modern authentication library with OAuth support

## Key Libraries
- **Zustand** - State management with persistence
- **@dnd-kit** - Drag and drop functionality
- **Radix UI** - Accessible UI primitives
- **Lucide React** - Icon library
- **next-themes** - Theme switching
- **Sonner** - Toast notifications
- **Better Auth** - OAuth authentication system
- **Drizzle ORM** - Database ORM for Cloudflare D1
- **Kysely** - SQL query builder for Better Auth integration

## Development Tools
- **Biome** - Linting and formatting (replaces ESLint/Prettier)
- **Vitest** - Testing framework
- **Husky** - Git hooks
- **Wrangler** - Cloudflare deployment tool

## Common Commands

### Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Testing & Quality
```bash
npm run test         # Run tests
npm run typecheck    # Type checking
npm run biome:check:write  # Format and lint code
```

### Database & Authentication
```bash
npm run db:generate  # Generate database schema
npm run db:migrate   # Run database migrations
npm run auth:db:generate  # Generate auth schema for Better Auth
```

### Deployment
```bash
npm run deploy       # Build and deploy to Cloudflare
npm run cf-typegen   # Generate Cloudflare types
```

### CI Commands
```bash
npm run ci:check     # Biome CI checks
npm run ci:build     # CI build
npm run ci:test      # CI test run
```

## Code Style
- **Biome** configuration enforces single quotes, semicolons, and space indentation
- Unused imports/variables trigger warnings
- Tailwind class sorting is disabled for flexibility