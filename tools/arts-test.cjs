/* 全部术数模块冒烟测试：node tools/arts-test.cjs [只测某id]
   对每个已注册术数：用多种样例输入跑 cast + view，确保不抛错。 */
global.window = global;
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const coreDir = path.join(root, 'js', 'core');
const artsDir = path.join(root, 'js', 'arts');

/* 极简 DOM 桩（mount 不调用；仅防某些模块在加载期误用 document） */
global.document = global.document || {
  querySelector: () => null, querySelectorAll: () => [], createElement: () => ({ getContext: () => null, style: {}, appendChild() { } }),
  addEventListener() { }, getElementById: () => null
};
global.navigator = global.navigator || { clipboard: { writeText: () => Promise.resolve() } };
global.window.matchMedia = () => ({ matches: false });

['rng', 'data', 'ganzhi', 'tables', 'ui', 'registry'].forEach(f => require(path.join(coreDir, f + '.js')));

const files = fs.readdirSync(artsDir).filter(f => f.endsWith('.js')).sort();
for (const f of files) {
  try { require(path.join(artsDir, f)); }
  catch (e) { console.log(`✗ 加载失败 ${f}: ${e.message}`); }
}
console.log(`已加载模块 ${files.length} 个，注册术数 ${window.ART_REGISTRY.length} 门\n`);

const only = process.argv[2];
const DTS = [
  '2024-05-01T13:00', '2024-02-04T16:30', '2024-12-22T00:30',
  '2024-06-21T23:30', '2023-01-01T00:10', '2025-08-15T09:20'
];
function sampleFor(f, dt) {
  if (f.type === 'datetime-local') return dt;
  if (f.type === 'date') return dt.slice(0, 10);
  if (f.value !== undefined && f.value !== '') return f.value;
  /* 标为「可选」的字段保持留空，避免误判：真实用户不填亦应可起课 */
  if (/可选/.test(f.label || '') || /Strokes|optional/i.test(f.name || '')) return '';
  if (f.type === 'number') return (f.min !== undefined ? Number(f.min) : 1) + 7;
  if (f.type === 'select') {
    const o = (f.options || [])[0];
    return o === undefined ? '' : (typeof o === 'object' ? o.v : o);
  }
  if (f.type === 'chips') {
    const o = (f.options || [])[0];
    return o === undefined ? '' : (typeof o === 'object' ? o.v : o);
  }
  if (f.name === 'word' || f.name === 'zi' || f.name === 'ch') return '明';
  return '测试问事';
}

let bad = 0, warned = 0, checked = 0;
const report = [];
for (const art of window.ART_REGISTRY) {
  if (only && art.id !== only) continue;
  let artFails = [], artWarns = [];
  for (let k = 0; k < (art.form && art.form.length ? DTS.length : 1); k++) {
    const dt = DTS[k];
    const input = {};
    (art.form || []).forEach(f => { input[f.name] = sampleFor(f, dt); });
    let data;
    try { data = art.cast(input, { UI: window.CORE.UI, CORE: window.CORE, RNG: window.CORE.RNG, GZ: window.CORE.GZ }); }
    catch (e) { artFails.push(`cast 抛错（${dt}）：${e.message}`); continue; }
    if (data && data.error) { artWarns.push(`cast 返回 error（${dt}）：${data.error}`); continue; }
    let html;
    try { html = art.view(data, { UI: window.CORE.UI, CORE: window.CORE, RNG: window.CORE.RNG }); }
    catch (e) { artFails.push(`view 抛错（${dt}）：${e.message}`); continue; }
    if (typeof html !== 'string' || html.length < 30) { artFails.push(`view 输出过短（${dt}）：${typeof html === 'string' ? html.length : typeof html}`); continue; }
    if (/undefined|NaN|\[object Object\]/.test(html)) {
      const m = html.match(/.{0,40}(undefined|NaN|\[object Object\]).{0,40}/);
      artWarns.push(`输出含异常词（${dt}）：…${m[0]}…`);
    }
    checked++;
  }
  if (artFails.length) { bad++; report.push(`✗ ${art.id}（${art.name}）\n    ` + artFails.slice(0, 3).join('\n    ')); }
  else if (artWarns.length) { warned++; report.push(`△ ${art.id}（${art.name}）\n    ` + artWarns.slice(0, 2).join('\n    ')); }
  else report.push(`✓ ${art.id}（${art.name}）form:${(art.form || []).length} 通过`);
}
console.log(report.join('\n'));
console.log(`\n通过用例 ${checked} 个；失败 ${bad} 门，警告 ${warned} 门`);
process.exit(bad ? 1 : 0);
