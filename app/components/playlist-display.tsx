import { usePlayerStore } from '../stores/player';
import { Button } from './ui/button';

export const PlaylistDisplay = () => {
  const { playlist, currentIndex, removeFromPlaylist, play } = usePlayerStore();

  return (
    <div className="space-y-2">
      <h3 className="font-medium">Playlist</h3>
      {playlist.length === 0 ? (
        <p className="text-gray-500 text-sm">Playlist is empty</p>
      ) : (
        <ul className="space-y-1">
          {playlist.map((item, index) => (
            <li
              key={item.id}
              className={`flex items-center justify-between rounded p-2 ${currentIndex === index ? 'bg-gray-100' : ''}`}
            >
              <button
                type="button"
                className="flex-1 text-left hover:underline"
                onClick={() => play(item.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    play(item.id);
                  }
                }}
              >
                {item.title || `Video ${index + 1}`}
              </button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeFromPlaylist(index)}
              >
                Remove
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
