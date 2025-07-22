import { Plus, X, Edit2, Check } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { usePlayerStore } from '../../../stores/player';

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
            <div key={playlist.id} className="flex items-center group relative">
              <button
                type="button"
                onClick={() => setActivePlaylist(playlist.id)}
                className={`relative px-4 py-2 rounded-lg border transition-all cursor-pointer ${
                  activePlaylistId === playlist.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card hover:bg-card-foreground/5'
                }`}
              >
                {editingId === playlist.id ? (
                  <div className="flex items-center gap-1">
                    <Input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="h-6 w-20 text-xs"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEdit();
                        if (e.key === 'Escape') handleCancelEdit();
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
                        handleSaveEdit();
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
                      handleStartEdit(playlist);
                    }}
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                  {playlists.length > 1 && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 bg-background border text-destructive hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePlaylist(playlist.id);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              )}
            </div>
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
