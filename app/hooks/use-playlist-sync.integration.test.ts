/**
 * Integration tests for usePlaylistSync hook
 * Tests complete sync flow from detection to resolution
 */

import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { UserPlaylistData } from "~/lib/data-normalizer";
import { usePlayerStore } from "~/stores/player";
import { useAuth } from "./use-auth";
import { usePlaylistSync } from "./use-playlist-sync";

// Mock the auth hook
vi.mock("./use-auth");

// Mock the player store
vi.mock("~/stores/player");

// Mock fetch globally
global.fetch = vi.fn();

describe("usePlaylistSync Integration Tests", () => {
  const mockUser = {
    id: "user123",
    name: "Test User",
    email: "test@example.com",
  };

  // Get the mocked functions
  const mockUseAuth = vi.mocked(useAuth);
  const mockUsePlayerStore = vi.mocked(usePlayerStore);

  // Test data
  const identicalLocalData: UserPlaylistData = {
    playlists: [
      {
        id: "playlist1",
        name: "My Playlist",
        items: [
          {
            id: "V4UL6BYgUXw",
            title: "Song 1",
          },
        ],
      },
    ],
    activePlaylistId: "playlist1",
    loopMode: "all",
    isShuffle: false,
  };

  const identicalCloudData: UserPlaylistData = {
    playlists: [
      {
        id: "playlist1",
        name: "My Playlist",
        items: [
          {
            id: "V4UL6BYgUXw",
            title: "Song 1",
          },
        ],
      },
    ],
    activePlaylistId: "playlist1",
    loopMode: "all",
    isShuffle: false,
  };

  const differentCloudData: UserPlaylistData = {
    playlists: [
      {
        id: "playlist1",
        name: "Different Playlist",
        items: [
          {
            id: "dQw4w9WgXcQ",
            title: "Different Song",
          },
        ],
      },
    ],
    activePlaylistId: "playlist1",
    loopMode: "one",
    isShuffle: true,
  };

  const mockPlayerStore = {
    setUser: vi.fn(),
    loadUserData: vi.fn(),
    syncToServer: vi.fn().mockResolvedValue(undefined),
    isDataSynced: false,
    playlists: identicalLocalData.playlists,
    activePlaylistId: identicalLocalData.activePlaylistId,
    loopMode: identicalLocalData.loopMode,
    isShuffle: identicalLocalData.isShuffle,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Reset fetch mock
    vi.mocked(fetch).mockReset();

    // Setup default mocks
    mockUseAuth.mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      signIn: vi.fn(),
      signOut: vi.fn(),
    });

    mockUsePlayerStore.mockReturnValue(mockPlayerStore);
  });

  describe("Core Integration Flow", () => {
    it("should integrate DataComparator and ConflictResolver for auto-sync", async () => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
        isLoading: false,
        isAuthenticated: true,
        signIn: vi.fn(),
        signOut: vi.fn(),
      });

      mockUsePlayerStore.mockReturnValue({
        ...mockPlayerStore,
        isDataSynced: false,
      });

      // Mock successful API response with identical data
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => identicalCloudData,
      } as Response);

      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      renderHook(() => usePlaylistSync());

      // Verify that intelligent conflict resolution auto-syncs identical data
      await waitFor(() => {
        expect(mockPlayerStore.loadUserData).toHaveBeenCalledWith(
          identicalCloudData,
        );
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        "Automatically syncing identical cloud data",
      );
      expect(fetch).toHaveBeenCalledWith(
        "/api/playlists/load",
        expect.any(Object),
      );

      consoleSpy.mockRestore();
    });

    it("should integrate DataComparator and ConflictResolver for conflict modal", async () => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
        isLoading: false,
        isAuthenticated: true,
        signIn: vi.fn(),
        signOut: vi.fn(),
      });

      mockUsePlayerStore.mockReturnValue({
        ...mockPlayerStore,
        isDataSynced: false,
      });

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => differentCloudData,
      } as Response);

      const { result } = renderHook(() => usePlaylistSync());

      // Verify that intelligent conflict resolution shows modal for different data
      await waitFor(() => {
        expect(result.current.conflictData).toEqual({
          local: identicalLocalData,
          cloud: differentCloudData,
        });
      });

      // Verify auto-sync was NOT called for different data
      expect(mockPlayerStore.loadUserData).not.toHaveBeenCalled();
    });

    it("should handle normalization correctly - undefined vs empty titles", async () => {
      const dataWithUndefinedTitles: UserPlaylistData = {
        playlists: [
          {
            id: "playlist1",
            name: "Test Playlist",
            items: [
              {
                id: "V4UL6BYgUXw",
                title: undefined as unknown as string,
              },
            ],
          },
        ],
        activePlaylistId: "playlist1",
        loopMode: "all",
        isShuffle: false,
      };

      const dataWithEmptyTitles: UserPlaylistData = {
        playlists: [
          {
            id: "playlist1",
            name: "Test Playlist",
            items: [{ id: "V4UL6BYgUXw", title: "" }],
          },
        ],
        activePlaylistId: "playlist1",
        loopMode: "all",
        isShuffle: false,
      };

      mockUseAuth.mockReturnValue({
        user: mockUser,
        isLoading: false,
        isAuthenticated: true,
        signIn: vi.fn(),
        signOut: vi.fn(),
      });

      mockUsePlayerStore.mockReturnValue({
        ...mockPlayerStore,
        playlists: dataWithUndefinedTitles.playlists,
        isDataSynced: false,
      });

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => dataWithEmptyTitles,
      } as Response);

      renderHook(() => usePlaylistSync());

      // Should auto-sync because normalized data is identical
      await waitFor(() => {
        expect(mockPlayerStore.loadUserData).toHaveBeenCalledWith(
          dataWithEmptyTitles,
        );
      });
    });

    it("should handle error scenarios with proper fallback", async () => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
        isLoading: false,
        isAuthenticated: true,
        signIn: vi.fn(),
        signOut: vi.fn(),
      });

      mockUsePlayerStore.mockReturnValue({
        ...mockPlayerStore,
        isDataSynced: false,
      });

      // Mock server error
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
      } as Response);

      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      renderHook(() => usePlaylistSync());

      // Should fallback to syncing local data
      await waitFor(() => {
        expect(mockPlayerStore.syncToServer).toHaveBeenCalled();
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Failed to load user data:",
        expect.any(Error),
      );

      consoleErrorSpy.mockRestore();
    });

    it("should complete conflict resolution flow", async () => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
        isLoading: false,
        isAuthenticated: true,
        signIn: vi.fn(),
        signOut: vi.fn(),
      });

      const { result } = renderHook(() => usePlaylistSync());

      // Simulate conflict state
      result.current.conflictData = {
        local: identicalLocalData,
        cloud: differentCloudData,
      };

      // Resolve with cloud data
      await result.current.resolveConflict(differentCloudData, "cloud");

      expect(mockPlayerStore.loadUserData).toHaveBeenCalledWith(
        differentCloudData,
      );
      expect(mockPlayerStore.syncToServer).toHaveBeenCalled();
    });
  });

  describe("Performance Requirements", () => {
    it("should complete comparison within performance threshold", async () => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
        isLoading: false,
        isAuthenticated: true,
        signIn: vi.fn(),
        signOut: vi.fn(),
      });

      mockUsePlayerStore.mockReturnValue({
        ...mockPlayerStore,
        isDataSynced: false,
      });

      // Create moderately large dataset
      const largePlaylist = {
        id: "large-playlist",
        name: "Large Playlist",
        items: Array.from({ length: 100 }, (_, i) => ({
          id: `V4UL6BYgUX${i.toString().padStart(1, "0")}`,
          title: `Song ${i}`,
        })),
      };

      const largeCloudData: UserPlaylistData = {
        playlists: [largePlaylist],
        activePlaylistId: "large-playlist",
        loopMode: "all",
        isShuffle: false,
      };

      mockUsePlayerStore.mockReturnValue({
        ...mockPlayerStore,
        playlists: [largePlaylist],
        activePlaylistId: "large-playlist",
      });

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => largeCloudData,
      } as Response);

      const startTime = performance.now();

      renderHook(() => usePlaylistSync());

      await waitFor(() => {
        expect(mockPlayerStore.loadUserData).toHaveBeenCalledWith(
          largeCloudData,
        );
      });

      const duration = performance.now() - startTime;
      expect(duration).toBeLessThan(500); // Should complete within 500ms
    });
  });

  describe("Return Values and State", () => {
    it("should return correct authentication and sync status", () => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
        isLoading: false,
        isAuthenticated: true,
        signIn: vi.fn(),
        signOut: vi.fn(),
      });

      mockUsePlayerStore.mockReturnValue({
        ...mockPlayerStore,
        isDataSynced: true,
      });

      const { result } = renderHook(() => usePlaylistSync());

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isSynced).toBe(true);
    });

    it("should provide conflict resolution functions", () => {
      const { result } = renderHook(() => usePlaylistSync());

      expect(typeof result.current.resolveConflict).toBe("function");
      expect(typeof result.current.cancelConflictResolution).toBe("function");
    });
  });
});
