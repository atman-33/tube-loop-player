import { PlaylistDisplay } from '../../components/playlist-display';
import { PlaylistInputForm } from '../../components/playlist-input-form';
import { YouTubePlayer } from '../../components/you-tube-player';
import type { Route } from './+types/route';

// biome-ignore lint/correctness/noEmptyPattern: <>
export function meta({}: Route.MetaArgs) {
  return [
    { title: 'TubeLoopPlayer' },
    { name: 'description', content: 'YouTube video loop player' },
  ];
}

export default function Home() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 font-bold text-2xl">TubeLoopPlayer</h1>
      <div className="flex flex-col gap-6 md:flex-row">
        <div className="flex-1">
          <YouTubePlayer />
        </div>
        <div className="space-y-4 md:w-80">
          <PlaylistInputForm />
          <PlaylistDisplay />
        </div>
      </div>
    </div>
  );
}
