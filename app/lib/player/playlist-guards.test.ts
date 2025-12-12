import { beforeEach, describe, expect, it } from "vitest";
import { usePlayerStore } from "~/stores/player";
import {
  createDefaultPlaylists,
  defaultActivePlaylistId,
  FAVORITES_PLAYLIST_ID,
} from "~/stores/player/constants";

beforeEach(() => {
  // Reset store to clean state before each test
  usePlayerStore.setState(
    {
      playlists: createDefaultPlaylists(),
      activePlaylistId: defaultActivePlaylistId,
      pinnedVideoIds: new Set<string>(),
      pinnedOrder: [],
    },
    false,
  );
});

describe("Playlist Operation Guards", () => {
  describe("removePlaylist", () => {
    it("prevents removal of Favorites playlist", () => {
      const { removePlaylist, getPlaylistsWithFavorites } =
        usePlayerStore.getState();

      const playlistsBefore = getPlaylistsWithFavorites();
      const favoritesExists = playlistsBefore.some(
        (p) => p.id === FAVORITES_PLAYLIST_ID,
      );
      expect(favoritesExists).toBe(true);

      const result = removePlaylist(FAVORITES_PLAYLIST_ID);

      expect(result).toBe(false);
      const playlistsAfter = usePlayerStore
        .getState()
        .getPlaylistsWithFavorites();
      const favoritesStillExists = playlistsAfter.some(
        (p) => p.id === FAVORITES_PLAYLIST_ID,
      );
      expect(favoritesStillExists).toBe(true);
    });

    it("allows removal of regular playlists", () => {
      const { playlists, removePlaylist } = usePlayerStore.getState();
      const targetPlaylistId = playlists[0].id;

      const result = removePlaylist(targetPlaylistId);

      expect(result).toBe(true);
      const playlistsAfter = usePlayerStore.getState().playlists;
      expect(playlistsAfter.some((p) => p.id === targetPlaylistId)).toBe(false);
    });
  });

  describe("renamePlaylist", () => {
    it("prevents renaming of Favorites playlist", () => {
      const { renamePlaylist } = usePlayerStore.getState();

      renamePlaylist(FAVORITES_PLAYLIST_ID, "New Name");

      const favorites = usePlayerStore.getState().getFavoritesPlaylist();
      expect(favorites.name).toBe("Favorites");
    });

    it("allows renaming of regular playlists", () => {
      const { playlists, renamePlaylist } = usePlayerStore.getState();
      const targetPlaylistId = playlists[0].id;
      const newName = "Renamed Playlist";

      renamePlaylist(targetPlaylistId, newName);

      const updatedPlaylist = usePlayerStore
        .getState()
        .playlists.find((p) => p.id === targetPlaylistId);
      expect(updatedPlaylist?.name).toBe(newName);
    });
  });

  describe("removeFromPlaylist with Favorites", () => {
    it("unpins song when removed from Favorites playlist", () => {
      const { togglePinnedSong, removeFromPlaylist } =
        usePlayerStore.getState();

      // Pin a song from the first playlist
      const firstPlaylist = usePlayerStore.getState().playlists[0];
      const videoId = firstPlaylist.items[0].id;

      togglePinnedSong(videoId);
      expect(usePlayerStore.getState().isPinned(videoId)).toBe(true);

      // Remove from Favorites (which should unpin it)
      removeFromPlaylist(0, FAVORITES_PLAYLIST_ID);

      expect(usePlayerStore.getState().isPinned(videoId)).toBe(false);
    });

    it("does not affect source playlist when removed from Favorites", () => {
      const { togglePinnedSong, removeFromPlaylist, playlists } =
        usePlayerStore.getState();

      const firstPlaylist = playlists[0];
      const videoId = firstPlaylist.items[0].id;
      const itemCountBefore = firstPlaylist.items.length;

      togglePinnedSong(videoId);
      removeFromPlaylist(0, FAVORITES_PLAYLIST_ID);

      const updatedPlaylist = usePlayerStore
        .getState()
        .playlists.find((p) => p.id === firstPlaylist.id);
      expect(updatedPlaylist?.items.length).toBe(itemCountBefore);
      expect(updatedPlaylist?.items.some((item) => item.id === videoId)).toBe(
        true,
      );
    });
  });

  describe("reorderPlaylist with Favorites", () => {
    it("updates pinnedOrder when reordering Favorites playlist", () => {
      const { togglePinnedSong, reorderPlaylist, addToPlaylist, playlists } =
        usePlayerStore.getState();

      // Add more items to the first playlist
      const firstPlaylist = playlists[0];
      addToPlaylist({ id: "video-b", title: "Video B" }, firstPlaylist.id);
      addToPlaylist({ id: "video-c", title: "Video C" }, firstPlaylist.id);

      // Pin multiple songs
      const videoIds = ["video-b", "video-c", firstPlaylist.items[0].id];
      for (const videoId of videoIds) {
        togglePinnedSong(videoId);
      }

      const orderBefore = [...usePlayerStore.getState().pinnedOrder];
      expect(orderBefore).toEqual(videoIds);

      // Reorder: move first to last
      reorderPlaylist(0, 2, FAVORITES_PLAYLIST_ID);

      const orderAfter = usePlayerStore.getState().pinnedOrder;
      expect(orderAfter).toEqual([videoIds[1], videoIds[2], videoIds[0]]);
    });

    it("does not affect regular playlists when reordering Favorites", () => {
      const { togglePinnedSong, reorderPlaylist, playlists, addToPlaylist } =
        usePlayerStore.getState();

      const firstPlaylist = playlists[0];

      // Add more items
      addToPlaylist({ id: "video-b", title: "Video B" }, firstPlaylist.id);
      addToPlaylist({ id: "video-c", title: "Video C" }, firstPlaylist.id);

      const itemsBefore = [...usePlayerStore.getState().playlists[0].items];

      // Pin songs
      const videoIds = ["video-b", "video-c", itemsBefore[0].id];
      for (const videoId of videoIds) {
        togglePinnedSong(videoId);
      }

      // Reorder Favorites
      reorderPlaylist(0, 2, FAVORITES_PLAYLIST_ID);

      // Check that original playlist is unchanged
      const updatedPlaylist = usePlayerStore
        .getState()
        .playlists.find((p) => p.id === firstPlaylist.id);
      expect(updatedPlaylist?.items).toEqual(itemsBefore);
    });
  });

  describe("canCreatePlaylist with Favorites", () => {
    it("does not count Favorites toward playlist limit", () => {
      const { canCreatePlaylist, playlists } = usePlayerStore.getState();

      // Favorites should not affect the count
      const actualPlaylistCount = playlists.length;
      expect(canCreatePlaylist).toBe(actualPlaylistCount < 10);
    });
  });
});
