import type { Playlist } from "./types";

export const LEGACY_PLAYLIST_ID_PATTERN = /^playlist-\d+$/;

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

export const generatePlaylistId = (userId?: string) => {
  const uniqueSegment = createUniqueSegment();
  if (userId && userId.length > 0) {
    return `playlist-${userId}-${uniqueSegment}`;
  }
  return `playlist-${uniqueSegment}`;
};

export const sanitizePlaylistIdentifiers = (
  playlists: Playlist[],
  activePlaylistId: string,
  userId?: string,
) => {
  const seen = new Set<string>();
  const idMap = new Map<string, string>();
  let didChange = false;

  const updatedPlaylists = playlists.map((playlist) => {
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

  let nextActivePlaylistId = activePlaylistId;
  if (idMap.has(activePlaylistId)) {
    const mappedId = idMap.get(activePlaylistId) as string;
    if (mappedId !== activePlaylistId) {
      didChange = true;
    }
    nextActivePlaylistId = mappedId;
  } else if (
    activePlaylistId &&
    !updatedPlaylists.some((playlist) => playlist.id === activePlaylistId)
  ) {
    if (updatedPlaylists[0]) {
      nextActivePlaylistId = updatedPlaylists[0].id;
    } else {
      nextActivePlaylistId = "";
    }
    didChange = true;
  }

  if (!nextActivePlaylistId && updatedPlaylists[0]) {
    nextActivePlaylistId = updatedPlaylists[0].id;
    if (nextActivePlaylistId !== activePlaylistId) {
      didChange = true;
    }
  }

  return {
    playlists: updatedPlaylists,
    activePlaylistId: nextActivePlaylistId,
    didChange,
  };
};
