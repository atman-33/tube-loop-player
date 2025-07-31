import { useEffect, useState } from "react";
import { calculateDataHash, type UserPlaylistData } from "~/lib/data-hash";
import { usePlayerStore } from "~/stores/player";
import { useAuth } from "./use-auth";

interface ServerResponse extends UserPlaylistData {
  dataHash: string;
}

function isValidUserData(data: unknown): data is UserPlaylistData {
  if (!data || typeof data !== "object") return false;

  const obj = data as Record<string, unknown>;

  return (
    Array.isArray(obj.playlists) &&
    typeof obj.activePlaylistId === "string" &&
    (obj.loopMode === "all" || obj.loopMode === "one") &&
    typeof obj.isShuffle === "boolean"
  );
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
    lastSyncedHash,
    getCurrentDataHash,
    markAsSynced,
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
          const serverResponse: ServerResponse = await response.json();
          const { dataHash: serverHash, ...userData } = serverResponse;

          // Calculate current local data hash
          const localData: UserPlaylistData = {
            playlists,
            activePlaylistId,
            loopMode,
            isShuffle,
          };
          const localHash = calculateDataHash(localData);

          // Check if data is identical by hash comparison
          if (localHash === serverHash) {
            // Data is identical - mark as synced without conflict
            markAsSynced();
            return;
          }

          // Data is different - check if we have meaningful data on both sides
          const hasServerData =
            isValidUserData(userData) &&
            userData.playlists &&
            userData.playlists.length > 0;

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
            // Both sides have meaningful data and they're different - show conflict resolution
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
            markAsSynced();
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
    markAsSynced,
    playlists,
    activePlaylistId,
    loopMode,
    isShuffle,
  ]);

  // Auto-sync changes to server for authenticated users
  // biome-ignore lint/correctness/useExhaustiveDependencies: <>
  useEffect(() => {
    if (user && isDataSynced) {
      // Check if data has actually changed by comparing with last synced hash
      const currentHash = getCurrentDataHash();
      if (lastSyncedHash && currentHash === lastSyncedHash) {
        // Data hasn't changed, no need to sync
        return;
      }

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
    lastSyncedHash,
    getCurrentDataHash,
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
