import type { StateCreator } from "zustand";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { deriveFavoritesPlaylist } from "~/lib/player/favorites-playlist";
import { enforcePlaylistBounds } from "~/lib/player/playlist-helpers";
import { sanitizePlaylistIdentifiers } from "~/lib/player/playlist-ids";
import {
  parsePersistedShuffleQueue,
  rebuildShuffleQueues,
} from "~/lib/player/shuffle-queue";
import type { Playlist, PlaylistItem } from "~/lib/player/types";
import { MAX_PLAYLIST_COUNT } from "~/lib/playlist-limits";
import {
  defaultActivePlaylistId,
  defaultInitialVideoId,
  defaultPlaylists,
  FAVORITES_PLAYLIST_ID,
} from "~/stores/player/constants";
import { createPinnedSongsSlice } from "~/stores/player/slices/pinned-songs-slice";
import { createPlaybackSlice } from "~/stores/player/slices/playback-slice";
import { createPlaylistSlice } from "~/stores/player/slices/playlist-slice";
import { createSyncSlice } from "~/stores/player/slices/sync-slice";
import type { PlayerState } from "~/stores/player/types";

export { sanitizePlaylistIdentifiers } from "~/lib/player/playlist-ids";
export type { LoopMode } from "~/lib/player/types";
export { MAX_PLAYLIST_COUNT } from "~/lib/playlist-limits";

const createPlayerStore: StateCreator<PlayerState> = (set, get, store) => ({
  ...createPlaylistSlice(set, get, store),
  ...createPlaybackSlice(set, get, store),
  ...createSyncSlice(set, get, store),
  ...createPinnedSongsSlice(set, get, store),
});

export const usePlayerStore = create<PlayerState>()(
  persist(createPlayerStore, {
    name: "tube-loop-player-storage",
    storage: createJSONStorage(() => {
      if (typeof window === "undefined" || !window.localStorage) {
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
          clear: () => {},
          key: () => null,
          length: 0,
        } as Storage;
      }
      return window.localStorage;
    }),
    partialize: (state) => ({
      playlists: state.playlists,
      activePlaylistId: state.activePlaylistId,
      lastNonFavoritesPlaylistId: state.lastNonFavoritesPlaylistId,
      loopMode: state.loopMode,
      isShuffle: state.isShuffle,
      shuffleQueue: state.shuffleQueue,
      pinnedVideoIds: Array.from(state.pinnedVideoIds),
      pinnedOrder: state.pinnedOrder,
    }),
    merge: (persistedState, currentState) => {
      const state = (persistedState ?? {}) as Partial<PlayerState>;
      const { shuffleQueue: rawQueue, ...restState } = state;

      // Parse pinned state from persistence
      const pinnedVideoIds = Array.isArray(state.pinnedVideoIds)
        ? new Set(state.pinnedVideoIds)
        : new Set<string>();
      const pinnedOrder = Array.isArray(state.pinnedOrder)
        ? state.pinnedOrder
        : [];

      if (state?.playlists && state.playlists.length > 0) {
        const sanitized = sanitizePlaylistIdentifiers(
          state.playlists,
          state.activePlaylistId ?? "",
        );

        const constrained = enforcePlaylistBounds(
          sanitized.playlists,
          sanitized.activePlaylistId,
        );

        const rawLastNonFavoritesPlaylistId =
          typeof state.lastNonFavoritesPlaylistId === "string"
            ? state.lastNonFavoritesPlaylistId
            : "";
        const nextLastNonFavoritesPlaylistId =
          rawLastNonFavoritesPlaylistId &&
          constrained.playlists.some(
            (playlist) => playlist.id === rawLastNonFavoritesPlaylistId,
          )
            ? rawLastNonFavoritesPlaylistId
            : constrained.activePlaylistId &&
                constrained.activePlaylistId !== FAVORITES_PLAYLIST_ID
              ? constrained.activePlaylistId
              : (constrained.playlists[0]?.id ?? "");

        // Determine the active playlist and first video
        let activePlaylist: Playlist | undefined;
        let firstVideo: PlaylistItem | undefined;

        if (constrained.activePlaylistId === FAVORITES_PLAYLIST_ID) {
          // For Favorites, derive the virtual playlist from pinned songs
          const favoritesPlaylist = deriveFavoritesPlaylist(
            pinnedOrder,
            constrained.playlists,
          );
          activePlaylist = favoritesPlaylist;
          firstVideo = favoritesPlaylist.items[0];
        } else {
          // For regular playlists, find in the playlists array
          activePlaylist =
            constrained.playlists.find(
              (playlist) => playlist.id === constrained.activePlaylistId,
            ) || constrained.playlists[0];
          firstVideo = activePlaylist?.items[0];
        }

        const persistedQueue = parsePersistedShuffleQueue(rawQueue);
        const mergedShuffleQueue = rebuildShuffleQueues(
          persistedQueue,
          constrained.playlists,
          constrained.activePlaylistId,
          firstVideo ? firstVideo.id : null,
        );

        return {
          ...currentState,
          ...restState,
          playlists: constrained.playlists,
          activePlaylistId: constrained.activePlaylistId,
          lastNonFavoritesPlaylistId: nextLastNonFavoritesPlaylistId,
          currentVideoId: firstVideo ? firstVideo.id : null,
          currentIndex: firstVideo ? 0 : null,
          canCreatePlaylist: constrained.canCreatePlaylist,
          maxPlaylistCount: MAX_PLAYLIST_COUNT,
          shuffleQueue: mergedShuffleQueue,
          pinnedVideoIds,
          pinnedOrder,
        } satisfies PlayerState;
      }

      return {
        ...currentState,
        playlists: defaultPlaylists,
        activePlaylistId: defaultActivePlaylistId,
        lastNonFavoritesPlaylistId: defaultActivePlaylistId,
        currentVideoId: defaultInitialVideoId,
        currentIndex: 0,
        canCreatePlaylist: defaultPlaylists.length < MAX_PLAYLIST_COUNT,
        maxPlaylistCount: MAX_PLAYLIST_COUNT,
        shuffleQueue: {},
        pinnedVideoIds,
        pinnedOrder,
      } satisfies PlayerState;
    },
  }),
);
