/**
 * Integration tests for usePinnedSongsSync hook
 */

import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { usePlayerStore } from "~/stores/player";
import { usePinnedSongsSync } from "./use-pinned-songs-sync";

// Mock the useAuth hook
vi.mock("./use-auth", () => ({
  useAuth: vi.fn(() => ({
    user: null,
    isLoading: false,
    isAuthenticated: false,
    signIn: vi.fn(),
    signOut: vi.fn(),
  })),
}));

describe("usePinnedSongsSync Integration Tests", () => {
  beforeEach(() => {
    // Reset store state before each test
    usePlayerStore.setState({
      pinnedVideoIds: new Set<string>(),
      pinnedOrder: [],
      isPinnedSongsSynced: false,
    });

    // Clear fetch mocks
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("should load pinned songs from server on mount for authenticated users", async () => {
    const mockPinnedData = {
      pinnedVideoIds: ["video1", "video2"],
      pinnedOrder: ["video1", "video2"],
    };

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockPinnedData,
    });

    // Mock authenticated user
    const { useAuth } = await import("./use-auth");
    vi.mocked(useAuth).mockReturnValue({
      user: { id: "user-123", name: "Test User", email: "test@example.com" },
      isLoading: false,
      isAuthenticated: true,
      signIn: vi.fn(),
      signOut: vi.fn(),
    });

    renderHook(() => usePinnedSongsSync(true));

    await waitFor(() => {
      const state = usePlayerStore.getState();
      expect(state.pinnedVideoIds.has("video1")).toBe(true);
      expect(state.pinnedVideoIds.has("video2")).toBe(true);
      expect(state.pinnedOrder).toEqual(["video1", "video2"]);
    });

    expect(global.fetch).toHaveBeenCalledWith("/api/pinned-songs/load");
  });

  test("should overwrite local pinned songs with cloud data on load", async () => {
    // Set local state
    usePlayerStore.setState({
      pinnedVideoIds: new Set(["local-video"]),
      pinnedOrder: ["local-video"],
      isPinnedSongsSynced: false,
    });

    const mockCloudData = {
      pinnedVideoIds: ["cloud-video"],
      pinnedOrder: ["cloud-video"],
    };

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => mockCloudData,
    });

    // Mock authenticated user
    const { useAuth } = await import("./use-auth");
    vi.mocked(useAuth).mockReturnValue({
      user: { id: "user-123", name: "Test User", email: "test@example.com" },
      isLoading: false,
      isAuthenticated: true,
      signIn: vi.fn(),
      signOut: vi.fn(),
    });

    renderHook(() => usePinnedSongsSync(true));

    await waitFor(() => {
      const state = usePlayerStore.getState();
      expect(state.pinnedVideoIds.has("cloud-video")).toBe(true);
      expect(state.pinnedVideoIds.has("local-video")).toBe(false);
      expect(state.pinnedOrder).toEqual(["cloud-video"]);
    });
  });

  test("should not load data for guest users", async () => {
    global.fetch = vi.fn();

    // Mock guest user (no user)
    const { useAuth } = await import("./use-auth");
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      signIn: vi.fn(),
      signOut: vi.fn(),
    });

    renderHook(() => usePinnedSongsSync(true));

    // Wait a bit to ensure no fetch is made
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(global.fetch).not.toHaveBeenCalled();
  });

  test("should sync local changes to server with debounce", async () => {
    // Mock all fetch calls with default success responses
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        pinnedVideoIds: ["new-video"],
        pinnedOrder: ["new-video"],
      }),
    });

    // Override first call for initial load
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ pinnedVideoIds: [], pinnedOrder: [] }),
    });

    // Mock authenticated user
    const { useAuth } = await import("./use-auth");
    vi.mocked(useAuth).mockReturnValue({
      user: { id: "user-123", name: "Test User", email: "test@example.com" },
      isLoading: false,
      isAuthenticated: true,
      signIn: vi.fn(),
      signOut: vi.fn(),
    });

    renderHook(() => usePinnedSongsSync(true));

    // Wait for initial load
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/pinned-songs/load");
    });

    const initialCallCount = (global.fetch as ReturnType<typeof vi.fn>).mock
      .calls.length;

    // Update local state
    usePlayerStore.getState().togglePinnedSong("new-video");

    // Wait for debounced sync (1 second)
    await waitFor(
      () => {
        expect(global.fetch).toHaveBeenCalledWith(
          "/api/pinned-songs/sync",
          expect.objectContaining({
            method: "POST",
            headers: { "Content-Type": "application/json" },
          }),
        );
        // Verify at least one sync call was made after initial load
        expect(
          (global.fetch as ReturnType<typeof vi.fn>).mock.calls.length,
        ).toBeGreaterThan(initialCallCount);
      },
      { timeout: 2000 },
    );
  });
});
