import { deriveFavoritesPlaylist } from "~/lib/player/favorites-playlist";
import { FAVORITES_PLAYLIST_ID } from "~/stores/player/constants";
import type { PlayerStoreSlice } from "../types";

export interface PinnedSongsSlice {
  pinnedVideoIds: Set<string>;
  pinnedOrder: string[];
  isPinnedSongsSynced: boolean;
  togglePinnedSong: (videoId: string) => void;
  isPinned: (videoId: string) => boolean;
  removePinnedSong: (videoId: string) => void;
  reorderPinnedSongs: (fromIndex: number, toIndex: number) => void;
  setPinnedSongs: (videoIds: Set<string>, order: string[]) => void;
  markPinnedSongsAsSynced: () => void;
}

export const createPinnedSongsSlice: PlayerStoreSlice<PinnedSongsSlice> = (
  set,
  get,
) => ({
  pinnedVideoIds: new Set<string>(),
  pinnedOrder: [],
  isPinnedSongsSynced: false,
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
    set((state) => {
      const nextState: Partial<typeof state> = {
        pinnedVideoIds: videoIds,
        pinnedOrder: order,
      };

      if (state.activePlaylistId !== FAVORITES_PLAYLIST_ID) {
        return nextState;
      }

      const favorites = deriveFavoritesPlaylist(order, state.playlists);
      const firstVideo = favorites.items[0];
      const isCurrentStillInFavorites = state.currentVideoId
        ? favorites.items.some((item) => item.id === state.currentVideoId)
        : false;

      if (!isCurrentStillInFavorites) {
        nextState.currentVideoId = firstVideo ? firstVideo.id : null;
        nextState.currentIndex = firstVideo ? 0 : null;
        // Avoid desync between UI and player instance.
        nextState.isPlaying = false;
      }

      return nextState;
    }),
  markPinnedSongsAsSynced: () =>
    set({
      isPinnedSongsSynced: true,
    }),
});
