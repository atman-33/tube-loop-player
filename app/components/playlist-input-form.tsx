import { useState } from 'react';
import { usePlayerStore } from '../stores/player';
import { Button } from './ui/button';
import { Input } from './ui/input';

export const PlaylistInputForm = () => {
  const [inputUrl, setInputUrl] = useState('');
  const { addToPlaylist } = usePlayerStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim()) return;

    // Extract video ID from YouTube URL
    const videoId = extractVideoId(inputUrl);
    if (videoId) {
      addToPlaylist({ id: videoId });
      setInputUrl('');
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
      />
      <Button type="submit" variant="default">
        Add
      </Button>
    </form>
  );
};
