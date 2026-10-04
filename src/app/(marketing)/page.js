import Hero from '@/components/Hero';
import PadPreview from '@/components/PadPreview';
import HowItWorks from '@/components/HowItWorks';
import Features from '@/components/Features';
import UseCases from '@/components/UseCases';

export const metadata = {
  title: {
    absolute: 'MyPad — Simple Shared Text & Notes',
  },
  description:
    'MyPad is a simple, fast way to create and share text pads using a URL. No complicated setup, accounts, or friction.',
  alternates: {
    canonical: '/',
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
    <div className="flex flex-col w-full">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Section with Primary Pad Input */}
      <Hero />

      {/* Realistic Minimal Pad Interface Demo */}
      <div className="pb-16 sm:pb-24">
        <PadPreview />
      </div>

      {/* How It Works */}
      <HowItWorks />

      {/* Features Grid */}
      <Features />

      {/* Use Cases */}
      <UseCases />

      {/* Bottom Minimal Prompt */}
      <section className="py-16 sm:py-20 border-t border-zinc-200/60 text-center bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-950">
            Start writing in seconds.
          </h2>
          <p className="mt-3 text-sm text-zinc-600 font-normal">
            No signup, no configuration, no friction. Just choose a URL and begin.
          </p>
          <div className="mt-6 flex justify-center">
            <a
              href="#pad-entry"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-white text-xs sm:text-sm font-medium transition-all shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2"
            >
              <span>Create Your First Pad</span>
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2.5"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
