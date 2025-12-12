/**
 * Data diff calculator for playlist data synchronization
 * Calculates detailed differences between local and cloud data
 */

import type { Playlist, PlaylistItem } from "~/lib/player/types";
import type { UserPlaylistData } from "./data-normalizer";

export type ChangeType = "added" | "removed" | "modified" | "reordered";

export interface PlaylistDiff {
  playlistId: string;
  playlistName: string;
  changeType: ChangeType;
  localName?: string;
  cloudName?: string;
  itemDiffs?: ItemDiff[];
}

export interface ItemDiff {
  itemId: string;
  title: string;
  changeType: ChangeType;
  localIndex?: number;
  cloudIndex?: number;
}

export interface DiffSummary {
  playlistsAdded: number;
  playlistsRemoved: number;
  playlistsModified: number;
  songsAdded: number;
  songsRemoved: number;
  songsReordered: number;
}

export interface DataDiff {
  summary: DiffSummary;
  playlistDiffs: PlaylistDiff[];
}

/**
 * Calculates detailed differences between local and cloud playlist data
 */
export class DiffCalculator {
  /**
   * Calculate comprehensive diff between local and cloud data
   */
  public calculateDiff(
    local: UserPlaylistData | null,
    cloud: UserPlaylistData | null,
  ): DataDiff {
    const localPlaylists = local?.playlists || [];
    const cloudPlaylists = cloud?.playlists || [];

    const playlistDiffs = this.calculatePlaylistDiffs(
      localPlaylists,
      cloudPlaylists,
    );

    const summary = this.calculateSummary(playlistDiffs);

    return {
      summary,
      playlistDiffs,
    };
  }

  /**
   * Calculate playlist-level differences
   */
  private calculatePlaylistDiffs(
    localPlaylists: Playlist[],
    cloudPlaylists: Playlist[],
  ): PlaylistDiff[] {
    const diffs: PlaylistDiff[] = [];

    // Create maps for easier lookup
    const localMap = new Map(localPlaylists.map((p) => [p.id, p]));
    const cloudMap = new Map(cloudPlaylists.map((p) => [p.id, p]));

    // Find playlists in local
    for (const localPlaylist of localPlaylists) {
      const cloudPlaylist = cloudMap.get(localPlaylist.id);

      if (!cloudPlaylist) {
        // Playlist exists only in local (removed in cloud)
        diffs.push({
          playlistId: localPlaylist.id,
          playlistName: localPlaylist.name,
          changeType: "removed",
          localName: localPlaylist.name,
        });
      } else {
        // Playlist exists in both - check for modifications
        const itemDiffs = this.calculateItemDiffs(
          localPlaylist.items,
          cloudPlaylist.items,
        );
        const nameChanged = localPlaylist.name !== cloudPlaylist.name;

        if (itemDiffs.length > 0 || nameChanged) {
          diffs.push({
            playlistId: localPlaylist.id,
            playlistName: nameChanged ? cloudPlaylist.name : localPlaylist.name,
            changeType: "modified",
            localName: localPlaylist.name,
            cloudName: cloudPlaylist.name,
            itemDiffs,
          });
        }
      }
    }

    // Find playlists only in cloud (added)
    for (const cloudPlaylist of cloudPlaylists) {
      if (!localMap.has(cloudPlaylist.id)) {
        diffs.push({
          playlistId: cloudPlaylist.id,
          playlistName: cloudPlaylist.name,
          changeType: "added",
          cloudName: cloudPlaylist.name,
        });
      }
    }

    return diffs;
  }

  /**
   * Calculate item-level differences within a playlist
   */
  private calculateItemDiffs(
    localItems: PlaylistItem[],
    cloudItems: PlaylistItem[],
  ): ItemDiff[] {
    const diffs: ItemDiff[] = [];

    // Create maps for easier lookup
    const localMap = new Map(
      localItems.map((item, index) => [item.id, { item, index }]),
    );
    const cloudMap = new Map(
      cloudItems.map((item, index) => [item.id, { item, index }]),
    );

    // Find items in local
    for (const [itemId, { item: localItem, index: localIndex }] of localMap) {
      const cloudEntry = cloudMap.get(itemId);

      if (!cloudEntry) {
        // Item exists only in local (removed in cloud)
        diffs.push({
          itemId: localItem.id,
          title: localItem.title || "Untitled",
          changeType: "removed",
          localIndex,
        });
      } else {
        // Item exists in both - check for position change
        if (localIndex !== cloudEntry.index) {
          diffs.push({
            itemId: localItem.id,
            title: localItem.title || "Untitled",
            changeType: "reordered",
            localIndex,
            cloudIndex: cloudEntry.index,
          });
        }
      }
    }

    // Find items only in cloud (added)
    for (const [itemId, { item: cloudItem, index: cloudIndex }] of cloudMap) {
      if (!localMap.has(itemId)) {
        diffs.push({
          itemId: cloudItem.id,
          title: cloudItem.title || "Untitled",
          changeType: "added",
          cloudIndex,
        });
      }
    }

    return diffs;
  }

  /**
   * Calculate summary statistics from playlist diffs
   */
  private calculateSummary(playlistDiffs: PlaylistDiff[]): DiffSummary {
    const summary: DiffSummary = {
      playlistsAdded: 0,
      playlistsRemoved: 0,
      playlistsModified: 0,
      songsAdded: 0,
      songsRemoved: 0,
      songsReordered: 0,
    };

    for (const diff of playlistDiffs) {
      switch (diff.changeType) {
        case "added":
          summary.playlistsAdded++;
          break;
        case "removed":
          summary.playlistsRemoved++;
          break;
        case "modified":
          summary.playlistsModified++;
          break;
      }

      if (diff.itemDiffs) {
        for (const itemDiff of diff.itemDiffs) {
          switch (itemDiff.changeType) {
            case "added":
              summary.songsAdded++;
              break;
            case "removed":
              summary.songsRemoved++;
              break;
            case "reordered":
              summary.songsReordered++;
              break;
          }
        }
      }
    }

    return summary;
  }
}
