import PadInput from '@/components/PadInput';

export const metadata = {
  title: {
    absolute: 'MyPad — Simple Shared Text & Notes',
  },
  description:
    'Create, edit, and collaborate in real-time by simply navigating to any URL. No accounts, no invitations, and zero complicated setup.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://mypad-org.vercel.app',
    siteName: 'MyPad',
    title: 'MyPad — Simple Shared Text & Notes',
    description:
      'Create, edit, and collaborate in real-time by simply navigating to any URL. No accounts, no invitations, and zero complicated setup.',
  },
};

export default function HomePage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mypad-org.vercel.app';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        url: siteUrl,
        name: 'MyPad',
        description: 'Simple shared text and collaborative notes via URL.',
        inLanguage: 'en-US',
      },
      {
        '@type': 'SoftwareApplication',
        '@id': `${siteUrl}/#software`,
        name: 'MyPad',
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'All',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        description:
          'Minimal, URL-based collaborative text workspace for instant note sharing without sign-up.',
      },
    ],
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-start px-4 sm:px-6 w-full pt-24 sm:pt-28">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Centered compact tool interface */}
      <div className="w-full max-w-xl mx-auto text-center">
        {/* Headline */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-zinc-950 leading-[1.15]">
          Simple shared text, instantly.
        </h1>

        {/* Description */}
        <p className="mt-3 sm:mt-4 text-base sm:text-lg text-zinc-600 max-w-lg mx-auto font-normal leading-relaxed">
          Create, edit, and collaborate in real-time by simply navigating to any URL. No accounts, no invitations, and zero complicated setup.
        </p>

        {/* Primary Pad Entry Interface */}
        <div className="mt-6 sm:mt-8">
          <PadInput />
        </div>
      </div>
    </div>
  );
}
