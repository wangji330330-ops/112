/* ============================================================
   皇极经世（乾 · 天，order 3）
   邵雍元会运世之数：一元十二会，一会三十运，一运十二世，一世三十年。
   本站锚点与卦配之约定，皆明写于页面，凡非古法者标为「简化演示」。
   ============================================================ */
(function () {
  'use strict';
  const C = window.CORE, U = C.UI, G = C.GZ;

  /* ---------- 元会运世之常数（邵雍之数） ---------- */
  const SHI_YEAR = 30;                  // 一世三十年
  const YUN_SHI = 12;                   // 一运十二世
  const HUI_YUN = 30;                   // 一会三十运
  const YUAN_HUI = 12;                  // 一元十二会
  const YUN_YEAR = SHI_YEAR * YUN_SHI;  // 一运 360 年
  const HUI_YEAR = YUN_YEAR * HUI_YUN;  // 一会 10800 年
  const YUAN_YEAR = HUI_YEAR * YUAN_HUI;// 一元 129600 年
  const ANCHOR = 1;                     // 本站约定：以公元元年为锚点
  const YUAN_OFFSET = 6 * HUI_YEAR;     // 本站约定：公元元年定为第七会（午会）之始

  /* 十二消息卦（tables.js 未载时之后备，不修改 core） */
  const XIAOXI = C.XIAOXI_GUA || ['地雷复', '地泽临', '地天泰', '雷天大壮', '泽天夬', '乾为天',
    '天风姤', '天山遁', '天地否', '风地观', '山地剥', '坤为地'];
  /* 四正卦不入岁卦：坎、震、离、兑 */
  const SIZHENG = ['坎为水', '震为雷', '离为火', '兑为泽'];

  /* 十二会之参考语（本站白话，非邵雍原文） */
  const HUI_GLOSS = [
    '子会：天开之初，气机始动，百务未形。',
    '丑会：地辟之始，形质渐立，基业可谋。',
    '寅会：人生之始，群类方兴，正开创之期。',
    '卯会：文明初启，制度渐立，宜立规模。',
    '辰会：人物繁盛，礼法渐备，宜修其文。',
    '巳会：文物极盛，灿然可观，然盛极当思其反。',
    '午会：阳极而阴始生，盛衰相禅之枢。',
    '未会：阴气渐长，文胜而质衰，宜务实去浮。',
    '申会：肃杀之气渐生，宜收敛、宜整肃。',
    '酉会：收束之时，旧物渐老，宜守成待变。',
    '戌会：闭物之候，宜藏不宜张。',
    '亥会：一阴将尽，万物归根，复返于混沌。'
  ];
  /* 升降之势（本站读法） */
  const SHENGJIANG = {
    '升前': { tag: '升势方动', text: '会属阳息，运居前半，世运之升方在初动。宜开创、布局、积德累功；忌躁进骤取，欲速则不达。' },
    '升后': { tag: '升势将极', text: '会属阳息，运居后半，升势已至将极之地。宜守成、修备、留有余地；忌骄盈自满，盛时最易生跌。' },
    '降前': { tag: '降势初起', text: '会属阴消，运居前半，降势方才起头。宜收敛、固本、护其已有；忌扩张铺张，亦忌轻信浮言。' },
    '降后': { tag: '降势已深', text: '会属阴消，运居后半，降势已深。宜静守、待时、俭以自处；忌妄动争强，宜以不变应其变。' }
  };
  const SHIJIAN = {
    '升前': { yi: '创始、开创、择友结盟、积学储蓄', ji: '躁进、铺张、轻诺' },
    '升后': { yi: '守成、修备、防患、退让自持', ji: '骄盈、争胜、妄求' },
    '降前': { yi: '收敛、固本、清账、简事', ji: '扩张、举债、轻信' },
    '降后': { yi: '静守、待时、俭约、养身自省', ji: '妄动、争强、冒进' }
  };

  /* 六十卦：四正卦外之六十卦，依《序卦传》次序 */
  function buildGua60() {
    const list = (C.HEX_LIST || []).filter(h => SIZHENG.indexOf(h.name) < 0);
    return list;
  }
  const GUA60 = buildGua60();

  function hexOf(name) { return (C.HEX_BY_NAME || {})[name] || null; }
  function yangCount(hex) {
    if (!hex || !hex.lines) return 0;
    return hex.lines.reduce((s, v) => s + (v ? 1 : 0), 0);
  }

  window.ART({
    id: 'huangji',
    name: '皇极经世',
    alias: ['皇极经世书', '元会运世', '经世'],
    gua: 'qian',
    order: 3,
    tagline: '邵雍元会运世 · 以三十年为一世推演世运升降。',

    intro: `
      <p>《皇极经世》为北宋邵雍（康节）所著，以「元、会、运、世」四重之数纪天地之始终。其法：一世三十年，一运十二世，一会三十运，一元十二会；一元之数十二万九千六百年，而天地之成毁、人物之盛衰，皆可借此四重之尺度而观其大略。</p>
      <p>邵雍又以十二会配十二支与十二消息卦：子会天开，丑会地辟，寅会人生，至巳会而文物灿然，午会则阳极阴生，亥会则万物归根。故「元会运世」非徒记年之尺，实为一升降消长之模型：以三十年为一世，以一世为一月之象，以十二消息卦观其进退，此其大要。</p>
      <p>其书体例，有「以元经会、以会经运、以运经世」三途：以元统十二会，以会统三十运，以运统十二世，层层相辖而世运之升降可见。本站取其四重之数，另立锚点与卦配以成一可算之盘；凡本站自定之约定，皆于页面写明，与邵雍原书之原始纪元、原始卦配未必尽合。</p>`,

    method: `
      <p>填入公历年份，即依本站约定推算本年在元、会、运、世四重中的位置，并给出当值之卦与世运升降之白话解读。</p>
      <p><strong>锚点（本站约定，属简化演示）</strong>：以公元元年（AD 1）为锚点，并定公元元年为「第七会（午会）· 第一运 · 第一世」之始，此后依三十年一世层层累进。所以取午会者，因后世多谓邵雍之意以帝尧当巳会、宋世当午会；以此约定推之，帝尧之世（约公元前二十三世纪）正当第六会之内，宋世（公元十一世纪）正当第七会之内，与旧说大致相合。此锚点与会次皆本站自定，邵雍原书自有其「经世」纪元，读者勿混。</p>
      <p><strong>卦配（本站约定，属简化演示）</strong>：其一，十二会配十二消息卦（子会为复，午会为姤，亥会为坤）；一运十二世，以一世当一月之象，故十二世亦配十二消息卦，取为「世卦」。其二，岁卦以六十年为一周：取《序卦传》六十四卦中除四正卦（坎、震、离、兑）外之六十卦，以公元四年（甲子年）配「乾为天」，与六十甲子同起同止。汉易卦气另有「甲子卦气起中孚」之配法，本站不取。凡此皆为一可算之约定，非邵雍原式。</p>`,

    form: [
      { name: 'year', label: '公历年份', type: 'number', min: 1, max: 999999, step: 1, value: new Date().getFullYear(), hint: '公元元年为本站之锚点' },
      { name: 'q', label: '所问（可选）', type: 'text', placeholder: '如：此后数年大势如何', wide: true }
    ],

    cast(input) {
      const y = Number(String(input.year === undefined || input.year === null ? '' : input.year).trim());
      if (!isFinite(y) || y !== Math.floor(y) || y < 1 || y > 999999) {
        return { error: '请输入 1 至 999999 之间的公历年份' };
      }
      const q = String(input.q === undefined || input.q === null ? '' : input.q).trim();

      /* 四重定位 */
      const off = y - ANCHOR + YUAN_OFFSET;
      const yuan = Math.floor(off / YUAN_YEAR) + 1;
      const inYuan = off % YUAN_YEAR;
      const hui = Math.floor(inYuan / HUI_YEAR) + 1;
      const r1 = inYuan % HUI_YEAR;
      const yun = Math.floor(r1 / YUN_YEAR) + 1;
      const r2 = r1 % YUN_YEAR;
      const shi = Math.floor(r2 / SHI_YEAR) + 1;
      const yearInShi = (r2 % SHI_YEAR) + 1;

      /* 当值之卦 */
      const huiZhi = C.ZHI[(hui - 1) % 12];
      const huiGuaName = XIAOXI[(hui - 1) % 12];
      const shiGuaName = XIAOXI[(shi - 1) % 12];
      const gzIdx = ((y - 4) % 60 + 60) % 60;
      const suiGZ = G.gzName(gzIdx);
      const suiGua = GUA60.length ? GUA60[gzIdx % GUA60.length] : null;
      const huiGua = hexOf(huiGuaName), shiGua = hexOf(shiGuaName);

      /* 升降 */
      const isSheng = hui <= 6;
      const key = (isSheng ? '升' : '降') + (yun <= 15 ? '前' : '后');
      const sj = SHENGJIANG[key] || SHENGJIANG['升前'];
      const sj2 = SHIJIAN[key] || SHIJIAN['升前'];

      /* 白话解读 */
      const jue = [];
      jue.push('本年在第一元之第' + hui + '会（' + huiZhi + '会），当' + huiGuaName + '之象。' + (HUI_GLOSS[(hui - 1) % 12] || ''));
      jue.push('第' + hui + '会之第' + yun + '运（一会三十运），运居' + (yun <= 15 ? '前半' : '后半') + '；一会之内，运数愈大则愈近其会之极。');
      jue.push('第' + yun + '运之第' + shi + '世（一运十二世），当值世卦为' + shiGuaName + '，一世三十年当一月之象；本年为此世之第' + yearInShi + '年。');
      jue.push('本岁干支' + suiGZ + '，岁卦为' + (suiGua ? suiGua.name : '—') + '（六十卦配六十甲子，六十年一周）。');
      jue.push('合而观之，世运之势为「' + sj.tag + '」：' + sj.text);
      jue.push('就此盘而论，宜' + sj2.yi + '；忌' + sj2.ji + '。此为观势之参考，非人事之定命。');

      const lines = [
        ['元', '第 ' + yuan + ' 元（一元 ' + YUAN_YEAR + ' 年）'],
        ['会', '第 ' + hui + ' 会 · ' + huiZhi + '会（一会 ' + HUI_YEAR + ' 年）'],
        ['运', '第 ' + yun + ' 运（一运 ' + YUN_YEAR + ' 年）'],
        ['世', '第 ' + shi + ' 世（一世 ' + SHI_YEAR + ' 年）'],
        ['世内年次', '第 ' + yearInShi + ' 年'],
        ['会卦', huiGuaName + '（十二消息卦 · ' + huiZhi + '会）'],
        ['世卦', shiGuaName + '（十二消息卦 · 运内世次）'],
        ['岁卦 / 岁干支', (suiGua ? suiGua.name : '—') + ' / ' + suiGZ],
        ['距会终', (HUI_YEAR - r1) + ' 年'],
        ['距运终 / 距世终', (YUN_YEAR - r2) + ' 年 / ' + (SHI_YEAR - (r2 % SHI_YEAR)) + ' 年'],
        ['距元终', (YUAN_YEAR - inYuan) + ' 年']
      ];

      return {
        head: '第 ' + hui + ' 会 · 第 ' + yun + ' 运 · 第 ' + shi + ' 世',
        sub: '皇极经世 · ' + y + ' 年（' + suiGZ + '）',
        q: q,
        year: y, yuan: yuan, hui: hui, yun: yun, shi: shi, yearInShi: yearInShi,
        huiZhi: huiZhi, huiGuaName: huiGuaName, shiGuaName: shiGuaName,
        huiGua: huiGua, shiGua: shiGua, suiGua: suiGua, suiGZ: suiGZ,
        yangHui: yangCount(huiGua), yangShi: yangCount(shiGua), yangSui: yangCount(suiGua),
        shengjiang: sj, shijian: sj2, key: key,
        jue: jue, lines: lines
      };
    },

    view(d) {
      let out = U.resHead(d.head, d.sub);
      if (d.q) out += U.note('所问：' + U.esc(d.q));

      /* 四重定位 */
      out += U.sec('元会运世之定位',
        U.card('本年之位', U.kv([
          ['元', '第 ' + d.yuan + ' 元'],
          ['会', '第 ' + d.hui + ' 会 · ' + d.huiZhi + '会'],
          ['运', '第 ' + d.yun + ' 运（一会三十运）'],
          ['世', '第 ' + d.shi + ' 世（一运十二世）'],
          ['世内年次', '第 ' + d.yearInShi + ' 年（一世三十年）']
        ])) +
        U.note('本站约定（属简化演示）：以公元元年（AD 1）为锚点，且定为第七会（午会）· 第一运 · 第一世之始。一元十二会＝三百六十运＝四千三百二十世＝十二万九千六百年，即邵雍「一世三十年，一运十二世，一会三十运，一元十二会」之数。取公元元年当午会者，取后世「尧当巳会、宋当午会」之意而便与公历对照；邵雍原书自有「经世」纪元，其原始会运世次与此不同，读者勿混。', true));

      /* 当值之卦 */
      const hexHtml = d.shiGua
        ? U.hexBox(d.shiGua)
        : U.note('世卦未得。');
      out += U.sec('当值之卦',
        U.card('世卦 · ' + d.shiGuaName, hexHtml, '十二消息卦 · 运内第 ' + d.shi + ' 世') +
        (d.shiGua && d.shiGua.duan ? U.note('世卦大意（本站参考白话）：' + U.esc(d.shiGua.duan)) : '') +
        U.card('会卦 / 岁卦', U.kv([
          ['会卦', d.huiGuaName + '（' + d.huiZhi + '会）'],
          ['岁卦', (d.suiGua ? d.suiGua.name : '—') + ' · ' + d.suiGZ],
          ['岁卦大意', d.suiGua && d.suiGua.duan ? d.suiGua.duan : '—']
        ])) +
        U.card('卦气之消长', U.bars([
          ['会卦阳爻', d.yangHui],
          ['世卦阳爻', d.yangShi],
          ['岁卦阳爻', d.yangSui]
        ], 6) + U.note('阳爻之数愈多，则卦气愈盛。十二消息卦自复（一阳）至乾（六阳）为阳息，自姤（一阴）至坤（六阴）为阴消。')) +
        U.note('卦配之法（本站约定，属简化演示）：一会配一消息卦（子会为复、丑会为临……午会为姤、亥会为坤）；一运十二世各配一消息卦，取一世三十年当一月之象；岁卦则以六十年为一周，取《序卦传》除四正卦（坎、震、离、兑）外之六十卦，以公元四年（甲子年）配「乾为天」，与六十甲子同起同止。此三事皆为本站自定之可算约定，非邵雍原式。', true));

      /* 世运升降 */
      out += U.sec('世运升降',
        U.card('世运之势 · ' + d.shengjiang.tag,
          U.p(d.shengjiang.text) +
          U.kv([
            ['宜', d.shijian.yi],
            ['忌', d.shijian.ji]
          ])) +
        U.card('白话解读', U.ul(d.jue)) +
        U.card('年数要目', U.kv(d.lines)) +
        U.note('以上解读为本站依「会之阴阳（阳息／阴消）＋运之前后半」二分之法所作之参考白话，非邵雍原文，亦不下成败之断言。'));

      /* 术语 */
      out += U.sec('术语小释',
        U.card('皇极经世术语', U.kv([
          ['元会运世', '一世三十年，一运十二世（360 年），一会三十运（10800 年），一元十二会（129600 年）。'],
          ['经世', '邵雍纪年之法，以「以元经会、以会经运、以运经世」层层相辖，故名经世。'],
          ['十二消息卦', '复、临、泰、大壮、夬、乾、姤、遁、否、观、剥、坤，以阴阳消长配十二月，本站并借以配会与世。'],
          ['四正卦', '坎、震、离、兑，主冬春夏秋四时，不入岁卦，故六十卦配六十甲子。'],
          ['阳息 / 阴消', '自复至乾为阳息（升），自姤至坤为阴消（降），本站以此分世运升降之两段。'],
          ['锚点', '本站自定之起算点：公元元年为第七会（午会）之始，声明于页面，以便与公历对照；非古法原有。']
        ])));

      out += U.disclaim('本页之元会运世为四重时间模型之体验，锚点与卦配皆本站约定（简化演示），不可据以论断国运、时局与个人祸福。');
      return out;
    }
  });
})();
