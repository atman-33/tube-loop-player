import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { User } from "~/hooks/use-auth";
import { deleteCookie, getCookie, setCookie } from "../lib/cookie";

const LEGACY_PLAYLIST_ID_PATTERN = /^playlist-\d+$/;

const createUniqueSegment = () => {
  if (
    typeof globalThis.crypto !== "undefined" &&
    typeof globalThis.crypto.randomUUID === "function"
  ) {
    return globalThis.crypto.randomUUID();
  }

  const timePart = Date.now().toString(36);
  const randomPart = Math.random().toString(36).slice(2, 10);
  return `${timePart}-${randomPart}`;
};

const generatePlaylistId = (userId?: string) => {
  const uniqueSegment = createUniqueSegment();
  if (userId && userId.length > 0) {
    return `playlist-${userId}-${uniqueSegment}`;
  }
  return `playlist-${uniqueSegment}`;
};

const sanitizePlaylistIdentifiers = (
  playlists: Playlist[],
  activePlaylistId: string,
  userId?: string,
) => {
  const seen = new Set<string>();
  const idMap = new Map<string, string>();
  let didChange = false;

  const updatedPlaylists = playlists.map((playlist) => {
    const originalId = playlist.id;
    let nextId = originalId;
    const shouldRegenerate =
      !nextId ||
      LEGACY_PLAYLIST_ID_PATTERN.test(nextId) ||
      seen.has(nextId) ||
      (userId ? !nextId.startsWith(`playlist-${userId}-`) : false);

    if (shouldRegenerate) {
      let generatedId = "";
      do {
        generatedId = generatePlaylistId(userId);
      } while (seen.has(generatedId));
      if (originalId && !idMap.has(originalId)) {
        idMap.set(originalId, generatedId);
      }
      nextId = generatedId;
      didChange = true;
    } else {
      if (originalId && !idMap.has(originalId)) {
        idMap.set(originalId, nextId);
      }
    }

    seen.add(nextId);

    return {
      ...playlist,
      id: nextId,
    };
  });

  let nextActivePlaylistId = activePlaylistId;
  if (idMap.has(activePlaylistId)) {
    const mappedId = idMap.get(activePlaylistId) as string;
    if (mappedId !== activePlaylistId) {
      didChange = true;
    }
    nextActivePlaylistId = mappedId;
  } else if (
    activePlaylistId &&
    !updatedPlaylists.some((p) => p.id === activePlaylistId)
  ) {
    if (updatedPlaylists[0]) {
      nextActivePlaylistId = updatedPlaylists[0].id;
    } else {
      nextActivePlaylistId = "";
    }
    didChange = true;
  }

  if (!nextActivePlaylistId && updatedPlaylists[0]) {
    nextActivePlaylistId = updatedPlaylists[0].id;
    if (nextActivePlaylistId !== activePlaylistId) {
      didChange = true;
    }
  }

  return {
    playlists: updatedPlaylists,
    activePlaylistId: nextActivePlaylistId,
    didChange,
  };
};

interface PlaylistItem {
  id: string;
  title?: string;
}

interface Playlist {
  id: string;
  name: string;
  items: PlaylistItem[];
}

export type LoopMode = "all" | "one";

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
  // Auth-related state
  user: User | null;
  isDataSynced: boolean;
  // biome-ignore lint/suspicious/noExplicitAny: <>
  setPlayerInstance: (player: any) => void;
  play: (videoId: string) => void;
  pause: () => void;
  setPlayingStateToFalse: () => void;
  resume: () => void;
  toggleLoop: () => void;
  toggleShuffle: () => void;
  // Auth-related methods
  setUser: (user: User | null) => void;
  loadUserData: (userData: {
    playlists: Playlist[];
    activePlaylistId: string;
    loopMode: LoopMode;
    isShuffle: boolean;
  }) => void;
  syncToServer: () => Promise<void>;
  markAsSynced: () => void;
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

  renamePlaylist: (playlistId: string, newName: string) => void;
  setActivePlaylist: (playlistId: string) => void;
  getActivePlaylist: () => Playlist | undefined;
  getOrderedPlaylists: () => Playlist[];
  playNext: () => void;
  playPrevious: () => void;
}

const defaultInitialVideoId = "V4UL6BYgUXw";
const defaultInitialPlaylistItem: PlaylistItem = {
  id: defaultInitialVideoId,
  title: "Aerith's Theme | Pure | Final Fantasy VII Rebirth Soundtrack",
};

// Deterministic defaults avoid random generation during module evaluation.
const DEFAULT_PLAYLIST_IDS = [
  "playlist-default-1",
  "playlist-default-2",
  "playlist-default-3",
] as const;

const createDefaultPlaylists = (): Playlist[] => [
  {
    id: DEFAULT_PLAYLIST_IDS[0],
    name: "Playlist 1",
    items: [defaultInitialPlaylistItem],
  },
  {
    id: DEFAULT_PLAYLIST_IDS[1],
    name: "Playlist 2",
    items: [],
  },
  {
    id: DEFAULT_PLAYLIST_IDS[2],
    name: "Playlist 3",
    items: [],
  },
];

const defaultPlaylists = createDefaultPlaylists();

const defaultActivePlaylistId = defaultPlaylists[0]?.id ?? "";

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      isPlaying: false,
      currentVideoId: null,
      currentIndex: null,
      playlists: defaultPlaylists,
      activePlaylistId: defaultActivePlaylistId,
      loopMode: "all",
      isShuffle: false,
      playerInstance: null,
      user: null,
      isDataSynced: false,
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
          loopMode: state.loopMode === "all" ? "one" : "all",
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
          targetPlaylist?.items.some(
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
      reorderPlaylists: (fromIndex: number, toIndex: number) =>
        set((state) => {
          const newPlaylists = [...state.playlists];
          const [removed] = newPlaylists.splice(fromIndex, 1);
          newPlaylists.splice(toIndex, 0, removed);

          // Update active playlist if it was moved
          const newActivePlaylistId = state.activePlaylistId;
          return {
            playlists: newPlaylists,
            activePlaylistId: newActivePlaylistId,
          };
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
      setActivePlaylist: (playlistId) => {
        const targetPlaylist = get().playlists.find((p) => p.id === playlistId);
        if (!targetPlaylist) return;

        // Update state first
        set({
          activePlaylistId: playlistId,
          currentIndex: targetPlaylist.items.length > 0 ? 0 : null,
          currentVideoId:
            targetPlaylist.items.length > 0 ? targetPlaylist.items[0].id : null,
          isPlaying: targetPlaylist.items.length > 0,
        });

        // Then trigger playback if the playlist has items
        if (targetPlaylist.items.length > 0) {
          get().play(targetPlaylist.items[0].id);
        }
      },
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
          if (loopMode === "all") {
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
          if (loopMode === "all") {
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
      setUser: (user) => {
        set((state) => {
          if (!user) {
            return { user: null, isDataSynced: false };
          }

          const sanitized = sanitizePlaylistIdentifiers(
            state.playlists,
            state.activePlaylistId,
            user.id,
          );

          const nextState: Partial<PlayerState> = {
            user,
            isDataSynced: false,
          };

          if (sanitized.didChange) {
            nextState.playlists = sanitized.playlists;
            nextState.activePlaylistId = sanitized.activePlaylistId;
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

        const activePlaylist =
          sanitized.playlists.find(
            (playlist) => playlist.id === sanitized.activePlaylistId,
          ) || sanitized.playlists[0];
        const firstVideo = activePlaylist?.items[0];

        set({
          playlists: sanitized.playlists,
          activePlaylistId: sanitized.activePlaylistId,
          loopMode: userData.loopMode,
          isShuffle: userData.isShuffle,
          currentVideoId: firstVideo ? firstVideo.id : null,
          currentIndex: firstVideo ? 0 : null,
          isDataSynced: true,
        });
      },
      syncToServer: async () => {
        const { user, playlists, activePlaylistId, loopMode, isShuffle } =
          get();
        if (!user) return;

        const sanitized = sanitizePlaylistIdentifiers(
          playlists,
          activePlaylistId,
          user.id,
        );

        if (sanitized.didChange) {
          set({
            playlists: sanitized.playlists,
            activePlaylistId: sanitized.activePlaylistId,
          });
        }

        try {
          const response = await fetch("/api/playlists/sync", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              playlists: sanitized.playlists,
              activePlaylistId: sanitized.activePlaylistId,
              loopMode,
              isShuffle,
            }),
          });

          if (response.ok) {
            set({ isDataSynced: true });
          }
        } catch (error) {
          console.error("Failed to sync to server:", error);
        }
      },
      markAsSynced: () => {
        set({ isDataSynced: true });
      },
    }),
    {
      name: "tube-loop-player-storage", // name of the item in storage (must be unique)
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
          const sanitized = sanitizePlaylistIdentifiers(
            state.playlists,
            state.activePlaylistId ?? "",
          );

          const activePlaylist =
            sanitized.playlists.find(
              (playlist) => playlist.id === sanitized.activePlaylistId,
            ) || sanitized.playlists[0];
          const firstVideo = activePlaylist?.items[0];

          return {
            ...currentState,
            ...state,
            playlists: sanitized.playlists,
            activePlaylistId: sanitized.activePlaylistId,
            currentVideoId: firstVideo ? firstVideo.id : null,
            currentIndex: firstVideo ? 0 : null,
          };
        }

        return {
          ...currentState,
          playlists: defaultPlaylists,
          activePlaylistId: defaultActivePlaylistId,
          currentVideoId: defaultInitialVideoId,
          currentIndex: 0,
        };
      },
    },
  ),
);
