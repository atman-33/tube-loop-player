import { useCallback, useEffect, useRef, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
  useSensor,
  useSensors,
  PointerSensor,
  pointerWithin,
} from '@dnd-kit/core';
import { siteConfig } from '~/config/site-config';
import { usePlayerStore } from '../../stores/player';
import type { Route } from './+types/route';
import { Description } from './components/description';
import { PlaylistDisplay } from './components/playlist-display';
import { PlaylistInputForm } from './components/playlist-input-form';
import { PlaylistTabs } from './components/playlist-tabs';
import { YouTubePlayer } from './components/you-tube-player';
import { getHorizontalScrollIntent } from './scroll-utils';

// biome-ignore lint/correctness/noEmptyPattern: <>
export function meta({ }: Route.MetaArgs) {
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
    reorderPlaylists,
    getActivePlaylist,
    playlists,
  } = usePlayerStore();

  const [activeId, setActiveId] = useState<string | null>(null);
  const [dragType, setDragType] = useState<'item' | 'tab' | null>(null);
  const playlistTabsScrollRef = useRef<HTMLDivElement | null>(null);
  const pointerPositionRef = useRef<{ x: number; y: number } | null>(null);
  const autoScrollFrameRef = useRef<number | null>(null);
  const pointerTrackingAttachedRef = useRef(false);
  const dragTypeRef = useRef<'item' | 'tab' | null>(null);

  const setDragTypeState = useCallback((next: 'item' | 'tab' | null) => {
    dragTypeRef.current = next;
    setDragType(next);
  }, []);

  const setPlaylistTabsScrollElement = useCallback((node: HTMLDivElement | null) => {
    playlistTabsScrollRef.current = node;
  }, []);

  const stopAutoScroll = useCallback(() => {
    if (typeof window === 'undefined') {
      return;
    }
    if (autoScrollFrameRef.current !== null) {
      window.cancelAnimationFrame(autoScrollFrameRef.current);
      autoScrollFrameRef.current = null;
    }
  }, []);

  const runAutoScrollFrame = useCallback(() => {
    const container = playlistTabsScrollRef.current;
    const pointer = pointerPositionRef.current;

    if (!container || !pointer) {
      stopAutoScroll();
      return;
    }

    const intent = getHorizontalScrollIntent({
      pointerX: pointer.x,
      containerRect: container.getBoundingClientRect(),
      scrollLeft: container.scrollLeft,
      scrollWidth: container.scrollWidth,
    });

    if (intent === 0 || typeof window === 'undefined') {
      stopAutoScroll();
      return;
    }

    const step = Math.max(12, Math.round(container.clientWidth * 0.05));
    container.scrollLeft += intent * step;
    autoScrollFrameRef.current = window.requestAnimationFrame(runAutoScrollFrame);
  }, [stopAutoScroll]);

  const ensureAutoScroll = useCallback(() => {
    if (typeof window === 'undefined') {
      return;
    }
    if (autoScrollFrameRef.current === null) {
      autoScrollFrameRef.current = window.requestAnimationFrame(runAutoScrollFrame);
    }
  }, [runAutoScrollFrame]);

  const handlePointerMove = useCallback((event: PointerEvent) => {
    if (!dragTypeRef.current) {
      return;
    }
    pointerPositionRef.current = { x: event.clientX, y: event.clientY };

    const container = playlistTabsScrollRef.current;
    if (!container) {
      stopAutoScroll();
      return;
    }

    const intent = getHorizontalScrollIntent({
      pointerX: event.clientX,
      containerRect: container.getBoundingClientRect(),
      scrollLeft: container.scrollLeft,
      scrollWidth: container.scrollWidth,
    });

    if (intent === 0) {
      stopAutoScroll();
      return;
    }

    ensureAutoScroll();
  }, [ensureAutoScroll, stopAutoScroll]);

  const attachPointerTracking = useCallback(() => {
    if (pointerTrackingAttachedRef.current || typeof window === 'undefined') {
      return;
    }
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    pointerTrackingAttachedRef.current = true;
  }, [handlePointerMove]);

  const detachPointerTracking = useCallback(() => {
    if (!pointerTrackingAttachedRef.current || typeof window === 'undefined') {
      return;
    }
    window.removeEventListener('pointermove', handlePointerMove);
    pointerTrackingAttachedRef.current = false;
  }, [handlePointerMove]);

  const cleanupPointerTracking = useCallback(() => {
    pointerPositionRef.current = null;
    detachPointerTracking();
    stopAutoScroll();
  }, [detachPointerTracking, stopAutoScroll]);

  const flashInvalidDrop = useCallback(() => {
    const node = playlistTabsScrollRef.current;
    if (!node || typeof window === 'undefined') {
      return;
    }
    const classes = ['ring-2', 'ring-destructive/40', 'bg-destructive/5'];
    node.classList.add(...classes);
    window.setTimeout(() => {
      node.classList.remove(...classes);
    }, 280);
  }, []);

  const clearDragState = useCallback(() => {
    setActiveId(null);
    setDragTypeState(null);
    cleanupPointerTracking();
  }, [cleanupPointerTracking, setActiveId, setDragTypeState]);

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
    const activeIdStr = event.active.id.toString();
    setActiveId(activeIdStr);

    // Determine if we're dragging a playlist item or a tab
    const isPlaylistTab = playlists.some(p => p.id === activeIdStr);
    setDragTypeState(isPlaylistTab ? 'tab' : 'item');

    if (typeof PointerEvent !== 'undefined' && event.activatorEvent instanceof PointerEvent) {
      pointerPositionRef.current = {
        x: event.activatorEvent.clientX,
        y: event.activatorEvent.clientY,
      };
    } else {
      pointerPositionRef.current = null;
    }

    attachPointerTracking();
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      flashInvalidDrop();
      clearDragState();
      return;
    }

    const activeIdStr = active.id.toString();
    const overIdStr = over.id.toString();

    if (dragType === 'tab') {
      // Handle tab reordering
      if (activeIdStr !== overIdStr) {
        const oldIndex = playlists.findIndex((p) => p.id === activeIdStr);
        const newIndex = playlists.findIndex((p) => p.id === overIdStr);

        if (oldIndex !== -1 && newIndex !== -1) {
          reorderPlaylists(oldIndex, newIndex);
        }
      }
    } else if (dragType === 'item') {
      const activePlaylist = getActivePlaylist();
      const playlist = activePlaylist?.items || [];

      // Check if dropping on a playlist tab
      if (overIdStr.startsWith('playlist-tab-')) {
        const targetPlaylistId = overIdStr.replace('playlist-tab-', '');
        const itemIndex = playlist.findIndex((item) => item.id === activeIdStr);

        if (itemIndex !== -1 && targetPlaylistId !== activePlaylistId) {
          const wasMoved = moveItemBetweenPlaylists(
            itemIndex,
            activePlaylistId,
            targetPlaylistId,
          );

          if (!wasMoved) {
            // Show visual feedback that the move was not allowed due to duplicate
            const targetTab = document.getElementById(
              `playlist-tab-${targetPlaylistId}`,
            );
            if (targetTab) {
              const container = targetTab.parentElement;
              if (container) {
                container.classList.add(
                  'ring-2',
                  'ring-destructive',
                  'bg-destructive/10',
                );
                setTimeout(() => {
                  container.classList.remove(
                    'ring-2',
                    'ring-destructive',
                    'bg-destructive/10',
                  );
                }, 1000);
              }
            }
            flashInvalidDrop();
          }
        }
      } else if (activeIdStr !== overIdStr) {
        // Reordering within the same playlist
        const oldIndex = playlist.findIndex((item) => item.id === activeIdStr);
        const newIndex = playlist.findIndex((item) => item.id === overIdStr);

        if (oldIndex !== -1 && newIndex !== -1) {
          reorderPlaylist(oldIndex, newIndex);
        }
      }
    }

    clearDragState();
  };

  const handleDragCancel = () => {
    flashInvalidDrop();
    clearDragState();
  };

  useEffect(() => () => {
    cleanupPointerTracking();
  }, [cleanupPointerTracking]);

  const activePlaylist = getActivePlaylist();
  const playlist = activePlaylist?.items || [];
  const activeItem = activeId && dragType === 'item'
    ? playlist.find((item) => item.id === activeId)
    : null;
  const activeTab = activeId && dragType === 'tab'
    ? playlists.find((p) => p.id === activeId)
    : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="mx-auto">
        <div className="flex flex-col gap-6 md:flex-row">
          <div className="flex-1 md:w-1/2">
            <YouTubePlayer />
          </div>
          <div className="space-y-4 md:w-1/2">
            <PlaylistInputForm />
            <PlaylistTabs onScrollAreaRef={setPlaylistTabsScrollElement} />
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
        ) : activeTab ? (
          <div className="px-4 py-3 bg-card border rounded-lg shadow-lg opacity-90 font-medium text-sm">
            {activeTab.name}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
