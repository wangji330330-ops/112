/* 奇门遁甲 —— 时家转盘：九宫、八门、九星、八神、三奇六仪 */
(function () {
  'use strict';
  const C = window.CORE, U = C.UI, G = C.GZ;

  const XUN_YI = ['戊', '己', '庚', '辛', '壬', '癸'];   /* 甲子戊 甲戌己 甲申庚 甲午辛 甲辰壬 甲寅癸 */
  const MEN_LUCK = {
    开门: { l: '吉', d: '开门主开张、通达、官贵，宜开业、上任、谒贵。' },
    休门: { l: '吉', d: '休门主休息、和合、婚姻，宜休养、聚会、求亲。' },
    生门: { l: '吉', d: '生门主生发、财利、产业，宜求财、经营、营造。' },
    杜门: { l: '中', d: '杜门主闭塞、隐藏、技术，宜躲避、修炼、技术之事，不利出行。' },
    景门: { l: '中', d: '景门主文书、信息、虚华，宜上书、考试，防虚诈不实。' },
    死门: { l: '凶', d: '死门主死亡、丧葬、绝境，宜吊丧、行刑，余事皆凶。' },
    惊门: { l: '凶', d: '惊门主惊恐、口舌、官非，防争讼、虚惊。' },
    伤门: { l: '凶', d: '伤门主伤害、争斗、捕猎，宜讨债、竞技，防损伤。' }
  };
  const XING_LUCK = {
    天蓬: { l: '凶', d: '天蓬水星，主盗贼、水险，宜安抚不宜攻。' },
    天任: { l: '吉', d: '天任土星，主稳重、田土、蓄积，宜守成。' },
    天冲: { l: '吉', d: '天冲木星，主勇动、征伐、出行，宜速不宜缓。' },
    天辅: { l: '吉', d: '天辅木星，主文教、师友、文昌，宜考试、求学。' },
    天英: { l: '中', d: '天英火星，主文明、虚火、口舌，宜文书不宜争斗。' },
    天芮: { l: '凶', d: '天芮土星，主疾病、师众、迟缓，宜求医不宜远行。' },
    天柱: { l: '凶', d: '天柱金星，主口舌、破坏、阻隔，防破败。' },
    天心: { l: '吉', d: '天心金星，主医卜、谋划、权柄，宜求医、谋事。' },
    天禽: { l: '吉', d: '天禽土星，居中宫，主中正、包容，寄坤二宫。' }
  };
  const SHEN_LUCK = {
    值符: { l: '吉', d: '值符为八神之首，主贵气、正统、领导，宜谒贵求托。' },
    腾蛇: { l: '凶', d: '腾蛇主虚惊、怪异、缠绕，防虚诈惊恐。' },
    太阴: { l: '吉', d: '太阴主阴柔、暗助、谋略，宜暗中行事、妇人相助。' },
    六合: { l: '吉', d: '六合主和合、中介、婚姻，宜合作说合。' },
    白虎: { l: '凶', d: '白虎主刚猛、伤病、道路，防争斗血光，宜武不宜文。' },
    玄武: { l: '凶', d: '玄武主盗贼、暗昧、欺骗，防失脱阴私。' },
    九地: { l: '吉', d: '九地主深藏、稳固、后援，宜守不宜进。' },
    九天: { l: '吉', d: '九天主高远、扬名、远行，宜进取远图。' }
  };
  const CATS = {
    cai: { n: '求财经营', gate: '生门', star: null, shen: null, tip: '求财以生门为用，戊为资财；生门临宫旺相、得吉星吉神则财可求。' },
    guan: { n: '事业官运', gate: '开门', star: null, shen: null, tip: '功名以开门为用，开门临吉星吉神、不受门迫则事可成。' },
    hun: { n: '婚姻感情', gate: '休门', star: null, shen: '六合', tip: '婚姻以休门、六合为用，两宫相生相合则和，相冲相克则难。' },
    ji: { n: '疾病健康', gate: '死门', star: '天芮', shen: null, tip: '疾病以天芮为病神、死门为病势，天心、生门为医药；天芮旺则病重。' },
    xing: { n: '出行远行', gate: null, star: null, shen: null, tip: '出行以驿马与开门为用，马星临吉门则宜行。' },
    kao: { n: '考试文书', gate: '景门', star: '天辅', shen: null, tip: '考试以景门、天辅（文昌）为用，得吉则文思畅、名可成。' },
    shi: { n: '失物寻人', gate: null, star: null, shen: null, tip: '失物以用神宫之方位寻之，日干为人、时干为物。' },
    an: { n: '平安谋事', gate: null, star: null, shen: '值符', tip: '平安谋事以值符为用，值符得地、门星皆吉则安。' },
    other: { n: '其他', gate: null, star: null, shen: null, tip: '无所专属者，以时干所落之宫为用，看其门星神之吉凶。' }
  };

  ART({
    id: 'qimen', name: '奇门遁甲', alias: ['时家奇门', '转盘奇门', '遁甲'],
    gua: 'qian', order: 1,
    tagline: '时家转盘 · 九宫八门九星八神，三式之首，古称帝王之学',

    intro: `
      <p>奇门遁甲与太乙神数、大六壬并称"三式"，而奇门居其首。其法以洛书九宫为盘，
      布<em>三奇</em>（乙为日奇、丙为月奇、丁为星奇）与<em>六仪</em>（戊己庚辛壬癸），
      是为地盘；再以旬首所值之<em>值符</em>星加于时干之宫，转动<em>天盘九星</em>；
      以<em>值使</em>门自其本宫起，依阳顺阴逆数至时辰，布<em>八门</em>；
      更以值符为首布<em>八神</em>。一局之中，门、星、神、干四层相叠，吉凶自见。</p>
      <p>"遁甲"之名，起于甲为诸阳之首、最忌庚金相克，故须将甲隐遁于六仪之下：
      甲子隐于戊、甲戌隐于己、甲申隐于庚、甲午隐于辛、甲辰隐于壬、甲寅隐于癸，
      此即"遁甲"之义。所用之局，则由<em>节气与三元</em>定：冬至后用阳遁、夏至后用阴遁，
      每节气分上中下三元，各有局数，共计一千零八十局，后简为阳九阴九十八局。</p>
      <p>本页依时家转盘法排局：以真太阳黄经定节气、以符头定三元、以旬首定值符值使，
      地盘三奇六仪依阳顺阴逆布入九宫，天盘九星随值符转动，八门依飞泊数至时辰，
      八神按阳顺阴逆布列。断法则取用神宫之门星神组合与门宫生克，
      参五不遇时、伏吟反吟而定。</p>`,

    method: `
      <p>输入起局时间与所问之事，选好类别（以定用神），按"起局"。</p>
      <p>古法以节气定局、以符头定三元。本站默认自动取局；若欲按他法起局，
      可选"手动定局"自行指定局数与阴阳遁。</p>
      <p>盘面自下而上四层为：<em>八神、天盘九星（附天盘奇仪）、八门、地盘奇仪</em>；
      中五宫无门无星，天禽寄坤二宫。</p>`,

    form: [
      { name: 'q', label: '所问之事', type: 'text', placeholder: '如：此项目可否如期启动', wide: true },
      { name: 'cat', label: '所问类别（定用神）', type: 'select', value: 'cai', options: Object.keys(CATS).map(k => ({ v: k, t: CATS[k].n })) },
      { name: 'dt', label: '起局时间', type: 'datetime-local', value: U.nowStr(), wide: true },
      {
        name: 'juMode', label: '定局方式', type: 'chips', value: 'auto',
        options: [{ v: 'auto', t: '以节气三元自动定局' }, { v: 'manual', t: '手动定局' }]
      },
      { name: 'ju', label: '局数', type: 'select', value: '1', options: [1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => ({ v: String(i), t: i + '局' })) },
      { name: 'dun', label: '阴阳遁', type: 'select', value: 'yang', options: [{ v: 'yang', t: '阳遁' }, { v: 'yin', t: '阴遁' }] }
    ],

    cast(input) {
      const date = U.parseDT(input.dt);
      const fp = G.fourPillars(date);
      const ct = G.currentTerm(date);
      const term = ct.name;
      const yuan = G.qiMenYuan(fp.day.idx);
      const manual = (input.juMode === 'manual');
      const ju = manual ? (parseInt(input.ju, 10) || 1) : C.QIMEN.ju(term, yuan.yuanK);
      const dun = manual ? (input.dun === 'yin' ? -1 : 1) : C.QIMEN.dun(term);
      const xunShouIdx = fp.hour.idx - (fp.hour.idx % 10);
      const xunShouGan = XUN_YI[Math.floor(xunShouIdx / 10)];
      const hourSteps = fp.hour.idx % 10;
      const pan = C.QIMEN.pan({
        term, yuanK: yuan.yuanK, ju, dun, xunShouGan,
        hourGan: fp.hour.gan, hourSteps, hourZhiIdx: C.ZHI.indexOf(fp.hour.zhi)
      });
      /* 伏吟反吟 */
      const fuGong = pan.fuGong, landGong = pan.shiGanGong;
      const p0 = C.QIMEN.RING.indexOf(fuGong), p1 = C.QIMEN.RING.indexOf(landGong);
      const shift = ((p1 - p0) % 8 + 8) % 8;
      const fuYin = shift === 0, fanYin = shift === 4;
      /* 五不遇时：时干与日干同阴阳且时干克日干 */
      const dg = G.GAN.indexOf(fp.day.gan), hg = G.GAN.indexOf(fp.hour.gan);
      const wuBuYu = (C.GAN_YY[dg] === C.GAN_YY[hg]) && (C.wxKe(C.GAN_WX[hg]) === C.GAN_WX[dg]);
      /* 用神宫 */
      const cat = CATS[input.cat] || CATS.other;
      const byGate = (name) => { for (const g in pan.men) if (pan.men[g] === name) return Number(g); return null; };
      const byStar = (name) => { for (const g in pan.sky) if (pan.sky[g] === name) return Number(g); return null; };
      const byShen = (name) => { for (const g in pan.shen) if (pan.shen[g] === name) return Number(g); return null; };
      let useGong = null, useWhy = '';
      if (input.cat === 'xing') { useGong = pan.ma.gong; useWhy = '出行以驿马（' + pan.ma.zhi + '）所临之宫为用'; }
      else if (cat.gate) { useGong = byGate(cat.gate); useWhy = cat.n + '以' + cat.gate + '所临之宫为用'; }
      else if (cat.star) { useGong = byStar(cat.star); useWhy = cat.n + '以' + cat.star + '所临之宫为用'; }
      else if (cat.shen) { useGong = byShen(cat.shen); useWhy = cat.n + '以' + cat.shen + '所临之宫为用'; }
      if (!useGong) { useGong = pan.shiGanGong; useWhy = '时干' + fp.hour.gan + '所落之宫为用'; }
      if (useGong === 5) useGong = 2;
      /* 日干（求测人）落宫 */
      let riGong = C.QIMEN.gongOfGan(pan.earth, fp.day.gan);
      if (riGong === 5) riGong = 2;

      /* 评分 */
      const factors = [];
      let score = 0;
      const g5 = (g) => {
        const l = Number(g);
        return { 1: '水', 2: '土', 3: '木', 4: '木', 5: '土', 6: '金', 7: '金', 8: '土', 9: '火' }[l];
      };
      const men = pan.men[useGong], xing = pan.sky[useGong], shen = pan.shen[useGong], gan = pan.earth[useGong];
      if (men && MEN_LUCK[men]) {
        const l = MEN_LUCK[men].l;
        const v = l === '吉' ? 2 : l === '凶' ? -2 : 0;
        score += v; factors.push([men + '（' + l + '门）', v]);
      }
      if (xing && XING_LUCK[xing]) {
        const l = XING_LUCK[xing].l;
        const v = l === '吉' ? 1.5 : l === '凶' ? -1.5 : 0;
        score += v; factors.push([xing + '（' + l + '星）', v]);
      }
      if (shen && SHEN_LUCK[shen]) {
        const l = SHEN_LUCK[shen].l;
        const v = l === '吉' ? 1 : l === '凶' ? -1 : 0;
        score += v; factors.push([shen + '（' + l + '神）', v]);
      }
      /* 门宫生克 */
      let menGong = '门宫比和';
      if (men && C.MEN_ORDER.indexOf(men) >= 0) {
        const menWx = { 休门: '水', 生门: '土', 伤门: '木', 杜门: '木', 景门: '火', 死门: '土', 惊门: '金', 开门: '金' }[men];
        const gw = g5(useGong);
        if (menWx === gw) { menGong = '门宫比和，事体顺遂'; score += 0.5; factors.push(['门宫比和', 0.5]); }
        else if (C.wxSheng(gw) === menWx) { menGong = '宫生门，得地有力'; score += 1; factors.push(['宫生门（得地）', 1]); }
        else if (C.wxSheng(menWx) === gw) { menGong = '门生宫，气泄于宫'; score -= 0.5; factors.push(['门生宫（泄气）', -0.5]); }
        else if (C.wxKe(menWx) === gw) { menGong = '门克宫，是为「门迫」，事多不顺'; score -= 1.5; factors.push(['门迫', -1.5]); }
        else if (C.wxKe(gw) === menWx) { menGong = '宫克门，门受制，事须费力'; score -= 1; factors.push(['宫制门', -1]); }
      }
      if (wuBuYu) { score -= 2; factors.push(['五不遇时', -2]); }
      if (fuYin) { score -= 1; factors.push(['伏吟（事多迟滞）', -1]); }
      if (fanYin) { score -= 1; factors.push(['反吟（事多反复）', -1]); }

      let verdict;
      if (score >= 3.5) verdict = '门星神皆吉、用神得地，事可为，宜乘时而动。';
      else if (score >= 1) verdict = '用神有吉气，事可望成，然须择时择方而行。';
      else if (score > -1) verdict = '吉凶相参，成否两可，宜守正待时，不可勉强。';
      else if (score > -3.5) verdict = '用神受迫，事多阻隔，宜缓图、宜另择吉时吉方。';
      else verdict = '用神大凶，门迫星凶，凡事不宜妄动，宜止宜守。';

      return {
        q: (input.q || '').trim(), fp, term, yuan, ju, dun, dunName: dun === 1 ? '阳遁' : '阴遁',
        pan, manual, xunShouGan, xunShou: G.gzName(xunShouIdx), hourSteps,
        fuYin, fanYin, wuBuYu, cat, catName: cat.n, useGong, useWhy, riGong,
        men, xing, shen, gan, menGong, score, factors, verdict, nextTerm: ct.nextName
      };
    },

    view(d) {
      const pan = d.pan;
      /* 九宫 */
      const map = {};
      [1, 2, 3, 4, 6, 7, 8, 9].forEach(g => {
        const sh = pan.shen[g], sk = pan.sky[g], sg = pan.skyGan[g], mn = pan.men[g], e = pan.earth[g];
        const isUse = g === d.useGong, isRi = g === d.riGong, isFu = g === pan.fuGong, isShi = g === pan.zhiShiGong;
        map[g] = {
          cls: isUse ? 'use' : '',
          html:
            `<div class="gn">${C.GONG_NAME[g]} · ${C.GONG_DIR[g]}${isFu ? ' <b>值符</b>' : ''}${isShi ? ' <b>值使</b>' : ''}</div>` +
            `<div class="gs" style="color:${sh && SHEN_LUCK[sh] && SHEN_LUCK[sh].l === '凶' ? '#a8322d' : '#33556e'}">${sh || ''}</div>` +
            `<div class="gz">${sk || ''}<span style="font-size:12px"> ${sg ? U.wx(sg) : ''}</span></div>` +
            `<div class="gs" style="font-size:12.5px">${mn || ''} ${mn && MEN_LUCK[mn] ? (MEN_LUCK[mn].l === '吉' ? '<b style="color:#3d6b45">吉</b>' : MEN_LUCK[mn].l === '凶' ? '<b style="color:#a8322d">凶</b>' : '<b>平</b>') : ''}</div>` +
            `<div class="gs" style="color:var(--ink-4)">地盘 ${U.wx(e)}${isUse ? ' <b style="color:#a8322d">◀用神</b>' : ''}${isRi ? ' <b style="color:#8a6a2f">日干</b>' : ''}</div>`
        };
      });
      const center = `<div class="gn">中五宫</div><div class="gz">${U.wx(pan.earth[5])}</div>` +
        `<div class="gs">天禽寄坤二宫<br>无门无神</div>`;

      const barHtml = U.bars(d.factors.map(f => [f[0], Math.abs(f[1]), (f[1] > 0 ? '+' : '') + f[1]]),
        Math.max.apply(null, d.factors.map(f => Math.abs(f[1])).concat([2])));

      return U.resHead(`${d.dunName}${d.ju}局`, `${d.term} ${d.yuan.yuan} · ${d.fp.hour.name}时`) +
        (d.q ? `<p class="branch-lead" style="margin:0 0 10px">所问：<em>${U.esc(d.q)}</em>（${d.catName}）</p>` : '') +
        U.card('起局', U.kv([
          ['时间', `${d.fp.year.name}年 ${d.fp.month.name}月 ${d.fp.day.name}日 ${d.fp.hour.name}时`],
          ['节气 · 三元', `${d.term}（${d.yuan.yuan}）· 下节气 ${d.nextTerm}`],
          ['局数', `${d.dunName} ${d.ju} 局` + (d.manual ? '（手动定局）' : '（以节气三元自动定局）')],
          ['符头', d.yuan.futou],
          ['旬首', `${d.xunShou}（旬首之仪 ${d.xunShouGan}）· 本旬第 ${d.hourSteps + 1} 个时辰`],
          ['值符 · 值使', `${pan.fuXing} · ${pan.shiMen}`],
          ['驿马', `${pan.ma.zhi}（落 ${C.GONG_NAME[pan.ma.gong]}）`],
          ['格局', [d.fuYin ? '伏吟' : '', d.fanYin ? '反吟' : '', d.wuBuYu ? '五不遇时' : ''].filter(Boolean).join(' · ') || '无特殊格局']
        ])) +
        U.sec('九宫盘', U.grid9(map, center)) +
        U.card('用神', U.kv([
          ['用神宫', C.GONG_NAME[d.useGong] + '（' + C.GONG_DIR[d.useGong] + '）'],
          ['取法', d.useWhy],
          ['门 · 星 · 神', `${d.men || '—'} · ${d.xing || '—'} · ${d.shen || '—'}`],
          ['地盘奇仪', U.wx(d.gan)],
          ['日干（求测人）', C.GONG_NAME[d.riGong] + '（' + d.fp.day.gan + '）'],
          ['门宫关系', d.menGong]
        ])) +
        U.sec('断局', U.p(`<b style="font-size:15px">${d.verdict}</b>`) +
          (d.factors.length ? barHtml : '') +
          U.p(d.catName + '：' + d.cat.tip) +
          U.p(`时干 ${d.fp.hour.gan} 落 ${C.GONG_NAME[pan.shiGanGong]}，用神宫为 ${C.GONG_NAME[d.useGong]}；` +
            `值符${pan.fuXing}临 ${C.GONG_NAME[pan.shiGanGong]}，值使${pan.shiMen}落 ${C.GONG_NAME[pan.zhiShiGong]}。` +
            (d.men && MEN_LUCK[d.men] ? MEN_LUCK[d.men].d : '') +
            (d.xing && XING_LUCK[d.xing] ? XING_LUCK[d.xing].d : '') +
            (d.shen && SHEN_LUCK[d.shen] ? SHEN_LUCK[d.shen].d : '')) +
          U.p(`吉方：${['生门', '开门', '休门'].map(m => {
            for (const g in pan.men) if (pan.men[g] === m) return m + '在' + C.GONG_DIR[g];
            return '';
          }).filter(Boolean).join('，')}。` +
            `凶方：${['死门', '惊门', '伤门'].map(m => {
              for (const g in pan.men) if (pan.men[g] === m) return m + '在' + C.GONG_DIR[g];
              return '';
            }).filter(Boolean).join('，')}。`)) +
        U.card('八门 · 九星 · 八神 吉凶', U.table(['门', '吉凶', '星', '吉凶', '神', '吉凶'], [
          { cells: ['开门', '吉', '天心', '吉', '值符', '吉'] },
          { cells: ['休门', '吉', '天任', '吉', '太阴', '吉'] },
          { cells: ['生门', '吉', '天辅', '吉', '六合', '吉'] },
          { cells: ['杜门', '中', '天冲', '吉', '九地', '吉'] },
          { cells: ['景门', '中', '天禽', '吉', '九天', '吉'] },
          { cells: ['死门', '凶', '天英', '中', '腾蛇', '凶'] },
          { cells: ['惊门', '凶', '天芮', '凶', '白虎', '凶'] },
          { cells: ['伤门', '凶', '天柱', '凶', '玄武', '凶'] }
        ])) +
        U.card('术语小释', U.kv([
          ['三奇六仪', '乙丙丁为三奇（日月星），戊己庚辛壬癸为六仪（甲遁其中）。'],
          ['遁甲', '甲为诸阳之首、畏庚金，故隐于六仪之下，是为遁甲。'],
          ['值符 · 值使', '旬首之仪所落之宫，其本宫星为值符、本宫门为值使。'],
          ['阳顺阴逆', '冬至后阳遁，三奇六仪顺飞、八神顺布；夏至后阴遁，皆逆。'],
          ['门迫', '门克宫为门迫，吉门被迫减吉、凶门被迫更凶。'],
          ['伏吟反吟', '天盘值符仍在本宫为伏吟（主迟滞），落对宫为反吟（主反复）。'],
          ['五不遇时', '时干克日干且同阴阳，百事不宜之时。']
        ])) +
        U.note('本站为<em>时家转盘奇门</em>简化排局：天禽寄坤二宫、中宫不布门神，' +
          '八门以九宫飞泊之序数至时辰。奇门流派众多（转盘/飞盘、置闰/拆补），' +
          '局数与落宫可能与他法有别，此处以古法通例为准。断语为白话参考，非古籍原文。', true) +
        U.disclaim();
    }
  });
})();
