/**
 * Unit tests for ConflictResolver class
 * Tests all conflict resolution scenarios and decision paths
 */
/** biome-ignore-all lint/suspicious/noExplicitAny: <> */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { ConflictResolver } from "./conflict-resolver";
import { DataComparator } from "./data-comparator";
import type { UserPlaylistData } from "./data-normalizer";
import { MAX_PLAYLIST_COUNT } from "./playlist-limits";

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

  const buildDefaultDataset = (count: number): UserPlaylistData => ({
    playlists: Array.from({ length: count }, (_, index) => ({
      id: `default-${index + 1}`,
      name: `Playlist ${index + 1}`,
      items: [],
    })),
    activePlaylistId: "default-1",
    loopMode: "all",
    isShuffle: false,
  });

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

      it("treats sequential default playlists up to the max as empty state", () => {
        const localDefaultWithMax = buildDefaultDataset(MAX_PLAYLIST_COUNT);

        const result = conflictResolver.analyzeConflict(
          localDefaultWithMax,
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
          expect.stringContaining(
            "Data comparison failed during conflict analysis",
          ),
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

      it("should handle timeout errors from data comparison", () => {
        vi.spyOn(mockDataComparator, "areDataSetsIdentical").mockImplementation(
          () => {
            throw new Error("Comparison timeout after 100ms");
          },
        );

        const consoleSpy = vi
          .spyOn(console, "error")
          .mockImplementation(() => {});

        const result = conflictResolver.analyzeConflict(
          meaningfulLocalData,
          meaningfulCloudData,
        );

        expect(result.type).toBe("show-modal");
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining(
            "Data comparison failed during conflict analysis",
          ),
          expect.any(Error),
        );

        consoleSpy.mockRestore();
      });

      it("should handle invalid cloud data in auto-sync scenario", () => {
        const consoleWarnSpy = vi
          .spyOn(console, "warn")
          .mockImplementation(() => {});

        const invalidCloudData = {
          playlists: "not an array",
          activePlaylistId: 123,
          loopMode: "invalid",
          isShuffle: "not boolean",
        } as any;

        const result = conflictResolver.analyzeConflict(
          null as any,
          invalidCloudData,
        );

        expect(result.type).toBe("show-modal");
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          "Invalid cloud data structure detected, falling back to modal",
        );

        consoleWarnSpy.mockRestore();
      });

      it("should handle metadata calculation errors", () => {
        const consoleSpy = vi
          .spyOn(console, "error")
          .mockImplementation(() => {});
        const consoleWarnSpy = vi
          .spyOn(console, "warn")
          .mockImplementation(() => {});

        // Mock countTotalItems to throw an error
        const originalCountTotalItems = (conflictResolver as any)
          .countTotalItems;
        (conflictResolver as any).countTotalItems = vi
          .fn()
          .mockImplementation(() => {
            throw new Error("Count failed");
          });

        vi.spyOn(mockDataComparator, "areDataSetsIdentical").mockReturnValue(
          false,
        );

        const result = conflictResolver.analyzeConflict(
          meaningfulLocalData,
          meaningfulCloudData,
        );

        expect(result.type).toBe("show-modal");
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          "Failed to calculate conflict metadata:",
          expect.any(Error),
        );

        // Restore original method
        (conflictResolver as any).countTotalItems = originalCountTotalItems;
        consoleSpy.mockRestore();
        consoleWarnSpy.mockRestore();
      });

      it("should handle empty data check errors", () => {
        const consoleWarnSpy = vi
          .spyOn(console, "warn")
          .mockImplementation(() => {});

        // Mock isEmptyOrDefaultData to throw an error
        const originalIsEmptyOrDefaultData = (conflictResolver as any)
          .isEmptyOrDefaultData;
        (conflictResolver as any).isEmptyOrDefaultData = vi
          .fn()
          .mockImplementation(() => {
            throw new Error("Empty check failed");
          });

        vi.spyOn(mockDataComparator, "areDataSetsIdentical").mockReturnValue(
          false,
        );

        const result = conflictResolver.analyzeConflict(
          meaningfulLocalData,
          meaningfulCloudData,
        );

        expect(result.type).toBe("show-modal");
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          "Failed to check empty data status:",
          expect.any(Error),
        );

        // Restore original method
        (conflictResolver as any).isEmptyOrDefaultData =
          originalIsEmptyOrDefaultData;
        consoleWarnSpy.mockRestore();
      });

      it("should provide fallback data when both inputs are invalid", () => {
        const consoleSpy = vi
          .spyOn(console, "error")
          .mockImplementation(() => {});

        const result = conflictResolver.analyzeConflict(
          null as any,
          null as any,
        );

        // Should return no-action for both null
        expect(result.type).toBe("no-action");

        consoleSpy.mockRestore();
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

    it("should throw error for invalid cloud data structure", async () => {
      const invalidData = { invalid: "structure" } as any;

      await expect(
        conflictResolver.performAutoSync(invalidData),
      ).rejects.toThrow(
        "Auto-sync failed: Invalid cloud data structure - cannot perform auto-sync",
      );
    });

    it("should throw error for data that fails integrity checks", async () => {
      const dataWithDuplicateIds = {
        playlists: [
          {
            id: "1",
            name: "Playlist 1",
            items: [
              { id: "item1", title: "Song 1" },
              { id: "item1", title: "Song 2" }, // Duplicate ID
            ],
          },
        ],
        activePlaylistId: "1",
        loopMode: "all",
        isShuffle: false,
      } as UserPlaylistData;

      await expect(
        conflictResolver.performAutoSync(dataWithDuplicateIds),
      ).rejects.toThrow(
        "Auto-sync failed: Cloud data failed integrity checks - cannot perform auto-sync",
      );
    });

    it("should log error and re-throw when validation fails", async () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const invalidData = null as any;

      await expect(
        conflictResolver.performAutoSync(invalidData),
      ).rejects.toThrow("Auto-sync failed:");

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Auto-sync failed"),
        expect.any(Error),
      );

      consoleSpy.mockRestore();
    });

    it("should handle unknown errors gracefully", async () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      // Mock validateDataIntegrity to throw a non-Error object
      const originalValidateDataIntegrity = (conflictResolver as any)
        .validateDataIntegrity;
      (conflictResolver as any).validateDataIntegrity = vi
        .fn()
        .mockImplementation(() => {
          throw "String error"; // Non-Error object
        });

      await expect(
        conflictResolver.performAutoSync(meaningfulCloudData),
      ).rejects.toThrow("Auto-sync failed due to unknown error");

      // Restore original method
      (conflictResolver as any).validateDataIntegrity =
        originalValidateDataIntegrity;
      consoleSpy.mockRestore();
    });

    it("should log performance metrics", async () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      await conflictResolver.performAutoSync(meaningfulCloudData);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringMatching(/Auto-sync validation completed in \d+\.\d+ms/),
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

  describe("data integrity validation", () => {
    it("should detect duplicate playlist IDs", () => {
      const dataWithDuplicatePlaylistIds = {
        playlists: [
          { id: "1", name: "Playlist 1", items: [] },
          { id: "1", name: "Duplicate ID", items: [] }, // Duplicate ID
        ],
        activePlaylistId: "1",
        loopMode: "all",
        isShuffle: false,
      } as UserPlaylistData;

      const consoleWarnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => {});

      const isValid = (conflictResolver as any).validateDataIntegrity(
        dataWithDuplicatePlaylistIds,
      );
      expect(isValid).toBe(false);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "Duplicate playlist IDs detected",
      );

      consoleWarnSpy.mockRestore();
    });

    it("should detect invalid active playlist ID", () => {
      const dataWithInvalidActiveId = {
        playlists: [{ id: "1", name: "Playlist 1", items: [] }],
        activePlaylistId: "nonexistent",
        loopMode: "all",
        isShuffle: false,
      } as UserPlaylistData;

      const consoleWarnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => {});

      const isValid = (conflictResolver as any).validateDataIntegrity(
        dataWithInvalidActiveId,
      );
      expect(isValid).toBe(false);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "Active playlist ID does not exist in playlists",
      );

      consoleWarnSpy.mockRestore();
    });

    it("should detect duplicate item IDs within playlist", () => {
      const dataWithDuplicateItemIds = {
        playlists: [
          {
            id: "1",
            name: "Playlist 1",
            items: [
              { id: "item1", title: "Song 1" },
              { id: "item1", title: "Song 2" }, // Duplicate ID
            ],
          },
        ],
        activePlaylistId: "1",
        loopMode: "all",
        isShuffle: false,
      } as UserPlaylistData;

      const consoleWarnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => {});

      const isValid = (conflictResolver as any).validateDataIntegrity(
        dataWithDuplicateItemIds,
      );
      expect(isValid).toBe(false);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "Duplicate item IDs detected in playlist 1",
      );

      consoleWarnSpy.mockRestore();
    });

    it("should handle circular reference errors", () => {
      const circularData: any = {
        playlists: [],
        activePlaylistId: "",
        loopMode: "all",
        isShuffle: false,
      };
      circularData.self = circularData; // Create circular reference

      const consoleWarnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => {});

      const isValid = (conflictResolver as any).validateDataIntegrity(
        circularData,
      );
      expect(isValid).toBe(false);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "Data integrity validation failed:",
        expect.any(Error),
      );

      consoleWarnSpy.mockRestore();
    });

    it("should pass validation for valid data", () => {
      const isValid = (conflictResolver as any).validateDataIntegrity(
        meaningfulLocalData,
      );
      expect(isValid).toBe(true);
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
