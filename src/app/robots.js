export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mypad.vercel.app';

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/features',
          '/how-it-works',
          '/use-cases',
          '/for-students',
          '/for-developers',
          '/online-notepad',
        ],
        disallow: [
          '/api/',
          '/api/*',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
