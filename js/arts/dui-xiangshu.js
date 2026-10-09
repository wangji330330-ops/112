/* 相术（形法之属：面相 · 手相 · 气色骨相） */
(function () {
  'use strict';
  const C = window.CORE, U = C.UI;

  /* ============================================================
     一、自评项目（本站自拟量表，非古籍条目）
     每项只计一轴：axis 'g' = 刚柔（形与神之大小外显），'z' = 整散（纹与态之分明安定）
     选项分三档，依次记 2 / 1 / 0 分 —— 越靠前的选项分越高（规则见 method 与结果页计分表）
     ============================================================ */
  const ITEMS = [
    {
      k: 'e', name: '额（上停）', dept: 'face', axis: 'g', defIdx: 1,
      label: '额 · 发际至眉（上停）',
      opts: [
        { v: 'a', t: '宽阔饱满', s: 2 },
        { v: 'b', t: '宽窄适中', s: 1 },
        { v: 'c', t: '较窄而低', s: 0 }
      ]
    },
    {
      k: 'brow', name: '眉（保寿官）', dept: 'face', axis: 'z', defIdx: 1,
      label: '眉 · 保寿官（取眉形之分明）',
      opts: [
        { v: 'a', t: '浓密而长、眉形分明', s: 2 },
        { v: 'b', t: '浓淡适中', s: 1 },
        { v: 'c', t: '稀疏短淡', s: 0 }
      ]
    },
    {
      k: 'eye', name: '目（监察官）', dept: 'face', axis: 'g', defIdx: 1,
      label: '目 · 监察官（取神情之外显）',
      opts: [
        { v: 'a', t: '大而目光外露', s: 2 },
        { v: 'b', t: '大小适中', s: 1 },
        { v: 'c', t: '细长收敛', s: 0 }
      ]
    },
    {
      k: 'nose', name: '鼻（审辨官）', dept: 'face', axis: 'g', defIdx: 1,
      label: '鼻 · 审辨官（中停）',
      opts: [
        { v: 'a', t: '鼻梁高挺、准头丰满', s: 2 },
        { v: 'b', t: '挺直适中', s: 1 },
        { v: 'c', t: '低平宽缓', s: 0 }
      ]
    },
    {
      k: 'mouth', name: '口（出纳官）', dept: 'face', axis: 'z', defIdx: 1,
      label: '口 · 出纳官（取唇线之清晰）',
      opts: [
        { v: 'a', t: '唇形饱满、唇线清晰', s: 2 },
        { v: 'b', t: '厚薄适中', s: 1 },
        { v: 'c', t: '唇薄而线条淡', s: 0 }
      ]
    },
    {
      k: 'chin', name: '颏（下停）', dept: 'face', axis: 'g', defIdx: 1,
      label: '颏 · 鼻底至下巴（下停）',
      opts: [
        { v: 'a', t: '圆厚有力', s: 2 },
        { v: 'b', t: '方圆适中', s: 1 },
        { v: 'c', t: '尖而窄', s: 0 }
      ]
    },
    {
      k: 'line', name: '掌纹三主线', dept: 'hand', axis: 'z', defIdx: 1,
      label: '掌纹 · 天纹人纹地纹',
      opts: [
        { v: 'a', t: '三条清晰深长', s: 2 },
        { v: 'b', t: '深浅适中、略见支线', s: 1 },
        { v: 'c', t: '浅淡杂乱、多细碎分叉', s: 0 }
      ]
    },
    {
      k: 'mount', name: '掌丘（七丘）', dept: 'hand', axis: 'g', defIdx: 1,
      label: '掌丘 · 七丘',
      opts: [
        { v: 'a', t: '掌丘丰满隆起', s: 2 },
        { v: 'b', t: '平坦适中', s: 1 },
        { v: 'c', t: '掌面平坦少肉', s: 0 }
      ]
    },
    {
      k: 'hand', name: '手型', dept: 'hand', axis: 'g', defIdx: 1,
      label: '手型 · 掌与指的比例',
      opts: [
        { v: 'a', t: '掌方指短、掌肉厚实', s: 2 },
        { v: 'b', t: '掌指匀称', s: 1 },
        { v: 'c', t: '掌长指长、掌薄', s: 0 }
      ]
    },
    {
      k: 'speed', name: '语速与动作', dept: 'bearing', axis: 'z', defIdx: 1,
      label: '举止 · 语速与动作（自省项）',
      opts: [
        { v: 'a', t: '平和从容', s: 2 },
        { v: 'b', t: '时快时慢', s: 1 },
        { v: 'c', t: '语速偏快、动作外放', s: 0 }
      ]
    },
    {
      k: 'qi', name: '近日常态（气色）', dept: 'bearing', axis: 'z', defIdx: 1,
      label: '气色 · 近日常态（自省项）',
      opts: [
        { v: 'a', t: '神情饱满、目光安定', s: 2 },
        { v: 'b', t: '平常', s: 1 },
        { v: 'c', t: '疲倦、神情散乱', s: 0 }
      ]
    }
  ];
  const DEPT_NAME = { face: '面（三停五官）', hand: '手（掌纹掌丘）', bearing: '神态（气色举止）' };
  const DEPT_READ = {
    face: '面部这一段，传统读作"先天格局"，本站只把它读成<strong>你平时给人的第一印象</strong>：偏刚（轮廓外显、五官分明）还是偏柔（轮廓内敛、五官含蓄），偏整（匀称）还是偏散（错落）。第一印象影响别人怎么起手跟你打交道，这是社会现象，不是吉凶。',
    hand: '掌纹与掌丘，旧说读"后天经历"。本站只描述<strong>形态</strong>：纹路清晰者多被读作做事有条理，掌肉丰厚者多被读作能担事。须说明的是——掌纹在胎儿期即由皮肤褶曲形成，其基本走行出生时已定，深浅会随年龄、职业与劳动而变；<strong>它与寿命、疾病没有可靠的对应关系</strong>。',
    bearing: '气色与举止是三项里<strong>最易变</strong>的一项，随作息、情绪、场合而改。故这一项只宜当"这几天的状态"看，不可当"本性"看；若这一项偏散，多半说明近来累了，与相貌格局无关。'
  };

  /* 3×3 形局倾向（本站自拟，只读性格与处事倾向） */
  const JU = {
    '偏刚|偏整': {
      n: '峻整之局',
      t: '形局外显而条理分明的一面居多。做事倾向先立框架再动手，对"对不对"比对"快不快"更在意；与人相处时标准用得顺手，也容易把标准当尺子去量别人，这一点宜留意。适合需要长期扛住一件事的场合。'
    },
    '偏刚|中和': {
      n: '劲和之局',
      t: '外显而有分寸。行动力不弱，又肯留余地；遇事先表态再调整，不太爱绕弯子。宜留意的是：表态早了，别人容易当作结论已定，把"我再想想"说出口反而省事。'
    },
    '偏刚|偏散': {
      n: '锋散之局',
      t: '外显而条理偏散。想法多、起念快，容易同时开好几件事；长处是灵活、不认死理，短处是收尾吃力。宜借外力给自己设期限，或找个人专门替你收尾。'
    },
    '中和|偏整': {
      n: '平正之局',
      t: '外显与条理都居中。讲次序，也不排斥变通；不抢头，也不太落后。宜留意的是"还好"最容易拖成"就这样吧"——该表态时不妨直说。'
    },
    '中和|中和': {
      n: '中和之局',
      t: '两端都居中，是可塑性最大的一种分布。既能守规矩，也能权变；宜留意的是：什么都能接受，反而容易缺一件非做不可的事——给自己定一件要守住的事。'
    },
    '中和|偏散': {
      n: '舒缓之局',
      t: '外显偏少、条理也偏散。性子不急，能容事；与人相处不争锋，但容易被误读为不上心。宜把在意的事说出来，别让人靠猜。'
    },
    '偏柔|偏整': {
      n: '柔整之局',
      t: '外显偏内敛、条理分明。想得细、忍得住，做事偏稳；长处是少出错，短处是启动慢。宜给自己立一条"先做三成再优化"的规矩，免得打磨到错过时机。'
    },
    '偏柔|中和': {
      n: '温润之局',
      t: '外显偏内敛、条理居中。与人相处温和，遇冲突倾向先退半步；宜留意的是：退得多了，别人会以为你没有立场——把底线用平静的话讲清楚即可。'
    },
    '偏柔|偏散': {
      n: '绵漫之局',
      t: '两端都偏内。心思绵密而少外露，节奏偏慢；长处是耐得住、看得远，短处是容易在心里反复而不落地。宜把事情写下来、拿给人看，一出口就轻一半。'
    }
  };

  /* ============================================================
     二、面相分区：三停 / 五官 / 十二宫
     三停、五官、十二宫之名与位置为相书通行之说（《神相全编》一路），
     各家在十二宫的定位上略有出入；本站只作分区语言，不详断。
     ============================================================ */
  const SANTING = [
    ['上停', '发际至眉', '旧说主早年与天分。现代看，这一段是人脸最先被注意到、也最常被用来判断"有没有精神"的地方。'],
    ['中停', '眉至鼻底', '旧说主中年与自我。本站读作"自我主张与行动力给人的观感"。'],
    ['下停', '鼻底至颏', '旧说主晚年与下属。本站读作"耐性与包容给人的观感"。']
  ];
  const WUGUAN = [
    ['眉', '保寿官', '"保寿"是旧称，本站不据此谈寿。可读的是：眉的浓密疏淡影响一个人给人的"锋锐"或"柔和"印象。'],
    ['目', '监察官', '"监察"指神情外露与否。目光是面部最早被读取的信息之一，也是最能被情绪即时改变的一项。'],
    ['鼻', '审辨官', '"审辨"取居中主断之意。鼻居面之中，形制高低影响面部的立体感与整体匀称度。'],
    ['口', '出纳官', '"出纳"取言语出入之意。可读的是唇形与表情习惯给人的开放或保留之感。'],
    ['耳', '采听官', '"采听"取听闻之意。耳形在相书中位置颇重，现代看它更多只影响侧面的轮廓印象。']
  ];
  const GONG12 = [
    ['命宫', '两眉之间（印堂）', '性情气度与临事的态度'],
    ['财帛宫', '鼻（准头、鼻翼）', '对财物的态度与用度习惯'],
    ['兄弟宫', '两眉', '同辈、伙伴间的相处方式'],
    ['田宅宫', '上眼睑（眼胞）', '居处、家宅、安顿之事上的倾向'],
    ['男女宫', '眼下泪堂（卧蚕）', '对子女、晚辈与照护之责的态度'],
    ['奴仆宫', '地阁、口角之下', '对待下属与受托之事的风格'],
    ['妻妾宫', '眼尾（鱼尾）', '亲密关系里的相处方式'],
    ['疾厄宫', '山根、年寿（鼻梁上段）', '旧说主身体；本站只读"抗压与自我照顾的习惯"'],
    ['迁移宫', '额角、发际两侧（天仓、驿马）', '外出、变动、异地之事上的倾向'],
    ['官禄宫', '中正（额中央）', '事业心、责任与公共角色'],
    ['福德宫', '天仓（眉尾上方）与地库', '休息、享受与内心余地的多寡'],
    ['父母宫', '日角、月角（额上两侧）', '与长辈、师承的关系倾向']
  ];

  const FORM = ITEMS.map(it => ({
    name: it.k, label: it.label, type: 'chips',
    options: it.opts.map(o => ({ v: o.v, t: o.t })),
    value: it.opts[it.defIdx].v
  }));

  function pick(it, v) {
    const o = it.opts.filter(x => x.v === String(v))[0];
    return o || it.opts[it.defIdx];
  }
  function level(v, max) {
    if (!max) return '中和';
    const r = v / max;
    if (r >= 0.7) return '偏刚';
    if (r <= 0.3) return '偏柔';
    return '中和';
  }
  function levelZ(v, max) {
    if (!max) return '中和';
    const r = v / max;
    if (r >= 0.7) return '偏整';
    if (r <= 0.3) return '偏散';
    return '中和';
  }

  window.ART({
    id: 'xiangshu',
    name: '相术',
    alias: ['相人', '形法', '面相', '手相', '麻衣相法'],
    gua: 'other',
    order: 1,
    tagline: '面相三停五官十二宫 · 手相三主线七丘，形法之属；本页只读性格与处事倾向',

    intro: `
      <p>相术属<strong>形法</strong>，与堪舆同源而异流——《汉书·艺文志》立"形法"一家，
      谓"形法者，大举九州之势以立城郭室舍，形人及六畜骨法之度数、器物之形容，
      以求其声气贵贱吉凶"。相人之事春秋已见（《左传》有"相"的记载），
      《荀子》特立《非相》一篇讥之；后世相书以《麻衣相法》《柳庄相法》《神相全编》
      《相理衡真》等为要籍，门类分面相、手相、骨相、气色、声音、行止。
      相术<strong>不以八卦为体</strong>，与八卦无直接象数关联，故本站列于"其他术数"，
      不设于八卦分支之上。</p>
      <p>相术的骨架是一套<strong>分区语言</strong>：面分<em>三停</em>（发际至眉、眉至鼻底、鼻底至颏），
      立<em>五官</em>（眉为保寿官、目为监察官、鼻为审辨官、口为出纳官、耳为采听官），
      布<em>十二宫</em>（命宫、财帛、兄弟、田宅、男女、奴仆、妻妾、疾厄、迁移、官禄、福德、父母）；
      手分<em>三主线</em>（天纹、人纹、地纹）与<em>七丘</em>。相书自有两条要诀：
      "相由心生"与"相不独论"。须如实说明：<strong>"相由心生"是传统观念</strong>
      （语出佛家语汇，相书亦用），其可成立的意思是"心境会改变神情与气度"，
      而不是"相貌会随德行或命运改变"这样的因果律；<strong>"相不独论"倒是相书内部的自我节制</strong>——
      一官独好不足恃，须形、神、气、色、声、行并观，且要看其人所处之时与地。</p>
      <p>现代心理学给出的解释是：相术之"准"，多半来自<em>巴纳姆效应</em>（笼统的描述人人觉得像自己）、
      <em>确认偏误</em>（记住说中的、忘掉说不中的）、<em>自我实现预言</em>（被说"你内向"的人慢慢真的少说话）
      与<em>体貌刻板印象</em>（外貌会影响别人怎么对待你，从而影响你的机会——这是社会现象，不是相貌自带吉凶）。
      目前<strong>没有任何可靠证据支持"相貌可以预测寿命、疾病、贫富或婚姻成败"</strong>。
      故本页立一条规矩：<strong>只读性格与处事的倾向，绝不写寿夭、疾病、灾祸、贫富、婚姻成败</strong>。</p>`,

    method: `
      <p>下面是十一项<strong>自评</strong>。请照镜子或看自己的手，逐项选最接近的一项（拿不准就选中间那一项），
      按"看形局"得结果。<em>这是一份本站自拟的量表，不是古籍里的相法条目</em>；
      它测的是"你怎么看自己"，而不是"别人怎么看你"——两者常常不同。</p>
      <p><strong>计分规则（写明）：</strong>每项只计入一个轴，选项三档依次记 <strong>2、1、0</strong> 分
      （越靠前的选项分越高，例如额选"宽阔饱满"记 2 分、"宽窄适中"记 1 分、"较窄而低"记 0 分）。
      <strong>刚柔轴</strong>由"形与神"六项定（额、目、鼻、颏、掌丘、手型），满分 12；
      <strong>整散轴</strong>由"纹与态"五项定（眉、口、掌纹、语速、气色），满分 10。
      某轴得分 ≥ 满分的 70% 判<strong>偏刚 / 偏整</strong>，≤ 30% 判<strong>偏柔 / 偏散</strong>，其间为<strong>中和</strong>；
      两轴各三级，共九种形局倾向。结果页会列出<strong>逐项计分表</strong>，可自行核对。</p>
      <p>再说一次：本页<strong>不读寿命、不读疾病、不读吉凶祸福、不读贫富婚姻</strong>。
      若某条解读让你觉得"说得真像"，请先想一想这是不是巴纳姆效应——
      一句足够笼统的话，对谁都能像。把它当作自省的由头即可，不必当作结论。</p>`,

    form: FORM,

    cast(input) {
      let G = 0, Z = 0, Gmax = 0, Zmax = 0;
      const per = {
        face: { g: 0, z: 0, gm: 0, zm: 0 },
        hand: { g: 0, z: 0, gm: 0, zm: 0 },
        bearing: { g: 0, z: 0, gm: 0, zm: 0 }
      };
      const picks = [];
      ITEMS.forEach(it => {
        const o = pick(it, input[it.k]);
        const p = per[it.dept];
        if (it.axis === 'g') { G += o.s; Gmax += 2; p.g += o.s; p.gm += 2; }
        else { Z += o.s; Zmax += 2; p.z += o.s; p.zm += 2; }
        picks.push({ name: it.name, dept: it.dept, axis: it.axis, t: o.t, s: o.s, max: 2 });
      });
      const gl = level(G, Gmax), zl = levelZ(Z, Zmax);
      const ju = JU[gl + '|' + zl] || JU['中和|中和'];
      const depts = ['face', 'hand', 'bearing'].map(k => {
        const p = per[k];
        return {
          name: DEPT_NAME[k],
          gl: p.gm ? level(p.g, p.gm) : '—',
          zl: p.zm ? levelZ(p.z, p.zm) : '—',
          read: DEPT_READ[k],
          hasG: !!p.gm, hasZ: !!p.zm,
          g: p.g, gm: p.gm, z: p.z, zm: p.zm,
          items: picks.filter(x => x.dept === k).map(x => x.name + '：' + x.t)
        };
      });
      return {
        G: G, Z: Z, Gmax: Gmax, Zmax: Zmax, gl: gl, zl: zl,
        ju: ju, depts: depts, picks: picks,
        gItems: picks.filter(x => x.axis === 'g'), zItems: picks.filter(x => x.axis === 'z')
      };
    },

    view(d) {
      const warn = U.note('<strong>本页不作预测。</strong>相术为传统形法，本站只读"性格与处事的倾向"，' +
        '<em>绝不写寿命、疾病、灾祸、贫富、婚姻成败</em>；自评量表为本站自拟，评分规则已写明，属文化体验与自省之用。', true);

      const head = U.resHead(d.ju.n, '形局倾向 · 刚柔' + d.gl + ' / 整散' + d.zl);

      const axis = U.card('形局坐标', U.bars([
        ['刚柔', d.G, d.gl + ' ' + d.G + '/' + d.Gmax],
        ['整散', d.Z, d.zl + ' ' + d.Z + '/' + d.Zmax]
      ], Math.max(d.Gmax, d.Zmax)) +
        U.note('刚柔轴由<strong>形与神</strong>六项定（额、目、鼻、颏、掌丘、手型），满分 ' + d.Gmax + ' 分；' +
          '整散轴由<strong>纹与态</strong>五项定（眉、口、掌纹、语速、气色），满分 ' + d.Zmax + ' 分。' +
          '每项三选依次记 2、1、0 分；某轴得分 ≥ 满分的 70% 判偏刚/偏整，≤ 30% 判偏柔/偏散，其间为中和。' +
          '各项皆选"适中"者两轴各得半分，判中和——这也是本量表的基准点。'));

      const scoreTable = U.card('分项计分表（可自行核对）',
        U.table(['项', '所选', '轴', '得分'],
          d.picks.map(p => ({
            cells: [U.esc(p.name), U.esc(p.t), p.axis === 'g' ? '刚柔' : '整散', p.s + ' / 2'],
            mono: [3]
          })).concat([
            { cells: ['刚柔合计', '—', '刚柔', d.G + ' / ' + d.Gmax], cls: 'hi' },
            { cells: ['整散合计', '—', '整散', d.Z + ' / ' + d.Zmax], cls: 'hi' }
          ]), { align: ['l', 'l', 'c', 'c'] }) +
        U.note('选项文字中越靠前者得分越高（例如额"宽阔饱满"2 分、"宽窄适中"1 分、"较窄而低"0 分）。' +
          '若某一轴使你觉得"这一项不该这样算"，那正说明<strong>这份量表的分法是本站自定的，不是相书的条目</strong>，' +
          '不必把它当尺子。'));

      const juCard = U.card('形局解读 · ' + d.ju.n, U.p(U.esc(d.ju.t)) +
        U.note('这一段的写法是<strong>自撰白话</strong>：把两轴的分数翻成性格与处事上的倾向，' +
          '不是古籍断语，也不是对你这个人的判定。九种形局并无高下之分。'));

      const deptCard = U.card('三段分项',
        d.depts.map(x => U.card(x.name + ' · ' +
          (x.hasG ? '刚柔' + x.gl + ' ' : '') + (x.hasZ ? '整散' + x.zl : ''),
          U.p(x.read) +
          U.kv([['本段所选', U.esc(x.items.join('；'))],
            ['本段计分', (x.hasG ? '刚 ' + x.g + '/' + x.gm : '') +
              (x.hasG && x.hasZ ? ' · ' : '') + (x.hasZ ? '整 ' + x.z + '/' + x.zm : '')]])
        )).join(''));

      /* 面向：简笔示意图 */
      const faceFig = U.card('面相分区示意（简笔，本站自绘）',
        '<div class="figure"><canvas id="xs-face" width="560" height="580" style="width:100%;max-width:420px"></canvas></div>' +
        U.note('图中横虚线为<strong>三停</strong>分界（发际、眉、鼻底、颏底），竖点线为面部中轴；' +
          '所绘五官为眉眼鼻口耳之位置示意。这是本站自绘的简笔分区图，不是任何古籍的摹本。') +
        '<div class="face-grid" style="grid-template-columns:1fr">' +
        SANTING.map(s => '<div class="chip" style="display:block;padding:8px 10px;line-height:1.7">' +
          '<b class="mono-k">' + s[0] + '</b> · ' + s[1] + '<br>' + U.esc(s[2]) + '</div>').join('') +
        '</div>');

      const wuguan = U.card('五官 · 五官方名',
        U.table(['官', '官名', '白话说明（自撰）'], WUGUAN.map(w => ({
          cells: ['<span class="mono-k">' + w[0] + '</span>', w[1], U.esc(w[2])], left: [2]
        })), { align: ['c', 'c', 'l'] }) +
        U.note('"保寿官"之"寿"是旧名，本页不据此谈寿；五官之说见于相书通行本，本站只取其分区语言。'));

      const gong12 = U.card('面部十二宫（分区示意）',
        '<div class="face-grid">' + GONG12.map(g =>
          '<div class="chip" style="display:block;padding:8px 10px;line-height:1.65">' +
          '<b class="mono-k">' + g[0] + '</b><br>' + U.esc(g[1]) + '<br>' +
          '<span style="font-size:11.5px;color:#6d685c">' + U.esc(g[2]) + '</span></div>').join('') + '</div>' +
        U.note('十二宫之名与所主为相书通行之说（《神相全编》一路），各家在定位上略有出入；' +
          '表中"疾厄宫"一项，旧说主人身之病，本站改为读"抗压与自我照顾的习惯"，' +
          '<strong>不作任何健康状况的判断</strong>。'));

      /* 手相 */
      const handFig = U.card('手相分区示意（简笔，本站自绘）',
        '<div class="figure"><canvas id="xs-hand" width="660" height="470" style="width:100%;max-width:520px"></canvas></div>' +
        '<div class="grid2">' +
        U.card('三主线', U.kv([
          ['天纹', '即俗称的感情线，掌之上部横弧，位近指根。'],
          ['人纹', '即智慧线，自虎口一侧斜走掌中。'],
          ['地纹', '即生命线，环大鱼际而下，至腕前。'],
          ['须说明', '地纹（生命线）的<strong>长短与寿命无关</strong>——这是手相里最常被误读的一条；掌纹走行在胎儿期即由皮肤褶曲形成，深浅随劳动与年龄而变。']
        ])) +
        U.card('七丘', U.kv([
          ['金星丘', '拇指根部隆起（大鱼际）。'],
          ['木星丘', '食指根部。'],
          ['土星丘', '中指根部。'],
          ['太阳丘', '无名指根部。'],
          ['水星丘', '小指根部。'],
          ['月丘', '小指侧掌根（小鱼际）。'],
          ['火星丘', '掌心中部与虎口一侧，旧说分上、下火星丘，合为七丘之说。']
        ])) +
        '</div>' +
        U.card('手指长短比例', U.p('相书里另有"指掌相配"之说，近人常引的是<strong>食指与无名指的长度比（2D:4D）</strong>：' +
          '有研究提出该比值与胎儿期的雄激素暴露水平有关，并报道过它与若干行为指标的<em>弱</em>相关。' +
          '须如实说明：<strong>效应量小，重复研究的结论并不一致</strong>，' +
          '更没有任何依据可以用一根手指的长短去判断某个具体的人。本站把它列出来，只为说明"量化的相法"仍然受同样的限制。')));

      const qise = U.card('气色与骨相梗概',
        U.p('<strong>气色：</strong>相书看面部色泽与光泽，以青、赤、黄、白、黑五色配五行，随四时与作息而变，' +
          '并强调"望色"须在晨起、自然光下看。本站须点明：气色是<strong>状态</strong>，睡不好、刚运动完、' +
          '室内灯光偏黄都会改变它，<strong>不能据此谈病</strong>。') +
        U.p('<strong>骨相：</strong>看头骨、颧、颌、眉骨的形态与面部的纵深，旧说有"骨相定终身"之语。' +
          '现代可对应的部分是：面部骨架决定了一个人的轮廓与第一印象，而第一印象确实会影响别人对你的初始态度——' +
          '但这只说明<em>他人的偏见</em>存在，不说明骨架能预言什么。'));

      const modern = U.card('现代视角：相术为什么会"像"',
        U.ul([
          '<strong>巴纳姆效应</strong>：足够笼统、两头都占的描述（"你外表随和，内心其实很有主见"），对绝大多数人都成立。',
          '<strong>确认偏误</strong>：说中的记住，说不中的忘掉，几轮下来就觉得"很准"。',
          '<strong>自我实现预言</strong>：被告知"你性子急"，人可能真的更急；被夸"你稳"，也可能真的更稳。',
          '<strong>体貌刻板印象</strong>：外貌影响他人对你的期待与待遇，进而影响机会——这是社会心理学中较稳固的效应，但它是"偏见造成的"，不是"相貌自带的"。',
          '<strong>可证伪性</strong>：以上机制都能解释相术之"准"，而不需要假设施相者能读到命运。'
        ]) +
        U.note('相术作为文化遗产，值得了解的是它那套<strong>观察人的语言</strong>与分寸感（如"相不独论"）；' +
          '不值的，是把它当成判决书。'));

      const terms = U.card('术语小释', U.kv([
        ['形法', '《汉书·艺文志》所列术数流派之一，含相地（堪舆）与相人、相物。相术属其中的相人。'],
        ['三停', '上停（发际至眉）、中停（眉至鼻底）、下停（鼻底至颏）。'],
        ['五官', '眉（保寿官）、目（监察官）、鼻（审辨官）、口（出纳官）、耳（采听官）。'],
        ['十二宫', '把面部分为命宫、财帛、兄弟、田宅、男女、奴仆、妻妾、疾厄、迁移、官禄、福德、父母十二区。'],
        ['相不独论', '相书内部的节制之语：一官独好不足恃，须形神气色声行并观，并参其时其地。'],
        ['相由心生', '传统观念，可解作"心境会改变神情与气度"，不可解作"相貌随德行改变"的因果律。'],
        ['掌丘', '掌上隆起之处的统称，共七丘：金星、木星、土星、太阳、水星、月、火星。']
      ]));

      const tail = U.note('本页标注为<strong>简化演示 / 自撰</strong>之处：①十一项自评量表与两轴计分规则、九种形局之名与解读文字，' +
        '全为本站自拟自撰，非古籍条目；②三停、五官、十二宫、七丘之名与位置取自相书通行之说，各家定位略有出入，此处只作分区示意；' +
        '③两张示意图为本站自绘的简笔画，非古籍摹本；④气色、骨相二节只作概念说明，未纳入计分。' +
        '再次声明：<strong>本页不读寿命、疾病、灾祸、贫富、婚姻成败</strong>。', true);

      return head + warn + U.sec('自评结果', axis + scoreTable + juCard + deptCard) +
        U.sec('面相', faceFig + wuguan + gong12) +
        U.sec('手相', handFig) +
        U.sec('气色 · 骨相', qise) +
        U.sec('参考', modern + terms + tail +
          U.disclaim('相貌与命运之间没有可靠的因果关系；本页内容不构成医疗、心理、婚恋、择业、财务等任何决策依据。'));
    },

    /* 唯一可操作 DOM 的地方：两张简笔示意图 */
    mount(root, data) {
      drawFace(root.querySelector('#xs-face'));
      drawHand(root.querySelector('#xs-hand'));
    }
  });

  /* ---------- 简笔面相（本站自绘） ---------- */
  function drawFace(cv) {
    if (!cv || !cv.getContext) return;
    const ctx = cv.getContext('2d');
    const W = cv.width, H = cv.height, cx = W / 2;
    const ink = '#171614', red = '#a8322d', soft = 'rgba(23,22,20,.30)', faint = 'rgba(23,22,20,.16)';
    ctx.clearRect(0, 0, W, H);
    ctx.lineCap = 'round';

    /* 脸型轮廓 */
    ctx.strokeStyle = ink; ctx.lineWidth = 1.7;
    ctx.beginPath();
    ctx.moveTo(cx, 52);
    ctx.bezierCurveTo(cx + 120, 52, cx + 142, 156, cx + 138, 246);
    ctx.bezierCurveTo(cx + 134, 336, cx + 98, 436, cx, 494);
    ctx.bezierCurveTo(cx - 98, 436, cx - 134, 336, cx - 138, 246);
    ctx.bezierCurveTo(cx - 142, 156, cx - 120, 52, cx, 52);
    ctx.closePath();
    ctx.stroke();

    /* 中轴 */
    ctx.save();
    ctx.setLineDash([2, 5]); ctx.strokeStyle = faint; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(cx, 60); ctx.lineTo(cx, 486); ctx.stroke();
    ctx.restore();

    /* 三停分界：发际 108 / 眉 222 / 鼻底 352 / 颏底 494 */
    const lines = [[108, 112, '发际'], [222, 134, '眉'], [352, 110, '鼻底'], [494, 44, '颏底']];
    ctx.save();
    ctx.setLineDash([6, 5]); ctx.strokeStyle = soft; ctx.lineWidth = 1.2;
    lines.forEach(l => { ctx.beginPath(); ctx.moveTo(cx - l[1], l[0]); ctx.lineTo(cx + l[1], l[0]); ctx.stroke(); });
    ctx.restore();

    ctx.fillStyle = '#6d685c';
    ctx.font = '13px "Songti SC","STSong","SimSun",serif';
    ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    lines.forEach(l => { ctx.fillText(l[2], cx - 150, l[0]); });
    ctx.textAlign = 'left';
    ctx.fillStyle = red;
    const bands = [['上停', (108 + 222) / 2], ['中停', (222 + 352) / 2], ['下停', (352 + 494) / 2]];
    bands.forEach(b => { ctx.fillText(b[0], cx + 150, b[1]); });
    /* 三停括线 */
    ctx.save();
    ctx.strokeStyle = 'rgba(168,50,45,.45)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(cx + 144, 108); ctx.lineTo(cx + 144, 494); ctx.stroke();
    bands.forEach(b => {
      const y = b[1] === (108 + 222) / 2 ? 108 : (b[1] === (222 + 352) / 2 ? 222 : 352);
      const y2 = b[0] === '上停' ? 222 : (b[0] === '中停' ? 352 : 494);
      ctx.beginPath(); ctx.moveTo(cx + 138, y); ctx.lineTo(cx + 150, y);
      ctx.moveTo(cx + 138, y2); ctx.lineTo(cx + 150, y2); ctx.stroke();
    });
    ctx.restore();

    /* 眉（左右弧） */
    ctx.strokeStyle = ink; ctx.lineWidth = 3.4;
    ctx.beginPath(); ctx.moveTo(cx - 96, 216); ctx.quadraticCurveTo(cx - 62, 198, cx - 28, 214); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx + 96, 216); ctx.quadraticCurveTo(cx + 62, 198, cx + 28, 214); ctx.stroke();
    /* 目 */
    ctx.lineWidth = 1.6;
    [[-58, 1], [58, -1]].forEach(e => {
      ctx.beginPath(); ctx.ellipse(cx + e[0], 242, 30, 13, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(cx + e[0] + e[1] * 2, 242, 5.5, 0, Math.PI * 2);
      ctx.fillStyle = ink; ctx.fill();
    });
    /* 鼻 */
    ctx.beginPath(); ctx.moveTo(cx - 4, 240); ctx.lineTo(cx - 8, 330); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx + 4, 240); ctx.lineTo(cx + 8, 330); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(cx, 340, 26, 15, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx - 26, 340, 9, Math.PI * 1.6, Math.PI * 0.6); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx + 26, 340, 9, Math.PI * 1.4, Math.PI * 0.4); ctx.stroke();
    /* 口 */
    ctx.beginPath(); ctx.ellipse(cx, 404, 38, 15, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = 'rgba(23,22,20,.45)';
    ctx.beginPath(); ctx.moveTo(cx - 38, 404); ctx.lineTo(cx + 38, 404); ctx.stroke();
    /* 耳 */
    ctx.strokeStyle = ink;
    ctx.beginPath(); ctx.ellipse(cx - 140, 250, 14, 34, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(cx + 140, 250, 14, 34, 0, 0, Math.PI * 2); ctx.stroke();

    /* 图注 */
    ctx.fillStyle = '#9a9486';
    ctx.font = '12px "Songti SC","STSong","SimSun",serif';
    ctx.textAlign = 'center';
    ctx.fillText('三停分界 · 五官位置 示意（本站自绘）', cx, H - 14);
  }

  /* ---------- 简笔手相（本站自绘） ---------- */
  function drawHand(cv) {
    if (!cv || !cv.getContext) return;
    const ctx = cv.getContext('2d');
    const W = cv.width, H = cv.height;
    const ink = '#171614', red = '#a8322d', soft = 'rgba(23,22,20,.32)';
    ctx.clearRect(0, 0, W, H);
    ctx.lineCap = 'round';

    /* 指（圆角矩形） */
    function finger(x, y, w, h) {
      const r = w / 2;
      ctx.beginPath();
      ctx.moveTo(x, y + h);
      ctx.lineTo(x, y + r);
      ctx.arc(x + r, y + r, r, Math.PI, 0);
      ctx.lineTo(x + w, y + h);
      ctx.closePath();
      ctx.stroke();
    }
    ctx.strokeStyle = ink; ctx.lineWidth = 1.6;
    finger(206, 44, 46, 96);
    finger(262, 26, 46, 114);
    finger(318, 40, 46, 100);
    finger(372, 76, 40, 64);

    /* 拇指 */
    ctx.lineWidth = 30; ctx.strokeStyle = 'rgba(23,22,20,.10)';
    ctx.beginPath(); ctx.moveTo(160, 250); ctx.quadraticCurveTo(108, 214, 96, 160); ctx.stroke();
    ctx.lineWidth = 1.6; ctx.strokeStyle = ink;
    ctx.beginPath(); ctx.moveTo(158, 268); ctx.quadraticCurveTo(112, 232, 100, 172); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(140, 276); ctx.quadraticCurveTo(84, 232, 74, 168); ctx.stroke();

    /* 掌轮廓 */
    ctx.beginPath();
    ctx.moveTo(206, 140);
    ctx.bezierCurveTo(172, 150, 156, 190, 154, 248);
    ctx.bezierCurveTo(152, 316, 178, 382, 238, 416);
    ctx.bezierCurveTo(302, 452, 402, 442, 456, 392);
    ctx.bezierCurveTo(500, 350, 514, 240, 500, 164);
    ctx.bezierCurveTo(494, 136, 476, 122, 452, 128);
    ctx.bezierCurveTo(432, 132, 420, 138, 412, 146);
    ctx.bezierCurveTo(392, 132, 372, 124, 350, 126);
    ctx.bezierCurveTo(330, 118, 300, 116, 280, 120);
    ctx.bezierCurveTo(256, 118, 226, 122, 206, 140);
    ctx.closePath();
    ctx.stroke();

    /* 七丘 */
    const mounts = [
      [228, 158, 27, '木星丘'], [286, 150, 25, '土星丘'], [344, 158, 25, '太阳丘'],
      [400, 180, 23, '水星丘'], [204, 322, 44, '金星丘'], [440, 322, 38, '月丘'], [300, 240, 30, '火星丘']
    ];
    ctx.save();
    ctx.setLineDash([3, 4]); ctx.strokeStyle = soft; ctx.lineWidth = 1;
    mounts.forEach(m => { ctx.beginPath(); ctx.arc(m[0], m[1], m[2], 0, Math.PI * 2); ctx.stroke(); });
    ctx.restore();
    ctx.fillStyle = '#6d685c';
    ctx.font = '12px "Songti SC","STSong","SimSun",serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    mounts.forEach(m => { ctx.fillText(m[3], m[0], m[1]); });

    /* 三主线 */
    ctx.strokeStyle = ink; ctx.lineWidth = 2.6;
    /* 天纹（感情线）：小指侧横弧向食指侧 */
    ctx.beginPath(); ctx.moveTo(492, 190);
    ctx.bezierCurveTo(412, 150, 312, 148, 210, 198); ctx.stroke();
    /* 人纹（智慧线）：虎口斜走掌中 */
    ctx.beginPath(); ctx.moveTo(170, 224);
    ctx.bezierCurveTo(250, 252, 360, 250, 470, 282); ctx.stroke();
    /* 地纹（生命线）：环大鱼际至腕 */
    ctx.beginPath(); ctx.moveTo(174, 232);
    ctx.bezierCurveTo(152, 306, 178, 376, 254, 406); ctx.stroke();

    /* 腕线 */
    ctx.strokeStyle = 'rgba(23,22,20,.28)'; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(232, 424); ctx.quadraticCurveTo(330, 448, 448, 400); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(244, 440); ctx.quadraticCurveTo(334, 460, 436, 418); ctx.stroke();

    /* 三主线标注 */
    ctx.fillStyle = red;
    ctx.font = '13px "Songti SC","STSong","SimSun",serif';
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    ctx.fillText('天纹', 300, 138);
    ctx.fillText('人纹', 350, 276);
    ctx.fillText('地纹', 190, 366);

    ctx.fillStyle = '#9a9486';
    ctx.font = '12px "Songti SC","STSong","SimSun",serif';
    ctx.textAlign = 'center';
    ctx.fillText('左掌示意：三主线与七丘（本站自绘）', W / 2, H - 12);
  }
})();
