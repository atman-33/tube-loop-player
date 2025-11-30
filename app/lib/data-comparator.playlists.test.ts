/** biome-ignore-all lint/suspicious/noExplicitAny: <> */

import { describe, expect, it } from "vitest";
import { DataComparator } from "./data-comparator";
import type { UserPlaylistData } from "./data-normalizer";

describe("DataComparator - arePlaylistsIdentical", () => {
  let comparator: DataComparator;

  beforeEach(() => {
    comparator = new DataComparator();
  });

  it("should return true when playlists are identical but activePlaylistId differs", () => {
    const local: UserPlaylistData = {
      playlists: [{ id: "1", name: "P1", items: [] }],
      activePlaylistId: "1",
      loopMode: "all",
      isShuffle: false,
    };

    const cloud: UserPlaylistData = {
      playlists: [{ id: "1", name: "P1", items: [] }],
      activePlaylistId: "2", // Different
      loopMode: "all",
      isShuffle: false,
    };

    expect(comparator.arePlaylistsIdentical(local, cloud)).toBe(true);
    expect(comparator.areDataSetsIdentical(local, cloud)).toBe(false);
  });

  it("should return true when playlists are identical but loopMode differs", () => {
    const local: UserPlaylistData = {
      playlists: [{ id: "1", name: "P1", items: [] }],
      activePlaylistId: "1",
      loopMode: "one",
      isShuffle: false,
    };

    const cloud: UserPlaylistData = {
      playlists: [{ id: "1", name: "P1", items: [] }],
      activePlaylistId: "1",
      loopMode: "all", // Different
      isShuffle: false,
    };

    expect(comparator.arePlaylistsIdentical(local, cloud)).toBe(true);
  });

  it("should return true when playlists are identical but isShuffle differs", () => {
    const local: UserPlaylistData = {
      playlists: [{ id: "1", name: "P1", items: [] }],
      activePlaylistId: "1",
      loopMode: "all",
      isShuffle: true,
    };

    const cloud: UserPlaylistData = {
      playlists: [{ id: "1", name: "P1", items: [] }],
      activePlaylistId: "1",
      loopMode: "all",
      isShuffle: false, // Different
    };

    expect(comparator.arePlaylistsIdentical(local, cloud)).toBe(true);
  });

  it("should return false when playlists content differs", () => {
    const local: UserPlaylistData = {
      playlists: [{ id: "1", name: "P1", items: [{ id: "a", title: "A" }] }],
      activePlaylistId: "1",
      loopMode: "all",
      isShuffle: false,
    };

    const cloud: UserPlaylistData = {
      playlists: [{ id: "1", name: "P1", items: [{ id: "b", title: "B" }] }],
      activePlaylistId: "1",
      loopMode: "all",
      isShuffle: false,
    };

    expect(comparator.arePlaylistsIdentical(local, cloud)).toBe(false);
  });
});
