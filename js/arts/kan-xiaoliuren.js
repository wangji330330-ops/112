/* 小六壬 —— 掐指六宫：大安 留连 速喜 赤口 小吉 空亡 */
(function () {
  'use strict';
  const C = window.CORE, U = C.UI, G = C.GZ;
  const PALACES = C.XIAOLIU;

  /* 掌诀六宫在指节上的传统位置（食指/中指/无名指 × 上节/下节） */
  const PALM = [
    { idx: 1, col: 1, row: 1 }, { idx: 2, col: 2, row: 1 }, { idx: 3, col: 3, row: 1 },
    { idx: 0, col: 1, row: 2 }, { idx: 5, col: 2, row: 2 }, { idx: 4, col: 3, row: 2 }
  ];

  /* 数 n 自某宫起（起宫算一），落宫 */
  function count(start, n) { return ((start + (n - 1)) % 6 + 6) % 6; }

  ART({
    id: 'xiaoliuren', name: '小六壬', alias: ['掐指一算', '六宫掌诀', '李淳风六壬时课'],
    gua: 'kan', order: 2,
    tagline: '掐指六宫 · 大安留连速喜赤口小吉空亡，以月日时三数定吉凶',

    intro: `
      <p>小六壬又称"掐指一算""六宫掌诀"，相传托名唐代李淳风之《六壬时课》，实为民间流传最广的
      简易占法。它不排盘、不起课，只以左手食指、中指、无名指的六个指节为六宫，依次为
      <em>大安、留连、速喜、赤口、小吉、空亡</em>，以月、日、时三数顺数，落宫即断。</p>
      <p>六宫各配五行与六神：大安属木曰青龙，留连属水曰玄武，速喜属火曰朱雀，赤口属金曰白虎，
      小吉属木曰六合，空亡属土曰勾陈。以五行论则木火为吉、金土多凶；以六神论则青龙六合主和合喜庆，
      白虎朱雀主口舌，玄武勾陈主暗昧迟滞。</p>
      <p>其法虽简，却是"以数起课"的典型：月建为天盘、日辰为地盘、时辰为人盘，三盘相叠，
      看其落宫与三宫之间的生克聚散，便是一事的始终迟速。因其简便，至今仍在民间流行；
      也正因简便，断语须与所问之事相参，不可执一。</p>`,

    method: `
      <p>两种起课方式，任选其一：</p>
      <ul>
        <li><em>三数起课</em>：心中默念所问之事，随口报三个数（或取所见之数、页码、车牌尾数等），
        自大安起数第一数，落宫后再自该宫起数第二数，再数第三数，末宫即断。</li>
        <li><em>月日时起课</em>：以农历月、日、时辰三数，自大安起正月，顺数至月；
        自月宫起初一，顺数至日；自日宫起子时，顺数至时辰，末宫即断。此为古法。</li>
      </ul>
      <p>得宫之后，以<em>时宫为主断</em>，月宫为事之始、日宫为事之中，三宫合看更细。</p>`,

    form: [
      {
        name: 'way', label: '起课方式', type: 'chips', value: 'num',
        options: [{ v: 'num', t: '三数起课' }, { v: 'lunar', t: '月日时起课' }]
      },
      { name: 'n1', label: '第一数', type: 'number', min: 1, max: 999, value: '' , placeholder: '随口报数', hint: '留空则随机' },
      { name: 'n2', label: '第二数', type: 'number', min: 1, max: 999, value: '', placeholder: '随口报数', hint: '留空则随机' },
      { name: 'n3', label: '第三数', type: 'number', min: 1, max: 999, value: '', placeholder: '随口报数', hint: '留空则随机' },
      { name: 'lmonth', label: '农历月', type: 'select', options: U.lunarMonths(), value: '1' },
      { name: 'lday', label: '农历日', type: 'select', options: U.lunarDays(), value: '1' },
      { name: 'lhour', label: '时辰', type: 'select', options: C.HOURS.map(h => ({ v: String(h.idx), t: h.zhi + '时 ' + h.range })), value: '0' }
    ],

    cast(input) {
      const way = input.way || 'num';
      let a, b, c, usedNums = null, note = '';
      if (way === 'num') {
        const nums = [input.n1, input.n2, input.n3].map(v => {
          const n = parseInt(v, 10);
          return (isNaN(n) || n < 1) ? C.RNG.randInt(1, 99) : n;
        });
        usedNums = nums;
        a = count(0, nums[0]);
        b = count(a, nums[1]);
        c = count(b, nums[2]);
        note = '三数：' + nums.join(' · ');
      } else {
        const m = Math.max(1, parseInt(input.lmonth, 10) || 1);
        const d = Math.max(1, parseInt(input.lday, 10) || 1);
        const h = Math.max(0, parseInt(input.lhour, 10) || 0);
        a = count(0, m);
        b = count(a, d);
        c = count(b, h + 1);
        note = `农历 ${m}月${d}日 ${C.HOURS[h].zhi}时`;
      }
      /* 三宫吉凶计数 */
      const luckScore = { 吉: 1, 凶: -1, 大凶: -2 }[PALACES[c].luck] || 0;
      const trio = [a, b, c].map(i => PALACES[i].name);
      return {
        way, note, a, b, c, trio, luckScore,
        palaces: PALACES.map((p, i) => Object.assign({ i, hit: i === c, m: i === a, d: i === b }, p)),
        usedNums
      };
    },

    view(d) {
      const P = PALACES[d.c];
      const luckCls = P.luck === '大凶' ? 'bad' : (P.luck === '凶' ? 'warn' : 'good');
      /* 掌诀图 */
      let palm = '<div class="gong9" style="grid-template-columns:repeat(3,1fr)">';
      for (let row = 1; row <= 2; row++) {
        for (let col = 1; col <= 3; col++) {
          const cell = PALM.find(p => p.row === row && p.col === col);
          const p = PALACES[cell.idx];
          const marks = [];
          if (cell.idx === d.a) marks.push('月');
          if (cell.idx === d.b) marks.push('日');
          if (cell.idx === d.c) marks.push('时');
          palm += `<div class="cell" style="${cell.idx === d.c ? 'border-color:rgba(168,50,45,.55);background:rgba(168,50,45,.07)' : ''}">` +
            `<div class="gn">${['食指', '中指', '无名指'][col - 1]}${row === 1 ? '上节' : '下节'}</div>` +
            `<div class="gz" style="color:${PALACES[cell.idx].luck === '吉' ? '#3d6b45' : '#a8322d'}">${p.name}</div>` +
            `<div class="gs">${U.wx(p.wx)} · ${p.body}${marks.length ? ' <b>' + marks.join('/') + '</b>' : ''}</div>` +
            `</div>`;
        }
      }
      palm += '</div>';

      /* 六宫速查 */
      const rows = d.palaces.map(p => ({
        cls: p.hit ? 'hi' : '',
        cells: [
          `<span class="mono-k">${p.name}</span>${p.hit ? ' <b style="color:#a8322d">◀时宫</b>' : (p.m ? ' <span style="color:#8a6a2f">月</span>' : (p.d ? ' <span style="color:#33556e">日</span>' : ''))}`,
          U.wx(p.wx), p.body, p.luck === '吉' ? '<span data-wx="木">吉</span>' : `<span data-wx="火">${p.luck}</span>`, p.pos
        ]
      }));

      return U.resHead(P.name, '小六壬 · ' + d.note) +
        U.card('落宫', `<div class="center" style="font-family:var(--font-kai);font-size:15px;letter-spacing:.16em;color:var(--ink-3)">${d.trio.join(' → ')}</div>` +
          `<div class="big-hex" style="font-size:44px;letter-spacing:.2em">${P.name}</div>` +
          `<div class="center" style="margin-top:4px">${U.wx(P.wx)} · ${P.body} · ${P.pos} · ${luckCls === 'good' ? '<span data-wx="木">吉</span>' : '<span data-wx="火">' + P.luck + '</span>'}</div>`) +
        U.card('掌诀图', palm, '食指·中指·无名指') +
        U.sec('判断', U.p(P.jie) + U.verse([P.poem])) +
        U.sec('三宫合参', U.p(
          `月宫为事之始、日宫为事之中、时宫为事之终。此课 <em>${PALACES[d.a].name}</em> 起、` +
          `经 <em>${PALACES[d.b].name}</em>、落 <em>${P.name}</em>：` +
          (d.a === d.c
            ? '首尾同宫，事体专一，来去皆在此一处，宜守不宜变。'
            : PALACES[d.a].wx === P.wx
              ? '首尾同气，事有始终一贯之象，谋事可行。'
              : `${U.wx(PALACES[d.a].wx)}始而${U.wx(P.wx)}终，` +
                (C.wxSheng(PALACES[d.a].wx) === P.wx ? '为始生终，事由我生，宜主动经营。'
                  : P.wx === '木' && PALACES[d.a].wx === '水' ? '为水生木，得力于外助。'
                    : C.wxKe(PALACES[d.a].wx) === P.wx ? '为始克终，中间必有阻隔，宜缓图。'
                      : '两头异气，事多转折，须看时宫断之。')) +
          ` 时宫${P.luck === '吉' ? '吉，宜行' : '不吉，宜止'}。`)) +
        U.sec('六宫速查', U.table(['宫', '五行', '六神', '吉凶', '方位'], rows)) +
        U.card('术语小释', U.kv([
          ['六宫', '大安、留连、速喜、赤口、小吉、空亡，对应左手三指六节。'],
          ['三盘', '月为天盘、日为地盘、时为入盘（人盘），三盘落宫合参。'],
          ['起宫算一', '自某宫起数时，该宫本身即算第一数，勿漏算。'],
          ['落宫', '末数所止之宫，为一课之主断。']
        ])) +
        U.note('六宫吉凶为传统口诀之白话转译，同一宫因所问之事不同而轻重有别，' +
          '宜与所问相参；本页断语为参考白话，非古籍原文。', true) +
        U.disclaim();
    }
  });
})();
