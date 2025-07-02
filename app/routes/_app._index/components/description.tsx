import {
  Heart,
  ListPlus,
  ListVideo,
  MousePointerClick,
  Shuffle,
  Trash2,
  Undo2,
} from 'lucide-react';

export function Description() {
  return (
    <div className="mt-8 rounded-lg bg-gray-100 p-6 dark:bg-gray-800">
      <section className="mb-8">
        <h2 className="mb-4 font-bold text-2xl">Welcome to TubeLoopPlayer!</h2>
        <p className="text-gray-700 dark:text-gray-300">
          Enjoy your favorite YouTube videos endlessly. Create custom playlists
          for continuous playback of music, tutorials, and more.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-4 font-bold text-2xl">Key Features</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex items-start gap-4">
            <Undo2 className="mt-1 h-6 w-6 flex-shrink-0 text-blue-500" />
            <div>
              <h3 className="font-semibold text-lg">Endless Loop</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Loop any YouTube video for repetitive viewing.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <ListVideo className="mt-1 h-6 w-6 flex-shrink-0 text-green-500" />
            <div>
              <h3 className="font-semibold text-lg">Custom Playlists</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Create and manage playlists with your favorite videos.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <Shuffle className="mt-1 h-6 w-6 flex-shrink-0 text-orange-500" />
            <div>
              <h3 className="font-semibold text-lg">Shuffle Play</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Play your playlist in random order.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <Heart className="mt-1 h-6 w-6 flex-shrink-0 text-red-500" />
            <div>
              <h3 className="font-semibold text-lg">Auto-Save</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Your playlist and settings are automatically saved.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-4 font-bold text-2xl">How to Use</h2>
        <ol className="space-y-4 text-gray-700 dark:text-gray-300">
          <li className="flex items-start gap-4">
            <ListPlus className="mt-1 h-6 w-6 flex-shrink-0" />
            <div>
              <b>1. Add Videos:</b> Paste a YouTube URL and click "Add" to add
              it to the playlist.
            </div>
          </li>
          <li className="flex items-start gap-4">
            <MousePointerClick className="mt-1 h-6 w-6 flex-shrink-0" />
            <div>
              <b>2. Playback:</b> Videos play automatically. Click any video in
              the list to play it.
            </div>
          </li>
          <li className="flex items-start gap-4">
            <Trash2 className="mt-1 h-6 w-6 flex-shrink-0" />
            <div>
              <b>3. Manage Playlist:</b> Drag and drop to reorder, or click the
              trash icon to delete a video.
            </div>
          </li>
        </ol>
      </section>
    </div>
  );
}
