import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { UserPlaylistData } from "./data-normalizer";
import {
  mergePlaylistsForSync,
  sanitizeUserPlaylistData,
} from "./playlist.server";
import { MAX_PLAYLIST_COUNT } from "./playlist-limits";

const buildPlaylist = (index: number, withItem = false) => ({
  id: `playlist-${index}`,
  name: `Playlist ${index}`,
  items: withItem ? [{ id: `video-${index}`, title: `Track ${index}` }] : [],
});

describe("playlist server helpers", () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it("sanitizes oversized payloads by trimming to the max playlist count", () => {
    const oversized: UserPlaylistData = {
      playlists: Array.from({ length: MAX_PLAYLIST_COUNT + 2 }, (_, index) =>
        buildPlaylist(index + 1),
      ),
      activePlaylistId: "playlist-1",
      loopMode: "all",
      isShuffle: false,
    };

    const { data, didChange } = sanitizeUserPlaylistData(oversized, "user-123");

    expect(data.playlists).toHaveLength(MAX_PLAYLIST_COUNT);
    expect(didChange).toBe(true);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("exceeded max playlist count"),
    );
  });

  it("merges local playlists while respecting the max limit", () => {
    const existing: UserPlaylistData = {
      playlists: Array.from({ length: MAX_PLAYLIST_COUNT - 1 }, (_, index) =>
        buildPlaylist(index + 1, index === 0),
      ),
      activePlaylistId: "playlist-1",
      loopMode: "all",
      isShuffle: false,
    };

    const cookieData: UserPlaylistData = {
      playlists: [
        {
          id: "cookie-1",
          name: "Focus",
          items: [{ id: "focus", title: "Focus" }],
        },
        { id: "cookie-2", name: "Overflow", items: [] },
      ],
      activePlaylistId: "cookie-1",
      loopMode: "all",
      isShuffle: false,
    };

    const merged = mergePlaylistsForSync(existing, cookieData, "user-abc");

    expect(merged.playlists).toHaveLength(MAX_PLAYLIST_COUNT);
    expect(merged.playlists.some((playlist) => playlist.name === "Focus")).toBe(
      true,
    );
    expect(
      merged.playlists.some((playlist) => playlist.name === "Overflow"),
    ).toBe(false);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("reached max playlist count"),
    );
  });

  it("drops overflow playlists when existing data already exceeds the limit", () => {
    const oversizedExisting: UserPlaylistData = {
      playlists: Array.from({ length: MAX_PLAYLIST_COUNT + 3 }, (_, index) =>
        buildPlaylist(index + 1),
      ),
      activePlaylistId: "playlist-1",
      loopMode: "all",
      isShuffle: false,
    };

    const merged = mergePlaylistsForSync(
      oversizedExisting,
      { ...oversizedExisting, playlists: [] },
      "user-overflow",
    );

    expect(merged.playlists).toHaveLength(MAX_PLAYLIST_COUNT);
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("dropping"));
  });
});
