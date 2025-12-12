import { describe, expect, it } from "vitest";
import {
  deriveFavoritesPlaylist,
  injectFavoritesPlaylist,
} from "~/lib/player/favorites-playlist";
import type { Playlist } from "~/lib/player/types";
import { FAVORITES_PLAYLIST_ID } from "~/stores/player/constants";

describe("deriveFavoritesPlaylist", () => {
  it("creates an empty Favorites playlist when no songs are pinned", () => {
    const playlists: Playlist[] = [
      {
        id: "playlist-1",
        name: "Playlist 1",
        items: [
          { id: "video-a", title: "Video A" },
          { id: "video-b", title: "Video B" },
        ],
      },
    ];

    const favorites = deriveFavoritesPlaylist([], playlists);

    expect(favorites.id).toBe(FAVORITES_PLAYLIST_ID);
    expect(favorites.name).toBe("Favorites");
    expect(favorites.items).toEqual([]);
  });

  it("includes pinned songs from a single playlist", () => {
    const playlists: Playlist[] = [
      {
        id: "playlist-1",
        name: "Playlist 1",
        items: [
          { id: "video-a", title: "Video A" },
          { id: "video-b", title: "Video B" },
          { id: "video-c", title: "Video C" },
        ],
      },
    ];

    const pinnedOrder = ["video-a", "video-c"];
    const favorites = deriveFavoritesPlaylist(pinnedOrder, playlists);

    expect(favorites.items).toHaveLength(2);
    expect(favorites.items[0].id).toBe("video-a");
    expect(favorites.items[1].id).toBe("video-c");
  });

  it("includes pinned songs from multiple playlists", () => {
    const playlists: Playlist[] = [
      {
        id: "playlist-1",
        name: "Playlist 1",
        items: [
          { id: "video-a", title: "Video A" },
          { id: "video-b", title: "Video B" },
        ],
      },
      {
        id: "playlist-2",
        name: "Playlist 2",
        items: [
          { id: "video-c", title: "Video C" },
          { id: "video-d", title: "Video D" },
        ],
      },
    ];

    const pinnedOrder = ["video-b", "video-d", "video-a"];
    const favorites = deriveFavoritesPlaylist(pinnedOrder, playlists);

    expect(favorites.items).toHaveLength(3);
    expect(favorites.items[0].id).toBe("video-b");
    expect(favorites.items[1].id).toBe("video-d");
    expect(favorites.items[2].id).toBe("video-a");
  });

  it("respects the pinned order", () => {
    const playlists: Playlist[] = [
      {
        id: "playlist-1",
        name: "Playlist 1",
        items: [
          { id: "video-a", title: "Video A" },
          { id: "video-b", title: "Video B" },
          { id: "video-c", title: "Video C" },
        ],
      },
    ];

    const pinnedOrder = ["video-c", "video-a", "video-b"];
    const favorites = deriveFavoritesPlaylist(pinnedOrder, playlists);

    expect(favorites.items.map((item) => item.id)).toEqual([
      "video-c",
      "video-a",
      "video-b",
    ]);
  });

  it("handles pinned videos that no longer exist in any playlist", () => {
    const playlists: Playlist[] = [
      {
        id: "playlist-1",
        name: "Playlist 1",
        items: [{ id: "video-a", title: "Video A" }],
      },
    ];

    const pinnedOrder = ["video-a", "video-deleted", "video-b"];
    const favorites = deriveFavoritesPlaylist(pinnedOrder, playlists);

    expect(favorites.items).toHaveLength(1);
    expect(favorites.items[0].id).toBe("video-a");
  });

  it("uses the first occurrence of a video when it appears in multiple playlists", () => {
    const playlists: Playlist[] = [
      {
        id: "playlist-1",
        name: "Playlist 1",
        items: [{ id: "video-a", title: "Video A from Playlist 1" }],
      },
      {
        id: "playlist-2",
        name: "Playlist 2",
        items: [{ id: "video-a", title: "Video A from Playlist 2" }],
      },
    ];

    const pinnedOrder = ["video-a"];
    const favorites = deriveFavoritesPlaylist(pinnedOrder, playlists);

    expect(favorites.items).toHaveLength(1);
    expect(favorites.items[0].title).toBe("Video A from Playlist 1");
  });
});

describe("injectFavoritesPlaylist", () => {
  it("inserts Favorites at position 0", () => {
    const playlists: Playlist[] = [
      { id: "playlist-1", name: "Playlist 1", items: [] },
      { id: "playlist-2", name: "Playlist 2", items: [] },
    ];

    const favoritesPlaylist: Playlist = {
      id: FAVORITES_PLAYLIST_ID,
      name: "Favorites",
      items: [],
    };

    const result = injectFavoritesPlaylist(playlists, favoritesPlaylist);

    expect(result).toHaveLength(3);
    expect(result[0].id).toBe(FAVORITES_PLAYLIST_ID);
    expect(result[1].id).toBe("playlist-1");
    expect(result[2].id).toBe("playlist-2");
  });

  it("does not mutate the original playlists array", () => {
    const playlists: Playlist[] = [
      { id: "playlist-1", name: "Playlist 1", items: [] },
    ];

    const favoritesPlaylist: Playlist = {
      id: FAVORITES_PLAYLIST_ID,
      name: "Favorites",
      items: [],
    };

    const result = injectFavoritesPlaylist(playlists, favoritesPlaylist);

    expect(playlists).toHaveLength(1);
    expect(result).toHaveLength(2);
  });
});
