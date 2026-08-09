import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Returnly — Palackvisszavitel-követő',
    short_name: 'Returnly',
    description:
      'Palackgyűjtés és visszavitel követése egyszerűen, a csapatoddal együtt.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f4f8f5',
    theme_color: '#009f6b',
    icons: [
      {
        src: '/returnly-icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/returnly-icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable',
      },
    ],
  }
}
