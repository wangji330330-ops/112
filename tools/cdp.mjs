/* 通过 Edge DevTools Protocol 检查真实页面状态并截图
   用法: node tools/cdp.mjs <url> <out.png|-> "<js表达式>" [waitMs] */
import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const [url, out, expr, waitArg, sizeArg] = process.argv.slice(2);
const waitMs = Number(waitArg || 1500);
const size = sizeArg || '1440,900';
const PORT = 9300 + Math.floor(Math.random() * 400);
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const child = spawn(EDGE, [
  '--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run',
  '--no-default-browser-check', '--disable-extensions', '--force-device-scale-factor=1',
  '--window-size=' + size, '--allow-file-access-from-files',
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${process.env.TEMP}\\edgecdp_${PORT}`, url
], { stdio: 'ignore' });

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function target() {
  for (let i = 0; i < 70; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
      const p = list.find(t => t.type === 'page' && t.webSocketDebuggerUrl);
      if (p) return p;
    } catch (e) { /* 尚未启动 */ }
    await sleep(300);
  }
  throw new Error('未找到调试目标');
}

function mkSend(ws) {
  let id = 0; const pending = new Map();
  ws.addEventListener('message', ev => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); return; }
    if (m.method === 'Runtime.exceptionThrown') {
      const d = m.params.exceptionDetails;
      console.log('!! 页面异常:', d.text, d.exception && d.exception.description ? String(d.exception.description).split('\n')[0] : '');
    }
    if (m.method === 'Runtime.consoleAPICalled' && ['error', 'warning'].includes(m.params.type)) {
      console.log(`!! console.${m.params.type}:`, m.params.args.map(a => a.value !== undefined ? a.value : (a.description || a.type)).join(' ').slice(0, 300));
    }
    if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error') {
      console.log('!! log:', m.params.entry.text.slice(0, 300));
    }
  });
  return (method, params = {}) => new Promise((res, rej) => {
    const myId = ++id;
    pending.set(myId, m => m.error ? rej(new Error(JSON.stringify(m.error))) : res(m.result));
    ws.send(JSON.stringify({ id: myId, method, params }));
  });
}

try {
  const t = await target();
  const ws = new WebSocket(t.webSocketDebuggerUrl);
  await new Promise(r => ws.addEventListener('open', r));
  const send = mkSend(ws);
  await send('Runtime.enable');
  await send('Page.enable');
  await send('Log.enable');
  await sleep(waitMs);
  if (expr && expr !== '-') {
    const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) console.log('EVAL 异常:', JSON.stringify(r.exceptionDetails).slice(0, 600));
    else console.log('EVAL:', typeof r.result.value === 'object' ? JSON.stringify(r.result.value, null, 1) : String(r.result.value).slice(0, 3000));
  }
  if (out && out !== '-') {
    await sleep(350);
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    writeFileSync(out, Buffer.from(shot.data, 'base64'));
    console.log('SHOT:', out);
  }
  ws.close();
} catch (e) {
  console.log('FAILED:', e.message);
  process.exitCode = 1;
} finally {
  child.kill();
  await sleep(200);
  process.exit(process.exitCode || 0);
}
