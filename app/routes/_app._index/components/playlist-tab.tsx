import { useCallback, useEffect, useMemo, useState, type KeyboardEvent } from 'react';
import { Edit2, Check } from 'lucide-react';
import { useDroppable, useDndContext } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { usePlayerStore } from '../../../stores/player';
import { PLAYLIST_PANEL_ID } from './playlist-aria';

interface PlaylistItem {
  id: string;
  title?: string;
}

interface PlaylistTabProps {
  id: string;
  playlist: { id: string; name: string; items: PlaylistItem[]; };
  activePlaylistId: string;
  editingId: string | null;
  editingName: string;
  onSetActive: (id: string) => void;
  onStartEdit: (playlist: { id: string; name: string; }) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onEditingNameChange: (name: string) => void;
  index: number;
  totalTabs: number;
}

export const PlaylistTab = ({
  id,
  playlist,
  activePlaylistId,
  editingId,
  editingName,
  onSetActive,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onEditingNameChange,
  index,
  totalTabs,
}: PlaylistTabProps) => {
  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: `playlist-tab-${playlist.id}`,
  });

  const { role: _dragRole, tabIndex: _dragTabIndex, ...sortableAttributes } = attributes;

  const sortableStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isActive = activePlaylistId === playlist.id;
  const isEditing = editingId === playlist.id;

  // Get current drag context to determine what's being dragged
  const { active } = useDndContext();

  // Get all playlists to determine if the active drag item is a tab or playlist item
  const { playlists, reorderPlaylists } = usePlayerStore();

  // Determine if we're currently dragging a playlist item (not a tab)
  const isDraggingPlaylistItem = active && !playlists.some(p => p.id === active.id.toString());

  // Create conditional ref function
  const conditionalSortableRef = isDraggingPlaylistItem ? () => {} : setSortableRef;

  const [isKeyboardSorting, setIsKeyboardSorting] = useState(false);
  const playlistOrderIndex = useMemo(
    () => playlists.findIndex((entry) => entry.id === playlist.id),
    [playlists, playlist.id],
  );
  const canMoveLeft = playlistOrderIndex > 0;
  const canMoveRight = playlistOrderIndex > -1 && playlistOrderIndex < playlists.length - 1;
  const ariaHintId = `playlist-tab-${playlist.id}-hint`;

  useEffect(() => {
    if (isDragging || isEditing) {
      setIsKeyboardSorting(false);
    }
  }, [isDragging, isEditing]);

  const handleKeyboardReorder = useCallback((event: KeyboardEvent<HTMLButtonElement>) => {
    if (isEditing) {
      return;
    }

    if (event.key === ' ' || event.key === 'Spacebar') {
      event.preventDefault();
      setIsKeyboardSorting((prev) => !prev);
      return;
    }

    if (!isKeyboardSorting) {
      return;
    }

    if (event.key === 'Escape' || event.key === 'Enter') {
      event.preventDefault();
      setIsKeyboardSorting(false);
      return;
    }

    if (event.key === 'ArrowLeft' && canMoveLeft && playlistOrderIndex > -1) {
      event.preventDefault();
      reorderPlaylists(playlistOrderIndex, playlistOrderIndex - 1);
      return;
    }

    if (event.key === 'ArrowRight' && canMoveRight && playlistOrderIndex > -1) {
      event.preventDefault();
      reorderPlaylists(playlistOrderIndex, playlistOrderIndex + 1);
    }
  }, [canMoveLeft, canMoveRight, isEditing, isKeyboardSorting, playlistOrderIndex, reorderPlaylists]);

  const instructionalMessage = isKeyboardSorting
    ? 'Use the arrow keys to move this playlist. Press Enter to drop or Escape to cancel.'
    : 'Press Space to start keyboard reordering for this playlist.';

  return (
    <div
      ref={conditionalSortableRef}
      data-playlist-tab
      data-playlist-tab-id={playlist.id}
      className="relative group flex-none w-[80px] basis-[80px] min-w-[80px] max-w-[80px] md:w-[120px] md:basis-[120px] md:min-w-[120px] md:max-w-[120px]"
      style={sortableStyle}
      {...sortableAttributes}
      {...listeners}
    >
      <div ref={setDroppableRef} className="w-full h-full">
        <button
          type="button"
          id={`playlist-tab-${playlist.id}`}
          onClick={() => onSetActive(playlist.id)}
          onDoubleClick={(e) => {
            e.stopPropagation();
            onStartEdit(playlist);
          }}
          onKeyDown={handleKeyboardReorder}
          className={`
            relative px-0.5 py-0.5 font-medium text-xs transition-all duration-200 ease-out
            w-full h-12 flex flex-col items-center justify-center overflow-hidden cursor-pointer transform
            border rounded-t-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60
            ${isActive
              ? 'text-foreground bg-background border-border/70 shadow-[0_-2px_8px_rgba(0,0,0,0.08)] scale-[1.02]'
              : isOver
                ? 'text-foreground bg-background/90 border-primary/30'
                : 'text-muted-foreground bg-muted/20 border-transparent hover:text-foreground hover:bg-muted/30'}
            ${isKeyboardSorting ? 'ring-2 ring-primary/50' : ''}
          `}
          aria-controls={PLAYLIST_PANEL_ID}
          aria-describedby={ariaHintId}
          aria-grabbed={isKeyboardSorting ? 'true' : 'false'}
          aria-posinset={index + 1}
          aria-setsize={totalTabs}
        >
          {isEditing ? (
            <div className="flex items-center gap-1 w-full overflow-hidden">
              <Input
                value={editingName}
                onChange={(e) => onEditingNameChange(e.target.value)}
                className="h-7 text-xs border-0 bg-transparent p-1 focus:bg-background/50 flex-1 min-w-0"
                onKeyDown={(e) => {
                  e.stopPropagation();
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    onSaveEdit();
                  } else if (e.key === 'Escape') {
                    e.preventDefault();
                    onCancelEdit();
                  } else if (e.key === ' ') {
                    e.preventDefault();
                    onEditingNameChange(editingName + ' ');
                  }
                }}
                onBlur={() => onSaveEdit()}
                onClick={(e) => e.stopPropagation()}
                autoFocus
              />
              <Button
                size="icon"
                variant="ghost"
                className="h-5 w-5 hover:bg-primary/10 flex-shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onSaveEdit();
                }}
              >
                <Check className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center w-full min-w-0 overflow-hidden">
              <div
                className="font-medium text-xs text-center w-full truncate leading-tight"
                title={playlist.name}
              >
                {playlist.name}
              </div>
              <div
                className={`text-[11px] opacity-80 font-normal mt-0.5 transition-colors duration-200 ${isActive ? 'text-primary' : 'text-muted-foreground'
                  }`}
              >
                {playlist.items.length === 1
                  ? '1 item'
                  : `${playlist.items.length} items`}
              </div>
            </div>
          )}
        </button>

        <span id={ariaHintId} className="sr-only" aria-live="polite">
          {instructionalMessage}
        </span>

        {/* Edit Button */}
        {!isEditing && (totalTabs <= 3 || isActive) && (
          <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-all duration-200 z-20">
            <Button
              size="icon"
              variant="ghost"
              className="h-5 w-5 bg-background shadow-sm hover:bg-muted hover:scale-105 transition-all duration-200"
              onClick={(e) => {
                e.stopPropagation();
                onStartEdit(playlist);
              }}
            >
              <Edit2 className="h-2.5 w-2.5" />
            </Button>
          </div>
        )}

        {/* Drop Indicator */}
        {isOver && !isActive && (
          <>
            <div className="absolute inset-0 border-2 border-primary rounded-t-lg pointer-events-none z-10" />
            <div className="absolute inset-0 bg-primary/10 rounded-t-lg pointer-events-none" />
          </>
        )}
      </div>
    </div>
  );
};
