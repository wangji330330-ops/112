/* ============================================================
   太乙神数（乾 · 天，order 2）
   体系参考：唐·王希明《太乙金镜式经》所传「太乙行九宫、主客分算」之说。
   凡异说纷纭、本站不能确证者，皆于页面明写「简化演示」并声明所用约定，
   不以臆造之公式冒充古法。
   ============================================================ */
(function () {
  'use strict';
  const C = window.CORE, U = C.UI, G = C.GZ;

  /* ---------- 本站约定之常数（页面各处均有声明） ---------- */
  const ANCHOR = -2697;                     // 上元甲子：公元前 2697 年（通行黄帝纪元元年），本站约定
  const SEQ8 = [1, 2, 3, 4, 6, 7, 8, 9];    // 顺行九宫之序（洛书宫序，不入中五宫）
  const SHEN16 = (C.TAIYI_SHEN || []).slice();
  const SHEN16_POS = ['子', '丑', '艮', '寅', '卯', '辰', '巽', '巳', '午', '未', '坤', '申', '酉', '戌', '乾', '亥'];
  const WEI_GONG = { 艮: 8, 巽: 4, 坤: 2, 乾: 6 };   // 四维所寄之宫
  /* tables.js 未载时之后备（core 数据，不修改 core） */
  const ZHI_GONG = C.ZHI_GONG || { 0: 1, 1: 8, 2: 8, 3: 3, 4: 4, 5: 4, 6: 9, 7: 2, 8: 2, 9: 7, 10: 6, 11: 6 };

  /* 以宫之五行论宜忌（本站白话，不作断言） */
  const WX_JUE = {
    木: { yi: '谋始、生发、树人之事', ji: '躁进、越次而求' },
    火: { yi: '明察、宣示、辨物之事', ji: '燥烈、争竞相激' },
    土: { yi: '守成、蓄聚、安众之事', ji: '滞塞、固执不通' },
    金: { yi: '决断、正名、整肃之事', ji: '刚戾、苛细伤和' },
    水: { yi: '谋虑、藏用、涉远之事', ji: '陷溺、隐欺自困' }
  };
  /* 主客算奇偶之组合（论其缓急，本站白话读法） */
  const COMBO = {
    '奇奇': '主客皆得阳算，两数俱急，宜速决于一局，忌久拖生变。',
    '奇偶': '主得阳算、客得阴算：主数急而客数缓，宜先发以速，忌迟疑坐失。',
    '偶奇': '主得阴算、客得阳算：主数缓而客数急，宜后应待机，忌抢先躁动。',
    '偶偶': '主客皆得阴算，两数俱缓，宜守静徐图、渐进有为，忌躁动强求。'
  };

  /* ---------- 小工具 ---------- */
  function parseDT(s) {
    const m = String(s === undefined || s === null ? '' : s)
      .match(/^\s*(\d{4})-(\d{1,2})-(\d{1,2})(?:[T ](\d{1,2}):(\d{1,2}))?/);
    if (!m) return null;
    const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), Number(m[4] || 0), Number(m[5] || 0));
    return isNaN(d.getTime()) ? null : d;
  }
  function step8(k) { return SEQ8[((k % 8) + 8) % 8]; }
  function gongWx(g) {
    const b = C.GUA_BY_NAME[C.GONG_GUA[g]];
    return b ? b.wx : '土';
  }
  function shenGong(pos) {
    if (WEI_GONG[pos] !== undefined) return WEI_GONG[pos];
    const z = C.ZHI.indexOf(pos);
    return z < 0 ? 5 : (ZHI_GONG[z] || 5);
  }
  function oddTxt(n) { return n % 2 === 1 ? '奇 · 阳' : '偶 · 阴'; }
  function gongFull(g) { return C.GONG_NAME[g] + '（' + C.GONG_DIR[g] + ' · ' + gongWx(g) + '）'; }

  /* ---------- 盘面 ---------- */
  function buildGrid(d) {
    const marks = {};
    const put = (g, t) => { if (g >= 1 && g <= 9) (marks[g] = marks[g] || []).push(t); };
    put(d.taiyi.gong, '太乙');
    put(d.wenchang.gong, '文昌');
    put(d.shiji.gong, '始击');
    put(d.jishen.gong, '计神');
    put(d.zhuDa.gong, '主大将');
    put(d.zhuCan.gong, '主参将');
    put(d.keDa.gong, '客大将');
    put(d.keCan.gong, '客参将');
    const map = {};
    for (let g = 1; g <= 9; g++) {
      const b = C.GUA_BY_NAME[C.GONG_GUA[g]];
      const mk = marks[g] || [];
      map[g] = {
        html: U.cell({
          gong: C.GONG_NAME[g] + ' · ' + C.GONG_DIR[g],
          main: C.GONG_GUA[g] + (b ? ' ' + b.symbol : ''),
          sub: mk.length ? mk.map(x => '<b>' + x + '</b>').join(' ') : '—'
        })
      };
    }
    return U.grid9(map, U.cell({ gong: '中五宫', main: '太乙不入', sub: '九宫之枢 · 寄用而已' }));
  }

  /* ---------- 登记 ---------- */
  /* 用 window.ART 调用：浏览器中与裸 ART 等价，且便于 CONTRACT 第七节之 node 冒烟测试 */
  window.ART({
    id: 'taiyi',
    name: '太乙神数',
    alias: ['太乙', '太乙数', '太乙九宫'],
    gua: 'qian',
    order: 2,
    tagline: '太乙九宫 · 主客算数，推国家世运与大事吉凶，三式之一。',

    intro: `
      <p>太乙神数，简称太乙，与奇门遁甲、大六壬并称「三式」。其法以太乙为北极之神，行于九宫，考其临御之宫、主客之算、八将之位，以观世运之升降、兵争之胜负、水旱年谷之丰歉。今存最要之典，为唐·王希明《太乙金镜式经》；此外《太乙统宗宝鉴》《太乙淘金歌》诸家互异，法门之繁，为三式之最。</p>
      <p>其盘以洛书九宫为体：太乙行于中宫之外八宫，岁计三年一移，二十四年而周天（此为通行一说，本站即取以为约定，详见盘面下注）；所临之宫，皆系吉凶。又配十六神、文昌、始击、计神与主客大将、参将：主算以主我，客算以主彼，算有奇偶，单为阳、双为阴，阳算主迅进，阴算主迟滞，合而观之，而后论其缓急先后。</p>
      <p>与奇门相较：奇门以时计，重在方隅动作之趋避；太乙以岁计为宗，重在世运大势之推迁。二式同用九宫，而一岁一时，各有所主。本站所排为岁计一盘，所示者为「势」而非「命」；读者取为观势之借镜可也，勿执以定人事之成败。</p>`,

    method: `
      <p>本页以太乙「岁计」为主：填入公历年份，即自本站约定之上元甲子起算太乙积年，得太乙所临之宫，再依本站之简化约定布八将、定主客算。另填起课时刻，用以取四柱干支，为盘中参照。</p>
      <p>凡异说纷纭、本站不能确证之处（上元起算、太乙行宫之迟速顺逆、主客算之取数、文昌始击计神之定法、十六神之方位），皆于对应区块以「简化演示」标出，并写明所用约定。读者须知：此盘为一家之约定排法，非古法定式；欲究古法，当求原书与专精之师。</p>`,

    form: [
      { name: 'year', label: '起课年份（公历）', type: 'number', min: 1, max: 9999, step: 1, value: new Date().getFullYear(), hint: '本站以年份起「岁计」' },
      { name: 'dt', label: '起课时刻（取四柱为参照）', type: 'datetime-local', value: U.nowStr(), wide: true },
      { name: 'q', label: '所问（可选）', type: 'text', placeholder: '如：今年大势如何', wide: true }
    ],

    cast(input) {
      const y = Number(String(input.year === undefined || input.year === null ? '' : input.year).trim());
      if (!isFinite(y) || y !== Math.floor(y) || y < 1 || y > 9999) {
        return { error: '请输入 1 至 9999 之间的公历年份' };
      }
      const dt = parseDT(input.dt);
      if (!dt) return { error: '起课时刻格式有误，请用「2024-05-01T13:00」之式' };
      const q = String(input.q === undefined || input.q === null ? '' : input.q).trim();

      /* 1. 太乙积年 */
      const N = y - ANCHOR;                       // 积年（自本站约定之上元甲子起算）
      const jiGZ = G.gzName((N - 1) % 60);        // 积年干支
      const step = Math.floor((N - 1) / 3);       // 岁计三年移一宫
      const turn = Math.floor((N - 1) / 24);      // 已周之数

      /* 2. 太乙与八将所临之宫（皆依 SEQ8 步进，此为本站约定） */
      const tg = step8(step);
      const wenchang = step8(step + 3);
      const shiji = step8(step + 4);
      const zhuDa = step8(step + 1), zhuCan = step8(step + 2);
      const keDa = step8(step + 7), keCan = step8(step + 6);

      /* 3. 计神：十六神环上依积年取位（本站约定） */
      const jiIdx = ((N - 1) % 16 + 16) % 16;
      const jiName = SHEN16[jiIdx] || '—';
      const jiPos = SHEN16_POS[jiIdx] || '—';
      const jiGong = shenGong(jiPos);

      /* 4. 主客之算（三宫宫数之和，本站约定） */
      const zhuSuan = tg + wenchang + zhuDa;
      const keSuan = tg + shiji + keDa;
      const he = zhuSuan + keSuan;
      const diff = Math.abs(zhuSuan - keSuan);
      const zhuOdd = zhuSuan % 2 === 1, keOdd = keSuan % 2 === 1;
      const comboKey = (zhuOdd ? '奇' : '偶') + (keOdd ? '奇' : '偶');

      /* 5. 四柱（参照） */
      const P = G.fourPillars(dt);

      /* 6. 白话断语（本站参考语，克制不下断言） */
      const wx = gongWx(tg);
      const jj = WX_JUE[wx] || WX_JUE['土'];
      const jue = [];
      jue.push('太乙临' + C.GONG_NAME[tg] + '（属' + wx + '，' + C.GONG_DIR[tg] + '方），为一岁大势所寄：宜于' + jj.yi + '，而忌' + jj.ji + '。');
      jue.push(COMBO[comboKey]);
      jue.push(zhuSuan > keSuan
        ? '主算之数多于客算，主势偏强，宜固本而后动、以我为主；势强易骄，仍须留余。'
        : (zhuSuan < keSuan
          ? '客算之数多于主算，客势偏强，宜静以待动、后应而发；先动者未必得利。'
          : '主客算齐，两势相当，胜负未分，宜守中持平，忌偏执一偏。'));
      jue.push('太乙居' + (tg % 2 === 1 ? '阳宫（宫数为奇），势偏刚动，宜明断而速' : '阴宫（宫数为偶），势偏柔静，宜深谋而缓') + '（此以临宫言之，与算数之缓急各为一层，宜合观而取中）。');
      jue.push('算和' + he + '、算差' + diff + '：' + (diff <= 2
        ? '两算相去不远，主客相持，事在几微之间，宜细察而后动。'
        : '两算相去稍远，强弱之分较显，宜审其向背而取舍。'));
      jue.push('计神临' + jiPos + '位（' + jiName + '），为谋议之方；凡筹画、计虑之事，可借此方位为思虑之所，不必拘泥。');

      const lines = [
        ['太乙积年', String(N) + ' 年（积年干支 ' + jiGZ + '）'],
        ['上元甲子', '公元前 2697 年（本站约定，见下注）'],
        ['太乙所临', gongFull(tg)],
        ['已周之数', '第 ' + (turn + 1) + ' 周（二十四年一周天）'],
        ['主算 / 客算', zhuSuan + '（' + oddTxt(zhuSuan) + '） / ' + keSuan + '（' + oddTxt(keSuan) + '）'],
        ['算和 / 算差', he + ' / ' + diff],
        ['计神', jiPos + '位 · ' + jiName + '（寄' + C.GONG_NAME[jiGong] + '）'],
        ['四柱参照', P.year.name + '年 ' + P.month.name + '月 ' + P.day.name + '日 ' + P.hour.name + '时']
      ];

      const d = {
        head: '太乙临' + C.GONG_NAME[tg],
        sub: '太乙神数 · 岁计（' + P.year.name + '年）',
        q: q,
        year: y, N: N, jiGZ: jiGZ, turn: turn, step: step,
        taiyi: { gong: tg, name: C.GONG_NAME[tg], gua: C.GONG_GUA[tg], dir: C.GONG_DIR[tg], wx: wx },
        wenchang: { gong: wenchang, name: C.GONG_NAME[wenchang], dir: C.GONG_DIR[wenchang] },
        shiji: { gong: shiji, name: C.GONG_NAME[shiji], dir: C.GONG_DIR[shiji] },
        zhuDa: { gong: zhuDa, name: C.GONG_NAME[zhuDa], dir: C.GONG_DIR[zhuDa] },
        zhuCan: { gong: zhuCan, name: C.GONG_NAME[zhuCan], dir: C.GONG_DIR[zhuCan] },
        keDa: { gong: keDa, name: C.GONG_NAME[keDa], dir: C.GONG_DIR[keDa] },
        keCan: { gong: keCan, name: C.GONG_NAME[keCan], dir: C.GONG_DIR[keCan] },
        jishen: { idx: jiIdx, name: jiName, pos: jiPos, gong: jiGong, gongName: C.GONG_NAME[jiGong] },
        zhuSuan: zhuSuan, keSuan: keSuan, he: he, diff: diff,
        zhuOdd: zhuOdd, keOdd: keOdd, comboJue: COMBO[comboKey],
        pillars: P, jue: jue, lines: lines
      };
      return d;
    },

    view(d) {
      let out = U.resHead(d.head, d.sub);
      if (d.q) out += U.note('所问：' + U.esc(d.q));

      /* 盘面 */
      out += U.sec('太乙岁计盘',
        U.card('九宫盘面', buildGrid(d)) +
        U.note('宫中红字为太乙、文昌、始击、计神与主客大将、参将所临之位；中五宫为太乙所不入，仅作九宫之枢。') +
        U.note('盘面排法（本站约定，属简化演示）：太乙自坎一宫起，依洛书宫序「一→二→三→四→六→七→八→九」顺行八宫，不入中五宫，岁计三年移一宫、二十四年一周天。古法另有岁计／月计／日计／时计之别，顺逆与迟速亦多异说，本站只用岁计一种，非古法定式。', true));

      /* 主客之算 */
      out += U.sec('主客之算',
        U.card('算数', U.kv([
          ['主算', d.zhuSuan + '（' + oddTxt(d.zhuSuan) + '）'],
          ['客算', d.keSuan + '（' + oddTxt(d.keSuan) + '）'],
          ['算和', String(d.he)],
          ['算差', String(d.diff)]
        ])) +
        U.note(d.comboJue) +
        U.note('取算之法（本站约定，属简化演示）：主算＝太乙宫数＋文昌宫数＋主大将宫数，客算＝太乙宫数＋始击宫数＋客大将宫数；单为阳、双为阴。太乙古法之算数尚有三基、五福、十精及「算和」诸说，取数各异，本站不复详列，读者勿以此为古法原式。', true));

      /* 八将与方位 */
      out += U.sec('八将与方位',
        U.card('所临之宫', U.table(['位', '所临之宫', '方位'], [
          ['太乙', d.taiyi.name, d.taiyi.dir],
          ['文昌', d.wenchang.name, d.wenchang.dir],
          ['始击', d.shiji.name, d.shiji.dir],
          ['计神', d.jishen.gongName, C.GONG_DIR[d.jishen.gong]],
          ['主大将', d.zhuDa.name, d.zhuDa.dir],
          ['主参将', d.zhuCan.name, d.zhuCan.dir],
          ['客大将', d.keDa.name, d.keDa.dir],
          ['客参将', d.keCan.name, d.keCan.dir]
        ], { align: ['l', 'l', 'l'] })) +
        U.note('文昌、始击之取法（本站约定，属简化演示）：文昌在太乙顺行第三宫（太乙之辅），始击在太乙对宫（顺行第四宫，太乙之敌）。主大将、主参将居太乙顺行第一、第二宫，客大将、客参将居太乙逆行第一、第二宫。古法八将各有专名与定位之法（如「主大将起于太乙」一类口诀），传本互异，本站不能确证，故以步宫取位为简化演示。', true));

      /* 十六神 */
      const shen = [];
      for (let i = 0; i < SHEN16.length && i < SHEN16_POS.length; i++) {
        shen.push({ t: SHEN16_POS[i] + '·' + SHEN16[i], sel: i === d.jishen.idx });
      }
      out += U.sec('太乙十六神',
        U.card('十六神方位', U.chips(shen) +
          U.note('当值计神：' + d.jishen.pos + '位 · ' + d.jishen.name + '（寄' + d.jishen.gongName + '）。') +
          U.note('十六神者，布于十二支与乾、艮、巽、坤四维共十六位。本站依「地主起子，顺布十二支与四维」之序，与本站数据表所列名次相配（子·地主、丑·阳德、艮·和德、寅·吕申……亥·大义）；计神则于十六神环上依太乙积年取位，一岁一位。此二事古说最为纷歧，本站所列为一家之简化演示，非定论。', true)));

      /* 断语 */
      out += U.sec('白话断语',
        U.card('盘意', U.ul(d.jue)) +
        U.card('盘面要目', U.kv(d.lines)) +
        U.note('以上断语为本站依盘面结构所作之参考白话（非古籍原文），以「倾向／宜／忌」言之，不下成败死生之断。'));

      /* 术语 */
      out += U.sec('术语小释',
        U.card('太乙术语', U.kv([
          ['太乙', '北极之神，行于九宫而不入中宫，三式之一以此为主，故名太乙。'],
          ['积年', '自上元甲子起算之年数，为太乙诸数之本；上元取法古今不一。'],
          ['主客算', '主算主我、客算主彼；以九宫宫数为算，单为阳、双为阴，阳主迅进、阴主迟滞。'],
          ['八将', '太乙、文昌、始击、计神、主大将、主参将、客大将、客参将，为盘中之要位。'],
          ['十六神', '布于十二支与四维之十六位，太乙以此分方位之吉凶，自地主至大义。'],
          ['计神', '一岁计谋之神，主谋议筹画之方，与太乙积年相系。']
        ])));

      out += U.disclaim('本页太乙盘为岁计之简化演示，非古法定式；盘面之「势」不等于人事之必然。');
      return out;
    }
  });
})();
