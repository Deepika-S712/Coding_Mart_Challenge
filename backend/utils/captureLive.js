const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\deepi\\.gemini\\antigravity\\brain\\35f910e2-cdc7-4c89-97e8-06d84d7807e4';

async function getAdminToken() {
  const payload = JSON.stringify({ email: 'admin@college.edu', password: 'AdminPassword123!' });
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/admin/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const json = JSON.parse(data);
        resolve(json);
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function run() {
  console.log('1. Authenticating Admin via live API...');
  const auth = await getAdminToken();
  if (!auth.token) {
    throw new Error('Failed to get admin token: ' + JSON.stringify(auth));
  }
  const token = auth.token;
  const user = auth.user;
  console.log('✓ Token obtained for', user.email);

  console.log('2. Launching headless Microsoft Edge on remote debugging port 9222...');
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const edge = spawn(edgePath, [
    '--headless',
    '--remote-debugging-port=9222',
    '--no-sandbox',
    '--disable-gpu',
    '--window-size=1280,840',
    'about:blank',
  ]);

  await sleep(1500);

  // Get debug targets
  const versionInfo = await new Promise((resolve, reject) => {
    http.get('http://localhost:9222/json/list', (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve(JSON.parse(d)));
    }).on('error', reject);
  });

  const target = versionInfo[0];
  const wsUrl = target.webSocketDebuggerUrl;
  console.log('3. Connecting to DevTools WebSocket:', wsUrl);

  const ws = new WebSocket(wsUrl);
  await new Promise((res) => ws.onopen = res);

  let idCounter = 1;
  const pending = new Map();

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      const cb = pending.get(msg.id);
      pending.delete(msg.id);
      cb(msg);
    }
  };

  function sendCommand(method, params = {}) {
    return new Promise((resolve) => {
      const id = idCounter++;
      pending.set(id, resolve);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await sendCommand('Page.enable');
  await sendCommand('Runtime.enable');

  // Go to login to initialize origin localStorage
  await sendCommand('Page.navigate', { url: 'http://localhost:5173/login' });
  await sleep(1500);

  // Inject token and user into localStorage
  const setStorageScript = `
    localStorage.setItem('token', ${JSON.stringify(token)});
    localStorage.setItem('user', ${JSON.stringify(JSON.stringify(user))});
  `;
  await sendCommand('Runtime.evaluate', { expression: setStorageScript });

  const pagesToCapture = [
    { name: 'dashboard.png', url: 'http://localhost:5173/admin/dashboard', wait: 2000 },
    { name: 'students.png', url: 'http://localhost:5173/admin/students', wait: 1500 },
    { name: 'faculty.png', url: 'http://localhost:5173/admin/faculty', wait: 1500 },
    { name: 'departments.png', url: 'http://localhost:5173/admin/departments', wait: 1500 },
    { name: 'timetable.png', url: 'http://localhost:5173/admin/timetable', wait: 1500 },
    { name: 'reports.png', url: 'http://localhost:5173/admin/reports', wait: 2000 },
  ];

  for (const p of pagesToCapture) {
    console.log(`Navigating to ${p.url}...`);
    await sendCommand('Page.navigate', { url: p.url });
    await sleep(p.wait);

    const shot = await sendCommand('Page.captureScreenshot', { format: 'png' });
    if (shot.result && shot.result.data) {
      const buffer = Buffer.from(shot.result.data, 'base64');
      const outPath = path.join(ARTIFACT_DIR, p.name);
      fs.writeFileSync(outPath, buffer);
      console.log(`✓ Saved screenshot: ${p.name} (${buffer.length} bytes)`);
    } else {
      console.error(`Failed to capture ${p.name}:`, shot);
    }
  }

  ws.close();
  edge.kill();
  console.log('✓ All live screenshots captured and Edge process closed.');
  process.exit(0);
}

run().catch((e) => {
  console.error('Capture script error:', e);
  process.exit(1);
});
