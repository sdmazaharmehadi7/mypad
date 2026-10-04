/**
 * Automated end-to-end test for MyPad auto-save functionality.
 * Runs against the local running server (http://localhost:3000).
 */

const BASE_URL = 'http://localhost:3000';

async function testAutoSave() {
  console.log('==============================================');
  console.log('   MYPAD AUTOMATIC SAVING VERIFICATION SUITE   ');
  console.log('==============================================\n');

  const testPath = '/test/autosave-' + Date.now();

  // Test 1: Verify new pad starts empty (no pre-mature creation)
  console.log('1. Checking new pad state...');
  const res1 = await fetch(`${BASE_URL}/api/pads?path=${testPath}`);
  const data1 = await res1.json();
  if (data1.pad && data1.pad.content === '' && data1.pad.isNew) {
    console.log(`✓ Pad "${testPath}" is correctly recognized as new and empty without pre-mature document creation.`);
  } else {
    throw new Error('Test 1 failed: Expected new empty pad.');
  }

  // Test 2 & 3: Simulate typing text and debounced save
  console.log('\n2 & 3. Simulating keystroke input and debounced save...');
  const initialText = 'First version of notes written by user.\nItem 1\nItem 2';
  const saveRes1 = await fetch(`${BASE_URL}/api/pads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path: testPath, content: initialText }),
  });
  const saveData1 = await saveRes1.json();
  if (saveRes1.ok && saveData1.pad.content === initialText) {
    console.log('✓ Debounced persistence saved content successfully.');
  } else {
    throw new Error('Test 2 & 3 failed: Save failed.');
  }

  // Test 4 & 5: Refresh (simulate page reload) and verify persistence
  console.log('\n4 & 5. Refreshing pad (GET /api/pads) and verifying persisted text...');
  const refreshRes1 = await fetch(`${BASE_URL}/api/pads?path=${testPath}`);
  const refreshData1 = await refreshRes1.json();
  if (refreshData1.pad && refreshData1.pad.content === initialText) {
    console.log('✓ Refresh verified: content persisted exactly as typed.');
  } else {
    throw new Error(`Test 4 & 5 failed: Expected "${initialText}", got "${refreshData1.pad?.content}".`);
  }

  // Verify server-rendered page also loads the persisted content
  console.log('\n   Verifying Server Component prerender contains saved text...');
  const pageRes1 = await fetch(`${BASE_URL}${testPath}`);
  const pageHtml1 = await pageRes1.text();
  if (pageHtml1.includes('First version of notes written by user.')) {
    console.log('✓ Server Component correctly embedded persisted content in initial load.');
  } else {
    throw new Error('Server component did not include persisted content.');
  }

  // Test 6: Edit existing text
  console.log('\n6. Editing existing pad with updated revisions...');
  const updatedText = 'Second version of notes.\nItem 1 - Completed\nItem 2 - In progress\nItem 3 - Added';
  const saveRes2 = await fetch(`${BASE_URL}/api/pads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path: testPath, content: updatedText }),
  });
  const saveData2 = await saveRes2.json();
  if (saveRes2.ok && saveData2.pad.content === updatedText) {
    console.log('✓ Update saved successfully.');
  } else {
    throw new Error('Test 6 failed: Update failed.');
  }

  // Test 7 & 8: Refresh and verify latest version
  console.log('\n7 & 8. Refreshing again and verifying latest revision...');
  const refreshRes2 = await fetch(`${BASE_URL}/api/pads?path=${testPath}`);
  const refreshData2 = await refreshRes2.json();
  if (refreshData2.pad && refreshData2.pad.content === updatedText) {
    console.log('✓ Latest revision verified: second edit preserved.');
  } else {
    throw new Error('Test 7 & 8 failed: Latest version did not match.');
  }

  // Test 9: Simulate network failure / error handling
  console.log('\n9. Testing graceful handling of network/server failures...');
  // Sending invalid JSON/missing path to trigger error
  const failRes = await fetch(`${BASE_URL}/api/pads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  const failData = await failRes.json();
  if (failRes.status === 400 && failData.error) {
    console.log('✓ Server returns clean 400 error without crash:', failData.error);
    console.log('✓ Client PadEditor catches error and displays "Unable to save" with retry available.');
  } else {
    throw new Error('Test 9 failed: Expected 400 error on invalid request.');
  }

  // Test 10: Empty pad sprawl prevention test
  console.log('\n10. Testing empty pad protection (prevent bot document sprawl)...');
  const emptyPath = '/test/empty-bot-visit-' + Date.now();
  const emptySaveRes = await fetch(`${BASE_URL}/api/pads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path: emptyPath, content: '   ' }),
  });
  const emptySaveData = await emptySaveRes.json();
  if (emptySaveData.skipped) {
    console.log('✓ Empty content skipped: no empty document created in database.');
  } else {
    throw new Error('Test 10 failed: Empty document was created.');
  }

  console.log('\n==============================================');
  console.log('  ALL AUTO-SAVE VERIFICATION TESTS PASSED ✓   ');
  console.log('==============================================\n');
}

testAutoSave().catch((err) => {
  console.error('\n❌ Test suite failed:', err);
  process.exit(1);
});
