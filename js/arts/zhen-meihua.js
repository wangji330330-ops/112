/* 梅花易数 —— 邵康节观梅，体用生克断吉凶 */
(function () {
  'use strict';
  const C = window.CORE, U = C.UI, G = C.GZ;

  /* 先天八卦数：乾一 兑二 离三 震四 巽五 坎六 艮七 坤八 */
  const NUM2GUA = { 1: 'qian', 2: 'dui', 3: 'li', 4: 'zhen', 5: 'xun', 6: 'kan', 7: 'gen', 8: 'kun' };
  function guaOfNum(n) { return C.GUA_BY_ID[NUM2GUA[((n - 1) % 8 + 8) % 8 + 1]]; }
  /* 八经卦象义 */
  const XIANG = {
    qian: '乾为天、为父、为君、为首、为金玉、为大赤、为良马。主刚健、尊贵、财贵之象。',
    dui: '兑为泽、为少女、为口舌、为悦、为毁折。主喜悦、言语、饮食、少女之象。',
    li: '离为火、为中女、为目、为电、为文书、为甲胄。主文明、光明、文书、离别之象。',
    zhen: '震为雷、为长男、为足、为动、为大涂。主奋动、惊动、出行、长子之象。',
    xun: '巽为风、为长女、为股、为木、为绳直。主顺入、进退、文书、风行之事。',
    kan: '坎为水、为中男、为耳、为险、为盗、为月。主险陷、劳苦、智慧、酒水之象。',
    gen: '艮为山、为少男、为手、为门阙、为止。主静止、阻隔、山林、田土之象。',
    kun: '坤为地、为母、为众、为腹、为布帛、为吝啬。主柔顺、田土、众多、承载之象。'
  };
  const SEASON = [
    { wx: '木', name: '春' }, { wx: '火', name: '夏' }, { wx: '土', name: '四季' },
    { wx: '金', name: '秋' }, { wx: '水', name: '冬' }
  ];

  ART({
    id: 'meihua', name: '梅花易数', alias: ['梅花心易', '观梅数', '邵子神数'],
    gua: 'zhen', order: 3,
    tagline: '邵康节观梅 · 时间、数字、单字皆可起卦，体用生克断吉凶',

    intro: `
      <p>梅花易数相传为北宋邵雍（康节）所传。其名出自"观梅占"：邵子见梅枝上有雀争枝坠地，
      遂起卦而占，次日果有邻女折花伤股，应验如响，故名"梅花易数"。</p>
      <p>其法最重"心易"：不拘蓍龟、不择时日，凡天地间之数、目中之物、耳中之声，
      皆可起卦。最常用者三法：<em>以时间起</em>（年支数加月日时）、
      <em>以数字起</em>（见数即起）、<em>以一字起</em>（拆字取笔画）。
      起卦既定，以<em>动爻</em>分<em>体用</em>：不动者为体（自身、主体），
      动者为用（他事、客体），再看两卦五行的生克，便是吉凶所系。</p>
      <p>断法之要在于"体用生克"五条：用生体为吉、体克用为小吉、体用比和为顺、
      体生用为泄气、用克体为凶。再参互卦以观中间过程、参变卦以观事之结局、
      参月令以辨体卦之旺衰。梅花之妙在圆活，故古人有"不可执一"之诫。</p>`,

    method: `
      <p>三种起卦方式任选其一：</p>
      <ul>
        <li><em>以时间起</em>：取年支之数加农历月、日为上卦，再加时辰之数为下卦，总数取六为动爻。
        古法用农历，本站提供两种取数：以公历数起（本站约定，简便）或自选农历月日时（合古法）。</li>
        <li><em>以数字起</em>：心中默念所问，随口报两数，第一数取上卦、第二数取下卦，两数之和取动爻。</li>
        <li><em>以一字起</em>：写下一字，取其笔画数配时辰数起上下卦。笔画数请自行填入（本站不作字库笔画换算），
        留空则以字码近似——此处从简，古法须拆字分左右上下取数。</li>
      </ul>`,

    form: [
      {
        name: 'way', label: '起卦方式', type: 'chips', value: 'num',
        options: [{ v: 'num', t: '以数字起卦' }, { v: 'time', t: '以时间起卦' }, { v: 'word', t: '以一字起卦' }]
      },
      { name: 'q', label: '所问之事', type: 'text', placeholder: '如：近日洽谈能否如期', wide: true },
      { name: 'n1', label: '第一数（上卦）', type: 'number', min: 1, max: 999, placeholder: '随口报数' },
      { name: 'n2', label: '第二数（下卦）', type: 'number', min: 1, max: 999, placeholder: '随口报数' },
      { name: 'dt', label: '起卦时间', type: 'datetime-local', value: U.nowStr(), wide: true },
      {
        name: 'timeMode', label: '时间取数', type: 'select', value: 'gongli',
        options: [{ v: 'gongli', t: '以公历数起（本站约定）' }, { v: 'nongli', t: '自选农历月日时（合古法）' }]
      },
      { name: 'lmonth', label: '农历月', type: 'select', options: U.lunarMonths(), value: '1' },
      { name: 'lday', label: '农历日', type: 'select', options: U.lunarDays(), value: '1' },
      { name: 'lhour', label: '时辰', type: 'select', options: C.HOURS.map(h => ({ v: String(h.idx), t: h.zhi + '时' })), value: '0' },
      { name: 'word', label: '一字', type: 'text', placeholder: '如：明', hint: '一字起卦' },
      { name: 'stroke', label: '该字笔画数', type: 'number', min: 1, max: 64, placeholder: '如 8', hint: '留空则用字码近似' }
    ],

    cast(input) {
      const fp = G.fourPillars(U.parseDT(input.dt));
      const way = input.way || 'num';
      let n1, n2, srcText, extra = [];

      if (way === 'num') {
        n1 = parseInt(input.n1, 10);
        n2 = parseInt(input.n2, 10);
        if (!n1 || n1 < 1) n1 = C.RNG.randInt(1, 99);
        if (!n2 || n2 < 1) n2 = C.RNG.randInt(1, 99);
        srcText = `以数起卦：${n1} · ${n2}`;
      } else if (way === 'time') {
        const yz = G.ZHI.indexOf(fp.year.zhi) + 1;                   /* 年支数：子一…亥十二 */
        let m, dd, hz;
        if ((input.timeMode || 'gongli') === 'nongli') {
          m = parseInt(input.lmonth, 10) || 1;
          dd = parseInt(input.lday, 10) || 1;
          hz = (parseInt(input.lhour, 10) || 0) + 1;
          srcText = `以农历时间起卦：年支${fp.year.zhi}(${yz}) 月${m} 日${dd} 时${C.HOURS[hz - 1].zhi}(${hz})`;
        } else {
          const W = { y: fp.input.y, m: fp.input.m, d: fp.input.d, h: fp.input.h };
          m = W.m; dd = W.d; hz = C.ZHI.indexOf(fp.hour.zhi) + 1;
          srcText = `以公历数起卦（本站约定）：年支${fp.year.zhi}(${yz}) 月${m} 日${dd} 时支${fp.hour.zhi}(${hz})`;
          extra.push('古法以农历月日起卦，本站"公历数"一法系为免农历换算而立，数列不同则卦不同，' +
            '欲合古法请改用"自选农历月日时"。');
        }
        n1 = yz + m + dd;
        n2 = n1 + hz;
        extra.push(`上卦数 = 年支${yz} + 月${m} + 日${dd} = ${n1}；下卦数 = ${n1} + 时${hz} = ${n2}；动爻取 ${n2}。`);
      } else {
        const word = (input.word || '').trim();
        if (!word) return { error: '请写下一个字' };
        const ch = Array.from(word)[0];
        let stroke = parseInt(input.stroke, 10);
        if (!stroke || stroke < 1) {
          stroke = (ch.codePointAt(0) % 30) + 1;
          extra.push(`未填笔画数，本站以字码近似取 <em>${stroke}</em> 画（古法须依《康熙字典》笔画，宜自行填入以合古法）。`);
        }
        const hz = C.ZHI.indexOf(fp.hour.zhi) + 1;
        n1 = stroke;
        n2 = stroke + hz;
        srcText = `以「${ch}」起卦：笔画${stroke} + 时支${fp.hour.zhi}(${hz})`;
        extra.push(`上卦数 = 笔画 ${stroke}；下卦数 = 笔画 ${stroke} + 时 ${hz} = ${n2}。`);
      }

      const up = guaOfNum(n1), low = guaOfNum(n2);
      const dongTotal = n1 + n2;
      const dong = ((dongTotal - 1) % 6 + 6) % 6;                     /* 0..5，自初爻起 */
      const lines = low.lines.concat(up.lines);
      const ben = C.HEX64[lines.join('')];
      const hu = C.huGua(lines);
      const bian = C.bianGua(lines, [dong]);
      /* 体用：动者为用，不动者为体 */
      const dongInLower = dong <= 2;
      const ti = dongInLower ? up : low;
      const yong = dongInLower ? low : up;
      /* 变卦中与体对应之卦 */
      const bianLines = bian.lines;
      const bianTi = dongInLower ? C.GUA_BY_LINES[bianLines.slice(3, 6).join('')] : C.GUA_BY_LINES[bianLines.slice(0, 3).join('')];
      const bianYong = dongInLower ? C.GUA_BY_LINES[bianLines.slice(0, 3).join('')] : C.GUA_BY_LINES[bianLines.slice(3, 6).join('')];
      const huUp = C.GUA_BY_LINES[hu.lines.slice(3, 6).join('')];
      const huLow = C.GUA_BY_LINES[hu.lines.slice(0, 3).join('')];

      /* 体用生克 */
      const rel = C.wxRelation(ti.wx, yong.wx);
      const REL_TEXT = {
        '生我': { t: '用生体', luck: '大吉', d: '用卦生体卦，外来之力助我，事得资助、不劳而成，所求多遂。' },
        '我克': { t: '体克用', luck: '小吉', d: '体卦克用卦，事在我掌握之中，可成，然须费心力经营。' },
        '同': { t: '体用比和', luck: '吉', d: '体用同气，彼此相合，谋事顺遂，凡事和同。' },
        '我生': { t: '体生用', luck: '小凶', d: '体卦生用卦，我之精气泄于外，事多耗散，费力而少成，宜量力。' },
        '克我': { t: '用克体', luck: '凶', d: '用卦克体卦，受制于外，事多阻隔，强行则伤，宜退守待时。' }
      }[rel];
      /* 变卦对体的生克（结局） */
      const relBian = C.wxRelation(ti.wx, bianYong.wx);
      const bianText = {
        '生我': '变卦生体，结局有益，事虽曲折而终得利。',
        '我克': '体克变卦，结局在握，终能制之。',
        '同': '变卦与体比和，结局平顺，如初所愿。',
        '我生': '体生变卦，结局耗散，所得不偿所费。',
        '克我': '变卦克体，结局不利，须早作打算。'
      }[relBian];
      /* 体卦旺衰（以月建五行论） */
      const monthWx = C.ZHI_WX[C.ZHI.indexOf(fp.month.zhi)];
      const tai = C.wxRelation(monthWx, ti.wx);   /* 以月建为我，体为彼 */
      const WANG = { '同': ['旺', '体卦临月建，当令得时，事在必行。'], '生我': ['相', '月建生体卦，得时之助，可为。'], '我生': ['休', '体卦生月建，气泄于外，力有不足。'], '克我': ['囚', '月建克体卦，失时受制，宜缓图。'], '我克': ['死', '体卦克月建，以弱制强，事倍功半。'] }[tai];
      /* 应期（以卦数、动爻数粗定，梅花常用） */
      const yingQi = (up.num + low.num + dong + 1);
      const qiText = `体用既明，应期可参：上卦${up.name}数${up.num}、下卦${low.name}数${low.num}、动爻在${['初', '二', '三', '四', '五', '上'][dong]}为${dong + 1}，` +
        `合之得 ${yingQi}。梅花以卦数配时至为应期：可应于 ${yingQi} 日、${yingQi} 月之内，或以时数计为 ${yingQi} 时辰。` +
        `（应期之法流派不一，此处为简化取法，仅供参考。）`;

      return {
        q: (input.q || '').trim(), way, srcText, extra, n1, n2, up, low, dong, ben, hu, bian,
        ti, yong, bianTi, bianYong, huUp, huLow, rel, relBian, REL_TEXT, bianText,
        wang: WANG[0], wangText: WANG[1], monthWx, qiText, yingQi, fp
      };
    },

    view(d) {
      const posName = ['初', '二', '三', '四', '五', '上'][d.dong];
      const luckCls = d.REL_TEXT.luck === '凶' ? 'bad' : d.REL_TEXT.luck === '小凶' ? 'warn' : 'good';
      return U.resHead(d.ben.name, `第 ${d.ben.no} 卦 · ${d.REL_TEXT.t}（${d.REL_TEXT.luck}）`) +
        (d.q ? `<p class="branch-lead" style="margin:0 0 10px">所问：<em>${U.esc(d.q)}</em></p>` : '') +
        U.card('起卦', U.kv([
          ['起卦方式', d.srcText],
          ['上卦', `${d.up.name}（${d.up.nature}）· 先天数 ${d.up.num}`],
          ['下卦', `${d.low.name}（${d.low.nature}）· 先天数 ${d.low.num}`],
          ['动爻', `${posName}爻`],
          ['时间', `${d.fp.year.name}年 ${d.fp.month.name}月 ${d.fp.day.name}日 ${d.fp.hour.name}时（月建 ${d.monthWx}）`]
        ]) + (d.extra.length ? d.extra.map(x => U.note(x, true)).join('') : '')) +
        U.card('卦象', U.yao(d.ben.lines, { dong: [d.dong] }) +
          `<div class="grid3" style="margin-top:8px">
             <div>${U.kv([['本卦', d.ben.name], ['', d.ben.upper.symbol + d.ben.lower.symbol]])}</div>
             <div>${U.kv([['互卦', d.hu.name], ['', d.hu.upper.symbol + d.hu.lower.symbol]])}</div>
             <div>${U.kv([['变卦', d.bian.name], ['', d.bian.upper.symbol + d.bian.lower.symbol]])}</div>
           </div>`) +
        U.sec('体用', U.table(['', '卦', '五行', '象义'], [
          { cls: 'hi', cells: ['<b>体</b>（不动·自身）', d.ti.name + '（' + d.ti.nature + '）', U.wx(d.ti.wx), d.ti.dex + ' —— ' + d.ti.desc] },
          { cells: ['<b>用</b>（动·他事）', d.yong.name + '（' + d.yong.nature + '）', U.wx(d.yong.wx), d.yong.dex + ' —— ' + d.yong.desc] }
        ])) +
        U.sec('断卦', U.p(`<b style="font-size:15px" data-wx="${luckCls === 'good' ? '木' : luckCls === 'bad' ? '火' : '土'}">${d.REL_TEXT.t} · ${d.REL_TEXT.luck}</b> —— ${d.REL_TEXT.d}`) +
          U.p(`体卦${d.ti.name}属${U.wx(d.ti.wx)}，月建属${U.wx(d.monthWx)}，体卦${d.wang}：${d.wangText}`) +
          U.p(`互卦 ${d.huUp.name}上${d.huLow.name}下 —— 事之中间过程：` +
            (C.wxRelation(d.ti.wx, d.huUp.wx) === '克我' || C.wxRelation(d.ti.wx, d.huLow.wx) === '克我'
              ? '中间有阻，须防中途生变。'
              : C.wxRelation(d.ti.wx, d.huUp.wx) === '生我' || C.wxRelation(d.ti.wx, d.huLow.wx) === '生我'
                ? '中间得助，事有转机。' : '中间平顺，无甚波折。')) +
          U.p(`变卦 ${d.bian.name} —— ${d.bianText}`) +
          U.p(d.qiText)) +
        U.card('上下卦象义', U.kv([
          [d.up.name + '（上卦）', XIANG[d.up.id]],
          [d.low.name + '（下卦）', XIANG[d.low.id]]
        ])) +
        U.card('本卦大意', U.p(d.ben.duan + '（白话参考，非古籍原文）') +
          U.kv([['互卦', d.hu.name + '：' + d.hu.duan], ['变卦', d.bian.name + '：' + d.bian.duan]])) +
        U.card('术语小释', U.kv([
          ['体用', '不动者为体（自身、主体），动者为用（他事、客体）。'],
          ['用生体', '外来之力助我，最吉。'],
          ['体克用', '我可制彼，事可成而费力，小吉。'],
          ['体生用', '我之精气外泄，费力少成，小凶。'],
          ['用克体', '受制于外，事多阻隔，凶。'],
          ['互卦', '取二三四爻为下、三四五爻为上，主事之中间过程。'],
          ['十应', '梅花三要十应：以目见耳闻之应物参断，非数所能尽。']
        ])) +
        U.note('梅花易数以"心易"为宗，圆活无方，本页仅以体用生克、互变旺衰立法，' +
          '属<em>简化断法</em>；古法尚须参三要十应、外应之机。结果仅供文化体验与自省。', true) +
        U.disclaim();
    }
  });
})();
