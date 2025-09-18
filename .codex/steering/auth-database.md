# Authentication & Database Patterns

## Authentication System
- **Better Auth** - Modern authentication library with OAuth support
- **Providers**: Google OAuth (primary), GitHub OAuth (available but not exposed in UI)
- **Session Management**: Server-side sessions with cookie-based storage
- **Client-Server Integration**: Seamless auth state synchronization

## Authentication Flow
```typescript
// Client-side authentication hook
const { user, isAuthenticated, signIn, signOut } = useAuth();

// Server-side session validation
const auth = getAuth(context);
const session = await auth.api.getSession({ headers: request.headers });
```

## Database Architecture
- **Cloudflare D1** - SQLite-compatible serverless database
- **Drizzle ORM** - Type-safe database operations
- **Better Auth Integration** - Uses Kysely for auth-specific queries

## Database Schema
```typescript
// Core tables
- user              // Better Auth user table
- session           // Better Auth session table
- account           // Better Auth OAuth account table
- playlist          // User playlists
- playlistItem      // Individual playlist items
- userSettings      // User preferences (loop mode, shuffle, etc.)
```

## Playlist Data Flow
1. **Guest Users**: Data stored in browser cookies only
2. **New Authenticated Users**: Cookie data migrated to database on first login
3. **Returning Users**: Database data loaded, cookies updated
4. **Real-time Sync**: Changes automatically sync to database within 1 second

## Playlist Service Patterns
```typescript
// Server-side playlist operations
const playlistService = new PlaylistService(context);

// Load user data
const userData = await playlistService.getUserPlaylists(userId);

// Save user data
const success = await playlistService.saveUserPlaylists(userId, data);

// Sync cookie data to database (merge strategy)
const synced = await playlistService.syncCookieDataToDatabase(userId, cookieData);
```

## State Management Integration
- **Zustand Store**: Enhanced with authentication and sync capabilities
- **Cookie Persistence**: Automatic cookie storage for offline support
- **Cloud Sync**: Automatic server synchronization for authenticated users
- **Merge Strategy**: Smart merging of local and cloud data to prevent data loss

## API Endpoints
- `POST /api/playlists/sync` - Save playlist data to database
- `GET /api/playlists/load` - Load playlist data from database
- Authentication required for both endpoints

## Security Considerations
- All playlist operations require valid user session
- User data isolation - users can only access their own playlists
- Cascade deletes - removing user removes all associated data
- Input validation on all API endpoints

## Environment Variables
```bash
BETTER_AUTH_SECRET=          # Auth encryption secret
OAUTH_GOOGLE_CLIENT_ID=      # Google OAuth client ID
OAUTH_GOOGLE_CLIENT_SECRET=  # Google OAuth client secret
OAUTH_GITHUB_CLIENT_ID=      # GitHub OAuth client ID (optional)
OAUTH_GITHUB_CLIENT_SECRET=  # GitHub OAuth client secret (optional)
BETTER_AUTH_URL=            # Auth service base URL
DB=                         # Cloudflare D1 database binding
```