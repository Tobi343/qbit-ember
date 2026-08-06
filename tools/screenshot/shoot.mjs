// Screenshots via CDP — no Puppeteer needed, Node ships a WebSocket client.
import { spawn } from 'node:child_process';
import { writeFile, mkdir, rm } from 'node:fs/promises';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE = 'http://localhost:8091';
const OUT = process.argv[2];
const PORT = 9333;

// Fresh profile every run — the app ships a service worker, and a reused
// profile would serve a stale cached build into the screenshots.
const PROFILE = '/tmp/qbit-shot-profile';
await rm(PROFILE, { recursive: true, force: true });

const chrome = spawn(CHROME, [
  `--remote-debugging-port=${PORT}`, '--headless=new', '--hide-scrollbars',
  '--no-first-run', `--user-data-dir=${PROFILE}`, 'about:blank',
], { stdio: 'ignore' });

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function targetUrl() {
  for (let i = 0; i < 40; i++) {
    try {
      const r = await fetch(`http://localhost:${PORT}/json/list`);
      const pages = (await r.json()).filter(p => p.type === 'page');
      if (pages[0]?.webSocketDebuggerUrl) return pages[0].webSocketDebuggerUrl;
    } catch { /* not ready yet */ }
    await sleep(250);
  }
  throw new Error('Chrome DevTools not reachable');
}

const ws = new WebSocket(await targetUrl());
await new Promise(r => ws.addEventListener('open', r, { once: true }));

let id = 0;
const pending = new Map();
ws.addEventListener('message', e => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id); }
});
const send = (method, params = {}) => new Promise(res => {
  const n = ++id;
  pending.set(n, res);
  ws.send(JSON.stringify({ id: n, method, params }));
});

const evaluate = async expr => (await send('Runtime.evaluate', {
  expression: expr, awaitPromise: true, returnByValue: true,
})).result?.value;

await send('Page.enable');
await send('Runtime.enable');
// force dark theme before the app boots
await send('Page.addScriptToEvaluateOnNewDocument', {
  source: "localStorage.setItem('theme','dark');",
});

async function shot(name, { w, h, action }) {
  await send('Emulation.setDeviceMetricsOverride', {
    width: w, height: h, deviceScaleFactor: 2, mobile: w < 900,
  });
  await send('Page.navigate', { url: BASE });
  for (let i = 0; i < 40; i++) {
    if (await evaluate("!!document.querySelector('.row, .trow')")) break;
    await sleep(200);
  }
  await sleep(700);                       // let rings/bars finish animating
  if (action) { await evaluate(action); await sleep(900); }
  const { data } = await send('Page.captureScreenshot', { format: 'png' });
  await writeFile(`${OUT}/${name}.png`, Buffer.from(data, 'base64'));
  console.log(`${name}.png`);
}

await mkdir(OUT, { recursive: true });

await shot('mobile-list', { w: 390, h: 844 });
await shot('mobile-detail', { w: 390, h: 844, action: `(() => {
  const row = document.querySelector('.row');
  const o = {bubbles:true, pointerId:1, clientX:200, clientY:400};
  row.dispatchEvent(new PointerEvent('pointerdown', o));
  row.dispatchEvent(new PointerEvent('pointerup', o));
})()` });
await shot('mobile-add', { w: 390, h: 844, action: `(async () => {
  document.querySelector('.circle--add').click();
  await new Promise(r => setTimeout(r, 500));
  const inp = document.querySelector('.magnet-input');
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set
    .call(inp, 'magnet:?xt=urn:btih:88594aaacbde40ef3e2510c47374ec0aa396c08e');
  inp.dispatchEvent(new Event('input', {bubbles: true}));
  document.querySelectorAll('.setting-row')[1]?.click();
})()` });
await shot('mobile-settings', { w: 390, h: 844, action:
  "document.querySelector('.circle--gear').click()" });
await shot('desktop', { w: 1520, h: 860 });

ws.close();
chrome.kill();
