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
          relative px-4 py-3 font-medium text-sm transition-all duration-200 ease-out
          min-w-[120px] max-w-[180px] h-12 flex items-center justify-center
          ${
            isActive
              ? 'text-foreground bg-background border-l border-r border-t border-border/50 z-10'
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
          <div className="flex items-center gap-2 w-full min-w-0">
            <span className="truncate font-medium flex-1">{playlist.name}</span>
            <span
              className={`
                text-xs px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 transition-colors duration-200
                ${
                  isActive
                    ? 'bg-primary/15 text-primary'
                    : 'bg-muted-foreground/10 text-muted-foreground'
                }
              `}
            >
              {playlist.items.length}
            </span>
          </div>
        )}
      </button>

      {/* Edit button */}
      {!isEditing && (
        <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-all duration-200 z-20">
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6 bg-background border shadow-sm hover:bg-muted hover:scale-105 transition-all duration-200"
            onClick={(e) => {
              e.stopPropagation();
              onStartEdit(playlist);
            }}
          >
            <Edit2 className="h-3 w-3" />
          </Button>
        </div>
      )}

      {/* Drop indicator */}
      {isOver && !isActive && (
        <div className="absolute inset-0 bg-primary/8 border-2 border-dashed border-primary/40 rounded-t-lg backdrop-blur-sm" />
      )}
    </div>
  );
};
