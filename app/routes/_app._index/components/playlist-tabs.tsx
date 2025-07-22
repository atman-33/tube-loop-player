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
      <div className="relative">
        {/* Background container with border */}
        <div className="absolute inset-x-0 bottom-0 h-px bg-border/50" />

        {/* Tabs Container - responsive flex layout */}
        <div className="flex items-end gap-0.5 px-1">
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
              totalTabs={playlists.length}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
