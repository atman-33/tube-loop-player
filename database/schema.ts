import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { account, session, user, verification } from "./auth-schema";

const guestBook = sqliteTable("guestBook", {
  id: integer().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  email: text().notNull().unique(),
});

const playlist = sqliteTable("playlist", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  order: integer("order").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

const playlistItem = sqliteTable("playlist_item", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  playlistId: text("playlist_id")
    .notNull()
    .references(() => playlist.id, { onDelete: "cascade" }),
  videoId: text("video_id").notNull(),
  title: text("title"),
  order: integer("order").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

const userSettings = sqliteTable("user_settings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" })
    .unique(),
  activePlaylistId: text("active_playlist_id"),
  loopMode: text("loop_mode", { enum: ["all", "one"] })
    .notNull()
    .default("all"),
  isShuffle: integer("is_shuffle", { mode: "boolean" })
    .notNull()
    .default(false),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

const pinnedSongs = sqliteTable("pinned_songs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  videoId: text("video_id").notNull(),
  pinnedAt: integer("pinned_at").notNull(),
});

export const schema = {
  user,
  session,
  account,
  verification,
  guestBook,
  playlist,
  playlistItem,
  userSettings,
  pinnedSongs,
};

export {
  account,
  guestBook,
  pinnedSongs,
  playlist,
  playlistItem,
  session,
  user,
  userSettings,
  verification,
};
