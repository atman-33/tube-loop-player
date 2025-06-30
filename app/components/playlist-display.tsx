import { Trash2 } from 'lucide-react'; // Trash2アイコンをインポート
import { usePlayerStore } from '../stores/player';
import { Button } from './ui/button';

const getThumbnailUrl = (videoId: string) =>
  `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;

export const PlaylistDisplay = () => {
  const { playlist, currentIndex, removeFromPlaylist, play } = usePlayerStore();

  return (
    <div className="space-y-4">
      {' '}
      {/* space-yを増やして間隔を広げる */}
      <h3 className="font-semibold text-lg">プレイリスト</h3>{' '}
      {/* フォントとサイズを調整 */}
      {playlist.length === 0 ? (
        <div className="text-center text-muted-foreground p-8 border border-dashed rounded-lg">
          {' '}
          {/* 空の状態のスタイルを改善 */}
          <p className="mb-2">プレイリストは空です。</p>
          <p className="text-sm">
            YouTubeのURLを追加して、動画をここに追加しましょう！
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {' '}
          {/* space-yを増やして間隔を広げる */}
          {playlist.map((item, index) => (
            <li
              key={item.id}
              className={`flex items-center gap-4 p-3 border rounded-lg shadow-sm transition-all duration-200
                ${
                  currentIndex === index
                    ? 'bg-primary/10 border-primary ring-2 ring-primary/50'
                    : 'bg-card hover:bg-card-foreground/5'
                }`}
            >
              <img
                src={getThumbnailUrl(item.id)}
                alt={item.title}
                className="w-24 h-14 object-cover rounded-md flex-shrink-0" // サムネイルサイズを固定
              />
              <button
                type="button"
                className="flex-1 text-left font-medium text-foreground hover:text-primary transition-colors truncate" // タイトルを強調し、truncateを追加
                onClick={() => play(item.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    play(item.id);
                  }
                }}
              >
                {item.title || `動画 ${index + 1}`}
              </button>
              <Button
                variant="ghost"
                size="icon" // サイズをアイコン用に変更
                onClick={() => removeFromPlaylist(index)}
                className="flex-shrink-0 text-muted-foreground hover:text-destructive" // 色を変更
              >
                <Trash2 className="h-5 w-5" /> {/* アイコンに変更 */}
                <span className="sr-only">削除</span>{' '}
                {/* スクリーンリーダー用 */}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
