import Link from 'next/link';
import { normalizePadSegments, getPadBreadcrumbs } from '@/lib/pad-path';
import { getPadByPath, getPadNavigationContext } from '@/lib/pads-db';
import PadEditor from '@/components/PadEditor';

export const dynamic = 'force-dynamic';

/**
 * Generate metadata for the pad route.
 * In accordance with SEO rules:
 * User-generated pads must NOT be indexed by search engine crawlers.
 */
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const result = normalizePadSegments(slug);

  if (!result.isValid) {
    return {
      title: 'Invalid Pad Path',
      robots: { index: false, follow: false },
    };
  }

  return {
    title: result.title,
    description: `Collaborative pad at ${result.path}`,
    robots: {
      index: false,
      follow: true,
    },
  };
}

export default async function PadCatchAllPage({ params }) {
  const { slug } = await params;
  const result = normalizePadSegments(slug);

  // If path is invalid or unsafe, show a clean, accessible error state
  if (!result.isValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="max-w-md w-full p-6 rounded-xl border border-zinc-200 bg-white text-center shadow-xs">
          <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4 font-mono text-sm font-semibold">
            !
          </div>
          <h1 className="text-lg font-semibold text-zinc-950 tracking-tight">
            Invalid Pad Path
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-zinc-600 leading-relaxed font-normal">
            {result.error || 'The requested URL path contains invalid or unsupported characters.'}
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-2">
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 rounded-lg bg-zinc-950 text-white text-xs font-medium hover:bg-zinc-800 transition-colors shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950"
            >
              Return Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Load existing content and navigation tree context in parallel
  let initialContent = '';
  let navContext = null;

  try {
    const [padRes, navRes] = await Promise.all([
      getPadByPath(result.path),
      getPadNavigationContext(result.path),
    ]);

    if (padRes.pad && padRes.pad.content) {
      initialContent = padRes.pad.content;
    }
    navContext = navRes;
  } catch (err) {
    console.error('Failed to load pad context from database:', err.message);
  }

  const breadcrumbs = getPadBreadcrumbs(result.segments);

  return (
    <PadEditor
      canonicalPath={result.path}
      breadcrumbs={breadcrumbs}
      initialContent={initialContent}
      navContext={navContext}
    />
  );
}
