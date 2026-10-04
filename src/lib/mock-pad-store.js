/**
 * Temporary in-memory mock store for verifying URL-based pad routing.
 * (Will be replaced with MongoDB integration in future phases).
 */

const mockPadStore = new Map();

// Seed initial mock pads for quick route verification
mockPadStore.set('/hello', {
  path: '/hello',
  content: 'Hello from MyPad!\n\nThis is a simple shared text pad at /hello.\nAnyone who visits this URL can view and edit this workspace.',
  updatedAt: new Date().toISOString(),
});

mockPadStore.set('/project/backend', {
  path: '/project/backend',
  content: '# Project Backend\n\n- API specification defined at /project/backend/api\n- Database connection pending configuration\n- Shared live notes for backend team',
  updatedAt: new Date().toISOString(),
});

export function getMockPad(canonicalPath) {
  if (mockPadStore.has(canonicalPath)) {
    return mockPadStore.get(canonicalPath);
  }

  // Default empty pad template for newly accessed paths
  return {
    path: canonicalPath,
    content: '',
    updatedAt: new Date().toISOString(),
    isNew: true,
  };
}

export function saveMockPad(canonicalPath, content) {
  const pad = {
    path: canonicalPath,
    content,
    updatedAt: new Date().toISOString(),
    isNew: false,
  };
  mockPadStore.set(canonicalPath, pad);
  return pad;
}
