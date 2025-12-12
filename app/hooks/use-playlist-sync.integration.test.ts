/**
 * Integration tests for usePlaylistSync hook
 * Tests complete sync flow from detection to resolution
 */

import { renderHook } from "@testing-library/react";
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

  const _identicalCloudData: UserPlaylistData = {
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
    pinnedVideoIds: new Set<string>(),
    pinnedOrder: [],
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
    it("should complete conflict resolution flow", async () => {
      mockUseAuth.mockReturnValue({
        user: mockUser,
        isLoading: false,
        isAuthenticated: true,
        signIn: vi.fn(),
        signOut: vi.fn(),
      });

      const { result } = renderHook(() => usePlaylistSync());

      // Simulate conflict state with diff
      const { DiffCalculator } = await import("~/lib/data-diff-calculator");
      const diffCalculator = new DiffCalculator();
      const diff = diffCalculator.calculateDiff(
        identicalLocalData,
        differentCloudData,
      );
      result.current.conflictData = {
        local: identicalLocalData,
        cloud: differentCloudData,
        diff,
      };

      // Resolve with cloud data
      await result.current.resolveConflict(differentCloudData, "cloud");

      expect(mockPlayerStore.loadUserData).toHaveBeenCalledWith(
        differentCloudData,
      );
      expect(mockPlayerStore.syncToServer).toHaveBeenCalled();
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
