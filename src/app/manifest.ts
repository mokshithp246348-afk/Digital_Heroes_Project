import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Digital Heroes | Golf Performance & Charity Draw Platform',
    short_name: 'Digital Heroes',
    description: 'Log rolling golf scores, enter monthly jackpot draws, and support verified charities.',
    start_url: '/',
    display: 'standalone',
    background_color: '#07090e',
    theme_color: '#f97316',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
