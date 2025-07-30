interface PlaylistItem {
  id: string;
  title?: string;
}

interface Playlist {
  id: string;
  name: string;
  items: PlaylistItem[];
}

export interface UserPlaylistData {
  playlists: Playlist[];
  activePlaylistId: string;
  loopMode: "all" | "one";
  isShuffle: boolean;
}

/**
 * Calculate a hash for user playlist data to detect changes
 * Normalizes data structure to ensure consistent hashing
 */
export function calculateDataHash(data: UserPlaylistData): string {
  // Normalize the data structure for consistent hashing
  const normalized = {
    playlists: data.playlists
      .map((playlist) => ({
        id: playlist.id,
        name: playlist.name,
        items: playlist.items
          .map((item) => ({
            id: item.id,
            title: item.title || "", // Normalize undefined titles to empty string
          }))
          .sort((a, b) => a.id.localeCompare(b.id)), // Sort items by ID for consistency
      }))
      .sort((a, b) => a.id.localeCompare(b.id)), // Sort playlists by ID for consistency
    activePlaylistId: data.activePlaylistId,
    loopMode: data.loopMode,
    isShuffle: data.isShuffle,
  };

  // Create a stable JSON string and encode it
  const jsonString = JSON.stringify(normalized);
  return btoa(jsonString);
}

/**
 * Compare two data objects by their hash values
 */
export function compareDataByHash(
  data1: UserPlaylistData,
  data2: UserPlaylistData,
): boolean {
  return calculateDataHash(data1) === calculateDataHash(data2);
}
