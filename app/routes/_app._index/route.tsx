import { useEffect } from 'react';
import { siteConfig } from '~/config/site-config';
import { usePlayerStore } from '../../stores/player';
import type { Route } from './+types/route';
import { PlaylistDisplay } from './components/playlist-display';
import { PlaylistInputForm } from './components/playlist-input-form';
import { YouTubePlayer } from './components/you-tube-player';

// biome-ignore lint/correctness/noEmptyPattern: <>
export function meta({}: Route.MetaArgs) {
  const title = 'TubeLoopPlayer - Loop & Playlist Your Favorite YouTube Videos';
  const description =
    'TubeLoopPlayer is a free web app that lets you loop YouTube videos endlessly or create custom playlists for continuous playback. Perfect for music, tutorials, and more.';
  const imageUrl = `${siteConfig.url}/ogp-image.png`; // URL for the OGP image
  const pageUrl = siteConfig.url;

  return [
    { title: title },
    { name: 'description', content: description },
    {
      name: 'keywords',
      content: 'YouTube, loop, looper, player, playlist, repeat, video, music',
    },
    // OGP tags
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: pageUrl },
    { property: 'og:image', content: imageUrl },
    { property: 'og:site_name', content: 'TubeLoopPlayer' },
    // Twitter card tags
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: imageUrl },
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
        <h2 className="mt-4 mb-2 font-bold text-xl">How to Use</h2>
        <ol className="list-inside list-decimal text-gray-700 dark:text-gray-300">
          <li>
            <b>Add Videos:</b> Paste a YouTube URL and click "Add" to add it to
            the playlist.
          </li>
          <li>
            <b>Playback:</b> Videos will play automatically. Click any video in
            the list to play it.
          </li>
          <li>
            <b>Manage Playlist:</b>
            <ul className="list-inside list-disc pl-4">
              <li>
                <b>Loop:</b> Toggle the "Loop" button to repeat the entire
                playlist.
              </li>
              <li>
                <b>Shuffle:</b> Toggle the "Shuffle" button to play videos in
                random order.
              </li>
              <li>
                <b>Reorder:</b> Drag and drop videos to change the playback
                order.
              </li>
              <li>
                <b>Delete:</b> Click the trash icon to remove a video from the
                list.
              </li>
            </ul>
          </li>
          <li>
            <b>Auto-Save:</b> Your playlist and settings are automatically saved
            in your browser.
          </li>
        </ol>
      </div>
    </div>
  );
}
