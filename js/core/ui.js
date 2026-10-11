/* ============================================================
   UI 工具库 —— 所有术数模块共用。只返回 HTML 字符串，不碰 DOM。
   ============================================================ */
window.CORE = window.CORE || {};

(function (C) {
  'use strict';

  const U = {};

  /* ---------- 基础 ---------- */
  U.esc = function (s) {
    return String(s === undefined || s === null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  };
  U.attr = function (s) { return String(s || '').replace(/"/g, '&quot;'); };

  /* 五行着色文字 */
  U.wx = function (t, wx) {
    if (!wx) wx = C.ZHI_WX[C.ZHI.indexOf(String(t).charAt(0))];
    if (!wx) wx = C.GAN_WX[C.GAN.indexOf(String(t).charAt(0))];
    return wx ? `<span data-wx="${wx}">${U.esc(t)}</span>` : U.esc(t);
  };
  U.dot = function (wx) { return `<span class="wx-dot" style="background:${C.WX_COLOR[wx] || '#999'}"></span>`; };

  /* ---------- 结构块 ---------- */
  U.sec = function (title, html, cls) {
    return `<section class="sec${cls ? ' ' + cls : ''}"><h3>${title}</h3>${html}</section>`;
  };
  U.card = function (title, html, sub) {
    const h = title ? `<h4>${title}${sub ? `<span class="sub">${sub}</span>` : ''}</h4>` : '';
    return `<div class="card">${h}${html}</div>`;
  };
  U.note = function (html, warn) {
    return `<p class="note${warn ? ' warn' : ''}">${html}</p>`;
  };
  U.p = function (s) { return `<p>${s}</p>`; };
  U.ul = function (arr) { return `<ul>${arr.map(x => `<li>${x}</li>`).join('')}</ul>`; };

  U.kv = function (pairs, cls) {
    return `<dl class="kv ${cls || ''}">${pairs.map(p => `<dt>${p[0]}</dt><dd>${p[1]}</dd>`).join('')}</dl>`;
  };

  U.table = function (head, rows, opt) {
    opt = opt || {};
    const th = head ? `<thead><tr>${head.map((h, i) => `<th${opt.align && opt.align[i] === 'l' ? ' class="l"' : ''}>${h}</th>`).join('')}</tr></thead>` : '';
    const tb = `<tbody>${rows.map(r => `<tr${r.cls ? ` class="${r.cls}"` : ''}>${(r.cells || r).map((c, i) => `<td${(opt.align && opt.align[i] === 'l') || (r.left && r.left.indexOf(i) >= 0) ? ' class="l"' : ''}${r.mono && r.mono.indexOf(i) >= 0 ? ' class="mono"' : ''}>${c}</td>`).join('')}</tr>`).join('')}</tbody>`;
    return `<div class="pan-wrap"><table class="pan ${opt.cls || ''}">${th}${tb}</table></div>`;
  };

  /* 九宫格：cells 为 {1..9: {html, cls}} 或数组 9 项（洛书位置由 GONG_POS 决定） */
  U.grid9 = function (map, centerHtml) {
    let out = '<div class="gong9">';
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        let gong = null;
        for (const k in C.GONG_POS) if (C.GONG_POS[k][0] === row && C.GONG_POS[k][1] === col) gong = Number(k);
        const cell = map[gong];
        if (gong === 5 && centerHtml !== undefined) {
          out += `<div class="cell">${centerHtml}</div>`;
        } else if (cell) {
          out += `<div class="cell ${cell.cls || ''}">${cell.html || cell}</div>`;
        } else {
          out += `<div class="cell empty"></div>`;
        }
      }
    }
    return out + '</div>';
  };
  /* 九宫格的通用单元 */
  U.cell = function (lines) {
    return `<div class="gn">${lines.gong || ''}</div>` +
      (lines.main ? `<div class="gz">${lines.main}</div>` : '') +
      `<div class="gs">${lines.sub || ''}</div>`;
  };

  /* ---------- 爻线 ---------- */
  /* opts: {labels:[6], dong:[0-5], from:'top'|'bottom', shi, ying, marks:[6]} */
  U.yao = function (lines, opts) {
    opts = opts || {};
    const labels = opts.labels || [];
    const marks = opts.marks || [];
    const dong = opts.dong || [];
    const posNames = ['初', '二', '三', '四', '五', '上'];
    let out = '<div class="yao-set">';
    const order = opts.from === 'bottom' ? [0, 1, 2, 3, 4, 5] : [5, 4, 3, 2, 1, 0];
    order.forEach(i => {
      const v = lines[i];
      const isDong = dong.indexOf(i) >= 0;
      const bars = v
        ? '<span class="bar full"></span>'
        : '<span class="bar half"></span><span class="bar gap"></span><span class="bar half"></span>';
      const nm = labels[i] !== undefined ? labels[i] : (posNames[i] + '爻');
      const mk = [];
      if (opts.shi === i + 1) mk.push('世');
      if (opts.ying === i + 1) mk.push('应');
      if (isDong) mk.push('○动');
      if (marks[i]) mk.push(marks[i]);
      out += `<div class="yao${isDong ? ' dong' : ''}">` +
        `<span class="nm">${nm}</span>` +
        `<span class="bars">${bars}</span>` +
        `<span class="mark">${mk.join('')}</span></div>`;
    });
    return out + '</div>';
  };

  /* 一行并列显示两个卦（本卦 → 变卦） */
  U.twoHex = function (a, b, labelA, labelB) {
    return '<div class="grid2">' +
      `<div>${U.card(labelA || '本卦', U.hexBox(a))}</div>` +
      (b ? `<div>${U.card(labelB || '变卦', U.hexBox(b))}</div>` : '') +
      '</div>';
  };
  U.hexBox = function (hex, lines) {
    const l = lines || (hex && hex.lines) || [];
    return `<div class="center"><div class="big-hex" style="font-size:15px;letter-spacing:.3em">${hex ? U.esc(hex.upper.symbol + hex.lower.symbol) : ''}</div></div>` +
      U.yao(l, { labels: ['初', '二', '三', '四', '五', '上'] });
  };

  /* ---------- 表单 ---------- */
  U.opt = function (list, sel) {
    return list.map(o => {
      const v = typeof o === 'object' ? o.v : o;
      const t = typeof o === 'object' ? o.t : o;
      const s = String(sel) === String(v) ? ' selected' : '';
      return `<option value="${U.attr(v)}"${s}>${U.esc(t)}</option>`;
    }).join('');
  };
  /* f: {name,label,type,value,placeholder,hint,options,min,max,step,rows,required} */
  U.field = function (f) {
    const id = 'f_' + (f.name || Math.random().toString(36).slice(2));
    const hint = f.hint ? `<span class="hint">${f.hint}</span>` : '';
    let ctl;
    const v = f.value === undefined ? '' : f.value;
    if (f.type === 'select') {
      ctl = `<select id="${id}" name="${U.attr(f.name)}">${U.opt(f.options || [], v)}</select>`;
    } else if (f.type === 'textarea') {
      ctl = `<textarea id="${id}" name="${U.attr(f.name)}" rows="${f.rows || 3}" placeholder="${U.attr(f.placeholder || '')}">${U.esc(v)}</textarea>`;
    } else if (f.type === 'chips') {
      ctl = `<div class="chips" data-chips="${U.attr(f.name)}">` + (f.options || []).map(o => {
        const val = typeof o === 'object' ? o.v : o;
        const txt = typeof o === 'object' ? o.t : o;
        return `<button type="button" class="chip${String(v) === String(val) ? ' sel' : ''}" data-v="${U.attr(val)}">${U.esc(txt)}</button>`;
      }).join('') + `</div><input type="hidden" id="${id}" name="${U.attr(f.name)}" value="${U.attr(v)}">`;
    } else {
      const t = f.type || 'text';
      ctl = `<input id="${id}" type="${t}" name="${U.attr(f.name)}" value="${U.attr(v)}" placeholder="${U.attr(f.placeholder || '')}"` +
        (f.min !== undefined ? ` min="${f.min}"` : '') + (f.max !== undefined ? ` max="${f.max}"` : '') +
        (f.step !== undefined ? ` step="${f.step}"` : '') + `>`;
    }
    return `<div class="field"${f.wide ? ' style="flex:1 1 100%"' : ''}><label for="${id}">${f.label || ''}</label>${ctl}${hint}</div>`;
  };
  U.form = function (fields) {
    return '<div class="form-row">' + (fields || []).map(U.field).join('') + '</div>';
  };

  /* ---------- 小件 ---------- */
  U.chips = function (list) {
    return '<div class="chips">' + list.map(x =>
      `<span class="chip${x.sel ? ' sel' : ''}">${x.t}</span>`).join('') + '</div>';
  };
  U.bars = function (pairs, max) {
    const m = max || Math.max.apply(null, pairs.map(p => p[1]).concat([1]));
    return pairs.map(p => `<div class="bar-line"><span class="lab">${p[0]}</span>` +
      `<span class="track"><span class="fill" style="width:${Math.round(p[1] / m * 100)}%"></span></span>` +
      `<span class="val">${p[2] !== undefined ? p[2] : p[1]}</span></div>`).join('');
  };
  U.verse = function (lines) {
    return `<div class="verse">${lines.map(l => `<span class="l">${l}</span>`).join('')}</div>`;
  };
  U.poem = function (zh, py) {
    return `<div class="poem-box"><div class="poem-zh">${zh.split('\n').join('<br>')}</div>` +
      (py ? `<div class="poem-py">${py}</div>` : '') + '</div>';
  };
  U.resHead = function (big, sm) {
    return `<div class="res-head"><span class="big">${big}</span>${sm ? `<span class="sm">${sm}</span>` : ''}</div>`;
  };
  U.coins = function (vals) {
    /* vals: 数组，元素为 3(阳/背) 或 2(阴/字) */
    return '<div class="coins">' + vals.map(v =>
      `<span class="coin${v === 3 ? ' yang' : ''}">${v === 3 ? '<span class="zi">背</span>' : '<span class="hole"></span>'}</span>`).join('') + '</div>';
  };
  U.qian = function (sticks, pulled) {
    return '<div class="qian-tube">' + sticks.map((_, i) =>
      `<span class="qian-stick${pulled === i ? ' pulled' : ''}"></span>`).join('') + '</div>';
  };
  U.jiaobei = function (list) {
    /* list: [{flat:bool, label:'圣筊'}] */
    return '<div class="jiaobei">' + list.map(b =>
      `<span class="bei${b.flat ? ' flat' : ''}">${U.esc(b.label || '')}</span>`).join('') + '</div>';
  };

  /* ---------- 输入读取（app 用） ---------- */
  U.readForm = function (root, defs) {
    const out = {};
    (defs || []).forEach(f => {
      const el = root.querySelector(`[name="${f.name}"]`);
      let v = el ? el.value : '';
      if (f.type === 'number') v = v === '' ? '' : Number(v);
      if (f.trim !== false && typeof v === 'string') v = v.trim();
      out[f.name] = v;
    });
    return out;
  };

  /* ---------- 时间 ---------- */
  U.nowStr = function () {
    const d = new Date();
    const p = n => (n < 10 ? '0' : '') + n;
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
  };
  U.dateStr = function (offDays) {
    const d = new Date(Date.now() + (offDays || 0) * 86400000);
    const p = n => (n < 10 ? '0' : '') + n;
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  };
  U.parseDT = function (s) {
    if (!s) return new Date();
    const m = String(s).match(/(\d{4})-(\d{1,2})-(\d{1,2})(?:[T ](\d{1,2}):(\d{1,2}))?/);
    if (!m) return new Date();
    return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), Number(m[4] || 0), Number(m[5] || 0));
  };
  /* 农历→公历近似不可靠，故凡需农历之页一律请用户直选农历 */
  U.lunarMonths = function () {
    const a = [];
    for (let i = 1; i <= 12; i++) a.push({ v: String(i), t: '正月二月三月四月五月六月七月八月九月十月冬月腊月'.substr((i - 1) * 2, 2) });
    return a;
  };
  U.lunarDays = function () {
    const a = [];
    const n = ['初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
      '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
      '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'];
    n.forEach((t, i) => a.push({ v: String(i + 1), t }));
    return a;
  };

  /* ---------- 结果卡片通用尾注 ---------- */
  U.disclaim = function (extra) {
    return U.note('术数为传统文化之数术模型，排盘力求合于古法，断语为参考白话，' +
      '仅供文化体验与自省，不构成医疗、财务、法律、婚恋等任何决策依据。' + (extra || ''), true);
  };

  C.UI = U;
})(window.CORE);
