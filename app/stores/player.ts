import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { User } from "~/hooks/use-auth";

const LEGACY_PLAYLIST_ID_PATTERN = /^playlist-\d+$/;

export const MAX_PLAYLIST_COUNT = 10;

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

export const sanitizePlaylistIdentifiers = (
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

const PLAYLIST_NAME_PATTERN = /^Playlist (\d+)$/i;

const deriveNextPlaylistName = (playlists: Playlist[]) => {
  const usedNumbers = new Set<number>();
  let highest = 0;

  for (const playlist of playlists) {
    const match = PLAYLIST_NAME_PATTERN.exec(playlist.name);
    if (match) {
      const value = Number.parseInt(match[1], 10);
      if (!Number.isNaN(value)) {
        usedNumbers.add(value);
        if (value > highest) {
          highest = value;
        }
      }
    }
  }

  for (let i = 1; i <= MAX_PLAYLIST_COUNT; i += 1) {
    if (!usedNumbers.has(i)) {
      return `Playlist ${i}`;
    }
  }

  return `Playlist ${highest + 1}`;
};

const deriveDuplicatePlaylistName = (
  baseName: string,
  playlists: Playlist[],
) => {
  const baseCopyName = `${baseName} Copy`;
  const existingNames = new Set(playlists.map((playlist) => playlist.name));
  if (!existingNames.has(baseCopyName)) {
    return baseCopyName;
  }

  let suffix = 2;
  while (suffix < 100) {
    const candidate = `${baseCopyName} ${suffix}`;
    if (!existingNames.has(candidate)) {
      return candidate;
    }
    suffix += 1;
  }

  return `${baseCopyName} ${Date.now()}`;
};

const enforcePlaylistBounds = (
  playlists: Playlist[],
  activePlaylistId: string,
) => {
  const trimmed = playlists.slice(0, MAX_PLAYLIST_COUNT);
  let nextActiveId = activePlaylistId;

  if (trimmed.length === 0) {
    nextActiveId = "";
  } else if (!trimmed.some((playlist) => playlist.id === nextActiveId)) {
    nextActiveId = trimmed[0].id;
  }

  return {
    playlists: trimmed,
    activePlaylistId: nextActiveId,
    canCreatePlaylist: trimmed.length < MAX_PLAYLIST_COUNT,
  };
};

const clonePlaylistItems = (items: PlaylistItem[]) =>
  items.map((item) => ({ ...item }));

export type LoopMode = "all" | "one";

interface PlayerState {
  isPlaying: boolean;
  currentVideoId: string | null;
  currentIndex: number | null;
  playlists: Playlist[];
  maxPlaylistCount: number;
  canCreatePlaylist: boolean;
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
  nextPlaylistName: () => string;
  createPlaylist: () => string | null;
  duplicatePlaylist: (playlistId: string) => string | null;
  removePlaylist: (playlistId: string) => boolean;
  syncPlaylistBounds: () => void;

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
      maxPlaylistCount: MAX_PLAYLIST_COUNT,
      canCreatePlaylist: defaultPlaylists.length < MAX_PLAYLIST_COUNT,
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
          const constrained = enforcePlaylistBounds(
            updatedPlaylists,
            playlistId,
          );

          return {
            ...constrained,
            activePlaylistId: playlistId,
            currentVideoId: null,
            currentIndex: null,
            isPlaying: false,
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
          const updatedPlaylists = [
            ...currentState.playlists,
            duplicatedPlaylist,
          ];
          const constrained = enforcePlaylistBounds(
            updatedPlaylists,
            duplicateId,
          );

          return {
            ...constrained,
            activePlaylistId: duplicateId,
            currentVideoId: null,
            currentIndex: null,
            isPlaying: false,
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

          return {
            ...constrained,
            currentVideoId: didChangeActive
              ? null
              : currentState.currentVideoId,
            currentIndex: didChangeActive ? null : currentState.currentIndex,
            isPlaying: didChangeActive ? false : currentState.isPlaying,
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
              (playlist, index) =>
                playlist.id !== constrained.playlists[index]?.id,
            );
          const didChangeCanCreate =
            constrained.canCreatePlaylist !== state.canCreatePlaylist;

          if (!didChangeActive && !didChangePlaylists && !didChangeCanCreate) {
            return {};
          }

          return {
            ...constrained,
            currentVideoId: didChangeActive ? null : state.currentVideoId,
            currentIndex: didChangeActive ? null : state.currentIndex,
            isPlaying: didChangeActive ? false : state.isPlaying,
          };
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
          const constrained = enforcePlaylistBounds(
            sanitized.playlists,
            sanitized.activePlaylistId,
          );

          const nextState: Partial<PlayerState> = {
            user,
            isDataSynced: false,
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

        const activePlaylist =
          constrained.playlists.find(
            (playlist) => playlist.id === constrained.activePlaylistId,
          ) || constrained.playlists[0];
        const firstVideo = activePlaylist?.items[0];

        set({
          playlists: constrained.playlists,
          activePlaylistId: constrained.activePlaylistId,
          loopMode: userData.loopMode,
          isShuffle: userData.isShuffle,
          currentVideoId: firstVideo ? firstVideo.id : null,
          currentIndex: firstVideo ? 0 : null,
          isDataSynced: true,
          canCreatePlaylist: constrained.canCreatePlaylist,
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
        if (!user) return;

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

          const constrained = enforcePlaylistBounds(
            sanitized.playlists,
            sanitized.activePlaylistId,
          );

          const activePlaylist =
            constrained.playlists.find(
              (playlist) => playlist.id === constrained.activePlaylistId,
            ) || constrained.playlists[0];
          const firstVideo = activePlaylist?.items[0];

          return {
            ...currentState,
            ...state,
            playlists: constrained.playlists,
            activePlaylistId: constrained.activePlaylistId,
            currentVideoId: firstVideo ? firstVideo.id : null,
            currentIndex: firstVideo ? 0 : null,
            canCreatePlaylist: constrained.canCreatePlaylist,
            maxPlaylistCount: MAX_PLAYLIST_COUNT,
          };
        }

        return {
          ...currentState,
          playlists: defaultPlaylists,
          activePlaylistId: defaultActivePlaylistId,
          currentVideoId: defaultInitialVideoId,
          currentIndex: 0,
          canCreatePlaylist: defaultPlaylists.length < MAX_PLAYLIST_COUNT,
          maxPlaylistCount: MAX_PLAYLIST_COUNT,
        };
      },
    },
  ),
);
