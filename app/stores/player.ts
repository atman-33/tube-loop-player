import { create } from 'zustand';

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
  toggleLoop: () => void;
  toggleShuffle: () => void;
  addToPlaylist: (item: PlaylistItem) => void;
  removeFromPlaylist: (index: number) => void;
  clearPlaylist: () => void;
  playNext: () => void;
  playPrevious: () => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  isPlaying: false,
  currentVideoId: null,
  currentIndex: null,
  playlist: [],
  isLoop: true,
  isShuffle: false,
  playerInstance: null,
  setPlayerInstance: (player) => set({ playerInstance: player }),
  play: (videoId) => set({ isPlaying: true, currentVideoId: videoId }),
  pause: () => set({ isPlaying: false }),
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
  clearPlaylist: () =>
    set({ playlist: [], currentIndex: null, currentVideoId: null }),
  playNext: () =>
    set((state) => {
      if (state.playlist.length === 0) return {};
      const nextIndex = (state.currentIndex ?? -1) + 1;
      if (nextIndex >= state.playlist.length) {
        return state.isLoop
          ? {
              currentIndex: 0,
              currentVideoId: state.playlist[0].id,
            }
          : {};
      }
      return {
        currentIndex: nextIndex,
        currentVideoId: state.playlist[nextIndex].id,
      };
    }),
  playPrevious: () =>
    set((state) => {
      if (state.playlist.length === 0) return {};
      const prevIndex = (state.currentIndex ?? 0) - 1;
      if (prevIndex < 0) {
        return state.isLoop
          ? {
              currentIndex: state.playlist.length - 1,
              currentVideoId: state.playlist[state.playlist.length - 1].id,
            }
          : {};
      }
      return {
        currentIndex: prevIndex,
        currentVideoId: state.playlist[prevIndex].id,
      };
    }),
}));
