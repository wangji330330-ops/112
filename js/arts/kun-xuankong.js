/* ============================================================
   坤 · 玄空飞星 —— 三元九运 / 年月九星飞泊（紫白）
   ============================================================ */
(function () {
  'use strict';
  const C = window.CORE, U = C.UI, ART = window.ART;

  /* ---------- 核心表：一律取 core（js/core/tables.js）之 C.XUANKONG 与 C.QIMEN ---------- */
  /* 年星、月星、九宫飞泊之算法在 core 中已实现，本页只调用，不重写；
     惟其锚点与飞泊次序与通行口诀有出入者，本页作校勘（见下方自检），并在结果页注明。 */
  const XK = C.XUANKONG;
  const QM = C.QIMEN;
  const CORE_READY = !!(XK && QM && typeof XK.yearStar === 'function' &&
    typeof XK.monthStar === 'function' && typeof QM.feiXing === 'function');

  const FLY_GONG = [5, 6, 7, 8, 9, 1, 2, 3, 4];    // 洛书飞泊次序：中→乾→兑→艮→离→坎→坤→震→巽
  const GONG24 = ['坎', '艮', '震', '巽', '离', '坤', '兑', '乾'];
  const SHAN = C.SHAN24;
  const MONTH_BASE = [8, 5, 2, 8, 5, 2, 8, 5, 2, 8, 5, 2];   // 子…亥年支：正月入中星（子午卯酉八白、辰戌丑未五黄、寅申巳亥二黑）

  /* 引擎飞星语义自检：'order' = 以宫号序（1→2→…→9）给出星序；'luoshu' = 已按洛书次序落宫 */
  const FEI_MODE = (function () {
    if (!CORE_READY) return 'order';
    try { const m = QM.feiXing(5, 1); return (m[5] === 5 && m[1] !== 5) ? 'luoshu' : 'order'; }
    catch (e) { return 'order'; }
  })();
  /* 年星入中自检：引擎若已合通行口诀（1984 年七赤、2000 年九紫）则不校正；
     若以 2000 年七赤入中为锚，则与通行口诀相差二位，校二位。 */
  const Y_SHIFT = (function () {
    if (!CORE_READY) return 0;
    try {
      if (XK.yearStar(1984) === 7 && XK.yearStar(2000) === 9) return 0;
      if (XK.yearStar(2000) === 7) return 2;
      return 0;
    } catch (e) { return 0; }
  })();
  /* 月星正月入中自检：引擎若与口诀不合，则改用口诀本表 */
  const M_BASE_OK = (function () {
    if (!CORE_READY) return false;
    try { return XK.monthStar(2024, 1) === 5 && XK.monthStar(2023, 1) === 8; }
    catch (e) { return false; }
  })();

  /* 洛书顺飞九宫：'order' 时取其星序再依洛书次序落宫；'luoshu' 时直接可用 */
  function flyGrid(center) {
    const m = QM.feiXing(center, 1);
    if (FEI_MODE === 'luoshu') return m;
    const grid = {};
    FLY_GONG.forEach((g, k) => { grid[g] = m[k + 1]; });
    return grid;
  }
  const yearCenter = (y) => ((XK.yearStar(y) - 1 + Y_SHIFT) % 9 + 9) % 9 + 1;
  const monthBase = (y) => (M_BASE_OK ? XK.monthStar(y, 1) : MONTH_BASE[((y - 4) % 12 + 12) % 12]);
  /* 月星入中：依《阳明按索》「并逆布」，正月之后逐月逆退一位 */
  const monthCenter = (y, m) => ((monthBase(y) - 1 - (m - 1)) % 9 + 9) % 9 + 1;

  /* 三元九运：上元一运起于 1864 年，每运二十年，三元共一百八十年 */
  function yunOf(year) {
    const n = Math.floor((year - 1864) / 20);
    const k = ((n % 9) + 9) % 9 + 1;
    const start = 1864 + n * 20;
    return { k: k, start: start, end: start + 19, yuan: ['上元', '中元', '下元'][Math.floor((k - 1) / 3)] };
  }
  const wrap9 = (n) => ((n - 1) % 9 + 9) % 9 + 1;

  const starName = (s) => XK.JIU_XING[s - 1].slice(0, 2);          // 一白 / 二黑 …
  const starFull = (s) => XK.JIU_XING[s - 1];                       // 一白贪狼
  const gongOfShan = (i) => C.GUA_BY_NAME[GONG24[Math.floor(i / 3)]].houtian;

  ART({
    id: 'xuankong',
    name: '玄空飞星',
    alias: ['玄空', '飞星', '紫白'],
    gua: 'kun',
    order: 3,
    tagline: '三元九运 · 九星飞泊，看年月飞星到宫之吉凶',

    intro: `
      <p>玄空之学出于理气一派，以「三元九运」为时间之纲、以「九星飞泊」为空间之纬。
      三元者，上元、中元、下元，各领三运；九运者，一运至九运，每运二十年，三元九运共一百八十年，
      周而复始。今世以清同治三年（1864）甲子为上元一运之始，故 1984 年起下元七运，2004 年起八运，2024 年起九运。</p>
      <p>九星者，一白贪狼、二黑巨门、三碧禄存、四绿文曲、五黄廉贞、六白武曲、七赤破军、八白左辅、九紫右弼。
      其法以某星入中宫，余星依洛书次序「中→乾→兑→艮→离→坎→坤→震→巽」顺飞八方，各得其位。
      年有年星、月有月星，逐年逐月移宫换位，看何星到门、到向、到坐，以论一宅一时之气。</p>
      <p>论吉凶有两层：一在「时」，当运之星谓之旺，未来之星谓之生，已过之星谓之退；
      一在「位」，五黄、二黑为最烈之二凶，宜静不宜动。玄空本以宅命盘（运盘加山星、向星）为主，
      年月飞星为辅；本页只排年月飞星（即年月紫白），不排山向飞星，属简化演示。</p>`,

    method: `
      <p>先填年份，可得该年入中之星与九宫年星分布；若再选一月（农历月），并得该月月星分布。
      末填坐山（或留默认之子山），本页取其对宫为朝向，并报出年、月之星各飞到向首与坐山的是哪一颗，
      以及五黄、二黑本年本月落在何方。</p>
      <p>须留意三点：其一，本页只排年月飞星，不排运盘与山向飞星，故不能据以定「宅之吉凶」；
      其二，月星从农历月，未作节气换月；其三，兼向、替卦、入囚、七星打劫诸法皆未涉及。</p>`,

    form: [
      { name: 'year', label: '年份', type: 'number', value: 2024, min: 1864, max: 2400 },
      {
        name: 'month', label: '农历月（可留「不排」）', type: 'select', value: '0',
        options: [{ v: '0', t: '不排月星' }].concat(U.lunarMonths())
      },
      {
        name: 'zuo', label: '坐山（用于参看向首飞星）', type: 'select', value: '子',
        options: SHAN.map(s => ({ v: s, t: s + '山' }))
      }
    ],

    cast(input) {
      if (!CORE_READY) return { error: '玄空核心表未加载：请确认 index.html 已引入 js/core/tables.js' };
      const year = Number(input.year);
      if (!year || year < 1000 || year > 2999) return { error: '年份须在 1000–2999 之间' };
      const month = Number(input.month) || 0;
      if (month < 0 || month > 12) return { error: '农历月须在正月至腊月之间' };
      const zuoIn = String(input.zuo || '子').trim();
      const zi = SHAN.indexOf(zuoIn);
      if (zi < 0) return { error: '坐山须为二十四山之一' };
      const ci = (zi + 12) % 24;

      const yun = yunOf(year);
      const yCenter = yearCenter(year);
      const yGrid = flyGrid(yCenter);
      const mCenter = month > 0 ? monthCenter(year, month) : 0;
      const mGrid = month > 0 ? flyGrid(mCenter) : null;

      const zuoGong = gongOfShan(zi), chaoGong = gongOfShan(ci);
      const zuoGua = C.GONG_GUA[zuoGong], chaoGua = C.GONG_GUA[chaoGong];

      const findStar = (grid, star) => {
        for (const g in grid) if (grid[g] === star) return Number(g);
        return 0;
      };
      const whereIs = (grid, star) => {
        const g = findStar(grid, star);
        return g ? C.GONG_DIR[g] + '（' + C.GONG_GUA[g] + '宫，' + C.GONG_NAME[g] + '）' : '—';
      };

      const wang = yun.k, sheng = wrap9(yun.k + 1), tui = wrap9(yun.k - 1);

      /* 向首、坐山所得之星 */
      const yToChao = yGrid[chaoGong], yToZuo = yGrid[zuoGong];
      const mToChao = mGrid ? mGrid[chaoGong] : 0, mToZuo = mGrid ? mGrid[zuoGong] : 0;

      const judge = (star, placeName) => {
        if (!star) return placeName + '未排。';
        const luck = XK.XING_LUCK[star];
        if (star === wang) return placeName + '得 ' + starFull(star) + '（当旺之星），为当时得令之方，宜开畅纳气、宜常用常动。';
        if (star === 5) return placeName + '得五黄廉贞（大凶），宜静不宜动；忌于此方大兴土木、忌重物冲射，可置金属器物以泄其土气。';
        if (star === 2) return placeName + '得二黑巨门（病符），宜静宜洁；忌久卧久坐于此方，宜通风采光以散其滞气。';
        if (luck === '吉') return placeName + '得 ' + starFull(star) + '（吉），气尚可用，宜整洁明亮以引之。';
        return placeName + '得 ' + starFull(star) + '（' + luck + '），不宜作久居久坐之所；宜安静整洁、通风采光，并视其五行择物以调之。';
      };

      const points = [];
      points.push('本年' + yun.yuan + '第' + yun.k + '运（' + yun.start + '–' + yun.end + ' 年），当旺之星为 ' + starFull(wang) +
        '，未来生气之星为 ' + starFull(sheng) + '，已退之星为 ' + starFull(tui) + '。');
      points.push('年星：' + year + ' 年以 ' + starFull(yCenter) + ' 入中，五黄到' + whereIs(yGrid, 5) + '，二黑到' + whereIs(yGrid, 2) + '。');
      points.push(judge(yToChao, '朝向' + SHAN[ci] + '（' + chaoGua + '宫）'));
      points.push(judge(yToZuo, '坐山' + SHAN[zi] + '（' + zuoGua + '宫）'));
      if (mGrid) {
        points.push('月星：' + month + '月以 ' + starFull(mCenter) + ' 入中，五黄到' + whereIs(mGrid, 5) + '，二黑到' + whereIs(mGrid, 2) + '。');
        points.push(judge(mToChao, '本月朝向' + SHAN[ci]));
        points.push(judge(mToZuo, '本月坐山' + SHAN[zi]));
      }

      const yi = [], ji = [];
      yi.push('当旺之星 ' + starFull(wang) + ' 所到之方（' + whereIs(yGrid, wang) + '）宜开畅、宜常用，谓之得令。');
      yi.push('生气之星 ' + starFull(sheng) + ' 所到之方宜留意，为将旺之气。');
      ji.push('五黄本年到' + whereIs(yGrid, 5) + '，此方宜静不宜动：忌动土、忌大修、忌重物与尖角冲射' + (mGrid ? '；本月五黄到' + whereIs(mGrid, 5) + '，同宜安静' : '') + '。');
      ji.push('二黑本年到' + whereIs(yGrid, 2) + '，宜通风采光、宜洁净；忌久卧久坐，忌堆放杂物。');
      if (yToChao === 5 || yToChao === 2) ji.push('向首得 ' + starFull(yToChao) + '，纳气之口逢病煞之星，宜以金属器物、明亮洁净调之，不宜闭锁不用。');
      else yi.push('向首得 ' + starFull(yToChao) + '（' + XK.XING_LUCK[yToChao] + '），纳气尚可用。');

      return {
        year: year, month: month, yun: yun,
        yCenter: yCenter, yGrid: yGrid, mCenter: mCenter, mGrid: mGrid,
        zuo: SHAN[zi], chao: SHAN[ci], zuoGong: zuoGong, chaoGong: chaoGong,
        zuoGua: zuoGua, chaoGua: chaoGua,
        wang: wang, sheng: sheng, tui: tui,
        yToChao: yToChao, yToZuo: yToZuo, mToChao: mToChao, mToZuo: mToZuo,
        wu5: whereIs(yGrid, 5), er2: whereIs(yGrid, 2),
        wangWhere: whereIs(yGrid, wang),
        mWu5: mGrid ? whereIs(mGrid, 5) : '', mEr2: mGrid ? whereIs(mGrid, 2) : '',
        yRaw: XK.yearStar(year), mRaw: month > 0 ? XK.monthStar(year, month) : 0,
        points: points, yi: yi, ji: ji
      };
    },

    view(d) {
      const gridCells = (grid, center) => {
        const map = {};
        for (let g = 1; g <= 9; g++) {
          const star = grid[g];
          if (g === 5) continue;
          const mark = (star === 5 || star === 2) ? '　<b>慎</b>' : (star === d.wang ? '　<b>旺</b>' : '');
          map[g] = {
            html: U.cell({
              gong: C.GONG_NAME[g] + ' · ' + C.GONG_DIR[g],
              main: starName(star),
              sub: U.wx(XK.XING_WX[star], XK.XING_WX[star]) + ' · ' + XK.XING_LUCK[star] + mark
            })
          };
        }
        return U.grid9(map, U.cell({
          gong: '中五宫',
          main: starName(center),
          sub: U.wx(XK.XING_WX[center], XK.XING_WX[center]) + ' · 入中'
        }));
      };

      const full = U.table(['宫位', '方位', '九星', '五行', '吉凶', '当旺 / 提示'],
        [1, 2, 3, 4, 5, 6, 7, 8, 9].map(g => {
          const s = d.yGrid[g];
          const tip = s === d.wang ? '当旺之星，宜常用常动' : (s === 5 ? '五黄大凶，宜静不宜动' :
            (s === 2 ? '二黑病符，宜洁宜通风' : (XK.XING_LUCK[s] === '吉' ? '吉星，宜整洁引气' : '凶星，宜安静调之')));
          return { cells: [C.GONG_NAME[g], C.GONG_DIR[g], starFull(s), U.wx(XK.XING_WX[s], XK.XING_WX[s]), XK.XING_LUCK[s], tip], cls: (s === d.wang || s === 5 || s === 2) ? 'hi' : '' };
        }), { align: ['l', 'c', 'c', 'c', 'c', 'l'] });

      const monthPart = d.mGrid
        ? U.card('月飞星九宫（' + d.month + '月 · ' + starFull(d.mCenter) + '入中）', gridCells(d.mGrid, d.mCenter) +
          U.p('月星逐月逆退一位：正月入中星依年支定（子午卯酉年八白、辰戌丑未年五黄、寅申巳亥年二黑），二月起即退一位。') +
          (d.mRaw === d.mCenter ? U.note('本月入中星与引擎 C.XUANKONG.monthStar 所得一致（' + d.mRaw + '）。')
            : U.note('本月入中星本页作 ' + d.mCenter + '，引擎 C.XUANKONG.monthStar(' + d.year + ',' + d.month + ') 作 ' + d.mRaw +
              '；差别在逐月顺逆，本页依《阳明按索》「并逆布」作逆退。', true)))
        : U.note('未排月星。若需流月盘，请在上方选择农历月。');

      return U.resHead(d.year + ' 年飞星 · ' + starFull(d.yCenter) + '入中', '玄空飞星 · ' + d.yun.yuan + d.yun.k + '运') +
        U.card('三元九运', U.kv([
          ['本年所属', d.yun.yuan + '第' + d.yun.k + '运（' + d.yun.start + '–' + d.yun.end + ' 年）'],
          ['三元', '上元一、二、三运；中元四、五、六运；下元七、八、九运，共一百八十年'],
          ['当旺之星', starFull(d.wang) + '（当元得令，宜用宜动）'],
          ['生气之星', starFull(d.sheng) + '（未来之旺，宜留意）'],
          ['退气之星', starFull(d.tui) + '（刚退之运，气已过）'],
          ['年星出处', '本页作 ' + starFull(d.yCenter) + ' 入中；引擎 C.XUANKONG.yearStar(' + d.year + ') 得 ' + d.yRaw +
            (d.yRaw === d.yCenter ? '，与通行口诀一致。' : '，其锚为 2000 年七赤入中，与通行口诀「上元甲子一白起」相差二位，本页已校正。')]
        ])) +
        U.card('年飞星九宫（' + d.year + ' 年 · ' + starFull(d.yCenter) + '入中）', gridCells(d.yGrid, d.yCenter) +
          U.note('图以南上北下：上排巽四·离九·坤二，中排震三·中五·兑七，下排艮八·坎一·乾六。' +
            '宫中标「旺」者为当旺之星，「慎」者为五黄、二黑。')) +
        U.card('年星逐宫详表', full) +
        monthPart +
        U.card('五黄 · 二黑 提示', U.kv([
          ['五黄（廉贞）', '本年到 ' + d.wu5 + '；' + (d.mWu5 ? '本月到 ' + d.mWu5 + '。' : '') + '五行属土，其性最烈，宜静不宜动，宜泄不宜克（金泄土）。'],
          ['二黑（巨门）', '本年到 ' + d.er2 + '；' + (d.mEr2 ? '本月到 ' + d.mEr2 + '。' : '') + '五行属土，谓之病符，宜通风采光、洁净安静。'],
          ['调法大意', '二星皆土，宜以金属器物（铜铃、铜钱、铜葫芦之类）泄其土气，取其「贪生忘克」之意；忌以火助之（火生土），忌大动土木。'],
          ['当旺之星', starFull(d.wang) + ' 本年到 ' + d.wangWhere + '，此方宜常用常动。']
        ])) +
        U.card('坐向参断（坐' + d.zuo + '山 · 朝' + d.chao + '向）', U.kv([
          ['朝向宫位', d.chaoGua + '宫（' + C.GONG_NAME[d.chaoGong] + '）　年星到向：' + starFull(d.yToChao) + '（' + XK.XING_LUCK[d.yToChao] + '）' + (d.mGrid ? '　月星到向：' + starFull(d.mToChao) : '')],
          ['坐山宫位', d.zuoGua + '宫（' + C.GONG_NAME[d.zuoGong] + '）　年星到坐：' + starFull(d.yToZuo) + '（' + XK.XING_LUCK[d.yToZuo] + '）' + (d.mGrid ? '　月星到坐：' + starFull(d.mToZuo) : '')]
        ]) + U.ul(d.points)) +
        U.card('白话结论：宜与忌', U.ul(d.yi.concat(d.ji))) +
        U.card('术语小释', U.kv([
          ['三元九运', '上、中、下三元各三运，每运二十年，共一百八十年；1864 年甲子为上元一运之始。'],
          ['九星', '一白贪狼至九紫右弼，配洛书九宫；五行、吉凶各有别，以当运者为旺。'],
          ['入中', '某星飞入中宫，为该盘之主，余星依洛书次序顺飞八方。'],
          ['五黄', '廉贞，五行属土，九星中最烈之凶，宜静不宜动，宜泄不宜克。'],
          ['二黑', '巨门，五行属土，谓之病符，宜通风采光、洁净安静。'],
          ['山星 · 向星', '玄空宅命盘中，由坐山与朝向所飞得之星，与运盘合为「宅命盘」；本页未排。'],
          ['当旺 · 生气 · 退气', '当运之星为旺，未来一运之星为生气，刚过之运之星为退气。']
        ])) +
        U.note('本页为简化演示：只排年月飞星（年月紫白），不排运盘与山向飞星，故不能据以论一宅之吉凶，' +
          '亦未涉兼向、替卦、入囚、七星打劫诸法；月星按农历月，未作节气换月。' +
          '又本页飞星次序用洛书顺飞（中→乾→兑→艮→离→坎→坤→震→巽），与前之 2024 年通行年盘相合' +
          '（三碧入中、五黄到正西、二黑到东南）。引擎 C.QIMEN.feiXing 以宫号序给出星序、' +
          'C.XUANKONG.yearStar 以 2000 年七赤入中为锚、C.XUANKONG.monthStar 逐月顺加，皆与上述通行之法有别；' +
          '本页已分别归位、校正与改逆，并作自检：若引擎日后改从通行口诀，本页即自动不再校正（详见「年星出处」一行）。' +
          '所本者为上元甲子一白起之年星口诀，与《阳明按索》「并逆布」之月星口诀，读者知其所本可也。', true) +
        U.disclaim('玄空断语为参考白话，非古籍原文；九星吉凶随运而变，流派异说亦多，不作营造、置业、投资之凭据。');
    }
  });
})();
