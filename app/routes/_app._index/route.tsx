import type { Route } from './+types/route';

// biome-ignore lint/correctness/noEmptyPattern: <>
export function meta({}: Route.MetaArgs) {
  return [
    { title: 'TubeLoopPlayer' },
    { name: 'description', content: 'YouTube video loop player' },
  ];
}

import { YouTubePlayer } from '../../components/you-tube-player';

import { PlaylistDisplay } from '../../components/playlist-display';
import { PlaylistInputForm } from '../../components/playlist-input-form';

export default function Home() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 font-bold text-2xl">TubeLoopPlayer</h1>
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          <YouTubePlayer />
        </div>
        <div className="md:w-80 space-y-4">
          <PlaylistInputForm />
          <PlaylistDisplay />
        </div>
      </div>
    </div>
  );
}
