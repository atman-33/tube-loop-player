import type { UserPlaylistData } from "~/lib/data-normalizer";
import { deriveFavoritesPlaylist } from "~/lib/player/favorites-playlist";
import { enforcePlaylistBounds } from "~/lib/player/playlist-helpers";
import { sanitizePlaylistIdentifiers } from "~/lib/player/playlist-ids";
import { rebuildShuffleQueues } from "~/lib/player/shuffle-queue";
import { FAVORITES_PLAYLIST_ID } from "~/stores/player/constants";
import type { PlayerStoreSlice, SyncSlice } from "../types";

export const createSyncSlice: PlayerStoreSlice<SyncSlice> = (set, get) => ({
  user: null,
  isDataSynced: false,
  setUser: (user) => {
    set((state) => {
      if (!user) {
        return { user: null, isDataSynced: false, isPinnedSongsSynced: false };
      }

      const sanitized = sanitizePlaylistIdentifiers(
        state.playlists,
        state.activePlaylistId,
        user.id,
      );
      const constrained = enforcePlaylistBounds(
        sanitized.playlists,
        sanitized.activePlaylistId,
      );

      const nextState: Partial<SyncSlice> & Partial<typeof state> = {
        user,
        isDataSynced: false,
        isPinnedSongsSynced: false,
      };

      const didChange =
        sanitized.didChange ||
        constrained.playlists.length !== state.playlists.length ||
        constrained.activePlaylistId !== state.activePlaylistId ||
        constrained.canCreatePlaylist !== state.canCreatePlaylist;

      if (didChange) {
        nextState.playlists = constrained.playlists;
        nextState.activePlaylistId = constrained.activePlaylistId;
        nextState.canCreatePlaylist = constrained.canCreatePlaylist;
        if (state.isShuffle) {
          nextState.shuffleQueue = rebuildShuffleQueues(
            state.shuffleQueue,
            constrained.playlists,
            constrained.activePlaylistId,
            state.currentVideoId,
          );
        }
      } else {
        // Even if nothing changed, preserve the current activePlaylistId
        // This is important for special playlists like Favorites
        nextState.activePlaylistId = state.activePlaylistId;
      }

      return nextState;
    });
  },
  loadUserData: (userData) => {
    const currentUserId = get().user?.id;
    const sanitized = sanitizePlaylistIdentifiers(
      userData.playlists,
      userData.activePlaylistId,
      currentUserId,
    );

    const constrained = enforcePlaylistBounds(
      sanitized.playlists,
      sanitized.activePlaylistId,
    );

    const { pinnedOrder } = get();

    const activePlaylist =
      constrained.activePlaylistId === FAVORITES_PLAYLIST_ID
        ? deriveFavoritesPlaylist(pinnedOrder, constrained.playlists)
        : constrained.playlists.find(
            (playlist) => playlist.id === constrained.activePlaylistId,
          ) || constrained.playlists[0];
    const firstVideo = activePlaylist?.items[0];
    const initialShuffleQueue = userData.isShuffle
      ? rebuildShuffleQueues(
          {},
          constrained.playlists,
          constrained.activePlaylistId,
          firstVideo ? firstVideo.id : null,
        )
      : {};

    set({
      playlists: constrained.playlists,
      activePlaylistId: constrained.activePlaylistId,
      loopMode: userData.loopMode,
      isShuffle: userData.isShuffle,
      currentVideoId: firstVideo ? firstVideo.id : null,
      currentIndex: firstVideo ? 0 : null,
      isDataSynced: true,
      canCreatePlaylist: constrained.canCreatePlaylist,
      shuffleQueue: initialShuffleQueue,
    });
  },
  syncToServer: async () => {
    const {
      user,
      playlists,
      activePlaylistId,
      loopMode,
      isShuffle,
      canCreatePlaylist,
    } = get();
    if (!user) {
      return;
    }

    const sanitized = sanitizePlaylistIdentifiers(
      playlists,
      activePlaylistId,
      user.id,
    );

    const constrained = enforcePlaylistBounds(
      sanitized.playlists,
      sanitized.activePlaylistId,
    );

    if (
      sanitized.didChange ||
      constrained.playlists.length !== playlists.length ||
      constrained.activePlaylistId !== activePlaylistId ||
      constrained.canCreatePlaylist !== canCreatePlaylist
    ) {
      set((state) => {
        const didChangeActive =
          state.activePlaylistId !== constrained.activePlaylistId;
        return {
          playlists: constrained.playlists,
          activePlaylistId: constrained.activePlaylistId,
          canCreatePlaylist: constrained.canCreatePlaylist,
          currentVideoId: didChangeActive ? null : state.currentVideoId,
          currentIndex: didChangeActive ? null : state.currentIndex,
          isPlaying: didChangeActive ? false : state.isPlaying,
        };
      });
    }

    try {
      const response = await fetch("/api/playlists/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          playlists: constrained.playlists,
          activePlaylistId: constrained.activePlaylistId,
          loopMode,
          isShuffle,
        }),
      });

      if (response.ok) {
        const result = (await response.json()) as {
          success?: boolean;
          data?: UserPlaylistData;
        };
        if (result.success && result.data) {
          set((state) => {
            const serverData = result.data;
            if (!serverData) return state;

            const nextShuffleQueue = serverData.isShuffle
              ? rebuildShuffleQueues(
                  state.shuffleQueue,
                  serverData.playlists,
                  serverData.activePlaylistId,
                  state.currentVideoId,
                )
              : {};

            return {
              playlists: serverData.playlists,
              activePlaylistId: serverData.activePlaylistId,
              loopMode: serverData.loopMode,
              isShuffle: serverData.isShuffle,
              shuffleQueue: nextShuffleQueue,
              isDataSynced: true,
            };
          });
        } else {
          set({ isDataSynced: true });
        }
      }
    } catch (error) {
      console.error("Failed to sync to server:", error);
    }
  },
  markAsSynced: () => {
    set({ isDataSynced: true });
  },
});
