import { useEffect, useState } from "react";
import {
  type ConflictResolution,
  ConflictResolver,
} from "~/lib/conflict-resolver";
import {
  isValidUserPlaylistData,
  type UserPlaylistData,
} from "~/lib/data-normalizer";
import { usePlayerStore } from "~/stores/player";
import { FAVORITES_PLAYLIST_ID } from "~/stores/player/constants";
import { useAuth } from "./use-auth";

function isValidUserData(data: unknown): data is UserPlaylistData {
  return isValidUserPlaylistData(data);
}

export function usePlaylistSync() {
  const { user, isLoading: authLoading } = useAuth();
  const {
    setUser,
    loadUserData,
    syncToServer,
    isDataSynced,
    hasLocalChanges,
    localVersion,
    serverVersion,
    playlists,
    activePlaylistId,
    loopMode,
    isShuffle,
  } = usePlayerStore();

  const [hasFetchedCloudOnce, setHasFetchedCloudOnce] = useState(false);

  const [hasHydrated, setHasHydrated] = useState(() => {
    const hasHydratedFn = usePlayerStore.persist?.hasHydrated;
    return typeof hasHydratedFn === "function" ? hasHydratedFn() : true;
  });

  useEffect(() => {
    const persistApi = usePlayerStore.persist;
    if (!persistApi) {
      setHasHydrated(true);
      return;
    }

    const finishUnsubscribe = persistApi.onFinishHydration?.(() => {
      setHasHydrated(true);
    });
    const hydrateUnsubscribe = persistApi.onHydrate?.(() => {
      setHasHydrated(false);
    });

    if (persistApi.hasHydrated?.()) {
      setHasHydrated(true);
    }

    return () => {
      finishUnsubscribe?.();
      hydrateUnsubscribe?.();
    };
  }, []);

  // State for conflict resolution
  const [conflictData, setConflictData] = useState<{
    local: UserPlaylistData | null;
    cloud: UserPlaylistData | null;
    diff: import("~/lib/data-diff-calculator").DataDiff;
  } | null>(null);

  // Update user in store when auth state changes
  useEffect(() => {
    if (!authLoading) {
      setUser(user);
    }
  }, [user, authLoading, setUser]);

  useEffect(() => {
    setHasFetchedCloudOnce(false);
  }, [user]);

  // Load user data from server when user logs in with intelligent conflict resolution
  useEffect(() => {
    const loadServerData = async () => {
      if (!user || !hasHydrated) return;
      if (hasFetchedCloudOnce) return;
      if (hasLocalChanges) return;
      if (isDataSynced) return;

      const conflictResolver = new ConflictResolver();
      let response: Response | null = null;
      let userData: unknown = null;

      try {
        // Fetch cloud data with timeout and error handling
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        try {
          response = await fetch("/api/playlists/load", {
            signal: controller.signal,
          });
          clearTimeout(timeoutId);
        } catch (fetchError) {
          clearTimeout(timeoutId);
          if (fetchError instanceof Error && fetchError.name === "AbortError") {
            throw new Error("Request timeout while loading cloud data");
          }
          throw fetchError;
        }

        if (!response.ok) {
          throw new Error(
            `Server responded with status ${response.status}: ${response.statusText}`,
          );
        }

        try {
          userData = await response.json();
          // biome-ignore lint/correctness/noUnusedVariables: <>
        } catch (parseError) {
          throw new Error("Failed to parse cloud data response");
        }

        // Prepare local data
        const localData: UserPlaylistData = {
          playlists,
          activePlaylistId,
          loopMode,
          isShuffle,
        };

        const cloudServerVersionRaw =
          userData && typeof userData === "object"
            ? (userData as { serverVersion?: unknown }).serverVersion
            : undefined;

        const cloudServerVersion: number | null =
          typeof cloudServerVersionRaw === "number"
            ? cloudServerVersionRaw
            : null;

        // Validate cloud data
        const validCloudData = isValidUserData(userData)
          ? (userData as UserPlaylistData & { serverVersion?: number | null })
          : null;

        // If local activePlaylistId is Favorites, preserve it
        // Favorites is a virtual playlist not stored in DB, so cloud data won't have it
        if (activePlaylistId === FAVORITES_PLAYLIST_ID && validCloudData) {
          validCloudData.activePlaylistId = FAVORITES_PLAYLIST_ID;
        }

        // Use intelligent conflict resolution
        let conflictResolution: ConflictResolution;
        try {
          conflictResolution = conflictResolver.analyzeConflict(
            localData,
            validCloudData,
          );
        } catch (analysisError) {
          console.error("Conflict analysis failed:", analysisError);
          // Fallback to showing modal when analysis fails
          if (validCloudData) {
            const { DiffCalculator } = await import(
              "~/lib/data-diff-calculator"
            );
            const diffCalculator = new DiffCalculator();
            const diff = diffCalculator.calculateDiff(
              localData,
              validCloudData,
            );
            setConflictData({
              local: localData,
              cloud: validCloudData,
              diff,
            });
            setHasFetchedCloudOnce(true);
          } else {
            // No valid cloud data, sync local data
            await syncToServer();
            setHasFetchedCloudOnce(true);
          }
          return;
        }

        const effectiveLocalVersion: number | null =
          typeof localVersion === "number" ? localVersion : null;
        if (
          conflictResolution.type === "show-modal" &&
          cloudServerVersion !== null &&
          effectiveLocalVersion !== null &&
          cloudServerVersion <= effectiveLocalVersion
        ) {
          conflictResolution = { type: "no-action" };
        }

        // Handle conflict resolution result
        switch (conflictResolution.type) {
          case "auto-sync":
            try {
              // Perform automatic sync
              await conflictResolver.performAutoSync(conflictResolution.data);
              console.log("Automatically syncing identical cloud data");
              loadUserData({
                ...conflictResolution.data,
                serverVersion:
                  cloudServerVersion !== null
                    ? cloudServerVersion
                    : (serverVersion ?? Date.now()),
              });
              setHasFetchedCloudOnce(true);
            } catch (autoSyncError) {
              console.error(
                "Auto-sync failed, falling back to conflict modal:",
                autoSyncError,
              );
              // Fallback to showing modal when auto-sync fails
              const { DiffCalculator } = await import(
                "~/lib/data-diff-calculator"
              );
              const diffCalculator = new DiffCalculator();
              const diff = diffCalculator.calculateDiff(
                localData,
                conflictResolution.data,
              );
              setConflictData({
                local: localData,
                cloud: conflictResolution.data,
                diff,
              });
              setHasFetchedCloudOnce(true);
            }
            break;

          case "show-modal":
            // Show conflict resolution modal
            setConflictData({
              local: conflictResolution.local,
              cloud: conflictResolution.cloud,
              diff: conflictResolution.diff,
            });
            setHasFetchedCloudOnce(true);
            break;

          case "no-action":
            // Sync local data to server (local data takes precedence)
            try {
              await syncToServer();
              setHasFetchedCloudOnce(true);
            } catch (syncError) {
              console.error("Failed to sync local data to server:", syncError);
              // Continue without showing error to user
            }
            break;

          default:
            console.warn(
              "Unknown conflict resolution type, falling back to modal",
            );
            if (validCloudData) {
              const { DiffCalculator } = await import(
                "~/lib/data-diff-calculator"
              );
              const diffCalculator = new DiffCalculator();
              const diff = diffCalculator.calculateDiff(
                localData,
                validCloudData,
              );
              setConflictData({
                local: localData,
                cloud: validCloudData,
                diff,
              });
              setHasFetchedCloudOnce(true);
            } else {
              await syncToServer();
              setHasFetchedCloudOnce(true);
            }
            break;
        }
      } catch (error) {
        console.error("Failed to load user data:", error);

        // Comprehensive error handling with different fallback strategies
        if (error instanceof Error) {
          if (error.message.includes("timeout")) {
            console.warn("Cloud data loading timed out, using local data");
          } else if (
            error.message.includes("network") ||
            error.message.includes("fetch")
          ) {
            console.warn(
              "Network error while loading cloud data, using local data",
            );
          } else {
            console.warn(
              "Unknown error while loading cloud data:",
              error.message,
            );
          }
        }

        // Fallback: sync current local data to server
        try {
          await syncToServer();
        } catch (fallbackError) {
          console.error("Fallback sync to server also failed:", fallbackError);
          // At this point, we continue with local data only
          // The user will see their local data and can manually sync later
        }
      }
    };

    loadServerData();
  }, [
    user,
    isDataSynced,
    loadUserData,
    syncToServer,
    playlists,
    activePlaylistId,
    loopMode,
    isShuffle,
    hasHydrated,
    hasFetchedCloudOnce,
    hasLocalChanges,
    localVersion,
    serverVersion,
  ]);

  // Auto-sync changes to server for authenticated users
  useEffect(() => {
    if (user && !isDataSynced && hasHydrated) {
      const timeoutId = setTimeout(() => {
        syncToServer();
      }, 1000); // Debounce sync by 1 second

      return () => clearTimeout(timeoutId);
    }
  }, [
    user,
    isDataSynced,
    playlists,
    activePlaylistId,
    loopMode,
    isShuffle,
    syncToServer,
    hasHydrated,
  ]);

  // Enhanced conflict resolution functions with error handling
  const resolveConflict = async (
    selectedData: UserPlaylistData | null,
    source: "local" | "cloud",
  ) => {
    const startTime = performance.now();

    try {
      // Validate selected data before proceeding
      if (!selectedData || !isValidUserData(selectedData)) {
        throw new Error(
          `Invalid ${source} data structure selected for conflict resolution`,
        );
      }

      console.log(`Resolving conflict with ${source} data`);

      // Load the selected data with error handling
      try {
        loadUserData(selectedData);
      } catch (loadError) {
        throw new Error(
          `Failed to load ${source} data: ${loadError instanceof Error ? loadError.message : "Unknown error"}`,
        );
      }

      // Sync the selected data to server to ensure consistency
      try {
        await syncToServer();
        console.log(`Successfully synced ${source} data to server`);
      } catch (syncError) {
        console.error(`Failed to sync ${source} data to server:`, syncError);
        // Don't throw here - the local data is already loaded
        // The user can try syncing again later
      }

      // Clear conflict state
      setConflictData(null);

      const duration = performance.now() - startTime;
      console.log(
        `Conflict resolved with ${source} data in ${duration.toFixed(2)}ms`,
      );
    } catch (error) {
      const duration = performance.now() - startTime;
      console.error(
        `Failed to resolve conflict after ${duration.toFixed(2)}ms:`,
        error,
      );

      // Show user-friendly error handling
      // In a real app, you might want to show a toast notification
      alert(
        `Failed to resolve conflict: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  };

  const cancelConflictResolution = () => {
    try {
      console.log("Cancelling conflict resolution, keeping local data");

      // Keep current local data and attempt to sync to server
      syncToServer().catch((syncError) => {
        console.error(
          "Failed to sync local data after cancelling conflict resolution:",
          syncError,
        );
        // Continue anyway - user can manually sync later
      });

      // Clear conflict state
      setConflictData(null);
    } catch (error) {
      console.error("Error during conflict resolution cancellation:", error);
      // Clear conflict state anyway to prevent UI from being stuck
      setConflictData(null);
    }
  };

  return {
    isAuthenticated: !!user,
    isLoading: authLoading,
    isSynced: isDataSynced,
    conflictData,
    resolveConflict,
    cancelConflictResolution,
  };
}
