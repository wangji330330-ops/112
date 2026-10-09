/* 七政四余 —— 日月五星与罗睺、计都、月孛、紫气；中国星命之学
   ★ 本页明示：非真历算，仅为星命结构的文化演示（五星用平均行度线性推算） */
(function () {
  'use strict';
  const C = window.CORE, U = C.UI, G = C.GZ;

  /* 十二宫盘之格位（巳午未申 / 辰…酉 / 卯…戌 / 寅丑子亥，中宫占 2×2） */
  const BOARD = [5, 6, 7, 8, 4, 'C', 9, 3, 10, 2, 1, 0, 11];

  /* 十二次：以黄经 255°（大雪）为首，每 30° 一次，中气居次之正中（合《汉书·律历志》
     "星纪，初斗十二度，大雪；中牵牛初，冬至"之义） */
  const CI_START = 255;
  const CI = [
    { name: '星纪', zhi: '丑', qi: '冬至' }, { name: '玄枵', zhi: '子', qi: '大寒' },
    { name: '娵訾', zhi: '亥', qi: '雨水' }, { name: '降娄', zhi: '戌', qi: '春分' },
    { name: '大梁', zhi: '酉', qi: '谷雨' }, { name: '实沈', zhi: '申', qi: '小满' },
    { name: '鹑首', zhi: '未', qi: '夏至' }, { name: '鹑火', zhi: '午', qi: '大暑' },
    { name: '鹑尾', zhi: '巳', qi: '处暑' }, { name: '寿星', zhi: '辰', qi: '秋分' },
    { name: '大火', zhi: '卯', qi: '霜降' }, { name: '析木', zhi: '寅', qi: '小雪' }
  ];
  const ciOfLon = (lon) => CI[Math.floor(((((lon - CI_START) % 360) + 360) % 360) / 30)];

  /* 十二宫：与西法十二宫一一相对（命宫为第一宫，沿黄道依次而下） */
  const HOUSES = ['命宫', '财帛', '兄弟', '田宅', '男女', '奴仆', '夫妻', '疾厄', '迁移', '官禄', '福德', '相貌'];
  const PALACE_GOV = {
    命宫: '一身之枢，主禀赋、意志与趋向。', 财帛: '主财用、经营与得失。', 兄弟: '主同气、同侪与协力。',
    田宅: '主居处、家业与内顾。', 男女: '主子女、所育与下属。', 奴仆: '主役使、部属与从属之人。',
    夫妻: '主配偶、配合与内外之和。', 疾厄: '主身体强弱、劳逸与调养（不作病名之断）。',
    迁移: '主出行、迁动与在外之遇。', 官禄: '主事业、名位与任事之途。', 福德: '主福分、性情之乐与精神所寄。',
    相貌: '主仪容、名望与隐微之应。'
  };

  /* 七政四余十一曜：曜性、五行与白话（编者自撰之参考语） */
  const STARS = [
    { id: 'sun', name: '太阳', wx: '火', tone: 'ji', desc: '一曜之君，主光明、声名与显达，性主施与。' },
    { id: 'moon', name: '太阴', wx: '水', tone: 'ji', desc: '主阴柔、亲眷、水土之利，性主含容与流转。' },
    { id: 'wood', name: '木星', wx: '木', tone: 'ji', desc: '古称岁星，主仁厚、生长与机遇。' },
    { id: 'fire', name: '火星', wx: '火', tone: 'xiong', desc: '古称荧惑，主刚烈、躁动与非常之举。' },
    { id: 'earth', name: '土星', wx: '土', tone: 'xiong', desc: '古称镇星，主厚重、迟滞与承当。' },
    { id: 'metal', name: '金星', wx: '金', tone: 'zhong', desc: '古称太白，主刚断、仪容与财帛之器。' },
    { id: 'water', name: '水星', wx: '水', tone: 'zhong', desc: '古称辰星，主聪慧、文书与谋议。' },
    { id: 'rahu', name: '罗睺', wx: '火', tone: 'xiong', desc: '四余之一，月之升交点（本站所取），主突发与夺势。' },
    { id: 'ketu', name: '计都', wx: '土', tone: 'xiong', desc: '四余之一，月之降交点，主隐晦与耗散。' },
    { id: 'yuebo', name: '月孛', wx: '水', tone: 'xiong', desc: '四余之一，月之远地点，主暗昧与执著。' },
    { id: 'ziqi', name: '紫气', wx: '木', tone: 'ji', desc: '四余之一，木星之余气，主清贵与祥瑞。' }
  ];
  const TONE_TEXT = {
    ji: '此为吉曜，其气顺，主助力与机缘；宜循正而进，勿因顺而懈。',
    xiong: '此为刚曜，其气烈，主磨砺与变动；宜守分待时，不宜躁进强求。',
    zhong: '此曜居中，吉凶随其所会之宫；宜和缓处之，以人事补天时。'
  };

  const norm = (x) => ((x % 360) + 360) % 360;

  window.ART({
    id: 'qizheng',
    name: '七政四余',
    alias: ['星宗', '果老星宗', '五星四余'],
    gua: 'li',
    order: 4,
    tagline: '日月五星与四余 · 十二次十二宫，中国古代星命之学（非真历算）',

    intro: `
      ${U.note('<strong>本页非真历算，仅为星命结构的文化演示。</strong>' +
        '太阳用真黄经之低精度公式；太阴用平黄经，五星用行星之<em>平黄经（日心平黄经之近似）</em>线性推算，' +
        '未作地心归算、摄动改正、岁差细校，故与目见之真位置可相去甚远（水星、金星尤甚）；' +
        '四余取交点与远地点之平黄经，紫气更为虚拟之星。命宫亦未用出生地之经纬度求真上升点，' +
        '十二宫之布法为本站明写之约定。', true)}
      <p>七政四余为中国古代之星命学。"七政"者，日、月与木、火、土、金、水五星；
      "四余"者，罗睺、计都、月孛、紫气——罗计为黄白道之交点，月孛为月之远地点，
      紫气则木星之余气，皆虚星而无实体，故曰"余"。其法大概随唐代《都利聿斯经》一路
      自西域传入，与中土之二十八宿、十二次相参而中国化，明《果老星宗》为传世之要籍。</p>
      <p>其纲要：以人出生之时，观诸曜所躔之"次"与所临之"宫"。十二次者，
      星纪、玄枵、娵訾、降娄、大梁、实沈、鹑首、鹑火、鹑尾、寿星、大火、析木，
      各三十度而配十二地支；十二宫者，命宫为枢，次第为财帛、兄弟、田宅、男女、奴仆、
      夫妻、疾厄、迁移、官禄、福德、相貌，与西洋十二宫一一相对。以曜性论吉凶：
      太阳、太阴、木星、紫气为吉，火星、土星、罗睺、计都、月孛为刚，金水居中；
      更有庙旺、迟疾、顺逆留伏之辨。</p>
      <p>真历算须先以出生地之经纬度求真地平之上升点（命宫），再查星历表得五星之<em>地心</em>黄经。
      本站无星历表，故为之简化：太阳之黄经用低精度公式真算；太阴取平黄经，五星取行星之平黄经
      （日心平黄经之近似）自 J2000 以平均行度线性推之，皆未作地心归算与摄动改正；
      命宫由太阳所躔之宫按生时推之，十二宫自命宫起沿黄道（地支逆行）布之。
      凡此皆于页内逐条注明，以见其结构而已，不敢以为真历算。</p>`,

    method: `
      <p>填入出生之公历时间（按北京时间），按"布盘"即得十二宫之盘与诸曜所在。
      本页无须出生地——正因未算上升点之故（见上"非真历算"之声明）。</p>
      <p>盘面以十二地支定宫位，每宫注宫名、次名与所落星曜；中宫为生时、太阳所躔之次与命宫。
      盘下另有十一曜之黄经与所临之宫、十二宫所主与白话解读。</p>`,

    form: [
      { name: 'dt', label: '出生时间（公历 · 北京时间）', type: 'datetime-local', value: U.nowStr(), wide: true, hint: '年以立春、月以十二节为界' },
      { name: 'gender', label: '性别', type: 'chips', options: [{ v: '男', t: '男' }, { v: '女', t: '女' }], value: '男' },
      { name: 'q', label: '所问（可选）', type: 'text', placeholder: '如：近年宜何方向', hint: '仅备注，不入推演' }
    ],

    cast(input) {
      if (!input || !input.dt) return { error: '请先填写出生时间（公历）' };
      const dt = U.parseDT(input.dt);
      const fp = G.fourPillars(dt);
      const W = fp.input;                       // 东八区墙上时刻 {y,m,d,h,min}
      const jdLocal = fp.jd;                    // 东八区当地儒略日
      const jdUT = jdLocal - 8 / 24;            // 约化到 UT（本站约定：一律按东八区）
      const T = (jdUT - 2451545.0) / 36525;
      const hidx = C.ZHI.indexOf(fp.hour.zhi);

      /* ---------- 十一曜黄经（简化：平均行度线性推算） ---------- */
      const lon = {
        sun: norm(G.sunLongitude(jdUT)),                                  // 真黄经（低精度公式）
        moon: norm(218.3164477 + 481267.88123421 * T),                     // 月之平黄经
        wood: norm(34.351519 + 3034.9056606 * T),                          // 木星平黄经
        fire: norm(355.433275 + 19140.2993313 * T),                        // 火星平黄经
        earth: norm(50.077444 + 1222.1138488 * T),                         // 土星平黄经
        metal: norm(181.979801 + 58517.8156760 * T),                       // 金星平黄经
        water: norm(252.250906 + 149472.6746358 * T),                      // 水星平黄经
        rahu: norm(125.0445479 - 1934.1362891 * T),                        // 月之升交点
        yuebo: norm(83.3532465 + 4069.0137287 * T)                         // 月之远地点
      };
      lon.ketu = norm(lon.rahu + 180);
      /* 紫气：依传统"二十八年一周天"之说（约 12.857°/年），本站以 J2000 为历元、初度取 0° */
      lon.ziqi = norm((jdUT - 2451545.0) * 360 / (28 * 365.2422));

      /* ---------- 命宫：以卯时太阳所在之宫为准，每时辰沿黄道退三十度 ---------- */
      const sunZhi = C.ZHI.indexOf(ciOfLon(lon.sun).zhi);
      const ming = (((sunZhi + 3 - hidx) % 12) + 12) % 12;

      /* ---------- 诸曜之次与宫 ---------- */
      const items = STARS.map(s => {
        const L = lon[s.id];
        const ci = ciOfLon(L);
        const zhi = C.ZHI.indexOf(ci.zhi);
        const house = (((ming - zhi) % 12) + 12) % 12;
        return {
          id: s.id, name: s.name, wx: s.wx, tone: s.tone, desc: s.desc,
          lon: L, lonTxt: L.toFixed(2) + '°',
          inCi: (((L - CI_START) % 360) + 360) % 360 % 30,
          ciName: ci.name, ciQi: ci.qi, zhiIdx: zhi, zhi: ci.zhi,
          house, houseName: HOUSES[house]
        };
      });
      const starsAt = (z) => items.filter(s => s.zhiIdx === z);
      /* 地支 → 次名（十二支与十二次一一相当） */
      const CI_BY_ZHI = {};
      CI.forEach(c => { CI_BY_ZHI[C.ZHI.indexOf(c.zhi)] = c.name; });

      /* ---------- 白话解读 ---------- */
      const jie = [];
      const compose = (star, houseName) => star.name + '（' + star.wx + '）入' + houseName + '：' +
        PALACE_GOV[houseName] + star.desc + TONE_TEXT[star.tone];

      const atMing = starsAt(ming);
      jie.push('太阳所躔之次为' + ciOfLon(lon.sun).name + '（' + ciOfLon(lon.sun).qi + '之次，入次 ' +
        ((((lon.sun - CI_START) % 360) + 360) % 360 % 30).toFixed(1) + ' 度），命宫在' + C.ZHI[ming] + '宫。');
      if (atMing.length) atMing.forEach(s => jie.push(compose(s, '命宫')));
      else jie.push('命宫无星曜落入。古法命宫无星者，借对宫（迁移）之星并三方参之：' +
        (starsAt((ming + 6) % 12).length ? starsAt((ming + 6) % 12).map(s => s.name).join('、') + '在迁移宫。' : '迁移宫亦无星，当以太阳、太阴之宫位与四余斟酌。'));

      [9, 1, 6, 7, 8].forEach(h => {
        const z = ((ming - h) % 12 + 12) % 12;
        const list = starsAt(z);
        if (list.length) list.forEach(s => jie.push(compose(s, HOUSES[h])));
      });
      jie.push('十二宫之中，' + HOUSES.map((nm, h) => {
        const z = ((ming - h) % 12 + 12) % 12;
        const list = starsAt(z);
        return nm + '（' + C.ZHI[z] + '）' + (list.length ? list.map(s => s.name).join('、') : '无星');
      }).join('；') + '。');
      jie.push('凡"吉曜入宫"者，其气顺而宜循正而进；"刚曜入宫"者，其气烈而宜守分待时。' +
        '此皆为曜性宫义之泛论，不作吉凶必至之断。');

      return {
        ok: true, sub: '十二次 · 命宫在' + C.ZHI[ming],
        dtStr: G.fmtTime(W), gender: input.gender || '—', q: input.q || '',
        pillars: [fp.year.name, fp.month.name, fp.day.name, fp.hour.name],
        jieqi: G.currentTerm(dt).name, yueJiang: G.yueJiang(dt),
        ming, mingZhi: C.ZHI[ming], sunLon: lon.sun.toFixed(2), sunCi: ciOfLon(lon.sun).name,
        sunQi: ciOfLon(lon.sun).qi, hourZhi: fp.hour.zhi,
        items, jie, board: BOARD,
        houses: HOUSES.map((nm, h) => {
          const z = ((ming - h) % 12 + 12) % 12;
          return { name: nm, zhi: C.ZHI[z], zhiIdx: z, ci: CI_BY_ZHI[z] || '', gov: PALACE_GOV[nm], stars: starsAt(z) };
        })
      };
    },

    view(d) {
      if (!d || !d.ok) return U.note('数据有误，请重新布盘。', true);

      const starHTML = (s) => U.wx(s.name, s.wx);

      /* ---------- 4×4 十二宫盘（中宫占 2×2） ---------- */
      let board = '<div class="gong9" style="grid-template-columns:repeat(4,1fr)">';
      d.board.forEach(item => {
        if (item === 'C') {
          const yj = d.yueJiang || {};
          board += '<div class="cell" style="grid-column:span 2;grid-row:span 2;background:rgba(23,22,20,.045)">' +
            '<div class="gn">七政四余</div>' +
            '<div class="gz" style="font-size:14px">太阳躔' + U.esc(d.sunCi) + ' · 命宫' + U.esc(d.mingZhi) + '</div>' +
            '<div class="gs">生时 ' + U.esc(d.pillars.join(' ')) + '<br>' +
            '太阳黄经 ' + U.esc(d.sunLon) + '°<br>节气 ' + U.esc(d.jieqi) + '<br>' +
            '六壬月将 ' + U.esc(yj.name || '') + '（中气' + U.esc(yj.zhongqi || '') + '）</div></div>';
          return;
        }
        const z = item;
        const h = (((d.ming - z) % 12) + 12) % 12;
        const list = d.items.filter(s => s.zhiIdx === z);
        const isMing = h === 0;
        board += '<div class="cell" style="' + (isMing ? 'border-color:rgba(168,50,45,.6);background:rgba(168,50,45,.08)' : '') + '">' +
          '<div class="gn">' + U.esc(d.houses[h].name) + (isMing ? ' <b style="color:#a8322d">命</b>' : '') +
          ' · ' + C.ZHI[z] + '</div>' +
          '<div class="gz">' + (list.length ? list.map(starHTML).join(' ') : '<span style="color:#9a9486;font-size:13px">无星</span>') + '</div>' +
          '<div class="gs">次：' + U.esc(d.houses[h].ci) + '<br>' + C.ZHI[z] + '宫</div></div>';
      });
      board += '</div>';

      /* ---------- 十一曜表 ---------- */
      const starRows = d.items.map(s => ({
        cells: [U.wx(s.name, s.wx), s.tone === 'ji' ? '吉曜' : (s.tone === 'xiong' ? '刚曜' : '中曜'),
          s.lonTxt, s.ciName + '（' + s.ciQi + '）', s.zhi, s.houseName + (s.houseName === '命宫' ? '' : '宫')],
        cls: s.id === 'sun' ? 'hi' : ''
      }));

      /* ---------- 十二宫所主 ---------- */
      const houseRows = d.houses.map(h => ({
        cells: [h.name, C.ZHI[h.zhiIdx], h.stars.length ? h.stars.map(starHTML).join('　') : '—', h.gov],
        cls: h.name === '命宫' ? 'hi' : ''
      }));

      return U.note('<strong>本页非真历算，仅为星命结构的文化演示。</strong>' +
        '太阳用真黄经之低精度公式；五星与四余以平均行度自 J2000 线性推算，未加摄动、视差与岁差之细校；' +
        '命宫由太阳所躔之宫按生时推之，未用出生地之经纬度求真上升点。十二宫与十二次之配法亦为站内明写之约定。', true) +
        U.resHead('七政四余', '命宫在' + U.esc(d.mingZhi) + ' · 太阳躔' + U.esc(d.sunCi)) +
        U.kv([
          ['出生（东八区）', U.esc(d.dtStr)],
          ['四柱', U.esc(d.pillars.join('　'))],
          ['太阳', U.esc(d.sunLon) + '° · 躔' + U.esc(d.sunCi) + '次（' + U.esc(d.sunQi) + '之次）'],
          ['命宫', U.esc(d.mingZhi) + '宫（本站约定：以卯时太阳所在之宫为命宫，每时辰沿黄道退三十度）'],
          ['节气 / 六壬月将', U.esc(d.jieqi) + ' / ' + U.esc((d.yueJiang || {}).name || '') + '（中气' + U.esc((d.yueJiang || {}).zhongqi || '') + '）'],
          ['性别', U.esc(d.gender)],
          ['所问', U.esc(d.q) || '—']
        ]) +
        U.card('十二宫盘', board, '命宫朱标 · 中宫为生时与太阳躔次') +
        U.card('七政四余十一曜', U.table(['曜', '曜性', '黄经', '所躔之次', '次之支', '所临之宫'], starRows, { align: ['l', '', '', 'l', '', ''] }) +
          U.note('黄经之来历：太阳为真黄经（低精度公式，误差约 0.01°）；太阴为平黄经；五星为<strong>行星之平黄经（日心平黄经之近似）</strong>，' +
            '未作地心归算与摄动改正，故与目见之真位置可相差甚远（水星、金星尤甚）；罗睺、计都、月孛为月之交点与远地点之平黄经；' +
            '紫气为虚拟之星（传统谓二十八年一周天，本站以 J2000 为历元、初度取 0°）。故此表只作结构示意，' +
            '不可用于择时、占候等实事。', true)) +
        U.card('白话解读', U.ul(d.jie.map(U.esc)), '编者自撰之参考语，非古籍原文') +
        U.card('十二宫所主与星曜', U.table(['宫位', '地支', '所落星曜', '所主'], houseRows, { align: ['l', '', 'l', 'l'] })) +
        U.card('术语小释', U.kv([
          ['七政', '日、月与木、火、土、金、水五星，合为七。'],
          ['四余', '罗睺、计都（黄白道之交点）、月孛（月之远地点）、紫气（木星之余气），皆虚星，故曰"余"。'],
          ['十二次', '星纪、玄枵、娵訾、降娄、大梁、实沈、鹑首、鹑火、鹑尾、寿星、大火、析木。各三十度，配十二地支，中气居次之正中。本站以十二节为次界（合《汉书·律历志》"星纪……初斗十二度，大雪"之义）；六壬之月将亦为太阳过宫，然以中气换将，故二者在交节前后可差一次，此为历家所已知之别。'],
          ['十二宫', '命宫、财帛、兄弟、田宅、男女、奴仆、夫妻、疾厄、迁移、官禄、福德、相貌。与西法十二宫一一相对。'],
          ['命宫（上升）', '真法以出生地经纬度求真地平与黄道之交点为命宫；本站以太阳所躔之宫按生时推之，为简化之约定。'],
          ['庙旺与迟疾', '星曜居本宫或得势曰庙旺，失势曰落陷；行度有顺、逆、留、伏之别。本站未及细算，一概从略。']
        ])) +
        U.disclaim('七政四余须以真星历与出生地之经纬度推步，本站所布为简化之结构演示，' +
          '所列黄经非真位置，解读为编者自撰之白话参考，请勿据以论命或择事。');
    }
  });
})();
