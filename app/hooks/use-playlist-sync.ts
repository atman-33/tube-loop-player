import { useEffect, useState } from "react";
import { DataNormalizer, type UserPlaylistData } from "~/lib/data-normalizer";
import { usePlayerStore } from "~/stores/player";
import { useAuth } from "./use-auth";

function isValidUserData(data: unknown): data is UserPlaylistData {
  return DataNormalizer.isValidUserPlaylistData(data);
}

export function usePlaylistSync() {
  const { user, isLoading: authLoading } = useAuth();
  const {
    setUser,
    loadUserData,
    syncToServer,
    isDataSynced,
    playlists,
    activePlaylistId,
    loopMode,
    isShuffle,
  } = usePlayerStore();

  // State for conflict resolution
  const [conflictData, setConflictData] = useState<{
    local: UserPlaylistData;
    cloud: UserPlaylistData;
  } | null>(null);

  // Update user in store when auth state changes
  useEffect(() => {
    if (!authLoading) {
      setUser(user);
    }
  }, [user, authLoading, setUser]);

  // Load user data from server when user logs in
  useEffect(() => {
    const loadServerData = async () => {
      if (!user || isDataSynced) return;

      try {
        const response = await fetch("/api/playlists/load");
        if (response.ok) {
          const userData = await response.json();

          // Check if server has data
          const hasServerData =
            isValidUserData(userData) &&
            userData.playlists &&
            userData.playlists.length > 0;

          // Check if local data exists and is not default
          const localData: UserPlaylistData = {
            playlists,
            activePlaylistId,
            loopMode,
            isShuffle,
          };

          const hasLocalData =
            playlists.length > 0 &&
            !(
              playlists.length === 3 &&
              playlists[0].name === "Playlist 1" &&
              playlists[1].name === "Playlist 2" &&
              playlists[2].name === "Playlist 3" &&
              playlists[0].items.length === 1 &&
              playlists[1].items.length === 0 &&
              playlists[2].items.length === 0
            );

          if (hasServerData && hasLocalData) {
            // Data conflict detected - show resolution modal
            setConflictData({
              local: localData,
              cloud: userData,
            });
          } else if (hasServerData) {
            // Only server data exists - load it
            loadUserData(userData);
          } else if (hasLocalData) {
            // Only local data exists - sync to server
            await syncToServer();
          } else {
            // No meaningful data on either side - mark as synced
            await syncToServer();
          }
        }
      } catch (error) {
        console.error("Failed to load user data:", error);
        // Fallback: sync current data to server
        await syncToServer();
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
  ]);

  // Auto-sync changes to server for authenticated users
  // biome-ignore lint/correctness/useExhaustiveDependencies: <>
  useEffect(() => {
    if (user && isDataSynced) {
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
  ]);

  // Conflict resolution functions
  const resolveConflict = async (
    selectedData: UserPlaylistData,
    _source: "local" | "cloud",
  ) => {
    try {
      // Load the selected data
      loadUserData(selectedData);

      // Sync the selected data to server to ensure consistency
      await syncToServer();

      // Clear conflict state
      setConflictData(null);
    } catch (error) {
      console.error("Failed to resolve conflict:", error);
    }
  };

  const cancelConflictResolution = () => {
    // Keep current local data and sync to server
    syncToServer();
    setConflictData(null);
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
