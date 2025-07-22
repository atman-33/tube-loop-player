import { useState } from 'react';
import { usePlayerStore } from '../../../stores/player';
import { PlaylistTab } from './playlist-tab';

export const PlaylistTabs = () => {
  const { playlists, activePlaylistId, setActivePlaylist, renamePlaylist } =
    usePlayerStore();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

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
              onEditingNameChange={setEditingName}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
