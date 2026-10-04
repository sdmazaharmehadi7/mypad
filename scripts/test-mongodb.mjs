/**
 * Live verification test script for MyPad MongoDB Atlas integration.
 * Tests connection, unique index, CRUD, nested paths, unicode/spaces, and persistence.
 */

import { getDb, getMongoClientPromise } from '../src/lib/mongodb.js';
import {
  getPadsCollection,
  getPadByPath,
  savePadContent,
  getPadNavigationContext,
} from '../src/lib/pads-db.js';

async function runTests() {
  console.log('--- 1. Testing MongoDB Connection ---');
  const client = await getMongoClientPromise();
  console.log('✓ Successfully connected to MongoDB client.');

  const db = await getDb('mypad');
  const collection = await getPadsCollection();
  console.log(`✓ Accessing database: "${db.databaseName}", collection: "${collection.collectionName}"`);

  // Ensure unique index
  console.log('\n--- 2. Verifying Unique Index on path ---');
  const indexes = await collection.indexes();
  const pathIndex = indexes.find((idx) => idx.key && idx.key.path === 1);
  console.log('Indexes on pads collection:', indexes.map((i) => i.name));
  if (pathIndex && pathIndex.unique) {
    console.log('✓ Unique index on "path" confirmed.');
  } else {
    console.log('Creating unique index on "path"...');
    await collection.createIndex({ path: 1 }, { unique: true });
    console.log('✓ Unique index created.');
  }

  // Test 3: Save pad
  console.log('\n--- 3. Testing SAVE / UPSERT Pad ---');
  const testPath = '/test/verification-' + Date.now();
  const createdResult = await savePadContent(testPath, 'Initial verification content.');
  console.log('Save result:', {
    path: createdResult.pad.path,
    content: createdResult.pad.content,
    skipped: createdResult.skipped,
  });
  if (!createdResult.skipped && createdResult.pad.content === 'Initial verification content.') {
    console.log('✓ Pad saved successfully.');
  } else {
    throw new Error('Failed to save pad.');
  }

  // Test 4: UPDATE pad content
  console.log('\n--- 4. Testing UPDATE Pad Content ---');
  const updatedResult = await savePadContent(testPath, 'Updated content through database layer.');
  console.log('Update result:', {
    path: updatedResult.pad.path,
    content: updatedResult.pad.content,
    updatedAt: updatedResult.pad.updatedAt,
  });
  if (updatedResult.pad.content === 'Updated content through database layer.') {
    console.log('✓ Pad content updated successfully.');
  } else {
    throw new Error('Failed to update pad.');
  }

  // Test 5: Reload pad / Confirm persistence
  console.log('\n--- 5. Confirming Persistence (GET by path) ---');
  const fetchResult = await getPadByPath(testPath);
  console.log('Fetched pad from database:', fetchResult.pad);
  if (fetchResult.pad && fetchResult.pad.content === 'Updated content through database layer.') {
    console.log('✓ Persistence verified: content matches across separate query.');
  } else {
    throw new Error('Failed persistence verification.');
  }

  // Test 6: Nested paths
  console.log('\n--- 6. Testing 3-Level Nested Path ---');
  const nestedPath = '/college/notes/deep-learning';
  const nestedResult = await savePadContent(nestedPath, 'Deep learning lecture notes.');
  console.log('Nested pad result:', nestedResult.pad);
  if (nestedResult.pad.path === nestedPath) {
    console.log('✓ Nested path persisted with preserved hierarchy.');
  } else {
    throw new Error('Failed nested path persistence.');
  }

  // Test 7: Scoped navigation context tree from MongoDB
  console.log('\n--- 7. Testing Navigation Tree Query ---');
  const navTree = await getPadNavigationContext('/college/notes');
  console.log('Children found under /college/notes:', navTree.children.map((c) => c.name));
  if (navTree.children.some((c) => c.name === 'deep-learning')) {
    console.log('✓ Scoped navigation tree query verified against live database.');
  } else {
    throw new Error('Failed navigation tree query.');
  }

  // Test 8: Special characters and URL-encoded spaces
  console.log('\n--- 8. Testing Special Characters & Decoded Spaces ---');
  const specialPath = '/08 codigo persistencia';
  const specialResult = await savePadContent(specialPath, 'Notes with spaces in the URL.');
  console.log('Special characters pad result:', specialResult.pad);
  if (specialResult.pad.path === '/08 codigo persistencia') {
    console.log('✓ Path with spaces normalized and stored canonically.');
  } else {
    throw new Error('Failed special path persistence.');
  }

  // Test 9: Empty pad skip protection (prevent bot document sprawl)
  console.log('\n--- 9. Testing Empty Pad Skip Protection ---');
  const emptyResult = await savePadContent('/brand-new-never-saved-' + Date.now(), '   ');
  console.log('Empty save attempt result:', emptyResult);
  if (emptyResult.skipped === true) {
    console.log('✓ Empty content skipped: no document created in database.');
  } else {
    throw new Error('Empty pad should have been skipped.');
  }

  // Test 10: Invalid path rejection
  console.log('\n--- 10. Testing Invalid Path Rejection ---');
  const invalidResult = await savePadContent('/bad/../path', 'Malicious content');
  console.log('Invalid path result:', invalidResult);
  if (!invalidResult.pad && invalidResult.error) {
    console.log('✓ Invalid path traversal rejected:', invalidResult.error);
  } else {
    throw new Error('Invalid path should have been rejected.');
  }

  // Clean up test pads
  console.log('\n--- Cleaning up temporary test pads ---');
  await collection.deleteMany({
    path: { $in: [testPath, nestedPath, specialPath] },
  });
  console.log('✓ Temporary test pads cleaned up.');

  console.log('\n========================================');
  console.log('ALL LIVE MONGODB TESTS PASSED ✓');
  console.log('========================================');

  process.exit(0);
}

runTests().catch((err) => {
  console.error('\n❌ Test failed with error:', err);
  process.exit(1);
});
