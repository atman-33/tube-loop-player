import type { PlayerStoreSlice } from "../types";

export interface PinnedSongsSlice {
  pinnedVideoIds: Set<string>;
  pinnedOrder: string[];
  togglePinnedSong: (videoId: string) => void;
  isPinned: (videoId: string) => boolean;
  removePinnedSong: (videoId: string) => void;
  reorderPinnedSongs: (fromIndex: number, toIndex: number) => void;
  setPinnedSongs: (videoIds: Set<string>, order: string[]) => void;
}

export const createPinnedSongsSlice: PlayerStoreSlice<PinnedSongsSlice> = (
  set,
  get,
) => ({
  pinnedVideoIds: new Set<string>(),
  pinnedOrder: [],
  togglePinnedSong: (videoId) =>
    set((state) => {
      const newPinnedVideoIds = new Set(state.pinnedVideoIds);
      const newPinnedOrder = [...state.pinnedOrder];

      if (newPinnedVideoIds.has(videoId)) {
        // Unpin the song
        newPinnedVideoIds.delete(videoId);
        const index = newPinnedOrder.indexOf(videoId);
        if (index > -1) {
          newPinnedOrder.splice(index, 1);
        }
      } else {
        // Pin the song
        newPinnedVideoIds.add(videoId);
        newPinnedOrder.push(videoId);
      }

      return {
        pinnedVideoIds: newPinnedVideoIds,
        pinnedOrder: newPinnedOrder,
      };
    }),
  isPinned: (videoId) => {
    const state = get();
    return state.pinnedVideoIds.has(videoId);
  },
  removePinnedSong: (videoId) =>
    set((state) => {
      const newPinnedVideoIds = new Set(state.pinnedVideoIds);
      const newPinnedOrder = [...state.pinnedOrder];

      newPinnedVideoIds.delete(videoId);
      const index = newPinnedOrder.indexOf(videoId);
      if (index > -1) {
        newPinnedOrder.splice(index, 1);
      }

      return {
        pinnedVideoIds: newPinnedVideoIds,
        pinnedOrder: newPinnedOrder,
      };
    }),
  reorderPinnedSongs: (fromIndex, toIndex) =>
    set((state) => {
      const newPinnedOrder = [...state.pinnedOrder];

      // Validate indices are within bounds
      if (
        fromIndex < 0 ||
        fromIndex >= newPinnedOrder.length ||
        toIndex < 0 ||
        toIndex >= newPinnedOrder.length
      ) {
        return state;
      }

      const [removed] = newPinnedOrder.splice(fromIndex, 1);
      newPinnedOrder.splice(toIndex, 0, removed);

      return {
        pinnedOrder: newPinnedOrder,
      };
    }),
  setPinnedSongs: (videoIds, order) =>
    set({
      pinnedVideoIds: videoIds,
      pinnedOrder: order,
    }),
});
