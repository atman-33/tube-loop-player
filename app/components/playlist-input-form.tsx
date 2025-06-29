import { useState } from 'react';
import { usePlayerStore } from '../stores/player';
import { Button } from './ui/button';
import { Input } from './ui/input';

export const PlaylistInputForm = () => {
  const [inputUrl, setInputUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { addToPlaylist } = usePlayerStore();

  // Google Apps Script URL
  const GAS_URL =
    'https://script.google.com/macros/s/AKfycbzqZ1L1dYBgDnVLwzOqRPBnOcwO0SdaJK9hC8Fh5AFepsnT1mx98rZkILECKPCcsyeM/exec';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim() || isLoading) return;

    const videoId = extractVideoId(inputUrl);
    if (!videoId) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${GAS_URL}?videoId=${videoId}`);
      const data = await response.json();
      const title = data.title || `Video ${videoId.substring(0, 5)}`;
      addToPlaylist({ id: videoId, title });
      setInputUrl('');
    } catch (error) {
      console.error('Failed to fetch video title:', error);
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
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        type="text"
        value={inputUrl}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setInputUrl(e.target.value)
        }
        placeholder="Enter YouTube URL"
        className="flex-1"
        disabled={isLoading}
      />
      <Button type="submit" variant="default" disabled={isLoading}>
        {isLoading ? 'Adding...' : 'Add'}
      </Button>
    </form>
  );
};
