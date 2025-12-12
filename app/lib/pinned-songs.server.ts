import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import type { AppLoadContext } from "react-router";
import { pinnedSongs } from "~/database/schema";

export interface PinnedSongsData {
  pinnedVideoIds: string[];
  pinnedOrder: string[];
}

/**
 * Load pinned songs from database for authenticated user
 */
export const loadPinnedSongs = async (
  userId: string,
  context: AppLoadContext,
): Promise<PinnedSongsData> => {
  const db = drizzle(context.cloudflare.env.DB);

  const rows = await db
    .select()
    .from(pinnedSongs)
    .where(eq(pinnedSongs.userId, userId))
    .orderBy(pinnedSongs.pinnedAt)
    .all();

  const videoIds = rows.map((row) => row.videoId);

  return {
    pinnedVideoIds: videoIds,
    pinnedOrder: videoIds,
  };
};

/**
 * Sync pinned songs to database for authenticated user
 * Performs a full replace of the user's pinned songs
 */
export const syncPinnedSongs = async (
  userId: string,
  data: PinnedSongsData,
  context: AppLoadContext,
): Promise<PinnedSongsData> => {
  const db = drizzle(context.cloudflare.env.DB);

  // Delete existing pinned songs for this user
  await db.delete(pinnedSongs).where(eq(pinnedSongs.userId, userId));

  // Insert new pinned songs in order
  if (data.pinnedOrder.length > 0) {
    const now = Date.now();
    const insertData = data.pinnedOrder.map((videoId, index) => ({
      userId,
      videoId,
      pinnedAt: now + index, // Maintain order with sequential timestamps
    }));

    await db.insert(pinnedSongs).values(insertData);
  }

  // Return the synced data
  return data;
};
