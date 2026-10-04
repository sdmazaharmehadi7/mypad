import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || 'https://mypad-org.vercel.app'
  ),
  title: {
    default: 'MyPad — Simple Shared Text & Notes',
    template: '%s | MyPad',
  },
  description:
    'MyPad is a simple, fast way to create and share text pads using a URL. No complicated setup.',
  applicationName: 'MyPad',
  authors: [{ name: 'MyPad Team' }],
  keywords: [
    'shared text',
    'minimal notepad',
    'instant notes',
    'collaborative workspace',
    'url notepad',
    'online notepad',
    'realtime text sharing',
  ],
  creator: 'MyPad',
  publisher: 'MyPad',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://mypad-org.vercel.app',
    siteName: 'MyPad',
    title: 'MyPad — Simple Shared Text & Notes',
    description:
      'MyPad is a simple, fast way to create and share text pads using a URL. No complicated setup.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MyPad — Simple Shared Text & Notes',
    description:
      'MyPad is a simple, fast way to create and share text pads using a URL. No complicated setup.',
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon.png', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  verification: {
    google: 'BSNRaxyNYwPNCYTEiD4No5rRHNVnEBXj_ds-BgLJy38',
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full scroll-smooth antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-zinc-900 selection:bg-zinc-200 selection:text-zinc-950 font-sans">
        {/* Skip to Main Content Link for Keyboard Accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-50 px-4 py-2 bg-zinc-950 text-white text-xs font-medium rounded shadow-md focus:outline-none focus:ring-2 focus:ring-zinc-950"
        >
          Skip to main content
        </a>

        {children}
      </body>
    </html>
  );
}
