/* 四柱八字（子平术）—— 年月日时四柱 · 十神藏干 · 纳音旬空 · 五行旺衰 · 喜用倾向 */
(function () {
  'use strict';
  const C = window.CORE, U = C.UI, G = C.GZ;

  /* ============================================================
     白话素材 —— 皆为编者自撰之参考语，非古籍原文。
     ============================================================ */
  const GAN_DESC = {
    甲: '如参天乔木，性直而志高，重原则、喜开创；宜养其条达，忌执一不通。',
    乙: '如藤萝花草，柔韧善随，重人情、能屈伸；宜借力而上，忌游移无主。',
    丙: '如太阳之火，光明外向，热情而急；宜持之以恒，忌躁而少耐。',
    丁: '如灯烛之火，内明而细，重情思幽微；宜专精一艺，忌多疑自扰。',
    戊: '如城垣厚土，稳重守成，重然诺；宜通变，忌板滞难移。',
    己: '如田园之土，含蓄能容，善蓄养；宜自持自立，忌犹疑反复。',
    庚: '如斧钺之金，刚锐果决，重义气；宜敛其锋，忌过刚招怨。',
    辛: '如珠玉之金，清秀考究，重体面；宜宽和，忌苛细责人。',
    壬: '如江河之水，聪敏善变，胸次开阔；宜有堤防，忌漫无归宿。',
    癸: '如雨露之水，灵秀细密，善体人意；宜自强，忌多愁善感。'
  };
  const SS_DESC = {
    比肩: '自立自主，重同侪，事多亲力亲为；宜有分际。',
    劫财: '进取好胜，敢于争取；宜防耗散与替人受过。',
    食神: '温和有才，善表达与享受；宜以才艺取用。',
    伤官: '才气外露，敢破常规；宜敛锋守分。',
    正财: '务实稳健，重积累与秩序；宜量入为出。',
    偏财: '善交际经营，长于流动之利；宜防铺张。',
    正官: '守规重名分，堪任繁剧；宜循序而进。',
    七杀: '刚决任事，敢当难局；宜有节制与涵养。',
    正印: '好学受荫，重思虑与凭依；宜自立门户。',
    偏印: '思虑深细，偏长一技；宜专精，忌多疑。'
  };
  const GROUP = {
    比劫: { label: '比劫（比肩·劫财）', xing: '自立而重同辈，凡事多亲力亲为，喜与人为伍。', ye: '宜自主经营、同侪协作、以自身技艺或体力取用之业；忌与人争利而无分际。' },
    食伤: { label: '食伤（食神·伤官）', xing: '重表达与创见，才思外露，不耐拘束。', ye: '宜技艺、文教、言论、设计、创作、饮食服务之属；忌恃才而轻视规矩。' },
    财: { label: '财（正财·偏财）', xing: '务实而重实利，讲求经营与人事之通达。', ye: '宜商事、经营、实业、财会、中介流通之属；忌贪多务广而失守。' },
    官杀: { label: '官杀（正官·七杀）', xing: '重规矩与责任，能承压力，好名分。', ye: '宜公职、管理、法度、组织、纪律之属；忌急求名位而失中。' },
    印: { label: '印（正印·偏印）', xing: '重学问与思虑，善受荫亦易依赖。', ye: '宜学问、文书、教育、医护、专业研究之属；忌多思而少断。' }
  };
  const REL_GROUP = { '同': '比劫', '我生': '食伤', '我克': '财', '克我': '官杀', '生我': '印' };
  const REL_TEXT = { '同': '同我（比劫）', '生我': '生我（印）', '我生': '我生（食伤）', '我克': '我克（财）', '克我': '克我（官杀）' };
  const WX_YE = {
    木: '文教、林木、纺织、医药、企划', 火: '能源、光电、餐饮、传播、演艺',
    土: '土建、地产、农产、仓储、中介', 金: '金融、机械、五金、法务、军警', 水: '贸易、物流、水产、旅游、信息'
  };
  const WX_DIR = { 木: '东方', 火: '南方', 土: '中央（及西南、东北）', 金: '西方', 水: '北方' };
  const WX_COLOR_NAME = { 木: '青、绿', 火: '赤、紫', 土: '黄、棕', 金: '白、金', 水: '黑、蓝' };
  const WX_SEASON = { 木: '春', 火: '夏', 土: '四季之末（辰戌丑未月）', 金: '秋', 水: '冬' };

  /* 旺衰三轴之分值（本站约定，见页内说明） */
  const SC_LING = { '同': 3, '生我': 2, '我生': 0, '我克': -1, '克我': -2 };
  const SC_DI = { '同': 1.2, '生我': 0.8, '我生': 0, '我克': -0.6, '克我': -1.2 };
  const SC_SHI = { 比劫: 1, 印: 0.8, 食伤: -0.4, 财: -0.6, 官杀: -1 };

  const mainWxOf = (zhi) => {
    const c = C.ZHI_CANGGAN[zhi];
    return c && c.length ? C.GAN_WX[C.GAN.indexOf(c[0][0])] : '土';
  };
  const wxOfGan = (g) => C.GAN_WX[C.GAN.indexOf(g)];
  const num = (v) => Math.round(v * 100) / 100;

  /* 用 window.ART 登记：浏览器与 Node 冒烟测试（global.window={}）下皆可解析 */
  window.ART({
    id: 'bazi',
    name: '四柱八字',
    alias: ['子平术', '四柱命理', '批八字'],
    gua: 'li',
    order: 1,
    tagline: '年月日时四柱 · 十神藏干、纳音旬空、五行旺衰与喜用倾向',

    intro: `
      <p>四柱之源，出于唐代李虚中以年月日三柱干支论命，至五代宋初徐子平（名居易）增时柱为四柱，
      遂成"子平术"一路。《渊海子平》《三命通会》《滴天髓》诸书皆宗之。其法以干支纪人出生之年、
      月、日、时，各系一天干一地支，合为"八字"，以见人禀气之厚薄与五行之偏全。</p>
      <p>其理在以日干为"我"，以其余七字与我相较而定十神：同我为比劫，我生为食伤，我克为财，
      克我为官杀，生我为印。又以月令为提纲，参地支藏干（本气、中气、余气）与五行之旺衰，
      判日主之强弱；强者宜泄宜克，弱者宜生宜扶，是谓"喜用忌神"。纳音、旬空、十二长生、
      刑冲合害则为之辅。</p>
      <p>八字与紫微斗数同为命理之大宗：八字重五行生克之"气"，紫微重星曜宫位之"象"。
      本页只作排盘与结构之释，不下生死、病名、必成必败之断；旺衰打分与喜用倾向为本站简化之法，
      已在页内逐处注明。</p>`,

    method: `
      <p>填入公历出生之日期与时刻（按北京时间），按"排盘"即得四柱、十神、藏干、纳音、旬空、
      五行统计与日主旺衰之粗判。性别与所问仅供文末备注参考。</p>
      <p>须留意三处口径：<em>年以立春为界</em>（立春前仍属前一年），<em>月以十二节为界</em>
      （立春、惊蛰、清明……非中气），<em>日以 23 时换日</em>（子时即入次日）。
      故本页所得四柱与民间按农历生日口述者，可能有一柱之差，此为历法口径之别，非推算之误。</p>`,

    form: [
      { name: 'dt', label: '出生时间（公历 · 北京时间）', type: 'datetime-local', value: U.nowStr(), wide: true, hint: '立春换年 · 十二节换月 · 23 时换日' },
      { name: 'gender', label: '性别', type: 'chips', options: [{ v: '男', t: '男' }, { v: '女', t: '女' }], value: '男' },
      { name: 'q', label: '所问（可选）', type: 'text', placeholder: '如：近年宜何方向', hint: '仅作参考提示，不入推演' }
    ],

    cast(input) {
      if (!input || !input.dt) return { error: '请先填写出生时间（公历）' };
      const dt = U.parseDT(input.dt);
      const fp = G.fourPillars(dt);
      const dg = fp.day.gan, dgi = C.GAN.indexOf(dg), dwx = C.GAN_WX[dgi];
      const relOf = (wx) => C.wxRelation(dwx, wx);

      /* ---------- 十神统计（日干本身不计） ---------- */
      const ssAll = {}, ssGrp = {};
      const addSS = (g, w) => {
        const ss = C.shiShen(dgi, C.GAN.indexOf(g));
        ssAll[ss] = (ssAll[ss] || 0) + w;
        const grp = REL_GROUP[relOf(wxOfGan(g))];
        ssGrp[grp] = (ssGrp[grp] || 0) + w;
      };

      /* ---------- 四柱 ---------- */
      const ks = [fp.year, fp.month, fp.day, fp.hour];
      const labels = ['年柱', '月柱', '日柱', '时柱'];
      const kongZhi = fp.xun.kongZhi;
      const pillars = ks.map((p, i) => {
        const gi = C.GAN.indexOf(p.gan), zi = C.ZHI.indexOf(p.zhi);
        const cang = (C.ZHI_CANGGAN[p.zhi] || []).map(c => ({
          gan: c[0], w: c[1], ss: C.shiShen(dgi, C.GAN.indexOf(c[0]))
        }));
        if (i !== 2) addSS(p.gan, 1);
        cang.forEach(c => addSS(c.gan, c.w));
        return {
          label: labels[i], name: p.name, gan: p.gan, zhi: p.zhi, ganIdx: gi, zhiIdx: zi,
          nayin: G.nayin(p.idx), changsheng: C.changSheng(dgi, zi),
          ganSS: i === 2 ? '日主（我）' : C.shiShen(dgi, gi),
          cang, kong: kongZhi.indexOf(zi) >= 0,
          jie: p.jie || ''
        };
      });

      /* ---------- 五行统计（天干各计 1；地支藏干按本气 .6 / 中气 .3 / 余气 .1） ---------- */
      const wxCn = {};
      C.WX.forEach(w => { wxCn[w] = 0; });
      ks.forEach(p => { wxCn[wxOfGan(p.gan)] += 1; });
      ks.forEach(p => (C.ZHI_CANGGAN[p.zhi] || []).forEach(c => { wxCn[wxOfGan(c[0])] += c[1]; }));
      C.WX.forEach(w => { wxCn[w] = num(wxCn[w]); });
      const wxCnTotal = num(C.WX.reduce((s, w) => s + wxCn[w], 0));

      /* ---------- 旺衰三轴（本站简化打分） ---------- */
      const monthMainWx = mainWxOf(fp.month.zhi);
      const lingRel = relOf(monthMainWx), lingScore = SC_LING[lingRel];
      const diDetail = [fp.year.zhi, fp.day.zhi, fp.hour.zhi].map(z => {
        const w = mainWxOf(z), r = relOf(w);
        return { zhi: z, wx: w, rel: r, score: SC_DI[r] };
      });
      const diScore = num(diDetail.reduce((s, x) => s + x.score, 0));
      const shiDetail = [fp.year.gan, fp.month.gan, fp.hour.gan].map(g => {
        const r = relOf(wxOfGan(g)), grp = REL_GROUP[r];
        return { gan: g, grp, rel: r, score: SC_SHI[grp] };
      });
      const shiScore = num(shiDetail.reduce((s, x) => s + x.score, 0));
      const total = num(lingScore + diScore + shiScore);
      const verdict = total >= 3 ? '偏旺（身强）' : (total <= -2 ? '偏弱（身弱）' : '中和');

      /* ---------- 喜用与忌神倾向 ---------- */
      const wxGuan = C.WX.filter(w => C.wxKe(w) === dwx)[0];
      const wxYin = C.WX.filter(w => C.wxSheng(w) === dwx)[0];
      const wxShi = C.wxSheng(dwx), wxCai = C.wxKe(dwx);
      let xi = [], ji = [], xiReason = '';
      if (total >= 3) {
        xi = [wxGuan, wxShi, wxCai]; ji = [wxYin, dwx];
        xiReason = '日主偏旺，宜泄其气、用其克：取官杀以制、食伤以泄、财以分，故以 ' + xi.join('、') + ' 为喜；忌再添印比（' + ji.join('、') + '）。';
      } else if (total <= -2) {
        xi = [wxYin, dwx]; ji = [wxGuan, wxCai, wxShi];
        xiReason = '日主偏弱，宜生扶：取印以生、比劫以助，故以 ' + xi.join('、') + ' 为喜；忌官杀、财、食伤之克泄（' + ji.join('、') + '）。';
      } else {
        const sorted = C.WX.slice().sort((a, b) => wxCn[a] - wxCn[b]);
        xi = [sorted[0], sorted[1]]; ji = [sorted[4]];
        xiReason = '日主中和，宜顺月令而求流通：取命中偏少之 ' + xi.join('、') + ' 为调剂，忌一味叠加独旺之 ' + ji[0] + '。';
      }
      const lack = C.WX.filter(w => wxCn[w] < 0.8);

      /* ---------- 调候（寒暖燥湿之粗判） ---------- */
      const mz = fp.month.zhi;
      const tiaohou = (['亥', '子', '丑'].indexOf(mz) >= 0 ? '生于' + mz + '月，天时偏寒，宜有火气以暖之。'
        : (['巳', '午', '未'].indexOf(mz) >= 0 ? '生于' + mz + '月，天时偏暖，宜有水气以润之。'
          : (['辰', '戌'].indexOf(mz) >= 0 ? '生于' + mz + '月，土燥而气杂，宜金水以疏润。'
            : '生于' + mz + '月，土湿而气杂，宜木火以疏通。'))) + '（本站按地支寒暖粗判，非《穷通宝鉴》调候用神之全法。）';

      /* ---------- 主导十神 ---------- */
      const ssList = Object.keys(ssAll).map(k => ({ name: k, v: num(ssAll[k]) })).sort((a, b) => b.v - a.v);
      const grpList = Object.keys(ssGrp).map(k => ({ key: k, v: num(ssGrp[k]), label: GROUP[k].label })).sort((a, b) => b.v - a.v);
      const topGrp = grpList.length ? grpList[0].key : '比劫';

      /* ---------- 地支关系（冲·合·半合） ---------- */
      const zhis = ks.map(p => ({ label: p.name, idx: C.ZHI.indexOf(p.zhi), zhi: p.zhi }));
      const rels = [];
      for (let i = 0; i < zhis.length; i++) {
        for (let j = i + 1; j < zhis.length; j++) {
          const a = zhis[i], b = zhis[j];
          if (C.isLiuChong(a.idx, b.idx)) rels.push(a.label + ' 与 ' + b.label + '：' + a.zhi + b.zhi + '相冲');
          else if (C.isLiuHe(a.idx, b.idx)) rels.push(a.label + ' 与 ' + b.label + '：' + a.zhi + b.zhi + '相合');
          else {
            const ga = C.sanHeGroup(a.idx), gb = C.sanHeGroup(b.idx);
            if (ga && gb && ga.idx === gb.idx) rels.push(a.label + ' 与 ' + b.label + '：' + a.zhi + b.zhi + '同属' + ga.wx + '局（半合）');
          }
        }
      }

      /* ---------- 白话提纲 ---------- */
      const g = GROUP[topGrp];
      const xingge = [
        '日主为' + dg + '（' + dwx + '）：' + GAN_DESC[dg],
        '命中' + g.label + '之气较显，故' + g.xing,
        ssList.length ? '十神中以' + ssList.slice(0, 2).map(s => s.name + '（' + SS_DESC[s.name] + '）').join('、') + '为多。' : ''
      ].filter(Boolean);
      const shiye = [
        g.ye,
        '喜用之五行为' + xi.join('、') + '，相关行当大致如：' + xi.map(w => w + '——' + WX_YE[w]).join('；') + '。',
        '方位之倾向：宜 ' + xi.map(w => WX_DIR[w]).join('、') + '；颜色可参 ' + xi.map(w => WX_COLOR_NAME[w]).join('、') + '；时令则 ' + xi.map(w => WX_SEASON[w]).join('、') + '。'
      ];
      const yiji = [
        '宜：' + xi.map(w => w + '行（' + WX_YE[w] + '）').join('、') + '之方向与人事，循序积累，先立根基而后求进。',
        '忌：' + ji.map(w => w + '行（' + WX_YE[w] + '）').join('、') + '之偏重与独用，尤忌一时贪多、以短取长。',
        '心法：' + (total >= 3 ? '气旺者贵在收敛与承当，宜任事而勿争强。' : (total <= -2 ? '气弱者贵在自立与积聚，宜借力而勿独任。' : '气中和者贵在守常与流通，宜专一而勿摇摆。'))
      ];
      const shaoTxt = lack.length
        ? '五行之中 ' + lack.join('、') + ' 偏少（本站以加权统计低于 0.8 为"偏少"），可于该行之方位、颜色、行当上略微补益；此仅为倾向之说，非必然之缺。'
        : '五行之中无显著偏少之行（本站以加权统计低于 0.8 为"偏少"）。';

      return {
        ok: true, sub: '子平术 · 日主' + dg, dtStr: G.fmtTime(fp.input), gender: input.gender || '—', q: input.q || '',
        dayGan: dg, dayWx: dwx, jieqi: fp.month.jie, kong: fp.xun.kong, kongZhi,
        pillars, wxCn, wxCnTotal,
        wang: { ling: { rel: lingRel, wx: monthMainWx, score: lingScore }, di: { score: diScore, detail: diDetail }, shi: { score: shiScore, detail: shiDetail }, total, verdict },
        xiyong: { xi, ji, reason: xiReason, lack }, tiaohou,
        ssList, grpList, topGrp, rels, xingge, shiye, yiji, shaoTxt
      };
    },

    view(d) {
      if (!d || !d.ok) return U.note('数据有误，请重新排盘。', true);

      /* 四柱表 */
      const cols = d.pillars;
      const gzCell = (p) => '<span class="mono-k">' + U.wx(p.gan, C.GAN_WX[p.ganIdx]) + U.wx(p.zhi, C.ZHI_WX[p.zhiIdx]) + '</span>' +
        (p.kong ? '<br><span style="font-size:10.5px;color:#a8322d">坐旬空</span>' : '');
      const rows = [
        { cells: ['四柱'].concat(cols.map(gzCell)) },
        { cells: ['天干十神'].concat(cols.map(p => p.ganSS === '日主（我）' ? '<b>' + p.ganSS + '</b>' : p.ganSS)) },
        { cells: ['地支藏干'].concat(cols.map(p => p.cang.map(c => U.wx(c.gan) + '<span style="font-size:10.5px">' + c.ss + '</span>').join('　'))) },
        { cells: ['纳音'].concat(cols.map(p => p.nayin)) },
        { cells: ['日主长生'].concat(cols.map(p => p.changsheng)) },
        { cells: ['月令 / 节'].concat(cols.map((p, i) => i === 1 ? p.jie : '—')) }
      ];
      const tbl = U.table(['', '年柱', '月柱', '日柱', '时柱'], rows, { align: ['l'] });

      /* 五行统计 */
      const bars = C.WX.map(w => [U.wx(w, w), d.wxCn[w], d.wxCn[w].toFixed(2)]);

      /* 旺衰 */
      const wangRows = [
        { cells: ['得令（月令本气）', d.wang.ling.wx + ' · ' + REL_TEXT[d.wang.ling.rel], String(d.wang.ling.score)], cls: d.wang.ling.score > 0 ? 'hi' : '' },
        { cells: ['得地（年·日·时三支本气）', d.wang.di.detail.map(x => x.zhi + '·' + x.wx + '·' + REL_TEXT[x.rel].replace(/（.*）/, '')).join('　'), String(d.wang.di.score)] },
        { cells: ['得势（年·月·时三干）', d.wang.shi.detail.map(x => x.gan + '·' + GROUP[x.grp].label.replace(/（.*）/, '')).join('　'), String(d.wang.shi.score)] },
        { cells: ['合计', '本站分界：≥ +3 偏旺；≤ −2 偏弱；其余中和', '<b>' + d.wang.total + '</b>'] }
      ];

      /* 喜用忌神 */
      const xyChips = U.chips(d.xiyong.xi.map(w => ({ t: '喜 ' + w + ' · ' + WX_YE[w], sel: true })).concat(d.xiyong.ji.map(w => ({ t: '忌 ' + w }))));

      /* 十神 */
      const ssTbl = U.table(['十神', '加权'], d.ssList.map(s => ({ cells: [s.name + '　' + SS_DESC[s.name], s.v.toFixed(2)], cls: s.name === d.ssList[0].name ? 'hi' : '' })), { align: ['l'] });

      return U.resHead('四柱八字', '日主 ' + d.dayGan + ' · ' + d.wang.verdict) +
        U.kv([['出生（东八区）', U.esc(d.dtStr)], ['性别', U.esc(d.gender)], ['月令节气', U.esc(d.jieqi) + '后'], ['日柱旬空', U.esc(d.kong)], ['所问', U.esc(d.q) || '—']]) +
        U.note('本页四柱按立春换年、十二节换月、23 时换日排定，节界以真太阳黄经计；旺衰打分与喜用倾向皆为<strong>本站简化之法</strong>，' +
          '非古法"用神"之全备（真法须参格局、调候、通关、病药等），仅供结构之参考。全页不涉生死、病名、' +
          '投资盈亏与婚姻成败之断言。', true) +
        U.card('四柱排盘', tbl, '十神以日干为我 · 纳音 · 长生 · 旬空') +
        U.card('五行统计（加权）', U.bars(bars) + U.note('计法：天干各计 1；地支藏干按本气 0.6、中气 0.3、余气 0.1 计（子卯酉等单气之支计 1，午亥为 0.7/0.3）。合计 ' + d.wxCnTotal + ' 分。')) +
        U.card('日主旺衰之粗判', U.table(['三轴', '所见', '分值'], wangRows, { align: ['l'] }) +
          U.note('本站以三轴相加减为分：<em>得令</em>看月支本气（同我 +3、生我 +2、我生 0、我克 −1、克我 −2）；' +
            '<em>得地</em>看年、日、时三支本气（同我 +1.2、生我 +0.8、我克 −0.6、克我 −1.2，月支已入得令故不重计）；' +
            '<em>得势</em>看日干外之三干（比劫 +1、印 +0.8、食伤 −0.4、财 −0.6、官杀 −1）。此系为便于理解而设的<strong>简化模型</strong>，' +
            '古法另有得气、通根、会局、从化诸端，未及备载。', true)) +
        U.card('喜用与忌神之倾向', xyChips + U.p(U.esc(d.xiyong.reason)) + U.p(U.esc(d.tiaohou)) + U.p(U.esc(d.shaoTxt))) +
        U.card('十神分布', ssTbl, '藏干与天干并计 · 日干不计') +
        U.card('地支关系', d.rels.length ? U.ul(d.rels.map(U.esc)) : U.p('四支之间无明显冲、合、半合。')) +
        U.card('白话命理提纲', U.ul([].concat(
          d.xingge.map(x => '<b>性情禀赋：</b>' + U.esc(x)),
          d.shiye.map(x => '<b>事业倾向：</b>' + U.esc(x)),
          d.yiji.map(x => U.esc(x))
        )), '编者自撰之参考语，非古籍原文') +
        U.card('术语小释', U.kv([
          ['十神', '以日干为"我"，其余干支与之相较所得之名目：比劫、食伤、财、官杀、印各分偏正。'],
          ['藏干', '地支中所含之天干。本气为主，中气、余气次之，是"通根"与"暗神"之所据。'],
          ['月令', '月柱地支。为八字之提纲，日主旺衰首重于此。'],
          ['得令·得地·得势', '分别看月令、地支通根、天干帮扶，合而判日主之强弱。'],
          ['喜用忌神', '利于日主之五行为喜用，不利者为忌神。本站以旺衰三轴之结果粗定。'],
          ['旬空', '六十甲子分六旬，每旬有二支无干相配，谓空亡。日柱之旬空即本命旬空。']
        ])) +
        U.disclaim('八字之说流派甚多，本页所排者为干支历之结构，所断者为编者自撰之白话参考，请勿据以决断人生大事。');
    }
  });
})();
