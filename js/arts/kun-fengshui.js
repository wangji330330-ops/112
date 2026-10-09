/* ============================================================
   坤 · 风水堪舆 —— 形势为纲（觅龙、察砂、观水、点穴、立向），理气为参
   ============================================================ */
(function () {
  'use strict';
  const C = window.CORE, U = C.UI, ART = window.ART;   // 浏览器中 ART 即全局函数

  /* ---------- 二十四山的基本换算（数据取自 C.SHAN24） ---------- */
  const GONG24 = ['坎', '艮', '震', '巽', '离', '坤', '兑', '乾'];   // 每宫三山
  const GONG_FANG = { 坎: '正北', 艮: '东北', 震: '正东', 巽: '东南', 离: '正南', 坤: '西南', 兑: '正西', 乾: '西北' };
  const SANYUAN = ['地元龙', '天元龙', '人元龙'];                    // 每宫三山依次
  const YANG_SHAN = '乾甲坤乙壬寅午戌癸申子辰'.split('');            // 净阳十二山（纳甲归元）
  const SHAN = C.SHAN24, SHAN_WX = C.SHAN24_WX;

  const shanGong = (i) => GONG24[Math.floor(i / 3)];
  const shanCenter = (i) => ((i - 1) * 15 % 360 + 360) % 360;        // 子山中心为正北 0°
  const shanRange = (i) => { const c = shanCenter(i); return ((c - 7.5 + 360) % 360) + '°–' + ((c + 7.5) % 360) + '°'; };
  const isYang = (name) => YANG_SHAN.indexOf(name) >= 0;
  /* 某度数（自正北顺时针）落在哪一卦宫 */
  const gongAtDeg = (deg) => GONG24[Math.floor((Math.round((((deg % 360) + 360) % 360) / 15) % 24) / 3)];

  /* ---------- 周遭形势（固定小地形，作简化评估用） ---------- */
  const DIXING = {
    beishan: { t: '背山面水（后有丘埠、前有池河）', long: 3, qing: 3, bai: 2, shui: 3, tang: 3, note: '后有高阜为靠、前有活水为朝，左右丘垄护持，形局最整。' },
    pingyuan: { t: '平原近水（一望平畴、水在近旁）', long: 1, qing: 1, bai: 1, shui: 3, tang: 3, note: '无高岗可倚，平洋以水为龙、以路为脉；宜借远处埠阜或高楼为靠。' },
    linjie: { t: '临街闹市（门前大路、车马喧腾）', long: 1, qing: 1, bai: 1, shui: 2, tang: 2, note: '路为虚水，来去有情则聚气；然噪杂动气，宜内敛安静以制之。' },
    dudong: { t: '独栋独院（四面空旷无邻）', long: 1, qing: 0, bai: 0, shui: 1, tang: 2, note: '左右无护，八面受风，气散不聚；宜自筑垣墙、栽植以人为砂。' },
    gaolou: { t: '高层公寓（楼中一格）', long: 2, qing: 2, bai: 1, shui: 1, tang: 1, note: '以邻楼为砂、以楼道电梯为水；须看本层前后有无遮挡与穿堂。' },
    kuangye: { t: '旷野无遮（四望无际）', long: 0, qing: 0, bai: 0, shui: 0, tang: 1, note: '无靠无护，风吹气散；宜择高阜、密林、院落以止风聚气。' },
    xiangnong: { t: '巷弄窄居（前后逼仄）', long: 1, qing: 2, bai: 2, shui: 0, tang: 0, note: '两壁逼仄，明堂不足，气不舒畅；宜洁整通路、引光透气。' }
  };

  /* ---------- 白话断语（本页自撰参考语，非古籍原文） ---------- */
  const REL_TEXT = {
    '同': { lv: '宜', t: '坐向比和，气脉相承，格局较易安稳。' },
    '生我': { lv: '宜', t: '朝向之气来生坐山（生我），谓之得助；宜安驻守正，格局易得扶持。' },
    '我生': { lv: '平', t: '坐山之气泄于朝向（我生），气易外泄；宜于明堂收束水势、植木障风以蓄之。' },
    '我克': { lv: '平', t: '坐山克朝向（我克），我制其用；布置得宜则可控，失宜则主客相争。' },
    '克我': { lv: '忌', t: '朝向之气克坐山（克我），气逼其主；宜以绿化、影壁、水池等缓冲，勿使直冲。' }
  };
  const LONG_TXT = ['后无依托，宜择高地或借高树、邻楼为屏。', '靠山单薄，宜以垣墙、植木补其势。', '后有依托，坐山大体安稳。', '层叠有靠，来龙有续，坐山稳厚。'];
  const TANG_TXT = ['明堂逼仄，气不舒；宜清整通道、去其壅塞。', '明堂偏狭，宜留白空地以聚气。', '明堂适中，前庭可容，宜。', '明堂开阔，前有容受之地，宜。'];
  const QING_TXT = ['左无护砂，宜筑墙植木以补青龙。', '左护略弱，宜稍增其势。', '左有护砂，护持有情，宜。', '青龙高耸，护持有力；惟不宜过高压主。'];
  const BAI_TXT = ['右无护砂，宜补。', '右护略弱，宜稍补。', '右有护砂而略低于左，最合「青龙宜高、白虎宜伏」之说，宜。', '白虎过高，谓之白虎抬头，宜稍抑之（修剪、减建、加高左侧）。'];
  const SHUI_TXT = ['近处无水无路，气无所聚；宜设法引水、通路以界气。', '水（路）远而不亲，宜观其来去是否环抱。', '有水（路）近身，宜看来去是否环抱有情。', '水（路）环抱有情，界气聚气，宜。'];

  ART({
    id: 'fengshui',
    name: '风水堪舆',
    alias: ['相地', '堪舆', '形法'],
    gua: 'kun',
    order: 1,
    tagline: '形势与理气纲要 · 觅龙、察砂、观水、点穴、立向',

    intro: `
      <p>堪舆者，堪为天道、舆为地道，合而言之即相地之学。其源甚古，先秦已有相宅相冢之官；
      旧题晋·郭璞《葬书》有「气乘风则散，界水则止」之语，后世遂以「风水」名之。
      唐宋以降，此道大盛，渐分两途：一重目验山川之性情，谓之形势（形法）；一重推算方位之吉凶，谓之理气。</p>
      <p>形势一派以「五要」为纲：<b>觅龙</b>（寻来脉起祖）、<b>察砂</b>（看左右护从）、<b>观水</b>（辨水之来去环抱）、
      <b>点穴</b>（择气聚之处）、<b>立向</b>（定坐朝之方）。其要诀在一「聚」字——后有靠则气不散，
      前有明堂则气可容，左右有砂则气不侧走，水环路抱则气有所止。古人以四灵兽状之：
      后为玄武、前为朱雀、左为青龙、右为白虎。</p>
      <p>理气一派则以八卦方位为骨、以二十四山为度、以五行生克为断，衍生出八宅、玄空、三合、三元诸法，
      专论某方宜某物、某年宜某向。两派各有偏重：形势重「地之形」，理气重「方之数」。
      本页以形势五要为纲，兼采八卦方位、二十四山与五行生克为参，属纲要式的简化演示。</p>`,

    method: `
      <p>先定「坐山」——即宅之后背所倚之方（如坐北朝南，则坐山为子、朝向为午）；
      朝向可留空，本页自动取其对宫。次择「周遭形势」：以固定的小地形选项代指龙、砂、水、堂的大略，
      再选门户开在八卦何方（可留「不详」）。三者俱备，按「起盘」即得形势分项、四灵兽格局与坐向五行生克的评估。</p>
      <p>须留意：本页只用坐山与朝向两个方位，不作罗盘分金、兼向、挨星与宅命盘推算；地形亦只七种固定选项，
      非实地勘察，只能作为「看什么」的提示。</p>`,

    form: [
      {
        name: 'zuo', label: '坐山（宅后所倚）', type: 'select', value: '子',
        options: SHAN.map(s => ({ v: s, t: s + '山' })), hint: '二十四山'
      },
      {
        name: 'chao', label: '朝向', type: 'select', value: '',
        options: [{ v: '', t: '自动（取坐山对宫）' }].concat(SHAN.map(s => ({ v: s, t: s + '向' })))
      },
      {
        name: 'dixing', label: '周遭形势', type: 'select', value: 'beishan',
        options: Object.keys(DIXING).map(k => ({ v: k, t: DIXING[k].t }))
      },
      {
        name: 'men', label: '门户方位', type: 'select', value: '',
        options: [{ v: '', t: '不详' }].concat(GONG24.map(g => ({ v: g, t: g + '方（' + GONG_FANG[g] + '）' })))
      }
    ],

    cast(input) {
      const zuoIn = String(input.zuo === undefined || input.zuo === null ? '子' : input.zuo).trim();
      const zi = SHAN.indexOf(zuoIn);
      if (zi < 0) return { error: '坐山须为二十四山之一' };
      const chaoIn = String(input.chao || '').trim();
      let ci;
      if (chaoIn) {
        ci = SHAN.indexOf(chaoIn);
        if (ci < 0) return { error: '朝向须为二十四山之一' };
        if (ci === zi) return { error: '坐山与朝向不可相同' };
      } else ci = (zi + 12) % 24;

      const dxKey = DIXING[input.dixing] ? input.dixing : 'beishan';
      const dx = DIXING[dxKey];

      const zuo = SHAN[zi], chao = SHAN[ci];
      const zuoWx = SHAN_WX[zuo], chaoWx = SHAN_WX[chao];
      const zg = shanGong(zi), cg = shanGong(ci);
      const rel = C.wxRelation(zuoWx, chaoWx);            // 以坐山为我
      const relInfo = REL_TEXT[rel] || REL_TEXT['同'];
      const relChao = C.wxRelation(chaoWx, zuoWx);        // 以朝向为我的说法，备参
      const sameYY = isYang(zuo) === isYang(chao);

      const menIn = String(input.men || '').trim();
      const menWx = GONG24.indexOf(menIn) >= 0
        ? ({ 坎: '水', 艮: '土', 震: '木', 巽: '木', 离: '火', 坤: '土', 兑: '金', 乾: '金' })[menIn] : '';
      const menRel = menWx ? C.wxRelation(zuoWx, menWx) : '';

      /* 立向评分：五行关系 + 净阴净阳 */
      let xiangScore = ({ '同': 3, '生我': 3, '我克': 2, '我生': 1, '克我': 0 })[rel];
      if (xiangScore === undefined) xiangScore = 2;
      if (!sameYY) xiangScore = Math.max(0, xiangScore - 1);

      const sha = Math.round((dx.qing + dx.bai) / 2);
      const items = [
        { key: '觅龙（后靠）', s: dx.long, txt: LONG_TXT[dx.long] },
        { key: '察砂（左右护）', s: sha, txt: (dx.qing + dx.bai) >= 5 ? '左右护从相称，青龙略高、白虎稍伏，宜。' : '左右护从不足，宜以垣墙、植树、邻楼补之。' },
        { key: '观水（来去）', s: dx.shui, txt: SHUI_TXT[dx.shui] },
        { key: '点穴（明堂）', s: dx.tang, txt: TANG_TXT[dx.tang] },
        { key: '立向（五行·阴阳）', s: xiangScore, txt: relInfo.t + (sameYY ? '坐向同为' + (isYang(zuo) ? '净阳' : '净阴') + '，阴阳不驳杂，宜。' : '坐山与朝向一阴一阳，谓之阴阳驳杂，立向宜再斟酌。') }
      ];
      const total = items.reduce((a, b) => a + b.s, 0);

      const beasts = [
        { name: '玄武', pos: '坐山之后（' + GONG_FANG[zg] + '）', s: dx.long, txt: LONG_TXT[dx.long] },
        { name: '朱雀', pos: '朝向之前（' + GONG_FANG[cg] + '）', s: dx.tang, txt: TANG_TXT[dx.tang] },
        { name: '青龙', pos: '朝向左手（约' + gongAtDeg(shanCenter(ci) - 90) + '宫·' + GONG_FANG[gongAtDeg(shanCenter(ci) - 90)] + '）', s: dx.qing, txt: QING_TXT[dx.qing] },
        { name: '白虎', pos: '朝向右手（约' + gongAtDeg(shanCenter(ci) + 90) + '宫·' + GONG_FANG[gongAtDeg(shanCenter(ci) + 90)] + '）', s: dx.bai, txt: BAI_TXT[dx.bai] }
      ];

      let grade;
      if (total >= 13) grade = '形局大致完备';
      else if (total >= 10) grade = '形局可用，略有小缺';
      else if (total >= 6) grade = '形局有缺，宜设法补救';
      else grade = '形局多缺，宜另择或大加补葺';

      const yi = [], ji = [];
      if (dx.long < 2) ji.push('后方无靠，忌背后空虚无遮（穿堂、后门直通、后窗临空）。');
      else yi.push('后有所倚，宜守住后墙实、少开大窗。');
      if (dx.tang < 2) ji.push('明堂不足，忌门前堆塞、杂物挡路。');
      else yi.push('门前可留余地，宜洁整宽敞以容气。');
      if (sameYY) yi.push('坐向同属' + (isYang(zuo) ? '阳' : '阴') + '，宜守此向，勿轻易改为驳杂之向。');
      else ji.push('坐向阴阳驳杂，若要用事，宜请明家另按三合、玄空之法细推。');
      if (rel === '克我') ji.push('向克坐山，忌堂前尖角、高塔、反弓之路直冲。');
      if (rel === '我生') ji.push('坐山泄气于向，忌前庭过于空旷散荡。');
      if (menWx) {
        if (menRel === '生我' || menRel === '同') yi.push('门户在' + menIn + '方（属' + menWx + '），与坐山（属' + zuoWx + '）相生比和，宜。');
        else if (menRel === '克我') ji.push('门户在' + menIn + '方（属' + menWx + '）克坐山（属' + zuoWx + '），门气逼主，宜设玄关、影壁缓之。');
        else yi.push('门户在' + menIn + '方（属' + menWx + '），与坐山（属' + zuoWx + '）为「' + menRel + '」，属可用之列，宜视通路易否而调之。');
      }
      yi.push('四灵兽之说取其意象：' + (dx.qing >= dx.bai ? '本局青龙不弱于白虎，' : '本局白虎不弱于青龙，宜稍抑右侧、加高左侧，') + '务使左右相称、后实前虚。');

      return {
        zuo: zuo, chao: chao, zuoWx: zuoWx, chaoWx: chaoWx,
        zuoTxt: zuo + '山' + chao + '向', zg: zg, cg: cg,
        zuoGong: zg + '宫（' + GONG_FANG[zg] + '）',
        zuoCenter: shanCenter(zi), chaoCenter: shanCenter(ci),
        zuoRange: shanRange(zi), chaoRange: shanRange(ci),
        zuoSanyuan: SANYUAN[zi % 3], chaoSanyuan: SANYUAN[ci % 3],
        zuoYY: isYang(zuo) ? '净阳' : '净阴', chaoYY: isYang(chao) ? '净阳' : '净阴',
        rel: rel, relLv: relInfo.lv, relT: relInfo.t, relChao: relChao,
        menIn: menIn, menWx: menWx, menRel: menRel,
        sameYY: sameYY, items: items, total: total, grade: grade,
        beasts: beasts, dx: dx,
        yi: yi, ji: ji
      };
    },

    view(d) {
      const relSaid = d.relChao && d.relChao !== d.rel
        ? '（若以朝向为我反观，则为「' + d.relChao + '」；本页主断一律以坐山为我。）' : '';

      const info = U.kv([
        ['坐山', U.wx(d.zuo, d.zuoWx) + '山　' + d.zuoRange + '（中心 ' + d.zuoCenter + '°）'],
        ['朝向', U.wx(d.chao, d.chaoWx) + '向　' + d.chaoRange + '（中心 ' + d.chaoCenter + '°）'],
        ['坐山卦宫', d.zuoGong + '　' + d.zuoSanyuan + '　' + d.zuoYY],
        ['朝向卦宫', d.cg + '宫（' + GONG_FANG[d.cg] + '）　' + d.chaoSanyuan + '　' + d.chaoYY],
        ['五行关系', '坐山属' + d.zuoWx + '，朝向属' + d.chaoWx + ' → ' + d.rel + '（' + d.relLv + '）'],
        ['周遭形势', d.dx.t]
      ]);

      const itemTable = U.table(['五要', '得分', '本页所见'], d.items.map(it => ({
        cells: [it.key, it.s + ' / 3', it.txt], cls: it.s >= 3 ? 'hi' : ''
      })), { align: ['l', 'c', 'l'] });

      const beastTable = U.table(['四灵', '方位', '本页所见'], d.beasts.map(b => ({
        cells: [b.name, b.pos, b.txt], cls: b.s >= 3 ? 'hi' : ''
      })), { align: ['c', 'l', 'l'] });

      return U.resHead(d.zuoTxt, '风水堪舆 · ' + d.grade) +
        U.card('坐向基本信息', info) +
        U.card('四灵兽格局（玄武·朱雀·青龙·白虎）', beastTable +
          U.p('四灵兽取「后实前虚、左高右伏」之意：玄武要厚、朱雀要敞、青龙宜高、白虎宜伏。' +
            '本页依所选地形作简化对照，非实地目验。')) +
        U.card('形势五要评分（合计 ' + d.total + ' / 15）',
          U.bars(d.items.map(it => [it.key, it.s, it.s + '/3'])) + itemTable) +
        U.card('理气参断', U.kv([
          ['坐向五行', '坐山属' + d.zuoWx + '，朝向属' + d.chaoWx + '，关系：' + d.rel + '（' + d.relLv + '）'],
          ['净阴净阳', d.zuoYY + ' / ' + d.chaoYY + '　' + (d.sameYY ? '同为' + d.zuoYY + '，不驳杂' : '一阴一阳，谓之驳杂')],
          ['三元龙', '坐 ' + d.zuoSanyuan + '　朝 ' + d.chaoSanyuan],
          ['门户', d.menWx ? d.menIn + '方属' + d.menWx + '，与坐山为「' + d.menRel + '」' : '未填']
        ]) + U.p(d.relT + relSaid)) +
        U.card('白话结论：宜与忌', U.ul(d.yi.concat(d.ji))) +
        U.card('术语小释', U.kv([
          ['堪舆', '堪为天道、舆为地道，合指相地之学；后世亦称风水。'],
          ['形势（形法）', '以龙、砂、水、穴、向察山川之性情，重实地目验，亦称江西派。'],
          ['理气', '以八卦、二十四山、五行生克与飞星推算方位吉凶，八宅、玄空、三合皆属之。'],
          ['四灵兽', '玄武为后靠、朱雀为前朝、青龙为左护、白虎为右护，取「后实前虚、左高右伏」之象。'],
          ['明堂', '宅前容受聚气之地；宜开阔洁净，忌逼仄壅塞。'],
          ['净阴净阳', '二十四山依纳甲归元分阴阳，坐向宜同阴阳；一阴一阳谓之驳杂，立向宜避。'],
          ['三元龙', '每宫三山依次为地元龙、天元龙、人元龙，论向时用以辨顺逆与兼向。']
        ])) +
        U.note('本页为简化演示：地形只作七种固定选项，未作实地龙、砂、水、穴的目验；' +
          '理气只取坐向五行生克与净阴净阳，未作罗盘分金、兼向、挨星与宅命盘推算；' +
          '坐向度数依通行罗盘（子山中心为正北 0°、每山 15°），与引擎 C.SHAN24_DIR ' +
          '（以壬山起 0° 计）相差 22.5°，本页从通行罗盘。', true) +
        U.disclaim('堪舆之说流派互异，本页断语为参考白话，非古籍原文，亦不构成购屋、营造、投资之依据。');
    }
  });
})();
