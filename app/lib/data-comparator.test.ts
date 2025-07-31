/** biome-ignore-all lint/suspicious/noExplicitAny: <> */

/**
 * Unit tests for DataComparator class
 * Tests deep comparison logic for all nested properties in UserPlaylistData
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { DataComparator, dataComparator } from "./data-comparator";
import type { UserPlaylistData } from "./data-normalizer";

describe("DataComparator", () => {
  let comparator: DataComparator;

  beforeEach(() => {
    comparator = new DataComparator();
    vi.clearAllMocks();
  });

  describe("areDataSetsIdentical", () => {
    it("should return true for identical data structures", () => {
      const data: UserPlaylistData = {
        playlists: [
          {
            id: "1",
            name: "Playlist 1",
            items: [
              { id: "item1", title: "Song 1" },
              { id: "item2", title: "Song 2" },
            ],
          },
        ],
        activePlaylistId: "1",
        loopMode: "all",
        isShuffle: false,
      };

      const result = comparator.areDataSetsIdentical(data, data);
      expect(result).toBe(true);
    });

    it("should return true for functionally identical data with different ordering", () => {
      const local: UserPlaylistData = {
        playlists: [
          {
            id: "2",
            name: "Second",
            items: [
              { id: "b", title: "Song B" },
              { id: "a", title: "Song A" },
            ],
          },
          {
            id: "1",
            name: "First",
            items: [{ id: "c", title: "Song C" }],
          },
        ],
        activePlaylistId: "1",
        loopMode: "one",
        isShuffle: true,
      };

      const cloud: UserPlaylistData = {
        playlists: [
          {
            id: "1",
            name: "First",
            items: [{ id: "c", title: "Song C" }],
          },
          {
            id: "2",
            name: "Second",
            items: [
              { id: "a", title: "Song A" },
              { id: "b", title: "Song B" },
            ],
          },
        ],
        activePlaylistId: "1",
        loopMode: "one",
        isShuffle: true,
      };

      const result = comparator.areDataSetsIdentical(local, cloud);
      expect(result).toBe(true);
    });

    it("should return true when undefined titles are compared with empty strings", () => {
      const local: UserPlaylistData = {
        playlists: [
          {
            id: "1",
            name: "Test",
            items: [
              { id: "1", title: undefined },
              { id: "2", title: "Song" },
            ],
          },
        ],
        activePlaylistId: "1",
        loopMode: "all",
        isShuffle: false,
      };

      const cloud: UserPlaylistData = {
        playlists: [
          {
            id: "1",
            name: "Test",
            items: [
              { id: "1", title: "" },
              { id: "2", title: "Song" },
            ],
          },
        ],
        activePlaylistId: "1",
        loopMode: "all",
        isShuffle: false,
      };

      const result = comparator.areDataSetsIdentical(local, cloud);
      expect(result).toBe(true);
    });

    it("should return false for different activePlaylistId", () => {
      const local: UserPlaylistData = {
        playlists: [],
        activePlaylistId: "1",
        loopMode: "all",
        isShuffle: false,
      };

      const cloud: UserPlaylistData = {
        playlists: [],
        activePlaylistId: "2",
        loopMode: "all",
        isShuffle: false,
      };

      const result = comparator.areDataSetsIdentical(local, cloud);
      expect(result).toBe(false);
    });

    it("should return false for different loopMode", () => {
      const local: UserPlaylistData = {
        playlists: [],
        activePlaylistId: "1",
        loopMode: "all",
        isShuffle: false,
      };

      const cloud: UserPlaylistData = {
        playlists: [],
        activePlaylistId: "1",
        loopMode: "one",
        isShuffle: false,
      };

      const result = comparator.areDataSetsIdentical(local, cloud);
      expect(result).toBe(false);
    });

    it("should return false for different isShuffle", () => {
      const local: UserPlaylistData = {
        playlists: [],
        activePlaylistId: "1",
        loopMode: "all",
        isShuffle: false,
      };

      const cloud: UserPlaylistData = {
        playlists: [],
        activePlaylistId: "1",
        loopMode: "all",
        isShuffle: true,
      };

      const result = comparator.areDataSetsIdentical(local, cloud);
      expect(result).toBe(false);
    });

    it("should return false for different number of playlists", () => {
      const local: UserPlaylistData = {
        playlists: [{ id: "1", name: "Playlist 1", items: [] }],
        activePlaylistId: "1",
        loopMode: "all",
        isShuffle: false,
      };

      const cloud: UserPlaylistData = {
        playlists: [
          { id: "1", name: "Playlist 1", items: [] },
          { id: "2", name: "Playlist 2", items: [] },
        ],
        activePlaylistId: "1",
        loopMode: "all",
        isShuffle: false,
      };

      const result = comparator.areDataSetsIdentical(local, cloud);
      expect(result).toBe(false);
    });

    it("should return false for different playlist names", () => {
      const local: UserPlaylistData = {
        playlists: [{ id: "1", name: "Work Music", items: [] }],
        activePlaylistId: "1",
        loopMode: "all",
        isShuffle: false,
      };

      const cloud: UserPlaylistData = {
        playlists: [{ id: "1", name: "Office Music", items: [] }],
        activePlaylistId: "1",
        loopMode: "all",
        isShuffle: false,
      };

      const result = comparator.areDataSetsIdentical(local, cloud);
      expect(result).toBe(false);
    });

    it("should return false for different playlist IDs", () => {
      const local: UserPlaylistData = {
        playlists: [{ id: "1", name: "Music", items: [] }],
        activePlaylistId: "1",
        loopMode: "all",
        isShuffle: false,
      };

      const cloud: UserPlaylistData = {
        playlists: [{ id: "2", name: "Music", items: [] }],
        activePlaylistId: "2",
        loopMode: "all",
        isShuffle: false,
      };

      const result = comparator.areDataSetsIdentical(local, cloud);
      expect(result).toBe(false);
    });

    it("should return false for different number of playlist items", () => {
      const local: UserPlaylistData = {
        playlists: [
          {
            id: "1",
            name: "Music",
            items: [{ id: "1", title: "Song 1" }],
          },
        ],
        activePlaylistId: "1",
        loopMode: "all",
        isShuffle: false,
      };

      const cloud: UserPlaylistData = {
        playlists: [
          {
            id: "1",
            name: "Music",
            items: [
              { id: "1", title: "Song 1" },
              { id: "2", title: "Song 2" },
            ],
          },
        ],
        activePlaylistId: "1",
        loopMode: "all",
        isShuffle: false,
      };

      const result = comparator.areDataSetsIdentical(local, cloud);
      expect(result).toBe(false);
    });

    it("should return false for different playlist item IDs", () => {
      const local: UserPlaylistData = {
        playlists: [
          {
            id: "1",
            name: "Music",
            items: [{ id: "1", title: "Song" }],
          },
        ],
        activePlaylistId: "1",
        loopMode: "all",
        isShuffle: false,
      };

      const cloud: UserPlaylistData = {
        playlists: [
          {
            id: "1",
            name: "Music",
            items: [{ id: "2", title: "Song" }],
          },
        ],
        activePlaylistId: "1",
        loopMode: "all",
        isShuffle: false,
      };

      const result = comparator.areDataSetsIdentical(local, cloud);
      expect(result).toBe(false);
    });

    it("should return false for different playlist item titles", () => {
      const local: UserPlaylistData = {
        playlists: [
          {
            id: "1",
            name: "Music",
            items: [{ id: "1", title: "Song A" }],
          },
        ],
        activePlaylistId: "1",
        loopMode: "all",
        isShuffle: false,
      };

      const cloud: UserPlaylistData = {
        playlists: [
          {
            id: "1",
            name: "Music",
            items: [{ id: "1", title: "Song B" }],
          },
        ],
        activePlaylistId: "1",
        loopMode: "all",
        isShuffle: false,
      };

      const result = comparator.areDataSetsIdentical(local, cloud);
      expect(result).toBe(false);
    });
  });

  describe("edge cases", () => {
    it("should return true for both null/undefined inputs", () => {
      expect(comparator.areDataSetsIdentical(null as any, null as any)).toBe(
        true,
      );
      expect(
        comparator.areDataSetsIdentical(undefined as any, undefined as any),
      ).toBe(true);
    });

    it("should return false when one input is null/undefined", () => {
      const data: UserPlaylistData = {
        playlists: [],
        activePlaylistId: "",
        loopMode: "all",
        isShuffle: false,
      };

      expect(comparator.areDataSetsIdentical(data, null as any)).toBe(false);
      expect(comparator.areDataSetsIdentical(null as any, data)).toBe(false);
      expect(comparator.areDataSetsIdentical(data, undefined as any)).toBe(
        false,
      );
      expect(comparator.areDataSetsIdentical(undefined as any, data)).toBe(
        false,
      );
    });

    it("should return true for empty playlists", () => {
      const data: UserPlaylistData = {
        playlists: [],
        activePlaylistId: "",
        loopMode: "all",
        isShuffle: false,
      };

      const result = comparator.areDataSetsIdentical(data, data);
      expect(result).toBe(true);
    });

    it("should return true for playlists with empty items", () => {
      const data: UserPlaylistData = {
        playlists: [{ id: "1", name: "Empty Playlist", items: [] }],
        activePlaylistId: "1",
        loopMode: "all",
        isShuffle: false,
      };

      const result = comparator.areDataSetsIdentical(data, data);
      expect(result).toBe(true);
    });

    it("should handle malformed data gracefully", () => {
      const consoleWarnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => {});

      const malformedData = {
        playlists: "not an array",
        activePlaylistId: 123,
        loopMode: "invalid",
        isShuffle: "not boolean",
      } as any;

      const validData: UserPlaylistData = {
        playlists: [],
        activePlaylistId: "",
        loopMode: "all",
        isShuffle: false,
      };

      const result = comparator.areDataSetsIdentical(malformedData, validData);
      expect(result).toBe(false);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "Invalid data structure detected during comparison",
      );

      consoleWarnSpy.mockRestore();
    });

    it("should handle large datasets efficiently", () => {
      const createLargeDataset = (size: number): UserPlaylistData => ({
        playlists: Array.from({ length: size }, (_, i) => ({
          id: `playlist-${i}`,
          name: `Playlist ${i}`,
          items: Array.from({ length: 10 }, (_, j) => ({
            id: `item-${i}-${j}`,
            title: `Song ${i}-${j}`,
          })),
        })),
        activePlaylistId: "playlist-0",
        loopMode: "all",
        isShuffle: false,
      });

      const largeData = createLargeDataset(50); // 50 playlists with 10 items each
      const startTime = performance.now();

      const result = comparator.areDataSetsIdentical(largeData, largeData);

      const duration = performance.now() - startTime;

      expect(result).toBe(true);
      expect(duration).toBeLessThan(100); // Should complete within 100ms
    });
  });

  describe("error handling and fallback mechanisms", () => {
    it("should return false for invalid data structures", () => {
      const consoleWarnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => {});

      const invalidLocal = {
        playlists: null,
        activePlaylistId: "",
        loopMode: "all",
        isShuffle: false,
      } as any;

      const validData: UserPlaylistData = {
        playlists: [],
        activePlaylistId: "",
        loopMode: "all",
        isShuffle: false,
      };

      const result = comparator.areDataSetsIdentical(invalidLocal, validData);
      expect(result).toBe(false);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "Invalid data structure detected during comparison",
      );

      consoleWarnSpy.mockRestore();
    });

    it("should handle comparison errors gracefully", () => {
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      // Mock compareNormalizedData to throw an error
      const originalCompare = (comparator as any).compareNormalizedData;
      (comparator as any).compareNormalizedData = vi
        .fn()
        .mockImplementation(() => {
          throw new Error("Comparison failed");
        });

      const data: UserPlaylistData = {
        playlists: [],
        activePlaylistId: "",
        loopMode: "all",
        isShuffle: false,
      };

      const result = comparator.areDataSetsIdentical(data, data);
      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalled();

      // Restore original method
      (comparator as any).compareNormalizedData = originalCompare;
      consoleErrorSpy.mockRestore();
    });

    it("should handle normalization errors gracefully", () => {
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      // Create data that will cause normalization to fail
      const problematicData = {
        playlists: [
          {
            id: "1",
            name: "Test",
            items: [
              { id: "item1", title: "Song 1" },
              null, // This will cause issues during normalization
            ],
          },
        ],
        activePlaylistId: "1",
        loopMode: "all",
        isShuffle: false,
      } as any;

      const validData: UserPlaylistData = {
        playlists: [],
        activePlaylistId: "",
        loopMode: "all",
        isShuffle: false,
      };

      const result = comparator.areDataSetsIdentical(
        problematicData,
        validData,
      );
      expect(result).toBe(false);

      consoleErrorSpy.mockRestore();
    });

    it("should validate playlist structure in data validation", () => {
      const consoleWarnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => {});

      const invalidPlaylistData = {
        playlists: [
          {
            id: "1",
            name: "Valid Playlist",
            items: [
              { id: "item1", title: "Song 1" },
              { id: "item2" }, // Missing title
            ],
          },
        ],
        activePlaylistId: "1",
        loopMode: "all",
        isShuffle: false,
      } as any;

      const validData: UserPlaylistData = {
        playlists: [],
        activePlaylistId: "",
        loopMode: "all",
        isShuffle: false,
      };

      const result = comparator.areDataSetsIdentical(
        invalidPlaylistData,
        validData,
      );
      expect(result).toBe(false);

      consoleWarnSpy.mockRestore();
    });

    it("should handle circular reference errors in validation", () => {
      const consoleWarnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => {});

      // Create data with invalid structure that will fail validation
      const invalidData: any = {
        playlists: [
          {
            id: "1",
            name: "Test",
            items: "not an array", // This will fail validation
          },
        ],
        activePlaylistId: "1",
        loopMode: "all",
        isShuffle: false,
      };

      const validData: UserPlaylistData = {
        playlists: [],
        activePlaylistId: "",
        loopMode: "all",
        isShuffle: false,
      };

      const result = comparator.areDataSetsIdentical(invalidData, validData);
      expect(result).toBe(false);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "Invalid data structure detected during comparison",
      );

      consoleWarnSpy.mockRestore();
    });

    it("should handle data structure validation errors", () => {
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      // Mock isValidDataStructure to throw an error
      const originalValidate = (comparator as any).isValidDataStructure;
      (comparator as any).isValidDataStructure = vi
        .fn()
        .mockImplementation(() => {
          throw new Error("Validation failed");
        });

      const data: UserPlaylistData = {
        playlists: [],
        activePlaylistId: "",
        loopMode: "all",
        isShuffle: false,
      };

      const result = comparator.areDataSetsIdentical(data, data);
      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalled();

      // Restore original method
      (comparator as any).isValidDataStructure = originalValidate;
      consoleErrorSpy.mockRestore();
    });
  });

  describe("performance monitoring", () => {
    it("should log warning when comparison exceeds timeout", () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      // Mock performance.now to simulate slow comparison
      const _originalNow = performance.now;
      let callCount = 0;
      vi.spyOn(performance, "now").mockImplementation(() => {
        callCount++;
        if (callCount === 1) return 0; // Start time
        return 150; // End time (150ms duration)
      });

      const data: UserPlaylistData = {
        playlists: [],
        activePlaylistId: "",
        loopMode: "all",
        isShuffle: false,
      };

      comparator.areDataSetsIdentical(data, data);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          "Data comparison took 150.00ms, exceeding 100ms target",
        ),
      );

      consoleSpy.mockRestore();
      vi.mocked(performance.now).mockRestore();
    });
  });

  describe("static convenience method", () => {
    it("should provide static areIdentical method", () => {
      const data: UserPlaylistData = {
        playlists: [],
        activePlaylistId: "",
        loopMode: "all",
        isShuffle: false,
      };

      const result = DataComparator.areIdentical(data, data);
      expect(result).toBe(true);
    });
  });

  describe("singleton instance", () => {
    it("should export singleton instance", () => {
      expect(dataComparator).toBeInstanceOf(DataComparator);

      const data: UserPlaylistData = {
        playlists: [],
        activePlaylistId: "",
        loopMode: "all",
        isShuffle: false,
      };

      const result = dataComparator.areDataSetsIdentical(data, data);
      expect(result).toBe(true);
    });
  });

  describe("complex scenarios", () => {
    it("should handle mixed undefined and empty string titles correctly", () => {
      const local: UserPlaylistData = {
        playlists: [
          {
            id: "1",
            name: "Mixed",
            items: [
              { id: "1", title: undefined },
              { id: "2", title: "" },
              { id: "3", title: "Song" },
              { id: "4", title: undefined },
            ],
          },
        ],
        activePlaylistId: "1",
        loopMode: "all",
        isShuffle: false,
      };

      const cloud: UserPlaylistData = {
        playlists: [
          {
            id: "1",
            name: "Mixed",
            items: [
              { id: "1", title: "" },
              { id: "2", title: "" },
              { id: "3", title: "Song" },
              { id: "4", title: "" },
            ],
          },
        ],
        activePlaylistId: "1",
        loopMode: "all",
        isShuffle: false,
      };

      const result = comparator.areDataSetsIdentical(local, cloud);
      expect(result).toBe(true);
    });

    it("should handle complex nested differences", () => {
      const local: UserPlaylistData = {
        playlists: [
          {
            id: "1",
            name: "Playlist A",
            items: [
              { id: "x", title: "Song X" },
              { id: "y", title: "Song Y" },
            ],
          },
          {
            id: "2",
            name: "Playlist B",
            items: [{ id: "z", title: "Song Z" }],
          },
        ],
        activePlaylistId: "1",
        loopMode: "one",
        isShuffle: true,
      };

      const cloud: UserPlaylistData = {
        playlists: [
          {
            id: "1",
            name: "Playlist A",
            items: [
              { id: "x", title: "Song X" },
              { id: "y", title: "Song Y Modified" }, // Different title
            ],
          },
          {
            id: "2",
            name: "Playlist B",
            items: [{ id: "z", title: "Song Z" }],
          },
        ],
        activePlaylistId: "1",
        loopMode: "one",
        isShuffle: true,
      };

      const result = comparator.areDataSetsIdentical(local, cloud);
      expect(result).toBe(false);
    });
  });
});
