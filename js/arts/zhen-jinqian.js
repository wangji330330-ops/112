/* 金钱卦 —— 文王课简法：三钱六掷，本卦变卦 */
(function () {
  'use strict';
  const C = window.CORE, U = C.UI, G = C.GZ;

  const YAO_NAME = ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻'];
  const DONG_TEXT = { 6: '老阴 · 变阳', 7: '少阳 · 不变', 8: '少阴 · 不变', 9: '老阳 · 变阴' };

  function barInline(yang, dong) {
    const col = dong ? '#a8322d' : '#171614';
    const s = `display:inline-block;height:8px;background:${col};border-radius:1px;vertical-align:middle`;
    return yang
      ? `<span style="${s};width:36px"></span>`
      : `<span style="${s};width:15px"></span><span style="display:inline-block;width:6px"></span><span style="${s};width:15px"></span>`;
  }

  ART({
    id: 'jinqian', name: '金钱卦', alias: ['文王课', '铜钱卦', '掷钱占'],
    gua: 'zhen', order: 2,
    tagline: '文王课简法 · 三枚铜钱六掷成卦，以本卦变卦断之',

    intro: `
      <p>金钱卦是六爻纳甲之前的简法，俗称"文王课"。取三枚铜钱（今多以硬币代之），
      合于掌中摇动掷下，以钱之字背定阴阳：<em>三背为老阳（○）、三字为老阴（×）、
      两背一字为少阳、两字一背为少阴</em>。如此六掷，自下而上成一卦，是为本卦。</p>
      <p>老阳、老阴为"动爻"，物极必反，故动爻变其阴阳，另成一卦，是为变卦。
      占断之法：<em>本卦为事之体，变卦为事之变</em>；六爻不动则以本卦卦象断之，
      一爻动则以动爻为主、参以本卦之象，多爻动则看动爻多寡与所变之卦，随事而取。</p>
      <p>较之六爻纳甲，此法不装六亲、不配六神，只以卦象卦意论吉凶，故称"简法"。
      其妙在卦名与卦德：如得《泰》则通、得《否》则塞，得《谦》则吉、得《剥》则伤，
      卦象既定，大意已明。</p>`,

    method: `
      <p>输入所问之事（写下具体的、可验证的问题比笼统发问要好），按"起课"即摇钱六次。
      若想自己掷钱，可勾选"手动录入"，把六次结果自下而上依次填入（三背=老阳、三字=老阴）。</p>
      <p>结果给出：本卦（含卦序、上下卦、白话大意）、动爻、变卦，以及互卦、错卦、综卦作为旁参。</p>`,

    form: [
      { name: 'q', label: '所问之事', type: 'text', placeholder: '如：此次求职能否成行', wide: true },
      {
        name: 'mode', label: '起卦方式', type: 'chips', value: 'auto',
        options: [{ v: 'auto', t: '自动摇钱' }, { v: 'manual', t: '手动录入' }]
      },
      { name: 'm1', label: '初爻', type: 'select', options: [6, 7, 8, 9].map(v => ({ v: String(v), t: DONG_TEXT[v] })), value: '7' },
      { name: 'm2', label: '二爻', type: 'select', options: [6, 7, 8, 9].map(v => ({ v: String(v), t: DONG_TEXT[v] })), value: '7' },
      { name: 'm3', label: '三爻', type: 'select', options: [6, 7, 8, 9].map(v => ({ v: String(v), t: DONG_TEXT[v] })), value: '7' },
      { name: 'm4', label: '四爻', type: 'select', options: [6, 7, 8, 9].map(v => ({ v: String(v), t: DONG_TEXT[v] })), value: '7' },
      { name: 'm5', label: '五爻', type: 'select', options: [6, 7, 8, 9].map(v => ({ v: String(v), t: DONG_TEXT[v] })), value: '7' },
      { name: 'm6', label: '上爻', type: 'select', options: [6, 7, 8, 9].map(v => ({ v: String(v), t: DONG_TEXT[v] })), value: '7' },
      { name: 'dt', label: '起卦时间（记日月建）', type: 'datetime-local', value: U.nowStr(), wide: true }
    ],

    cast(input) {
      const q = (input.q || '').trim();
      let vals, tosses = null;
      if ((input.mode || 'auto') === 'manual') {
        vals = ['m1', 'm2', 'm3', 'm4', 'm5', 'm6'].map(k => parseInt(input[k], 10) || 7);
      } else {
        vals = [];
        tosses = [];
        for (let i = 0; i < 6; i++) {
          const coins = [C.RNG.rand() < 0.5 ? 2 : 3, C.RNG.rand() < 0.5 ? 2 : 3, C.RNG.rand() < 0.5 ? 2 : 3];
          tosses.push(coins);
          vals.push(coins.reduce((a, b) => a + b, 0));
        }
      }
      const lines = vals.map(v => (v === 7 || v === 9) ? 1 : 0);
      const dong = vals.map((v, i) => (v === 6 || v === 9) ? i : -1).filter(i => i >= 0);
      const ben = C.HEX64[lines.join('')];
      const bian = dong.length ? C.bianGua(lines, dong) : null;
      const hu = C.huGua(lines);
      const cuo = C.cuoGua(lines);
      const zong = C.zongGua(lines);
      const fp = G.fourPillars(U.parseDT(input.dt));
      return { q, vals, tosses, lines, dong, ben, bian, hu, cuo, zong, fp, manual: (input.mode === 'manual') };
    },

    view(d) {
      const b = d.ben;
      /* 摇钱过程 */
      let proc = '';
      if (d.tosses) {
        proc = U.card('摇钱六次（自下而上）', d.tosses.map((coins, i) => {
          const v = coins.reduce((a, b) => a + b, 0);
          return `<div class="bar-line"><span class="lab">${YAO_NAME[i]}</span>` +
            U.coins(coins) +
            `<span class="val" style="flex:0 0 auto;margin-left:10px">${v} · ${DONG_TEXT[v].split(' · ')[0]}</span></div>`;
        }).join(''));
      }
      /* 六爻排布 */
      const yaoRows = [];
      for (let i = 5; i >= 0; i--) {
        const isDong = d.dong.indexOf(i) >= 0;
        const bv = d.bian ? d.bian.lines[i] : null;
        yaoRows.push({
          cls: isDong ? 'hi' : '',
          cells: [
            YAO_NAME[i],
            barInline(d.lines[i], isDong),
            (d.vals[i] === 6 ? '老阴 ×' : d.vals[i] === 9 ? '老阳 ○' : d.vals[i] === 7 ? '少阳 —' : '少阴 --'),
            barInline(d.lines[i], false),
            d.bian ? barInline(bv, isDong) : '<span style="color:#9a9486">—</span>',
            isDong ? '<b style="color:#a8322d">动</b>' : ''
          ]
        });
      }

      const duan = [];
      if (!d.dong.length) {
        duan.push(`六爻安静，事体不变，以本卦 <em>${b.name}</em> 之象断之：${b.duan}`);
        duan.push('静卦主守，宜循常理而行，不宜妄动更张。');
      } else if (d.dong.length === 1) {
        const p = d.dong[0];
        duan.push(`一爻独发，专看 <em>${YAO_NAME[p]}</em> 之变：本卦 ${b.name} → 变卦 ${d.bian.name}。`);
        duan.push(`本卦言事之现在：${b.duan}`);
        duan.push(`变卦言事之将来：${d.bian.duan}`);
        duan.push(p <= 1 ? '动在初、二，事在己身与近处，宜自省自修。'
          : p <= 3 ? '动在三、四，事在内外之交，进退之际最须斟酌。'
            : '动在五、上，事在高位与事之终，宜谋定后动，慎终如始。');
      } else {
        const yangDong = d.dong.filter(i => d.lines[i] === 1).length;
        const yinDong = d.dong.length - yangDong;
        duan.push(`动爻 ${d.dong.length} 个（${d.dong.map(i => YAO_NAME[i]).join('、')}），事多变迁，须合本卦与变卦同看。`);
        duan.push(`本卦：${b.duan}`);
        duan.push(`变卦：${d.bian.duan}`);
        duan.push(yangDong > yinDong ? '阳动多于阴动，事势向外、向明，宜进取而防躁。'
          : yangDong < yinDong ? '阴动多于阳动，事势向内、向晦，宜退守而待时。'
            : '阴阳动爻相当，事在两可之间，成否多在人谋。');
      }
      /* 卦德
         以字义之吉凶倾向作参考 */
      const GOOD = ['乾为天', '地天泰', '火天大有', '地山谦', '雷地豫', '泽雷随', '地泽临', '风雷益', '泽火革', '火风鼎', '风山渐', '风泽中孚', '水火既济', '水天需', '风天小畜', '山天大畜'];
      const BAD = ['天地否', '山地剥', '天水讼', '水山蹇', '泽水困', '泽风大过', '坎为水', '火水未济', '雷泽归妹', '山风蛊', '地火明夷'];
      const tone = GOOD.indexOf(b.name) >= 0 ? '本卦象义偏吉' : BAD.indexOf(b.name) >= 0 ? '本卦象义偏凶' : '本卦象义中平';

      const fp = d.fp;
      return U.resHead(b.name, `第 ${b.no} 卦 · ${tone}`) +
        (d.q ? `<p class="branch-lead" style="margin:0 0 10px">所问：<em>${U.esc(d.q)}</em></p>` : '') +
        U.card('卦象', U.yao(d.lines, { dong: d.dong }) +
          `<div class="grid2" style="margin-top:10px">
             <div>${U.kv([['本卦', b.name], ['上下卦', `${b.upper.name}上${b.lower.name}下`], ['卦序', '第' + b.no + '卦'], ['卦象', b.upper.symbol + b.lower.symbol]])}</div>
             <div>${U.kv([['动爻', d.dong.length ? d.dong.map(i => YAO_NAME[i]).join('、') : '六爻安静'], ['变卦', d.bian ? d.bian.name : '无'], ['互卦', d.hu.name], ['错卦·综卦', d.cuo.name + ' / ' + d.zong.name]])}</div>
           </div>`) +
        (proc || U.card('手动录入', U.yao(d.lines, { dong: d.dong }) + U.note('手动录入之结果，无摇钱过程记录。'))) +
        U.sec('六爻', U.table(['爻位', '本卦', '老少', '', '变卦', ''], yaoRows, { align: ['c', 'c', 'c', 'c', 'c', 'c'] })) +
        U.sec('断卦', duan.map(x => U.p(x)).join('')) +
        U.card('旁参之卦', U.kv([
          ['互卦', `${d.hu.name} —— 事之中间过程，${d.hu.duan}`],
          ['错卦', `${d.cuo.name} —— 事之反面、对方立场`],
          ['综卦', `${d.zong.name} —— 事之反转、易地而处`]
        ])) +
        U.card('月建日辰', U.kv([
          ['起卦时间', G.fmtTime({ y: fp.input.y, m: fp.input.m, d: fp.input.d, h: fp.input.h, min: fp.input.min })],
          ['日干支', fp.day.name + '（旬空 ' + fp.xun.kong + '）'],
          ['月建', fp.month.name + '（节气 ' + fp.month.jie + ' 后）'],
          ['时干支', fp.hour.name]
        ])) +
        U.card('术语小释', U.kv([
          ['本卦', '六掷所得之卦，言事之现在。'],
          ['变卦', '动爻变其阴阳后所得之卦，言事之将来。'],
          ['动爻', '老阳（三背）、老阴（三字）为动，物极必反。'],
          ['互卦', '取二三四爻为下卦、三四五爻为上卦，主事之中间。'],
          ['静卦', '六爻不动，以本卦卦象断之，主守。']
        ])) +
        U.note('本页以卦象、动爻与卦德立断，不装六亲六神（欲看纳甲装卦请用「六爻纳甲」）；' +
          '卦意为白话参考，非古籍原文，请参通行本《周易》卦爻辞。', true) +
        U.disclaim();
    }
  });
})();
