import { useCallback, useEffect, useRef, useState } from 'react';
import {
  SortableContext,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '../../../components/ui/tooltip';
import { usePlayerStore } from '../../../stores/player';
import { PlaylistTab } from './playlist-tab';

interface PlaylistTabsProps {
  onScrollAreaRef?: (node: HTMLDivElement | null) => void;
}

export const calculateTabScrollDelta = (
  containerRect: DOMRect | DOMRectReadOnly,
  tabRect: DOMRect | DOMRectReadOnly,
  padding = 12,
) => {
  const leftOverflow = tabRect.left - containerRect.left;
  if (leftOverflow < 0) {
    return leftOverflow - padding;
  }

  const rightOverflow = tabRect.right - containerRect.right;
  if (rightOverflow > 0) {
    return rightOverflow + padding;
  }

  return 0;
};

export const PlaylistTabs = ({ onScrollAreaRef }: PlaylistTabsProps = {}) => {
  const {
    activePlaylistId,
    setActivePlaylist,
    renamePlaylist,
    createPlaylist,
    canCreatePlaylist,
    maxPlaylistCount,
    getPlaylistsWithFavorites,
  } = usePlayerStore();

  const playlists = getPlaylistsWithFavorites();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const [scrollState, setScrollState] = useState({
    canScrollLeft: false,
    canScrollRight: false,
  });

  const handleScrollAreaRef = useCallback((node: HTMLDivElement | null) => {
    scrollAreaRef.current = node;
    onScrollAreaRef?.(node);
  }, [onScrollAreaRef]);

  const updateScrollState = useCallback(() => {
    const container = scrollAreaRef.current;
    if (!container) {
      setScrollState({ canScrollLeft: false, canScrollRight: false });
      return;
    }

    const { scrollLeft, scrollWidth, clientWidth } = container;
    setScrollState({
      canScrollLeft: scrollLeft > 4,
      canScrollRight: scrollLeft + clientWidth < scrollWidth - 4,
    });
  }, []);

  useEffect(() => {
    updateScrollState();
  }, [playlists.length, updateScrollState]);

  useEffect(() => {
    const container = scrollAreaRef.current;
    if (!container) {
      return;
    }

    const handleScroll = () => {
      updateScrollState();
    };
    container.addEventListener('scroll', handleScroll, { passive: true });

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => updateScrollState());
      resizeObserver.observe(container);
    }

    return () => {
      container.removeEventListener('scroll', handleScroll);
      resizeObserver?.disconnect();
    };
  }, [updateScrollState]);

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

  const scrollActiveTabIntoView = useCallback(() => {
    const container = scrollAreaRef.current;
    if (!container || !activePlaylistId) {
      return;
    }

    const activeTab = container.querySelector<HTMLElement>(
      `[data-playlist-tab-id="${activePlaylistId}"]`,
    );
    if (!activeTab) {
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const tabRect = activeTab.getBoundingClientRect();
    const delta = calculateTabScrollDelta(containerRect, tabRect);

    if (delta !== 0) {
      container.scrollBy({ left: delta, behavior: 'smooth' });
    }
  }, [activePlaylistId]);

  useEffect(() => {
    scrollActiveTabIntoView();
  }, [scrollActiveTabIntoView, playlists.length]);

  const scrollByTab = useCallback((direction: -1 | 1) => {
    const container = scrollAreaRef.current;
    if (!container) {
      return;
    }

    const referenceTab = container.querySelector<HTMLElement>(
      '[data-playlist-tab]',
    );
    const tabWidth = referenceTab?.getBoundingClientRect().width ?? 120;
    container.scrollBy({
      left: direction * (tabWidth + 2),
      behavior: 'smooth',
    });
  }, []);

  const handleCreatePlaylist = () => {
    const playlistId = createPlaylist();
    if (!playlistId) {
      return;
    }
    // scroll into view handled by dedicated visibility hook
  };

  const shouldShowNavigation = scrollState.canScrollLeft || scrollState.canScrollRight;

  return (
    <div className="relative mb-0 w-full">
      <div className="rounded-t-lg border border-border/50 border-b-0 bg-background shadow-sm">
        <div className="flex items-center gap-2 px-2 py-2">
          {shouldShowNavigation && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => scrollByTab(-1)}
              disabled={!scrollState.canScrollLeft}
              aria-label="Scroll tabs left"
              aria-disabled={!scrollState.canScrollLeft}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}

          <div className="relative flex-1 min-w-0">
            <SortableContext
              items={playlists.map((p) => p.id)}
              strategy={horizontalListSortingStrategy}
            >
              <div
                ref={handleScrollAreaRef}
                data-testid="playlist-tabs-scroll"
                className="flex w-full items-end gap-0.5 overflow-x-auto px-1 pb-1 pt-2"
              >
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

                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="flex flex-none items-center pb-1 pt-1 pl-1">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="gap-1"
                        onClick={handleCreatePlaylist}
                        disabled={!canCreatePlaylist}
                        aria-label="Create new playlist"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {canCreatePlaylist
                        ? `Create a playlist (${playlists.length}/${maxPlaylistCount})`
                        : `You can create up to ${maxPlaylistCount} playlists.`}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </SortableContext>
          </div>

          {shouldShowNavigation && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => scrollByTab(1)}
              disabled={!scrollState.canScrollRight}
              aria-label="Scroll tabs right"
              aria-disabled={!scrollState.canScrollRight}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
