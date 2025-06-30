import { Trash2 } from 'lucide-react'; // Trash2アイコンをインポート
import { usePlayerStore } from '../stores/player';
import { Button } from './ui/button';

const getThumbnailUrl = (videoId: string) =>
  `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;

export const PlaylistDisplay = () => {
  const { playlist, currentIndex, removeFromPlaylist, play } = usePlayerStore();

  return (
    <div className="space-y-4">
      {' '}
      {/* Increased space-y for more spacing */}
      <h3 className="font-semibold text-lg">Playlist</h3>{' '}
      {/* Adjusted font and size */}
      {playlist.length === 0 ? (
        <div className="text-center text-muted-foreground p-8 border border-dashed rounded-lg">
          {' '}
          {/* Improved empty state styling */}
          <p className="mb-2">Playlist is empty.</p>
          <p className="text-sm">Add YouTube URLs to add videos here!</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {' '}
          {/* Increased space-y for more spacing */}
          {playlist.map((item, index) => (
            <li
              key={item.id}
              className={`flex items-center gap-4 p-3 border rounded-lg shadow-sm transition-all duration-200
                ${
                  currentIndex === index
                    ? 'bg-primary/10 border-primary ring-2 ring-primary/50'
                    : 'bg-card hover:bg-card-foreground/5'
                }`}
            >
              <img
                src={getThumbnailUrl(item.id)}
                alt={item.title}
                className="w-24 h-14 object-cover rounded-md flex-shrink-0" // Fixed thumbnail size
              />
              <button
                type="button"
                className="flex-1 text-left font-medium text-foreground hover:text-primary transition-colors truncate" // Emphasize title, add truncate
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
                size="icon" // Change size for icon
                onClick={() => removeFromPlaylist(index)}
                className="flex-shrink-0 text-muted-foreground hover:text-destructive" // Change color
              >
                <Trash2 className="h-5 w-5" /> {/* Change to icon */}
                <span className="sr-only">Remove</span>{' '}
                {/* For screen readers */}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
