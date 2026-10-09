/* ============================================================
   六壬金口诀 —— 以「地分、月将、贵神、人元」四位立课
   大六壬之简法。金口诀流派取法不一，本站取法均在页面注明。
   ============================================================ */
(function () {
  'use strict';
  const C = window.CORE, U = C.UI, G = C.GZ, ART = window.ART;
  const ZHI = C.ZHI;

  const mod12 = function (i) { return ((i % 12) + 12) % 12; };

  /* 十二贵神本家之支（金口诀一派取法：贵人丑、螣蛇巳、朱雀午、六合卯、勾陈辰、青龙寅、
     天空戌、白虎申、太常未、玄武子、太阴酉、天后亥），用于定贵神之五行 */
  const JIANG_BEN = {
    贵人: '丑', 螣蛇: '巳', 朱雀: '午', 六合: '卯', 勾陈: '辰', 青龙: '寅',
    天空: '戌', 白虎: '申', 太常: '未', 玄武: '子', 太阴: '酉', 天后: '亥'
  };
  const JIANG_LUCK = { 贵人: 1, 螣蛇: -1, 朱雀: 0, 六合: 1, 勾陈: -1, 青龙: 1, 天空: -1, 白虎: -1, 太常: 1, 玄武: -1, 太阴: 1, 天后: 1 };

  const DIR12 = ['正北', '北偏东', '东偏北', '正东', '东偏南', '南偏东', '正南', '南偏西', '西偏南', '正西', '西偏北', '北偏西'];
  const FEN_OPTIONS = ZHI.map(function (z, i) { return { v: z, t: z + '（' + DIR12[i] + '）' }; });

  function timeFromInput(s) {
    const m = String(s || '').match(/(\d{4})-(\d{1,2})-(\d{1,2})[T ](\d{1,2}):(\d{1,2})/);
    if (!m) return null;
    const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), Number(m[4]), Number(m[5]));
    return isNaN(d.getTime()) ? null : d;
  }

  /* 以 a 为我，述 a 与 b 的生克 */
  function pairDesc(aWx, bWx, aName, bName) {
    const r = C.wxRelation(aWx, bWx);
    if (r === '同') return aName + '与' + bName + '同属' + aWx + '，比和相安、气势均平';
    if (r === '我生') return aName + '（' + aWx + '）生' + bName + '（' + bWx + '），' + aName + '泄气以助' + bName;
    if (r === '生我') return bName + '（' + bWx + '）生' + aName + '（' + aWx + '），' + aName + '得其扶助';
    if (r === '我克') return aName + '（' + aWx + '）克' + bName + '（' + bWx + '），' + aName + '能制' + bName;
    if (r === '克我') return bName + '（' + bWx + '）克' + aName + '（' + aWx + '），' + aName + '受制于' + bName;
    return '';
  }
  const REL_SHORT = { 同: '比和', 我生: '我生之', 生我: '生我', 我克: '我克之', 克我: '克我' };

  ART({
    id: 'jinkoujue',
    name: '六壬金口诀',
    alias: ['金口诀', '孙膑金口诀', '大六壬金口诀'],
    gua: 'kan',
    order: 3,
    tagline: '地分、月将、贵神、人元四位立课，大六壬之简捷法门。',

    intro: `
      <p>金口诀又称"孙膑金口诀""大六壬金口诀"，相传为战国孙膑所传，是六壬一系中最为简捷的一支。
      大六壬要布天地盘、起四课、定三传，手续繁复；金口诀则只取"地分、月将、贵神、人元"四位，
      立一课而断万事，故民间有"学会金口诀，敢把万事说"之谚。其法多存于明清抄本与民间口授，
      著录远不如《六壬大全》之盛，故流派分歧亦多。</p>
      <p>四位的含义是：地分者，所占之方位（十二地支定之），为一课之根基，代表自己与所处之地；
      月将者，太阳过中气后所躔之次，代表当下之时势与事之本体；贵神者，由日干起天乙贵人，
      再依顺逆推至地分所得之十二天将，代表神明、外援与贵贱之力；人元者，以日干起五鼠遁所遁得之天干，
      代表天时、上位者与外来之事。四位自上而下，即天、神、将、地四层。</p>
      <p>断法之要，在四位之间的五行生克：贵神与月将论事之成败，人元与地分论主客之强弱，
      再以四位对日干的六亲定事类，以用神之支定应期。本站排盘与本页断语皆依此框架，
      凡流派异说处均在下方注明，读者可自行对照诸本。</p>`,

    method: `
      <p>先择"地分"——即所占之方位或所关注的地支（如问北方之事取子、问东南之事取辰巳），
      再填起课时间，本站即自动排四位：以日干起贵人（分昼夜）顺逆推至地分得贵神，
      以中气取月将，以日干起五鼠遁遁至地分得人元天干。</p>
      <p>四位排定后，本站逐对列出五行生克，并就"神将（贵神与月将）""上下（人元与地分）"两对给出主断，
      再以四位对日干的六亲（官鬼、妻财、父母、子孙、兄弟）看所问何事当机，最后给出应期参考。</p>
      <p>本站所用地分为十二地支（非二十四山），贵神依"日干贵人＋地分"推得，人元用"日干起子时"
      的五鼠遁通行取法。三者皆为流派之一，非金口诀之唯一正法。</p>`,

    form: [
      { name: 'dt', label: '起课时间', type: 'datetime-local', value: U.nowStr(), wide: true },
      { name: 'fen', label: '地分（方位地支）', type: 'select', options: FEN_OPTIONS, value: '子', hint: '所占之方位，以地支表示' },
      { name: 'q', label: '所问何事', type: 'text', placeholder: '如：此事宜否向东南方谋求', hint: '可选，仅作记录' }
    ],

    /* ---------------- 起课（纯函数） ---------------- */
    cast(input) {
      const dt = timeFromInput(input.dt);
      if (!dt) return { error: '请填写完整的起课时间（年-月-日 时:分）' };
      const fenIdx = ZHI.indexOf(String(input.fen || '子').charAt(0));
      if (fenIdx < 0) return { error: '地分须为十二地支之一' };

      const fp = G.fourPillars(dt);
      const yj = G.yueJiang(dt);
      const dayGanIdx = C.GAN.indexOf(fp.day.gan);
      const ganWx = C.GAN_WX[dayGanIdx];
      const hourZhiIdx = ZHI.indexOf(fp.hour.zhi);

      /* 一、地分 */
      const diFen = fenIdx;

      /* 二、月将 */
      const yueJiang = yj.zhi;

      /* 三、贵神：日干取贵人（昼贵／夜贵），依贵人落支顺逆推至地分 */
      const isDay = hourZhiIdx >= 3 && hourZhiIdx <= 8;      /* 卯至申为昼 */
      const guiPair = C.GUI_REN[fp.day.gan];
      const guiZhi = ZHI.indexOf(isDay ? guiPair[0] : guiPair[1]);
      const shun = [11, 0, 1, 2, 3, 4].indexOf(guiZhi) >= 0; /* 贵人临亥子丑寅卯辰顺行，余逆行 */
      const guiShenIdx = shun ? mod12(diFen - guiZhi) : mod12(guiZhi - diFen);
      const guiShen = C.TIAN_JIANG[guiShenIdx];
      const guiShenZhi = ZHI.indexOf(JIANG_BEN[guiShen]);

      /* 四、人元：以日干起五鼠遁（甲己还加甲、乙庚丙作初……），遁至地分所得之干 */
      const yuanGanIdx = (((dayGanIdx % 5) * 2) + diFen) % 10;
      const renYuan = C.GAN[yuanGanIdx];

      /* 四位 */
      const siWei = [
        { name: '人元', kind: '天干', val: renYuan, wx: C.GAN_WX[yuanGanIdx], note: '日干起五鼠遁遁至地分所得，主天时、上位者、外来之事' },
        { name: '贵神', kind: '天将', val: guiShen + '（' + JIANG_BEN[guiShen] + '）', wx: C.ZHI_WX[guiShenZhi], note: '日干贵人顺逆推至地分所得，主外援、贵贱、神明之力' },
        { name: '月将', kind: '地支', val: ZHI[yueJiang], wx: C.ZHI_WX[yueJiang], note: yj.zhongqi + '后过宫，主时势、事之本体' },
        { name: '地分', kind: '地支', val: ZHI[diFen] + '（' + DIR12[diFen] + '）', wx: C.ZHI_WX[diFen], note: '所占方位，主自己、根基、所处之地' }
      ];
      siWei.forEach(function (w) { w.qin = C.liuQin(ganWx, w.wx); });

      const W = {
        renYuan: C.GAN_WX[yuanGanIdx], guiShen: C.ZHI_WX[guiShenZhi],
        yueJiang: C.ZHI_WX[yueJiang], diFen: C.ZHI_WX[diFen]
      };

      /* 逐对生克 */
      const rels = [
        { a: '贵神', b: '月将', t: '神将（主事之成败）', aw: W.guiShen, bw: W.yueJiang },
        { a: '人元', b: '地分', t: '上下（主客之强弱）', aw: W.renYuan, bw: W.diFen },
        { a: '贵神', b: '地分', t: '神地（外援与根基）', aw: W.guiShen, bw: W.diFen },
        { a: '月将', b: '地分', t: '将地（时势与根基）', aw: W.yueJiang, bw: W.diFen },
        { a: '人元', b: '贵神', t: '天人（时势与外援）', aw: W.renYuan, bw: W.guiShen }
      ].map(function (r) {
        r.desc = pairDesc(r.aw, r.bw, r.a, r.b);
        r.short = REL_SHORT[C.wxRelation(r.aw, r.bw)] || '—';
        return r;
      });

      /* 六亲统计（以日干为我） */
      const qinCount = {};
      siWei.forEach(function (w) { qinCount[w.qin] = (qinCount[w.qin] || 0) + 1; });
      const qinMain = Object.keys(qinCount).sort(function (a, b) { return qinCount[b] - qinCount[a]; })[0];

      /* 白话断语 */
      const duan = [];

      /* 1. 神将 */
      let s1 = '贵神' + guiShen + '（' + W.guiShen + '）与月将' + ZHI[yueJiang] + '（' + W.yueJiang + '）：' +
        pairDesc(W.guiShen, W.yueJiang, '贵神', '月将') + '。';
      const jsRel = C.wxRelation(W.guiShen, W.yueJiang);
      if (jsRel === '生我') s1 += '月将生贵神，是事体来扶外援，得贵人提携、神明默佑，事多顺遂。';
      else if (jsRel === '我生') s1 += '贵神生月将，是外援之力尽付于事，须先费己力而后见功。';
      else if (jsRel === '我克') s1 += '贵神克月将，外援反压事体，贵人虽在而与我意相违，谋事宜换其法，忌倚势强为。';
      else if (jsRel === '克我') s1 += '月将克贵神，事体反制外援，主事在己、不必过求于人，然须亲力亲为方成。';
      else s1 += '神将同气，事体与外援相合，气机平稳，宜循常规而行。';
      duan.push({ t: '神将', s: s1 });

      /* 2. 上下（主客） */
      let s2 = '人元' + renYuan + '（' + W.renYuan + '）与地分' + ZHI[diFen] + '（' + W.diFen + '）：' +
        pairDesc(W.renYuan, W.diFen, '人元', '地分') + '。';
      const ryRel = C.wxRelation(W.renYuan, W.diFen);
      if (ryRel === '我生') s2 += '人元生地分，外来之力来助我方，客来就主，凡事得助力，宜开门纳之。';
      else if (ryRel === '生我') s2 += '地分生人元，是我出资以奉外，主耗己而成人之事，宜量力而止。';
      else if (ryRel === '我克') s2 += '人元克地分，客来克主，外来之势压我根基，宜低调固本、勿与人争锋。';
      else if (ryRel === '克我') s2 += '地分克人元，我方能制外来之事，主客之势在我，宜主动出手、据理而争。';
      else s2 += '上下同气，主客相当，事之成败多在人谋，宜协商共济。';
      duan.push({ t: '上下（主客）', s: s2 });

      /* 3. 神地、将地 */
      duan.push({
        t: '外援与时势', s: '贵神与地分：' + pairDesc(W.guiShen, W.diFen, '贵神', '地分') + '；' +
          '月将与地分：' + pairDesc(W.yueJiang, W.diFen, '月将', '地分') + '。' +
          '凡神、将克地分者，外势凌逼，宜守；凡神、将生地分者，外势扶我，宜进。'
      });

      /* 4. 六亲 */
      const QIN_SHI = {
        官鬼: '官鬼为事之管束与压力，多主职务、考核、争讼、约束之事，宜循规守分。',
        妻财: '妻财为事之实利与用度，多主财货、经营、妻妾、实得之物，宜务实而取。',
        父母: '父母为事之凭据与护荫，多主文书、契约、长辈、屋宅，宜求文书立据。',
        子孙: '子孙为事之泄气与福乐，多主后辈、技艺、医药、消解，宜以柔化之。',
        兄弟: '兄弟为事之比肩与分夺，多主同事、朋友、竞争、耗散，宜明分而不争。'
      };
      duan.push({
        t: '六亲（以日干为我）', s: '四位六亲：' + siWei.map(function (w) { return w.name + '为' + w.qin; }).join('，') + '。' +
          '其中' + qinMain + '最重（' + qinCount[qinMain] + '见），' + (QIN_SHI[qinMain] || '') +
          '四见俱全者事类繁杂，一见独重者事机专一。'
      });

      /* 5. 吉凶与主客总倾向 */
      let sc = 0;
      if (jsRel === '生我') sc += 2; else if (jsRel === '同') sc += 1;
      else if (jsRel === '我生') sc -= 1; else if (jsRel === '我克') sc -= 2;
      if (ryRel === '我生') sc += 2; else if (ryRel === '同') sc += 1;
      else if (ryRel === '克我') sc += 1; else if (ryRel === '生我') sc -= 1; else if (ryRel === '我克') sc -= 2;
      sc += JIANG_LUCK[guiShen] || 0;
      const kongZhi = fp.xun.kongZhi.slice();
      const xunKong = fp.xun.kong;
      if (kongZhi.indexOf(guiShenZhi) >= 0) sc -= 1;
      if (kongZhi.indexOf(diFen) >= 0) sc -= 1;
      const zong = sc >= 3 ? '四位生多克少，气机偏顺，事有可成之理，宜乘时而进。'
        : (sc >= 1 ? '生克相半而略偏于吉，得人助则成，独行则滞，宜借力而行。'
          : (sc >= -1 ? '吉凶两平，事之成败多视人为，宜守正待时、勿贪勿急。'
            : '四位克多生少，气机偏阻，宜减损所求、先固根基，强求反招损。'));
      duan.push({ t: '吉凶总断', s: zong + '（上述为四位五行生克之倾向推演，非定论。）' });

      /* 6. 应期 */
      let yongZhi, yongName;
      if (jsRel === '我克') { yongZhi = yueJiang; yongName = '月将' + ZHI[yueJiang]; }
      else if (jsRel === '克我') { yongZhi = guiShenZhi; yongName = '贵神本家' + JIANG_BEN[guiShen]; }
      else { yongZhi = diFen; yongName = '地分' + ZHI[diFen]; }
      const hePair = C.LIU_HE.filter(function (p) { return p.indexOf(yongZhi) >= 0; })[0];
      const heZhi = hePair ? (hePair[0] === yongZhi ? hePair[1] : hePair[0]) : mod12(yongZhi + 1);
      const chongZhi = mod12(yongZhi + 6);
      const grp = C.sanHeGroup(yongZhi);
      const yongRel = C.wxRelation(C.ZHI_WX[yongZhi], ganWx);
      const su = yongRel === '我克' ? '用神克日干，其势急，应期偏速，多在旬日之内见分晓'
        : (yongRel === '克我' ? '日干克用神，其势缓，我可制之，应期偏迟，宜从容以待'
          : (yongRel === '我生' ? '用神生日干，来助我者，应期在近而得力'
            : (yongRel === '生我' ? '日干生用神，我去费力，应期较迟且须先付出'
              : '用神与日干比和，应期中平，不远不近')));
      duan.push({
        t: '应期参考', s: '取用神为' + yongName + '（' + C.ZHI_WX[yongZhi] + '）。' +
          '或以用神之支（' + ZHI[yongZhi] + '）、或其六合之支（' + ZHI[heZhi] + '）、或其相冲之支（' + ZHI[chongZhi] + '）' +
          (grp ? '、或其三合之支（' + grp.zhi.map(function (z) { return ZHI[z]; }).join('、') + '）' : '') +
          '之日月为期。' + su + '。' +
          (kongZhi.indexOf(yongZhi) >= 0 ? '用神落旬空（' + xunKong + '），事多虚延时日，须待填实之时方见眉目。' :
            '用神不落旬空，事有着落，可依期而待。') +
          '（应期取象各家不一，此为本站从简之法，仅供参考。）'
      });

      return {
        dateStr: fp.input.y + '-' + G.pad2(fp.input.m) + '-' + G.pad2(fp.input.d) + ' ' + G.pad2(fp.input.h) + ':' + G.pad2(fp.input.min),
        dayGz: fp.day.name, dayGan: fp.day.gan, dayZhi: fp.day.zhi,
        hourGz: fp.hour.name, hourZhi: fp.hour.zhi,
        yueJiangName: yj.name, zhongqi: yj.zhongqi,
        isDay: isDay, guiZhi: ZHI[guiZhi],
        guiShen: guiShen, shun: shun,
        renYuan: renYuan, diFen: ZHI[diFen], diFenDir: DIR12[diFen],
        siWei: siWei, rels: rels, sanHe: grp,
        xunKong: xunKong, kongZhi: kongZhi,
        duan: duan, zong: zong,
        qi: input.q ? U.esc(input.q) : ''
      };
    },

    /* ---------------- 结果渲染 ---------------- */
    view(d) {
      let h = U.resHead('四位立课 · ' + d.guiShen, '六壬金口诀 · ' + d.dayGz + '日 ' + d.hourZhi + '时');

      h += U.card('起课', U.kv([
        ['起课时刻', d.dateStr],
        ['日柱', d.dayGz + '（' + d.dayGan + '日）'],
        ['时柱', d.hourGz + '（' + (d.isDay ? '昼占 · 用昼贵' : '夜占 · 用夜贵') + '）'],
        ['月将', U.wx(d.yueJiangName) + '（' + d.zhongqi + '后过宫）'],
        ['日干贵人', U.wx(d.guiZhi) + '，' + (d.shun ? '顺行' : '逆行') + '推至地分'],
        ['地分', U.wx(d.diFen) + '（' + d.diFenDir + '）'],
        ['人元', U.wx(d.renYuan)],
        ['旬空', U.wx(d.xunKong.charAt(0)) + U.wx(d.xunKong.charAt(1))],
        ['所问', d.qi || '—']
      ]));

      /* 四位盘 */
      h += U.card('四位（天 · 神 · 将 · 地）',
        U.table(['位', '干支', '五行', '六亲（以日干为我）', '取法说明'],
          d.siWei.map(function (w) {
            const v = String(w.val);
            return { cells: [w.name, U.wx(v.charAt(0)) + U.esc(v.slice(1)), w.wx, w.qin, w.note], left: [4] };
          }), { align: ['c', 'c', 'c', 'c', 'l'] }) +
        U.note('四位自上而下为：人元（天）、贵神（神）、月将（将）、地分（地）。表中"干支"一列以五行着色标出本位之主字。'));

      /* 四位生克 */
      h += U.card('四位生克', U.table(
        ['关系', '以何为我', '生克', '白话'],
        d.rels.map(function (r) {
          return { cells: [r.t, r.a + '（' + r.aw + '）', REL_SHORT[C.wxRelation(r.aw, r.bw)] || '—', r.desc], left: [3] };
        }), { align: ['l', 'c', 'c', 'l'] }));

      /* 断语 */
      h += U.card('白话断语（参考，非古籍原文）', d.duan.map(function (x) {
        return U.p('<b>' + x.t + '</b>：' + x.s);
      }).join(''));

      /* 术语 */
      h += U.card('术语小释', U.kv([
        ['四位', '地分、月将、贵神、人元，是金口诀立课的四要素，自下而上为地、将、神、天四层。'],
        ['地分', '所占之方位，以十二地支表示（子为正北、卯为正东、午为正南、酉为正西）。为一课之根基，代表自己。'],
        ['月将', '太阳过中气后所躔之次（登明、河魁、从魁……），代表当下时势与事之本体，与"月建"不同。'],
        ['贵神', '由日干起天乙贵人（甲戊庚牛羊、乙己鼠猴乡、丙丁猪鸡位、壬癸兔蛇藏、六辛逢马虎），分昼夜贵，再依顺逆推至地分，所得天将即贵神。'],
        ['人元', '四位中的天干，以日干起五鼠遁（甲己还加甲、乙庚丙作初、丙辛从戊起、丁壬庚子居、戊癸壬子是真途）遁至地分所得。'],
        ['六亲', '以日干五行为我，看四位五行与我的关系，得官鬼、妻财、父母、子孙、兄弟，以定事类。'],
        ['旬空', '日干支所在旬中轮空的两个地支（如甲子旬空戌亥）。用神落空主虚耗、迟延，须待填实。']
      ]));

      /* 简化声明 */
      h += U.note('金口诀流派取法不一，本站明记所用规则：① 地分取十二地支（不用二十四山）；' +
        '② 贵神＝以日干取贵人（昼贵用卯至申时、夜贵用酉至寅时），贵人临地盘亥子丑寅卯辰者顺行、临巳午未申酉戌者逆行，自贵人起顺／逆数至地分所得之天将；' +
        '③ 人元＝以日干起五鼠遁（日干起子时）遁至地分所得之天干，即"日干起时"的通行取法，另有以五虎遁取干者，本站不取；' +
        '④ 贵神之五行依十二贵神本家之支（贵人丑、螣蛇巳、朱雀午、六合卯、勾陈辰、青龙寅、天空戌、白虎申、太常未、玄武子、太阴酉、天后亥）推得，此亦一派之说。', true);
      h += U.note('本站断语以"贵神为外援、月将为事体、人元为外来天时、地分为自己根基"为框架，' +
        '用四位五行生克与日干六亲推演吉凶、主客、应期；金口诀古本断法尚有"五乡""三才""十干生克"等多种体系，本站未及备载，故断语仅供参考。', true);
      h += U.note('应期取"用神之支、其六合、其相冲、其三合"之日月为期，并以用神与日干生克定迟速，此为本站从简之法，古法应期另有以数取、以空亡填实取诸说。', true);
      h += U.disclaim('金口诀月将、日时干支由本站干支历引擎按太阳黄经推算，与坊间历书或有一二分差异。');
      return h;
    }
  });
})();
