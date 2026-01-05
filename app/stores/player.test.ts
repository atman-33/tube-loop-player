import { beforeEach, describe, expect, it, vi } from "vitest";
import type { User } from "~/hooks/use-auth";
import {
  MAX_PLAYLIST_COUNT,
  sanitizePlaylistIdentifiers,
  usePlayerStore,
} from "~/stores/player";
import {
  createDefaultPlaylists,
  defaultActivePlaylistId,
  FAVORITES_PLAYLIST_ID,
} from "~/stores/player/constants";

const createMockPlaylist = (index: number) => ({
  id: `playlist-mock-${index}`,
  name: `Playlist ${index + 1}`,
  items: [],
});

const createPlaylistWithItems = (playlistId: string, ids: string[]) => ({
  id: playlistId,
  name: "Playlist",
  items: ids.map((id, index) => ({ id, title: `Track ${index + 1}` })),
});

const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);

const mockUser: User = {
  id: "user-42",
  name: "Test User",
  email: "test@example.com",
};

const resetStore = () => {
  // Reset to default state
  usePlayerStore.setState(
    {
      playlists: createDefaultPlaylists(),
      activePlaylistId: defaultActivePlaylistId,
      lastNonFavoritesPlaylistId: defaultActivePlaylistId,
      pinnedVideoIds: new Set<string>(),
      pinnedOrder: [],
    },
    false,
  );
};

beforeEach(() => {
  resetStore();
  fetchMock.mockReset();
});

describe("sanitizePlaylistIdentifiers", () => {
  it("deduplicates playlist ids and remaps active playlist", () => {
    const duplicatePlaylists = [
      { id: "duplicate", name: "Playlist 1", items: [] },
      { id: "duplicate", name: "Playlist 2", items: [] },
    ];

    const result = sanitizePlaylistIdentifiers(
      duplicatePlaylists,
      "duplicate",
      "user-123",
    );

    expect(result.didChange).toBe(true);
    expect(new Set(result.playlists.map((playlist) => playlist.id)).size).toBe(
      2,
    );
    result.playlists.forEach((playlist) => {
      expect(playlist.id.startsWith("playlist-user-123-")).toBe(true);
    });
    expect(result.activePlaylistId).toBe(result.playlists[0].id);
  });
});

describe("usePlayerStore playlist limits", () => {
  it("creates sequential playlists until reaching the max", () => {
    const initialPlaylists = usePlayerStore.getState().playlists;
    const newPlaylistId = usePlayerStore.getState().createPlaylist();

    expect(newPlaylistId).toBeTruthy();
    const state = usePlayerStore.getState();
    expect(state.playlists).toHaveLength(initialPlaylists.length + 1);
    expect(state.playlists.at(-1)?.name).toBe("Playlist 4");
    expect(state.activePlaylistId).toBe(newPlaylistId);
  });

  it("prevents creation when max playlist count is reached", () => {
    const fullPlaylists = Array.from(
      { length: MAX_PLAYLIST_COUNT },
      (_, index) => createMockPlaylist(index),
    );
    usePlayerStore.setState((state) => ({
      ...state,
      playlists: fullPlaylists,
      activePlaylistId: fullPlaylists[0].id,
      canCreatePlaylist: false,
    }));

    const result = usePlayerStore.getState().createPlaylist();
    expect(result).toBeNull();
    expect(usePlayerStore.getState().canCreatePlaylist).toBe(false);
  });

  it("selects the nearest playlist when removing the active one", () => {
    const playlists = [
      { ...createMockPlaylist(0) },
      { ...createMockPlaylist(1) },
      { ...createMockPlaylist(2) },
    ];
    usePlayerStore.setState((state) => ({
      ...state,
      playlists,
      activePlaylistId: playlists[1].id,
    }));

    const removed = usePlayerStore.getState().removePlaylist(playlists[1].id);
    const state = usePlayerStore.getState();
    expect(removed).toBe(true);
    expect(state.playlists).toHaveLength(2);
    expect(state.activePlaylistId).toBe(playlists[2].id);
    expect(state.currentVideoId).toBeNull();
    expect(state.currentIndex).toBeNull();
  });

  it("duplicates playlists with copied items", () => {
    usePlayerStore.setState((state) => ({
      ...state,
      playlists: [
        {
          id: "sample",
          name: "Focus",
          items: [{ id: "track-1", title: "Song" }],
        },
      ],
      activePlaylistId: "sample",
    }));

    const duplicatedId = usePlayerStore.getState().duplicatePlaylist("sample");
    const state = usePlayerStore.getState();

    expect(duplicatedId).toBeTruthy();
    expect(state.playlists).toHaveLength(2);
    const duplicated = state.playlists.find(
      (playlist) => playlist.id === duplicatedId,
    );
    expect(duplicated?.items).toEqual([{ id: "track-1", title: "Song" }]);
    expect(duplicated?.items).not.toBe(state.playlists[0].items);
  });

  it("trims overflow playlists via syncPlaylistBounds", () => {
    const overflowPlaylists = Array.from(
      {
        length: MAX_PLAYLIST_COUNT + 2,
      },
      (_, index) => createMockPlaylist(index),
    );
    usePlayerStore.setState((state) => ({
      ...state,
      playlists: overflowPlaylists,
      activePlaylistId: overflowPlaylists[overflowPlaylists.length - 1].id,
    }));

    usePlayerStore.getState().syncPlaylistBounds();
    const state = usePlayerStore.getState();
    expect(state.playlists).toHaveLength(MAX_PLAYLIST_COUNT);
    expect(state.canCreatePlaylist).toBe(false);
    expect(state.activePlaylistId).toBe(state.playlists[0].id);
  });
});

describe("usePlayerStore shuffle behavior", () => {
  it("plays each track once before repeating when shuffle is enabled", () => {
    const playlistId = "playlist-shuffle";
    const playlist = createPlaylistWithItems(playlistId, [
      "track-1",
      "track-2",
      "track-3",
    ]);

    usePlayerStore.setState((state) => ({
      ...state,
      playlists: [playlist],
      activePlaylistId: playlistId,
      currentVideoId: playlist.items[0]?.id ?? null,
      currentIndex: 0,
    }));

    const randomSpy = vi.spyOn(Math, "random").mockReturnValue(0);

    try {
      usePlayerStore.getState().toggleShuffle();

      const played: string[] = [];
      for (let index = 0; index < playlist.items.length; index += 1) {
        usePlayerStore.getState().playNext();
        played.push(usePlayerStore.getState().currentVideoId as string);
      }

      expect(new Set(played).size).toBe(playlist.items.length);

      usePlayerStore.getState().playNext();
      const repeated = usePlayerStore.getState().currentVideoId as string;
      expect(repeated).not.toBe(played.at(-1));
      expect(playlist.items.map((item) => item.id)).toContain(repeated);
    } finally {
      randomSpy.mockRestore();
    }
  });

  it("resets the shuffle queue when the active playlist changes", () => {
    const playlistA = createPlaylistWithItems("playlist-a", ["a-1", "a-2"]);
    const playlistB = createPlaylistWithItems("playlist-b", ["b-1", "b-2"]);

    usePlayerStore.setState((state) => ({
      ...state,
      playlists: [playlistA, playlistB],
      activePlaylistId: playlistA.id,
      currentVideoId: playlistA.items[0]?.id ?? null,
      currentIndex: 0,
    }));

    const randomSpy = vi.spyOn(Math, "random").mockReturnValue(0);

    try {
      usePlayerStore.getState().toggleShuffle();
      usePlayerStore.getState().playNext();

      usePlayerStore.getState().setActivePlaylist(playlistB.id);

      const initialVideoId = usePlayerStore.getState().currentVideoId;
      expect(initialVideoId).toBe(playlistB.items[0]?.id);

      usePlayerStore.getState().playNext();
      const nextVideoId = usePlayerStore.getState().currentVideoId;
      expect(nextVideoId).toBe(playlistB.items[1]?.id);
    } finally {
      randomSpy.mockRestore();
    }
  });

  it("prioritizes newly added tracks before repeating previously played items", () => {
    const playlistId = "playlist-edit";
    const playlist = createPlaylistWithItems(playlistId, ["base-1", "base-2"]);

    usePlayerStore.setState((state) => ({
      ...state,
      playlists: [playlist],
      activePlaylistId: playlistId,
      currentVideoId: playlist.items[0]?.id ?? null,
      currentIndex: 0,
    }));

    const randomSpy = vi.spyOn(Math, "random").mockReturnValue(0);

    try {
      usePlayerStore.getState().toggleShuffle();
      usePlayerStore.getState().playNext();

      usePlayerStore
        .getState()
        .addToPlaylist({ id: "base-3", title: "Track 3" }, playlistId);

      const upcoming: string[] = [];
      usePlayerStore.getState().playNext();
      upcoming.push(usePlayerStore.getState().currentVideoId as string);
      usePlayerStore.getState().playNext();
      upcoming.push(usePlayerStore.getState().currentVideoId as string);

      expect(new Set(upcoming).size).toBe(2);
      expect(upcoming).toContain("base-3");
    } finally {
      randomSpy.mockRestore();
    }
  });
});

describe("usePlayerStore Favorites consistency", () => {
  it("keeps currentVideoId inside Favorites when loadUserData sets Favorites active", () => {
    const playlist = createPlaylistWithItems("playlist-1", [
      "alpha-00001",
      "beta-00002",
    ]);

    usePlayerStore.setState((state) => ({
      ...state,
      playlists: [playlist],
      pinnedVideoIds: new Set(["beta-00002"]),
      pinnedOrder: ["beta-00002"],
      activePlaylistId: FAVORITES_PLAYLIST_ID,
      currentVideoId: null,
      currentIndex: null,
      isPlaying: false,
    }));

    usePlayerStore.getState().loadUserData({
      playlists: [playlist],
      activePlaylistId: FAVORITES_PLAYLIST_ID,
      loopMode: "all",
      isShuffle: false,
    });

    const next = usePlayerStore.getState();
    expect(next.activePlaylistId).toBe(FAVORITES_PLAYLIST_ID);
    expect(next.currentVideoId).toBe("beta-00002");
    expect(next.currentIndex).toBe(0);
  });

  it("updates currentVideoId when setPinnedSongs overwrites pinned order while Favorites is active", () => {
    const playlist = createPlaylistWithItems("playlist-1", [
      "alpha-00001",
      "beta-00002",
      "gamma-00003",
    ]);

    usePlayerStore.setState((state) => ({
      ...state,
      playlists: [playlist],
      activePlaylistId: FAVORITES_PLAYLIST_ID,
      pinnedVideoIds: new Set(["beta-00002"]),
      pinnedOrder: ["beta-00002"],
      currentVideoId: "beta-00002",
      currentIndex: 0,
      isPlaying: false,
    }));

    // Simulate server load overwriting pinned songs
    usePlayerStore
      .getState()
      .setPinnedSongs(new Set(["gamma-00003"]), ["gamma-00003"]);

    const next = usePlayerStore.getState();
    expect(next.activePlaylistId).toBe(FAVORITES_PLAYLIST_ID);
    expect(next.currentVideoId).toBe("gamma-00003");
    expect(next.currentIndex).toBe(0);
    expect(next.isPlaying).toBe(false);
  });
});

describe("syncToServer", () => {
  it("clamps payload to the playlist ceiling before syncing", async () => {
    const overflowPlaylists = Array.from(
      {
        length: MAX_PLAYLIST_COUNT + 1,
      },
      (_, index) => ({
        id: `playlist-${index}`,
        name: `Playlist ${index + 1}`,
        items: [],
      }),
    );

    usePlayerStore.setState((state) => ({
      ...state,
      playlists: overflowPlaylists,
      activePlaylistId: overflowPlaylists[overflowPlaylists.length - 1].id,
      user: mockUser,
      canCreatePlaylist: false,
    }));

    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ success: false }),
    } as unknown as Response);

    await usePlayerStore.getState().syncToServer();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const payload = JSON.parse(
      (fetchMock.mock.calls[0]?.[1]?.body as string) ?? "{}",
    );
    expect(payload.playlists).toHaveLength(MAX_PLAYLIST_COUNT);
    expect(usePlayerStore.getState().playlists).toHaveLength(
      MAX_PLAYLIST_COUNT,
    );
    expect(usePlayerStore.getState().activePlaylistId).toBe(
      usePlayerStore.getState().playlists[0]?.id ?? "",
    );
    expect(usePlayerStore.getState().canCreatePlaylist).toBe(false);
  });

  it("preserves Favorites as the active playlist while syncing", async () => {
    const playlistA = createPlaylistWithItems("playlist-a", ["a-1"]);
    const playlistB = createPlaylistWithItems("playlist-b", ["b-1"]);

    usePlayerStore.setState((state) => ({
      ...state,
      playlists: [playlistA, playlistB],
      user: mockUser,
      activePlaylistId: FAVORITES_PLAYLIST_ID,
      lastNonFavoritesPlaylistId: playlistB.id,
      canCreatePlaylist: true,
    }));

    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          playlists: [playlistA, playlistB],
          activePlaylistId: playlistB.id,
          loopMode: "all",
          isShuffle: false,
        },
      }),
    } as unknown as Response);

    await usePlayerStore.getState().syncToServer();

    const payload = JSON.parse(
      (fetchMock.mock.calls[0]?.[1]?.body as string) ?? "{}",
    ) as { activePlaylistId?: string };
    expect(payload.activePlaylistId).toBe(playlistB.id);

    expect(usePlayerStore.getState().activePlaylistId).toBe(
      FAVORITES_PLAYLIST_ID,
    );
  });
});
