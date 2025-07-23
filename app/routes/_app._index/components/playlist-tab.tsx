import { Edit2, Check } from 'lucide-react';
import { useDroppable } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';

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
  totalTabs,
}: PlaylistTabProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });
  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: `playlist-tab-${playlist.id}`,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const setCombinedRefs = (el: HTMLElement | null) => {
    setNodeRef(el);
    setDroppableRef(el);
  };

  const isActive = activePlaylistId === playlist.id;
  const isEditing = editingId === playlist.id;

  // Calculate responsive width based on number of tabs
  const getTabWidth = () => {
    if (totalTabs === 1) return 'flex-1 max-w-80';
    if (totalTabs === 2) return 'flex-1 max-w-40';
    if (totalTabs === 3) return 'flex-1 max-w-32';
    if (totalTabs === 4) return 'flex-1 max-w-24';
    return 'flex-1 max-w-20';
  };

  const width = getTabWidth();

  return (
    <div
      ref={setCombinedRefs}
      className={`relative group ${width}`}
      style={style}
      {...attributes}
      {...listeners}
    >
      <button
        type="button"
        id={`playlist-tab-${playlist.id}`}
        onClick={() => onSetActive(playlist.id)}
        onDoubleClick={(e) => {
          e.stopPropagation();
          onStartEdit(playlist);
        }}
        className={`
          relative px-1 py-3 font-medium text-xs transition-all duration-200 ease-out
          w-full h-12 flex items-center justify-center overflow-hidden cursor-grab
          ${isActive
            ? 'text-foreground bg-background border-l border-r border-t border-border/50 z-10'
            : isOver
              ? 'text-foreground bg-background/90 border border-primary/30 z-5'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/30 z-0 bg-muted/10 border border-transparent hover:border-border/30'
          }
          ${isActive ? 'rounded-t-lg' : 'rounded-t-md'}
        `}
        style={{
          ...(isActive && {
            borderBottomColor: 'transparent',
            marginBottom: '-1px',
            boxShadow:
              '0 -2px 8px rgba(0,0,0,0.08), 0 -1px 4px rgba(0,0,0,0.04)',
          }),
        }}
      >
        {isEditing ? (
          <div className="flex items-center gap-1 w-full overflow-hidden">
            <Input
              value={editingName}
              onChange={(e) => onEditingNameChange(e.target.value)}
              className="h-7 text-xs border-0 bg-transparent p-1 focus:bg-background/50 flex-1 min-w-0"
              onKeyDown={(e) => {
                e.stopPropagation(); // Prevent parent event handlers from interfering
                if (e.key === 'Enter') {
                  e.preventDefault();
                  onSaveEdit();
                } else if (e.key === 'Escape') {
                  e.preventDefault();
                  onCancelEdit();
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
              title={playlist.name} // Show full name on hover
            >
              {playlist.name}
            </div>
            <div
              className={`
                text-xs opacity-70 font-normal mt-0.5 transition-colors duration-200
                ${isActive ? 'text-primary' : 'text-muted-foreground'}
              `}
            >
              {totalTabs >= 4
                ? playlist.items.length
                : `${playlist.items.length} items`}
            </div>
          </div>
        )}
      </button>

      {/* Edit button - only show when there's space or on active tab */}
      {!isEditing && (totalTabs <= 3 || isActive) && (
        <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-all duration-200 z-20">
          <Button
            size="icon"
            variant="ghost"
            className="h-5 w-5 bg-background border shadow-sm hover:bg-muted hover:scale-105 transition-all duration-200"
            onClick={(e) => {
              e.stopPropagation();
              onStartEdit(playlist);
            }}
          >
            <Edit2 className="h-2.5 w-2.5" />
          </Button>
        </div>
      )}

      {/* Drop indicator - improved visibility */}
      {isOver && !isActive && (
        <>
          {/* Bright border highlight */}
          <div className="absolute inset-0 border-2 border-primary rounded-t-lg pointer-events-none z-10" />
          {/* Subtle background highlight without blur */}
          <div className="absolute inset-0 bg-primary/10 rounded-t-lg pointer-events-none" />
        </>
      )}
    </div>
  );
};
