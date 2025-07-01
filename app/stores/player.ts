import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { deleteCookie, getCookie, setCookie } from '../lib/cookie';

interface PlaylistItem {
  id: string;
  title?: string;
}

interface PlayerState {
  isPlaying: boolean;
  currentVideoId: string | null;
  currentIndex: number | null;
  playlist: PlaylistItem[];
  isLoop: boolean;
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
  addToPlaylist: (item: PlaylistItem) => void;
  removeFromPlaylist: (index: number) => void;
  reorderPlaylist: (fromIndex: number, toIndex: number) => void;
  clearPlaylist: () => void;
  playNext: () => void;
  playPrevious: () => void;
}

const defaultInitialVideoId = 'V4UL6BYgUXw';
const defaultInitialPlaylistItem: PlaylistItem = {
  id: defaultInitialVideoId,
  title: "Aerith's Theme | Pure | Final Fantasy VII Rebirth Soundtrack",
};

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      isPlaying: false,
      currentVideoId: null,
      currentIndex: null,
      playlist: [defaultInitialPlaylistItem],
      isLoop: true,
      isShuffle: false,
      playerInstance: null,
      setPlayerInstance: (player) => set({ playerInstance: player }),
      play: (videoId) => {
        const { playerInstance, playlist } = get(); // Get playlist from state
        if (playerInstance) {
          playerInstance.loadVideoById(videoId);
          playerInstance.playVideo();
        }
        // Add logic to update currentIndex
        const newIndex = playlist.findIndex((item) => item.id === videoId);
        set({
          isPlaying: true,
          currentVideoId: videoId,
          currentIndex: newIndex,
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
      toggleLoop: () => set((state) => ({ isLoop: !state.isLoop })),
      toggleShuffle: () => set((state) => ({ isShuffle: !state.isShuffle })),
      addToPlaylist: (item) =>
        set((state) => ({
          playlist: [...state.playlist, item],
          currentIndex: state.currentIndex === null ? 0 : state.currentIndex,
        })),
      removeFromPlaylist: (index) =>
        set((state) => {
          const newPlaylist = [...state.playlist];
          newPlaylist.splice(index, 1);
          return { playlist: newPlaylist };
        }),
      reorderPlaylist: (fromIndex, toIndex) =>
        set((state) => {
          const newPlaylist = [...state.playlist];
          const [removed] = newPlaylist.splice(fromIndex, 1);
          newPlaylist.splice(toIndex, 0, removed);

          // Update currentIndex if the currently playing video moved
          let newCurrentIndex: number | null = state.currentIndex;
          if (newCurrentIndex !== null) {
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
          return { playlist: newPlaylist, currentIndex: newCurrentIndex };
        }),
      clearPlaylist: () =>
        set({ playlist: [], currentIndex: null, currentVideoId: null }),
      playNext: () => {
        const { playlist, currentIndex, isLoop, playerInstance } = get();
        if (playlist.length === 0) return;

        const nextIndex = (currentIndex ?? -1) + 1;
        if (nextIndex >= playlist.length) {
          if (isLoop) {
            const videoId = playlist[0].id;
            if (playerInstance) {
              playerInstance.loadVideoById(videoId);
              playerInstance.playVideo();
            }
            set({ currentIndex: 0, currentVideoId: videoId, isPlaying: true });
          } else {
            set({ isPlaying: false });
          }
        } else {
          const videoId = playlist[nextIndex].id;
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
        const { playlist, currentIndex, isLoop, playerInstance } = get();
        if (playlist.length === 0) return;

        const prevIndex = (currentIndex ?? 0) - 1;
        if (prevIndex < 0) {
          if (isLoop) {
            const lastIndex = playlist.length - 1;
            const videoId = playlist[lastIndex].id;
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
          const videoId = playlist[prevIndex].id;
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
        playlist: state.playlist,
        isLoop: state.isLoop,
        isShuffle: state.isShuffle,
      }),
      merge: (persistedState, currentState) => {
        const state = persistedState as PlayerState;
        if (state?.playlist && state.playlist.length > 0) {
          // If the restored playlist exists and is not empty
          const firstVideo = state.playlist[0];
          return {
            ...currentState,
            ...state,
            currentVideoId: firstVideo ? firstVideo.id : null,
            currentIndex: 0,
          };
        } else {
          // If the restored playlist does not exist or is empty, use the default initial values
          return {
            ...currentState,
            // Consider the case where state is null
            playlist: [defaultInitialPlaylistItem],
            currentVideoId: defaultInitialVideoId,
            currentIndex: 0,
          };
        }
      },
    },
  ),
);
