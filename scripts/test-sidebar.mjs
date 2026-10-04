/**
 * Verification test script for MyPad nested-pad sidebar tree logic and API.
 */

const BASE_URL = 'http://localhost:3000';

async function testSidebar() {
  console.log('==============================================');
  console.log('     MYPAD NESTED-PAD SIDEBAR TEST SUITE      ');
  console.log('==============================================\n');

  // Seed test hierarchy
  const testTree = [
    { path: '/project', content: 'Root project pad' },
    { path: '/project/frontend', content: 'Frontend notes' },
    { path: '/project/backend', content: 'Backend notes' },
    { path: '/project/notes', content: 'General project notes' },
    { path: '/project/frontend/ui', content: 'UI child notes' },
    { path: '/a/b/c/d', content: '4-level nested leaf' },
    { path: '/21/08 codigo persistencia', content: 'Encoded spaces test' },
    { path: '/unrelated/data', content: 'Unrelated pad' },
  ];

  console.log('1. Seeding test hierarchy...');
  for (const item of testTree) {
    const res = await fetch(`${BASE_URL}/api/pads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    if (!res.ok) throw new Error(`Failed to seed ${item.path}`);
  }
  console.log('✓ Successfully seeded test pads.');

  // Test 2: For /project, show frontend, backend, notes
  console.log('\n2. Testing /project navigation context...');
  const resProject = await fetch(`${BASE_URL}/api/pads/tree?path=${encodeURIComponent('/project')}`);
  const dataProject = await resProject.json();
  const childNames = dataProject.tree.children.map((c) => c.name);
  console.log('Children of /project:', childNames);

  if (
    childNames.includes('frontend') &&
    childNames.includes('backend') &&
    childNames.includes('notes')
  ) {
    console.log('✓ /project correctly returns child pads: frontend, backend, notes.');
  } else {
    throw new Error('Test 2 failed: Expected child pads [frontend, backend, notes].');
  }

  // Verify unrelated pads are NOT in /project children
  if (childNames.includes('unrelated') || childNames.includes('d')) {
    throw new Error('Scoped query failed: Unrelated pads leaked into /project.');
  }
  console.log('✓ Scoped query confirmed: unrelated pads excluded.');

  // Test 3: For /project/frontend, show siblings, child pads, and active location
  console.log('\n3. Testing /project/frontend navigation context...');
  const resFrontend = await fetch(`${BASE_URL}/api/pads/tree?path=${encodeURIComponent('/project/frontend')}`);
  const dataFrontend = await resFrontend.json();
  const tree = dataFrontend.tree;

  console.log('Parent path:', tree.parentPath);
  console.log('Siblings:', tree.siblings.map((s) => `${s.name} (active: ${s.isActive})`));
  console.log('Children of frontend:', tree.children.map((c) => c.name));

  if (tree.parentPath !== '/project') {
    throw new Error('Test 3 failed: Parent path should be /project.');
  }

  const activeSibling = tree.siblings.find((s) => s.name === 'frontend' && s.isActive);
  if (!activeSibling) {
    throw new Error('Test 3 failed: /project/frontend is not marked active among siblings.');
  }

  const hasBackendSibling = tree.siblings.some((s) => s.name === 'backend');
  const hasNotesSibling = tree.siblings.some((s) => s.name === 'notes');
  if (!hasBackendSibling || !hasNotesSibling) {
    throw new Error('Test 3 failed: Siblings [backend, notes] missing.');
  }

  const hasUiChild = tree.children.some((c) => c.name === 'ui');
  if (!hasUiChild) {
    throw new Error('Test 3 failed: Child pad "ui" missing from frontend children.');
  }
  console.log('✓ /project/frontend correctly shows parent, siblings, children, and active highlight.');

  // Test 4: Arbitrary nesting (/a/b/c/d)
  console.log('\n4. Testing arbitrary 4-level nesting (/a/b/c/d)...');
  const resDeep = await fetch(`${BASE_URL}/api/pads/tree?path=${encodeURIComponent('/a/b/c/d')}`);
  const dataDeep = await resDeep.json();
  const treeDeep = dataDeep.tree;

  console.log('Deep pad parent:', treeDeep.parentPath);
  console.log('Deep pad ancestors:', treeDeep.ancestors);
  if (treeDeep.parentPath === '/a/b/c' && treeDeep.ancestors.length === 3) {
    console.log('✓ 4-level nesting correctly parsed parent (/a/b/c) and full ancestor chain.');
  } else {
    throw new Error('Test 4 failed: Deep nesting context invalid.');
  }

  // Test 5: URL decoding for display names
  console.log('\n5. Testing URL decoding for display names...');
  const resEncoded = await fetch(`${BASE_URL}/api/pads/tree?path=${encodeURIComponent('/21/08%20codigo%20persistencia')}`);
  const dataEncoded = await resEncoded.json();
  const treeEncoded = dataEncoded.tree;

  console.log('Display name:', treeEncoded.currentName);
  console.log('Canonical path:', treeEncoded.currentPath);

  if (treeEncoded.currentName === '08 codigo persistencia') {
    console.log('✓ Display name correctly decoded to: "08 codigo persistencia".');
  } else {
    throw new Error(`Test 5 failed: Expected "08 codigo persistencia", got "${treeEncoded.currentName}".`);
  }

  // Test 6: Verify HTML rendering includes the sidebar
  console.log('\n6. Verifying server-rendered page includes sidebar navigation...');
  const pageRes = await fetch(`${BASE_URL}/project/frontend`);
  const pageHtml = await pageRes.text();
  if (pageHtml.includes('aria-label="Pad Navigation Sidebar"') && pageHtml.includes('backend') && pageHtml.includes('ui')) {
    console.log('✓ Server-rendered page successfully contains Pad Navigation Sidebar, siblings (backend), and children (ui).');
  } else {
    throw new Error('Test 6 failed: Sidebar not present in server-rendered HTML.');
  }

  console.log('\n==============================================');
  console.log('    ALL SIDEBAR VERIFICATION TESTS PASSED ✓   ');
  console.log('==============================================\n');
}

testSidebar().catch((err) => {
  console.error('\n❌ Test failed:', err);
  process.exit(1);
});
