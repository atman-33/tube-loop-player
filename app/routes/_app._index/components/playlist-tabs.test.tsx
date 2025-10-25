import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { PlaylistTabs, calculateTabScrollDelta } from './playlist-tabs';

type MockPlaylist = { id: string; name: string; items: Array<{ id: string }>; };

interface MockStoreState {
  playlists: MockPlaylist[];
  activePlaylistId: string;
  setActivePlaylist: (id: string) => void;
  renamePlaylist: (id: string, name: string) => void;
  createPlaylist: () => string | null;
  canCreatePlaylist: boolean;
  maxPlaylistCount: number;
}

type MockStoreSelector = () => MockStoreState;

const mockUsePlayerStore = vi.fn<MockStoreSelector>();

vi.mock('../../../stores/player', () => ({
  usePlayerStore: () => mockUsePlayerStore(),
}));

const createPlaylists = (count: number): MockPlaylist[] =>
  Array.from({ length: count }, (_, index) => ({
    id: `playlist-${index + 1}`,
    name: `Playlist ${index + 1}`,
    items: [],
  }));

const buildStoreState = (overrides?: Partial<MockStoreState>): MockStoreState => ({
  playlists: createPlaylists(3),
  activePlaylistId: 'playlist-1',
  setActivePlaylist: vi.fn(),
  renamePlaylist: vi.fn(),
  createPlaylist: vi.fn(),
  canCreatePlaylist: true,
  maxPlaylistCount: 10,
  ...overrides,
});

beforeAll(() => {
  class ResizeObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  // biome-ignore lint/suspicious/noExplicitAny: test shim
  (global as any).ResizeObserver = ResizeObserverMock;
});

beforeEach(() => {
  mockUsePlayerStore.mockReset();
});

describe('PlaylistTabs UI', () => {
  it('omits navigation controls when three or fewer playlists exist', () => {
    mockUsePlayerStore.mockReturnValue(
      buildStoreState({ playlists: createPlaylists(3) }),
    );

    render(<PlaylistTabs />);

    expect(screen.queryByLabelText(/Scroll tabs left/i)).toBeNull();
    expect(screen.queryByLabelText(/Scroll tabs right/i)).toBeNull();
  });

  it('renders navigation controls when playlist count exceeds three', () => {
    mockUsePlayerStore.mockReturnValue(
      buildStoreState({ playlists: createPlaylists(5) }),
    );

    render(<PlaylistTabs />);

    expect(screen.getByLabelText(/Scroll tabs left/i)).toBeDisabled();
    expect(screen.getByLabelText(/Scroll tabs right/i)).toBeDisabled();
  });

  it('disables playlist creation when the limit is reached', () => {
    const createPlaylistMock = vi.fn();
    mockUsePlayerStore.mockReturnValue(
      buildStoreState({
        playlists: createPlaylists(10),
        canCreatePlaylist: false,
        createPlaylist: createPlaylistMock,
      }),
    );

    render(<PlaylistTabs />);

    const button = screen.getByRole('button', { name: /Create new playlist/i });
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(createPlaylistMock).not.toHaveBeenCalled();
  });

  it('calls createPlaylist when the action is available', () => {
    const createPlaylistMock = vi.fn().mockReturnValue('playlist-4');
    mockUsePlayerStore.mockReturnValue(
      buildStoreState({
        playlists: createPlaylists(3),
        canCreatePlaylist: true,
        createPlaylist: createPlaylistMock,
      }),
    );

    render(<PlaylistTabs />);

    const button = screen.getByRole('button', { name: /Create new playlist/i });
    fireEvent.click(button);
    expect(createPlaylistMock).toHaveBeenCalledTimes(1);
  });

  it('requests a scroll adjustment when the active tab is out of view', async () => {
    const playlists = createPlaylists(5);
    mockUsePlayerStore.mockReturnValue(
      buildStoreState({ playlists, activePlaylistId: 'playlist-1' }),
    );

    const view = render(<PlaylistTabs />);

    const scrollArea = screen.getByTestId('playlist-tabs-scroll');
    const activeTab = scrollArea.querySelector<HTMLElement>(
      '[data-playlist-tab-id="playlist-5"]',
    );

    if (!activeTab) {
      throw new Error('active tab not found in DOM');
    }

    const scrollSpy = vi.fn();
    (scrollArea as HTMLElement).scrollBy = scrollSpy;

    (scrollArea as HTMLElement).getBoundingClientRect = vi.fn(() => ({
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      bottom: 40,
      right: 240,
      width: 240,
      height: 40,
      toJSON: () => ({}),
    }));

    activeTab.getBoundingClientRect = vi.fn(() => ({
      x: 320,
      y: 0,
      top: 0,
      left: 320,
      bottom: 40,
      right: 420,
      width: 100,
      height: 40,
      toJSON: () => ({}),
    }));

    mockUsePlayerStore.mockReturnValue(
      buildStoreState({ playlists, activePlaylistId: 'playlist-5' }),
    );

    view.rerender(<PlaylistTabs />);

    await waitFor(() => {
      expect(scrollSpy).toHaveBeenCalled();
    });

    const [args] = scrollSpy.mock.calls;
    expect((args[0] as ScrollToOptions).left).toBeGreaterThan(0);
  });
});

describe('calculateTabScrollDelta', () => {
  const makeRect = (left: number, right: number): DOMRect => ({
    x: left,
    y: 0,
    top: 0,
    left,
    bottom: 40,
    right,
    width: right - left,
    height: 40,
    toJSON: () => ({}),
  }) as DOMRect;

  it('returns a negative delta when the tab is left of the viewport', () => {
    const delta = calculateTabScrollDelta(makeRect(0, 200), makeRect(-50, 50));
    expect(delta).toBeLessThan(0);
  });

  it('returns a positive delta when the tab extends beyond the right edge', () => {
    const delta = calculateTabScrollDelta(makeRect(0, 200), makeRect(210, 260));
    expect(delta).toBeGreaterThan(0);
  });

  it('returns zero when the tab is fully visible', () => {
    const delta = calculateTabScrollDelta(makeRect(0, 200), makeRect(20, 180));
    expect(delta).toBe(0);
  });
});
