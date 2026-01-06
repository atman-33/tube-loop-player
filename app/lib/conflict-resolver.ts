/**
 * Intelligent conflict resolution system for playlist data synchronization
 * Determines when to auto-sync vs show modal based on data comparison
 */

import { FAVORITES_PLAYLIST_ID } from "~/stores/player/constants";
import { DataComparator } from "./data-comparator";
import type { DataDiff } from "./data-diff-calculator";
import { DiffCalculator } from "./data-diff-calculator";
import type { UserPlaylistData } from "./data-normalizer";
import {
  isSequentialDefaultPlaylistName,
  MAX_PLAYLIST_COUNT,
} from "./playlist-limits";

export type ConflictResolution =
  | { type: "auto-sync"; data: UserPlaylistData }
  | {
      type: "show-modal";
      local: UserPlaylistData | null;
      cloud: UserPlaylistData | null;
      diff: DataDiff;
    }
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
  private diffCalculator: DiffCalculator;

  constructor(
    dataComparator?: DataComparator,
    diffCalculator?: DiffCalculator,
  ) {
    this.dataComparator = dataComparator || new DataComparator();
    this.diffCalculator = diffCalculator || new DiffCalculator();
  }

  /**
   * Determines if conflict resolution is needed and what action to take
   * @param local - Local playlist data (can be null)
   * @param cloud - Cloud playlist data (can be null)
   * @returns ConflictResolution indicating action to take
   */
  public analyzeConflict(
    local: UserPlaylistData | null,
    cloud: UserPlaylistData | null,
  ): ConflictResolution {
    const startTime = performance.now();

    try {
      // Handle null/undefined cases
      if (!local && !cloud) {
        return { type: "no-action" };
      }

      if (!local && cloud) {
        // Validate cloud data before auto-sync
        if (!this.isValidUserPlaylistData(cloud)) {
          console.warn(
            "Invalid cloud data structure detected, falling back to modal",
          );
          try {
            const diff = this.diffCalculator.calculateDiff(
              local || this.getEmptyUserData(),
              cloud,
            );
            return {
              type: "show-modal",
              local: local || this.getEmptyUserData(),
              cloud,
              diff,
            };
          } catch (diffError) {
            console.error(
              "Failed to calculate diff for invalid cloud data:",
              diffError,
            );
            // Return show-modal without diff if calculation fails
            const emptyDiff = {
              hasChanges: false,
              playlistDiffs: [],
              summary: {
                playlistsAdded: 0,
                playlistsRemoved: 0,
                playlistsModified: 0,
                playlistsReordered: 0,
                songsAdded: 0,
                songsRemoved: 0,
                songsReordered: 0,
              },
            };
            return {
              type: "show-modal",
              local: local || this.getEmptyUserData(),
              cloud,
              diff: emptyDiff,
            };
          }
        }
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
        console.warn(
          "Invalid data structure detected during conflict analysis",
        );
        // Malformed data - fallback to showing modal
        const diff = this.diffCalculator.calculateDiff(local, cloud);
        return { type: "show-modal", local, cloud, diff };
      }

      // Both datasets exist - perform intelligent comparison with error handling
      let analysis: ConflictAnalysis;
      try {
        analysis = this.performConflictAnalysis(local, cloud);
      } catch (analysisError) {
        console.error(
          "Conflict analysis failed, falling back to modal:",
          analysisError,
        );
        const diff = this.diffCalculator.calculateDiff(local, cloud);
        return { type: "show-modal", local, cloud, diff };
      }

      // Handle analysis results with fallback logic
      switch (analysis.conflictType) {
        case "identical": {
          if (!local || !cloud) {
            const diff = this.diffCalculator.calculateDiff(local, cloud);
            return { type: "show-modal", local, cloud, diff };
          }
          // Playlists are identical - use cloud playlist content
          // but preserve local playback state (device-specific settings)
          const mergedData: UserPlaylistData = {
            ...cloud,
            activePlaylistId: local.activePlaylistId,
            loopMode: local.loopMode,
            isShuffle: local.isShuffle,
          };

          // Note: We don't validate activePlaylistId against playlists array
          // because activePlaylistId can be a virtual playlist like "playlist-favorites"
          // that doesn't exist in the playlists array

          return { type: "auto-sync", data: mergedData };
        }

        case "empty-local":
          // Local data is empty/default - auto-sync cloud data
          return { type: "auto-sync", data: cloud };

        case "empty-cloud":
          // Cloud data is empty - sync local to cloud (no action needed here)
          return { type: "no-action" };

        case "different": {
          // Meaningful differences exist - show conflict modal
          const diff = this.diffCalculator.calculateDiff(local, cloud);
          return { type: "show-modal", local, cloud, diff };
        }

        default:
          console.warn(
            `Unknown conflict type: ${analysis.conflictType}, falling back to modal`,
          );
          // Fallback to showing modal for unknown cases
          {
            const diff = this.diffCalculator.calculateDiff(local, cloud);
            return { type: "show-modal", local, cloud, diff };
          }
      }
    } catch (error) {
      const duration = performance.now() - startTime;
      console.error(
        `Conflict analysis failed after ${duration.toFixed(2)}ms:`,
        error,
      );

      // Comprehensive fallback to showing modal when analysis fails
      const fallbackLocal = local || this.getEmptyUserData();
      const fallbackCloud = cloud || this.getEmptyUserData();
      const diff = this.diffCalculator.calculateDiff(
        fallbackLocal,
        fallbackCloud,
      );

      return {
        type: "show-modal",
        local: fallbackLocal,
        cloud: fallbackCloud,
        diff,
      };
    }
  }

  /**
   * Performs automatic sync when data is identical
   * @param cloudData - Cloud data to sync
   * @throws {Error} When cloud data is invalid or sync operation fails
   */
  public async performAutoSync(cloudData: UserPlaylistData): Promise<void> {
    const startTime = performance.now();

    try {
      // Validate the cloud data before syncing
      if (!this.isValidUserPlaylistData(cloudData)) {
        throw new Error(
          "Invalid cloud data structure - cannot perform auto-sync",
        );
      }

      // Additional validation for data integrity
      if (!this.validateDataIntegrity(cloudData)) {
        throw new Error(
          "Cloud data failed integrity checks - cannot perform auto-sync",
        );
      }

      // Simulate potential network or processing delays
      // In a real implementation, this would update the local state
      // The actual sync operation is handled by the caller
      // This method serves as a validation and logging point
    } catch (error) {
      const duration = performance.now() - startTime;
      console.error(`Auto-sync failed after ${duration.toFixed(2)}ms:`, error);

      // Re-throw with additional context for caller to handle fallback
      if (error instanceof Error) {
        throw new Error(`Auto-sync failed: ${error.message}`);
      }
      throw new Error("Auto-sync failed due to unknown error");
    }
  }

  /**
   * Performs detailed conflict analysis between local and cloud data
   * @param local - Local playlist data (can be null)
   * @param cloud - Cloud playlist data (can be null)
   * @returns ConflictAnalysis with detailed information
   * @throws {Error} When analysis encounters critical errors
   */
  private performConflictAnalysis(
    local: UserPlaylistData | null,
    cloud: UserPlaylistData | null,
  ): ConflictAnalysis {
    const startTime = performance.now();

    try {
      // Calculate metadata with error handling
      let metadata: ConflictAnalysis["metadata"];
      try {
        metadata = {
          localItemCount: this.countTotalItems(local),
          cloudItemCount: this.countTotalItems(cloud),
          localPlaylistCount: local?.playlists?.length || 0,
          cloudPlaylistCount: cloud?.playlists?.length || 0,
        };
      } catch (metadataError) {
        console.warn("Failed to calculate conflict metadata:", metadataError);
        // Fallback metadata
        metadata = {
          localItemCount: 0,
          cloudItemCount: 0,
          localPlaylistCount: 0,
          cloudPlaylistCount: 0,
        };
      }

      // Check if local data is empty or default with error handling
      let isLocalEmpty: boolean;
      let isCloudEmpty: boolean;

      try {
        isLocalEmpty = this.isEmptyOrDefaultData(local);
        isCloudEmpty = this.isEmptyOrDefaultData(cloud);
      } catch (emptyCheckError) {
        console.warn("Failed to check empty data status:", emptyCheckError);
        // Conservative fallback - assume data is not empty to trigger comparison
        isLocalEmpty = false;
        isCloudEmpty = false;
      }

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

      // Perform deep comparison for identical data with timeout handling
      let arePlaylistsIdentical: boolean;
      try {
        // Use playlist-only comparison to ignore local playback state differences
        arePlaylistsIdentical = this.dataComparator.arePlaylistsIdentical(
          local,
          cloud,
        );
      } catch (comparisonError) {
        const duration = performance.now() - startTime;
        console.error(
          `Data comparison failed during conflict analysis after ${duration.toFixed(2)}ms:`,
          comparisonError,
        );

        // If comparison times out or fails, treat as different to show modal
        return {
          hasConflict: true,
          conflictType: "different",
          recommendedAction: "show-modal",
          metadata,
        };
      }

      if (arePlaylistsIdentical) {
        return {
          hasConflict: false,
          conflictType: "identical",
          recommendedAction: "auto-sync",
          metadata,
        };
      }

      // Data sets are meaningfully different
      return {
        hasConflict: true,
        conflictType: "different",
        recommendedAction: "show-modal",
        metadata,
      };
    } catch (error) {
      const duration = performance.now() - startTime;
      console.error(
        `Conflict analysis failed after ${duration.toFixed(2)}ms:`,
        error,
      );
      throw new Error(
        `Conflict analysis failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Checks if the data is empty or represents default/initial state
   * @param data - UserPlaylistData to check (can be null)
   * @returns true if data is empty or default
   */
  private isEmptyOrDefaultData(data: UserPlaylistData | null): boolean {
    if (!data || !data.playlists || data.playlists.length === 0) {
      return true;
    }

    const totalItems = this.countTotalItems(data);
    if (totalItems === 0) {
      return true;
    }

    if (
      data.playlists.length <= MAX_PLAYLIST_COUNT &&
      data.playlists.every((playlist, index) =>
        isSequentialDefaultPlaylistName(playlist.name, index + 1),
      )
    ) {
      const [firstPlaylist, ...remaining] = data.playlists;
      const firstItemCount = firstPlaylist?.items?.length ?? 0;
      const remainingAreEmpty = remaining.every(
        (playlist) => (playlist.items?.length ?? 0) === 0,
      );

      if (firstItemCount <= 1 && remainingAreEmpty) {
        return true;
      }
    }

    return false;
  }

  /**
   * Counts total items across all playlists
   * @param data - UserPlaylistData to count (can be null)
   * @returns total number of items
   */
  private countTotalItems(data: UserPlaylistData | null): number {
    if (!data?.playlists) return 0;
    return data.playlists.reduce(
      (total, playlist) => total + (playlist?.items?.length || 0),
      0,
    );
  }

  /**
   * Validates UserPlaylistData structure
   * @param data - Data to validate (can be null)
   * @returns true if data is valid
   */
  private isValidUserPlaylistData(data: unknown): data is UserPlaylistData {
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
            Array.isArray(playlistObj.items)
          );
        })
      );
    } catch (error) {
      console.warn("UserPlaylistData validation failed:", error);
      return false;
    }
  }

  /**
   * Validates data integrity beyond basic structure
   * @param data - Data to validate
   * @returns true if data passes integrity checks
   */
  private validateDataIntegrity(data: UserPlaylistData): boolean {
    try {
      // Check for circular references or malformed data
      JSON.stringify(data);

      // Validate playlist IDs are unique
      const playlistIds = data.playlists.map((p) => p.id);
      const uniqueIds = new Set(playlistIds);
      if (playlistIds.length !== uniqueIds.size) {
        console.warn("Duplicate playlist IDs detected");
        return false;
      }

      // Validate active playlist ID exists
      // Skip validation for virtual playlists (e.g., FAVORITES_PLAYLIST_ID)
      // Virtual playlists don't exist in the playlists array
      if (
        data.activePlaylistId &&
        data.activePlaylistId !== FAVORITES_PLAYLIST_ID &&
        !playlistIds.includes(data.activePlaylistId)
      ) {
        console.warn("Active playlist ID does not exist in playlists");
        return false;
      }

      // Validate item IDs within each playlist are unique
      for (const playlist of data.playlists) {
        const itemIds = playlist.items.map((item) => item.id);
        const uniqueItemIds = new Set(itemIds);
        if (itemIds.length !== uniqueItemIds.size) {
          console.warn(
            `Duplicate item IDs detected in playlist ${playlist.id}`,
          );
          return false;
        }
      }

      return true;
    } catch (error) {
      console.warn("Data integrity validation failed:", error);
      return false;
    }
  }

  /**
   * Returns empty UserPlaylistData structure for fallback scenarios
   * @returns Empty UserPlaylistData
   */
  private getEmptyUserData(): UserPlaylistData {
    return {
      playlists: [],
      activePlaylistId: "",
      loopMode: "all",
      isShuffle: false,
    };
  }
}

// Export singleton instance for convenience
export const conflictResolver = new ConflictResolver();
