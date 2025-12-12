import { useEffect, useRef, useState } from "react";
import { usePlayerStore } from "~/stores/player";
import { useAuth } from "./use-auth";

interface PinnedSongsData {
  pinnedVideoIds: string[];
  pinnedOrder: string[];
}

/**
 * Hook to sync pinned songs with cloud storage for authenticated users
 */
export function usePinnedSongsSync() {
  const { user, isLoading: authLoading } = useAuth();
  const { pinnedVideoIds, pinnedOrder, setPinnedSongs } = usePlayerStore();
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoadedFromServer, setHasLoadedFromServer] = useState(false);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSyncedDataRef = useRef<string>("");

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

  // Load pinned songs from server when user logs in (only once)
  useEffect(() => {
    const loadServerData = async () => {
      if (!user || !hasHydrated || authLoading || hasLoadedFromServer) return;

      setIsLoading(true);

      try {
        const response = await fetch("/api/pinned-songs/load");

        if (!response.ok) {
          console.error("Failed to load pinned songs:", response.statusText);
          setHasLoadedFromServer(true);
          return;
        }

        const data = (await response.json()) as PinnedSongsData;

        // Get current local state at the time of loading
        const currentPinnedIds = usePlayerStore.getState().pinnedVideoIds;

        // Merge cloud data with local data (union of both)
        const mergedVideoIds = new Set([
          ...Array.from(currentPinnedIds),
          ...data.pinnedVideoIds,
        ]);

        // Use cloud order as base, then append any local-only pins
        const mergedOrder = [
          ...data.pinnedOrder.filter((id) => mergedVideoIds.has(id)),
          ...Array.from(currentPinnedIds).filter(
            (id) => !data.pinnedOrder.includes(id),
          ),
        ];

        setPinnedSongs(mergedVideoIds, mergedOrder);

        // Save merged data reference
        lastSyncedDataRef.current = JSON.stringify({
          pinnedVideoIds: Array.from(mergedVideoIds),
          pinnedOrder: mergedOrder,
        });

        setHasLoadedFromServer(true);
      } catch (error) {
        console.error("Failed to load pinned songs:", error);
        setHasLoadedFromServer(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadServerData();
  }, [user, hasHydrated, authLoading, hasLoadedFromServer, setPinnedSongs]);

  // Debounced sync to server when local state changes
  useEffect(() => {
    if (!user || !hasHydrated || isLoading) return;

    const currentData = JSON.stringify({
      pinnedVideoIds: Array.from(pinnedVideoIds),
      pinnedOrder,
    });

    // Skip sync if data hasn't changed
    if (currentData === lastSyncedDataRef.current) return;

    // Clear existing timeout
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    // Debounce sync by 1 second
    syncTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch("/api/pinned-songs/sync", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            pinnedVideoIds: Array.from(pinnedVideoIds),
            pinnedOrder,
          }),
        });

        if (!response.ok) {
          console.error("Failed to sync pinned songs:", response.statusText);
          return;
        }

        // Update last synced data reference
        lastSyncedDataRef.current = currentData;
      } catch (error) {
        console.error("Failed to sync pinned songs:", error);
      }
    }, 1000);

    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [user, hasHydrated, isLoading, pinnedVideoIds, pinnedOrder]);

  return { isLoading };
}
