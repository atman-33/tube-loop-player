/**
 * Deep data comparison utility for UserPlaylistData structures
 * Provides intelligent comparison with normalization for conflict detection
 */

import {
  type NormalizedUserPlaylistData,
  normalizeUserPlaylistData,
  type UserPlaylistData,
} from "./data-normalizer";

/**
 * Performance-optimized data comparator for playlist data structures
 * Implements deep comparison with 100ms performance target
 */
export class DataComparator {
  private static readonly COMPARISON_TIMEOUT_MS = 100;

  /**
   * Performs deep comparison of two UserPlaylistData objects
   * Returns true if the data is functionally identical after normalization
   *
   * @param local - Local playlist data
   * @param cloud - Cloud playlist data
   * @returns boolean indicating if data is identical
   */
  public areDataSetsIdentical(
    local: UserPlaylistData,
    cloud: UserPlaylistData,
  ): boolean {
    const startTime = performance.now();

    try {
      // Early null/undefined checks
      if (!local && !cloud) return true;
      if (!local || !cloud) return false;

      // Validate input data structures
      if (
        !this.isValidDataStructure(local) ||
        !this.isValidDataStructure(cloud)
      ) {
        console.warn("Invalid data structure detected during comparison");
        return false;
      }

      // Normalize both datasets for consistent comparison
      const normalizedLocal = normalizeUserPlaylistData(local);
      const normalizedCloud = normalizeUserPlaylistData(cloud);

      // Perform deep comparison
      const result = this.compareNormalizedData(
        normalizedLocal,
        normalizedCloud,
      );

      // Performance monitoring
      const duration = performance.now() - startTime;
      if (duration > DataComparator.COMPARISON_TIMEOUT_MS) {
        console.warn(
          `Data comparison took ${duration.toFixed(2)}ms, exceeding ${DataComparator.COMPARISON_TIMEOUT_MS}ms target`,
        );
      }

      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      console.error(
        `Data comparison failed after ${duration.toFixed(2)}ms:`,
        error,
      );

      // For other errors, return false to trigger conflict modal fallback
      return false;
    }
  }

  /**
   * Compares two normalized UserPlaylistData objects
   * Optimized for performance with early exit conditions
   */
  private compareNormalizedData(
    local: NormalizedUserPlaylistData,
    cloud: NormalizedUserPlaylistData,
  ): boolean {
    // Compare top-level properties first (fastest comparison)
    if (
      local.activePlaylistId !== cloud.activePlaylistId ||
      local.loopMode !== cloud.loopMode ||
      local.isShuffle !== cloud.isShuffle
    ) {
      return false;
    }

    // Compare playlist arrays
    if (local.playlists.length !== cloud.playlists.length) {
      return false;
    }

    // Compare each playlist (data is already sorted by ID from normalization)
    for (let i = 0; i < local.playlists.length; i++) {
      if (
        !this.compareNormalizedPlaylists(local.playlists[i], cloud.playlists[i])
      ) {
        return false;
      }
    }

    return true;
  }

  /**
   * Compares two normalized playlist objects
   * Assumes playlists are already sorted by ID
   */
  private compareNormalizedPlaylists(
    local: NormalizedUserPlaylistData["playlists"][0],
    cloud: NormalizedUserPlaylistData["playlists"][0],
  ): boolean {
    // Compare basic properties
    if (local.id !== cloud.id || local.name !== cloud.name) {
      return false;
    }

    // Compare items array length
    if (local.items.length !== cloud.items.length) {
      return false;
    }

    // Compare each item (data is already sorted by ID from normalization)
    for (let i = 0; i < local.items.length; i++) {
      if (
        !this.compareNormalizedPlaylistItems(local.items[i], cloud.items[i])
      ) {
        return false;
      }
    }

    return true;
  }

  /**
   * Compares two normalized playlist item objects
   * Assumes items are already sorted by ID
   */
  private compareNormalizedPlaylistItems(
    local: NormalizedUserPlaylistData["playlists"][0]["items"][0],
    cloud: NormalizedUserPlaylistData["playlists"][0]["items"][0],
  ): boolean {
    return local.id === cloud.id && local.title === cloud.title;
  }

  /**
   * Validates the basic structure of UserPlaylistData
   * @param data - Data to validate
   * @returns true if data has valid structure
   */
  private isValidDataStructure(data: unknown): data is UserPlaylistData {
    if (!data || typeof data !== "object") return false;

    const obj = data as Record<string, unknown>;

    try {
      return (
        Array.isArray(obj.playlists) &&
        typeof obj.activePlaylistId === "string" &&
        (obj.loopMode === "all" || obj.loopMode === "one") &&
        typeof obj.isShuffle === "boolean" &&
        obj.playlists.every((playlist) => {
          if (!playlist || typeof playlist !== "object") return false;
          const playlistObj = playlist as Record<string, unknown>;
          return (
            typeof playlistObj.id === "string" &&
            typeof playlistObj.name === "string" &&
            Array.isArray(playlistObj.items) &&
            playlistObj.items.every((item) => {
              if (!item || typeof item !== "object") return false;
              const itemObj = item as Record<string, unknown>;
              return (
                typeof itemObj.id === "string" &&
                (typeof itemObj.title === "string" ||
                  itemObj.title === undefined)
              );
            })
          );
        })
      );
    } catch (error) {
      console.warn("Data structure validation failed:", error);
      return false;
    }
  }

  /**
   * Static convenience method for one-off comparisons
   */
  public static areIdentical(
    local: UserPlaylistData,
    cloud: UserPlaylistData,
  ): boolean {
    const comparator = new DataComparator();
    return comparator.areDataSetsIdentical(local, cloud);
  }
}

// Export singleton instance for convenience
export const dataComparator = new DataComparator();
