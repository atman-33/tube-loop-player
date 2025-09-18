import { eq, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import type { AppLoadContext } from "react-router";
import { playlist, playlistItem, userSettings } from "~/database/schema";

const D1_MAX_BOUND_PARAMETERS = 100;
const PLAYLIST_ITEM_PARAMETER_COUNT = 5;
const PLAYLIST_ITEM_CHUNK_SIZE = Math.max(
  1,
  Math.floor(D1_MAX_BOUND_PARAMETERS / PLAYLIST_ITEM_PARAMETER_COUNT),
);

export interface PlaylistItem {
  id: string;
  title?: string;
}

export interface Playlist {
  id: string;
  name: string;
  items: PlaylistItem[];
}

export interface UserPlaylistData {
  playlists: Playlist[];
  activePlaylistId: string;
  loopMode: "all" | "one";
  isShuffle: boolean;
}

export class PlaylistService {
  private db;

  constructor(context: AppLoadContext) {
    this.db = drizzle(context.cloudflare.env.DB);
  }

  async getUserPlaylists(userId: string): Promise<UserPlaylistData | null> {
    try {
      // Get user playlists
      const playlists = await this.db
        .select()
        .from(playlist)
        .where(eq(playlist.userId, userId))
        .orderBy(playlist.order);

      // Get playlist items for all playlists
      const playlistIds = playlists.map((p) => p.id);
      const items =
        playlistIds.length > 0
          ? await this.db
              .select()
              .from(playlistItem)
              .where(inArray(playlistItem.playlistId, playlistIds))
              .orderBy(playlistItem.order)
          : [];

      // Get user settings
      const settings = await this.db
        .select()
        .from(userSettings)
        .where(eq(userSettings.userId, userId))
        .limit(1);

      // Group items by playlist
      const itemsByPlaylist = items.reduce(
        (acc, item) => {
          if (!acc[item.playlistId]) acc[item.playlistId] = [];
          acc[item.playlistId].push({
            id: item.videoId,
            title: item.title || undefined,
          });
          return acc;
        },
        {} as Record<string, PlaylistItem[]>,
      );

      // Build result
      const result: UserPlaylistData = {
        playlists: playlists.map((p) => ({
          id: p.id,
          name: p.name,
          items: itemsByPlaylist[p.id] || [],
        })),
        activePlaylistId:
          settings[0]?.activePlaylistId || playlists[0]?.id || "",
        loopMode: settings[0]?.loopMode || "all",
        isShuffle: settings[0]?.isShuffle || false,
      };

      return result;
    } catch (error) {
      console.error("Error fetching user playlists:", error);
      return null;
    }
  }

  async saveUserPlaylists(
    userId: string,
    data: UserPlaylistData,
  ): Promise<boolean> {
    try {
      // Start transaction-like operations
      // Delete existing playlists and items
      await this.db.delete(playlist).where(eq(playlist.userId, userId));

      // Insert playlists
      if (data.playlists.length > 0) {
        await this.db.insert(playlist).values(
          data.playlists.map((p, index) => ({
            id: p.id,
            userId,
            name: p.name,
            order: index,
          })),
        );

        // Insert playlist items
        const allItems = data.playlists.flatMap((p, _playlistIndex) =>
          p.items.map((item, itemIndex) => ({
            playlistId: p.id,
            videoId: item.id,
            title: item.title || null,
            order: itemIndex,
          })),
        );

        if (allItems.length > 0) {
          for (let i = 0; i < allItems.length; i += PLAYLIST_ITEM_CHUNK_SIZE) {
            const chunk = allItems.slice(i, i + PLAYLIST_ITEM_CHUNK_SIZE);
            await this.db.insert(playlistItem).values(chunk);
          }
        }
      }

      // Upsert user settings
      const existingSettings = await this.db
        .select()
        .from(userSettings)
        .where(eq(userSettings.userId, userId))
        .limit(1);

      if (existingSettings.length > 0) {
        await this.db
          .update(userSettings)
          .set({
            activePlaylistId: data.activePlaylistId,
            loopMode: data.loopMode,
            isShuffle: data.isShuffle,
            updatedAt: new Date(),
          })
          .where(eq(userSettings.userId, userId));
      } else {
        await this.db.insert(userSettings).values({
          userId,
          activePlaylistId: data.activePlaylistId,
          loopMode: data.loopMode,
          isShuffle: data.isShuffle,
        });
      }

      return true;
    } catch (error) {
      console.error("Error saving user playlists:", error);
      if (error && typeof error === "object" && "cause" in error) {
        const cause = (error as { cause?: unknown }).cause;
        console.error("Error cause:", cause);
        if (cause && typeof cause === "object" && "cause" in cause) {
          console.error(
            "Nested error cause:",
            (cause as { cause?: unknown }).cause,
          );
        }
      }
      return false;
    }
  }

  async syncCookieDataToDatabase(
    userId: string,
    cookieData: UserPlaylistData,
  ): Promise<boolean> {
    // Get existing database data
    const existingData = await this.getUserPlaylists(userId);

    if (!existingData || existingData.playlists.length === 0) {
      // No existing data, save cookie data as-is
      return await this.saveUserPlaylists(userId, cookieData);
    }

    // Merge logic: combine playlists, avoiding duplicates
    const mergedPlaylists = [...existingData.playlists];

    for (const cookiePlaylist of cookieData.playlists) {
      const existingPlaylist = mergedPlaylists.find(
        (p) => p.name === cookiePlaylist.name,
      );

      if (existingPlaylist) {
        // Merge items, avoiding duplicates
        const existingVideoIds = new Set(
          existingPlaylist.items.map((item) => item.id),
        );
        const newItems = cookiePlaylist.items.filter(
          (item) => !existingVideoIds.has(item.id),
        );
        existingPlaylist.items.push(...newItems);
      } else {
        // Add new playlist with unique ID
        const newId = `playlist-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        mergedPlaylists.push({
          ...cookiePlaylist,
          id: newId,
        });
      }
    }

    const mergedData: UserPlaylistData = {
      playlists: mergedPlaylists,
      activePlaylistId:
        existingData.activePlaylistId || cookieData.activePlaylistId,
      loopMode: existingData.loopMode,
      isShuffle: existingData.isShuffle,
    };

    return await this.saveUserPlaylists(userId, mergedData);
  }
}
