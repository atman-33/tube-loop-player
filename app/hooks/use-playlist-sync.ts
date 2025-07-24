import { useEffect } from "react";
import { usePlayerStore } from "~/stores/player";
import { useAuth } from "./use-auth";

interface UserPlaylistData {
  playlists: Array<{
    id: string;
    name: string;
    items: Array<{
      id: string;
      title?: string;
    }>;
  }>;
  activePlaylistId: string;
  loopMode: "all" | "one";
  isShuffle: boolean;
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
  } = usePlayerStore();

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
          if (
            isValidUserData(userData) &&
            userData.playlists &&
            userData.playlists.length > 0
          ) {
            loadUserData(userData);
          } else {
            // No server data, sync current cookie data to server
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
  }, [user, isDataSynced, loadUserData, syncToServer]);

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

  return {
    isAuthenticated: !!user,
    isLoading: authLoading,
    isSynced: isDataSynced,
  };
}
