import { Plus, X, Edit2, Check } from 'lucide-react';
import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { usePlayerStore } from '../../../stores/player';

interface PlaylistTabProps {
  playlist: { id: string; name: string; items: any[] };
  activePlaylistId: string;
  editingId: string | null;
  editingName: string;
  onSetActive: (id: string) => void;
  onStartEdit: (playlist: { id: string; name: string }) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onDelete: (id: string) => void;
  onEditingNameChange: (name: string) => void;
  playlistsLength: number;
}

const PlaylistTab = ({
  playlist,
  activePlaylistId,
  editingId,
  editingName,
  onSetActive,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  onEditingNameChange,
  playlistsLength,
}: PlaylistTabProps) => {
  const { setNodeRef } = useDroppable({
    id: `playlist-tab-${playlist.id}`,
  });

  return (
    <div className="flex items-center group relative">
      <button
        ref={setNodeRef}
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
        <div className="absolute -right-1 -top-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
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
          {playlistsLength > 1 && (
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 bg-background border text-destructive hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(playlist.id);
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export const PlaylistTabs = () => {
  const {
    playlists,
    activePlaylistId,
    setActivePlaylist,
    createPlaylist,
    deletePlaylist,
    renamePlaylist,
  } = usePlayerStore();

  const [isCreating, setIsCreating] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleCreatePlaylist = () => {
    if (newPlaylistName.trim()) {
      createPlaylist(newPlaylistName.trim());
      setNewPlaylistName('');
      setIsCreating(false);
    }
  };

  const handleStartEdit = (playlist: { id: string; name: string }) => {
    setEditingId(playlist.id);
    setEditingName(playlist.name);
  };

  const handleSaveEdit = () => {
    if (editingId && editingName.trim()) {
      renamePlaylist(editingId, editingName.trim());
    }
    setEditingId(null);
    setEditingName('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  const handleDeletePlaylist = (playlistId: string) => {
    if (playlists.length > 1) {
      deletePlaylist(playlistId);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="flex-1 flex items-center gap-2 overflow-x-auto">
          {playlists.map((playlist) => (
            <PlaylistTab
              key={playlist.id}
              playlist={playlist}
              activePlaylistId={activePlaylistId}
              editingId={editingId}
              editingName={editingName}
              onSetActive={setActivePlaylist}
              onStartEdit={handleStartEdit}
              onSaveEdit={handleSaveEdit}
              onCancelEdit={handleCancelEdit}
              onDelete={handleDeletePlaylist}
              onEditingNameChange={setEditingName}
              playlistsLength={playlists.length}
            />
          ))}
        </div>

        {isCreating ? (
          <div className="flex items-center gap-2">
            <Input
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              placeholder="Playlist name"
              className="h-8 w-32"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreatePlaylist();
                if (e.key === 'Escape') setIsCreating(false);
              }}
              autoFocus
            />
            <Button size="sm" onClick={handleCreatePlaylist}>
              <Check className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsCreating(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsCreating(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        )}
      </div>
    </div>
  );
};
