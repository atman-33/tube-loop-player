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

  const activeIndex = playlists.findIndex((p) => p.id === activePlaylistId);

  return (
    <div className="relative mb-0">
      {/* Tab Navigation Container */}
      <div className="relative">
        {/* Background container with border */}
        <div className="absolute inset-x-0 bottom-0 h-12 bg-muted/30 border-b border-border/50" />

        {/* Tabs Container */}
        <div className="relative flex items-end gap-1 px-4 pb-0">
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

        {/* Active tab extension - creates the "wrapping" effect */}
        {activeIndex >= 0 && (
          <div
            className="absolute bottom-0 h-12 bg-background border-l border-r border-t border-border/50 transition-all duration-300 ease-out"
            style={{
              left: `${16 + (activeIndex * 144) + activeIndex * 4}px`, // 4px gap between tabs
              width: '144px',
              borderTopLeftRadius: '12px',
              borderTopRightRadius: '12px',
              zIndex: 5,
              boxShadow:
                '0 -4px 12px rgba(0,0,0,0.08), 0 -2px 4px rgba(0,0,0,0.04)',
            }}
          />
        )}

        {/* Side shadows for active tab */}
        {activeIndex >= 0 && (
          <>
            {/* Left shadow */}
            <div
              className="absolute bottom-0 w-4 h-4 pointer-events-none"
              style={{
                left: `${16 + activeIndex * 144 + (activeIndex * 4) - 16}px`,
                zIndex: 4,
              }}
            >
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-muted/30 rounded-br-2xl" />
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-background rounded-br-2xl shadow-[4px_4px_0_0_rgb(var(--background))]" />
            </div>

            {/* Right shadow */}
            <div
              className="absolute bottom-0 w-4 h-4 pointer-events-none"
              style={{
                left: `${16 + activeIndex * 144 + (activeIndex * 4) + 144}px`,
                zIndex: 4,
              }}
            >
              <div className="absolute bottom-0 left-0 w-4 h-4 bg-muted/30 rounded-bl-2xl" />
              <div className="absolute bottom-0 left-0 w-4 h-4 bg-background rounded-bl-2xl shadow-[-4px_4px_0_0_rgb(var(--background))]" />
            </div>
          </>
        )}
      </div>
    </div>
  );
};
