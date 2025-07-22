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
    <div className="relative mb-0">
      {/* Tab Navigation Container */}
      <div className="relative overflow-x-auto">
        {/* Background container with border */}
        <div className="absolute inset-x-0 bottom-0 h-px bg-border/50" />

        {/* Tabs Container */}
        <div className="flex items-end gap-1 px-2 min-w-max">
          {playlists.map((playlist, index) => (
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
              index={index}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
