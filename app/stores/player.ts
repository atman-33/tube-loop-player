import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { deleteCookie, getCookie, setCookie } from '../lib/cookie';

interface PlaylistItem {
  id: string;
  title?: string;
}

interface Playlist {
  id: string;
  name: string;
  items: PlaylistItem[];
}

export type LoopMode = 'all' | 'one';

interface PlayerState {
  isPlaying: boolean;
  currentVideoId: string | null;
  currentIndex: number | null;
  playlists: Playlist[];
  activePlaylistId: string;
  loopMode: LoopMode;
  isShuffle: boolean;
  // biome-ignore lint/suspicious/noExplicitAny: <>
  playerInstance: any | null;
  // biome-ignore lint/suspicious/noExplicitAny: <>
  setPlayerInstance: (player: any) => void;
  play: (videoId: string) => void;
  pause: () => void;
  setPlayingStateToFalse: () => void;
  resume: () => void;
  toggleLoop: () => void;
  toggleShuffle: () => void;
  addToPlaylist: (item: PlaylistItem, playlistId?: string) => boolean;
  removeFromPlaylist: (index: number, playlistId?: string) => void;
  reorderPlaylist: (
    fromIndex: number,
    toIndex: number,
    playlistId?: string,
  ) => void;
  moveItemBetweenPlaylists: (
    itemIndex: number,
    fromPlaylistId: string,
    toPlaylistId: string,
  ) => boolean;
  clearPlaylist: (playlistId?: string) => void;

  renamePlaylist: (playlistId: string, newName: string) => void;
  setActivePlaylist: (playlistId: string) => void;
  getActivePlaylist: () => Playlist | undefined;
  getOrderedPlaylists: () => Playlist[];
  playNext: () => void;
  playPrevious: () => void;
}

const defaultInitialVideoId = 'V4UL6BYgUXw';
const defaultInitialPlaylistItem: PlaylistItem = {
  id: defaultInitialVideoId,
  title: "Aerith's Theme | Pure | Final Fantasy VII Rebirth Soundtrack",
};

const defaultPlaylists: Playlist[] = [
  {
    id: 'playlist-1',
    name: 'Playlist 1',
    items: [defaultInitialPlaylistItem],
  },
  {
    id: 'playlist-2',
    name: 'Playlist 2',
    items: [],
  },
  {
    id: 'playlist-3',
    name: 'Playlist 3',
    items: [],
  },
];

const defaultActivePlaylistId = 'playlist-1';

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      isPlaying: false,
      currentVideoId: null,
      currentIndex: null,
      playlists: defaultPlaylists,
      activePlaylistId: defaultActivePlaylistId,
      loopMode: 'all',
      isShuffle: false,
      playerInstance: null,
      setPlayerInstance: (player) => set({ playerInstance: player }),
      getActivePlaylist: () => {
        const { playlists, activePlaylistId } = get();
        return playlists.find((p) => p.id === activePlaylistId);
      },
      play: (videoId) => {
        const { playerInstance } = get();
        const activePlaylist = get().getActivePlaylist();
        if (playerInstance) {
          playerInstance.loadVideoById(videoId);
          playerInstance.playVideo();
        }
        // Update currentIndex based on the active playlist
        const newIndex =
          activePlaylist?.items.findIndex((item) => item.id === videoId) ?? -1;
        set({
          isPlaying: true,
          currentVideoId: videoId,
          currentIndex: newIndex >= 0 ? newIndex : null,
        });
      },
      pause: () => {
        const { playerInstance } = get();
        if (playerInstance) {
          playerInstance.pauseVideo();
        }
        set({ isPlaying: false });
      },
      setPlayingStateToFalse: () => {
        set({ isPlaying: false });
      },
      resume: () => {
        const { playerInstance } = get();
        if (playerInstance) {
          playerInstance.playVideo();
        }
        set({ isPlaying: true });
      },
      toggleLoop: () =>
        set((state) => ({
          loopMode: state.loopMode === 'all' ? 'one' : 'all',
        })),
      toggleShuffle: () => set((state) => ({ isShuffle: !state.isShuffle })),
      addToPlaylist: (item, playlistId) => {
        const state = get();
        const targetPlaylistId = playlistId || state.activePlaylistId;
        const targetPlaylist = state.playlists.find(
          (p) => p.id === targetPlaylistId,
        );

        // Check if the item already exists in the target playlist
        if (
          targetPlaylist &&
          targetPlaylist.items.some(
            (existingItem) => existingItem.id === item.id,
          )
        ) {
          return false; // Don't add if duplicate exists
        }

        set((state) => {
          const updatedPlaylists = state.playlists.map((playlist) =>
            playlist.id === targetPlaylistId
              ? { ...playlist, items: [...playlist.items, item] }
              : playlist,
          );
          return {
            playlists: updatedPlaylists,
            currentIndex: state.currentIndex === null ? 0 : state.currentIndex,
          };
        });

        return true; // Successfully added
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
          return { playlists: updatedPlaylists };
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

          // Update currentIndex if the currently playing video moved in the active playlist
          let newCurrentIndex: number | null = state.currentIndex;
          if (
            targetPlaylistId === state.activePlaylistId &&
            newCurrentIndex !== null
          ) {
            if (newCurrentIndex === fromIndex) {
              newCurrentIndex = toIndex;
            } else {
              // Adjust index if an item was moved past it
              if (fromIndex < newCurrentIndex && toIndex >= newCurrentIndex) {
                newCurrentIndex -= 1;
              } else if (
                fromIndex > newCurrentIndex &&
                toIndex <= newCurrentIndex
              ) {
                newCurrentIndex += 1;
              }
            }
          }
          return { playlists: updatedPlaylists, currentIndex: newCurrentIndex };
        }),
      moveItemBetweenPlaylists: (itemIndex, fromPlaylistId, toPlaylistId) => {
        const state = get();
        const fromPlaylist = state.playlists.find(
          (p) => p.id === fromPlaylistId,
        );
        const toPlaylist = state.playlists.find((p) => p.id === toPlaylistId);

        if (
          !fromPlaylist ||
          itemIndex >= fromPlaylist.items.length ||
          !toPlaylist
        )
          return false;

        const itemToMove = fromPlaylist.items[itemIndex];

        // Check if the item already exists in the target playlist
        if (
          toPlaylist.items.some(
            (existingItem) => existingItem.id === itemToMove.id,
          )
        ) {
          return false; // Don't move if duplicate exists
        }

        set((state) => {
          const updatedPlaylists = state.playlists.map((playlist) => {
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

          return { playlists: updatedPlaylists };
        });

        return true; // Successfully moved
      },
      clearPlaylist: (playlistId) =>
        set((state) => {
          const targetPlaylistId = playlistId || state.activePlaylistId;
          const updatedPlaylists = state.playlists.map((playlist) =>
            playlist.id === targetPlaylistId
              ? { ...playlist, items: [] }
              : playlist,
          );

          // Reset current state if clearing the active playlist
          const resetState =
            targetPlaylistId === state.activePlaylistId
              ? { currentIndex: null, currentVideoId: null }
              : {};

          return { playlists: updatedPlaylists, ...resetState };
        }),

      renamePlaylist: (playlistId, newName) =>
        set((state) => ({
          playlists: state.playlists.map((playlist) =>
            playlist.id === playlistId
              ? { ...playlist, name: newName }
              : playlist,
          ),
        })),
      setActivePlaylist: (playlistId) =>
        set((state) => {
          const targetPlaylist = state.playlists.find(
            (p) => p.id === playlistId,
          );
          if (!targetPlaylist) return state;

          // Reorder playlists to put the active one first
          const otherPlaylists = state.playlists.filter(
            (p) => p.id !== playlistId,
          );
          const reorderedPlaylists = [targetPlaylist, ...otherPlaylists];

          return {
            playlists: reorderedPlaylists,
            activePlaylistId: playlistId,
            // Reset current state when switching playlists
            currentIndex: targetPlaylist.items.length > 0 ? 0 : null,
            currentVideoId:
              targetPlaylist.items.length > 0
                ? targetPlaylist.items[0].id
                : null,
            isPlaying: false,
          };
        }),
      playNext: () => {
        const activePlaylist = get().getActivePlaylist();
        const { currentIndex, loopMode, isShuffle, playerInstance } = get();

        if (!activePlaylist || activePlaylist.items.length === 0) {
          set({ isPlaying: false });
          return;
        }

        if (isShuffle) {
          let randomIndex: number;
          do {
            randomIndex = Math.floor(
              Math.random() * activePlaylist.items.length,
            );
          } while (
            activePlaylist.items.length > 1 &&
            randomIndex === currentIndex
          );
          const videoId = activePlaylist.items[randomIndex].id;
          if (playerInstance) {
            playerInstance.loadVideoById(videoId);
            playerInstance.playVideo();
          }
          set({
            currentIndex: randomIndex,
            currentVideoId: videoId,
            isPlaying: true,
          });
          return;
        }

        const nextIndex = (currentIndex ?? -1) + 1;
        if (nextIndex >= activePlaylist.items.length) {
          if (loopMode === 'all') {
            const videoId = activePlaylist.items[0].id;
            if (playerInstance) {
              playerInstance.loadVideoById(videoId);
              playerInstance.playVideo();
            }
            set({ currentIndex: 0, currentVideoId: videoId, isPlaying: true });
          } else {
            set({ isPlaying: false });
          }
        } else {
          const videoId = activePlaylist.items[nextIndex].id;
          if (playerInstance) {
            playerInstance.loadVideoById(videoId);
            playerInstance.playVideo();
          }
          set({
            currentIndex: nextIndex,
            currentVideoId: videoId,
            isPlaying: true,
          });
        }
      },
      playPrevious: () => {
        const activePlaylist = get().getActivePlaylist();
        const { currentIndex, loopMode, isShuffle, playerInstance } = get();

        if (!activePlaylist || activePlaylist.items.length === 0) return;

        if (isShuffle) {
          let randomIndex: number;
          do {
            randomIndex = Math.floor(
              Math.random() * activePlaylist.items.length,
            );
          } while (
            activePlaylist.items.length > 1 &&
            randomIndex === currentIndex
          );
          const videoId = activePlaylist.items[randomIndex].id;
          if (playerInstance) {
            playerInstance.loadVideoById(videoId);
            playerInstance.playVideo();
          }
          set({
            currentIndex: randomIndex,
            currentVideoId: videoId,
            isPlaying: true,
          });
          return;
        }

        const prevIndex = (currentIndex ?? 0) - 1;
        if (prevIndex < 0) {
          if (loopMode === 'all') {
            const lastIndex = activePlaylist.items.length - 1;
            const videoId = activePlaylist.items[lastIndex].id;
            if (playerInstance) {
              playerInstance.loadVideoById(videoId);
              playerInstance.playVideo();
            }
            set({
              currentIndex: lastIndex,
              currentVideoId: videoId,
              isPlaying: true,
            });
          } else {
            set({ isPlaying: false });
          }
        } else {
          const videoId = activePlaylist.items[prevIndex].id;
          if (playerInstance) {
            playerInstance.loadVideoById(videoId);
            playerInstance.playVideo();
          }
          set({
            currentIndex: prevIndex,
            currentVideoId: videoId,
            isPlaying: true,
          });
        }
      },
      getOrderedPlaylists: () => {
        const { playlists } = get();
        return playlists;
      },
    }),
    {
      name: 'tube-loop-player-storage', // name of the item in storage (must be unique)
      storage: createJSONStorage(() => ({
        getItem: (name) => {
          const cookie = getCookie(name);
          return cookie ? cookie : null;
        },
        setItem: (name, value) => {
          setCookie(name, value, 365); // Save for 365 days
        },
        removeItem: (name) => {
          deleteCookie(name);
        },
      })),
      partialize: (state) => ({
        playlists: state.playlists,
        activePlaylistId: state.activePlaylistId,
        loopMode: state.loopMode,
        isShuffle: state.isShuffle,
      }),
      merge: (persistedState, currentState) => {
        const state = persistedState as Partial<PlayerState>;
        if (state?.playlists && state.playlists.length > 0) {
          // If the restored playlists exist and are not empty
          const activePlaylist =
            state.playlists.find((p) => p.id === state.activePlaylistId) ||
            state.playlists[0];
          const firstVideo = activePlaylist.items[0];
          return {
            ...currentState,
            ...state,
            currentVideoId: firstVideo ? firstVideo.id : null,
            currentIndex: firstVideo ? 0 : null,
          };
        } else {
          // If the restored playlists do not exist or are empty, use the default initial values
          return {
            ...currentState,
            playlists: defaultPlaylists,
            activePlaylistId: defaultActivePlaylistId,
            currentVideoId: defaultInitialVideoId,
            currentIndex: 0,
          };
        }
      },
    },
  ),
);
