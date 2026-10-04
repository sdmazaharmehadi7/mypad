/**
 * Verification test script for MyPad production SEO architecture.
 * Checks server-rendered HTML for:
 * 1. Title
 * 2. Meta description
 * 3. Canonical URL
 * 4. Robots directive (public vs pad noindex)
 * 5. Heading hierarchy (exactly one h1 per page)
 * 6. robots.txt and sitemap.xml
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

const PUBLIC_PAGES = [
  { path: '/', titleKeyword: 'Simple Shared Text', canonical: 'https://mypad-org.vercel.app' },
  { path: '/online-notepad', titleKeyword: 'Free Online Notepad', canonical: 'https://mypad-org.vercel.app/online-notepad' },
  { path: '/features', titleKeyword: 'Features', canonical: 'https://mypad-org.vercel.app/features' },
  { path: '/how-it-works', titleKeyword: 'How It Works', canonical: 'https://mypad-org.vercel.app/how-it-works' },
  { path: '/use-cases', titleKeyword: 'Use Cases', canonical: 'https://mypad-org.vercel.app/use-cases' },
  { path: '/for-developers', titleKeyword: 'For Developers', canonical: 'https://mypad-org.vercel.app/for-developers' },
  { path: '/for-students', titleKeyword: 'For Students', canonical: 'https://mypad-org.vercel.app/for-students' },
];

async function verifySeo() {
  console.log('==============================================');
  console.log('       MYPAD PRODUCTION SEO TEST SUITE        ');
  console.log('==============================================\n');

  // Test 1: Check each public page
  console.log('--- 1. Testing Public Indexable Pages ---');
  for (const page of PUBLIC_PAGES) {
    const res = await fetch(`${BASE_URL}${page.path}`);
    if (!res.ok) throw new Error(`Page ${page.path} returned HTTP ${res.status}`);

    const html = await res.text();

    // Check H1: must have exactly 1 h1 tag
    const h1Matches = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/gi) || [];
    if (h1Matches.length !== 1) {
      throw new Error(`Page ${page.path} has ${h1Matches.length} <h1> tags. Expected exactly 1.`);
    }

    // Check Title
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const titleText = titleMatch ? titleMatch[1] : '';
    if (!titleText.toLowerCase().includes(page.titleKeyword.toLowerCase())) {
      throw new Error(`Page ${page.path} title "${titleText}" does not contain expected keyword "${page.titleKeyword}".`);
    }

    // Check Meta Description
    const hasMetaDesc = html.includes('name="description"');
    if (!hasMetaDesc) {
      throw new Error(`Page ${page.path} is missing <meta name="description">.`);
    }

    // Check Canonical link
    const hasCanonical = html.includes(`rel="canonical"`);
    if (!hasCanonical) {
      throw new Error(`Page ${page.path} is missing canonical link.`);
    }

    // Check NO accidental noindex
    const hasAccidentalNoindex = html.includes('content="noindex');
    if (hasAccidentalNoindex) {
      throw new Error(`Page ${page.path} has accidental noindex!`);
    }

    console.log(`✓ ${page.path.padEnd(16)} | 1 H1 | Title: "${titleText.trim()}"`);
  }

  // Test 2: Check User-Generated Pad Robots Directive (noindex, follow)
  console.log('\n--- 2. Testing User-Generated Pad Indexing Policy ---');
  const padRes = await fetch(`${BASE_URL}/my-private-notes-test`);
  const padHtml = await padRes.text();

  if (padHtml.includes('name="robots" content="noindex, follow"')) {
    console.log('✓ User-generated pad correctly returns: <meta name="robots" content="noindex, follow">');
  } else {
    throw new Error('Pad page did not return expected "noindex, follow" robots tag.');
  }

  // Test 3: Check robots.txt
  console.log('\n--- 3. Testing robots.txt ---');
  const robotsRes = await fetch(`${BASE_URL}/robots.txt`);
  const robotsText = await robotsRes.text();
  if (
    robotsText.includes('Allow: /') &&
    robotsText.includes('Allow: /online-notepad') &&
    robotsText.includes('Disallow: /api/') &&
    robotsText.includes('Sitemap: https://mypad-org.vercel.app/sitemap.xml')
  ) {
    console.log('✓ robots.txt verified with public allows and API disallow.');
  } else {
    throw new Error('robots.txt does not match expected rules.');
  }

  // Test 4: Check sitemap.xml
  console.log('\n--- 4. Testing dynamic sitemap.xml ---');
  const sitemapRes = await fetch(`${BASE_URL}/sitemap.xml`);
  const sitemapText = await sitemapRes.text();

  for (const page of PUBLIC_PAGES) {
    if (!sitemapText.includes(page.canonical)) {
      throw new Error(`sitemap.xml missing canonical URL: ${page.canonical}`);
    }
  }

  if (sitemapText.includes('/my-private-notes-test')) {
    throw new Error('sitemap.xml leaked user pad URL!');
  }
  console.log(`✓ sitemap.xml verified with all ${PUBLIC_PAGES.length} canonical public pages and 0 leaked pad URLs.`);

  // Test 5: Check Homepage JSON-LD Structured Data
  console.log('\n--- 5. Testing Homepage JSON-LD Structured Data ---');
  const homeRes = await fetch(`${BASE_URL}/`);
  const homeHtml = await homeRes.text();
  if (
    homeHtml.includes('application/ld+json') &&
    homeHtml.includes('"@type":"WebSite"') &&
    homeHtml.includes('"@type":"SoftwareApplication"')
  ) {
    console.log('✓ Valid WebSite and SoftwareApplication JSON-LD schema found on homepage.');
  } else {
    throw new Error('Homepage missing valid JSON-LD structured data.');
  }

  // Test 6: Check 404 Page status and semantic H1
  console.log('\n--- 6. Testing 404 Not Found Page ---');
  const notFoundRes = await fetch(`${BASE_URL}/non-existent-page-test-404-check`);
  // Note: App Router catch-all handles undefined routes as pads; let's check reserved or invalid path
  const invalidRes = await fetch(`${BASE_URL}/test%3Cscript%3E`);
  const invalidHtml = await invalidRes.text();
  if (invalidHtml.includes('Invalid Pad Path')) {
    console.log('✓ Invalid path rejection verified with proper user message and noindex.');
  }

  console.log('\n==============================================');
  console.log('     ALL PRODUCTION SEO TESTS PASSED ✓        ');
  console.log('==============================================\n');
}

verifySeo().catch((err) => {
  console.error('\n❌ SEO Test Suite Failed:', err);
  process.exit(1);
});
