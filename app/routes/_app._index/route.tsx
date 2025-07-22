import { useEffect, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
  type DragOverEvent,
  useSensor,
  useSensors,
  PointerSensor,
} from '@dnd-kit/core';
import { siteConfig } from '~/config/site-config';
import { usePlayerStore } from '../../stores/player';
import type { Route } from './+types/route';
import { Description } from './components/description';
import { PlaylistDisplay } from './components/playlist-display';
import { PlaylistInputForm } from './components/playlist-input-form';
import { PlaylistTabs } from './components/playlist-tabs';
import { YouTubePlayer } from './components/you-tube-player';

// biome-ignore lint/correctness/noEmptyPattern: <>
export function meta({}: Route.MetaArgs) {
  const title = 'TubeLoopPlayer - Loop & Playlist Your Favorite YouTube Videos';
  const description =
    'TubeLoopPlayer is a free web app that lets you loop YouTube videos endlessly or create custom playlists for continuous playback. Perfect for music, tutorials, and more.';
  const imageUrl = `${siteConfig.appUrl}/ogp-image.png`; // URL for the OGP image
  const pageUrl = siteConfig.appUrl;

  return [
    { title: title },
    { name: 'description', content: description },
    {
      name: 'keywords',
      content: 'YouTube, loop, looper, player, playlist, repeat, video, music',
    },
    // OGP tags
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: pageUrl },
    { property: 'og:image', content: imageUrl },
    { property: 'og:site_name', content: 'TubeLoopPlayer' },
    // Twitter card tags
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: imageUrl },
  ];
}

export default function Home() {
  const {
    setPlayingStateToFalse,
    activePlaylistId,
    moveItemBetweenPlaylists,
    reorderPlaylist,
    getActivePlaylist,
  } = usePlayerStore();

  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  useEffect(() => {
    setPlayingStateToFalse();
  }, [setPlayingStateToFalse]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id.toString());
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    if (over?.id.toString().startsWith('playlist-tab-')) {
      const playlistId = over.id.toString().replace('playlist-tab-', '');
      // Apply drag over state to playlist tabs
      document.querySelectorAll('[id^="playlist-tab-"]').forEach((tab) => {
        tab.classList.remove('ring-2', 'ring-primary', 'bg-primary/10');
      });
      const targetTab = document.getElementById(`playlist-tab-${playlistId}`);
      if (targetTab && playlistId !== activePlaylistId) {
        targetTab.classList.add('ring-2', 'ring-primary', 'bg-primary/10');
      }
    } else {
      // Remove drag over state from all tabs
      document.querySelectorAll('[id^="playlist-tab-"]').forEach((tab) => {
        tab.classList.remove('ring-2', 'ring-primary', 'bg-primary/10');
      });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      return;
    }

    const activePlaylist = getActivePlaylist();
    const playlist = activePlaylist?.items || [];

    // Check if dropping on a playlist tab
    if (over.id.toString().startsWith('playlist-tab-')) {
      const targetPlaylistId = over.id.toString().replace('playlist-tab-', '');
      const itemIndex = playlist.findIndex((item) => item.id === active.id);

      if (itemIndex !== -1 && targetPlaylistId !== activePlaylistId) {
        moveItemBetweenPlaylists(itemIndex, activePlaylistId, targetPlaylistId);
      }
    } else if (active.id !== over.id) {
      // Reordering within the same playlist
      const oldIndex = playlist.findIndex((item) => item.id === active.id);
      const newIndex = playlist.findIndex((item) => item.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        reorderPlaylist(oldIndex, newIndex);
      }
    }

    setActiveId(null);
    // Remove drag over state from all tabs when drag ends
    document.querySelectorAll('[id^="playlist-tab-"]').forEach((tab) => {
      tab.classList.remove('ring-2', 'ring-primary', 'bg-primary/10');
    });
  };

  const activePlaylist = getActivePlaylist();
  const playlist = activePlaylist?.items || [];
  const activeItem = activeId
    ? playlist.find((item) => item.id === activeId)
    : null;

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="container mx-auto p-4">
        <div className="flex flex-col gap-6 md:flex-row">
          <div className="flex-1">
            <YouTubePlayer />
          </div>
          <div className="space-y-4 md:w-1/3">
            <PlaylistInputForm />
            <PlaylistTabs />
            <PlaylistDisplay />
          </div>
        </div>
        {/* Adsterra Native Banner */}
        <div
          className="mt-8"
          id="container-5aa23d558292733924bbce492c900cef"
        ></div>
        {/* NOTE: Use this space for ads if needed */}
        <Description />
      </div>
      <DragOverlay>
        {activeItem ? (
          <div className="flex items-center gap-4 p-3 bg-card border rounded-lg shadow-lg opacity-90">
            <img
              src={`https://img.youtube.com/vi/${activeItem.id}/mqdefault.jpg`}
              alt={activeItem.title}
              className="w-24 h-14 object-cover rounded-md flex-shrink-0"
            />
            <div className="flex-1 min-w-0 overflow-hidden text-left font-medium text-foreground">
              {activeItem.title || 'Video'}
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
