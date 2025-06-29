import { usePlayerStore } from '../stores/player';
import { Button } from './ui/button';

export const PlaylistDisplay = () => {
  const { playlist, currentIndex, removeFromPlaylist, play } = usePlayerStore();

  return (
    <div className="space-y-2">
      <h3 className="font-medium">プレイリスト</h3>
      {playlist.length === 0 ? (
        <p className="text-sm text-gray-500">プレイリストが空です</p>
      ) : (
        <ul className="space-y-1">
          {playlist.map((item, index) => (
            <li
              key={item.id}
              className={`flex items-center justify-between p-2 rounded ${currentIndex === index ? 'bg-gray-100' : ''}`}
            >
              <button
                type="button"
                className="text-left hover:underline flex-1"
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
                size="sm"
                onClick={() => removeFromPlaylist(index)}
              >
                削除
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
