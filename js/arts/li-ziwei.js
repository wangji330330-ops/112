/* 紫微斗数 —— 十二宫 · 十四主星 · 五行局 · 四化飞星（需农历生日，本站不做公历换算） */
(function () {
  'use strict';
  const C = window.CORE, U = C.UI, G = C.GZ;

  /* 地支 → 十二宫盘中的格位（巳午未申 / 辰…酉 / 卯…戌 / 寅丑子亥，中宫占 2×2） */
  const BOARD = [5, 6, 7, 8, 4, 'C', 9, 3, 10, 2, 1, 0, 11];

  /* 四化之名与白话（编者自撰之参考语） */
  const HUA = [
    { k: '禄', y: '主财禄、机缘与顺遂之应。' },
    { k: '权', y: '主权柄、担当与进取之应。' },
    { k: '科', y: '主名声、文书与清誉之应。' },
    { k: '忌', y: '主牵绊、耗神与波折之应，宜守分缓图。' }
  ];
  const PALACE_GOV = {
    命宫: '一身之枢，主禀赋、意志与一生之趋向。',
    兄弟: '主同气、同侪与协力之事。',
    夫妻: '主配偶、配合与内外之和。',
    子女: '主子女、下属与所育之事。',
    财帛: '主财用、经营与得失之倾向。',
    疾厄: '主身体强弱、劳逸与调养（不作病名之断）。',
    迁移: '主出行、迁动与在外之遇。',
    交友: '主朋友、部属与相助之人。',
    官禄: '主事业、名位与任事之途。',
    田宅: '主居处、家业与内顾之事。',
    福德: '主福分、性情之乐与精神所寄。',
    父母: '主长辈、庇荫与所受之教。'
  };
  /* 辅星五行（C.ZIWEI.MAIN 只收十四主星，辅星之五行另列于此） */
  const AUX_WX = {
    禄存: '土', 擎羊: '金', 陀罗: '金', 文昌: '金', 文曲: '水',
    左辅: '土', 右弼: '水', 火星: '火', 铃星: '火', 地空: '火', 地劫: '火'
  };

  window.ART({
    id: 'ziwei',
    name: '紫微斗数',
    alias: ['紫微斗数全书', '十八飞星', '紫微命盘'],
    gua: 'li',
    order: 2,
    tagline: '十二宫十四主星 · 命身二宫、五行局、四化飞星',

    intro: `
      <p>紫微斗数相传出于五代宋初陈抟（希夷）一派，明《紫微斗数全书》为传世之要籍，
      与子平八字并行而为命理两大宗。其法以人出生之年、月、日、时安十二宫、布诸星：
      命宫、兄弟、夫妻、子女、财帛、疾厄、迁移、交友、官禄、田宅、福德、父母，
      如天之十二次，各主一事。</p>
      <p>其纲领有三：一曰<em>命身二宫</em>——命宫主先天禀赋，身宫主后天作为；
      二曰<em>五行局</em>——由命宫干支之纳音定水二、木三、金四、土五、火六局，
      局数既为安紫微之本，亦为大限起运之数；三曰<em>四化</em>——以生年天干飞禄、权、科、忌，
      看何星化入何宫，为全局之枢机。十四主星之中，紫微系逆行、天府系顺行，
      两系相对而布，遂成一百四十四种基本盘式。</p>
      <p>本页依《全书》所载口诀安星：命身二宫由农历月与生时定，紫微由五行局与农历日定，
      天府与紫微相对，其余主星依偏移安之；辅星取禄存、擎羊、陀罗、文昌、文曲、左辅、右弼、
      地空、地劫、火铃，年干四化并用。凡本站自定之约定与简化，皆于页内注明。</p>`,

    method: `
      <p>紫微斗数须用<strong>农历</strong>生日。本站不作公历与农历之换算，请先自行查得农历之
      年、月、日，再于表中直选：生年干支（如 1990 年为庚午）、农历月、农历日、出生时辰。</p>
      <p>按"排盘"即得十二宫之盘：每宫列宫名、宫干、主星、辅星、四化与大限起止；
      命宫以朱色标出，身宫另注。宫干以五虎遁由生年干起（寅宫起干同八字之法），
      闰月按本月计，不作折月。盘下另有白话解读与十二宫详表。</p>`,

    form: [
      { name: 'yearGZ', label: '生年干支（农历年）', type: 'select', options: (function () {
          const a = [];
          for (let i = 0; i < 60; i++) a.push({ v: G.gzName(i), t: G.gzName(i) + '（' + C.SHENGXIAO[i % 12] + '）' });
          return a;
        })(), value: '甲子', hint: '如 1990 年为庚午' },
      { name: 'lunarMonth', label: '农历月', type: 'select', options: U.lunarMonths(), value: '1' },
      { name: 'lunarDay', label: '农历日', type: 'select', options: U.lunarDays(), value: '1' },
      { name: 'hour', label: '出生时辰', type: 'select', options: C.hourOptions(), value: '0' },
      { name: 'gender', label: '性别', type: 'chips', options: [{ v: '男', t: '男' }, { v: '女', t: '女' }], value: '男', hint: '定大限顺逆（阳男阴女顺行）' }
    ],

    cast(input) {
      const Z = C.ZIWEI;
      if (!Z) return { error: '核心表未载入：js/core/tables.js 未在 index.html 中引入，紫微斗数暂无法排盘。' };

      const ygz = String(input.yearGZ || '甲子');
      const yi = G.gzIndex(ygz.charAt(0), ygz.charAt(1));
      const yearGan = G.GAN[yi % 10], yearZhi = G.ZHI[yi % 12];
      const month = Math.min(12, Math.max(1, Number(input.lunarMonth) || 1));
      const day = Math.min(30, Math.max(1, Number(input.lunarDay) || 1));
      const hidx = (((Number(input.hour) || 0) % 12) + 12) % 12;

      /* ---------- 命宫 / 身宫 ---------- */
      const ms = Z.mingShen(month, hidx);
      const ming = ms.ming, shen = ms.shen;

      /* ---------- 宫干：五虎遁，由生年干起寅宫 ---------- */
      const yinGan = ((yi % 10) % 5) * 2 + 2;
      const ganAt = (zi) => G.GAN[(yinGan + ((((zi - 2) % 12) + 12) % 12)) % 10];

      /* ---------- 五行局：由命宫干支之纳音 ---------- */
      const mingGZ = G.gzIndex(ganAt(ming), G.ZHI[ming]);
      const mingNayin = G.nayin(mingGZ);
      const juWx = mingNayin.charAt(mingNayin.length - 1);
      const ju = Z.WXJU[juWx] || Z.WXJU['水'];

      /* ---------- 安紫微、天府 ---------- */
      const ziwei = Z.ziweiPos(ju.n, day);
      const tianfu = Z.tianfuPos(ziwei);

      /* ---------- 布十四主星 ---------- */
      const stars = [];
      for (let i = 0; i < 12; i++) stars.push([]);
      const put = (name, pos, kind) => stars[((pos % 12) + 12) % 12].push({ name, kind });
      Z.SERIES.forEach(s => put(s[0], ziwei - s[1], 'main'));          // 紫微系逆行
      Z.TIANFU_SERIES.forEach(s => put(s[0], tianfu + s[1], 'main'));  // 天府系顺行

      /* ---------- 十二宫名：由命宫起逆布 ---------- */
      const palaceOf = [];
      Z.PALACES.forEach((nm, i) => { palaceOf[((ming - i) % 12 + 12) % 12] = nm; });

      /* ---------- 安辅星 ---------- */
      const ZHIIDX = (z) => C.ZHI.indexOf(z);
      const luPos = ZHIIDX(Z.LUCUN[yearGan]);
      put('禄存', luPos, 'aux');
      put('擎羊', luPos + 1, 'aux');      // 禄前一位
      put('陀罗', luPos - 1, 'aux');      // 禄后一位
      Z.HOUR_STARS.forEach(s => put(s.name, ZHIIDX(s.start) + s.dir * hidx, 'aux'));
      Z.MONTH_STARS.forEach(s => put(s.name, ZHIIDX(s.start) + s.dir * (month - 1), 'aux'));
      const hl = Z.HUO_LING_START[yearZhi];
      if (hl) { put('火星', ZHIIDX(hl[0]) + hidx, 'aux'); put('铃星', ZHIIDX(hl[1]) + hidx, 'aux'); }

      /* ---------- 四化：生年干飞禄权科忌 ---------- */
      const sihua = Z.SIHUA[yearGan] || [];
      const huaList = [];
      sihua.forEach((starName, i) => {
        const k = HUA[i].k;
        for (let z = 0; z < 12; z++) {
          const st = stars[z].find(s => s.name === starName);
          if (st) {
            st.hua = k;
            huaList.push({ hua: k, star: starName, zi: z, zhi: C.ZHI[z], palace: palaceOf[z], yi: HUA[i].y });
            break;
          }
        }
      });

      /* ---------- 大限：局数起运，阳男阴女顺行，阴男阳女逆行 ---------- */
      const yang = C.GAN_YY[yi % 10] === 1;
      const male = (input.gender || '男') === '男';
      const dir = ((yang && male) || (!yang && !male)) ? 1 : -1;
      const limitOf = [];
      for (let i = 0; i < 12; i++) {
        limitOf[((ming + dir * i) % 12 + 12) % 12] = (ju.n + i * 10) + '–' + (ju.n + i * 10 + 9);
      }

      /* ---------- 命主 / 身主 ---------- */
      const mingZhu = Z.MINGZHU[G.ZHI[ming]], shenZhu = Z.SHENZHU[yearZhi];

      /* ---------- 白话解读 ---------- */
      const mainOf = (z) => stars[z].filter(s => s.kind === 'main');
      const nameOf = (z) => mainOf(z).map(s => s.name);
      const mingMain = nameOf(ming);
      const opp = (ming + 6) % 12;
      const sanFang = [ming, (ming + 4) % 12, (ming + 8) % 12, opp].filter((v, i, a) => a.indexOf(v) === i);

      const jie = [];
      if (mingMain.length) {
        jie.push('命宫在' + C.ZHI[ming] + '，主星为' + mingMain.join('、') + '。' +
          mingMain.map(n => n + '：' + (Z.MAIN[n] ? Z.MAIN[n].xing : '')).join(''));
      } else {
        jie.push('命宫在' + C.ZHI[ming] + '，本宫无主星（空宫）。古法看对宫（迁移）之星以为用：' +
          (nameOf(opp).length ? nameOf(opp).join('、') : '对宫亦无主星，当并看三方之星与四化。') + '。');
      }
      jie.push('身宫在' + C.ZHI[shen] + '，属' + palaceOf[shen] + (palaceOf[shen] === '命宫' ? '' : '宫') +
        (shen === ming ? '（命身同宫，先后天之事多由一己之力做成）' : '') +
        '。' + (PALACE_GOV[palaceOf[shen]] || '') + '身宫所示者，为后天用力之处。');
      jie.push('三方四正（命宫、财帛、官禄及迁移）所会主星：' +
        sanFang.map(z => C.ZHI[z] + '宫' + (nameOf(z).length ? '（' + nameOf(z).join('、') + '）' : '（无主星）')).join('、') + '。');
      huaList.forEach(h => {
        jie.push('生年干' + yearGan + '化' + h.hua + '：' + h.star + '在' + h.zhi + '宫（' + h.palace + '宫）。' + h.yi);
      });
      if (nameOf(ming).indexOf('紫微') >= 0) jie.push('紫微入命，古谓"帝座"，主自尊而能任事；宜以谦和济其孤高。');
      if (nameOf(ming).indexOf('天机') >= 0) jie.push('天机入命，主善谋多思，宜以静制动，忌虑多而少决。');

      /* ---------- 十二宫详表 ---------- */
      const rows = [];
      for (let i = 0; i < 12; i++) {
        const z = ((ming - i) % 12 + 12) % 12;
        const m = stars[z].filter(s => s.kind === 'main').map(s => s.name + (s.hua ? '化' + s.hua : ''));
        const a = stars[z].filter(s => s.kind === 'aux').map(s => s.name + (s.hua ? '化' + s.hua : ''));
        const marks = [];
        if (z === ming) marks.push('命');
        if (z === shen) marks.push('身');
        rows.push({
          cells: [Z.PALACES[i] + (marks.length ? '（' + marks.join('·') + '）' : ''), C.ZHI[z], ganAt(z),
            m.length ? m.join('　') : '（空宫）', a.length ? a.join('　') : '—', limitOf[z], PALACE_GOV[Z.PALACES[i]]],
          cls: z === ming ? 'hi' : ''
        });
      }

      /* 农历月日之汉字名（取自 UI 之下拉项，供显示） */
      const mLabel = (U.lunarMonths().filter(o => o.v === String(month))[0] || {}).t || (month + '月');
      const dLabel = (U.lunarDays().filter(o => o.v === String(day))[0] || {}).t || (day + '日');

      return {
        ok: true, sub: ju.name + ' · 命宫在' + C.ZHI[ming],
        yearGZ: yearGan + yearZhi, shengxiao: C.SHENGXIAO[yi % 12], month, day, hidx,
        mLabel, dLabel,
        hourZhi: C.ZHI[hidx], hourRange: (C.HOURS[hidx] || {}).range || '',
        ming, shen, mingZhi: C.ZHI[ming], shenZhi: C.ZHI[shen],
        mingPalace: palaceOf[shen], mingGan: ganAt(ming), mingNayin, juName: ju.name, juN: ju.n,
        mingZhu, shenZhu, dirName: dir === 1 ? '顺行' : '逆行', dirWhy: (yang ? '阳' : '阴') + '年' + (male ? '男' : '女'),
        stars, palaceOf, ganAt, limitOf, huaList, jie, rows, board: BOARD, mingOpp: opp
      };
    },

    view(d) {
      if (!d || !d.ok) return U.note('数据有误，请重新排盘。', true);
      const Z = C.ZIWEI;
      const starHTML = (s, big) => {
        const M = (Z.MAIN && Z.MAIN[s.name]) || null;
        const wx = M ? M.wx : (AUX_WX[s.name] || '土');
        const hua = s.hua ? '<b style="color:#a8322d">' + s.hua + '</b>' : '';
        return (big ? '<span style="font-size:15px">' : '') + U.wx(s.name, wx) + hua + (big ? '</span>' : '');
      };

      /* ---------- 4×4 十二宫盘（中宫占 2×2） ---------- */
      let board = '<div class="gong9" style="grid-template-columns:repeat(4,1fr)">';
      d.board.forEach(item => {
        if (item === 'C') {
          board += '<div class="cell" style="grid-column:span 2;grid-row:span 2;background:rgba(23,22,20,.045)">' +
            '<div class="gn">五行局</div><div class="gz">' + U.esc(d.juName) + '</div>' +
            '<div class="gs">生年 ' + U.esc(d.yearGZ) + '（' + U.esc(d.shengxiao) + '）<br>' +
            '农历 ' + U.esc(d.mLabel + d.dLabel) + ' ' + U.esc(d.hourZhi) + '时<br>' +
            '命主 ' + U.esc(d.mingZhu) + ' · 身主 ' + U.esc(d.shenZhu) + '<br>' +
            '大限' + U.esc(d.dirName) + '（' + U.esc(d.dirWhy) + '）</div></div>';
          return;
        }
        const z = item;
        const isMing = z === d.ming, isShen = z === d.shen;
        const main = d.stars[z].filter(s => s.kind === 'main');
        const aux = d.stars[z].filter(s => s.kind === 'aux');
        const style = isMing
          ? 'border-color:rgba(168,50,45,.6);background:rgba(168,50,45,.08)'
          : (isShen ? 'border-color:rgba(168,135,60,.6)' : '');
        board += '<div class="cell" style="' + style + '">' +
          '<div class="gn">' + U.esc(d.palaceOf[z]) + (isMing ? ' <b style="color:#a8322d">命</b>' : '') +
          (isShen ? ' <b style="color:#a8873c">身</b>' : '') + ' · ' + U.esc(d.ganAt(z)) + C.ZHI[z] + '</div>' +
          '<div class="gz">' + (main.length ? main.map(s => starHTML(s, true)).join(' ') : '<span style="color:#9a9486;font-size:13px">空宫</span>') + '</div>' +
          '<div class="gs">' + (aux.length ? aux.map(s => starHTML(s)).join(' ') : '') +
          '<br>大限 ' + U.esc(d.limitOf[z] || '') + '</div></div>';
      });
      board += '</div>';

      /* ---------- 十二宫详表 ---------- */
      const tbl = U.table(['宫位', '地支', '宫干', '主星', '辅星', '大限（岁）', '所主'], d.rows, { align: ['l', '', '', 'l', 'l', '', 'l'] });

      return U.resHead('紫微斗数', U.esc(d.juName) + ' · 命宫在' + U.esc(d.mingZhi) + ' · 身宫在' + U.esc(d.shenZhi)) +
        U.kv([
          ['生年干支', U.esc(d.yearGZ) + '（' + U.esc(d.shengxiao) + '）'],
          ['农历生日', U.esc(d.mLabel + d.dLabel) + ' ' + U.esc(d.hourZhi) + '时' + (d.hourRange ? '（' + U.esc(d.hourRange) + '）' : '')],
          ['五行局', U.esc(d.juName) + '（由命宫' + U.esc(d.mingGan + d.mingZhi) + '纳音' + U.esc(d.mingNayin) + '定）'],
          ['命宫 / 身宫', U.esc(d.mingZhi) + '宫 / ' + U.esc(d.shenZhi) + '宫（' + U.esc(d.mingPalace) + '）'],
          ['命主 / 身主', U.esc(d.mingZhu) + ' / ' + U.esc(d.shenZhu)],
          ['大限', U.esc(d.dirName) + '（' + U.esc(d.dirWhy) + '）· ' + d.juN + ' 岁起运，每宫十年']
        ]) +
        U.note('紫微斗数须用<strong>农历生日</strong>：本站不作公历与农历之换算，请自行查得农历后再选。' +
          '闰月按本月计。宫干以五虎遁由生年干起（本站约定）。全盘按《紫微斗数全书》口诀安星，' +
          '惟小星（天马、红鸾、天喜、三台八座等）与大限流年之细断未及备载，' +
          '四化只见生年干，不论大限流年之四化；此皆<strong>简化</strong>，已在术语中注明。', true) +
        U.card('十二宫盘', board, '命宫朱标 · 身宫金标 · 中宫为五行局') +
        U.card('命身与四化之白话解读', U.ul(d.jie.map(U.esc)), '编者自撰之参考语，非古籍原文') +
        U.card('十二宫详表', tbl, '由命宫起逆布 · 每宫含宫干、主星、辅星、四化、大限') +
        U.card('术语小释', U.kv([
          ['五行局', '由命宫干支之纳音五行所定：水二、木三、金四、土五、火六局。局数既用于安紫微，亦为大限起运之岁数。'],
          ['命宫 · 身宫', '命宫由农历月与生时定，主先天禀赋；身宫自主月宫顺至生时，主后天作为。同宫者谓"命身同宫"。'],
          ['十四主星', '紫微系六（紫微、天机、太阳、武曲、天同、廉贞）逆行，天府系八（天府、太阴、贪狼、巨门、天相、天梁、七杀、破军）顺行。'],
          ['四化', '生年天干所飞之禄、权、科、忌。禄主财禄机缘，权主权柄担当，科主名声文书，忌主牵绊耗神。'],
          ['三方四正', '本宫与三合宫（隔四宫）及对宫（隔六宫）合称三方四正，为观星曜会照之要。'],
          ['大限', '每宫十年之运限。起于五行局之数，阳男阴女顺行、阴男阳女逆行。'],
          ['空宫', '本宫无十四主星。古法借对宫之星并三方四正论之。']
        ])) +
        U.disclaim('紫微斗数流派与安星细则略有异同，本页所排依《全书》口诀，所断者为编者自撰之白话参考，' +
          '不涉生死、病名与必成必败之断言。');
    }
  });
})();
