export const MAX_PLAYLIST_COUNT = 10;

export const DEFAULT_PLAYLIST_NAME_PATTERN = /^Playlist \d+$/i;

export const buildDefaultPlaylistName = (index: number) => `Playlist ${index}`;

export const isSequentialDefaultPlaylistName = (
  name: string,
  position: number,
) => name === buildDefaultPlaylistName(position);
