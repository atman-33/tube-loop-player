import { eq, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import type { AppLoadContext } from "react-router";
import { playlist, playlistItem, userSettings } from "~/database/schema";
import { MAX_PLAYLIST_COUNT } from "~/lib/playlist-limits";

const LEGACY_PLAYLIST_ID_PATTERN = /^playlist-\d+$/;

const createUniqueSegment = () => {
  if (
    typeof globalThis.crypto !== "undefined" &&
    typeof globalThis.crypto.randomUUID === "function"
  ) {
    return globalThis.crypto.randomUUID();
  }

  const timePart = Date.now().toString(36);
  const randomPart = Math.random().toString(36).slice(2, 10);
  return `${timePart}-${randomPart}`;
};

const generatePlaylistId = (userId?: string) => {
  const uniqueSegment = createUniqueSegment();
  if (userId && userId.length > 0) {
    return `playlist-${userId}-${uniqueSegment}`;
  }
  return `playlist-${uniqueSegment}`;
};

export const sanitizeUserPlaylistData = (
  data: UserPlaylistData,
  userId: string,
) => {
  const seen = new Set<string>();
  const idMap = new Map<string, string>();
  let didChange = false;

  const updatedPlaylists = data.playlists.map((playlist) => {
    const originalId = playlist.id;
    let nextId = originalId;
    const shouldRegenerate =
      !nextId ||
      LEGACY_PLAYLIST_ID_PATTERN.test(nextId) ||
      seen.has(nextId) ||
      (userId ? !nextId.startsWith(`playlist-${userId}-`) : false);

    if (shouldRegenerate) {
      let generatedId = "";
      do {
        generatedId = generatePlaylistId(userId);
      } while (seen.has(generatedId));
      if (originalId && !idMap.has(originalId)) {
        idMap.set(originalId, generatedId);
      }
      nextId = generatedId;
      didChange = true;
    } else if (originalId && !idMap.has(originalId)) {
      idMap.set(originalId, nextId);
    }

    seen.add(nextId);

    return {
      ...playlist,
      id: nextId,
    };
  });

  let normalizedPlaylists = updatedPlaylists;
  if (normalizedPlaylists.length > MAX_PLAYLIST_COUNT) {
    console.warn(
      `[Playlists] exceeded max playlist count (${MAX_PLAYLIST_COUNT}); trimming extra playlists before persistence.`,
    );
    normalizedPlaylists = normalizedPlaylists.slice(0, MAX_PLAYLIST_COUNT);
    didChange = true;
  }

  let nextActivePlaylistId = data.activePlaylistId;
  if (idMap.has(data.activePlaylistId)) {
    const mappedId = idMap.get(data.activePlaylistId) as string;
    if (mappedId !== data.activePlaylistId) {
      didChange = true;
    }
    nextActivePlaylistId = mappedId;
  } else if (
    nextActivePlaylistId &&
    !normalizedPlaylists.some(
      (playlist) => playlist.id === nextActivePlaylistId,
    )
  ) {
    if (normalizedPlaylists[0]) {
      nextActivePlaylistId = normalizedPlaylists[0].id;
    } else {
      nextActivePlaylistId = "";
    }
    didChange = true;
  }

  if (!nextActivePlaylistId && normalizedPlaylists[0]) {
    nextActivePlaylistId = normalizedPlaylists[0].id;
    if (nextActivePlaylistId !== data.activePlaylistId) {
      didChange = true;
    }
  }

  return {
    data: {
      playlists: normalizedPlaylists,
      activePlaylistId: nextActivePlaylistId,
      loopMode: data.loopMode,
      isShuffle: data.isShuffle,
    },
    didChange,
  };
};

export const mergePlaylistsForSync = (
  existingData: UserPlaylistData,
  cookieData: UserPlaylistData,
  userId: string,
): UserPlaylistData => {
  const mergedPlaylists = existingData.playlists.map((playlist) => ({
    ...playlist,
    items: [...playlist.items],
  }));

  for (const cookiePlaylist of cookieData.playlists) {
    const existingPlaylist = mergedPlaylists.find(
      (playlist) => playlist.name === cookiePlaylist.name,
    );

    if (existingPlaylist) {
      const existingVideoIds = new Set(
        existingPlaylist.items.map((item) => item.id),
      );
      for (const item of cookiePlaylist.items) {
        if (!existingVideoIds.has(item.id)) {
          existingPlaylist.items.push(item);
          existingVideoIds.add(item.id);
        }
      }
      continue;
    }

    if (mergedPlaylists.length >= MAX_PLAYLIST_COUNT) {
      console.warn(
        `[Playlists] reached max playlist count (${MAX_PLAYLIST_COUNT}). Skipping playlist "${cookiePlaylist.name}" from local data.`,
      );
      continue;
    }

    mergedPlaylists.push({
      ...cookiePlaylist,
      id: generatePlaylistId(userId),
    });
  }

  if (mergedPlaylists.length > MAX_PLAYLIST_COUNT) {
    console.warn(
      `[Playlists] exceeded max playlist count (${MAX_PLAYLIST_COUNT}); dropping ${mergedPlaylists.length - MAX_PLAYLIST_COUNT} playlist(s) before persistence.`,
    );
  }

  const limitedPlaylists = mergedPlaylists.slice(0, MAX_PLAYLIST_COUNT);

  let nextActivePlaylistId =
    existingData.activePlaylistId || cookieData.activePlaylistId;
  if (
    nextActivePlaylistId &&
    !limitedPlaylists.some((playlist) => playlist.id === nextActivePlaylistId)
  ) {
    nextActivePlaylistId = limitedPlaylists[0]?.id || "";
  }

  return {
    playlists: limitedPlaylists,
    activePlaylistId: nextActivePlaylistId,
    loopMode: existingData.loopMode,
    isShuffle: existingData.isShuffle,
  };
};

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

      const sanitized = sanitizeUserPlaylistData(result, userId);
      if (sanitized.didChange) {
        await this.saveUserPlaylists(userId, sanitized.data);
        return sanitized.data;
      }

      return sanitized.data;
    } catch (error) {
      console.error("Error fetching user playlists:", error);
      return null;
    }
  }

  async saveUserPlaylists(
    userId: string,
    data: UserPlaylistData,
  ): Promise<UserPlaylistData | null> {
    try {
      const sanitized = sanitizeUserPlaylistData(data, userId);
      const safeData = sanitized.data;
      // Start transaction-like operations
      // Delete existing playlists and items
      await this.db.delete(playlist).where(eq(playlist.userId, userId));

      // Insert playlists
      if (safeData.playlists.length > 0) {
        await this.db.insert(playlist).values(
          safeData.playlists.map((p, index) => ({
            id: p.id,
            userId,
            name: p.name,
            order: index,
          })),
        );

        // Insert playlist items
        const allItems = safeData.playlists.flatMap((p, _playlistIndex) =>
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
            activePlaylistId: safeData.activePlaylistId,
            loopMode: safeData.loopMode,
            isShuffle: safeData.isShuffle,
            updatedAt: new Date(),
          })
          .where(eq(userSettings.userId, userId));
      } else {
        await this.db.insert(userSettings).values({
          userId,
          activePlaylistId: safeData.activePlaylistId,
          loopMode: safeData.loopMode,
          isShuffle: safeData.isShuffle,
        });
      }

      return safeData;
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
      return null;
    }
  }

  async syncLocalStorageDataToDatabase(
    userId: string,
    localData: UserPlaylistData,
  ): Promise<UserPlaylistData | null> {
    // Get existing database data
    const existingData = await this.getUserPlaylists(userId);

    if (!existingData || existingData.playlists.length === 0) {
      // No existing data, save cookie data as-is
      return await this.saveUserPlaylists(userId, localData);
    }

    const mergedData = mergePlaylistsForSync(existingData, localData, userId);
    return await this.saveUserPlaylists(userId, mergedData);
  }
}
