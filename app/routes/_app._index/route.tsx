import { useEffect } from 'react';
import { siteConfig } from '~/config/site-config';
import { usePlayerStore } from '../../stores/player';
import type { Route } from './+types/route';
import { Description } from './components/description';
import { PlaylistDisplay } from './components/playlist-display';
import { PlaylistInputForm } from './components/playlist-input-form';
import { YouTubePlayer } from './components/you-tube-player';

// biome-ignore lint/correctness/noEmptyPattern: <>
export function meta({ }: Route.MetaArgs) {
  const title = 'TubeLoopPlayer - Loop & Playlist Your Favorite YouTube Videos';
  const description =
    'TubeLoopPlayer is a free web app that lets you loop YouTube videos endlessly or create custom playlists for continuous playback. Perfect for music, tutorials, and more.';
  const imageUrl = `${siteConfig.appUrl}/ogp-image.png`; // URL for the OGP image
  const pageUrl = siteConfig.appUrl;

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
      {/* Adsterra Native Banner */}
      <div className='mt-8' id="container-5aa23d558292733924bbce492c900cef"></div>
      {/* NOTE: Use this space for ads if needed */}
      <Description />
    </div>
  );
}
