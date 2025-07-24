import { Loader2, X } from 'lucide-react'; // Import Loader2 and X
import { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { usePlayerStore } from '../../../stores/player';

export const PlaylistInputForm = () => {
  const [inputUrl, setInputUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null); // Add error state
  const { addToPlaylist } = usePlayerStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Reset error
    if (!inputUrl.trim() || isLoading) {
      if (!inputUrl.trim()) {
        setError('Please enter a YouTube URL.');
      }
      return;
    }

    const videoId = extractVideoId(inputUrl);
    if (!videoId) {
      setError('Please enter a valid YouTube URL.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/youtube?videoId=${videoId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch video information.');
      }
      const data = (await response.json()) as { title: string; };
      const title = data.title || `Video ${videoId.substring(0, 5)}`;
      const wasAdded = addToPlaylist({ id: videoId, title });

      if (wasAdded) {
        setInputUrl('');
      } else {
        setError('This video is already in the playlist.');
      }
    } catch (err) {
      console.error('Failed to fetch video title:', err);
      // Fallback to adding with just the ID
      const wasAdded = addToPlaylist({
        id: videoId,
        title: `Video ${videoId.substring(0, 5)}`,
      });

      if (wasAdded) {
        setInputUrl('');
      } else {
        setError('This video is already in the playlist.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const extractVideoId = (url: string) => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div className="flex flex-row gap-2 items-center">
        <div className="relative flex-1 md:w-full">
          <Input
            type="text"
            value={inputUrl}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setInputUrl(e.target.value);
              setError(null); // Clear error on input
            }}
            placeholder="Enter YouTube URL"
            className="pr-8 w-full" // Add padding to the right side
            disabled={isLoading}
            aria-invalid={error ? 'true' : 'false'} // Set aria-invalid on error
          />
          {inputUrl && (
            <button
              type="button"
              onClick={() => {
                setInputUrl('');
                setError(null);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
              disabled={isLoading}
              aria-label="Clear input"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button type="submit" variant="default" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />{' '}
              {/* Add spinner */}
              Adding...
            </>
          ) : (
            'Add'
          )}
        </Button>
      </div>
      {error && <p className="text-destructive text-sm mt-1">{error}</p>}{' '}
      {/* Display error message */}
    </form>
  );
};
