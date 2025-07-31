/**
 * Unit tests for ConflictResolver class
 * Tests all conflict resolution scenarios and decision paths
 */
/** biome-ignore-all lint/suspicious/noExplicitAny: <> */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { ConflictResolver } from "./conflict-resolver";
import { DataComparator } from "./data-comparator";
import type { UserPlaylistData } from "./data-normalizer";

describe("ConflictResolver", () => {
  let conflictResolver: ConflictResolver;
  let mockDataComparator: DataComparator;

  // Test data fixtures
  const emptyData: UserPlaylistData = {
    playlists: [],
    activePlaylistId: "",
    loopMode: "all",
    isShuffle: false,
  };

  const defaultData: UserPlaylistData = {
    playlists: [
      { id: "1", name: "Playlist 1", items: [{ id: "item1", title: "Test" }] },
      { id: "2", name: "Playlist 2", items: [] },
      { id: "3", name: "Playlist 3", items: [] },
    ],
    activePlaylistId: "1",
    loopMode: "all",
    isShuffle: false,
  };

  const meaningfulLocalData: UserPlaylistData = {
    playlists: [
      {
        id: "1",
        name: "My Music",
        items: [
          { id: "item1", title: "Song 1" },
          { id: "item2", title: "Song 2" },
        ],
      },
      {
        id: "2",
        name: "Favorites",
        items: [{ id: "item3", title: "Favorite Song" }],
      },
    ],
    activePlaylistId: "1",
    loopMode: "one",
    isShuffle: true,
  };

  const meaningfulCloudData: UserPlaylistData = {
    playlists: [
      {
        id: "1",
        name: "Work Music",
        items: [
          { id: "item1", title: "Focus Track 1" },
          { id: "item4", title: "Focus Track 2" },
        ],
      },
    ],
    activePlaylistId: "1",
    loopMode: "all",
    isShuffle: false,
  };

  const identicalCloudData: UserPlaylistData = {
    playlists: [
      {
        id: "1",
        name: "My Music",
        items: [
          { id: "item1", title: "Song 1" },
          { id: "item2", title: "Song 2" },
        ],
      },
      {
        id: "2",
        name: "Favorites",
        items: [{ id: "item3", title: "Favorite Song" }],
      },
    ],
    activePlaylistId: "1",
    loopMode: "one",
    isShuffle: true,
  };

  beforeEach(() => {
    mockDataComparator = new DataComparator();
    conflictResolver = new ConflictResolver(mockDataComparator);
  });

  describe("analyzeConflict", () => {
    describe("null/undefined handling", () => {
      it("should return no-action when both datasets are null", () => {
        const result = conflictResolver.analyzeConflict(
          null as any,
          null as any,
        );
        expect(result).toEqual({ type: "no-action" });
      });

      it("should return auto-sync when only cloud data exists", () => {
        const result = conflictResolver.analyzeConflict(
          null as any,
          meaningfulCloudData,
        );
        expect(result).toEqual({
          type: "auto-sync",
          data: meaningfulCloudData,
        });
      });

      it("should return no-action when only local data exists", () => {
        const result = conflictResolver.analyzeConflict(
          meaningfulLocalData,
          null as any,
        );
        expect(result).toEqual({ type: "no-action" });
      });
    });

    describe("identical data scenarios", () => {
      it("should auto-sync when data is identical", () => {
        // Mock the comparator to return true for identical data
        vi.spyOn(mockDataComparator, "areDataSetsIdentical").mockReturnValue(
          true,
        );

        const result = conflictResolver.analyzeConflict(
          meaningfulLocalData,
          identicalCloudData,
        );

        expect(result).toEqual({
          type: "auto-sync",
          data: identicalCloudData,
        });
        expect(mockDataComparator.areDataSetsIdentical).toHaveBeenCalledWith(
          meaningfulLocalData,
          identicalCloudData,
        );
      });

      it("should auto-sync when local data is empty and cloud has data", () => {
        const result = conflictResolver.analyzeConflict(
          emptyData,
          meaningfulCloudData,
        );
        expect(result).toEqual({
          type: "auto-sync",
          data: meaningfulCloudData,
        });
      });

      it("should auto-sync when local data is default and cloud has meaningful data", () => {
        const result = conflictResolver.analyzeConflict(
          defaultData,
          meaningfulCloudData,
        );
        expect(result).toEqual({
          type: "auto-sync",
          data: meaningfulCloudData,
        });
      });
    });

    describe("different data scenarios", () => {
      it("should show modal when data has meaningful differences", () => {
        // Mock the comparator to return false for different data
        vi.spyOn(mockDataComparator, "areDataSetsIdentical").mockReturnValue(
          false,
        );

        const result = conflictResolver.analyzeConflict(
          meaningfulLocalData,
          meaningfulCloudData,
        );

        expect(result).toEqual({
          type: "show-modal",
          local: meaningfulLocalData,
          cloud: meaningfulCloudData,
        });
      });

      it("should show modal when playlist names differ", () => {
        const localWithDifferentName = {
          ...meaningfulLocalData,
          playlists: [
            { ...meaningfulLocalData.playlists[0], name: "Different Name" },
            ...meaningfulLocalData.playlists.slice(1),
          ],
        };

        vi.spyOn(mockDataComparator, "areDataSetsIdentical").mockReturnValue(
          false,
        );

        const result = conflictResolver.analyzeConflict(
          localWithDifferentName,
          meaningfulCloudData,
        );

        expect(result.type).toBe("show-modal");
      });

      it("should show modal when settings differ", () => {
        const localWithDifferentSettings = {
          ...meaningfulLocalData,
          loopMode: "all" as const,
          isShuffle: false,
        };

        vi.spyOn(mockDataComparator, "areDataSetsIdentical").mockReturnValue(
          false,
        );

        const result = conflictResolver.analyzeConflict(
          localWithDifferentSettings,
          meaningfulCloudData,
        );

        expect(result.type).toBe("show-modal");
      });
    });

    describe("empty data scenarios", () => {
      it("should return no-action when cloud data is empty", () => {
        const result = conflictResolver.analyzeConflict(
          meaningfulLocalData,
          emptyData,
        );
        expect(result).toEqual({ type: "no-action" });
      });

      it("should auto-sync when both datasets are empty (identical)", () => {
        const result = conflictResolver.analyzeConflict(emptyData, emptyData);
        expect(result).toEqual({
          type: "auto-sync",
          data: emptyData,
        });
      });
    });

    describe("error handling", () => {
      it("should fallback to show-modal when comparison throws error", () => {
        vi.spyOn(mockDataComparator, "areDataSetsIdentical").mockImplementation(
          () => {
            throw new Error("Comparison failed");
          },
        );

        const consoleSpy = vi
          .spyOn(console, "error")
          .mockImplementation(() => {});

        const result = conflictResolver.analyzeConflict(
          meaningfulLocalData,
          meaningfulCloudData,
        );

        expect(result).toEqual({
          type: "show-modal",
          local: meaningfulLocalData,
          cloud: meaningfulCloudData,
        });
        expect(consoleSpy).toHaveBeenCalledWith(
          "Conflict analysis failed:",
          expect.any(Error),
        );

        consoleSpy.mockRestore();
      });

      it("should fallback to show-modal when data is malformed", () => {
        const malformedData = { invalid: "data" } as any;

        const result = conflictResolver.analyzeConflict(
          malformedData,
          meaningfulCloudData,
        );

        expect(result.type).toBe("show-modal");
      });
    });
  });

  describe("performAutoSync", () => {
    it("should successfully perform auto-sync with valid data", async () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      await expect(
        conflictResolver.performAutoSync(meaningfulCloudData),
      ).resolves.toBeUndefined();

      expect(consoleSpy).toHaveBeenCalledWith(
        "Performing automatic sync with cloud data",
      );

      consoleSpy.mockRestore();
    });

    it("should throw error for invalid cloud data", async () => {
      const invalidData = { invalid: "structure" } as any;

      await expect(
        conflictResolver.performAutoSync(invalidData),
      ).rejects.toThrow("Invalid cloud data structure");
    });

    it("should log error and re-throw when validation fails", async () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const invalidData = null as any;

      await expect(
        conflictResolver.performAutoSync(invalidData),
      ).rejects.toThrow();

      expect(consoleSpy).toHaveBeenCalledWith(
        "Auto-sync failed:",
        expect.any(Error),
      );

      consoleSpy.mockRestore();
    });
  });

  describe("conflict analysis metadata", () => {
    it("should calculate correct metadata for meaningful data", () => {
      vi.spyOn(mockDataComparator, "areDataSetsIdentical").mockReturnValue(
        false,
      );

      const _result = conflictResolver.analyzeConflict(
        meaningfulLocalData,
        meaningfulCloudData,
      );

      // Access the private method through reflection for testing
      const analysis = (conflictResolver as any).performConflictAnalysis(
        meaningfulLocalData,
        meaningfulCloudData,
      );

      expect(analysis.metadata).toEqual({
        localItemCount: 3, // 2 items in first playlist + 1 in second
        cloudItemCount: 2, // 2 items in single playlist
        localPlaylistCount: 2,
        cloudPlaylistCount: 1,
      });
    });

    it("should handle empty playlists in metadata calculation", () => {
      const _result = conflictResolver.analyzeConflict(emptyData, emptyData);

      const analysis = (conflictResolver as any).performConflictAnalysis(
        emptyData,
        emptyData,
      );

      expect(analysis.metadata).toEqual({
        localItemCount: 0,
        cloudItemCount: 0,
        localPlaylistCount: 0,
        cloudPlaylistCount: 0,
      });
    });
  });

  describe("default data detection", () => {
    it("should detect default playlist structure", () => {
      const isEmptyOrDefault = (conflictResolver as any).isEmptyOrDefaultData(
        defaultData,
      );
      expect(isEmptyOrDefault).toBe(true);
    });

    it("should not detect meaningful data as default", () => {
      const isEmptyOrDefault = (conflictResolver as any).isEmptyOrDefaultData(
        meaningfulLocalData,
      );
      expect(isEmptyOrDefault).toBe(false);
    });

    it("should detect empty data as default", () => {
      const isEmptyOrDefault = (conflictResolver as any).isEmptyOrDefaultData(
        emptyData,
      );
      expect(isEmptyOrDefault).toBe(true);
    });

    it("should detect data with all empty playlists as default", () => {
      const allEmptyPlaylists: UserPlaylistData = {
        playlists: [
          { id: "1", name: "Test", items: [] },
          { id: "2", name: "Test 2", items: [] },
        ],
        activePlaylistId: "1",
        loopMode: "all",
        isShuffle: false,
      };

      const isEmptyOrDefault = (conflictResolver as any).isEmptyOrDefaultData(
        allEmptyPlaylists,
      );
      expect(isEmptyOrDefault).toBe(true);
    });
  });

  describe("integration scenarios", () => {
    it("should handle complete conflict resolution flow for identical data", () => {
      vi.spyOn(mockDataComparator, "areDataSetsIdentical").mockReturnValue(
        true,
      );

      const result = conflictResolver.analyzeConflict(
        meaningfulLocalData,
        identicalCloudData,
      );

      expect(result.type).toBe("auto-sync");
      if (result.type === "auto-sync") {
        expect(result.data).toBe(identicalCloudData);
      }
    });

    it("should handle complete conflict resolution flow for different data", () => {
      vi.spyOn(mockDataComparator, "areDataSetsIdentical").mockReturnValue(
        false,
      );

      const result = conflictResolver.analyzeConflict(
        meaningfulLocalData,
        meaningfulCloudData,
      );

      expect(result.type).toBe("show-modal");
      if (result.type === "show-modal") {
        expect(result.local).toBe(meaningfulLocalData);
        expect(result.cloud).toBe(meaningfulCloudData);
      }
    });

    it("should prioritize auto-sync for empty local data", () => {
      const result = conflictResolver.analyzeConflict(
        emptyData,
        meaningfulCloudData,
      );

      expect(result.type).toBe("auto-sync");
      if (result.type === "auto-sync") {
        expect(result.data).toBe(meaningfulCloudData);
      }
    });
  });
});
