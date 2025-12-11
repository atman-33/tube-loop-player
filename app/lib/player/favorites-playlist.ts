import type { Playlist, PlaylistItem } from "~/lib/player/types";
import { FAVORITES_PLAYLIST_ID } from "~/stores/player/constants";

/**
 * Derives the Favorites playlist from pinned order and all available playlists.
 * This function collects songs from all playlists that are marked as pinned,
 * respecting the order specified in pinnedOrder.
 */
export function deriveFavoritesPlaylist(
  pinnedOrder: string[],
  allPlaylists: Playlist[],
): Playlist {
  // Build a map of all available videos from all playlists
  const videoMap = new Map<string, PlaylistItem>();

  for (const playlist of allPlaylists) {
    for (const item of playlist.items) {
      if (!videoMap.has(item.id)) {
        videoMap.set(item.id, item);
      }
    }
  }

  // Build Favorites playlist items from pinned order
  const items = pinnedOrder
    .map((videoId) => videoMap.get(videoId))
    .filter((item): item is PlaylistItem => item !== undefined);

  return {
    id: FAVORITES_PLAYLIST_ID,
    name: "Favorites",
    items,
  };
}

/**
 * Injects the Favorites playlist at position 0 in the playlists array.
 * Returns a new array with Favorites at the beginning.
 */
export function injectFavoritesPlaylist(
  playlists: Playlist[],
  favoritesPlaylist: Playlist,
): Playlist[] {
  return [favoritesPlaylist, ...playlists];
}
