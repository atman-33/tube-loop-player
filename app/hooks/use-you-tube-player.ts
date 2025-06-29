import { useCallback, useEffect, useRef } from 'react';
import { usePlayerStore } from '../stores/player';

interface YouTubePlayer {
  cueVideoById: (id: string) => void;
  // biome-ignore lint/suspicious/noExplicitAny: <>
  [key: string]: any;
}
interface YouTubePlayerEvent {
  target: YouTubePlayer;
  data: number;
}

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: {
      Player: new (
        elementId: string,
        options: {
          events: {
            onReady: (event: YouTubePlayerEvent) => void;
            onStateChange: (event: YouTubePlayerEvent) => void;
          };
        },
      ) => YouTubePlayer;
      PlayerState: {
        ENDED: number;
      };
    };
  }
}

export const useYouTubePlayer = (elementId: string) => {
  const playerRef = useRef<YouTubePlayer | null>(null);
  const { setPlayerInstance, playNext, currentVideoId } = usePlayerStore();
  const initialVideoIdRef = useRef(currentVideoId);

  const handlePlayerReady = useCallback((event: YouTubePlayerEvent) => {
    if (initialVideoIdRef.current) {
      event.target.cueVideoById(initialVideoIdRef.current);
    }
  }, []);

  const handleStateChange = useCallback(
    (event: YouTubePlayerEvent) => {
      if (event.data === window.YT.PlayerState.ENDED) {
        playNext();
      }
    },
    [playNext],
  );

  useEffect(() => {
    const createPlayer = () => {
      playerRef.current = new window.YT.Player(elementId, {
        events: {
          onReady: handlePlayerReady,
          onStateChange: handleStateChange,
        },
      });
      setPlayerInstance(playerRef.current);
    };

    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      window.onYouTubeIframeAPIReady = createPlayer;
    } else {
      createPlayer();
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [elementId, setPlayerInstance, handlePlayerReady, handleStateChange]);

  return playerRef;
};
