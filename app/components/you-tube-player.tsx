import { useYouTubePlayer } from '../hooks/use-you-tube-player';
import { usePlayerStore } from '../stores/player';
import { Button } from './ui/button';
import { Toggle } from './ui/toggle';

export const YouTubePlayer = () => {
  const {
    isPlaying,
    currentVideoId,
    isLoop,
    isShuffle,
    pause,
    resume,
    toggleLoop,
    toggleShuffle,
  } = usePlayerStore();
  const playerRef = useYouTubePlayer('youtube-player');

  const handleTogglePlayPause = () => {
    if (!currentVideoId) return;
    if (isPlaying) {
      pause();
    } else {
      resume();
    }
  };

  return (
    <div className="space-y-4">
      <div
        id="youtube-player"
        className="aspect-video w-full rounded-lg bg-black"
      />

      <div className="flex justify-center gap-2">
        <Button
          variant="default"
          onClick={handleTogglePlayPause}
          disabled={!currentVideoId}
        >
          {isPlaying ? 'Pause' : 'Play'}
        </Button>
      </div>

      <div className="flex justify-center gap-4">
        <Toggle pressed={isLoop} onPressedChange={toggleLoop}>
          Loop {isLoop ? 'ON' : 'OFF'}
        </Toggle>
        <Toggle pressed={isShuffle} onPressedChange={toggleShuffle}>
          Shuffle {isShuffle ? 'ON' : 'OFF'}
        </Toggle>
      </div>
    </div>
  );
};
