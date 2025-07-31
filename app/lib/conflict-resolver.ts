/**
 * Intelligent conflict resolution system for playlist data synchronization
 * Determines when to auto-sync vs show modal based on data comparison
 */

import { DataComparator } from "./data-comparator";
import type { UserPlaylistData } from "./data-normalizer";

export type ConflictResolution =
  | { type: "auto-sync"; data: UserPlaylistData }
  | { type: "show-modal"; local: UserPlaylistData; cloud: UserPlaylistData }
  | { type: "no-action" };

export interface ConflictAnalysis {
  hasConflict: boolean;
  conflictType: "identical" | "different" | "empty-local" | "empty-cloud";
  recommendedAction: "auto-sync" | "show-modal" | "sync-local-to-cloud";
  metadata: {
    localItemCount: number;
    cloudItemCount: number;
    localPlaylistCount: number;
    cloudPlaylistCount: number;
  };
}

/**
 * Enhanced conflict resolution logic with automatic sync capabilities
 * Implements intelligent decision making for conflict resolution
 */
export class ConflictResolver {
  private dataComparator: DataComparator;

  constructor(dataComparator?: DataComparator) {
    this.dataComparator = dataComparator || new DataComparator();
  }

  /**
   * Determines if conflict resolution is needed and what action to take
   * @param local - Local playlist data
   * @param cloud - Cloud playlist data
   * @returns ConflictResolution indicating action to take
   */
  public analyzeConflict(
    local: UserPlaylistData,
    cloud: UserPlaylistData,
  ): ConflictResolution {
    try {
      // Handle null/undefined cases
      if (!local && !cloud) {
        return { type: "no-action" };
      }

      if (!local && cloud) {
        // Only cloud data exists - auto-sync cloud data
        return { type: "auto-sync", data: cloud };
      }

      if (local && !cloud) {
        // Only local data exists - this shouldn't trigger conflict resolution
        // The caller should handle syncing local data to cloud
        return { type: "no-action" };
      }

      // Validate data structures before proceeding
      if (
        !this.isValidUserPlaylistData(local) ||
        !this.isValidUserPlaylistData(cloud)
      ) {
        // Malformed data - fallback to showing modal
        return { type: "show-modal", local, cloud };
      }

      // Both datasets exist - perform intelligent comparison
      const analysis = this.performConflictAnalysis(local, cloud);

      switch (analysis.conflictType) {
        case "identical":
          // Data is functionally identical - auto-sync cloud data
          return { type: "auto-sync", data: cloud };

        case "empty-local":
          // Local data is empty/default - auto-sync cloud data
          return { type: "auto-sync", data: cloud };

        case "empty-cloud":
          // Cloud data is empty - sync local to cloud (no action needed here)
          return { type: "no-action" };

        case "different":
          // Meaningful differences exist - show conflict modal
          return { type: "show-modal", local, cloud };

        default:
          // Fallback to showing modal for unknown cases
          return { type: "show-modal", local, cloud };
      }
    } catch (error) {
      console.error("Conflict analysis failed:", error);
      // Fallback to showing modal when analysis fails
      return { type: "show-modal", local, cloud };
    }
  }

  /**
   * Performs automatic sync when data is identical
   * @param cloudData - Cloud data to sync
   */
  public async performAutoSync(cloudData: UserPlaylistData): Promise<void> {
    try {
      // In a real implementation, this would update the local state
      // For now, we'll just log the action since the actual state update
      // is handled by the calling code (usePlaylistSync hook)
      console.log("Performing automatic sync with cloud data");

      // Validate the cloud data before syncing
      if (!this.isValidUserPlaylistData(cloudData)) {
        throw new Error("Invalid cloud data structure");
      }

      // The actual sync operation is handled by the caller
      // This method serves as a validation and logging point
    } catch (error) {
      console.error("Auto-sync failed:", error);
      throw error; // Re-throw to allow caller to handle fallback
    }
  }

  /**
   * Performs detailed conflict analysis between local and cloud data
   * @param local - Local playlist data
   * @param cloud - Cloud playlist data
   * @returns ConflictAnalysis with detailed information
   */
  private performConflictAnalysis(
    local: UserPlaylistData,
    cloud: UserPlaylistData,
  ): ConflictAnalysis {
    // Calculate metadata
    const metadata = {
      localItemCount: this.countTotalItems(local),
      cloudItemCount: this.countTotalItems(cloud),
      localPlaylistCount: local?.playlists?.length || 0,
      cloudPlaylistCount: cloud?.playlists?.length || 0,
    };

    // Check if local data is empty or default
    const isLocalEmpty = this.isEmptyOrDefaultData(local);
    const isCloudEmpty = this.isEmptyOrDefaultData(cloud);

    // Special case: both datasets are empty - treat as identical
    if (isLocalEmpty && isCloudEmpty) {
      return {
        hasConflict: false,
        conflictType: "identical",
        recommendedAction: "auto-sync",
        metadata,
      };
    }

    if (isLocalEmpty && !isCloudEmpty) {
      return {
        hasConflict: false,
        conflictType: "empty-local",
        recommendedAction: "auto-sync",
        metadata,
      };
    }

    if (!isLocalEmpty && isCloudEmpty) {
      return {
        hasConflict: false,
        conflictType: "empty-cloud",
        recommendedAction: "sync-local-to-cloud",
        metadata,
      };
    }

    // Perform deep comparison for identical data
    const areIdentical = this.dataComparator.areDataSetsIdentical(local, cloud);

    if (areIdentical) {
      return {
        hasConflict: false,
        conflictType: "identical",
        recommendedAction: "auto-sync",
        metadata,
      };
    }

    // Data has meaningful differences
    return {
      hasConflict: true,
      conflictType: "different",
      recommendedAction: "show-modal",
      metadata,
    };
  }

  /**
   * Checks if the data is empty or represents default/initial state
   * @param data - UserPlaylistData to check
   * @returns true if data is empty or default
   */
  private isEmptyOrDefaultData(data: UserPlaylistData): boolean {
    if (!data || !data.playlists || data.playlists.length === 0) {
      return true;
    }

    // Check for default playlist structure (3 empty playlists with default names)
    if (
      data.playlists.length === 3 &&
      data.playlists[0]?.name === "Playlist 1" &&
      data.playlists[1]?.name === "Playlist 2" &&
      data.playlists[2]?.name === "Playlist 3" &&
      data.playlists[0]?.items?.length <= 1 &&
      data.playlists[1]?.items?.length === 0 &&
      data.playlists[2]?.items?.length === 0
    ) {
      return true;
    }

    // Check if all playlists are empty
    const totalItems = this.countTotalItems(data);
    return totalItems === 0;
  }

  /**
   * Counts total items across all playlists
   * @param data - UserPlaylistData to count
   * @returns total number of items
   */
  private countTotalItems(data: UserPlaylistData): number {
    if (!data?.playlists) return 0;
    return data.playlists.reduce(
      (total, playlist) => total + (playlist?.items?.length || 0),
      0,
    );
  }

  /**
   * Validates UserPlaylistData structure
   * @param data - Data to validate
   * @returns true if data is valid
   */
  private isValidUserPlaylistData(data: unknown): data is UserPlaylistData {
    if (!data || typeof data !== "object") return false;

    const obj = data as Record<string, unknown>;

    return (
      Array.isArray(obj.playlists) &&
      typeof obj.activePlaylistId === "string" &&
      (obj.loopMode === "all" || obj.loopMode === "one") &&
      typeof obj.isShuffle === "boolean"
    );
  }
}

// Export singleton instance for convenience
export const conflictResolver = new ConflictResolver();
