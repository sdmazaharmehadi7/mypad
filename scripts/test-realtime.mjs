import { io } from 'socket.io-client';

const BASE_URL = process.env.TEST_URL || 'http://localhost:3002';
const SOCKET_PATH = '/api/socket.io';

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runRealtimeTests() {
  console.log(`\n======================================================`);
  console.log(`Starting MyPad Real-time Collaboration Verification`);
  console.log(`Target: ${BASE_URL}`);
  console.log(`======================================================\n`);

  // Step 0: Warm up / initialize the Next.js socket server endpoint
  console.log('Step 0: Initializing Socket.IO via GET /api/socket...');
  const initRes = await fetch(`${BASE_URL}/api/socket`);
  if (!initRes.ok) {
    throw new Error(`Failed to initialize socket endpoint: ${initRes.status}`);
  }
  const initData = await initRes.json();
  console.log('Endpoint ready:', initData);

  // Helper to create connected socket
  function createClient(name) {
    return io(BASE_URL, {
      path: SOCKET_PATH,
      transports: ['websocket', 'polling'],
      forceNew: true,
      reconnection: false,
    });
  }

  // 1. Connect Client A & Client B
  console.log('\n--- Test 1 & 2: Client A and Client B connection ---');
  const clientA = createClient('Client-A');
  const clientB = createClient('Client-B');

  await Promise.all([
    new Promise((resolve) => clientA.on('connect', resolve)),
    new Promise((resolve) => clientB.on('connect', resolve)),
  ]);
  console.log('✓ Client A connected (id:', clientA.id, ')');
  console.log('✓ Client B connected (id:', clientB.id, ')');

  // 2. Both join /college/ml
  console.log('\n--- Test 3: Joining room "college/ml" and tracking presence ---');
  let presenceA = 0;
  let presenceB = 0;

  clientA.on('presence:update', (data) => {
    presenceA = data.count;
  });
  clientB.on('presence:update', (data) => {
    presenceB = data.count;
  });

  clientA.emit('pad:join', { path: '/college/ml', clientId: 'client-a-id' });
  await wait(200);

  clientB.emit('pad:join', { path: 'college/ml', clientId: 'client-b-id' });
  await wait(300);

  console.log(`Presence reported - Client A: ${presenceA}, Client B: ${presenceB}`);
  if (presenceA !== 2 || presenceB !== 2) {
    throw new Error(`Expected presence of 2 in college/ml, got A=${presenceA}, B=${presenceB}`);
  }
  console.log('✓ Both joined "college/ml" with verified presence of 2');

  // 3. Client A types -> Client B receives
  console.log('\n--- Test 4 & 5: Client A edits -> Client B receives real-time update ---');
  let bReceived = null;
  let aReceivedSelf = false;

  clientA.on('pad:update', () => {
    aReceivedSelf = true;
  });
  clientB.on('pad:update', (data) => {
    bReceived = data;
  });

  clientA.emit('pad:update', {
    type: 'pad:update',
    path: '/college/ml',
    content: 'Machine Learning Notes: Introduction to Neural Networks',
    clientId: 'client-a-id',
    timestamp: Date.now(),
  });

  await wait(300);

  if (!bReceived) {
    throw new Error('Client B did not receive update from Client A');
  }
  if (bReceived.content !== 'Machine Learning Notes: Introduction to Neural Networks') {
    throw new Error(`Client B received unexpected content: ${bReceived.content}`);
  }
  if (aReceivedSelf) {
    throw new Error('Client A received an echo loop of its own message!');
  }
  console.log('✓ Client B received exact content without refresh');
  console.log('✓ Loop prevention verified: Client A did not receive echo');

  // 4. Client B types -> Client A receives
  console.log('\n--- Test 6 & 7: Client B edits -> Client A receives real-time update ---');
  let aReceived = null;
  clientA.on('pad:update', (data) => {
    aReceived = data;
  });

  clientB.emit('pad:update', {
    type: 'pad:update',
    path: 'college/ml',
    content: 'Machine Learning Notes: Introduction to Neural Networks & Backprop',
    clientId: 'client-b-id',
    timestamp: Date.now(),
  });

  await wait(300);

  if (!aReceived) {
    throw new Error('Client A did not receive update from Client B');
  }
  if (aReceived.content !== 'Machine Learning Notes: Introduction to Neural Networks & Backprop') {
    throw new Error(`Client A received unexpected content: ${aReceived.content}`);
  }
  console.log('✓ Client A received exact content from Client B in real time');

  // 5. Room Isolation Test
  console.log('\n--- Test 8: Room isolation (/college/ml vs /project/backend vs /project/frontend) ---');
  const clientC = createClient('Client-C'); // in project/backend
  const clientD = createClient('Client-D'); // in project/frontend

  await Promise.all([
    new Promise((resolve) => clientC.on('connect', resolve)),
    new Promise((resolve) => clientD.on('connect', resolve)),
  ]);

  let crossLeakA = null;
  let crossLeakB = null;
  let crossLeakC = null;
  let dReceived = null;

  clientA.on('pad:update', (d) => { if (d.path !== '/college/ml') crossLeakA = d; });
  clientB.on('pad:update', (d) => { if (d.path !== '/college/ml') crossLeakB = d; });
  clientC.on('pad:update', (d) => { if (d.path !== '/project/backend') crossLeakC = d; });
  clientD.on('pad:update', (d) => { dReceived = d; });

  clientC.emit('pad:join', { path: '/project/backend', clientId: 'client-c-id' });
  clientD.emit('pad:join', { path: '/project/frontend', clientId: 'client-d-id' });
  await wait(300);

  // Send update in project/frontend
  clientD.emit('pad:update', {
    type: 'pad:update',
    path: '/project/frontend',
    content: 'Frontend Architecture React 19',
    clientId: 'client-d-id',
    timestamp: Date.now(),
  });

  await wait(300);

  if (crossLeakA || crossLeakB || crossLeakC) {
    throw new Error('Security breach: cross-room message leak detected!');
  }
  console.log('✓ Room isolation verified: /college/ml and /project/backend received 0 updates from /project/frontend');

  // 6. Test Disconnect & Presence tracking
  console.log('\n--- Test 9: Disconnect lifecycle and presence update ---');
  clientB.disconnect();
  await wait(400);

  console.log(`Presence after Client B disconnect - Client A: ${presenceA}`);
  if (presenceA !== 1) {
    throw new Error(`Expected presence of 1 after Client B disconnect, got ${presenceA}`);
  }
  console.log('✓ Presence updated accurately when peer disconnected');

  // 7. Test Persistence interaction with MongoDB
  console.log('\n--- Test 10: Persistence interaction (MongoDB source of truth) ---');
  const saveRes = await fetch(`${BASE_URL}/api/pads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      path: '/college/ml',
      content: 'Machine Learning Notes: Introduction to Neural Networks & Backprop [Persisted]',
    }),
  });
  if (!saveRes.ok) {
    throw new Error(`Save failed: ${saveRes.status}`);
  }
  const saveData = await saveRes.json();
  console.log('Saved to MongoDB:', saveData.pad?.path);

  // Fetch from database
  const getRes = await fetch(`${BASE_URL}/api/pads?path=%2Fcollege%2Fml`);
  const getData = await getRes.json();
  if (getData.pad?.content !== 'Machine Learning Notes: Introduction to Neural Networks & Backprop [Persisted]') {
    throw new Error('Loaded content from MongoDB does not match saved content!');
  }
  console.log('✓ Verified: MongoDB remains the persistent source of truth on page refresh/load');

  // Cleanup
  clientA.disconnect();
  clientC.disconnect();
  clientD.disconnect();

  console.log('\n======================================================');
  console.log('ALL REAL-TIME COLLABORATION TESTS PASSED SUCCESSFULLY!');
  console.log('======================================================\n');
}

runRealtimeTests().catch((err) => {
  console.error('\n❌ TEST FAILED:', err.message);
  process.exit(1);
});
