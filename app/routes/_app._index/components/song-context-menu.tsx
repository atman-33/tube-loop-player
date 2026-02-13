import { FolderOpen, ListMusic } from "lucide-react";
import type React from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "~/components/ui/context-menu";
import { usePlayerStore } from "~/stores/player";
import { FAVORITES_PLAYLIST_ID } from "~/stores/player/constants";
import type { PlaylistItem } from "~/lib/player/types";

interface SongContextMenuProps {
  item: PlaylistItem;
  index: number;
  children: React.ReactNode;
  currentPlaylistId: string;
}

export const SongContextMenu: React.FC<SongContextMenuProps> = ({
  item,
  index,
  children,
  currentPlaylistId,
}) => {
  const { getPlaylistsWithFavorites, moveItemBetweenPlaylists } =
    usePlayerStore();

  const allPlaylists = getPlaylistsWithFavorites();
  const targetPlaylists = allPlaylists.filter(
    (playlist) =>
      playlist.id !== currentPlaylistId && playlist.id !== FAVORITES_PLAYLIST_ID
  );

  const handleMoveToPlaylist = async (targetPlaylistId: string) => {
    const success = moveItemBetweenPlaylists(
      index,
      currentPlaylistId,
      targetPlaylistId
    );

    if (success) {
      const targetPlaylist = allPlaylists.find(
        (p) => p.id === targetPlaylistId
      );
      const { toast } = await import("sonner");
      toast.success(`Moved "${item.title}" to "${targetPlaylist?.name}"`);
    } else {
      const { toast } = await import("sonner");
      toast.error("Failed to move song. It may already exist in the target playlist.");
    }
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuLabel className="flex items-center gap-2">
          <FolderOpen className="h-4 w-4" />
          <span className="truncate">{item.title}</span>
        </ContextMenuLabel>
        <ContextMenuSeparator />

        <ContextMenuSub>
          <ContextMenuSubTrigger className="flex items-center gap-2">
            <ListMusic className="h-4 w-4" />
            <span>Move to Playlist</span>
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-48">
            {targetPlaylists.length === 0 ? (
              <ContextMenuItem disabled>
                <span className="text-muted-foreground text-sm">
                  No other playlists available
                </span>
              </ContextMenuItem>
            ) : (
              targetPlaylists.map((playlist) => (
                <ContextMenuItem
                  key={playlist.id}
                  onClick={() => handleMoveToPlaylist(playlist.id)}
                  className="cursor-pointer"
                >
                  <span className="truncate">{playlist.name}</span>
                </ContextMenuItem>
              ))
            )}
          </ContextMenuSubContent>
        </ContextMenuSub>
      </ContextMenuContent>
    </ContextMenu>
  );
};
