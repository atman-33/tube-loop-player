/**
 * Data normalization utility for UserPlaylistData structures
 * Ensures consistent data comparison by normalizing ordering and undefined values
 */

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

export interface NormalizedPlaylistItem {
  id: string;
  title: string; // Always string, never undefined
}

export interface NormalizedPlaylist {
  id: string;
  name: string;
  items: NormalizedPlaylistItem[];
}

export interface NormalizedUserPlaylistData {
  playlists: NormalizedPlaylist[];
  activePlaylistId: string;
  loopMode: "all" | "one";
  isShuffle: boolean;
}

export class DataNormalizer {
  /**
   * Normalizes UserPlaylistData for consistent comparison
   * - Sorts playlists by ID
   * - Sorts playlist items by ID within each playlist
   * - Converts undefined titles to empty strings
   */
  static normalize(data: UserPlaylistData): NormalizedUserPlaylistData {
    if (!data || typeof data !== "object") {
      throw new Error("Invalid data: expected UserPlaylistData object");
    }

    if (!Array.isArray(data.playlists)) {
      throw new Error("Invalid data: playlists must be an array");
    }

    // Validate and normalize playlists
    const normalizedPlaylists: NormalizedPlaylist[] = [];
    for (const playlist of data.playlists) {
      normalizedPlaylists.push(DataNormalizer.normalizePlaylist(playlist));
    }

    // Sort playlists by ID
    normalizedPlaylists.sort((a, b) => a.id.localeCompare(b.id));

    return {
      playlists: normalizedPlaylists,
      activePlaylistId: data.activePlaylistId || "",
      loopMode: data.loopMode || "all",
      isShuffle: Boolean(data.isShuffle),
    };
  }

  /**
   * Normalizes a single playlist
   * - Sorts items by ID
   * - Converts undefined titles to empty strings
   */
  private static normalizePlaylist(playlist: Playlist): NormalizedPlaylist {
    if (!playlist || typeof playlist !== "object") {
      throw new Error("Invalid playlist: expected Playlist object");
    }

    if (typeof playlist.id !== "string" || typeof playlist.name !== "string") {
      throw new Error("Invalid playlist: expected Playlist object");
    }

    if (!Array.isArray(playlist.items)) {
      throw new Error("Invalid playlist: items must be an array");
    }

    // Validate and normalize items
    const normalizedItems: NormalizedPlaylistItem[] = [];
    for (const item of playlist.items) {
      normalizedItems.push(DataNormalizer.normalizePlaylistItem(item));
    }

    // Sort items by ID
    normalizedItems.sort((a, b) => a.id.localeCompare(b.id));

    return {
      id: playlist.id || "",
      name: playlist.name || "",
      items: normalizedItems,
    };
  }

  /**
   * Normalizes a single playlist item
   * - Converts undefined title to empty string
   */
  private static normalizePlaylistItem(
    item: PlaylistItem,
  ): NormalizedPlaylistItem {
    if (!item || typeof item !== "object") {
      throw new Error("Invalid playlist item: expected PlaylistItem object");
    }

    if (typeof item.id !== "string") {
      throw new Error("Invalid playlist item: expected PlaylistItem object");
    }

    return {
      id: item.id || "",
      title: item.title || "", // Convert undefined to empty string
    };
  }

  /**
   * Validates that the input data has the expected structure
   */
  static isValidUserPlaylistData(data: unknown): data is UserPlaylistData {
    if (!data || typeof data !== "object") return false;

    const obj = data as Record<string, unknown>;

    return (
      Array.isArray(obj.playlists) &&
      typeof obj.activePlaylistId === "string" &&
      (obj.loopMode === "all" || obj.loopMode === "one") &&
      typeof obj.isShuffle === "boolean" &&
      obj.playlists.every((playlist) =>
        DataNormalizer.isValidPlaylist(playlist),
      )
    );
  }

  /**
   * Validates that a playlist has the expected structure
   */
  private static isValidPlaylist(playlist: unknown): playlist is Playlist {
    if (!playlist || typeof playlist !== "object") return false;

    const obj = playlist as Record<string, unknown>;

    return (
      typeof obj.id === "string" &&
      typeof obj.name === "string" &&
      Array.isArray(obj.items) &&
      obj.items.every((item) => DataNormalizer.isValidPlaylistItem(item))
    );
  }

  /**
   * Validates that a playlist item has the expected structure
   */
  private static isValidPlaylistItem(item: unknown): item is PlaylistItem {
    if (!item || typeof item !== "object") return false;

    const obj = item as Record<string, unknown>;

    return (
      typeof obj.id === "string" &&
      (obj.title === undefined || typeof obj.title === "string")
    );
  }
}
