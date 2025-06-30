import { Loader2 } from 'lucide-react'; // Import Loader2
import { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { usePlayerStore } from '../../../stores/player';

export const PlaylistInputForm = () => {
  const [inputUrl, setInputUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null); // Add error state
  const { addToPlaylist } = usePlayerStore();

  // Google Apps Script URL
  const GAS_URL =
    'https://script.google.com/macros/s/AKfycbzqZ1L1dYBgDnVLwzOqRPBnOcwO0SdaJK9hC8Fh5AFepsnT1mx98rZkILECKPCcsyeM/exec';

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
      const response = await fetch(`${GAS_URL}?videoId=${videoId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch video information.');
      }
      const data = await response.json();
      const title = data.title || `Video ${videoId.substring(0, 5)}`;
      addToPlaylist({ id: videoId, title });
      setInputUrl('');
    } catch (err) {
      console.error('Failed to fetch video title:', err);
      setError('An error occurred while fetching video information.');
      // Fallback to adding with just the ID
      addToPlaylist({ id: videoId, title: `Video ${videoId.substring(0, 5)}` });
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
      {' '}
      {/* Changed to flex-col */}
      <div className="flex gap-2 items-center">
        {' '}
        {/* Wrap Input and Button with flex */}
        <Input
          type="text"
          value={inputUrl}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setInputUrl(e.target.value);
            setError(null); // Clear error on input
          }}
          placeholder="Enter YouTube URL"
          className="flex-1"
          disabled={isLoading}
          aria-invalid={error ? 'true' : 'false'} // Set aria-invalid on error
        />
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
