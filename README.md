# TubeLoopPlayer

> Seamless YouTube Playlist Looping with Cloud Sync

![TubeLoopPlayer Screenshot](public/ogp-image.png)

## About The Project

TubeLoopPlayer is a modern web application designed for looping YouTube videos and playlists seamlessly. Create your own custom playlists, sign in to sync across devices, and enjoy uninterrupted playback for studying, working, relaxing, or any occasion. Your playlists are automatically saved to the cloud when you're signed in, ensuring you never lose your carefully curated music collections.

## Features

### Core Functionality
- **Custom Playlists**: Easily create your own playlists from YouTube video or playlist URLs
- **Flexible Playback**: Change the playback order with drag-and-drop, and use loop (all/single) and shuffle modes
- **Multiple Playlists**: Create and manage multiple playlists with tabbed interface
- **Theme Support**: Switch between light and dark modes for your viewing comfort
- **Simple Interface**: An intuitive and user-friendly UI

### Authentication & Cloud Storage
- **OAuth Sign-In**: Sign in with Google or GitHub for cloud features
- **Cloud Synchronization**: Playlists automatically sync to cloud database when signed in
- **Multi-Device Access**: Access your playlists from any device when authenticated
- **Smart Data Migration**: Local playlists automatically migrate to cloud on first sign-in

### Storage Options
- **Guest Mode**: Browser localStorage persistence for anonymous users
- **Authenticated Mode**: Cloud database storage with real-time synchronization
- **Hybrid Approach**: Seamless transition between local and cloud storage

## Built With

### Frontend
- [React 19](https://react.dev/) - UI framework
- [React Router v7](https://reactrouter.com/) - Routing and SSR framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS v4](https://tailwindcss.com/) - Utility-first styling
- [Vite](https://vitejs.dev/) - Build tool and dev server

### Backend & Database
- [Cloudflare Workers](https://workers.cloudflare.com/) - Serverless deployment
- [Cloudflare D1](https://developers.cloudflare.com/d1/) - SQLite-compatible database
- [Better Auth](https://www.better-auth.com/) - Modern authentication with OAuth
- [Drizzle ORM](https://orm.drizzle.team/) - Type-safe database operations

### Key Libraries
- [Zustand](https://zustand-demo.pmnd.rs/) - State management with persistence
- [@dnd-kit](https://dndkit.com/) - Drag and drop functionality
- [Radix UI](https://www.radix-ui.com/) - Accessible UI primitives
- [Lucide React](https://lucide.dev/) - Icon library

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Cloudflare account (for deployment)

### Installation

1. Clone the repo

   ```sh
   git clone https://github.com/your_username/tube-loop-player.git
   cd tube-loop-player
   ```

2. Install NPM packages

   ```sh
   npm install
   ```

3. Set up environment variables

   ```sh
   cp .env.example .env
   ```

   Configure the following variables in `.env`:
   ```env
   BETTER_AUTH_SECRET=your-secret-key
   BETTER_AUTH_URL=http://localhost:5173
   OAUTH_GOOGLE_CLIENT_ID=your-google-client-id
   OAUTH_GOOGLE_CLIENT_SECRET=your-google-client-secret
   ```

4. Set up the database

   ```sh
   npm run db:generate
   npm run db:migrate
   ```

### Development

Start the development server with HMR:

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Database
npm run db:generate  # Generate database schema
npm run db:migrate   # Run database migrations
npm run auth:db:generate  # Generate auth schema

# Testing & Quality
npm run test         # Run tests
npm run typecheck    # Type checking
npm run biome:check:write  # Format and lint code

# Deployment
npm run deploy       # Build and deploy to Cloudflare
npm run cf-typegen   # Generate Cloudflare types
```

## OAuth Setup

### Google OAuth

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" and create an OAuth 2.0 Client ID
5. Add your domain to authorized origins:
   - `http://localhost:5173` (development)
   - `https://your-domain.com` (production)
6. Add redirect URIs:
   - `http://localhost:5173/api/auth/callback/google` (development)
   - `https://your-domain.com/api/auth/callback/google` (production)

### GitHub OAuth (Optional)

1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create a new OAuth App
3. Set Authorization callback URL:
   - `http://localhost:5173/api/auth/callback/github` (development)
   - `https://your-domain.com/api/auth/callback/github` (production)

## Deployment

This application is designed to be deployed on Cloudflare Workers with D1 database.

### Cloudflare Setup

1. Install Wrangler CLI:
   ```sh
   npm install -g wrangler
   ```

2. Login to Cloudflare:
   ```sh
   wrangler login
   ```

3. Create D1 database:
   ```sh
   wrangler d1 create tube-loop-player-db
   ```

4. Update `wrangler.jsonc` with your database ID

5. Deploy:
   ```sh
   npm run deploy
   ```

## Architecture

- **Frontend**: React Router v7 with server-side rendering
- **Authentication**: Better Auth with OAuth providers
- **Database**: Cloudflare D1 (SQLite) with Drizzle ORM
- **Storage Strategy**: 
  - Guest users: Browser localStorage (legacy cookies migrated on load)
  - Authenticated users: Cloud database with localStorage fallback
  - Automatic migration from localStorage (and legacy cookies) to cloud on sign-in
- **Deployment**: Cloudflare Workers for serverless execution

## License

Distributed under the MIT License. See `LICENSE` for more information.
