/* 六爻纳甲 —— 三钱六摇，装卦纳甲，六亲六神世应 */
(function () {
  'use strict';
  const C = window.CORE, U = C.UI, G = C.GZ;

  const YAO = ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻'];
  const POS = ['初', '二', '三', '四', '五', '上'];
  const VALUE_NAME = { 6: '老阴 ×', 7: '少阳 —', 8: '少阴 - -', 9: '老阳 ○' };
  const GAN_WX_ = C.GAN_WX, ZHI_WX_ = C.ZHI_WX;

  /* 用神取法（依所问类别） */
  const YONGSHEN = {
    cai: { name: '财运求财', main: '妻财', sub: '子孙为财源、兄弟为劫财', tip: '财爻旺相持世、子孙发动生财则吉；财爻空破、兄弟发动劫财则不利。' },
    guan: { name: '事业官运', main: '官鬼', sub: '父母为文书、妻财为俸禄', tip: '官鬼旺相生世、父母旺相有文书之喜；官鬼空破、子孙发动伤官则不利。' },
    hun: { name: '婚姻感情', main: '妻财', sub: '男看妻财、女看官鬼', tip: '用神旺相与世相生则和合，用神空破、化退、被冲则不成。' },
    ji: { name: '疾病健康', main: '官鬼', sub: '子孙为医药、世爻为自身', tip: '官鬼旺而动者病重，子孙旺相持世则有医药之助。' },
    xing: { name: '出行行人', main: '父母', sub: '子孙为平安、应爻为所往', tip: '父母旺相宜行，世爻受克不宜远行，行人之归期看用神与日辰。' },
    kao: { name: '考试功名', main: '父母', sub: '官鬼为功名', tip: '父母旺相主文书顺利，官鬼旺相生世主功名有望。' },
    shi: { name: '失物寻人', main: '妻财', sub: '子孙为寻得之助', tip: '财爻在内卦易寻、在外卦难觅；用神旺相可回，空破难寻。' },
    an: { name: '平安运势', main: '子孙', sub: '世爻为自身', tip: '子孙旺相持世则安，官鬼发动克世须防。' },
    guan2: { name: '官非诉讼', main: '官鬼', sub: '子孙为解厄之神', tip: '官鬼旺相为对方强，子孙旺相则官司可解。' },
    other: { name: '其他 / 以世爻为主', main: '世爻', sub: '参看动爻', tip: '无所专属者，以世爻为自身、应爻为对方，看其生克冲合。' }
  };

  function bar(yang, dong) {
    const col = dong ? '#a8322d' : '#171614';
    const s = `display:inline-block;height:8px;background:${col};border-radius:1px;vertical-align:middle`;
    return yang
      ? `<span style="${s};width:34px"></span>`
      : `<span style="${s};width:14px"></span><span style="display:inline-block;width:5px"></span><span style="${s};width:14px"></span>`;
  }

  /* 以（卦宫五行、地支）取六亲 */
  function qinOf(gongWx, zhi) { return C.liuQin(gongWx, ZHI_WX_[C.ZHI.indexOf(zhi)]); }

  ART({
    id: 'liuyao', name: '六爻纳甲', alias: ['火珠林', '纳甲筮法', '文王卦', '大三爻'],
    gua: 'zhen', order: 1,
    tagline: '三钱六摇 · 装卦纳甲，六亲六神世应俱全，今世最通行之法',

    intro: `
      <p>六爻纳甲，源于汉代京房易，成于《火珠林》，故又称"火珠林法"。其法以三枚铜钱摇六次，
      自下而上成一卦；再依<em>京房纳甲</em>将天干地支配入六爻，以卦宫五行为"我"而定
      <em>六亲</em>（父母、兄弟、子孙、妻财、官鬼），依日干起<em>六神</em>（青龙、朱雀、勾陈、
      螣蛇、白虎、玄武），并按八宫卦序定<em>世爻、应爻</em>。</p>
      <p>断卦之要，全在"用神"：问财看妻财，问事业看官鬼，问子女平安看子孙，问文书长辈看父母，
      问兄弟竞争看兄弟。用神既定，再看其旺衰——得月建生扶、得日辰生扶、得动爻生扶者旺；
      逢旬空、逢月破、被日辰克制、被动爻克制者衰。旺相则事可成，衰败则事难就，
      再以世应关系、卦之六冲六合、动变之进退定其迟速成败。</p>
      <p>此术至清代《增删卜易》《卜筮正宗》而大备，法度森严，是今日术数中最成体系、
      也最经得起复核的一门。本页装卦、纳甲、世应、六亲、六神、旬空、六冲六合皆依古法排定，
      断语则以月建日辰生克与动变论用神旺衰，为可复核的简化断法。</p>`,

    method: `
      <p>心中默念所问之事，选好所问类别，按"起课"即自动摇钱六次并装卦。
      亦可勾选手动指定六爻（老阳○、老阴×为动爻）。</p>
      <p>装卦以起课时间的日干起六神、以日辰与月建论旺衰——故<em>起课时间须准确</em>。
      结果可点"复制结果"保存。</p>`,

    form: [
      { name: 'q', label: '所问之事', type: 'text', placeholder: '如：此宅何时能售出', wide: true },
      {
        name: 'cat', label: '所问类别（定用神）', type: 'select', value: 'cai',
        options: Object.keys(YONGSHEN).map(k => ({ v: k, t: YONGSHEN[k].name }))
      },
      { name: 'gender', label: '性别（问婚姻用）', type: 'select', value: '男', options: ['男', '女'] },
      {
        name: 'mode', label: '起卦方式', type: 'chips', value: 'auto',
        options: [{ v: 'auto', t: '摇卦' }, { v: 'manual', t: '手动指定' }]
      },
      { name: 'm1', label: '初爻', type: 'select', value: '7', options: [6, 7, 8, 9].map(v => ({ v: String(v), t: VALUE_NAME[v] })) },
      { name: 'm2', label: '二爻', type: 'select', value: '7', options: [6, 7, 8, 9].map(v => ({ v: String(v), t: VALUE_NAME[v] })) },
      { name: 'm3', label: '三爻', type: 'select', value: '7', options: [6, 7, 8, 9].map(v => ({ v: String(v), t: VALUE_NAME[v] })) },
      { name: 'm4', label: '四爻', type: 'select', value: '7', options: [6, 7, 8, 9].map(v => ({ v: String(v), t: VALUE_NAME[v] })) },
      { name: 'm5', label: '五爻', type: 'select', value: '7', options: [6, 7, 8, 9].map(v => ({ v: String(v), t: VALUE_NAME[v] })) },
      { name: 'm6', label: '上爻', type: 'select', value: '7', options: [6, 7, 8, 9].map(v => ({ v: String(v), t: VALUE_NAME[v] })) },
      { name: 'dt', label: '起课时间（定日月建）', type: 'datetime-local', value: U.nowStr(), wide: true }
    ],

    cast(input) {
      const fp = G.fourPillars(U.parseDT(input.dt));
      const dayGanIdx = G.GAN.indexOf(fp.day.gan), dayZhiIdx = G.ZHI.indexOf(fp.day.zhi);
      let vals, tosses = null;
      if ((input.mode || 'auto') === 'manual') {
        vals = ['m1', 'm2', 'm3', 'm4', 'm5', 'm6'].map(k => parseInt(input[k], 10) || 7);
      } else {
        vals = []; tosses = [];
        for (let i = 0; i < 6; i++) {
          const c = [C.RNG.rand() < 0.5 ? 2 : 3, C.RNG.rand() < 0.5 ? 2 : 3, C.RNG.rand() < 0.5 ? 2 : 3];
          tosses.push(c); vals.push(c.reduce((a, b) => a + b, 0));
        }
      }
      const lines = vals.map(v => (v === 7 || v === 9) ? 1 : 0);
      const dong = vals.map((v, i) => (v === 6 || v === 9) ? i : -1).filter(i => i >= 0);
      const z = C.zhuangGua(lines, dayGanIdx, dayZhiIdx);
      const fu = C.fuShen(lines, dayGanIdx, dayZhiIdx);
      const bianLines = dong.length ? C.bianGua(lines, dong).lines : null;
      const bianZ = bianLines ? C.zhuangGua(bianLines, dayGanIdx, dayZhiIdx) : null;
      /* 旬空 */
      const kong = fp.xun.kongZhi;
      z.yaos.forEach(y => { y.kong = kong.indexOf(C.ZHI.indexOf(y.zhi)) >= 0; });
      /* 六冲 / 六合 卦（以初四、二五、三六三对地支论） */
      const pairs = [[0, 3], [1, 4], [2, 5]];
      const liuChong = pairs.every(p => C.isLiuChong(C.ZHI.indexOf(z.yaos[p[0]].zhi), C.ZHI.indexOf(z.yaos[p[1]].zhi)));
      const liuHe = pairs.every(p => C.isLiuHe(C.ZHI.indexOf(z.yaos[p[0]].zhi), C.ZHI.indexOf(z.yaos[p[1]].zhi)));
      /* 伏吟 / 反吟（变卦与本卦六亲地支相同 / 相冲） */
      let fuYin = false, fanYin = false;
      if (bianZ && dong.length) {
        fuYin = dong.every(i => bianZ.yaos[i].zhi === z.yaos[i].zhi);
        fanYin = dong.every(i => C.isLiuChong(C.ZHI.indexOf(bianZ.yaos[i].zhi), C.ZHI.indexOf(z.yaos[i].zhi)));
      }

      /* 用神定位 */
      const cat = YONGSHEN[input.cat] || YONGSHEN.other;
      let mainQin = cat.main;
      if (input.cat === 'hun') mainQin = (input.gender === '女') ? '官鬼' : '妻财';
      const findByQin = (qin) => z.yaos.map((y, i) => ({ y, i })).filter(o => o.y.qin === qin);

      /* 旺衰评分 */
      const monthZhi = fp.month.zhi, monthWx = ZHI_WX_[C.ZHI.indexOf(monthZhi)];
      const dayWx = ZHI_WX_[dayZhiIdx];
      const factors = [];
      function scoreYao(y, label) {
        let s = 0;
        const ywx = y.wx;
        /* 月建 */
        if (monthWx === ywx) { s += 1.5; factors.push([label + '临月建（' + monthZhi + '）', +1.5, '旺']); }
        else if (C.wxSheng(monthWx) === ywx) { s += 1; factors.push(['月建生' + label, +1, '相']); }
        else if (C.wxKe(monthWx) === ywx) { s -= 1.5; factors.push(['月建克' + label, -1.5, '死']); }
        else if (C.wxSheng(ywx) === monthWx) { s -= 0.5; factors.push([label + '生月建（泄气）', -0.5, '休']); }
        /* 日辰 */
        if (dayWx === ywx) { s += 1.5; factors.push([label + '临日辰（' + fp.day.name + '）', +1.5, '旺']); }
        else if (C.wxSheng(dayWx) === ywx) { s += 1; factors.push(['日辰生' + label, +1, '相']); }
        else if (C.wxKe(dayWx) === ywx) { s -= 1.5; factors.push(['日辰克' + label, -1.5, '死']); }
        else if (C.wxSheng(ywx) === dayWx) { s -= 0.5; factors.push([label + '生日辰（泄气）', -0.5, '休']); }
        /* 旬空 */
        if (y.kong) { s -= 2; factors.push([label + '逢旬空', -2, '空']); }
        if (y.shi) { s += 1; factors.push([label + '持世', +1, '得位']); }
        if (y.ying) { s += 0.3; factors.push([label + '临应', +0.3, '']); }
        /* 动爻生克 */
        z.yaos.forEach((o, oi) => {
          if (dong.indexOf(oi) < 0) return;
          const owx = o.wx;
          if (C.wxSheng(owx) === ywx) { s += 1.2; factors.push([YAO[oi] + '动生' + label, +1.2, '']); }
          else if (C.wxKe(owx) === ywx) { s -= 1.2; factors.push([YAO[oi] + '动克' + label, -1.2, '']); }
        });
        /* 变爻回头生克 */
        if (bianZ && bianZ.yaos) {
          z.yaos.forEach((o, oi) => {
            if (dong.indexOf(oi) < 0) return;
            const bw = ZHI_WX_[C.ZHI.indexOf(bianZ.yaos[oi].zhi)];
            if (C.wxSheng(bw) === ywx) { s += 1; factors.push([YAO[oi] + '变爻回头生' + label, +1, '']); }
            else if (C.wxKe(bw) === ywx) { s -= 1; factors.push([YAO[oi] + '变爻回头克' + label, -1, '']); }
          });
        }
        /* 六冲六合 */
        if (liuChong) { s -= 0.5; }
        if (liuHe) { s += 0.5; }
        return s;
      }

      let mainYao = null, mainScore = 0, mainNote = '';
      if (mainQin === '世爻') {
        const shi = z.yaos.find(y => y.shi);
        if (shi) { mainYao = shi; mainScore = scoreYao(shi, '世爻'); mainNote = '以世爻为用'; }
      } else {
        const list = findByQin(mainQin);
        if (list.length === 1) { mainYao = list[0].y; mainScore = scoreYao(list[0].y, mainQin); mainNote = mainQin + '独现，取为用神'; }
        else if (list.length > 1) {
          /* 多现：取动者、临世者、临日月者，再取旺者 */
          let pick = list.find(o => dong.indexOf(o.i) >= 0);
          if (!pick) pick = list.find(o => o.y.shi);
          if (!pick) pick = list.find(o => C.ZHI.indexOf(o.y.zhi) === C.ZHI.indexOf(monthZhi) || C.ZHI.indexOf(o.y.zhi) === dayZhiIdx);
          if (!pick) pick = list[0];
          mainYao = pick.y;
          mainScore = scoreYao(pick.y, mainQin);
          mainNote = mainQin + '两现，取' + (dong.indexOf(pick.i) >= 0 ? '发动者' : pick.y.shi ? '持世者' : '临日月者') + '为用（' + YAO[pick.i] + '）';
        } else {
          const f = fu.find(x => x.qin === mainQin);
          mainNote = '本卦无' + mainQin + '，' + (f ? '取伏神 ' + f.gz + '（' + YAO[f.pos - 1] + '）为用，伏神须得日月生扶方能出伏' : '用神不上卦，事多虚浮');
          if (f) {
            mainYao = { pos: f.pos, zhi: f.zhi, wx: f.wx, qin: f.qin, gz: f.gz, fu: true, kong: kong.indexOf(C.ZHI.indexOf(f.zhi)) >= 0 };
            mainScore = scoreYao(mainYao, '伏神' + mainQin) - 1;
            factors.push(['用神伏藏', -1, '伏']);
          }
        }
      }

      /* 世应关系 */
      const shi = z.yaos.find(y => y.shi), ying = z.yaos.find(y => y.ying);
      let shiYingText = '';
      if (shi && ying) {
        const rel = C.wxRelation(shi.wx, ying.wx);
        const shiYingChong = C.isLiuChong(C.ZHI.indexOf(shi.zhi), C.ZHI.indexOf(ying.zhi));
        const shiYingHe = C.isLiuHe(C.ZHI.indexOf(shi.zhi), C.ZHI.indexOf(ying.zhi));
        shiYingText = `世${shi.gz}应${ying.gz}，世${U.wx(shi.wx)}应${U.wx(ying.wx)}，` +
          (shiYingChong ? '世应相冲，事多反复、彼此不合。' : shiYingHe ? '世应相合，事得和同、易成。'
            : rel === '我生' ? '世生应，我求于人，须费心力。'
              : rel === '生我' ? '应生世，人来就我，得助有力。'
                : rel === '我克' ? '世克应，事在我掌握，可成。'
                  : rel === '克我' ? '应克世，受制于人，宜谨慎。' : '世应比和，彼此同心。');
      }

      /* 月建日辰对世爻 */
      let shiText = '';
      if (shi) {
        const s = scoreYao(shi, '世爻');
        shiText = `世爻${shi.gz}（${U.wx(shi.wx)}）${shi.kong ? '逢旬空，' : ''}` +
          (monthWx === shi.wx ? '临月建，' : C.wxSheng(monthWx) === shi.wx ? '得月建生，' : C.wxKe(monthWx) === shi.wx ? '被月建克，' : '') +
          (dayWx === shi.wx ? '临日辰，旺相有力。' : C.wxSheng(dayWx) === shi.wx ? '得日辰生扶，可为。' : C.wxKe(dayWx) === shi.wx ? '被日辰克制，力弱难为。' : '得日辰平气。');
      }

      /* 综合吉凶 */
      let verdict, verdictCls;
      if (mainScore >= 3) { verdict = '用神旺相有力，事多可成，宜乘时而行。'; verdictCls = 'good'; }
      else if (mainScore >= 1) { verdict = '用神得气，事可望成，然须待时或稍费周折。'; verdictCls = 'good'; }
      else if (mainScore > -1) { verdict = '用神平平，成否两可，多在人谋与时机。'; verdictCls = 'mid'; }
      else if (mainScore > -3) { verdict = '用神衰而受制，事多阻隔，宜缓图、宜退守。'; verdictCls = 'bad'; }
      else { verdict = '用神衰败逢空受克，事恐难成，宜止而不宜行。'; verdictCls = 'bad'; }

      return {
        q: (input.q || '').trim(), cat, catName: cat.name, mainQin, mainNote,
        vals, tosses, lines, dong, z, bianZ, bianLines, fu, kong, liuChong, liuHe, fuYin, fanYin,
        factors, mainScore, mainYao, verdict, verdictCls, shiText, shiYingText, fp,
        manual: (input.mode === 'manual')
      };
    },

    view(d) {
      const z = d.z, hex = z.hex, bg = z.bg;
      /* 装卦表：自上爻而下 */
      const fuMap = {};
      d.fu.forEach(f => { fuMap[f.pos] = f; });
      const rows = [];
      for (let i = 5; i >= 0; i--) {
        const y = z.yaos[i];
        const isDong = d.dong.indexOf(i) >= 0;
        const f = fuMap[i + 1];
        const by = d.bianZ ? d.bianZ.yaos[i] : null;
        rows.push({
          cls: y.shi ? 'hi' : '',
          cells: [
            y.shen,
            f ? `<span style="color:#33556e">${f.qin}<br>${f.gz}</span>` : '',
            `${U.wx(y.wx)} ${U.dot(y.wx)}<br><span class="mono-k">${y.gz}</span> ${y.qin}`,
            bar(y.yang, isDong) + (y.shi ? '<br><b style="color:#a8322d">世</b>' : y.ying ? '<br><b style="color:#33556e">应</b>' : '') + (y.kong ? '<br><span style="color:#9a9486">空</span>' : ''),
            by ? `<span class="mono-k">${by.gz}</span><br>${U.wx(by.wx)}` : '<span style="color:#9a9486">—</span>',
            isDong ? `<b style="color:#a8322d">${d.vals[i] === 9 ? '○ 老阳' : '× 老阴'}</b>` : ''
          ]
        });
      }

      let tossHtml = '';
      if (d.tosses) {
        tossHtml = U.card('摇钱六次（自下而上）', d.tosses.map((c, i) => {
          const v = c.reduce((a, b) => a + b, 0);
          return `<div class="bar-line"><span class="lab">${YAO[i]}</span>${U.coins(c)}` +
            `<span class="val" style="flex:0 0 auto;margin-left:10px">${VALUE_NAME[v]}</span></div>`;
        }).join(''));
      }

      const barHtml = U.bars(d.factors.map(f => [f[0], Math.abs(f[1]), (f[1] > 0 ? '+' : '') + f[1]]),
        Math.max.apply(null, d.factors.map(f => Math.abs(f[1])).concat([2])));

      const yaoName = d.mainYao ? (d.mainYao.fu ? '伏神' : YAO[(d.mainYao.pos || 1) - 1]) : '—';

      return U.resHead(hex.name, `第 ${hex.no} 卦 · ${bg.gong}宫 ${bg.type} · 用神${d.mainQin}`) +
        (d.q ? `<p class="branch-lead" style="margin:0 0 10px">所问：<em>${U.esc(d.q)}</em>（${d.catName}）</p>` : '') +
        U.card('卦象', U.yao(d.lines, { dong: d.dong, shi: bg.shi, ying: bg.ying }) +
          `<div class="grid2" style="margin-top:8px">
            <div>${U.kv([['本卦', hex.name], ['卦宫', bg.gong + '宫（' + bg.gongWx + '）'], ['世次', bg.type], ['上下卦', hex.upper.name + '上' + hex.lower.name + '下']])}</div>
            <div>${U.kv([['动爻', d.dong.length ? d.dong.map(i => YAO[i]).join('、') : '六爻安静'], ['变卦', d.bianZ ? d.bianZ.hex.name : '无'], ['卦性', (d.liuChong ? '六冲卦 ' : '') + (d.liuHe ? '六合卦 ' : '') + (d.fuYin ? '伏吟 ' : '') + (d.fanYin ? '反吟' : '') || '平常'], ['旬空', d.kong.map(i => C.ZHI[i]).join('')]])}</div>
          </div>`) +
        (tossHtml || U.card('手动指定', U.yao(d.lines, { dong: d.dong, shi: bg.shi, ying: bg.ying }))) +
        U.sec('装卦', U.table(['六神', '伏神', '本卦（六亲·纳甲）', '爻象', '变卦', '动'], rows)) +
        U.sec('用神与旺衰', U.p(`用神取 <em>${d.mainQin}</em>：${d.mainNote}。` +
          (d.mainYao ? `用神在 <em>${yaoName}</em>，纳甲 <em>${d.mainYao.gz}</em>，五行 ${U.wx(d.mainYao.wx)}。` : '')) +
          (d.factors.length ? barHtml : '')) +
        U.card('断语', `<p><b style="font-size:15px" data-wx="${d.verdictCls === 'good' ? '木' : d.verdictCls === 'bad' ? '火' : '土'}">${d.verdict}</b></p>` +
          U.p(d.catName ? '所问' + d.catName + '：' + d.cat.tip : '') +
          U.p(d.shiYingText) + U.p(d.shiText) +
          U.p(d.dong.length === 0 ? '六爻安静，事体不动，以用神旺衰与世应关系断之，成否多依常理。'
            : `动爻 ${d.dong.length} 个（${d.dong.map(i => YAO[i]).join('、')}），` +
            (d.dong.length === 1 ? '一爻独发，事之关键在此一爻，看其生克世用与变爻回头。'
              : d.dong.length <= 3 ? '数爻齐动，事多变迁，须分主次，以生用神者为吉、克用神者为忌。'
                : '动爻众多，事体纷乱，宜先静观其变，不宜骤断。'))) +
        U.card('用神取法', U.table(['所问', '用神', '旁参'],
          Object.keys(YONGSHEN).map(k => ({ cls: k === d.cat ? 'hi' : '', cells: [YONGSHEN[k].name, YONGSHEN[k].main, YONGSHEN[k].sub] })))) +
        U.card('月建日辰', U.kv([
          ['起课时间', G.fmtTime({ y: d.fp.input.y, m: d.fp.input.m, d: d.fp.input.d, h: d.fp.input.h, min: d.fp.input.min })],
          ['四柱', `${d.fp.year.name}年 ${d.fp.month.name}月 ${d.fp.day.name}日 ${d.fp.hour.name}时`],
          ['月建（节气后）', d.fp.month.name + '（' + d.fp.month.jie + ' 后）'],
          ['日辰', d.fp.day.name + '（旬空 ' + d.kong.map(i => C.ZHI[i]).join('') + '）'],
          ['六神起例', '依日干：' + d.fp.day.gan + '日，自初爻起' + C.liuShenOf(G.GAN.indexOf(d.fp.day.gan)).join('、')]
        ])) +
        U.card('术语小释', U.kv([
          ['纳甲', '以京房纳甲法将干支配入六爻：乾纳甲壬、坤纳乙癸、震庚、巽辛、坎戊、离己、艮丙、兑丁。'],
          ['六亲', '以卦宫五行为我：生我者父母、我生者子孙、克我者官鬼、我克者妻财、同我者兄弟。'],
          ['世应', '依京房八宫卦序定：本宫卦世六应三、一世世初应四……游魂世四应初、归魂世三应六。'],
          ['旬空', '以日干支所在之旬定：甲子旬空戌亥、甲戌旬空申酉……用神逢空则其事虚。'],
          ['伏神', '本卦六亲不全时，取本宫卦同位之爻为伏神，须得日月生扶方能出伏。'],
          ['六冲六合', '六爻初四、二五、三六三对地支皆冲为六冲卦（主散），皆合为六合卦（主成）。']
        ])) +
        U.note('本站断法以月建、日辰、动爻、变爻对用神的生克加权评分，属<em>可复核的简化断法</em>；' +
          '实际断卦尚须参以卦象、爻位、神煞、进退、伏吟反吟等，非一评分可尽。' +
          '结果仅供文化体验与自省，不构成任何决策依据。', true) +
        U.disclaim();
    }
  });
})();
