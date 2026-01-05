import type { StateCreator } from "zustand";
import type { User } from "~/hooks/use-auth";
import type { ShuffleQueueMap } from "~/lib/player/shuffle-queue";
import type { LoopMode, Playlist, PlaylistItem } from "~/lib/player/types";
import type { PinnedSongsSlice } from "./slices/pinned-songs-slice";

export interface PlaybackSlice {
  isPlaying: boolean;
  currentVideoId: string | null;
  currentIndex: number | null;
  loopMode: LoopMode;
  isShuffle: boolean;
  shuffleQueue: ShuffleQueueMap;
  // biome-ignore lint/suspicious/noExplicitAny: allow YouTube API instance
  playerInstance: any | null;
  // biome-ignore lint/suspicious/noExplicitAny: allow YouTube API instance
  setPlayerInstance: (player: any) => void;
  play: (videoId: string) => void;
  pause: () => void;
  setPlayingStateToFalse: () => void;
  resume: () => void;
  toggleLoop: () => void;
  toggleShuffle: () => void;
  playNext: () => void;
  playPrevious: () => void;
}

export interface PlaylistSlice {
  playlists: Playlist[];
  maxPlaylistCount: number;
  canCreatePlaylist: boolean;
  activePlaylistId: string;
  lastNonFavoritesPlaylistId: string;
  addToPlaylist: (item: PlaylistItem, playlistId?: string) => boolean;
  removeFromPlaylist: (index: number, playlistId?: string) => void;
  reorderPlaylist: (
    fromIndex: number,
    toIndex: number,
    playlistId?: string,
  ) => void;
  reorderPlaylists: (fromIndex: number, toIndex: number) => void;
  moveItemBetweenPlaylists: (
    itemIndex: number,
    fromPlaylistId: string,
    toPlaylistId: string,
  ) => boolean;
  clearPlaylist: (playlistId?: string) => void;
  nextPlaylistName: () => string;
  createPlaylist: () => string | null;
  duplicatePlaylist: (playlistId: string) => string | null;
  removePlaylist: (playlistId: string) => boolean;
  syncPlaylistBounds: () => void;
  renamePlaylist: (playlistId: string, newName: string) => void;
  setActivePlaylist: (playlistId: string) => void;
  getActivePlaylist: () => Playlist | undefined;
  getOrderedPlaylists: () => Playlist[];
  getFavoritesPlaylist: () => Playlist;
  getPlaylistsWithFavorites: () => Playlist[];
}

export interface SyncSlice {
  user: User | null;
  isDataSynced: boolean;
  setUser: (user: User | null) => void;
  loadUserData: (userData: {
    playlists: Playlist[];
    activePlaylistId: string;
    loopMode: LoopMode;
    isShuffle: boolean;
  }) => void;
  syncToServer: () => Promise<void>;
  markAsSynced: () => void;
}

export type PlayerState = PlaybackSlice &
  PlaylistSlice &
  SyncSlice &
  PinnedSongsSlice;
export type PlayerStore = PlayerState;

export type PlayerStoreSlice<T> = StateCreator<PlayerStore, [], [], T>;
