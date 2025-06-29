import { useEffect, useRef } from 'react';
import { usePlayerStore } from '../stores/player';

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

export const useYouTubePlayer = (elementId: string) => {
  const playerRef = useRef<any>(null);
  const { setPlayerInstance } = usePlayerStore();

  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        playerRef.current = new window.YT.Player(elementId, {
          events: {
            onReady: (event: any) => console.log('Player ready', event),
            onStateChange: (event: any) =>
              console.log('State changed', event.data),
          },
        });
        setPlayerInstance(playerRef.current);
      };
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [elementId, setPlayerInstance]);

  return playerRef;
};
