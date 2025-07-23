import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  SortableContext,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { usePlayerStore } from '../../../stores/player';
import { PlaylistTab } from './playlist-tab';

export const PlaylistTabs = () => {
  const { playlists, activePlaylistId, setActivePlaylist, renamePlaylist } =
    usePlayerStore();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleStartEdit = (playlist: { id: string; name: string; }) => {
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

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px移動してからドラッグ開始
      },
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = playlists.findIndex((p) => p.id === active.id);
      const newIndex = playlists.findIndex((p) => p.id === over.id);
      usePlayerStore.getState().reorderPlaylists(oldIndex, newIndex);
    }
  };

  return (
    <div className="relative mb-0">
      {/* Tab Navigation Container */}
      <div className="relative">
        {/* Background container with border */}
        <div className="absolute inset-x-0 bottom-0 h-px bg-border/50" />

        {/* Tabs Container - responsive flex layout */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={playlists.map((p) => p.id)}
            strategy={horizontalListSortingStrategy}
          >
            <div className="flex items-end gap-0.5 px-1">
              {playlists.map((playlist, index) => (
                <PlaylistTab
                  key={playlist.id}
                  id={playlist.id}
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
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
};
