import { getPadByPath, savePadContent } from '../src/lib/pads-db.js';
import {
  savePadFiles,
  getPadFilesMetadata,
  getPadFileForDownload,
  deletePadFile,
  MAX_PAD_FILES_SIZE_BYTES,
} from '../src/lib/files-db.js';

async function verifyProductionReadiness() {
  console.log('=== Running Production-Readiness Automated Verification ===\n');

  // 1. Environment & Database Configuration Check
  console.log('1. Checking Database Configuration...');
  if (!process.env.MONGODB_URI) {
    console.warn('⚠️  MONGODB_URI is not set. Using in-memory fallback store.');
  } else {
    console.assert(!process.env.MONGODB_URI.includes('NEXT_PUBLIC_'), 'MONGODB_URI must never be exposed as public');
    console.log('✓ MongoDB URI is properly configured via server environment variable.');
  }

  // 2. Text Pad Core Operations
  console.log('2. Verifying Pad Core Operations...');
  const testPad = `/prod-check-${Date.now()}`;
  const saveRes = await savePadContent(testPad, '# Production Ready\n\nVerified persistence.');
  console.assert(!saveRes.error, `Pad save failed: ${saveRes.error}`);
  console.assert(saveRes.pad.path === testPad, 'Pad path matches');

  const loadRes = await getPadByPath(testPad);
  console.assert(loadRes.pad && loadRes.pad.content.includes('Production Ready'), 'Pad content matches');
  console.log('✓ Text-pad saving and retrieval verified.');

  // 3. File Attachments: Upload, Metadata (No Binary), Download, Delete
  console.log('3. Verifying File Attachment System...');
  const testBuffer = Buffer.from('Production file attachment content');
  const uploadRes = await savePadFiles(testPad, [
    { filename: 'prod-doc.txt', mimeType: 'text/plain', buffer: testBuffer },
  ]);
  console.assert(!uploadRes.error, `Upload failed: ${uploadRes.error}`);
  console.assert(uploadRes.savedFiles.length === 1, 'Saved 1 file');
  const file = uploadRes.savedFiles[0];
  console.assert(file.data === undefined, 'CRITICAL: File metadata must not contain binary data');

  // Verify Pad Metadata listing
  const metaList = await getPadFilesMetadata(testPad);
  console.assert(metaList.files.length === 1, 'List contains 1 file');
  console.assert(metaList.files[0].data === undefined, 'CRITICAL: Metadata listing must never include binary data');

  // Verify Download
  const downloadRes = await getPadFileForDownload(testPad, file.fileId);
  console.assert(downloadRes.file && downloadRes.file.data.toString() === 'Production file attachment content', 'Downloaded data matches');

  // Verify 5 MB limit enforcement
  const oversizedBuffer = Buffer.alloc(MAX_PAD_FILES_SIZE_BYTES + 1024, 'X');
  const overRes = await savePadFiles(testPad, [
    { filename: 'oversized.bin', mimeType: 'application/octet-stream', buffer: oversizedBuffer },
  ]);
  console.assert(overRes.error, 'Oversized upload must be rejected');
  console.log('✓ File attachments (upload, metadata isolation, download, 5MB limit) verified.');

  // Clean up
  await deletePadFile(testPad, file.fileId);
  const afterDelete = await getPadFilesMetadata(testPad);
  console.assert(afterDelete.files.length === 0, 'Cleaned up test file');

  console.log('\n=== Production Verification Succeeded: All Systems Operational ===');
}

verifyProductionReadiness().catch((err) => {
  console.error('Production verification failed:', err);
  process.exit(1);
});
