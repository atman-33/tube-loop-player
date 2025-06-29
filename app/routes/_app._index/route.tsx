import type { Route } from './+types/route';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "TubeLoopPlayer" },
    { name: "description", content: "YouTube video loop player" },
  ];
}

export default function Home() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">TubeLoopPlayer</h1>
      <div className="aspect-video w-full max-w-4xl mx-auto bg-gray-200 rounded-lg">
        {/* YouTubeプレイヤーがここに入る */}
      </div>
    </div>
  );
}
