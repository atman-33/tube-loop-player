import type { Playlist, PlaylistItem } from "~/lib/player/types";

export const defaultInitialVideoId = "V4UL6BYgUXw";

const defaultInitialPlaylistItem: PlaylistItem = {
  id: defaultInitialVideoId,
  title: "Aerith's Theme | Pure | Final Fantasy VII Rebirth Soundtrack",
};

export const DEFAULT_PLAYLIST_IDS = [
  "playlist-default-1",
  "playlist-default-2",
  "playlist-default-3",
] as const;

export const createDefaultPlaylists = (): Playlist[] => [
  {
    id: DEFAULT_PLAYLIST_IDS[0],
    name: "Playlist 1",
    items: [defaultInitialPlaylistItem],
  },
  {
    id: DEFAULT_PLAYLIST_IDS[1],
    name: "Playlist 2",
    items: [],
  },
  {
    id: DEFAULT_PLAYLIST_IDS[2],
    name: "Playlist 3",
    items: [],
  },
];

export const defaultPlaylists = createDefaultPlaylists();

export const defaultActivePlaylistId = defaultPlaylists[0]?.id ?? "";
