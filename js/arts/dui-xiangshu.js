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

  /* ---------- 绘图公共 ---------- */
  const INK = '#171614', RED = '#a8322d', DIM = '#6d685c';
  const F_MAIN = '13px "Songti SC","STSong","SimSun",serif';
  const F_TINY = '12px "Songti SC","STSong","SimSun",serif';

  /* 按「逻辑坐标」绘制，并按设备像素比放大画布：高分屏下线条与文字不虚。
     原实现直接用画布属性尺寸 1:1 绘制，在 DPR>1 的屏上会被放大而发糊。 */
  function setupCanvas(cv, LW, LH) {
    /* 上限 2 已足够：画布逻辑宽 560/660，而显示宽度最多 420/520，
       2 倍设备像素即高于显示所需，再往上只是白占内存。 */
    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    cv.width = Math.round(LW * dpr);
    cv.height = Math.round(LH * dpr);
    const ctx = cv.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, LW, LH);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    return ctx;
  }
  /* 压在线上也读得清：先描白边再填字 */
  function tag(ctx, text, x, y, opt) {
    opt = opt || {};
    ctx.save();
    ctx.font = opt.font || F_MAIN;
    ctx.textAlign = opt.align || 'center';
    ctx.textBaseline = opt.baseline || 'middle';
    const halo = opt.halo === undefined ? 3.5 : opt.halo;
    if (halo > 0) { ctx.lineWidth = halo; ctx.strokeStyle = '#fff'; ctx.strokeText(text, x, y); }
    ctx.fillStyle = opt.color || DIM;
    ctx.fillText(text, x, y);
    ctx.restore();
  }
  /* 虚线 */
  function dash(ctx, a, color, w, pattern) {
    ctx.save();
    ctx.setLineDash(pattern || [5, 5]);
    ctx.strokeStyle = color; ctx.lineWidth = w || 1;
    a();
    ctx.restore();
  }

  /* ---------- 面相：按「三停五眼」比例的分区示意（本站自绘） ---------- */
  function drawFace(cv) {
    if (!cv || !cv.getContext) return;
    const LW = 560, LH = 580;
    const ctx = setupCanvas(cv, LW, LH);
    const cx = 280;

    /* 三停：发际 130 / 眉 252 / 鼻底 374 / 颏底 496（每停约一二二） */
    const Y_HAIR = 130, Y_BROW = 252, Y_NOSE = 374, Y_CHIN = 496;
    /* 五眼：面宽 = 五倍眼宽；两眼内角之间恰为一眼宽。
       面宽与面高之比约 1:1.45（真人约 1:1.4），旧版 1:1.57 过瘦，故显怪。 */
    const HW_CHEEK = 150, HW_TEMPLE = 146, HW_HAIR = 136, HW_JAW = 118;
    const EYE_DX = 60, EYE_HW = 30, Y_EYE = 268;

    /* 头发（颅顶）：极淡铺底 + 发际线（中部略低，作美人尖），另添数缕发丝 */
    function hairline() {
      ctx.moveTo(cx - HW_HAIR, Y_HAIR);
      ctx.quadraticCurveTo(cx, Y_HAIR + 16, cx + HW_HAIR, Y_HAIR);
    }
    ctx.beginPath();
    ctx.moveTo(cx - HW_HAIR, Y_HAIR);
    ctx.bezierCurveTo(cx - HW_HAIR - 2, 88, cx - 82, 66, cx, 66);
    ctx.bezierCurveTo(cx + 82, 66, cx + HW_HAIR + 2, 88, cx + HW_HAIR, Y_HAIR);
    hairline();
    ctx.closePath();
    ctx.fillStyle = 'rgba(23,22,20,.055)';
    ctx.fill();
    ctx.strokeStyle = INK; ctx.lineWidth = 1.5;
    ctx.stroke();
    /* 发缕：沿颅顶轮廓内收的两道弧，示意发丝（放射短线会像顶饰，故不用） */
    dash(ctx, () => {
      [14, 28].forEach(d => {
        ctx.beginPath();
        ctx.moveTo(cx - (HW_HAIR - d), Y_HAIR - 2);
        ctx.bezierCurveTo(cx - (HW_HAIR - d) - 2, 92 + d * 0.7, cx - (84 - d), 68 + d * 1.3, cx, 68 + d * 1.5);
        ctx.bezierCurveTo(cx + (84 - d), 68 + d * 1.3, cx + (HW_HAIR - d) + 2, 92 + d * 0.7, cx + (HW_HAIR - d), Y_HAIR - 2);
        ctx.stroke();
      });
    }, 'rgba(23,22,20,.18)', 1.1, [4, 5]);

    /* 面廓：发际—颞—颊—下颌角—颏，再对称回到右发际 */
    ctx.beginPath();
    ctx.moveTo(cx - HW_HAIR, Y_HAIR);
    ctx.bezierCurveTo(cx - HW_TEMPLE, 176, cx - HW_TEMPLE, 226, cx - HW_CHEEK, 292);
    ctx.bezierCurveTo(cx - HW_CHEEK + 4, 340, cx - 126, 392, cx - 112, 420);   /* 下颌角 */
    ctx.bezierCurveTo(cx - 96, 452, cx - 46, 482, cx, Y_CHIN);
    ctx.bezierCurveTo(cx + 46, 482, cx + 96, 452, cx + 112, 420);
    ctx.bezierCurveTo(cx + 126, 392, cx + HW_CHEEK - 4, 340, cx + HW_CHEEK, 292);
    ctx.bezierCurveTo(cx + HW_TEMPLE, 226, cx + HW_TEMPLE, 176, cx + HW_HAIR, Y_HAIR);
    hairline();
    ctx.strokeStyle = INK; ctx.lineWidth = 1.7;
    ctx.stroke();

    /* 耳：位于眉与鼻底之间，贴于颊侧（外缘 + 耳轮） */
    [-1, 1].forEach(s => {
      const x0 = cx + s * (HW_CHEEK - 3), dir = s;
      ctx.beginPath();
      ctx.moveTo(x0, 264);
      ctx.bezierCurveTo(x0 + dir * 22, 262, x0 + dir * 25, 302, x0 + dir * 17, 334);
      ctx.bezierCurveTo(x0 + dir * 11, 354, x0 - dir * 1, 356, x0, 340);
      ctx.strokeStyle = INK; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x0 + dir * 3, 276);
      ctx.bezierCurveTo(x0 + dir * 13, 276, x0 + dir * 14, 302, x0 + dir * 8, 320);
      ctx.strokeStyle = 'rgba(23,22,20,.4)'; ctx.lineWidth = 1.1; ctx.stroke();
    });

    /* 中轴（虚线） */
    dash(ctx, () => { ctx.beginPath(); ctx.moveTo(cx, 64); ctx.lineTo(cx, Y_CHIN + 6); ctx.stroke(); },
      'rgba(23,22,20,.16)', 1, [2, 5]);

    /* 眉：骑在「眉」线上 */
    [-1, 1].forEach(s => {
      ctx.beginPath();
      ctx.moveTo(cx + s * 98, 254);
      ctx.quadraticCurveTo(cx + s * 66, 236, cx + s * 32, 248);
      ctx.strokeStyle = INK; ctx.lineWidth = 4;
      ctx.stroke();
      /* 眉梢略细 */
      ctx.beginPath();
      ctx.moveTo(cx + s * 98, 254);
      ctx.quadraticCurveTo(cx + s * 112, 250, cx + s * 116, 244);
      ctx.lineWidth = 2; ctx.stroke();
    });

    /* 目：上下睑合成杏仁形，内含瞳 */
    [-1, 1].forEach(s => {
      const ex = cx + s * EYE_DX, hh = EYE_HW * 0.42;
      ctx.beginPath();
      ctx.moveTo(ex - EYE_HW, Y_EYE);
      ctx.quadraticCurveTo(ex - s * 4, Y_EYE - hh * 2.1, ex + EYE_HW, Y_EYE);
      ctx.quadraticCurveTo(ex - s * 4, Y_EYE + hh * 1.25, ex - EYE_HW, Y_EYE);
      ctx.strokeStyle = INK; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.beginPath();
      ctx.arc(ex, Y_EYE - hh * 0.2, hh * 0.8, 0, Math.PI * 2);
      ctx.fillStyle = INK; ctx.fill();
    });

    /* 鼻：山根—鼻梁收束至鼻头，下接鼻翼与鼻孔 */
    ctx.beginPath();
    ctx.moveTo(cx - 6, Y_BROW + 2);
    ctx.bezierCurveTo(cx - 9, 296, cx - 12, 330, cx - 13, 344);
    ctx.moveTo(cx + 6, Y_BROW + 2);
    ctx.bezierCurveTo(cx + 9, 296, cx + 12, 330, cx + 13, 344);
    ctx.strokeStyle = 'rgba(23,22,20,.75)'; ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - 13, 344);
    ctx.quadraticCurveTo(cx - 14, 361, cx, 363);
    ctx.quadraticCurveTo(cx + 14, 361, cx + 13, 344);
    ctx.strokeStyle = INK; ctx.lineWidth = 1.6; ctx.stroke();
    /* 鼻翼（鼻孔不另起圈，免得像小胡子） */
    ctx.beginPath();
    ctx.moveTo(cx - 13, 349);
    ctx.bezierCurveTo(cx - 26, 351, cx - 31, 362, cx - 22, Y_NOSE - 2);
    ctx.moveTo(cx + 13, 349);
    ctx.bezierCurveTo(cx + 26, 351, cx + 31, 362, cx + 22, Y_NOSE - 2);
    ctx.strokeStyle = 'rgba(23,22,20,.5)'; ctx.lineWidth = 1.2; ctx.stroke();

    /* 口：上下唇（上唇作唇珠），唇缝微上弯 */
    const Y_MOUTH = 430, MW = 41;
    ctx.beginPath();
    ctx.moveTo(cx - MW, Y_MOUTH);
    ctx.quadraticCurveTo(cx - MW * 0.55, Y_MOUTH - 15, cx - MW * 0.22, Y_MOUTH - 13);
    ctx.quadraticCurveTo(cx, Y_MOUTH - 8, cx + MW * 0.22, Y_MOUTH - 13);
    ctx.quadraticCurveTo(cx + MW * 0.55, Y_MOUTH - 15, cx + MW, Y_MOUTH);
    ctx.strokeStyle = INK; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - MW, Y_MOUTH);
    ctx.quadraticCurveTo(cx, Y_MOUTH + 17, cx + MW, Y_MOUTH);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - MW, Y_MOUTH);
    ctx.quadraticCurveTo(cx, Y_MOUTH - 2.5, cx + MW, Y_MOUTH);
    ctx.strokeStyle = 'rgba(23,22,20,.55)'; ctx.lineWidth = 1.1; ctx.stroke();

    /* 三停分界（横虚线） */
    dash(ctx, () => {
      [[Y_HAIR, HW_HAIR], [Y_BROW, HW_CHEEK], [Y_NOSE, HW_CHEEK - 4], [Y_CHIN, 52]].forEach(l => {
        ctx.beginPath(); ctx.moveTo(cx - l[1], l[0]); ctx.lineTo(cx + l[1], l[0]); ctx.stroke();
      });
    }, 'rgba(23,22,20,.30)', 1.2, [6, 5]);

    /* 左侧界名（右对齐，避让面廓） */
    ctx.textAlign = 'right';
    tag(ctx, '发际', cx - HW_HAIR - 12, Y_HAIR, { color: DIM, align: 'right' });
    tag(ctx, '眉', cx - HW_CHEEK - 8, Y_BROW, { color: DIM, align: 'right' });
    tag(ctx, '鼻底', cx - HW_CHEEK - 8, Y_NOSE, { color: DIM, align: 'right' });
    tag(ctx, '颏底', cx - 62, Y_CHIN, { color: DIM, align: 'right' });

    /* 右侧三停括线 + 停名 */
    const xb = cx + HW_CHEEK + 22;
    ctx.beginPath();
    ctx.moveTo(xb, Y_HAIR); ctx.lineTo(xb, Y_CHIN);
    [Y_HAIR, Y_BROW, Y_NOSE, Y_CHIN].forEach(y => {
      ctx.moveTo(xb - 9, y); ctx.lineTo(xb + 9, y);
    });
    ctx.strokeStyle = 'rgba(168,50,45,.5)'; ctx.lineWidth = 1;
    ctx.stroke();
    tag(ctx, '上停', xb + 14, (Y_HAIR + Y_BROW) / 2, { color: RED, align: 'left' });
    tag(ctx, '中停', xb + 14, (Y_BROW + Y_NOSE) / 2, { color: RED, align: 'left' });
    tag(ctx, '下停', xb + 14, (Y_NOSE + Y_CHIN) / 2, { color: RED, align: 'left' });

    tag(ctx, '三停分界 · 五官位置 示意（本站自绘）', cx, LH - 14, { color: '#9a9486', font: F_TINY });
  }

  /* ---------- 手相：右掌（掌心向观者，拇指在左）三主线与七丘（本站自绘） ---------- */
  function drawHand(cv) {
    if (!cv || !cv.getContext) return;
    const LW = 660, LH = 470;
    const ctx = setupCanvas(cv, LW, LH);

    /* 掌与四指一条连通轮廓：指端略收作锥形、指间留浅凹，
       拇指另作一叶与掌相接，不再像旧版那样把四指画成悬在掌外的圆角矩形。 */
    function finger(x0, x1, yTip, yBase) {
      const tw = 5;                                          /* 指端每侧收窄，略作锥形 */
      const tx0 = x0 + tw, tx1 = x1 - tw;
      const r = (tx1 - tx0) / 2;
      ctx.lineTo(tx0, yTip + r);
      ctx.quadraticCurveTo(tx0, yTip, tx0 + r, yTip);
      ctx.quadraticCurveTo(tx1, yTip, tx1, yTip + r);
      ctx.lineTo(x1, yBase);
    }
    function notch(x0, x1, yBase) {
      ctx.quadraticCurveTo((x0 + x1) / 2, yBase + 12, x1, yBase);
    }

    ctx.beginPath();
    ctx.moveTo(256, 234);                                  /* 食指外根（虎口上方） */
    finger(256, 306, 112, 232);                            /* 食指 */
    notch(306, 310, 232);
    finger(310, 362, 88, 236);                             /* 中指（最长） */
    notch(362, 366, 236);
    finger(366, 412, 100, 234);                            /* 无名指 */
    notch(412, 416, 234);
    finger(416, 454, 142, 244);                            /* 小指（最短） */
    /* 掌之右缘（小指侧）下行至腕：略收，避免掌心过于浑圆 */
    ctx.bezierCurveTo(458, 266, 462, 314, 452, 356);
    ctx.bezierCurveTo(443, 394, 427, 420, 410, 434);
    /* 腕 */
    ctx.lineTo(256, 434);
    /* 掌之左缘（拇指侧）上行 */
    ctx.bezierCurveTo(238, 420, 226, 390, 220, 352);
    ctx.bezierCurveTo(214, 318, 214, 288, 224, 266);
    /* 拇指：外缘上行至指尖，再沿内缘回到虎口（指尖作圆头） */
    ctx.bezierCurveTo(198, 252, 172, 220, 156, 190);
    ctx.bezierCurveTo(144, 168, 138, 148, 152, 138);
    ctx.bezierCurveTo(166, 128, 186, 142, 200, 162);
    ctx.bezierCurveTo(216, 186, 228, 214, 240, 234);
    ctx.quadraticCurveTo(248, 243, 256, 234);
    ctx.closePath();
    ctx.strokeStyle = INK; ctx.lineWidth = 1.7;
    ctx.stroke();

    /* 掌丘（七丘）：虚线圆 + 白描边名，位置依大鱼际/小鱼际与四指根 */
    const mounts = [
      [284, 256, 24, '木星丘'], [338, 254, 22, '土星丘'], [392, 258, 22, '太阳丘'],
      [440, 276, 19, '水星丘'], [258, 348, 36, '金星丘'], [424, 352, 31, '月丘'],
      [322, 306, 21, '火星丘']
    ];
    dash(ctx, () => {
      mounts.forEach(m => { ctx.beginPath(); ctx.arc(m[0], m[1], m[2], 0, Math.PI * 2); ctx.stroke(); });
    }, 'rgba(23,22,20,.30)', 1, [3, 4]);
    mounts.forEach(m => tag(ctx, m[3], m[0], m[1], { color: DIM, font: F_TINY }));

    /* 三主线：天纹横弧在上、人纹自虎口斜出、地纹环大鱼际而下 */
    ctx.strokeStyle = INK; ctx.lineWidth = 2.6;
    /* 天纹（感情线）：小指侧掌缘起，向食指—中指根下铺开 */
    ctx.beginPath();
    ctx.moveTo(458, 268);
    ctx.bezierCurveTo(418, 246, 368, 240, 320, 246);
    ctx.bezierCurveTo(296, 249, 274, 254, 260, 250);
    ctx.stroke();
    /* 人纹（智慧线）：与地纹同起于虎口，斜贯掌中 */
    ctx.beginPath();
    ctx.moveTo(248, 278);
    ctx.bezierCurveTo(298, 288, 350, 302, 402, 318);
    ctx.bezierCurveTo(420, 325, 434, 332, 444, 340);
    ctx.stroke();
    /* 地纹（生命线）：环大鱼际而下，至腕前（须明显内收，才看得出环抱金星丘） */
    ctx.beginPath();
    ctx.moveTo(248, 282);
    ctx.bezierCurveTo(238, 314, 240, 356, 256, 392);
    ctx.bezierCurveTo(268, 416, 284, 430, 302, 436);
    ctx.stroke();

    /* 腕线（两道） */
    dash(ctx, () => {
      ctx.beginPath(); ctx.moveTo(266, 414); ctx.quadraticCurveTo(336, 432, 406, 412); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(278, 428); ctx.quadraticCurveTo(340, 444, 396, 426); ctx.stroke();
    }, 'rgba(23,22,20,.28)', 1.3, [6, 5]);

    /* 三主线名：移到掌外并以引线指认，避免与丘位虚线圆、主线互相压字 */
    function leader(x1, y1, x2, y2, text, align) {
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
      ctx.strokeStyle = 'rgba(168,50,45,.55)'; ctx.lineWidth = 1;
      ctx.stroke();
      tag(ctx, text, align === 'right' ? x2 - 6 : x2 + 6, y2, { color: RED, align: align || 'left' });
    }
    leader(456, 262, 492, 262, '天纹', 'left');
    leader(444, 334, 492, 334, '人纹', 'left');
    leader(246, 372, 208, 372, '地纹', 'right');

    tag(ctx, '右掌示意：三主线与七丘（本站自绘）', LW / 2, LH - 12, { color: '#9a9486', font: F_TINY });
  }
})();
