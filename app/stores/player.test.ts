import { beforeEach, describe, expect, it, vi } from "vitest";
import type { User } from "~/hooks/use-auth";
import {
  MAX_PLAYLIST_COUNT,
  sanitizePlaylistIdentifiers,
  usePlayerStore,
} from "~/stores/player";

const createMockPlaylist = (index: number) => ({
  id: `playlist-mock-${index}`,
  name: `Playlist ${index + 1}`,
  items: [],
});

const initialState = usePlayerStore.getState();
const fetchMock = vi.fn();
vi.stubGlobal("fetch", fetchMock);

const mockUser: User = {
  id: "user-42",
  name: "Test User",
  email: "test@example.com",
};

const resetStore = () => {
  usePlayerStore.setState(initialState, true);
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
    const newPlaylistId = usePlayerStore.getState().createPlaylist();

    expect(newPlaylistId).toBeTruthy();
    const state = usePlayerStore.getState();
    expect(state.playlists).toHaveLength(initialState.playlists.length + 1);
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

    fetchMock.mockResolvedValue({ ok: true } as Response);

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
});
