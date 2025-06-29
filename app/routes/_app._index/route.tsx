import type { Route } from './+types/route';

// biome-ignore lint/correctness/noEmptyPattern: <>
export function meta({}: Route.MetaArgs) {
  return [
    { title: 'TubeLoopPlayer' },
    { name: 'description', content: 'YouTube video loop player' },
  ];
}

import { YouTubePlayer } from '../../components/YouTubePlayer';

export default function Home() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 font-bold text-2xl">TubeLoopPlayer</h1>
      <YouTubePlayer />
    </div>
  );
}
