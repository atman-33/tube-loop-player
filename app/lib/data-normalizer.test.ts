/** biome-ignore-all lint/suspicious/noExplicitAny: <> */
import { describe, expect, it } from "vitest";
import {
  isValidUserPlaylistData,
  normalizeUserPlaylistData,
  type UserPlaylistData,
} from "./data-normalizer";

describe("Data Normalizer", () => {
  describe("normalizeUserPlaylistData", () => {
    it("should normalize basic playlist data preserving order", () => {
      const input: UserPlaylistData = {
        playlists: [
          {
            id: "playlist-2",
            name: "Second Playlist",
            items: [
              { id: "video-b", title: "Video B" },
              { id: "video-a", title: "Video A" },
            ],
          },
          {
            id: "playlist-1",
            name: "First Playlist",
            items: [
              { id: "video-d", title: "Video D" },
              { id: "video-c", title: "Video C" },
            ],
          },
        ],
        activePlaylistId: "playlist-1",
        loopMode: "all",
        isShuffle: false,
      };

      const result = normalizeUserPlaylistData(input);

      expect(result.playlists).toHaveLength(2);
      // Playlists should preserve input order
      expect(result.playlists[0].id).toBe("playlist-2");
      expect(result.playlists[1].id).toBe("playlist-1");

      // Items within each playlist should preserve input order
      expect(result.playlists[0].items[0].id).toBe("video-b");
      expect(result.playlists[0].items[1].id).toBe("video-a");
      expect(result.playlists[1].items[0].id).toBe("video-d");
      expect(result.playlists[1].items[1].id).toBe("video-c");
    });

    it("should convert undefined titles to empty strings", () => {
      const input: UserPlaylistData = {
        playlists: [
          {
            id: "playlist-1",
            name: "Test Playlist",
            items: [
              { id: "video-1", title: undefined },
              { id: "video-2", title: "Has Title" },
              { id: "video-3" }, // No title property
            ],
          },
        ],
        activePlaylistId: "playlist-1",
        loopMode: "one",
        isShuffle: true,
      };

      const result = normalizeUserPlaylistData(input);

      expect(result.playlists[0].items[0].title).toBe("");
      expect(result.playlists[0].items[1].title).toBe("Has Title");
      expect(result.playlists[0].items[2].title).toBe("");
    });

    it("should handle empty playlists array", () => {
      const input: UserPlaylistData = {
        playlists: [],
        activePlaylistId: "",
        loopMode: "all",
        isShuffle: false,
      };

      const result = normalizeUserPlaylistData(input);

      expect(result.playlists).toHaveLength(0);
      expect(result.activePlaylistId).toBe("");
    });

    it("should handle playlists with empty items arrays", () => {
      const input: UserPlaylistData = {
        playlists: [
          {
            id: "empty-playlist",
            name: "Empty Playlist",
            items: [],
          },
        ],
        activePlaylistId: "empty-playlist",
        loopMode: "all",
        isShuffle: false,
      };

      const result = normalizeUserPlaylistData(input);

      expect(result.playlists).toHaveLength(1);
      expect(result.playlists[0].items).toHaveLength(0);
    });

    it("should normalize boolean isShuffle values", () => {
      const input: UserPlaylistData = {
        playlists: [],
        activePlaylistId: "",
        loopMode: "all",
        isShuffle: false,
      };

      const result = normalizeUserPlaylistData(input);
      expect(result.isShuffle).toBe(false);

      const inputTrue: UserPlaylistData = {
        ...input,
        isShuffle: true,
      };

      const resultTrue = normalizeUserPlaylistData(inputTrue);
      expect(resultTrue.isShuffle).toBe(true);
    });

    it("should handle missing or undefined activePlaylistId", () => {
      const input = {
        playlists: [],
        loopMode: "all" as const,
        isShuffle: false,
      } as unknown as UserPlaylistData;

      const result = normalizeUserPlaylistData(input);
      expect(result.activePlaylistId).toBe("");
    });

    it("should handle missing or undefined loopMode", () => {
      const input = {
        playlists: [],
        activePlaylistId: "test",
        isShuffle: false,
      } as unknown as UserPlaylistData;

      const result = normalizeUserPlaylistData(input);
      expect(result.loopMode).toBe("all");
    });

    it("should throw error for null or undefined input", () => {
      expect(() => normalizeUserPlaylistData(null as any)).toThrow(
        "Invalid data: expected UserPlaylistData object",
      );
      expect(() => normalizeUserPlaylistData(undefined as any)).toThrow(
        "Invalid data: expected UserPlaylistData object",
      );
    });

    it("should throw error for non-object input", () => {
      expect(() => normalizeUserPlaylistData("string" as any)).toThrow(
        "Invalid data: expected UserPlaylistData object",
      );
      expect(() => normalizeUserPlaylistData(123 as any)).toThrow(
        "Invalid data: expected UserPlaylistData object",
      );
    });

    it("should throw error for non-array playlists", () => {
      const input = {
        playlists: "not-array",
        activePlaylistId: "test",
        loopMode: "all",
        isShuffle: false,
      } as any;

      expect(() => normalizeUserPlaylistData(input)).toThrow(
        "Invalid data: playlists must be an array",
      );
    });

    it("should throw error for invalid playlist structure", () => {
      const input = {
        playlists: [
          {
            id: "valid-playlist",
            name: "Valid",
            items: [],
          },
          {
            // Missing required fields
            name: "Invalid",
          },
        ],
        activePlaylistId: "test",
        loopMode: "all",
        isShuffle: false,
      } as any;

      expect(() => normalizeUserPlaylistData(input)).toThrow(
        "Invalid playlist: expected Playlist object",
      );
    });

    it("should throw error for playlist with non-array items", () => {
      const input = {
        playlists: [
          {
            id: "test-playlist",
            name: "Test",
            items: "not-array",
          },
        ],
        activePlaylistId: "test",
        loopMode: "all",
        isShuffle: false,
      } as any;

      expect(() => normalizeUserPlaylistData(input)).toThrow(
        "Invalid playlist: items must be an array",
      );
    });

    it("should throw error for invalid playlist item structure", () => {
      const input = {
        playlists: [
          {
            id: "test-playlist",
            name: "Test",
            items: [
              { id: "valid-item", title: "Valid" },
              { title: "Missing ID" }, // Missing id field
            ],
          },
        ],
        activePlaylistId: "test",
        loopMode: "all",
        isShuffle: false,
      } as any;

      expect(() => normalizeUserPlaylistData(input)).toThrow(
        "Invalid playlist item: expected PlaylistItem object",
      );
    });

    it("should handle complex sorting scenarios", () => {
      const input: UserPlaylistData = {
        playlists: [
          {
            id: "z-playlist",
            name: "Z Playlist",
            items: [
              { id: "z-video", title: "Z Video" },
              { id: "a-video", title: "A Video" },
              { id: "m-video", title: "M Video" },
            ],
          },
          {
            id: "a-playlist",
            name: "A Playlist",
            items: [
              { id: "c-video", title: "C Video" },
              { id: "b-video", title: "B Video" },
            ],
          },
          {
            id: "m-playlist",
            name: "M Playlist",
            items: [],
          },
        ],
        activePlaylistId: "z-playlist",
        loopMode: "one",
        isShuffle: true,
      };

      const result = normalizeUserPlaylistData(input);

      // Verify playlist sorting
      expect(result.playlists.map((p) => p.id)).toEqual([
        "a-playlist",
        "m-playlist",
        "z-playlist",
      ]);

      // Verify item sorting within each playlist
      expect(result.playlists[0].items.map((i) => i.id)).toEqual([
        "b-video",
        "c-video",
      ]);
      expect(result.playlists[1].items).toHaveLength(0);
      expect(result.playlists[2].items.map((i) => i.id)).toEqual([
        "a-video",
        "m-video",
        "z-video",
      ]);
    });

    it("should preserve all other properties correctly", () => {
      const input: UserPlaylistData = {
        playlists: [
          {
            id: "test-playlist",
            name: "Test Playlist Name",
            items: [{ id: "video-1", title: "Video Title 1" }],
          },
        ],
        activePlaylistId: "test-playlist",
        loopMode: "one",
        isShuffle: true,
      };

      const result = normalizeUserPlaylistData(input);

      expect(result.activePlaylistId).toBe("test-playlist");
      expect(result.loopMode).toBe("one");
      expect(result.isShuffle).toBe(true);
      expect(result.playlists[0].name).toBe("Test Playlist Name");
      expect(result.playlists[0].items[0].title).toBe("Video Title 1");
    });
  });

  describe("isValidUserPlaylistData", () => {
    it("should return true for valid UserPlaylistData", () => {
      const validData: UserPlaylistData = {
        playlists: [
          {
            id: "playlist-1",
            name: "Test Playlist",
            items: [
              { id: "video-1", title: "Video 1" },
              { id: "video-2" }, // title can be undefined
            ],
          },
        ],
        activePlaylistId: "playlist-1",
        loopMode: "all",
        isShuffle: false,
      };

      expect(isValidUserPlaylistData(validData)).toBe(true);
    });

    it("should return false for null or undefined", () => {
      expect(isValidUserPlaylistData(null)).toBe(false);
      expect(isValidUserPlaylistData(undefined)).toBe(false);
    });

    it("should return false for non-object types", () => {
      expect(isValidUserPlaylistData("string")).toBe(false);
      expect(isValidUserPlaylistData(123)).toBe(false);
      expect(isValidUserPlaylistData([])).toBe(false);
    });

    it("should return false for missing required properties", () => {
      expect(isValidUserPlaylistData({})).toBe(false);
      expect(
        isValidUserPlaylistData({
          playlists: [],
        }),
      ).toBe(false);
      expect(
        isValidUserPlaylistData({
          playlists: [],
          activePlaylistId: "test",
        }),
      ).toBe(false);
    });

    it("should return false for invalid property types", () => {
      expect(
        isValidUserPlaylistData({
          playlists: "not-array",
          activePlaylistId: "test",
          loopMode: "all",
          isShuffle: false,
        }),
      ).toBe(false);

      expect(
        isValidUserPlaylistData({
          playlists: [],
          activePlaylistId: 123,
          loopMode: "all",
          isShuffle: false,
        }),
      ).toBe(false);

      expect(
        isValidUserPlaylistData({
          playlists: [],
          activePlaylistId: "test",
          loopMode: "invalid",
          isShuffle: false,
        }),
      ).toBe(false);

      expect(
        isValidUserPlaylistData({
          playlists: [],
          activePlaylistId: "test",
          loopMode: "all",
          isShuffle: "not-boolean",
        }),
      ).toBe(false);
    });

    it("should return false for invalid playlist structure", () => {
      expect(
        isValidUserPlaylistData({
          playlists: [
            {
              // Missing id
              name: "Test",
              items: [],
            },
          ],
          activePlaylistId: "test",
          loopMode: "all",
          isShuffle: false,
        }),
      ).toBe(false);

      expect(
        isValidUserPlaylistData({
          playlists: [
            {
              id: "test",
              name: "Test",
              items: "not-array",
            },
          ],
          activePlaylistId: "test",
          loopMode: "all",
          isShuffle: false,
        }),
      ).toBe(false);
    });

    it("should return false for invalid playlist item structure", () => {
      expect(
        isValidUserPlaylistData({
          playlists: [
            {
              id: "test",
              name: "Test",
              items: [
                {
                  // Missing id
                  title: "Test Video",
                },
              ],
            },
          ],
          activePlaylistId: "test",
          loopMode: "all",
          isShuffle: false,
        }),
      ).toBe(false);

      expect(
        isValidUserPlaylistData({
          playlists: [
            {
              id: "test",
              name: "Test",
              items: [
                {
                  id: 123, // Wrong type
                  title: "Test Video",
                },
              ],
            },
          ],
          activePlaylistId: "test",
          loopMode: "all",
          isShuffle: false,
        }),
      ).toBe(false);

      expect(
        isValidUserPlaylistData({
          playlists: [
            {
              id: "test",
              name: "Test",
              items: [
                {
                  id: "video-1",
                  title: 123, // Wrong type
                },
              ],
            },
          ],
          activePlaylistId: "test",
          loopMode: "all",
          isShuffle: false,
        }),
      ).toBe(false);
    });

    it("should return true for empty playlists and items", () => {
      expect(
        isValidUserPlaylistData({
          playlists: [],
          activePlaylistId: "",
          loopMode: "all",
          isShuffle: false,
        }),
      ).toBe(true);

      expect(
        isValidUserPlaylistData({
          playlists: [
            {
              id: "empty",
              name: "Empty Playlist",
              items: [],
            },
          ],
          activePlaylistId: "empty",
          loopMode: "one",
          isShuffle: true,
        }),
      ).toBe(true);
    });
  });

  describe("edge cases and performance", () => {
    it("should handle large datasets efficiently", () => {
      const largeData: UserPlaylistData = {
        playlists: Array.from({ length: 100 }, (_, i) => ({
          id: `playlist-${String(i).padStart(3, "0")}`,
          name: `Playlist ${i}`,
          items: Array.from({ length: 100 }, (_, j) => ({
            id: `video-${i}-${String(j).padStart(3, "0")}`,
            title: `Video ${i}-${j}`,
          })),
        })),
        activePlaylistId: "playlist-050",
        loopMode: "all",
        isShuffle: false,
      };

      const startTime = Date.now();
      const result = normalizeUserPlaylistData(largeData);
      const endTime = Date.now();

      // Should complete within reasonable time (less than 100ms for this size)
      expect(endTime - startTime).toBeLessThan(100);
      expect(result.playlists).toHaveLength(100);
      expect(result.playlists[0].items).toHaveLength(100);
    });

    it("should handle special characters in IDs and titles", () => {
      const input: UserPlaylistData = {
        playlists: [
          {
            id: "playlist-with-special-chars-!@#$%^&*()",
            name: "Playlist with émojis 🎵🎶",
            items: [
              { id: "video-with-unicode-🎵", title: "Title with émojis 🎶" },
              { id: 'video-with-quotes-"test"', title: "Title with 'quotes'" },
            ],
          },
        ],
        activePlaylistId: "playlist-with-special-chars-!@#$%^&*()",
        loopMode: "all",
        isShuffle: false,
      };

      const result = normalizeUserPlaylistData(input);

      expect(result.playlists[0].id).toBe(
        "playlist-with-special-chars-!@#$%^&*()",
      );
      expect(result.playlists[0].name).toBe("Playlist with émojis 🎵🎶");

      // Items are sorted by ID, so find them by ID
      const unicodeItem = result.playlists[0].items.find(
        (item) => item.id === "video-with-unicode-🎵",
      );
      const quotesItem = result.playlists[0].items.find(
        (item) => item.id === 'video-with-quotes-"test"',
      );

      expect(unicodeItem?.title).toBe("Title with émojis 🎶");
      expect(quotesItem?.title).toBe("Title with 'quotes'");
    });

    it("should maintain consistent ordering across multiple normalizations", () => {
      const input: UserPlaylistData = {
        playlists: [
          {
            id: "z-playlist",
            name: "Z Playlist",
            items: [
              { id: "z-video", title: "Z Video" },
              { id: "a-video", title: "A Video" },
              { id: "m-video", title: "M Video" },
            ],
          },
          {
            id: "a-playlist",
            name: "A Playlist",
            items: [
              { id: "c-video", title: "C Video" },
              { id: "b-video", title: "B Video" },
            ],
          },
        ],
        activePlaylistId: "z-playlist",
        loopMode: "one",
        isShuffle: true,
      };

      const result1 = normalizeUserPlaylistData(input);
      const result2 = normalizeUserPlaylistData(input);

      // Results should be identical
      expect(JSON.stringify(result1)).toBe(JSON.stringify(result2));
    });

    it("should handle empty string IDs and names gracefully", () => {
      const input: UserPlaylistData = {
        playlists: [
          {
            id: "",
            name: "",
            items: [{ id: "", title: "" }],
          },
        ],
        activePlaylistId: "",
        loopMode: "all",
        isShuffle: false,
      };

      const result = normalizeUserPlaylistData(input);

      expect(result.playlists[0].id).toBe("");
      expect(result.playlists[0].name).toBe("");
      expect(result.playlists[0].items[0].id).toBe("");
      expect(result.playlists[0].items[0].title).toBe("");
    });
  });
});
