import { useCallback, useEffect, useRef } from "react";
import { usePlayerStore } from "../stores/player";

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
  const {
    setPlayerInstance,
    playNext,
    currentVideoId,
    loopMode,
    play,
    setPlayingStateToFalse,
  } = usePlayerStore();
  const initialVideoIdRef = useRef(currentVideoId);

  // useRef to hold the latest state and functions
  const stateRef = useRef({
    playNext,
    loopMode,
    currentVideoId,
    play,
    setPlayingStateToFalse,
  });

  useEffect(() => {
    stateRef.current = {
      playNext,
      loopMode,
      currentVideoId,
      play,
      setPlayingStateToFalse,
    };
  }, [playNext, loopMode, currentVideoId, play, setPlayingStateToFalse]);

  const handlePlayerReady = useCallback((event: YouTubePlayerEvent) => {
    if (initialVideoIdRef.current) {
      event.target.cueVideoById(initialVideoIdRef.current);
    }
  }, []);

  const handleStateChange = useCallback((event: YouTubePlayerEvent) => {
    if (event.data === window.YT.PlayerState.ENDED) {
      const { loopMode, currentVideoId, play, playNext } = stateRef.current;
      if (loopMode === "one" && currentVideoId) {
        play(currentVideoId);
      } else if (loopMode === "all") {
        playNext();
      } else {
        // This case handles when loop is off, if that mode is ever re-introduced.
        // For now, it will only be called if loopMode is somehow not 'one' or 'all'.
        stateRef.current.setPlayingStateToFalse();
      }
    }
  }, []);

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
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      window.onYouTubeIframeAPIReady = createPlayer;
    } else {
      createPlayer();
    }

    return () => {
      if (playerRef.current) {
        // biome-ignore lint/suspicious/noExplicitAny: <>
        const player = playerRef.current as any;
        if (player && typeof player.destroy === "function") {
          player.destroy();
        }
        playerRef.current = null;
      }
    };
  }, [elementId, setPlayerInstance, handlePlayerReady, handleStateChange]);

  return playerRef;
};
