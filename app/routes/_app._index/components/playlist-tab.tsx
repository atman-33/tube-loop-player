import { Edit2, Check } from 'lucide-react';
import { useDroppable } from '@dnd-kit/core';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';

interface PlaylistItem {
  id: string;
  title?: string;
}

interface PlaylistTabProps {
  playlist: { id: string; name: string; items: PlaylistItem[] };
  activePlaylistId: string;
  editingId: string | null;
  editingName: string;
  onSetActive: (id: string) => void;
  onStartEdit: (playlist: { id: string; name: string }) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onEditingNameChange: (name: string) => void;
  index: number;
}

export const PlaylistTab = ({
  playlist,
  activePlaylistId,
  editingId,
  editingName,
  onSetActive,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onEditingNameChange,
}: PlaylistTabProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `playlist-tab-${playlist.id}`,
  });

  const isActive = activePlaylistId === playlist.id;
  const isEditing = editingId === playlist.id;

  return (
    <div
      ref={setNodeRef}
      className={`relative group ${
        isOver && !isActive
          ? 'ring-2 ring-primary/50 ring-offset-2 ring-offset-background'
          : ''
      }`}
    >
      <button
        type="button"
        id={`playlist-tab-${playlist.id}`}
        onClick={() => onSetActive(playlist.id)}
        className={`
          relative px-4 py-3 font-medium text-sm transition-all duration-300 ease-out
          w-36 h-12 flex items-center justify-center
          ${
            isActive
              ? 'text-foreground bg-transparent z-10 transform translate-y-0'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/30 hover:transform hover:-translate-y-0.5 z-0 bg-muted/20'
          }
          ${isActive ? 'rounded-t-xl' : 'rounded-t-lg'}
          border-t border-l border-r border-border/50
          ${isActive ? 'border-border/50' : 'border-transparent hover:border-border/30'}
        `}
        style={{
          ...(isActive && {
            borderBottomColor: 'transparent',
            marginBottom: '-1px',
          }),
        }}
      >
        {isEditing ? (
          <div className="flex items-center gap-2 w-full">
            <Input
              value={editingName}
              onChange={(e) => onEditingNameChange(e.target.value)}
              className="h-7 text-xs border-0 bg-transparent p-1 focus:bg-background/50 flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter') onSaveEdit();
                if (e.key === 'Escape') onCancelEdit();
              }}
              onClick={(e) => e.stopPropagation()}
              autoFocus
            />
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 hover:bg-primary/10 flex-shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                onSaveEdit();
              }}
            >
              <Check className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 w-full min-w-0">
            <span className="truncate font-medium text-center flex-1">
              {playlist.name}
            </span>
            <span
              className={`
                text-xs px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 transition-colors duration-200
                ${
                  isActive
                    ? 'bg-primary/15 text-primary border border-primary/20'
                    : 'bg-muted-foreground/10 text-muted-foreground border border-transparent'
                }
              `}
            >
              {playlist.items.length}
            </span>
          </div>
        )}

        {/* Subtle gradient overlay for active tab */}
        {isActive && (
          <div className="absolute inset-0 bg-gradient-to-b from-background/5 to-transparent rounded-t-xl pointer-events-none" />
        )}
      </button>

      {/* Edit button */}
      {!isEditing && (
        <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-all duration-200 z-20">
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 bg-background border shadow-md hover:bg-muted hover:scale-105 transition-all duration-200 rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              onStartEdit(playlist);
            }}
          >
            <Edit2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      {/* Drop indicator */}
      {isOver && !isActive && (
        <div className="absolute inset-0 bg-primary/8 border-2 border-dashed border-primary/40 rounded-t-lg backdrop-blur-sm" />
      )}

      {/* Active state glow effect */}
      {isActive && (
        <div className="absolute inset-0 rounded-t-xl bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
      )}
    </div>
  );
};
