import { useCallback, useEffect, useRef } from 'react';
import { usePlayerStore } from '../stores/player';

interface YouTubePlayerEvent {
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
        // biome-ignore lint/suspicious/noExplicitAny: <>
      ) => any;
      PlayerState: {
        ENDED: number;
      };
    };
  }
}

export const useYouTubePlayer = (elementId: string) => {
  // biome-ignore lint/suspicious/noExplicitAny: <>
  const playerRef = useRef<any>(null);
  const { setPlayerInstance, playNext } = usePlayerStore();

  const handlePlayerReady = useCallback((event: YouTubePlayerEvent) => {
    console.log('Player ready', event);
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
