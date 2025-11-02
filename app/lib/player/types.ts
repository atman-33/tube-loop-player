export interface PlaylistItem {
  id: string;
  title?: string;
}

export interface Playlist {
  id: string;
  name: string;
  items: PlaylistItem[];
}

export type LoopMode = "all" | "one";
