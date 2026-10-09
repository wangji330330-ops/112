/* ============================================================
   大六壬 —— 月将加时布天地盘，四课定三传，十二天将断吉凶
   三式之一。本站力求合于古法，凡流派异说与未能考实处均随文注明。
   ============================================================ */
(function () {
  'use strict';
  const C = window.CORE, U = C.UI, G = C.GZ, ART = window.ART;
  const ZHI = C.ZHI;

  const mod12 = function (i) { return ((i % 12) + 12) % 12; };

  /* 十二支相刑（辰午酉亥为自刑） */
  const XING = {
    子: '卯', 卯: '子', 寅: '巳', 巳: '申', 申: '寅',
    丑: '戌', 戌: '未', 未: '丑', 辰: '辰', 午: '午', 酉: '酉', 亥: '亥'
  };
  /* 驿马：申子辰马在寅、寅午戌马在申、巳酉丑马在亥、亥卯未马在巳 */
  const MA = { 0: '寅', 4: '寅', 8: '寅', 2: '申', 6: '申', 10: '申', 5: '亥', 9: '亥', 1: '亥', 11: '巳', 3: '巳', 7: '巳' };
  const MENG = [2, 5, 8, 11];          /* 四孟 寅巳申亥 */
  const ZHONG = [0, 3, 6, 9];          /* 四仲 子卯午酉 */

  /* 天将吉凶倾向（用于成败评断，非古书原文） */
  const JIANG_GOOD = { 贵人: 1, 螣蛇: -1, 朱雀: 0, 六合: 1, 勾陈: -1, 青龙: 1, 天空: -1, 白虎: -1, 太常: 1, 玄武: -1, 太阴: 1, 天后: 1 };

  /* 九宗门课体释义（白话自撰，非古籍原文） */
  const KETI_INFO = {
    '元首课': { y: '上克下一神独发，如君令臣行、尊长得位。', d: '事体有纲有纪，起于外来之势而我能执其柄；宜正名分、循次第而进，先难后易，忌自乱阵脚。' },
    '重审课': { y: '下贼上一神独发，须详审而后动。', d: '事多由内而起、由下而发，或起于你不曾留意之处；宜再三审度、缓行一步，躁进则受制于人。' },
    '比用课': { y: '克者有二三，取与日干比和（同阴阳）者为用，一名知一课。', d: '同类相求、同事相牵，事有同伴可倚，亦有旁人分权；宜择一而从，忌多头并进、左右摇摆。' },
    '涉害课': { y: '比用之后仍有两可，取涉历受克深者为用。', d: '事必经曲折、涉历艰辛而后见分晓；先难后易，宜忍一时之屈，忌因小阻而废大计。' },
    '蒿矢课': { y: '四课上下无克，取上神遥克日干者为用，如蒿为矢，力弱而气锐。', d: '事从外来而力薄，虚惊多、实祸少；宜静观其变、不必先动，防口舌小人是非。' },
    '弹射课': { y: '四课无克亦无上神克干，取日干遥克上神者为用，如弹丸远射。', d: '我心有所求而力有不逮，事须借力、须待时机；宜托人代言，忌独力强求。' },
    '昴星课': { y: '无上下克、无遥克，取昴星为用（阳日虎视、阴日冬蛇掩目）。', d: '事在暗昧未明之地，进退未定、消息未真；宜守正待时、静以观变，妄动则入彀中。' },
    '别责课': { y: '四课不全（三课），别取他神为用。', d: '事不专一，须假手于人、借他事之力方能推进；独立难成，宜明定职责、勿两头落空。' },
    '八专课': { y: '干支同位，四课只得两课，故另取顺逆三神为用。', d: '事在己身、内外交缠，旁人难以插手；宜自立自守、亲力亲为，忌听外人挑拨而生内耗。' },
    '伏吟课': { y: '月将与占时同支，天地盘重合，伏而不动。', d: '事静而不动，忧喜皆迟，旧事重提之象；宜守不宜动，动则无功，宜培本以待时。' },
    '返吟课': { y: '月将与占时相冲，天地盘相冲，返而复来。', d: '事多反复、去而复返、动而不宁，已成之事恐再翻转；宜速了不宜拖延，宜留退路。' }
  };

  /* 四课上下关系（以"下"为我） */
  const SIKE_REL = { 同: '比和', 我生: '下生上', 生我: '上生下', 我克: '下贼上（贼）', 克我: '上克下（克）' };
  const CHUAN_NAME = ['初传', '中传', '末传'];

  const SHI_OPTIONS = [
    { v: 'zong', t: '综合断' }, { v: 'cai', t: '求财' }, { v: 'guan', t: '功名求职' },
    { v: 'hun', t: '婚姻' }, { v: 'xing', t: '出行' }, { v: 'song', t: '官讼' }, { v: 'shi', t: '寻失' }
  ];
  const SHI_NAME = { zong: '综合', cai: '求财', guan: '功名求职', hun: '婚姻', xing: '出行', song: '官讼', shi: '寻失' };

  /* 克某五行者为何五行 */
  function keOf(wx) {
    for (let i = 0; i < C.WX.length; i++) if (C.wxKe(C.WX[i]) === wx) return C.WX[i];
    return '';
  }
  /* 类神取象（传统取类，本站从简） */
  function leiShenOf(shi, ganWx) {
    if (shi === 'cai') return { wx: C.wxKe(ganWx), jiang: ['青龙', '太常'], note: '求财以日干所克之支为财爻，并看青龙、太常是否临之' };
    if (shi === 'guan') return { wx: keOf(ganWx), jiang: ['贵人', '青龙'], note: '功名求职以克日干之支为官鬼，并看贵人、青龙是否临之' };
    if (shi === 'hun') return { wx: '', jiang: ['六合', '天后'], note: '婚姻以六合、天后为类神，并看干支上神是否相合' };
    if (shi === 'xing') return { wx: '', jiang: ['青龙', '白虎'], note: '出行以驿马为类神，并看驿马是否入传、是否落空' };
    if (shi === 'song') return { wx: keOf(ganWx), jiang: ['朱雀', '勾陈'], note: '官讼以朱雀、勾陈与官鬼为类神，最忌螣蛇、勾陈缠扰' };
    if (shi === 'shi') return { wx: '', jiang: ['玄武', '天空'], note: '寻失以玄武、天空与旬空为类神，重在失物之宫与填实之期' };
    return null;
  }

  /* 纯函数：字符串时间 → Date（不用 new Date()，保证可复现） */
  function timeFromInput(s) {
    const m = String(s || '').match(/(\d{4})-(\d{1,2})-(\d{1,2})[T ](\d{1,2}):(\d{1,2})/);
    if (!m) return null;
    const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), Number(m[4]), Number(m[5]));
    return isNaN(d.getTime()) ? null : d;
  }

  /* 与日干的关系（以支为我） */
  function relGanName(z, ganIdx) {
    return { 同: '比和', 我生: '生干', 生我: '干生支', 我克: '克干（鬼）', 克我: '干克支（财）' }[C.wxRelation(C.ZHI_WX[z], C.GAN_WX[ganIdx])] || '—';
  }
  function relGanDesc(z, ganIdx) {
    const r = C.wxRelation(C.ZHI_WX[z], C.GAN_WX[ganIdx]);
    if (r === '同') return '与日干比和，事在同类比肩之间，宜协力不宜独断';
    if (r === '我生') return '生助日干，事来助我、有人相扶';
    if (r === '生我') return '日干生之，我去费力，主耗己以成事';
    if (r === '我克') return '克日干而为官鬼，主压逼、约束、是非';
    if (r === '克我') return '日干克之而为财，可得而须用力去取';
    return '';
  }

  ART({
    id: 'daliuren',
    name: '大六壬',
    alias: ['六壬', '壬课', '大六壬课'],
    gua: 'kan',
    order: 1,
    tagline: '月将加时 · 天地盘、四课、三传，十二天将断吉凶，三式之一。',

    intro: `
      <p>大六壬与奇门遁甲、太乙神数并称"三式"，是古法中最为讲究"课"的一门。其名"六壬"，
      历来约有两说：一说壬为阳水、为天一生水之数，六十甲子中天干为壬者凡六（壬申、壬午、壬辰、壬寅、壬子、壬戌），故名；
      一说取《周易》"乾元用九、坤元用六"之旨，壬属水、主智、位居北方，六壬即取水智周流、随物赋形之义。
      相传其法肇端甚古，成体系的记载多见于《六壬大全》《大六壬指南》《六壬粹言》等书。</p>
      <p>其法之要，全在"月将加时"四字。以太阳过中气后所躔之次为月将，以起课的时辰为地盘落点，
      把月将放到时支之上，其余十一支依法顺布，天地盘便成了；这一步等于把"天时"叠到"人时"上。
      再以日干寄宫与日支各取其上神，得四课；四课上下相较，按"贼克、比用、涉害、遥克、昴星、别责、八专、伏吟、返吟"九宗门定出发用，
      发用为初传，循天盘推中传、末传，合为三传。</p>
      <p>三传既定，则以十二天将从贵人起、依落宫顺逆布于天盘，看何将乘何神，再参以旬空、遁干、六亲，
      便成一课。课与课的不同，先在课体，次在四课三传的上下生克与天将性情：初传看事之起因，中传看事之中段，
      末传看事之终局。本站排盘力求合于古法，凡涉流派异说或本站从简之处，均在结果页随文注明，断语皆白话参考，不作断言。</p>`,

    method: `
      <p>点"起课"即以当前或你指定的时刻排一课。本站自动取月将、日干支、时支，按"月将加时"布天地盘，
      依九宗门定三传，再配十二天将、旬空、遁干，最后按课体与三传结构出白话断语。</p>
      <p>若所问有具体事类，可选一事类：本站按传统取象（求财看财爻与青龙、功名看官鬼与贵人、婚姻看六合天后、
      出行看驿马、官讼看朱雀勾陈、寻失看玄武空亡）在三传四课中核其有无、是否落空、有无天将可乘，另出一段专断。</p>
      <p>昼夜之分：卯至申时为昼占、用昼贵；酉至寅时为夜占、用夜贵。贵人临地盘亥子丑寅卯辰六宫者十二天将顺行，
      临巳午未申酉戌六宫者逆行。</p>
      <p>课体名目（元首、重审、比用、涉害、蒿矢、弹射、昴星、别责、八专、伏吟、返吟）即本课的性质提纲，
      先读课体，再看三传，则一盘之势自见。</p>`,

    form: [
      { name: 'dt', label: '起课时间', type: 'datetime-local', value: U.nowStr(), wide: true },
      { name: 'shi', label: '所问事类', type: 'select', options: SHI_OPTIONS },
      { name: 'q', label: '所问何事', type: 'text', placeholder: '如：此番商谈能否谈成', hint: '可选，仅作记录' }
    ],

    /* ---------------- 起课（纯函数） ---------------- */
    cast(input) {
      const dt = timeFromInput(input.dt);
      if (!dt) return { error: '请填写完整的起课时间（年-月-日 时:分）' };

      const fp = G.fourPillars(dt);
      const yj = G.yueJiang(dt);
      const dayGanIdx = C.GAN.indexOf(fp.day.gan);
      const hourZhiIdx = ZHI.indexOf(fp.hour.zhi);
      const dayZhiIdx = ZHI.indexOf(fp.day.zhi);
      const jiGong = ZHI.indexOf(C.JI_GONG[fp.day.gan]);
      const ganWx = C.GAN_WX[dayGanIdx];
      const ganYang = C.GAN_YY[dayGanIdx] === 1;

      /* ---- 天地盘：月将加时，天盘顺布 ---- */
      const tian = [];                       /* tian[地盘宫] = 天盘支序 */
      for (let d = 0; d < 12; d++) tian[d] = mod12(yj.zhi + d - hourZhiIdx);
      const gongOfTian = [];                 /* 反查：天盘支 → 所临地盘宫 */
      for (let d = 0; d < 12; d++) gongOfTian[tian[d]] = d;

      /* ---- 十二天将：以日干取贵人，昼夜分贵，落宫定顺逆 ---- */
      const isDay = hourZhiIdx >= 3 && hourZhiIdx <= 8;      /* 卯至申为昼 */
      const guiPair = C.GUI_REN[fp.day.gan];
      const guiZhi = ZHI.indexOf(isDay ? guiPair[0] : guiPair[1]);
      const guiGong = gongOfTian[guiZhi];
      const shun = [11, 0, 1, 2, 3, 4].indexOf(guiGong) >= 0; /* 临亥子丑寅卯辰顺行 */
      const jiangAt = [];                    /* jiangAt[地盘宫] = 所乘天将 */
      for (let d = 0; d < 12; d++) {
        const k = shun ? mod12(tian[d] - guiZhi) : mod12(guiZhi - tian[d]);
        jiangAt[d] = C.TIAN_JIANG[k];
      }
      const jiangOf = function (z) { return jiangAt[gongOfTian[z]]; };

      /* ---- 旬遁干与旬空 ---- */
      const kongZhi = fp.xun.kongZhi.slice();
      /* 旬首恒为甲日，其干支序号必为 10 的倍数；旬首之支 = 该序号 mod 12 */
      const xunShouZhi = mod12(fp.day.idx - (fp.day.idx % 10));
      const dunGan = function (z) {
        const off = mod12(z - xunShouZhi);
        return off <= 9 ? C.GAN[off] : '';
      };

      /* ---- 四课 ---- */
      const k1up = tian[jiGong], k1dn = jiGong;              /* 干阳课 */
      const k2up = tian[k1up], k2dn = k1up;                  /* 干阴课 */
      const k3up = tian[dayZhiIdx], k3dn = dayZhiIdx;        /* 支阳课 */
      const k4up = tian[k3up], k4dn = k3up;                  /* 支阴课 */
      const pairs = [
        { i: 1, up: k1up, dn: k1dn, tag: '干阳（日干寄宫）' },
        { i: 2, up: k2up, dn: k2dn, tag: '干阴（干上神之上神）' },
        { i: 3, up: k3up, dn: k3dn, tag: '支阳（日支）' },
        { i: 4, up: k4up, dn: k4dn, tag: '支阴（支上神之上神）' }
      ];

      /* ---- 九宗门定三传 ---- */
      const zei = [], ke = [];
      pairs.forEach(function (p) {
        const r = C.wxRelation(C.ZHI_WX[p.dn], C.ZHI_WX[p.up]);   /* 以"下"为我 */
        if (r === '我克') zei.push(p);          /* 下贼上 */
        else if (r === '克我') ke.push(p);      /* 上克下 */
      });
      const fuYin = mod12(yj.zhi - hourZhiIdx) === 0;
      const fanYin = mod12(yj.zhi - hourZhiIdx) === 6;

      /* 涉害深浅：自天盘神所临之地盘宫顺数至其本家，计沿途克我（天盘神）者之数（简化） */
      function sheHaiCount(t) {
        const lin = gongOfTian[t], home = t;
        let cnt = 0, d = lin, guard = 0;
        while (d !== home && guard++ < 13) {
          if (C.wxRelation(C.ZHI_WX[d], C.ZHI_WX[t]) === '我克') cnt++;
          d = mod12(d + 1);
        }
        return cnt;
      }
      /* 涉害相等时，取四孟上神（见机），无孟取四仲（察微），无仲取四季（缀瑕） */
      function pickSheHai(pool) {
        const scored = pool.map(function (p) { return { p: p, n: sheHaiCount(p.up) }; });
        let max = -1;
        scored.forEach(function (s) { if (s.n > max) max = s.n; });
        let top = scored.filter(function (s) { return s.n === max; });
        if (top.length > 1) {
          const meng = top.filter(function (s) { return MENG.indexOf(gongOfTian[s.p.up]) >= 0; });
          if (meng.length) top = meng;
          else {
            const zhong = top.filter(function (s) { return ZHONG.indexOf(gongOfTian[s.p.up]) >= 0; });
            if (zhong.length) top = zhong;
          }
        }
        return top[0].p;
      }
      /* 遥克内部的比用／涉害取一 */
      function pickYaoKe(pool) {
        const bi = pool.filter(function (t) { return C.ZHI_YY[t] === C.GAN_YY[dayGanIdx]; });
        const use = bi.length ? bi : pool;
        if (use.length === 1) return use[0];
        const fake = use.map(function (t) { return { up: t }; });
        return pickSheHai(fake).up;
      }

      let keti = '', men = '', chu = -1, zhong = -1, mo = -1;
      const ups = [k1up, k2up, k3up, k4up];
      const uniqUps = ups.filter(function (v, i) { return ups.indexOf(v) === i; });

      const cands = zei.length ? zei : ke;
      const kind = zei.length ? '贼' : (ke.length ? '克' : '');

      if (cands.length) {
        /* ①②③ 贼克 → 比用 → 涉害 */
        let pick;
        if (cands.length === 1) {
          pick = cands[0];
          keti = kind === '贼' ? '重审课' : '元首课';
        } else {
          const bi = cands.filter(function (p) { return C.ZHI_YY[p.up] === C.GAN_YY[dayGanIdx]; });
          if (bi.length === 1) { pick = bi[0]; keti = '比用课'; }
          else { pick = pickSheHai(bi.length ? bi : cands); keti = '涉害课'; }
        }
        chu = pick.up;
        zhong = tian[chu]; mo = tian[zhong];
        if (fanYin) { keti = '返吟课'; men = '有克'; }
      } else if (fuYin) {
        /* ⑧ 伏吟：天地盘重合，四课无上下克。阳日取干上神、阴日取支上神，中末取刑。 */
        chu = ganYang ? k1up : k3up;
        const x1 = ZHI.indexOf(XING[ZHI[chu]]);
        zhong = (x1 === chu) ? (ganYang ? k3up : k1up) : x1;      /* 自刑另取 */
        const x2 = ZHI.indexOf(XING[ZHI[zhong]]);
        mo = (x2 === zhong) ? mod12(zhong + 6) : x2;              /* 自刑取冲 */
        keti = '伏吟课'; men = ganYang ? '自任（阳日）' : '自信（阴日）';
      } else if (fanYin) {
        /* ⑨ 返吟无克：无亲课（井栏射），取日支驿马发用，中传支上神、末传干上神 */
        chu = ZHI.indexOf(MA[dayZhiIdx]);
        zhong = k3up; mo = k1up;
        keti = '返吟课'; men = '无克·无亲（井栏射）';
      } else if (jiGong === dayZhiIdx) {
        /* ⑦ 八专：干支同位，四课只得两课。阳日干上神顺数三神，阴日支上神逆数三神，中末皆归干上神。 */
        chu = ganYang ? mod12(k1up + 2) : mod12(k3up - 2);
        zhong = k1up; mo = k1up;
        keti = '八专课';
      } else {
        /* ④ 遥克：上神克日干为蒿矢，日干克上神为弹射 */
        let list = uniqUps.filter(function (t) { return C.wxRelation(C.ZHI_WX[t], ganWx) === '我克'; });
        let yk = '蒿矢';
        if (!list.length) {
          list = uniqUps.filter(function (t) { return C.wxRelation(ganWx, C.ZHI_WX[t]) === '我克'; });
          yk = '弹射';
        }
        if (list.length) {
          chu = pickYaoKe(list);
          zhong = tian[chu]; mo = tian[zhong];
          keti = '遥克课'; men = yk;
        } else if (uniqUps.length <= 3) {
          /* ⑥ 别责：四课不全。阳日取干合之干寄宫上神，阴日取日支三合前一位之上神，中末皆归干上神。 */
          if (ganYang) {
            const heGan = C.GAN[(dayGanIdx + 5) % 10];
            chu = tian[ZHI.indexOf(C.JI_GONG[heGan])];
          } else {
            const grp = C.sanHeGroup(dayZhiIdx);
            const gi = grp ? grp.zhi.indexOf(dayZhiIdx) : 0;
            chu = tian[grp ? grp.zhi[(gi + 1) % 3] : dayZhiIdx];
          }
          zhong = k1up; mo = k1up;
          keti = '别责课';
        } else {
          /* ⑤ 昴星：四课全备而无克无遥克。阳日取地盘酉上神，阴日取天盘酉所临之地盘支。 */
          if (ganYang) {
            chu = tian[9]; zhong = k3up; mo = k1up;
            men = '虎视（阳日）';
          } else {
            chu = gongOfTian[9]; zhong = k1up; mo = k3up;
            men = '冬蛇掩目（阴日）';
          }
          keti = '昴星课';
        }
      }
      /* 兜底：理论上不会落空，若落空则取干上神发用并注明 */
      let fallback = false;
      if (chu < 0 || chu === undefined || zhong < 0 || mo < 0) {
        fallback = true;
        chu = k1up; zhong = tian[chu]; mo = tian[zhong];
        keti = '未定课（兜底）'; men = '';
      }

      /* ---- 三传详目 ---- */
      const san = [chu, zhong, mo].map(function (z, i) {
        return {
          name: CHUAN_NAME[i],
          zhi: z,
          jiang: jiangOf(z),
          dun: dunGan(z),
          qin: C.liuQin(ganWx, C.ZHI_WX[z]),
          kong: kongZhi.indexOf(z) >= 0,
          relName: relGanName(z, dayGanIdx),
          relDesc: relGanDesc(z, dayGanIdx)
        };
      });

      /* ---- 白话断语（皆由盘面结构推出，非套语） ---- */
      const duan = [];
      const ki = KETI_INFO[keti] || { y: '本课九宗门无一相合，取干上神为用以备一格。', d: '结构不明，宜就事论事，勿以课断为凭。' };
      duan.push({ t: '课体', s: keti + (men ? '（' + men + '）' : '') + '：' + ki.y + ki.d });
      if (fallback) duan.push({ t: '说明', s: '本课不落九宗门任何一门，为极端情形，本站以干上神发用兜底，中末仍循天盘推之，断语可参考而不可尽信。' });

      /* 发用 */
      let f = '发用为' + ZHI[chu] + '乘' + jiangOf(chu) + '（' + C.ZHI_WX[chu] + '），';
      if (chu === k1up) f += '即日干之上神，事发于你当前所处之地、切身之事；';
      else if (chu === k3up) f += '即日支之上神，事发于他人或外在环境；';
      else if (chu === k2up) f += '取日干阴神，事发于暗处、旁人之口或尚未显形之事；';
      else if (chu === k4up) f += '取日支阴神，事发于外缘之隐情；';
      else f += '为课中特取之神，事发之不循常理处；';
      if (kongZhi.indexOf(chu) >= 0) f += '而发用落旬空，多虚声先动、实意后减，宜核实而后信。';
      else f += '发用不空，事有实着，可即以此为着手处。';
      duan.push({ t: '发用', s: f });

      /* 三传始终 */
      const chuanTxt = san.map(function (s, i) {
        return CHUAN_NAME[i] + ZHI[s.zhi] + '乘' + s.jiang + (s.kong ? '（旬空）' : '');
      }).join('，');
      const r1 = C.wxRelation(C.ZHI_WX[chu], C.ZHI_WX[zhong]);
      const r2 = C.wxRelation(C.ZHI_WX[zhong], C.ZHI_WX[mo]);
      let move;
      if (chu === zhong && zhong === mo) move = '三传皆同，事无变化、伏而难行';
      else if (r1 === '我生' && r2 === '我生') move = '初生中、中生末，三传递生，事有接力、渐入佳境';
      else if (r1 === '我克' && r2 === '我克') move = '初克中、中克末，三传顺克，事势节节相制，宜步步为营';
      else if (r1 === '克我' && r2 === '克我') move = '末克中、中克初，三传逆克，压力自终及始，须防后患';
      else if (r1 === '生我' || r2 === '生我') move = '三传之间见回生之气，事虽曲折而尚有机可转';
      else move = '三传生克杂见，事无一路顺逆，宜分段看：初传看因、中传看势、末传看果';
      duan.push({ t: '三传始终', s: chuanTxt + '。' + move + '。' });

      /* 终局 */
      duan.push({
        t: '终局', s: '末传' + ZHI[mo] + '乘' + jiangOf(mo) + '：' + (C.JIANG_DESC[jiangOf(mo)] || '') +
          '以末传与日干论之，' + relGanDesc(mo, dayGanIdx) + (kongZhi.indexOf(mo) >= 0 ? '；然末传落空，终局恐成虚话，宜早作退步。' : '。')
      });

      /* 主客内外 */
      const relZk = C.wxRelation(C.ZHI_WX[k1up], C.ZHI_WX[k3up]);
      let zk = '干上神' + ZHI[k1up] + '为"我"之现况，支上神' + ZHI[k3up] + '为"彼"之现况：';
      if (relZk === '同') zk += '两神比和，主客势力相当，胜负全在人事之勤，宜协商而进。';
      else if (relZk === '我克') zk += '干上克支上，我强彼弱、我可以制之，宜主动出手、据理而争。';
      else if (relZk === '克我') zk += '支上克干上，彼强我弱、受制于人，宜守分退让、先固根本。';
      else if (relZk === '我生') zk += '干上生支上，我费力而利归于彼，主耗己以成人之事。';
      else zk += '支上生干上，彼来助我、得外力扶持，事有所依。';
      if (C.isLiuHe(k1up, k3up)) zk += '且干支上神六合，两情相投、事易谐和。';
      if (C.isLiuChong(k1up, k3up)) zk += '而干支上神相冲，两情相违、恐生变卦。';
      duan.push({ t: '主客内外', s: zk });

      /* 迟速 */
      let chi = '';
      if (keti === '伏吟课') chi += '伏吟之课天地不动，事必迟滞，非旬月不见其动。';
      if (keti === '返吟课') chi += '返吟之课天地相冲，事必速动，然去而复返、反复难安。';
      chi += shun ? '贵人顺行，气机顺遂，事宜循序渐进、由近及远；' : '贵人逆行，气机逆转，事宜退守待时、由外察内；';
      const kongCnt = san.filter(function (s) { return s.kong; }).length;
      if (kongCnt === 3) chi += '三传俱落旬空，事多虚耗、迟而无功，宜先止而后图。';
      else if (kongCnt > 0) chi += '三传中有' + kongCnt + '传落空，其间必有一段虚延时日。';
      else chi += '三传不落空亡，事有着落，可计日而待。';
      duan.push({ t: '迟速', s: chi });

      /* 成败倾向 */
      let sc = 0;
      const moRel = C.wxRelation(C.ZHI_WX[mo], ganWx);
      if (moRel === '我生') sc += 2;
      else if (moRel === '同') sc += 1;
      else if (moRel === '克我') sc += 1;
      else if (moRel === '我克') sc -= 2;
      else sc -= 1;
      const moJiang = jiangOf(mo);
      sc += JIANG_GOOD[moJiang] || 0;
      if (kongCnt === 0) sc += 1; else sc -= 1;
      const k1rel = C.wxRelation(C.ZHI_WX[k1up], ganWx);
      if (k1rel === '我生') sc += 1;
      else if (k1rel === '我克') sc -= 1;
      const cheng = sc >= 3 ? '结构偏顺，事有望成，然须循三传次第而行，不可越次。'
        : (sc >= 1 ? '半吉半否，成中带阻，得人相助则可，独行则滞。'
          : (sc >= -1 ? '事在两可之间，成否多视人事之勤惰与时机之迟速。'
            : '结构偏阻，事多波折，宜缓图、宜减损所求，强求无益。'));
      duan.push({ t: '成败倾向', s: cheng + '（此为盘面结构之倾向，非定论。）' });

      /* 类神专断 */
      const ls = leiShenOf(input.shi, ganWx);
      if (ls) {
        const all = ups.concat(san.map(function (s) { return s.zhi; }));
        const uniq = all.filter(function (v, i) { return all.indexOf(v) === i; });
        let txt = ls.note + '。';
        if (ls.wx) {
          const hit = uniq.filter(function (z) { return C.ZHI_WX[z] === ls.wx; });
          if (hit.length) {
            txt += '课中' + ls.wx + '神有' + hit.map(function (z) { return ZHI[z]; }).join('、') + '，类神入课、事有着落；';
            const kongHit = hit.filter(function (z) { return kongZhi.indexOf(z) >= 0; });
            if (kongHit.length) txt += '然' + kongHit.map(function (z) { return ZHI[z]; }).join('、') + '落旬空，此类之事多虚而不实，须待填实之期。';
            else txt += '且不落旬空，可着力于此。';
          } else {
            txt += '三传四课中不见' + ls.wx + '神，类神不入课，此事恐无着力之处，宜暂缓或另寻门路。';
          }
        }
        if (ls.jiang && ls.jiang.length) {
          const jh = san.filter(function (s) { return ls.jiang.indexOf(s.jiang) >= 0; })
            .map(function (s) { return s.name + '乘' + s.jiang; });
          txt += jh.length ? ('三传中' + jh.join('、') + '，类神得将，有可倚之力。') : ('三传不见' + ls.jiang.join('、') + '，类神无将可乘，助力稍薄。');
        }
        if (input.shi === 'xing') {
          const maZhi = ZHI.indexOf(MA[dayZhiIdx]);
          const inChuan = san.some(function (s) { return s.zhi === maZhi; });
          txt += '日支' + ZHI[dayZhiIdx] + '之驿马在' + ZHI[maZhi] + '，' + (inChuan ? '驿马入传，行有动机，宜动不宜守。' : '驿马不入传，行者未必即行，宜待时而动。');
        }
        if (input.shi === 'hun') {
          txt += C.isLiuHe(k1up, k3up) ? '干支上神六合，两情相悦，可议礼仪之事。' : '干支上神不合，情意尚需经营，不宜急切。';
        }
        duan.push({ t: '类神（' + (SHI_NAME[input.shi] || '综合') + '）', s: txt });
      }

      return {
        keti: keti, men: men,
        dateStr: fp.input.y + '-' + G.pad2(fp.input.m) + '-' + G.pad2(fp.input.d) + ' ' + G.pad2(fp.input.h) + ':' + G.pad2(fp.input.min),
        dayGz: fp.day.name, dayGan: fp.day.gan, dayZhi: fp.day.zhi,
        hourGz: fp.hour.name, hourZhi: fp.hour.zhi,
        yueJiang: yj.name, zhongqi: yj.zhongqi,
        isDay: isDay, guiZhi: ZHI[guiZhi], guiGong: guiGong, shun: shun,
        kong: fp.xun.kong, kongZhi: kongZhi,
        jiGong: jiGong, dayZhiIdx: dayZhiIdx, hourZhiIdx: hourZhiIdx,
        tian: tian, jiangAt: jiangAt,
        dun: tian.map(dunGan),
        siKe: pairs.map(function (p) {
          return {
            i: p.i, up: p.up, dn: p.dn, tag: p.tag,
            rel: SIKE_REL[C.wxRelation(C.ZHI_WX[p.dn], C.ZHI_WX[p.up])] || '—',
            jiang: jiangOf(p.up), dun: dunGan(p.up)
          };
        }),
        san: san,
        duan: duan,
        fallback: fallback,
        qi: input.q ? U.esc(input.q) : '',
        shi: SHI_NAME[input.shi] || '综合'
      };
    },

    /* ---------------- 结果渲染 ---------------- */
    view(d) {
      let h = U.resHead(d.keti + (d.men ? ' · ' + d.men : ''), '大六壬 · ' + d.dayGz + '日 ' + d.hourZhi + '时');

      h += U.card('起课', U.kv([
        ['起课时刻', d.dateStr],
        ['四柱（日时）', d.dayGz + '日　' + d.hourGz + '时'],
        ['月将', U.wx(d.yueJiang) + '（' + d.zhongqi + '后过宫）'],
        ['昼夜贵', (d.isDay ? '昼占 · 用昼贵' : '夜占 · 用夜贵') + '　贵人' + U.wx(d.guiZhi)],
        ['贵人落宫', '地盘' + U.wx(C.ZHI[d.guiGong]) + '宫，十二天将' + (d.shun ? '顺行' : '逆行')],
        ['旬空', U.wx(d.kong[0]) + U.wx(d.kong[1])],
        ['事类', d.shi],
        ['所问', d.qi || '—']
      ]));

      /* 天地盘：天盘、天将、遁干、地盘上下叠列 */
      const diRow = C.ZHI.map(function (z, i) {
        const mk = [];
        if (i === d.hourZhiIdx) mk.push('时·将');
        if (i === d.jiGong) mk.push('干寄');
        if (i === d.dayZhiIdx) mk.push('日支');
        if (d.kongZhi.indexOf(d.tian[i]) >= 0) mk.push('空');
        if (i === d.guiGong) mk.push('贵');
        return U.wx(z) + (mk.length ? ' <span class="tag">' + mk.join('/') + '</span>' : '');
      });
      /* 十二宫盘：每格为一地盘宫，中间大字为所临之天盘神 */
      let board = '<div class="gong9">';
      for (let i = 0; i < 12; i++) {
        const mk = [];
        if (i === d.hourZhiIdx) mk.push('时·将');
        if (i === d.jiGong) mk.push('干寄');
        if (i === d.dayZhiIdx) mk.push('日支');
        if (d.kongZhi.indexOf(d.tian[i]) >= 0) mk.push('空');
        if (i === d.guiGong) mk.push('贵人');
        board += '<div class="cell">' +
          '<div class="gn">地盘' + U.wx(C.ZHI[i]) + (mk.length ? ' · ' + mk.join(' ') : '') + '</div>' +
          '<div class="gz">' + U.wx(C.ZHI[d.tian[i]]) + '</div>' +
          '<div class="gs">' + d.jiangAt[i] + ' · ' + (d.dun[i] ? '遁' + d.dun[i] : '无遁') + '</div>' +
          '</div>';
      }
      board += '</div>';

      h += U.card('天地盘 · 十二宫盘',
        board +
        U.note('每格为一地盘宫：上方小字为地盘支及其标记（时·将＝占时与月将所临、干寄＝日干寄宫、日支＝日支所在、空＝该宫天盘神落旬空、贵人＝贵人临宫），' +
          '中间大字为该宫所临之天盘神，下方为该神所乘天将与旬遁之干。'), '月将加时、天盘顺布');

      h += U.card('天地盘 · 上下叠列详表',
        U.table([''].concat(C.ZHI), [
          { cells: ['天将'].concat(d.jiangAt), cls: '' },
          { cells: ['天盘'].concat(d.tian.map(function (t) { return U.wx(C.ZHI[t]); })) },
          { cells: ['遁干'].concat(d.dun.map(function (g) { return g || '—'; })) },
          { cells: ['地盘'].concat(diRow), cls: 'hi' }
        ], { align: ['l'] }) +
        U.note('天盘[地盘宫] = 月将 + （宫 - 时支），即"月将加时、天盘顺布"。表中"遁干"为日干支所在旬的旬遁之干，旬空之支无遁干。'),
        '天将／天盘／遁干／地盘 四行叠列');

      /* 四课 */
      h += U.card('四课', U.table(
        ['课', '上神（天盘）', '下神（地盘）', '上下关系', '天将', '遁干（上神）', '说明'],
        d.siKe.map(function (k) {
          return {
            cells: [k.i + '课', U.wx(C.ZHI[k.up]), U.wx(C.ZHI[k.dn]), k.rel, k.jiang, k.dun || '—', k.tag],
            left: [6]
          };
        }), { align: ['c', 'c', 'c', 'c', 'c', 'c', 'l'] }), '干阳、干阴、支阳、支阴');

      /* 三传 */
      h += U.card('三传', U.table(
        ['传', '支', '天将', '遁干', '五行', '六亲（以日干为我）', '旬空', '与日干'],
        d.san.map(function (s) {
          return {
            cells: [s.name, U.wx(C.ZHI[s.zhi]), s.jiang, s.dun || '—', C.ZHI_WX[s.zhi], s.qin,
              s.kong ? '<b>空</b>' : '—', s.relName]
          };
        }), { align: ['c', 'c', 'c', 'c', 'c', 'c', 'c', 'c'] }), '初传发用 · 中传 · 末传');

      /* 断语 */
      h += U.card('白话断语（参考，非古籍原文）', d.duan.map(function (x) {
        return U.p('<b>' + x.t + '</b>：' + x.s);
      }).join(''));

      /* 术语 */
      h += U.card('术语小释', U.kv([
        ['月将', '太阳过中气后所躔之次，即十二月将（登明、河魁、从魁……）。大六壬以月将为天盘之首，"月将加时"即把天盘叠到地盘上。'],
        ['贵人', '天乙贵人，十二天将之首。以日干取（甲戊庚牛羊、乙己鼠猴乡、丙丁猪鸡位、壬癸兔蛇藏、六辛逢马虎），分昼贵、夜贵；贵人落宫定诸将顺逆。'],
        ['四课', '日干寄宫与其上神为干阳、干阴二课，日支与其上神为支阳、支阴二课，合为四课，即"我"与"彼"的上下两层现况。'],
        ['三传', '初传（发用）主事之始，中传主事之中，末传主事之终，合称三传，是一课的核心。'],
        ['发用', '即初传，四课中"动"的那一点。发用落空则事虚无实，发用克日干则事起即有压力。'],
        ['旬空', '日干支所在旬中轮空的两个地支（如甲子旬空戌亥）。用神落空主虚耗、迟滞、事不实。'],
        ['九宗门', '定三传的九种法门：贼克、比用、涉害、遥克、昴星、别责、八专、伏吟、返吟。'],
        ['天将', '贵人、螣蛇、朱雀、六合、勾陈、青龙、天空、白虎、太常、玄武、太阴、天后十二将，乘于天盘神上，以其性情论吉凶。']
      ]));

      /* 简化声明 */
      h += U.note('本站九宗门判定顺序为：贼克 → 比用 → 涉害 →（伏吟）→（返吟）→ 遥克 → 八专 → 别责 → 昴星。' +
        '因伏吟、返吟是整体盘式（月将与占时同支／相冲），必须优先判别，故未列于末；八专（干支同位、四课只得两课）若不先于别责判定，会被误作别责课。此为传统异说之一，故明记于此。', true);
      h += U.note('涉害深浅为简化算法：只计自天盘神所临地盘宫顺数至本家的沿途宫位中"克天盘神"者之数，取数多者为深；相等时依"取四孟上神（见机）、无孟取四仲（察微）、无仲取四季（缀瑕）"办理。古法涉害尚有"孟仲季"与"归本家"诸说，本站从简。', true);
      h += U.note('伏吟课中传取初传之刑、末传取中传之刑；遇自刑（辰午酉亥）之支，中传另取干上神或支上神、末传取其冲，此为简化处理。返吟无克取日支驿马发用（无亲课／井栏射），中传支上神、末传干上神，为通行一说。', true);
      h += U.note('八专课"阳日干上神顺数三神、阴日支上神逆数三神"及别责课"阴日取日支三合前一位之上神"皆为通行取法，古书异说并存，此处标明以便对照。', true);
      h += U.disclaim('大六壬排盘参数（月将、四柱）由本站干支历引擎按太阳黄经推算，非查表，故与坊间历书或有一二分差异。');
      return h;
    }
  });
})();
