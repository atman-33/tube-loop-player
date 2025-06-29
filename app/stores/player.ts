import { create } from 'zustand';
interface PlayerState {
  isPlaying: boolean;
  currentVideoId: string | null;
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
}

export const usePlayerStore = create<PlayerState>((set) => ({
  isPlaying: false,
  currentVideoId: null,
  isLoop: true,
  isShuffle: false,
  playerInstance: null,
  setPlayerInstance: (player) => set({ playerInstance: player }),
  play: (videoId) => set({ isPlaying: true, currentVideoId: videoId }),
  pause: () => set({ isPlaying: false }),
  toggleLoop: () => set((state) => ({ isLoop: !state.isLoop })),
  toggleShuffle: () => set((state) => ({ isShuffle: !state.isShuffle })),
}));
