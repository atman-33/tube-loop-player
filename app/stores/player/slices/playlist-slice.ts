import {
  deriveFavoritesPlaylist,
  injectFavoritesPlaylist,
} from "~/lib/player/favorites-playlist";
import {
  clonePlaylistItems,
  deriveDuplicatePlaylistName,
  deriveNextPlaylistName,
  enforcePlaylistBounds,
} from "~/lib/player/playlist-helpers";
import { generatePlaylistId } from "~/lib/player/playlist-ids";
import {
  rebuildShuffleQueues,
  removeQueueForPlaylist,
  resetQueueForPlaylist,
} from "~/lib/player/shuffle-queue";
import type { Playlist } from "~/lib/player/types";
import { MAX_PLAYLIST_COUNT } from "~/lib/playlist-limits";
import { defaultActivePlaylistId, defaultPlaylists } from "../constants";
import type { PlayerStoreSlice, PlaylistSlice } from "../types";

export const createPlaylistSlice: PlayerStoreSlice<PlaylistSlice> = (
  set,
  get,
) => ({
  playlists: defaultPlaylists,
  maxPlaylistCount: MAX_PLAYLIST_COUNT,
  canCreatePlaylist: defaultPlaylists.length < MAX_PLAYLIST_COUNT,
  activePlaylistId: defaultActivePlaylistId,
  addToPlaylist: (item, playlistId) => {
    const state = get();
    const targetPlaylistId = playlistId || state.activePlaylistId;
    const targetPlaylist = state.playlists.find(
      (playlist) => playlist.id === targetPlaylistId,
    );

    if (
      targetPlaylist?.items.some((existingItem) => existingItem.id === item.id)
    ) {
      return false;
    }

    set((currentState) => {
      const updatedPlaylists = currentState.playlists.map((playlist) =>
        playlist.id === targetPlaylistId
          ? { ...playlist, items: [...playlist.items, item] }
          : playlist,
      );
      const shouldResetShuffle =
        currentState.isShuffle &&
        targetPlaylistId === currentState.activePlaylistId;
      const nextShuffleQueue = shouldResetShuffle
        ? resetQueueForPlaylist(currentState.shuffleQueue, targetPlaylistId)
        : currentState.shuffleQueue;
      return {
        playlists: updatedPlaylists,
        currentIndex:
          currentState.currentIndex === null ? 0 : currentState.currentIndex,
        shuffleQueue: nextShuffleQueue,
      };
    });

    return true;
  },
  removeFromPlaylist: (index, playlistId) =>
    set((state) => {
      const targetPlaylistId = playlistId || state.activePlaylistId;
      const updatedPlaylists = state.playlists.map((playlist) => {
        if (playlist.id === targetPlaylistId) {
          const newItems = [...playlist.items];
          newItems.splice(index, 1);
          return { ...playlist, items: newItems };
        }
        return playlist;
      });
      const shouldResetShuffle =
        state.isShuffle && targetPlaylistId === state.activePlaylistId;
      const nextShuffleQueue = shouldResetShuffle
        ? resetQueueForPlaylist(state.shuffleQueue, targetPlaylistId)
        : state.shuffleQueue;
      return {
        playlists: updatedPlaylists,
        shuffleQueue: nextShuffleQueue,
      };
    }),
  reorderPlaylist: (fromIndex, toIndex, playlistId) =>
    set((state) => {
      const targetPlaylistId = playlistId || state.activePlaylistId;
      const updatedPlaylists = state.playlists.map((playlist) => {
        if (playlist.id === targetPlaylistId) {
          const newItems = [...playlist.items];
          const [removed] = newItems.splice(fromIndex, 1);
          newItems.splice(toIndex, 0, removed);
          return { ...playlist, items: newItems };
        }
        return playlist;
      });

      let newCurrentIndex: number | null = state.currentIndex;
      if (
        targetPlaylistId === state.activePlaylistId &&
        newCurrentIndex !== null
      ) {
        if (newCurrentIndex === fromIndex) {
          newCurrentIndex = toIndex;
        } else if (fromIndex < newCurrentIndex && toIndex >= newCurrentIndex) {
          newCurrentIndex -= 1;
        } else if (fromIndex > newCurrentIndex && toIndex <= newCurrentIndex) {
          newCurrentIndex += 1;
        }
      }

      const shouldResetShuffle =
        state.isShuffle && targetPlaylistId === state.activePlaylistId;
      const nextShuffleQueue = shouldResetShuffle
        ? resetQueueForPlaylist(state.shuffleQueue, targetPlaylistId)
        : state.shuffleQueue;

      return {
        playlists: updatedPlaylists,
        currentIndex: newCurrentIndex,
        shuffleQueue: nextShuffleQueue,
      };
    }),
  reorderPlaylists: (fromIndex, toIndex) =>
    set((state) => {
      const newPlaylists = [...state.playlists];
      const [removed] = newPlaylists.splice(fromIndex, 1);
      newPlaylists.splice(toIndex, 0, removed);

      return {
        playlists: newPlaylists,
        activePlaylistId: state.activePlaylistId,
      };
    }),
  moveItemBetweenPlaylists: (itemIndex, fromPlaylistId, toPlaylistId) => {
    const state = get();
    const fromPlaylist = state.playlists.find(
      (playlist) => playlist.id === fromPlaylistId,
    );
    const toPlaylist = state.playlists.find(
      (playlist) => playlist.id === toPlaylistId,
    );

    if (
      !fromPlaylist ||
      itemIndex >= fromPlaylist.items.length ||
      !toPlaylist
    ) {
      return false;
    }

    const itemToMove = fromPlaylist.items[itemIndex];
    if (
      toPlaylist.items.some((existingItem) => existingItem.id === itemToMove.id)
    ) {
      return false;
    }

    set((currentState) => {
      const updatedPlaylists = currentState.playlists.map((playlist) => {
        if (playlist.id === fromPlaylistId) {
          const newItems = [...playlist.items];
          newItems.splice(itemIndex, 1);
          return { ...playlist, items: newItems };
        }
        if (playlist.id === toPlaylistId) {
          return { ...playlist, items: [...playlist.items, itemToMove] };
        }
        return playlist;
      });

      let nextShuffleQueue = currentState.shuffleQueue;
      if (currentState.isShuffle) {
        if (fromPlaylistId === currentState.activePlaylistId) {
          nextShuffleQueue = resetQueueForPlaylist(
            nextShuffleQueue,
            fromPlaylistId,
          );
        }
        if (toPlaylistId === currentState.activePlaylistId) {
          nextShuffleQueue = resetQueueForPlaylist(
            nextShuffleQueue,
            toPlaylistId,
          );
        }
      }

      return {
        playlists: updatedPlaylists,
        shuffleQueue: nextShuffleQueue,
      };
    });

    return true;
  },
  clearPlaylist: (playlistId) =>
    set((state) => {
      const targetPlaylistId = playlistId || state.activePlaylistId;
      const updatedPlaylists = state.playlists.map((playlist) =>
        playlist.id === targetPlaylistId
          ? { ...playlist, items: [] }
          : playlist,
      );

      const resetState =
        targetPlaylistId === state.activePlaylistId
          ? { currentIndex: null, currentVideoId: null }
          : {};

      const shouldResetShuffle =
        state.isShuffle && targetPlaylistId === state.activePlaylistId;
      const nextShuffleQueue = shouldResetShuffle
        ? resetQueueForPlaylist(state.shuffleQueue, targetPlaylistId)
        : state.shuffleQueue;

      return {
        playlists: updatedPlaylists,
        shuffleQueue: nextShuffleQueue,
        ...resetState,
      };
    }),
  nextPlaylistName: () => {
    const { playlists } = get();
    return deriveNextPlaylistName(playlists);
  },
  createPlaylist: () => {
    if (!get().canCreatePlaylist) {
      return null;
    }

    const state = get();
    const playlistId = generatePlaylistId(state.user?.id);
    const playlistName = state.nextPlaylistName();
    const newPlaylist: Playlist = {
      id: playlistId,
      name: playlistName,
      items: [],
    };

    set((currentState) => {
      const updatedPlaylists = [...currentState.playlists, newPlaylist];
      const constrained = enforcePlaylistBounds(updatedPlaylists, playlistId);
      const nextShuffleQueue = currentState.isShuffle
        ? resetQueueForPlaylist(currentState.shuffleQueue, playlistId)
        : currentState.shuffleQueue;

      return {
        ...constrained,
        activePlaylistId: playlistId,
        currentVideoId: null,
        currentIndex: null,
        isPlaying: false,
        shuffleQueue: nextShuffleQueue,
      };
    });

    return playlistId;
  },
  duplicatePlaylist: (playlistId) => {
    const state = get();
    if (!state.canCreatePlaylist) {
      return null;
    }

    const sourcePlaylist = state.playlists.find(
      (playlist) => playlist.id === playlistId,
    );
    if (!sourcePlaylist) {
      return null;
    }

    const duplicateId = generatePlaylistId(state.user?.id);
    const duplicateName = deriveDuplicatePlaylistName(
      sourcePlaylist.name,
      state.playlists,
    );

    const duplicatedPlaylist: Playlist = {
      id: duplicateId,
      name: duplicateName,
      items: clonePlaylistItems(sourcePlaylist.items),
    };

    set((currentState) => {
      const updatedPlaylists = [...currentState.playlists, duplicatedPlaylist];
      const constrained = enforcePlaylistBounds(updatedPlaylists, duplicateId);
      const nextShuffleQueue = currentState.isShuffle
        ? resetQueueForPlaylist(currentState.shuffleQueue, duplicateId)
        : currentState.shuffleQueue;

      return {
        ...constrained,
        activePlaylistId: duplicateId,
        currentVideoId: null,
        currentIndex: null,
        isPlaying: false,
        shuffleQueue: nextShuffleQueue,
      };
    });

    return duplicateId;
  },
  removePlaylist: (playlistId) => {
    const state = get();
    const playlistIndex = state.playlists.findIndex(
      (playlist) => playlist.id === playlistId,
    );

    if (playlistIndex === -1) {
      return false;
    }

    set((currentState) => {
      const updatedPlaylists = currentState.playlists.filter(
        (playlist) => playlist.id !== playlistId,
      );
      const removedActive = currentState.activePlaylistId === playlistId;

      let nextActivePlaylistId = currentState.activePlaylistId;
      if (removedActive) {
        if (updatedPlaylists.length === 0) {
          nextActivePlaylistId = "";
        } else if (playlistIndex < updatedPlaylists.length) {
          nextActivePlaylistId = updatedPlaylists[playlistIndex].id;
        } else {
          nextActivePlaylistId =
            updatedPlaylists[updatedPlaylists.length - 1].id;
        }
      }

      const constrained = enforcePlaylistBounds(
        updatedPlaylists,
        nextActivePlaylistId,
      );
      const didChangeActive =
        removedActive ||
        constrained.activePlaylistId !== currentState.activePlaylistId;

      let nextShuffleQueue = removeQueueForPlaylist(
        currentState.shuffleQueue,
        playlistId,
      );
      if (
        currentState.isShuffle &&
        didChangeActive &&
        constrained.activePlaylistId
      ) {
        nextShuffleQueue = resetQueueForPlaylist(
          nextShuffleQueue,
          constrained.activePlaylistId,
        );
      }

      return {
        ...constrained,
        currentVideoId: didChangeActive ? null : currentState.currentVideoId,
        currentIndex: didChangeActive ? null : currentState.currentIndex,
        isPlaying: didChangeActive ? false : currentState.isPlaying,
        shuffleQueue: nextShuffleQueue,
      };
    });

    return true;
  },
  syncPlaylistBounds: () =>
    set((state) => {
      const constrained = enforcePlaylistBounds(
        state.playlists,
        state.activePlaylistId,
      );
      const didChangeActive =
        constrained.activePlaylistId !== state.activePlaylistId;
      const didChangePlaylists =
        state.playlists.length !== constrained.playlists.length ||
        state.playlists.some(
          (playlist, index) => playlist.id !== constrained.playlists[index]?.id,
        );
      const didChangeCanCreate =
        constrained.canCreatePlaylist !== state.canCreatePlaylist;

      if (!didChangeActive && !didChangePlaylists && !didChangeCanCreate) {
        return {};
      }

      const nextShuffleQueue = state.isShuffle
        ? rebuildShuffleQueues(
            state.shuffleQueue,
            constrained.playlists,
            constrained.activePlaylistId,
            didChangeActive ? null : state.currentVideoId,
          )
        : state.shuffleQueue;

      return {
        ...constrained,
        currentVideoId: didChangeActive ? null : state.currentVideoId,
        currentIndex: didChangeActive ? null : state.currentIndex,
        isPlaying: didChangeActive ? false : state.isPlaying,
        shuffleQueue: nextShuffleQueue,
      };
    }),
  renamePlaylist: (playlistId, newName) =>
    set((state) => ({
      playlists: state.playlists.map((playlist) =>
        playlist.id === playlistId ? { ...playlist, name: newName } : playlist,
      ),
    })),
  setActivePlaylist: (playlistId) => {
    const targetPlaylist = get().playlists.find(
      (playlist) => playlist.id === playlistId,
    );
    if (!targetPlaylist) {
      return;
    }

    set((state) => {
      const hasItems = targetPlaylist.items.length > 0;
      const nextShuffleQueue = state.isShuffle
        ? resetQueueForPlaylist(state.shuffleQueue, playlistId)
        : state.shuffleQueue;

      return {
        activePlaylistId: playlistId,
        currentIndex: hasItems ? 0 : null,
        currentVideoId: hasItems ? targetPlaylist.items[0].id : null,
        isPlaying: hasItems,
        shuffleQueue: nextShuffleQueue,
      };
    });

    if (targetPlaylist.items.length > 0) {
      get().play(targetPlaylist.items[0].id);
    }
  },
  getActivePlaylist: () => {
    const { playlists, activePlaylistId } = get();
    return playlists.find((playlist) => playlist.id === activePlaylistId);
  },
  getOrderedPlaylists: () => {
    const { playlists } = get();
    return playlists;
  },
  getFavoritesPlaylist: () => {
    const { pinnedOrder, playlists } = get();
    return deriveFavoritesPlaylist(pinnedOrder, playlists);
  },
  getPlaylistsWithFavorites: () => {
    const { playlists, pinnedOrder } = get();
    const favoritesPlaylist = deriveFavoritesPlaylist(pinnedOrder, playlists);
    return injectFavoritesPlaylist(playlists, favoritesPlaylist);
  },
});
