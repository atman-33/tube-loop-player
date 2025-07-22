import {
  DndContext,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
  type DragOverEvent,
  useSensor,
  useSensors,
  PointerSensor,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2 } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { Button } from '../../../components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '../../../components/ui/tooltip';
import { usePlayerStore } from '../../../stores/player';

const getThumbnailUrl = (videoId: string) =>
  `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;

interface SortableItemProps {
  item: { id: string; title?: string };
  index: number;
  currentIndex: number | null;
  play: (videoId: string) => void;
  removeFromPlaylist: (index: number) => void;
}

const SortableItem: React.FC<SortableItemProps> = ({
  item,
  index,
  currentIndex,
  play,
  removeFromPlaylist,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0, // Ensure dragging item is on top
    opacity: isDragging ? 0.1 : 1, // Visual feedback for dragging
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`relative rounded-lg shadow-sm transition-all duration-200 list-none ${
        isDragging ? 'ring-2 ring-primary/50' : ''
      }`}
      {...attributes}
    >
      <div className="flex items-center w-full transition-all duration-300 transform hover:scale-105">
        <button
          type="button"
          className="p-3 cursor-grab text-muted-foreground hover:text-foreground"
          {...listeners} // Move listeners to the drag handle
        >
          <GripVertical className="h-5 w-5" />
          <span className="sr-only">Drag to reorder</span>
        </button>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className={`flex-1 flex items-center gap-4 p-3 border-l-0 rounded-r-lg shadow-sm transition-all duration-200 cursor-pointer w-0 ${
                currentIndex === index
                  ? 'bg-primary/10 border-primary ring-2 ring-primary/50'
                  : 'bg-card hover:bg-card-foreground/5'
              }`}
              onClick={() => play(item.id)}
            >
              <img
                src={getThumbnailUrl(item.id)}
                alt={item.title}
                className="w-24 h-14 object-cover rounded-md flex-shrink-0"
              />
              <div className="flex-1 min-w-0 overflow-hidden text-left font-medium text-foreground hover:text-primary transition-colors truncate text-ellipsis whitespace-nowrap block md:hidden lg:block">
                {item.title || `Video ${index + 1}`}
              </div>
              <Button
                asChild
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFromPlaylist(index);
                }}
                className="flex-shrink-0 text-muted-foreground hover:text-destructive"
              >
                <span className="transition-all duration-300 transform hover:scale-105">
                  <Trash2 className="h-5 w-5" />
                  <span className="sr-only">Remove</span>
                </span>
              </Button>
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{item.title || `Video ${index + 1}`}</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </li>
  );
};

export const PlaylistDisplay = () => {
  const {
    playlists,
    activePlaylistId,
    currentIndex,
    removeFromPlaylist,
    play,
    reorderPlaylist,
    moveItemBetweenPlaylists,
    getActivePlaylist,
  } = usePlayerStore();

  const [activeId, setActiveId] = useState<string | null>(null);
  const [dragOverPlaylistId, setDragOverPlaylistId] = useState<string | null>(
    null,
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  const activePlaylist = getActivePlaylist();
  const playlist = activePlaylist?.items || [];

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id.toString());
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    if (over?.id.toString().startsWith('playlist-tab-')) {
      const playlistId = over.id.toString().replace('playlist-tab-', '');
      setDragOverPlaylistId(playlistId);
    } else {
      setDragOverPlaylistId(null);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      setDragOverPlaylistId(null);
      return;
    }

    // Check if dropping on a playlist tab
    if (over.id.toString().startsWith('playlist-tab-')) {
      const targetPlaylistId = over.id.toString().replace('playlist-tab-', '');
      const itemIndex = playlist.findIndex((item) => item.id === active.id);

      if (itemIndex !== -1 && targetPlaylistId !== activePlaylistId) {
        moveItemBetweenPlaylists(itemIndex, activePlaylistId, targetPlaylistId);
      }
    } else if (active.id !== over.id) {
      // Reordering within the same playlist
      const oldIndex = playlist.findIndex((item) => item.id === active.id);
      const newIndex = playlist.findIndex((item) => item.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        reorderPlaylist(oldIndex, newIndex);
      }
    }

    setActiveId(null);
    setDragOverPlaylistId(null);
  };

  const activeItem = activeId
    ? playlist.find((item) => item.id === activeId)
    : null;

  return (
    <div className="space-y-4 container mx-auto">
      <h3 className="font-semibold text-lg">
        {activePlaylist?.name || 'Playlist'}
      </h3>

      {playlist.length === 0 ? (
        <div className="text-center text-muted-foreground p-8 border border-dashed rounded-lg">
          <p className="mb-2">The playlist is empty.</p>
          <p className="text-sm">Add YouTube URLs to add videos!</p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          {/* Drop zones for other playlists */}
          {playlists.filter((pl) => pl.id !== activePlaylistId).length > 0 && (
            <div className="flex gap-2 mb-4 overflow-x-auto">
              <p className="text-sm text-muted-foreground py-2">
                Drag to other playlists:
              </p>
              {playlists
                .filter((pl) => pl.id !== activePlaylistId)
                .map((pl) => (
                  <div
                    key={pl.id}
                    id={`playlist-tab-${pl.id}`}
                    className={`px-3 py-2 rounded-lg border transition-all bg-card hover:bg-card-foreground/5 ${
                      dragOverPlaylistId === pl.id
                        ? 'ring-2 ring-primary bg-primary/10'
                        : ''
                    }`}
                  >
                    <span className="text-sm font-medium">{pl.name}</span>
                    <span className="ml-2 text-xs opacity-70">
                      ({pl.items.length})
                    </span>
                  </div>
                ))}
            </div>
          )}

          <SortableContext
            items={playlist.map((item) => item.id)}
            strategy={verticalListSortingStrategy}
          >
            <ul className="space-y-3">
              {playlist.map((item, index) => (
                <SortableItem
                  key={item.id}
                  item={item}
                  index={index}
                  currentIndex={currentIndex}
                  play={play}
                  removeFromPlaylist={removeFromPlaylist}
                />
              ))}
            </ul>
          </SortableContext>
          <DragOverlay>
            {activeItem ? (
              <SortableItem
                item={activeItem}
                index={playlist.findIndex((item) => item.id === activeId)}
                currentIndex={currentIndex}
                play={play}
                removeFromPlaylist={removeFromPlaylist}
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  );
};
