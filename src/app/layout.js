import { Geist, Geist_Mono } from 'next/font/google';
import Script from 'next/script';
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
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full scroll-smooth antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 selection:bg-zinc-200 dark:selection:bg-zinc-800 selection:text-zinc-950 dark:selection:text-zinc-100 font-sans transition-colors duration-150">
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var p=window.location.pathname;var m=['/','/features','/how-it-works','/use-cases','/online-notepad','/for-developers','/for-students'];var norm=p.replace(/\\/+$/,'')||'/';if(m.indexOf(norm)!==-1){document.documentElement.classList.remove('dark');}else{var t=localStorage.getItem('mypad-theme:'+norm);if(t==='dark'){document.documentElement.classList.add('dark');}else{document.documentElement.classList.remove('dark');}}}catch(e){}})();`,
          }}
        />
        {/* Skip to Main Content Link for Keyboard Accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-50 px-4 py-2 bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 text-xs font-medium rounded shadow-md focus:outline-none focus:ring-2 focus:ring-zinc-950"
        >
          Skip to main content
        </a>

        {children}
      </body>
    </html>
  );
}
