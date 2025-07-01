import { useEffect } from 'react';
import { usePlayerStore } from '../../stores/player';
import type { Route } from './+types/route';
import { PlaylistDisplay } from './components/playlist-display';
import { PlaylistInputForm } from './components/playlist-input-form';
import { YouTubePlayer } from './components/you-tube-player';

// biome-ignore lint/correctness/noEmptyPattern: <>
export function meta({}: Route.MetaArgs) {
  return [
    { title: 'TubeLoopPlayer' },
    { name: 'description', content: 'YouTube video loop player' },
  ];
}

export default function Home() {
  const { setPlayingStateToFalse } = usePlayerStore();

  useEffect(() => {
    setPlayingStateToFalse();
  }, [setPlayingStateToFalse]);

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col gap-6 md:flex-row">
        <div className="flex-1">
          <YouTubePlayer />
        </div>
        <div className="space-y-4 md:w-1/3">
          <PlaylistInputForm />
          <PlaylistDisplay />
        </div>
      </div>
      <div className="mt-8 rounded-lg bg-gray-100 p-4 dark:bg-gray-800">
        <h2 className="mb-2 font-bold text-xl">About TubeLoopPlayer</h2>
        <p className="mb-4 text-gray-700 dark:text-gray-300">
          TubeLoopPlayer is a simple yet powerful web application designed to
          enhance your YouTube video viewing experience. It allows you to
          seamlessly loop specific YouTube videos or create custom playlists for
          continuous playback.
        </p>
        <h2 className="mb-2 font-bold text-xl">Key Features</h2>
        <ul className="list-inside list-disc text-gray-700 dark:text-gray-300">
          <li>Loop individual YouTube videos for repetitive viewing.</li>
          <li>Create and manage custom playlists from YouTube URLs.</li>
          <li>Intuitive interface for easy video and playlist management.</li>
          <li>Persistent storage of playlists and settings using cookies.</li>
          <li>Seamless integration with the YouTube IFrame API.</li>
        </ul>
      </div>
    </div>
  );
}
