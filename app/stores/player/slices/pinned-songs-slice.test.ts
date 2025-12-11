import { beforeEach, describe, expect, it } from "vitest";
import { usePlayerStore } from "~/stores/player";

const initialState = usePlayerStore.getState();

const resetStore = () => {
  usePlayerStore.setState(initialState, true);
};

beforeEach(() => {
  resetStore();
});

describe("Pinned Songs Slice", () => {
  describe("togglePinnedSong", () => {
    it("pins an unpinned song", () => {
      const { togglePinnedSong, isPinned, pinnedOrder } =
        usePlayerStore.getState();

      expect(isPinned("video-1")).toBe(false);

      togglePinnedSong("video-1");

      expect(usePlayerStore.getState().isPinned("video-1")).toBe(true);
      expect(usePlayerStore.getState().pinnedOrder).toContain("video-1");
    });

    it("unpins a pinned song", () => {
      const { togglePinnedSong, isPinned } = usePlayerStore.getState();

      togglePinnedSong("video-1");
      expect(usePlayerStore.getState().isPinned("video-1")).toBe(true);

      togglePinnedSong("video-1");
      expect(usePlayerStore.getState().isPinned("video-1")).toBe(false);
      expect(usePlayerStore.getState().pinnedOrder).not.toContain("video-1");
    });

    it("maintains insertion order for multiple pins", () => {
      const { togglePinnedSong, pinnedOrder } = usePlayerStore.getState();

      togglePinnedSong("video-a");
      togglePinnedSong("video-b");
      togglePinnedSong("video-c");

      const order = usePlayerStore.getState().pinnedOrder;
      expect(order).toEqual(["video-a", "video-b", "video-c"]);
    });

    it("preserves order when unpinning from middle", () => {
      const { togglePinnedSong } = usePlayerStore.getState();

      togglePinnedSong("video-a");
      togglePinnedSong("video-b");
      togglePinnedSong("video-c");

      togglePinnedSong("video-b");

      const order = usePlayerStore.getState().pinnedOrder;
      expect(order).toEqual(["video-a", "video-c"]);
    });
  });

  describe("isPinned", () => {
    it("returns false for unpinned songs", () => {
      const { isPinned } = usePlayerStore.getState();
      expect(isPinned("nonexistent")).toBe(false);
    });

    it("returns true for pinned songs", () => {
      const { togglePinnedSong, isPinned } = usePlayerStore.getState();

      togglePinnedSong("video-1");
      expect(usePlayerStore.getState().isPinned("video-1")).toBe(true);
    });
  });

  describe("removePinnedSong", () => {
    it("removes a pinned song", () => {
      const { togglePinnedSong, removePinnedSong, isPinned } =
        usePlayerStore.getState();

      togglePinnedSong("video-1");
      expect(usePlayerStore.getState().isPinned("video-1")).toBe(true);

      removePinnedSong("video-1");
      expect(usePlayerStore.getState().isPinned("video-1")).toBe(false);
      expect(usePlayerStore.getState().pinnedOrder).not.toContain("video-1");
    });

    it("does nothing if song is not pinned", () => {
      const { removePinnedSong, pinnedOrder } = usePlayerStore.getState();

      const orderBefore = [...usePlayerStore.getState().pinnedOrder];
      removePinnedSong("nonexistent");
      expect(usePlayerStore.getState().pinnedOrder).toEqual(orderBefore);
    });
  });

  describe("reorderPinnedSongs", () => {
    it("reorders songs from start to end", () => {
      const { togglePinnedSong, reorderPinnedSongs } =
        usePlayerStore.getState();

      togglePinnedSong("video-a");
      togglePinnedSong("video-b");
      togglePinnedSong("video-c");

      reorderPinnedSongs(0, 2);

      const order = usePlayerStore.getState().pinnedOrder;
      expect(order).toEqual(["video-b", "video-c", "video-a"]);
    });

    it("reorders songs from end to start", () => {
      const { togglePinnedSong, reorderPinnedSongs } =
        usePlayerStore.getState();

      togglePinnedSong("video-a");
      togglePinnedSong("video-b");
      togglePinnedSong("video-c");

      reorderPinnedSongs(2, 0);

      const order = usePlayerStore.getState().pinnedOrder;
      expect(order).toEqual(["video-c", "video-a", "video-b"]);
    });

    it("reorders songs within middle positions", () => {
      const { togglePinnedSong, reorderPinnedSongs } =
        usePlayerStore.getState();

      togglePinnedSong("video-a");
      togglePinnedSong("video-b");
      togglePinnedSong("video-c");
      togglePinnedSong("video-d");

      reorderPinnedSongs(1, 2);

      const order = usePlayerStore.getState().pinnedOrder;
      expect(order).toEqual(["video-a", "video-c", "video-b", "video-d"]);
    });
  });
});
