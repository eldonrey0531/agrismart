import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Agriculture Hub',
    short_name: 'AgriHub',
    description: 'A modern platform for agricultural commerce and community.',
    start_url: '/',
    display: 'standalone',
    background_color: '#030A06',
    theme_color: '#38FF7E',
    icons: [
      {
        src: '/icon.png',
        sizes: '32x32',
        type: 'image/png',
      },
    ],
  };
}