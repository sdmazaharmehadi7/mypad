import { promises as fs } from 'fs';
import path from 'path';

console.log('==============================================');
console.log('   MYPAD SIDEBAR TOGGLE VERIFICATION TEST     ');
console.log('==============================================\n');

async function verifyToggleFunctionality() {
  const rootDir = process.cwd();

  // 1. Verify initial state in PadEditor.js
  const padEditorPath = path.join(rootDir, 'src', 'components', 'PadEditor.js');
  const padEditorContent = await fs.readFile(padEditorPath, 'utf-8');

  if (padEditorContent.includes('const [isSidebarOpen, setIsSidebarOpen] = useState(false);')) {
    console.log('✓ PadEditor initializes isSidebarOpen to false (closed by default).');
  } else {
    throw new Error('PadEditor does not initialize isSidebarOpen to false.');
  }

  if (padEditorContent.includes('setIsSidebarOpen((prev) => !prev);')) {
    console.log('✓ PadEditor implements handleToggleSidebar toggling boolean state.');
  } else {
    throw new Error('handleToggleSidebar toggle implementation missing.');
  }

  // 2. Verify PadHeader toggle button
  const padHeaderPath = path.join(rootDir, 'src', 'components', 'PadHeader.js');
  const padHeaderContent = await fs.readFile(padHeaderPath, 'utf-8');

  if (padHeaderContent.includes('onClick={onToggleSidebar}') && padHeaderContent.includes('aria-expanded={isSidebarOpen}')) {
    console.log('✓ PadHeader binds onToggleSidebar and reflects aria-expanded state.');
  } else {
    throw new Error('PadHeader toggle button missing or aria-expanded not bound.');
  }

  // 3. Verify PadSidebar collapse/expand styling
  const padSidebarPath = path.join(rootDir, 'src', 'components', 'PadSidebar.js');
  const padSidebarContent = await fs.readFile(padSidebarPath, 'utf-8');

  if (padSidebarContent.includes("w-0 -translate-x-full md:translate-x-0 opacity-0 border-r-0 pointer-events-none invisible") &&
      padSidebarContent.includes("w-64 translate-x-0 opacity-100 border-r pointer-events-auto visible")) {
    console.log('✓ PadSidebar supports 0-width collapse when closed and full 64-width when opened.');
  } else {
    throw new Error('PadSidebar collapse styles not configured as expected.');
  }

  // 4. Verify Server Component Prerender in PadCatchAllPage
  const pageRes = await fetch('http://localhost:3000/notes');
  const pageHtml = await pageRes.text();

  if (pageHtml.includes('aria-expanded="false"')) {
    console.log('✓ Pad page initially renders with toggle button aria-expanded="false" (closed).');
  } else {
    throw new Error('Pad page did not render with aria-expanded="false".');
  }

  if (pageHtml.includes('aria-hidden="true"') && pageHtml.includes('pointer-events-none')) {
    console.log('✓ Pad sidebar initially renders collapsed and non-interfering.');
  } else {
    throw new Error('Pad sidebar not initially collapsed in rendered HTML.');
  }

  console.log('\n==============================================');
  console.log('  ALL SIDEBAR TOGGLE TESTS PASSED ✓           ');
  console.log('==============================================\n');
}

verifyToggleFunctionality().catch((err) => {
  console.error('\n❌ Toggle Test Failed:', err.message);
  process.exit(1);
});
