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

  return (
    <div
      ref={setNodeRef}
      className={`flex items-center group relative p-2 rounded-lg transition-all min-h-[48px] ${
        isOver && activePlaylistId !== playlist.id
          ? 'ring-2 ring-primary bg-primary/10 scale-105'
          : ''
      }`}
    >
      <button
        type="button"
        id={`playlist-tab-${playlist.id}`}
        onClick={() => onSetActive(playlist.id)}
        className={`relative px-4 py-2 rounded-lg border transition-all ${
          activePlaylistId === playlist.id
            ? 'bg-primary text-primary-foreground'
            : 'bg-card hover:bg-card-foreground/5'
        }`}
      >
        {editingId === playlist.id ? (
          <div className="flex items-center gap-1">
            <Input
              value={editingName}
              onChange={(e) => onEditingNameChange(e.target.value)}
              className="h-6 w-20 text-xs"
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
              className="h-4 w-4"
              onClick={(e) => {
                e.stopPropagation();
                onSaveEdit();
              }}
            >
              <Check className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="truncate max-w-24 text-sm font-medium">
              {playlist.name}
            </span>
            <span className="text-xs opacity-70">
              ({playlist.items.length})
            </span>
          </div>
        )}
      </button>

      {editingId !== playlist.id && (
        <div className="absolute -right-1 -top-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6 bg-background border"
            onClick={(e) => {
              e.stopPropagation();
              onStartEdit(playlist);
            }}
          >
            <Edit2 className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
};
