import { Pause, Play, Repeat, Shuffle } from 'lucide-react'; // アイコンをインポート
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
    playlist, // プレイリストから動画タイトルを取得するため
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

  const currentVideoTitle = currentVideoId
    ? playlist.find((item) => item.id === currentVideoId)?.title ||
      `動画 ${currentVideoId.substring(0, 5)}`
    : '動画が選択されていません';

  return (
    <div className="space-y-4 p-4 rounded-lg shadow-lg bg-card">
      {' '}
      {/* 全体的なコンテナのスタイル */}
      <div
        id="youtube-player"
        className="aspect-video w-full rounded-lg bg-black overflow-hidden shadow-md" // プレイヤーのスタイリング
      />
      {currentVideoId && (
        <div className="text-center text-lg font-semibold text-foreground">
          {currentVideoTitle}
        </div>
      )}
      <div className="flex justify-center gap-4">
        <Button
          variant="default"
          onClick={handleTogglePlayPause}
          disabled={!currentVideoId}
          size="lg" // ボタンサイズを大きく
          className="px-6 py-3" // パディングを調整
        >
          {isPlaying ? (
            <>
              <Pause className="h-5 w-5 mr-2" /> 一時停止
            </>
          ) : (
            <>
              <Play className="h-5 w-5 mr-2" /> 再生
            </>
          )}
        </Button>
      </div>
      <div className="flex justify-center gap-4">
        <Toggle
          pressed={isLoop}
          onPressedChange={toggleLoop}
          aria-label="Toggle loop"
          size="lg" // トグルサイズを大きく
        >
          <Repeat className="h-5 w-5" />
          <span className="ml-2 hidden sm:inline">
            ループ {isLoop ? 'ON' : 'OFF'}
          </span>
        </Toggle>
        <Toggle
          pressed={isShuffle}
          onPressedChange={toggleShuffle}
          aria-label="Toggle shuffle"
          size="lg" // トグルサイズを大きく
        >
          <Shuffle className="h-5 w-5" />
          <span className="ml-2 hidden sm:inline">
            シャッフル {isShuffle ? 'ON' : 'OFF'}
          </span>
        </Toggle>
      </div>
    </div>
  );
};
