# Project Context

## Purpose
TubeLoopPlayer delivers continuous, distraction-free playback for custom YouTube playlists by combining an intuitive drag-and-drop UI with seamless local and cloud persistence. The product emphasizes quick playlist creation, low-friction playback controls, and reliable sync so users can focus on listening rather than management overhead.

## Tech Stack
- TypeScript, React 19, and React Router v7 for the SSR application shell
- Zustand for client-side state with persistent storage
- Tailwind CSS v4 for utility-first styling; Radix UI and Lucide for accessible primitives and icons
- Vite for builds, Vitest for testing, Biome for linting/formatting
- Cloudflare Workers runtime backed by Cloudflare D1 (Drizzle ORM + Kysely) and Better Auth for OAuth sign-in

## Project Conventions

### Code Style
- Biome enforces single quotes, semicolons, and consistent spacing; run `npm run biome:check` before commits
- Source files use kebab-case naming and TypeScript modules prefer arrow functions for declarations (see `docs/coding-rule.md`)
- Keep user-facing strings concise, action-oriented, and English-only to stay aligned with product voice
- Favor the `~/` path alias for internal imports and co-locate tests alongside implementations with `.test.ts[x]`

### Architecture Patterns
- React Router v7 provides server-side rendering with `app/root.tsx` hosting global providers and `_app/*` routes wrapping authenticated experiences
- Zustand store in `app/stores/player.ts` centralizes playlist state and playback controls; hooks such as `use-playlist-sync` coordinate local persistence with cloud sync flows
- UI routes under `_app._index` orchestrate drag-and-drop via `@dnd-kit` while maintaining accessibility copy for keyboard sorting
- Cloudflare Worker entry in `workers/app.ts` adapts the app for deployment, and server endpoints live under `app/routes/api.*.ts` delegating to Drizzle-backed services in `app/lib`

### Testing Strategy
- Vitest powers unit and integration tests; run `npm run test` (or `npm run ci:test` in CI) for coverage of stores, hooks, and lib utilities
- React Testing Library validates UI behavior (see `app/components/ui/button.test.tsx` and hook integration tests)
- Drizzle and conflict resolution logic include focused specs in `app/lib/*.test.ts` to guard playlist merging and limits
- Prefer writing tests alongside new behavior, mirroring existing patterns for stores, hooks, and API services

### Git Workflow
- Develop features on short-lived branches (e.g., `feature/*`) and open PRs against `main`
- Author specifications through OpenSpec before implementing net-new capabilities or behavioral shifts; validate with `openspec validate --strict`
- Commit messages follow concise, imperative phrasing; run formatting, type checks, and tests locally before pushing

## Domain Context
- Users manage up to 10 playlists, reorder items with drag-and-drop, and expect uninterrupted looping playback focused on study/ambient listening needs
- Accessibility guidance for keyboard sorting (space + arrow instructions) must remain visible within playlist tabs to satisfy assistive workflows
- Guest mode persists data to localStorage while authenticated users sync via Cloudflare endpoints; migrations reconcile conflicts through the data conflict modal experience
- Voice and tone stay optimistic, concise, and English-only across UI copy, including error and toast messages

## Important Constraints
- Enforce playlist count limits and warning surfacing (`canCreatePlaylist`, `maxPlaylistCount`) when exposing creation entry points
- Maintain English-only interfaces and documentation; no localization toggles without product approval
- Preserve drag-and-drop auto-scroll helpers and accessibility affordances when altering layout widths to avoid UX regressions
- Do not bypass the Zustand store when mutating playlist state so sync, persistence, and toasts remain coherent

## External Dependencies
- YouTube IFrame Player API powers embedded playback and requires stable video ID parsing
- Cloudflare Workers + D1 provide hosting and database services; Drizzle ORM/Kysely manage queries and migrations
- Better Auth handles OAuth flows (Google primary) with server endpoints under `app/routes/api.auth.$/`
- Sonner toasts, `next-themes` theme provider, and Radix UI primitives supply shared UX patterns reused across routes
