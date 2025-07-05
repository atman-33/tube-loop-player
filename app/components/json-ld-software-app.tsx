import { useMemo } from 'react';

export function JsonLdSoftwareApp() {
  const schema = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'TubeLoopPlayer',
      operatingSystem: 'WEB',
      applicationCategory: 'MultimediaApplication',
      description:
        'A free web app that lets you loop YouTube videos endlessly or create custom playlists for continuous playback.',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    }),
    [],
  );

  // React 19 automatically hoists this to <head>
  return (
    <script
      id="schema-tubeloop"
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: <>
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
