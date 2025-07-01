import {
  DndContext,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2 } from 'lucide-react'; // Add GripVertical
import type React from 'react';
import { useState } from 'react';
import { Button } from '../../../components/ui/button';
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
    opacity: isDragging ? 0.8 : 1, // Visual feedback for dragging
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`relative rounded-lg shadow-sm transition-all duration-200 ${
        isDragging ? 'ring-2 ring-primary/50' : ''
      }`}
      {...attributes}
    >
      <div className="flex items-center w-full">
        <button
          type="button"
          className="p-3 cursor-grab text-muted-foreground hover:text-foreground"
          {...listeners} // Move listeners to the drag handle
        >
          <GripVertical className="h-5 w-5" />
          <span className="sr-only">Drag to reorder</span>
        </button>
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
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              removeFromPlaylist(index);
            }}
            className="flex-shrink-0 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-5 w-5" />
            <span className="sr-only">Remove</span>
          </Button>
        </button>
      </div>
    </li>
  );
};

export const PlaylistDisplay = () => {
  const { playlist, currentIndex, removeFromPlaylist, play, reorderPlaylist } =
    usePlayerStore();
  const [activeId, setActiveId] = useState<string | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    // Convert UniqueIdentifier to string and set as activeId
    setActiveId(event.active.id.toString());
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = playlist.findIndex((item) => item.id === active.id);
      const newIndex = playlist.findIndex((item) => item.id === over?.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        reorderPlaylist(oldIndex, newIndex);
      }
    }
    setActiveId(null);
  };

  const activeItem = activeId
    ? playlist.find((item) => item.id === activeId)
    : null;

  return (
    <div className="space-y-4 container mx-auto">
      <h3 className="font-semibold text-lg">Playlist</h3>
      {playlist.length === 0 ? (
        <div className="text-center text-muted-foreground p-8 border border-dashed rounded-lg">
          <p className="mb-2">Playlist is empty.</p>
          <p className="text-sm">Add YouTube URLs to add videos here!</p>
        </div>
      ) : (
        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
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
