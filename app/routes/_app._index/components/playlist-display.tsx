import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2 } from 'lucide-react';
import type React from 'react';
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
    zIndex: isDragging ? 1000 : 0,
    opacity: isDragging ? 0.5 : 1,
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
          className={`p-3 text-muted-foreground hover:text-foreground ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
          {...listeners}
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
  const { currentIndex, removeFromPlaylist, play, getActivePlaylist } =
    usePlayerStore();

  const activePlaylist = getActivePlaylist();
  const playlist = activePlaylist?.items || [];

  return (
    <div className="space-y-4 container mx-auto">
      {playlist.length === 0 ? (
        <div className="text-center text-muted-foreground p-8 border border-dashed rounded-lg">
          <p className="mb-2">The playlist is empty.</p>
          <p className="text-sm">Add YouTube URLs to add videos!</p>
        </div>
      ) : (
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
      )}
    </div>
  );
};
