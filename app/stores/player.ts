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

export const usePlayerStore = create<PlayerState>((set, get) => ({
  isPlaying: false,
  currentVideoId: null,
  currentIndex: null,
  playlist: [],
  isLoop: true,
  isShuffle: false,
  playerInstance: null,
  setPlayerInstance: (player) => set({ playerInstance: player }),
  play: (videoId) => {
    const { playerInstance } = get();
    if (playerInstance) {
      playerInstance.loadVideoById(videoId);
      playerInstance.playVideo();
    }
    set({ isPlaying: true, currentVideoId: videoId });
  },
  pause: () => {
    const { playerInstance } = get();
    if (playerInstance) {
      playerInstance.pauseVideo();
    }
    set({ isPlaying: false });
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
}));
