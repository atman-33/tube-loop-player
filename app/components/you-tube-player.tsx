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
    play,
    pause,
    toggleLoop,
    toggleShuffle,
  } = usePlayerStore();
  const playerRef = useYouTubePlayer('youtube-player');

  const handlePlayClick = () => (currentVideoId ? play(currentVideoId) : null);
  const handlePauseClick = () => pause();

  return (
    <div className="space-y-4">
      <div
        id="youtube-player"
        className="aspect-video w-full rounded-lg bg-black"
      />

      <div className="flex justify-center gap-2">
        <Button
          variant="default"
          onClick={handlePlayClick}
          disabled={!currentVideoId || isPlaying}
        >
          Play
        </Button>
        <Button
          variant="secondary"
          onClick={handlePauseClick}
          disabled={!isPlaying}
        >
          Pause
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
