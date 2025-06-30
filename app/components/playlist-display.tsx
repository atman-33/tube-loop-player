import { Trash2 } from 'lucide-react'; // Import Trash2 icon
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
            <button
              key={item.id}
              type="button"
              className={`flex items-center gap-4 p-3 border rounded-lg shadow-sm transition-all duration-200 cursor-pointer w-full
                ${
                  currentIndex === index
                    ? 'bg-primary/10 border-primary ring-2 ring-primary/50'
                    : 'bg-card hover:bg-card-foreground/5'
                }`}
              onClick={() => play(item.id)}
            >
              <img
                src={getThumbnailUrl(item.id)}
                alt={item.title}
                className="w-24 h-14 object-cover rounded-md flex-shrink-0" // Fixed thumbnail size
              />
              <div className="flex-1 min-w-0 overflow-hidden text-left font-medium text-foreground hover:text-primary transition-colors truncate text-ellipsis whitespace-nowrap">
                {' '}
                {/* Emphasize title, add truncate, add min-w-0, overflow-hidden, text-ellipsis, whitespace-nowrap to prevent overflow and properly truncate */}
                {item.title || `Video ${index + 1}`}
              </div>
              <Button
                variant="ghost"
                size="icon" // Change size for icon
                onClick={(e) => {
                  e.stopPropagation(); // Prevent li onClick from firing
                  removeFromPlaylist(index);
                }}
                className="flex-shrink-0 text-muted-foreground hover:text-destructive" // Change color
              >
                <Trash2 className="h-5 w-5" /> {/* Change to icon */}
                <span className="sr-only">Remove</span>{' '}
                {/* For screen readers */}
              </Button>
            </button>
          ))}
        </ul>
      )}
    </div>
  );
};
