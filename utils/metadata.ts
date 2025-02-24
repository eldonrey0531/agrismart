import { Metadata } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://agrismart.com';

export const defaultMetadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'AgriSmart Platform',
    template: '%s | AgriSmart',
  },
  description: 'Smart agricultural management platform for modern farming',
  keywords: ['agriculture', 'farming', 'smart farming', 'agtech', 'farm management'],
  authors: [
    {
      name: 'AgriSmart Team',
      url: baseUrl,
    },
  ],
  creator: 'AgriSmart Team',
  publisher: 'AgriSmart',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: baseUrl,
    title: 'AgriSmart Platform',
    description: 'Smart agricultural management platform for modern farming',
    siteName: 'AgriSmart',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AgriSmart Platform',
    description: 'Smart agricultural management platform for modern farming',
    creator: '@agrismart',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
};