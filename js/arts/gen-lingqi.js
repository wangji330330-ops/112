/* ============================================================
   艮 · 灵棋经
   十二棋子掷之：上四、中四、下四，视其得数成卦。
   本站所存者为掷法与三数结构；原书一百二十四卦之卦名，
   除个别通行之名外未能确证，故以「上X中Y下Z · 第N卦」之
   数位结构呈现，并声明序号为本站自定。
   ============================================================ */
(function () {
  'use strict';
  const C = window.CORE, U = C.UI, G = C.GZ;
  const ART = window.ART;

  /* ---------- 小工具 ---------- */
  function hashStr(s) {
    let h = 2166136261 >>> 0;
    s = String(s === undefined || s === null ? '' : s);
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    return h >>> 0;
  }

  const WEI = ['上', '中', '下'];

  /* ---------- 掷棋 ---------- */
  /* 甲法（本站默认）：十二子各落上、中、下之一位，三数之和恒为十二（组合 91 种）。 */
  /* 乙法（古法一说）：四子属上、四子属中、四子属下，每子两面（有识/无识），
     视有识面朝上者计入本位；三数各在 0~4 之间，除「三数皆零」一况外，
     恰为 124 种，与文献所记「一百二十四卦」之数相合。 */
  function zhiQi(seed, way) {
    const rnd = C.RNG.seeded(seed);
    const pieces = [];
    if (way === 'classic') {
      let guard = 0;
      do {
        pieces.length = 0;
        for (let i = 0; i < 12; i++) {
          pieces.push({ idx: i + 1, grp: Math.floor(i / 4), hit: rnd.rand() < 0.5 });
        }
        guard++;
      } while (guard < 60 && pieces.every(function (p) { return !p.hit; }));   /* 三数皆零者不成卦，重掷 */
    } else {
      for (let i = 0; i < 12; i++) {
        pieces.push({ idx: i + 1, grp: rnd.randInt(0, 2), hit: true });
      }
    }
    const cnt = [0, 0, 0];
    pieces.forEach(function (p) { if (p.hit) cnt[p.grp]++; });
    return { pieces: pieces, cnt: cnt };
  }

  /* 本站自定之卦序：先上、次中、次下，依数自小而大 */
  function guaNo(c, way) {
    let no = 0;
    if (way === 'classic') {
      for (let x = 0; x <= 4; x++) {
        for (let y = 0; y <= 4; y++) {
          for (let z = 0; z <= 4; z++) {
            if (x === 0 && y === 0 && z === 0) continue;   /* 三数皆零不成卦 */
            no++;
            if (x === c[0] && y === c[1] && z === c[2]) return no;
          }
        }
      }
    } else {
      for (let x = 0; x <= 12; x++) {
        for (let y = 0; x + y <= 12; y++) {
          no++;
          if (x === c[0] && y === c[1]) return no;
        }
      }
    }
    return no;
  }

  /* 盛衰之等：乙法三数各在 0~4，甲法三数之和恒十二（均数四） */
  function level(v, way) {
    if (v === 0) return '虚';
    if (way === 'classic') {
      if (v === 1) return '微';
      if (v === 2) return '平';
      if (v === 3) return '多';
      return '盛';
    }
    if (v <= 2) return '微';
    if (v <= 4) return '平';
    if (v <= 7) return '多';
    return '盛';
  }

  /* 三位所主与盛衰解读（本站所定之自洽规则，见页面「断法规则」） */
  const WEI_INFO = [
    {
      n: '上', zhu: '天时 · 外势 · 上位之人 · 事之上层',
      lv: {
        虚: { jie: '上数为零，外无可倚。', yi: '自立自决，先定己意', ji: '指望他人先动、张望于外' },
        微: { jie: '外势微弱，宜自修其内。', yi: '修内蓄力、少事张扬', ji: '强求外援、攀附声势' },
        平: { jie: '外势平平，循常理而行即可。', yi: '循常规、按部就班', ji: '刻意经营声势' },
        多: { jie: '事多在上在外，宜向上、向外求之。', yi: '向上求、借外力、往外拓展', ji: '闭门自守、以己意代外势' },
        盛: { jie: '外势方张，事在外而不在己。', yi: '顺外势而动、及时借势', ji: '逆势硬顶、认外势为己有' }
      }
    },
    {
      n: '中', zhu: '人事 · 己身 · 中介 · 事之当体',
      lv: {
        虚: { jie: '中数为零，己身之位虚。', yi: '让贤借力、居中协调', ji: '强出头、独断专行' },
        微: { jie: '己身之力薄。', yi: '少担多让、量力而行', ji: '大包大揽、逞强任事' },
        平: { jie: '事在可为之列。', yi: '守中道、稳步而为', ji: '偏激行事、骤进骤退' },
        多: { jie: '事在己身，宜自任其事。', yi: '亲力亲为、自任其责', ji: '诿过于人、一味依赖' },
        盛: { jie: '一己当之，成败多系于自身。', yi: '正心定志、专一而行', ji: '心志游移、多头并进' }
      }
    },
    {
      n: '下', zhu: '地利 · 根基 · 下属 · 事之后段',
      lv: {
        虚: { jie: '下数为零，根基不牢。', yi: '先固本、缓图上进', ji: '遽求高远、无本而营' },
        微: { jie: '凭借单薄。', yi: '节用蓄力、徐徐图之', ji: '铺张耗费、争先求速' },
        平: { jie: '根基尚可。', yi: '守成渐进、按次推进', ji: '贪多求快、越次而行' },
        多: { jie: '根基厚实、后段有力。', yi: '稳守待时、后发制人', ji: '急于先手、轻弃根本' },
        盛: { jie: '事之重在下，宜向下求之。', yi: '重根基、重落实、重后手', ji: '只顾高远、轻忽细务' }
      }
    }
  ];

  ART({
    id: 'lingqi',
    name: '灵棋经',
    alias: ['灵棋课', '十二棋占'],
    gua: 'gen',
    order: 3,
    tagline: '十二棋子掷之 · 上中下各四子，得数成卦，古占之一（本站以数位结构呈现）',

    intro: `
      <p>《灵棋经》为古占之一，旧本题汉东方朔撰，《四库全书总目》著录为二卷；四库馆臣已疑其出于依托，其书之成与流传当在汉魏六朝之间（作者与成书年代古今有异说，本站不深考）。其法以十二枚棋子掷之，棋子分属上、中、下三位，视其得数成卦，凡一百二十四卦，旧本每卦各有卦辞、象辞与旧注。</p>
      <p>其占理以「上中下」三才为体：上象天时外势、中象人事己身、下象地利根基。十二棋掷落，三数之盈虚多寡，即是事之三位孰强孰弱、孰实孰虚。掷棋近于「听命于数」，与蓍筮的十八变、金钱卦的六掷同属「以数成卦」之一路，而操作最为简捷。</p>
      <p>本站所存者为掷法与三数结构，以及依三数盈虚所定的一套自洽白话解读规则；所不存者为一百二十四卦的原卦名与卦辞——原书卦名与「上中下」三数之对应，本站未能逐一确证，除旧籍传称之名外不敢臆补，故一律以「上X中Y下Z · 第N卦」的数位结构呈现。页面中的序号为<b>本站自定之序</b>（先上、次中、次下），非原书卦次序。</p>`,

    method: `
      <p>填起占时刻与所问（可留空），选择掷法（甲法为本站默认的十二子三面掷法，乙法为与「一百二十四卦」之数相合的两面掷法），按「掷棋成卦」即见：十二枚棋子的落位、上中下三数、本站自定的卦位编号，以及按三数盈虚给出的白话解读。</p>
      <p>掷棋由「起占时刻 + 所问 + 掷法 + 起课之数」合成的可复现种子随机源一次掷出：<b>同一组输入必得同一卦</b>，改时间或改数即另得一卦。</p>`,

    form: [
      { name: 'dt', label: '起占时刻', type: 'datetime-local', value: U.nowStr(), wide: true, hint: '参与合成掷棋的随机种子' },
      { name: 'q', label: '所问之事', type: 'text', placeholder: '如「此事当进当止」，可留空' },
      { name: 'way', label: '掷法', type: 'select', value: 'simple', options: [
        { v: 'simple', t: '甲法 · 十二子各落上中下（本站默认，成 91 种）' },
        { v: 'classic', t: '乙法 · 四子属上中下各四，两面掷（合 124 之数）' }
      ] },
      { name: 'n', label: '起课之数', type: 'number', min: 1, max: 9999, value: 12, hint: '改动此数可另得一卦' }
    ],

    /* ★ 纯函数：只读 input，不碰 DOM */
    cast: function (input) {
      const dt = (input.dt || '').trim();
      if (!dt) return { error: '请填写起占时刻' };
      const q = (input.q || '').trim();
      const way = input.way === 'classic' ? 'classic' : 'simple';
      let n = Number(input.n);
      if (!isFinite(n) || n === 0) n = 12;
      n = Math.abs(Math.floor(n)) || 12;

      const seed = hashStr(dt + '|' + q + '|' + way + '|' + n);
      const res = zhiQi(seed, way);
      const c = res.cnt;
      const total = c[0] + c[1] + c[2];
      if (way === 'classic' && total === 0) return { error: '三数皆零，不成卦，请改起课之数再掷' };

      const no = guaNo(c, way);
      const maxV = Math.max(c[0], c[1], c[2]);
      const minV = Math.min(c[0], c[1], c[2]);
      const mainIdx = c.indexOf(maxV);
      const levels = [level(c[0], way), level(c[1], way), level(c[2], way)];
      const zeros = [];
      c.forEach(function (v, i) { if (v === 0) zeros.push(WEI[i]); });
      const yangCnt = c.filter(function (v) { return v % 2 === 1; }).length;

      const fp = G.fourPillars(U.parseDT(dt));

      return {
        dt: dt, q: q, n: n, seed: seed, way: way,
        pieces: res.pieces, cnt: c, total: total, no: no,
        maxV: maxV, minV: minV, mainIdx: mainIdx, levels: levels,
        zeros: zeros, yangCnt: yangCnt,
        balanced: (zeros.length === 0 && maxV - minV <= 1),
        fpText: fp.year.name + '年 ' + fp.month.name + '月 ' + fp.day.name + '日 ' + fp.hour.name + '时'
      };
    },

    /* ★ 纯函数：返回 HTML 字符串 */
    view: function (d) {
      const c = d.cnt, out = [];
      const wayName = d.way === 'classic' ? '乙法 · 四子属上中下各四，两面掷' : '甲法 · 十二子各落上中下';

      out.push(U.resHead('上' + c[0] + '中' + c[1] + '下' + c[2],
        '灵棋经 · ' + (d.way === 'classic' ? '乙法' : '甲法') + ' · 本站编号第 ' + d.no + ' 卦 · ' + d.dt));

      /* 棋子落位 */
      const chipList = d.pieces.map(function (p) {
        if (d.way === 'classic') {
          return { t: '第' + p.idx + '子 · ' + WEI[p.grp] + (p.hit ? ' · 有识' : ' · 无识'), sel: p.hit };
        }
        return { t: '第' + p.idx + '子 · ' + WEI[p.grp], sel: p.grp === d.mainIdx };
      });
      out.push(U.card('棋子落位（十二枚）', U.chips(chipList) +
        U.note(d.way === 'classic'
          ? '乙法：第 1–4 子属上、第 5–8 子属中、第 9–12 子属下；每子两面，有识面朝上者计入本位（朱色者即计入之子）。三数各在 0~4 之间。'
          : '甲法（本站默认）：十二子各落上、中、下之一位，朱色者为三数中最盛之一位。三数之和恒为十二。')
      ));

      /* 三数分位 */
      const rows = [0, 1, 2].map(function (i) {
        const info = WEI_INFO[i], lv = d.levels[i], e = info.lv[lv];
        return {
          cls: i === d.mainIdx ? 'hi' : '',
          cells: [info.n, c[i], lv, info.zhu, e.jie, e.yi, e.ji]
        };
      });
      out.push(U.card('三数分位', U.table(['位', '得数', '盛衰', '所主', '解读', '宜', '忌'], rows) +
        U.note('「盛衰」之等：乙法 0 虚、1 微、2 平、3 多、4 盛；甲法三数之和恒十二（均数四），故 0 虚、1–2 微、3–4 平、5–7 多、8–12 盛。'))
      );

      /* 卦位 */
      out.push(U.card('卦位', U.kv([
        ['卦位', '上' + c[0] + '中' + c[1] + '下' + c[2]],
        ['本站编号', '第 ' + d.no + ' 卦' + (d.way === 'classic' ? '（一百二十四之序中）' : '（甲法九十一之序中）')],
        ['卦名', '从略 —— 本站未能确证一百二十四卦之卦名目次，故以数位结构呈现（详见下方声明）'],
        ['显现之数', d.way === 'classic' ? ('共 ' + d.total + ' 枚有识面朝上') : '恒为十二'],
        ['卦序之例', '本站自定：先上、次中、次下，依数自小而大（上0中0下1为第1卦，依次而增）'],
        ['掷法', wayName],
        ['起占时刻', U.esc(d.dt) + '　' + U.esc(d.fpText)]
      ])));

      /* 白话断语 */
      const duan = [];
      duan.push('<b>主位</b>：三数以「' + WEI[d.mainIdx] + '」为最盛（' + c[d.mainIdx] + '），事之枢机在' + WEI_INFO[d.mainIdx].zhu + '。');
      [0, 1, 2].forEach(function (i) {
        const e = WEI_INFO[i].lv[d.levels[i]];
        duan.push('<b>' + WEI[i] + ' ' + c[i] + '（' + d.levels[i] + '）</b>：' + e.jie + ' 宜：' + e.yi + '；忌：' + e.ji + '。');
      });
      duan.push('<b>三数参看</b>：' + (d.zeros.length
        ? ('「' + d.zeros.join('、') + '」数为零，此位虚而不实，' + (d.zeros.length > 1 ? '虚位既多，事之可恃者少，宜先补其缺。' : '宜于此位先作经营，勿任其空。'))
        : '三数皆不虚，三位俱有着落。') +
        (d.balanced ? ' 且三数停匀，事体均衡，无独重之偏，宜循常规而行。' : (' 三数相差 ' + (d.maxV - d.minV) + '，事有所偏重，取舍之际宜就重处着力。')));
      duan.push('<b>动静（本站所定之参考规则）</b>：三数之奇偶为阳动阴静，本卦' +
        '上' + c[0] + '（' + (c[0] % 2 ? '阳' : '阴') + '）、中' + c[1] + '（' + (c[1] % 2 ? '阳' : '阴') + '）、下' + c[2] + '（' + (c[2] % 2 ? '阳' : '阴') + '），' +
        (d.yangCnt >= 2 ? '阳数占多，动多于静，事可推行，宜主动而进；' : (d.yangCnt === 1 ? '一阳二阴，动少于静，宜以静制动、伺机而后行；' : '三数皆阴，静而不动，此时宜守，不宜有所作为。')));
      if (d.way === 'classic') {
        duan.push('<b>显隐</b>：' + (d.total >= 9 ? '显现之数多（' + d.total + '），事体显豁，宜于明处着手。'
          : (d.total >= 4 ? '显现之数适中（' + d.total + '），事在半显半隐之间，宜边行边察。'
            : '显现之数少（' + d.total + '），事多隐而未发，宜静候时机。')));
      } else {
        duan.push('<b>显隐</b>：甲法十二子各归一位，总数恒为十二，故不以总数论显隐，只以上中下三数之盈虚为断。');
      }
      out.push(U.card('白话断语', U.ul(duan)));

      /* 规则全录 */
      out.push(U.card('掷法与断法规则（全文）', U.ul([
        '<b>甲法（本站默认）</b>：十二枚棋子掷之，每子落于上、中、下之一位，统计三位各得几枚，三数之和恒为十二；其数位结构共九十一种（x+y+z=12，x,y,z≥0）。',
        '<b>乙法（古法一说）</b>：棋子以四枚为一组，分属上、中、下三位；每子两面（一面作识、一面无识），掷后视有识面朝上者计入本位，三数各在 0~4 之间。除三数皆零（不成卦，须重掷）一况外，其数位结构恰为 124 种，与《灵棋经》所记「一百二十四卦」之数相合——本站据此推之，姑备一说。',
        '<b>三位所主</b>：上主天时、外势、上位之人、事之上层；中主人事、己身、中介、事之当体；下主地利、根基、下属、事之后段。',
        '<b>盛衰之等</b>：乙法 0 虚、1 微、2 平、3 多、4 盛；甲法 0 虚、1–2 微、3–4 平、5–7 多、8–12 盛。',
        '<b>取断之序</b>：先看三数中孰为最盛（主位），主位即事之枢机所在；再逐位看其盛衰，多则事在此位、宜就此着力，虚则此位无凭、宜先补其缺；三数停匀者事体均衡，宜循常规。',
        '<b>动静之参</b>：以三数之奇偶为阳动阴静，阳数占多则宜进取，阳数少则宜静守（本条为本站所定之参考规则，非原书明文）。',
        '<b>卦序</b>：本站自定，先上、次中、次下，依数自小而大；此为本站编号，非《灵棋经》原书卦次序。'
      ])));

      out.push(U.note('本站声明（编号化与从略之处）：① 《灵棋经》原有固定卦名一百二十四，其卦名与「上中下」三数之对应关系，本站未能确证，故<b>卦名一律从略</b>，只以「上X中Y下Z · 第N卦」的数位结构呈现；纵有旧籍通行之名（如「大通」之类），因未确证其对应之位数，亦不敢径题。② 原书卦辞、象辞与旧注本站一概不录，页面所出断语皆为按三数盈虚自撰的白话规则，非原书文字。③ 第N卦之序号为本站自定，非原书次序。', true));

      /* 术语 */
      out.push(U.card('术语小释', U.kv([
        ['灵棋', '掷以成卦的十二枚棋子。旧说以牙、木、竹为之，形制记述不一。'],
        ['上 · 中 · 下', '棋子所属的三种位；亦取三才之义，上象天、中象人、下象地。'],
        ['有识 / 无识', '乙法中棋子两面的分别：作记号者为「有识」，掷后视有识面朝上者计入本位。'],
        ['一百二十四卦', '《灵棋经》所记卦数。本站以乙法「三数各在 0~4、除三数皆零」推之，恰得 124，与所记之数相合。'],
        ['三数', '即上数、中数、下数，本页卦位所示之三个数字。'],
        ['卦位', '本站对「上X中Y下Z」这一结构的称法；原书则以卦名称之。']
      ])));

      out.push(U.note('本站自述：掷棋由可复现种子随机源仿真，非实物掷子；断语为按三数结构自撰的白话规则，属自洽的解读框架而非原书卦辞。同一组「时间 + 所问 + 掷法 + 起课之数」必得同一卦。', true));

      out.push(U.disclaim('掷棋所得，只是把当下的事按下、中、上三层各看一遍；三层看清了，行止之权仍在己手。'));
      return out.join('');
    }
  });
})();
