/* ============================================================
   坤 · 罗盘二十四山 —— 坐山朝向、八卦五行、三元龙与净阴净阳
   ============================================================ */
(function () {
  'use strict';
  const C = window.CORE, U = C.UI, ART = window.ART;

  const SHAN = C.SHAN24, SHAN_WX = C.SHAN24_WX;
  const GONG24 = ['坎', '艮', '震', '巽', '离', '坤', '兑', '乾'];      // 每宫三山
  const GONG_FANG = { 坎: '正北', 艮: '东北', 震: '正东', 巽: '东南', 离: '正南', 坤: '西南', 兑: '正西', 乾: '西北' };
  const GONG_WX = { 坎: '水', 艮: '土', 震: '木', 巽: '木', 离: '火', 坤: '土', 兑: '金', 乾: '金' };
  const SANYUAN = ['地元龙', '天元龙', '人元龙'];                        // 每宫三山依次
  const YANG_SHAN = '乾甲坤乙壬寅午戌癸申子辰'.split('');                // 净阳十二山（纳甲归元）
  /* 八煞：坎龙坤兔震山猴，巽鸡乾马兑蛇头，艮虎离猪为煞曜（一说） */
  const BA_SHA = { 坎: '辰', 坤: '卯', 震: '申', 巽: '酉', 乾: '午', 兑: '巳', 艮: '寅', 离: '亥' };

  const shanGong = (i) => GONG24[Math.floor(i / 3)];
  const sanyuanOf = (i) => SANYUAN[i % 3];
  const isYang = (s) => YANG_SHAN.indexOf(s) >= 0;
  /* 度数：子山中心为正北 0°，每山十五度（依通行罗盘，非引擎 C.SHAN24_DIR 之壬山起 0° 法） */
  const startDeg = (i) => ((i - 1) * 15 - 7.5 + 360) % 360;
  const centerDeg = (i) => ((i - 1) * 15 + 360) % 360;
  const rangeText = (i) => startDeg(i) + '°–' + ((startDeg(i) + 15) % 360) + '°';
  const shanOfDeg = (deg) => (Math.round((((deg % 360) + 360) % 360) / 15) + 1) % 24;

  const REL_TEXT = {
    '同': { lv: '宜', t: '坐向比和，气脉相承，立向较易安稳。' },
    '生我': { lv: '宜', t: '向之五行生坐山（向生坐），谓之得助，宜守此向。' },
    '我生': { lv: '平', t: '坐山之五行生朝向（坐生向），气有外泄之象；宜于前庭收束以蓄之。' },
    '我克': { lv: '平', t: '坐山克朝向（坐克向），我制其用；布置得宜则可控，失宜则主客相争。' },
    '克我': { lv: '忌', t: '朝向之五行克坐山（向克坐），气逼其主；宜以绿化、影壁、水池等缓之。' }
  };

  /* ---------- 罗盘示意图（纯字符串内联 SVG，不碰 DOM） ---------- */
  function wheelSVG(zi, ci) {
    const C0 = 180, R = 170, R1 = 140, R0 = 112;
    const rad = (d) => (d - 90) * Math.PI / 180;
    const XY = (r, d) => [(C0 + r * Math.cos(rad(d))).toFixed(2), (C0 + r * Math.sin(rad(d))).toFixed(2)];
    let s = '<div class="center"><svg viewBox="0 0 360 360" style="width:100%;max-width:340px;height:auto" role="img" aria-label="二十四山罗盘示意图">';
    s += '<circle cx="180" cy="180" r="' + R + '" fill="none" stroke="#8a6a2f" stroke-width="1.2"/>';
    s += '<circle cx="180" cy="180" r="' + R1 + '" fill="none" stroke="#8a6a2f" stroke-width="0.8"/>';
    s += '<circle cx="180" cy="180" r="' + R0 + '" fill="none" stroke="#8a6a2f" stroke-width="0.8"/>';
    /* 二十四山界缝 */
    for (let k = 0; k < 24; k++) {
      const d = -7.5 + 15 * k;
      const a = XY(R1, d), b = XY(R, d);
      s += '<line x1="' + a[0] + '" y1="' + a[1] + '" x2="' + b[0] + '" y2="' + b[1] + '" stroke="#8a6a2f" stroke-width="0.6"/>';
    }
    /* 八卦宫界 */
    for (let k = 0; k < 8; k++) {
      const d = 22.5 + 45 * k;
      const a = XY(R0, d), b = XY(R1, d);
      s += '<line x1="' + a[0] + '" y1="' + a[1] + '" x2="' + b[0] + '" y2="' + b[1] + '" stroke="#8a6a2f" stroke-width="0.6"/>';
    }
    /* 坐向轴线 */
    const p = XY(R0 - 14, centerDeg(zi)), q = XY(R0 - 14, centerDeg(ci));
    s += '<line x1="' + p[0] + '" y1="' + p[1] + '" x2="' + q[0] + '" y2="' + q[1] + '" stroke="#a8322d" stroke-width="1.4" stroke-dasharray="5 4"/>';
    /* 二十四山名 */
    for (let i = 0; i < 24; i++) {
      const pos = XY((R + R1) / 2, centerDeg(i));
      if (i === zi) s += '<circle cx="' + pos[0] + '" cy="' + pos[1] + '" r="9.5" fill="#a8322d"/><text x="' + pos[0] + '" y="' + pos[1] + '" text-anchor="middle" dominant-baseline="central" font-size="11" fill="#fff">' + SHAN[i] + '</text>';
      else if (i === ci) s += '<circle cx="' + pos[0] + '" cy="' + pos[1] + '" r="9.5" fill="#2f4a6b"/><text x="' + pos[0] + '" y="' + pos[1] + '" text-anchor="middle" dominant-baseline="central" font-size="11" fill="#fff">' + SHAN[i] + '</text>';
      else s += '<text x="' + pos[0] + '" y="' + pos[1] + '" text-anchor="middle" dominant-baseline="central" font-size="11" fill="#3d2f24">' + SHAN[i] + '</text>';
    }
    /* 八卦宫名 */
    for (let k = 0; k < 8; k++) {
      const pos = XY((R0 + R1) / 2, k * 45);
      s += '<text x="' + pos[0] + '" y="' + pos[1] + '" text-anchor="middle" dominant-baseline="central" font-size="13" fill="#8a6a2f">' + GONG24[k] + '</text>';
    }
    s += '<text x="180" y="180" text-anchor="middle" dominant-baseline="central" font-size="10" fill="#8a6a2f">天池</text>';
    s += '</svg></div>';
    return s;
  }

  ART({
    id: 'luopan',
    name: '罗盘二十四山',
    alias: ['罗经', '二十四山', '立向'],
    gua: 'kun',
    order: 4,
    tagline: '二十四山向 · 立向分金，坐山与朝向的五行生克',

    intro: `
      <p>罗盘，古称罗经，「罗」言其包罗万象、「经」言其经纬天地。相传指南之器起于先秦，
      至唐宋而渐成多层同心圆之盘：中以天池置磁针定南北，外列八卦、二十四山、七十二龙、
      一百二十分金、二十八宿诸层，凡方位之度数、干支之配属，皆具于此，为形法、理气两家共用之器。</p>
      <p>「二十四山」是罗盘之骨：将周天三百六十度分为二十四格，每格十五度，以十二地支、八天干
      （不用戊己）与乾、坤、艮、巽四维共二十四字命名。四正（子午卯酉）居北南东西，
      四维（乾坤艮巽）居四隅，八天干各依其五行方位而其旁。三山归为一卦宫，
      故二十四山即八宫之分野：坎纳壬子癸、艮纳丑艮寅、震纳甲卯乙、巽纳辰巽巳、
      离纳丙午丁、坤纳未坤申、兑纳庚酉辛、乾纳戌乾亥。</p>
      <p>立向之法，以坐山与朝向相对（如子山午向即坐北朝南）。论其吉凶，一看二山五行之生克，
      二看三元龙（地元、天元、人元）与净阴净阳之配合——三合家以「阳山阳向、阴山阴向」为要，
      忌阴阳驳杂；三元家则以三元龙辨顺逆、取父母子息。罗盘又有三针之别：地盘正针立向、人盘中针消砂、
      天盘缝针纳水，三针相差各半格，为罗盘最要之常识。</p>`,

    method: `
      <p>两种输入任择其一：其一「按坐山选」，直接在二十四山中指定坐山；其二「按度数填」，
      填入罗盘（以正北为 0°、顺时针计）测得之坐山度数，本页自动归入所属之山。朝向一律取坐山对宫（相差一百八十度）。</p>
      <p>按「起盘」即得：坐山与朝向的山名、所属卦宫、五行、三元龙、阴阳、度数区间，
      二山五行的生克关系与立向倾向，并注明本向属「正向」还是「兼向」（每山十五度分三格，中格五度为正向）。</p>`,

    form: [
      {
        name: 'mode', label: '输入方式', type: 'chips', value: 'shan',
        options: [{ v: 'shan', t: '按坐山选' }, { v: 'deg', t: '按度数填' }]
      },
      { name: 'zuo', label: '坐山', type: 'select', value: '子', options: SHAN.map(s => ({ v: s, t: s + '山' })) },
      { name: 'deg', label: '坐山度数（0–360，自正北顺时针）', type: 'number', value: 0, min: 0, max: 360, step: 0.5, hint: '选「按度数填」时使用' }
    ],

    cast(input) {
      const mode = String(input.mode || 'shan').trim();
      let deg, zi;
      if (mode === 'deg') {
        const raw = Number(input.deg);
        if (input.deg === '' || isNaN(raw)) return { error: '请填写坐山度数（0–360）' };
        if (raw < 0 || raw > 360) return { error: '度数须在 0–360 之间' };
        deg = ((raw % 360) + 360) % 360;
        zi = shanOfDeg(deg);
      } else {
        const zuoIn = String(input.zuo || '子').trim();
        zi = SHAN.indexOf(zuoIn);
        if (zi < 0) return { error: '坐山须为二十四山之一' };
        deg = centerDeg(zi);
      }
      const ci = (zi + 12) % 24;
      const chaoDeg = (deg + 180) % 360;

      const zuo = SHAN[zi], chao = SHAN[ci];
      const zg = shanGong(zi), cg = shanGong(ci);
      const zwx = SHAN_WX[zuo], cwx = SHAN_WX[chao];
      const rel = C.wxRelation(zwx, cwx);
      const relInfo = REL_TEXT[rel] || REL_TEXT['同'];
      const sameYY = isYang(zuo) === isYang(chao);

      /* 正向 / 兼向：每山十五度分三格，中格为正向 */
      const off = ((deg - startDeg(zi)) % 360 + 360) % 360;
      const prevShan = SHAN[(zi + 23) % 24], nextShan = SHAN[(zi + 1) % 24];
      let xiang = '正向';
      if (off < 5) xiang = '兼' + prevShan + '（本山之内偏向' + prevShan + '山一侧）';
      else if (off > 10) xiang = '兼' + nextShan + '（本山之内偏向' + nextShan + '山一侧）';
      const jian = off < 5 || off > 10;

      const baSha = BA_SHA[zg];
      const fanBaSha = chao === baSha;

      let tendency;
      if (!sameYY) tendency = '阴阳驳杂，立向宜再斟酌';
      else if (rel === '克我') tendency = '向克坐山，宜设缓冲之物，不宜直冲';
      else if (rel === '同' || rel === '生我') tendency = '坐向相得，属可用之向';
      else tendency = '可用而略有泄耗，宜布置调理';

      const yi = [], ji = [];
      if (rel === '同' || rel === '生我') yi.push('坐山属' + zwx + '、朝向属' + cwx + '，二者为「' + rel + '」，' + relInfo.t);
      else if (rel === '克我') ji.push('坐山属' + zwx + '而受朝向' + cwx + '所克（' + rel + '），' + relInfo.t);
      else yi.push('坐山属' + zwx + '、朝向属' + cwx + '，二者为「' + rel + '」，' + relInfo.t);
      if (sameYY) yi.push('坐' + zuo + '、朝' + chao + '同属' + (isYang(zuo) ? '净阳' : '净阴') + '，阴阳不驳杂，合三合家「阳山阳向、阴山阴向」之要。');
      else ji.push('坐' + zuo + '属' + (isYang(zuo) ? '净阳' : '净阴') + '、朝' + chao + '属' + (isYang(chao) ? '净阳' : '净阴') + '，谓之阴阳驳杂；三合家以此为立向之忌，宜改用同阴阳之向，或请明家细审分金。');
      if (jian) ji.push('所填度数落于本山边格，属兼向；兼向须按一百二十分金、七十二龙另审吉凶，本页只辨正向与兼向，不判分金。');
      else yi.push('所填度数在本山中间一格，属正向，为立向之常法；亦为本页所推吉凶倾向所依。');
      if (fanBaSha) ji.push('朝向' + chao + '为本宫八煞之向（八煞歌谓' + zg + '忌' + baSha + '），立向宜避。');
      else yi.push('本宫八煞之向为' + baSha + '，本向' + chao + '不犯八煞，宜。');

      return {
        mode: mode, deg: deg, chaoDeg: chaoDeg, zi: zi, ci: ci,
        zuo: zuo, chao: chao, zg: zg, cg: cg, zwx: zwx, cwx: cwx,
        zuoSanyuan: sanyuanOf(zi), chaoSanyuan: sanyuanOf(ci),
        zuoYY: isYang(zuo) ? '净阳' : '净阴', chaoYY: isYang(chao) ? '净阳' : '净阴',
        zuoRange: rangeText(zi), chaoRange: rangeText(ci),
        rel: rel, relLv: relInfo.lv, relT: relInfo.t,
        xiang: xiang, jian: jian, off: off,
        sameYY: sameYY, tendency: tendency, baSha: baSha, fanBaSha: fanBaSha,
        yi: yi, ji: ji
      };
    },

    view(d) {
      const info = U.kv([
        ['坐山', U.wx(d.zuo, d.zwx) + '山　' + d.zuoRange + '（中心 ' + centerDeg(d.zi) + '°）'],
        ['朝向', U.wx(d.chao, d.cwx) + '向　' + d.chaoRange + '（中心 ' + centerDeg(d.ci) + '°）'],
        ['坐山卦宫', d.zg + '宫（' + GONG_FANG[d.zg] + '·' + GONG_WX[d.zg] + '）　' + d.zuoSanyuan + '　' + d.zuoYY],
        ['朝向卦宫', d.cg + '宫（' + GONG_FANG[d.cg] + '·' + GONG_WX[d.cg] + '）　' + d.chaoSanyuan + '　' + d.chaoYY],
        ['五行关系', '坐山属' + d.zwx + '、朝向属' + d.cwx + ' → ' + d.rel + '（' + d.relLv + '）'],
        ['立向', d.xiang + (d.mode === 'deg' ? '　坐山实测 ' + d.deg + '°、朝向 ' + d.chaoDeg + '°' : '')],
        ['八煞', '本宫煞向为 ' + d.baSha + (d.fanBaSha ? '，本向犯之' : '，本向不犯')],
        ['倾向', d.tendency]
      ]);

      const rows = SHAN.map((s, i) => ({
        cells: [
          (i === d.zi ? '<b>' + s + '（坐）</b>' : (i === d.ci ? '<b>' + s + '（朝）</b>' : s)),
          shanGong(i) + '宫 · ' + GONG_FANG[shanGong(i)],
          centerDeg(i) + '°',
          rangeText(i),
          U.wx(SHAN_WX[s], SHAN_WX[s]),
          sanyuanOf(i),
          isYang(s) ? '阳' : '阴'
        ],
        cls: (i === d.zi || i === d.ci) ? 'hi' : ''
      }));
      const table = U.table(['山', '卦宫 · 方位', '中心度', '度数区间', '五行', '三元龙', '阴阳'], rows,
        { align: ['c', 'l', 'c', 'c', 'c', 'c', 'c'] });

      const needle = U.table(['层次', '别名', '所主', '说明'], [
        { cells: ['天池', '海底', '定南北', '中置磁针与子午线，罗盘之心；针指磁北，与真北略有偏差（磁偏角）。'], cls: 'hi' },
        { cells: ['地盘正针', '正针 · 地盘', '立向 · 格龙', '二十四山之主，坐山、朝向、来龙皆以此盘为准；本页度数即依此盘。'], cls: 'hi' },
        { cells: ['人盘中针', '中针 · 人盘', '消砂', '较地盘偏半格（7.5°），用以审前后左右砂峰之吉凶。'] },
        { cells: ['天盘缝针', '缝针 · 天盘', '纳水', '较地盘偏半格（7.5°），用以审来去水之吉凶。'] },
        { cells: ['七十二龙', '—', '审龙 · 辨空亡', '每山三龙，二十四山共七十二龙，用以辨来龙之干支与孤虚空亡。'] },
        { cells: ['一百二十分金', '分金', '审兼向', '每山五格、每格三度，共一百二十分金，用以定兼向之吉凶。'] },
        { cells: ['二十八宿', '星度', '消砂 · 量度', '周天列二十八宿与三百六十度，用以量度与消砂。'] }
      ], { align: ['l', 'l', 'l', 'l'] });

      return U.resHead(d.zuo + '山' + d.chao + '向', '罗盘二十四山 · ' + d.tendency) +
        U.card('罗盘示意图', wheelSVG(d.zi, d.ci) +
          U.note('外环为二十四山（每山十五度），内环为八卦宫；朱色者为坐山、蓝色者为朝向，虚线为坐向轴。' +
            '方位按上北下南、左东右西的罗盘惯例排布。')) +
        U.card('坐向详表', info + U.p(d.relT)) +
        U.card('二十四山一览', table) +
        U.card('三元龙与净阴净阳', U.kv([
          ['三元龙', '每宫三山依次为地元龙、天元龙、人元龙：天元龙为子午卯酉与乾坤艮巽，地元龙为甲庚壬丙与辰戌丑未，人元龙为乙辛丁癸与寅申巳亥。三元家以之辨顺逆、取父母子息。'],
          ['本局三元龙', '坐 ' + d.zuo + ' 属' + d.zuoSanyuan + '　朝 ' + d.chao + ' 属' + d.chaoSanyuan],
          ['净阴净阳', '依纳甲归元分：乾甲、坤乙、坎癸申子辰、离壬寅午戌为净阳；艮丙、巽辛、震庚亥卯未、兑丁巳酉丑为净阴。'],
          ['本局阴阳', '坐 ' + d.zuo + ' 属' + d.zuoYY + '　朝 ' + d.chao + ' 属' + d.chaoYY + '　' + (d.sameYY ? '同阴阳，不驳杂' : '一阴一阳，谓之驳杂')],
          ['立向之要', '三合家取「阳山阳向、阴山阴向」，忌阴阳差错；三元家则重三元龙与父母子息相配。两说并存，宜各依所宗。']
        ])) +
        U.card('罗盘层次与三针', needle +
          U.p('三针之说为罗盘常识：地盘正针二十四山为主，人盘中针、天盘缝针各与地盘相差半格（7.5°），' +
            '分主消砂、纳水。至于中针、缝针之顺逆与先后，各家所记不一，此页只列名称与用途。')) +
        U.card('白话结论：宜与忌', U.ul(d.yi.concat(d.ji))) +
        U.card('术语小释', U.kv([
          ['二十四山', '十二地支、八天干（除戊己）与乾坤艮巽四维，共二十四字，每字十五度。'],
          ['坐山 · 朝向', '坐山为宅后所倚之方，朝向为宅前所对之方，二者相差一百八十度。'],
          ['三元龙', '地元龙、天元龙、人元龙，每宫三山各属其一，用以辨顺逆取用。'],
          ['净阴净阳', '以纳甲归元将二十四山分阴阳，立向宜同阴阳，忌阴阳驳杂。'],
          ['正向 · 兼向', '每山十五度分三格，中格五度为正向，左右两格为兼向；兼向吉凶另按分金审之。'],
          ['三针', '地盘正针立向、人盘中针消砂、天盘缝针纳水，三针各差半格。'],
          ['八煞', '八煞歌「坎龙坤兔震山猴，巽鸡乾马兑蛇头，艮虎离猪为煞曜」，谓各宫所忌之向。']
        ])) +
        U.note('本页为简化演示：只以坐山与朝向论五行生克、三元龙与净阴净阳，' +
          '不排七十二龙与一百二十分金，故不判分金与兼向之吉凶；朝向一律取坐山对宫，' +
          '不涉磁偏角校正与真北、磁北之别。' +
          '又度数依通行罗盘（子山中心为正北 0°、每山 15°），引擎 C.SHAN24_DIR 以壬山起 0° 计，' +
          '二者相差 22.5°，本页从通行罗盘。八煞所忌各书所记略有出入，此页从通说。', true) +
        U.disclaim('罗盘立向之说流派互异、异说甚多，本页断语为参考白话，非古籍原文，不作营造、置业之凭据。');
    }
  });
})();
