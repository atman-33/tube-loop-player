import { MAX_PLAYLIST_COUNT } from "~/lib/playlist-limits";
import { FAVORITES_PLAYLIST_ID } from "~/stores/player/constants";
import type { Playlist, PlaylistItem } from "./types";

const PLAYLIST_NAME_PATTERN = /^Playlist (\d+)$/i;

export const deriveNextPlaylistName = (playlists: Playlist[]) => {
  const usedNumbers = new Set<number>();
  let highest = 0;

  for (const playlist of playlists) {
    const match = PLAYLIST_NAME_PATTERN.exec(playlist.name);
    if (match) {
      const value = Number.parseInt(match[1], 10);
      if (!Number.isNaN(value)) {
        usedNumbers.add(value);
        if (value > highest) {
          highest = value;
        }
      }
    }
  }

  for (let index = 1; index <= MAX_PLAYLIST_COUNT; index += 1) {
    if (!usedNumbers.has(index)) {
      return `Playlist ${index}`;
    }
  }

  return `Playlist ${highest + 1}`;
};

export const deriveDuplicatePlaylistName = (
  baseName: string,
  playlists: Playlist[],
) => {
  const baseCopyName = `${baseName} Copy`;
  const existingNames = new Set(playlists.map((playlist) => playlist.name));
  if (!existingNames.has(baseCopyName)) {
    return baseCopyName;
  }

  let suffix = 2;
  while (suffix < 100) {
    const candidate = `${baseCopyName} ${suffix}`;
    if (!existingNames.has(candidate)) {
      return candidate;
    }
    suffix += 1;
  }

  return `${baseCopyName} ${Date.now()}`;
};

export const enforcePlaylistBounds = (
  playlists: Playlist[],
  activePlaylistId: string,
) => {
  const trimmed = playlists.slice(0, MAX_PLAYLIST_COUNT);
  let nextActiveId = activePlaylistId;

  // Favorites is a special virtual playlist that doesn't exist in the playlists array
  if (nextActiveId === FAVORITES_PLAYLIST_ID) {
    return {
      playlists: trimmed,
      activePlaylistId: nextActiveId,
      canCreatePlaylist: trimmed.length < MAX_PLAYLIST_COUNT,
    };
  }

  if (trimmed.length === 0) {
    nextActiveId = "";
  } else if (!trimmed.some((playlist) => playlist.id === nextActiveId)) {
    nextActiveId = trimmed[0].id;
  }

  return {
    playlists: trimmed,
    activePlaylistId: nextActiveId,
    canCreatePlaylist: trimmed.length < MAX_PLAYLIST_COUNT,
  };
};

export const clonePlaylistItems = (items: PlaylistItem[]) =>
  items.map((item) => ({ ...item }));
