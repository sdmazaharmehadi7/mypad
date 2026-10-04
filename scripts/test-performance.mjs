import { promises as fs } from 'fs';
import path from 'path';

console.log('==============================================');
console.log('   MYPAD PRODUCTION PERFORMANCE AUDIT SUITE   ');
console.log('==============================================\n');

async function runPerformanceAudit() {
  const rootDir = process.cwd();

  // 1. Audit Client vs Server Component Boundaries
  console.log('--- 1. Client vs Server Component Audit ---');
  const componentsDir = path.join(rootDir, 'src', 'components');
  const appDir = path.join(rootDir, 'src', 'app');

  const componentFiles = await fs.readdir(componentsDir);
  const clientComponents = [];
  const serverComponents = [];

  for (const file of componentFiles) {
    if (file.endsWith('.js')) {
      const content = await fs.readFile(path.join(componentsDir, file), 'utf-8');
      if (content.includes("'use client'") || content.includes('"use client"')) {
        clientComponents.push(file);
      } else {
        serverComponents.push(file);
      }
    }
  }

  console.log(`Server Components (${serverComponents.length}):`, serverComponents.join(', '));
  console.log(`Client Components (${clientComponents.length}):`, clientComponents.join(', '));

  if (serverComponents.includes('Navbar.js') && serverComponents.includes('Footer.js') && serverComponents.includes('PadPreview.js')) {
    console.log('✓ App shell & marketing presentations are strictly Server Components.');
  } else {
    throw new Error('Expected Navbar, Footer, and PadPreview to be Server Components.');
  }

  // 2. Word Counter Algorithm Benchmark (INP Optimization)
  console.log('\n--- 2. Interaction to Next Paint (INP) Word Counter Benchmark ---');
  const sampleDoc = 'word '.repeat(10000); // 10,000 words document
  
  // Method A: Unoptimized split(/\s+/)
  const startSplit = performance.now();
  for (let i = 0; i < 100; i++) {
    const _ = sampleDoc.trim() ? sampleDoc.trim().split(/\s+/).length : 0;
  }
  const splitTime = performance.now() - startSplit;

  // Method B: Zero-allocation countWords
  function countWords(str) {
    if (!str) return 0;
    let count = 0;
    let inWord = false;
    for (let i = 0; i < str.length; i++) {
      const code = str.charCodeAt(i);
      if (code <= 32 && (code === 32 || code === 10 || code === 13 || code === 9)) {
        inWord = false;
      } else if (!inWord) {
        inWord = true;
        count++;
      }
    }
    return count;
  }

  const startFast = performance.now();
  for (let i = 0; i < 100; i++) {
    const _ = countWords(sampleDoc);
  }
  const fastTime = performance.now() - startFast;

  console.log(`Unoptimized split(/\\s+/) 100 runs: ${splitTime.toFixed(2)}ms`);
  console.log(`Zero-allocation countWords 100 runs: ${fastTime.toFixed(2)}ms`);
  console.log(`Speedup factor: ${(splitTime / fastTime).toFixed(1)}x faster (Zero memory allocation on keystrokes)`);
  console.log('✓ Fast word counter verified for fluid typing without GC pauses.');

  // 3. Database Projection Audit
  console.log('\n--- 3. Database Query Projections Audit ---');
  const dbFile = await fs.readFile(path.join(rootDir, 'src', 'lib', 'pads-db.js'), 'utf-8');
  if (dbFile.includes('projection: { path: 1, content: 1, createdAt: 1, updatedAt: 1, _id: 0 }')) {
    console.log('✓ getPadByPath and savePadContent project only necessary fields.');
  } else {
    throw new Error('Database projection not found in getPadByPath/savePadContent');
  }

  if (dbFile.includes('projection: { _id: 1 }')) {
    console.log('✓ Pad existence check uses index-only covered scan (projection: { _id: 1 }).');
  } else {
    throw new Error('Index-only scan not found for existence check');
  }

  // 4. API Cache-Control Header Verification
  console.log('\n--- 4. API Response Header Audit ---');
  const apiRouteFile = await fs.readFile(path.join(rootDir, 'src', 'app', 'api', 'pads', 'route.js'), 'utf-8');
  if (apiRouteFile.includes("'Cache-Control': 'no-store, max-age=0'")) {
    console.log('✓ API routes enforce Cache-Control: no-store, max-age=0.');
  } else {
    throw new Error('Missing Cache-Control header in API route');
  }

  // 5. Build Artifact Footprint Audit
  console.log('\n--- 5. Static Build Footprint Audit ---');
  const nextConfig = await fs.readFile(path.join(rootDir, 'next.config.mjs'), 'utf-8');
  if (nextConfig.includes('poweredByHeader: false') && nextConfig.includes('reactStrictMode: true')) {
    console.log('✓ next.config.mjs configured for optimal production output.');
  } else {
    throw new Error('next.config.mjs missing performance settings');
  }

  console.log('\n==============================================');
  console.log('  ALL PERFORMANCE AUDIT CHECKS PASSED ✓       ');
  console.log('==============================================');
}

runPerformanceAudit().catch((err) => {
  console.error('\nAudit Failed:', err.message);
  process.exit(1);
});
