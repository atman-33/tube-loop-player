import { Pause, Play, Repeat, Repeat1, Shuffle } from 'lucide-react'; // Import icons
import { Button } from '../../../components/ui/button';
import { Toggle } from '../../../components/ui/toggle';
import { useYouTubePlayer } from '../../../hooks/use-you-tube-player';
import { usePlayerStore } from '../../../stores/player';

export const YouTubePlayer = () => {
  const {
    isPlaying,
    currentVideoId,
    loopMode,
    isShuffle,
    pause,
    resume,
    toggleLoop,
    toggleShuffle,
    playlist, // For getting video title from playlist
  } = usePlayerStore();
  // biome-ignore lint/correctness/noUnusedVariables: <>
  const playerRef = useYouTubePlayer('youtube-player');

  const handleTogglePlayPause = () => {
    if (!currentVideoId) return;
    if (isPlaying) {
      pause();
    } else {
      resume();
    }
  };

  const currentVideoTitle = currentVideoId
    ? playlist.find((item) => item.id === currentVideoId)?.title ||
      `Video ${currentVideoId.substring(0, 5)}`
    : 'No video selected';

  return (
    <div className="space-y-4 rounded-lg bg-card p-4 shadow-lg">
      {' '}
      {/* Overall container style */}
      <div
        id="youtube-player"
        className="aspect-video w-full overflow-hidden rounded-lg bg-black shadow-md" // Player styling
      />
      {currentVideoId && (
        <div className="text-center font-semibold text-foreground text-lg">
          {currentVideoTitle}
        </div>
      )}
      <div className="flex justify-center gap-4">
        <Button
          variant="default"
          onClick={handleTogglePlayPause}
          disabled={!currentVideoId}
          size="lg" // Larger button size
          className="px-6 py-3" // Adjust padding
        >
          {isPlaying ? (
            <>
              <Pause className="h-5 w-5 mr-2" /> Pause
            </>
          ) : (
            <>
              <Play className="h-5 w-5 mr-2" /> Play
            </>
          )}
        </Button>
      </div>
      <div className="flex justify-center gap-4">
        <Toggle
          pressed
          onPressedChange={toggleLoop}
          aria-label="Toggle loop"
          size="lg" // Larger toggle size
          className="cursor-pointer" // Ensure cursor is pointer
        >
          {loopMode === 'one' ? (
            <Repeat1 className="h-5 w-5" />
          ) : (
            <Repeat className="h-5 w-5" />
          )}
          <span className="ml-2 hidden sm:inline">
            {loopMode === 'all' ? 'Loop ALL' : 'Loop ONE'}
          </span>
        </Toggle>
        <Toggle
          pressed={isShuffle}
          onPressedChange={toggleShuffle}
          aria-label="Toggle shuffle"
          size="lg" // Larger toggle size
          className="cursor-pointer" // Ensure cursor is pointer
        >
          <Shuffle className="h-5 w-5" />
          <span className="ml-2 hidden sm:inline">
            Shuffle {isShuffle ? 'ON' : 'OFF'}
          </span>
        </Toggle>
      </div>
    </div>
  );
};
