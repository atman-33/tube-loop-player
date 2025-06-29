import { useYouTubePlayer } from '../hooks/useYouTubePlayer';
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

  return (
    <div className="space-y-4">
      <div
        id="youtube-player"
        className="aspect-video w-full bg-black rounded-lg"
      />

      <div className="flex gap-2 justify-center">
        <Button
          onClick={() => (currentVideoId ? play(currentVideoId) : null)}
          disabled={!currentVideoId || isPlaying}
        >
          Play
        </Button>
        <Button onClick={pause} disabled={!isPlaying}>
          Pause
        </Button>
      </div>

      <div className="flex gap-4 justify-center">
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
