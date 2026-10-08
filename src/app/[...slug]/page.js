import Link from 'next/link';
import { normalizePadSegments, getPadBreadcrumbs } from '@/lib/pad-path';
import { getPadByPath, getPadNavigationContext } from '@/lib/pads-db';
import { getPadFilesMetadata } from '@/lib/files-db';
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
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-zinc-950 px-4">
        <div className="max-w-md w-full p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-center shadow-xs">
          <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-4 font-mono text-sm font-semibold">
            !
          </div>
          <h1 className="text-lg font-semibold text-zinc-950 dark:text-zinc-100 tracking-tight">
            Invalid Pad Path
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">
            {result.error || 'The requested URL path contains invalid or unsupported characters.'}
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-2">
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 rounded-lg bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 text-xs font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950"
            >
              Return Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Load existing content, navigation tree context, and file metadata in parallel
  let initialContent = '';
  let initialTheme = 'light';
  let navContext = null;
  let initialFiles = [];
  let initialFilesTotalSize = 0;

  try {
    const [padRes, navRes, filesRes] = await Promise.all([
      getPadByPath(result.path),
      getPadNavigationContext(result.path),
      getPadFilesMetadata(result.path),
    ]);

    if (padRes.pad) {
      if (padRes.pad.content) {
        initialContent = padRes.pad.content;
      }
      if (padRes.pad.theme === 'dark' || padRes.pad.theme === 'light') {
        initialTheme = padRes.pad.theme;
      }
    }
    navContext = navRes;
    if (filesRes && Array.isArray(filesRes.files)) {
      initialFiles = filesRes.files;
      initialFilesTotalSize = filesRes.totalSize || 0;
    }
  } catch (err) {
    console.error('Failed to load pad context from database:', err.message);
  }

  const breadcrumbs = getPadBreadcrumbs(result.segments);

  return (
    <PadEditor
      key={result.path}
      canonicalPath={result.path}
      breadcrumbs={breadcrumbs}
      initialContent={initialContent}
      initialTheme={initialTheme}
      navContext={navContext}
      initialFiles={initialFiles}
      initialFilesTotalSize={initialFilesTotalSize}
    />
  );
}
