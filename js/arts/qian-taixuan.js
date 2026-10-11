/* ============================================================
   太玄数（乾 · 天，order 4）
   西汉扬雄《太玄》拟易之作：一玄三方，一方三州，一州三部，一部三家，
   凡八十一首；首各九赞。首名只列本站能确证者，余以「第 N 首」占位。
   ============================================================ */
(function () {
  'use strict';
  const C = window.CORE, U = C.UI, G = C.GZ;

  /* ---------- 八十一首首名 ----------
     本站只确证「方一」二十七首之次序（中为一玄之始，即一方一州一部一家；
     其下依方→州→部→家之序填满），其余各首之名与异体字诸本多异，
     故一律以「第 N 首」占位，不作臆造。 */
  const SHOU_NAMES = ('中 周 礥 闲 少 戾 上 干 羡 ' +
    '差 童 增 锐 达 交 䎩 徯 从 ' +
    '进 释 格 夷 乐 争 务 事 更').split(' ');
  /* 通行本中另见之常用首名（各本次序与异体字有别，不系其序号）： */
  const SHOU_KNOWN_LATER = ['断', '毅', '装', '众', '密', '亲', '敛', '彊', '睟',
    '盛', '居', '法', '应', '迎', '遇', '灶', '大', '廓',
    '文', '礼', '逃', '唐', '常', '度', '永', '昆', '减',
    '唫', '守', '翕', '聚', '积', '饰', '疑', '视', '沈',
    '内', '去', '晦', '瞢', '穷', '割', '止', '坚', '成',
    '失', '剧', '驯', '将', '难', '勤', '养'];

  /* 九赞之名（太玄以「初、次、上」变易之「九」） */
  const ZAN = ['初一', '次二', '次三', '次四', '次五', '次六', '次七', '次八', '上九'];
  /* 九赞白话（本站参考语，非《太玄》原文） */
  const ZAN_JUE = [
    '事之始也，谋议未定、形象未成。宜审几察微、先立其志；忌躁动妄发。',
    '事渐有形，端绪初开。宜积渐用力、循次而进；忌躐等求速。',
    '在二三之间，进退未决。宜详审利害、择一而守；忌首鼠两端。',
    '入于中程，枢机所在。宜守中持正、调停内外；忌偏执一端。',
    '居中得位，事之最盛处。宜乘时而动、明布其令；忌恃盛而骄。',
    '中程之末，功过半而力或倦。宜振作续进、补其阙漏；忌半途而废。',
    '事将成而尚有阻。宜防微杜渐、善处其终；忌见利忘患。',
    '事已近成，收拾之候。宜收束归整、藏其锋芒；忌张扬铺陈。',
    '数之极也，物极则反。宜知止知足、留有余地；忌亢满自恃。'
  ];

  /* 《太玄·玄数》五行之数（通行所引：一六为水、二七为火、三八为木、四九为金、五为土） */
  const SHU_WX = { 0: '土', 1: '水', 2: '火', 3: '木', 4: '金', 5: '土', 6: '水', 7: '火', 8: '木', 9: '金' };
  const WX_YI = { 水: '谋虑、藏用、深计', 火: '明辨、宣示、察物', 木: '生发、谋始、树艺', 金: '决断、整肃、正名', 土: '守成、蓄聚、安处' };
  const FANG_TEXT = {
    1: '方一为初分，象事之发端，宜谋始定计。',
    2: '方二为中分，象事之经营，宜循次用力。',
    3: '方三为末分，象事之收成，宜善处其终。'
  };
  const ZHOU_TEXT = { 1: '州一居其方之初，势尚含蓄。', 2: '州二居其方之中，势得其中。', 3: '州三居其方之末，势近于极。' };
  const FANG_SHORT = { 1: '初分', 2: '中分', 3: '末分' };

  /* ---------- 小工具 ---------- */
  function parseDT(s) {
    const m = String(s === undefined || s === null ? '' : s)
      .match(/^\s*(\d{4})-(\d{1,2})-(\d{1,2})(?:[T ](\d{1,2}):(\d{1,2}))?/);
    if (!m) return null;
    const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), Number(m[4] || 0), Number(m[5] || 0));
    return isNaN(d.getTime()) ? null : d;
  }
  function jiaOf(n) { return ((n - 1) % 3) + 1; }
  function buOf(n) { return (Math.floor((n - 1) / 3) % 3) + 1; }
  function zhouOf(n) { return (Math.floor((n - 1) / 9) % 3) + 1; }
  function fangOf(n) { return (Math.floor((n - 1) / 27) % 3) + 1; }
  function nameOf(n) { return SHOU_NAMES[n - 1] || ''; }
  function labelOf(n) { return nameOf(n) ? nameOf(n) : '第 ' + n + ' 首'; }
  function wxOfNum(v) {
    const s = String(Math.abs(Number(v) || 0));
    return SHU_WX[Number(s.charAt(s.length - 1))] || '土';
  }

  /* ---------- 古法蓍起（仿真《太玄·玄数》揲蓍） ----------
     三十六策，虚三不用（地虚三以扮天十八），挂一于小指，中分其余，
     以三搜之，并余于扐；一扐之后数其余：三七为七（→一）、三八为八（→二）、
     三九为九（→三）——即见存正策写作 3×k＋6，k 即七/八/九（胡煦「七八九皆
     除去两个三」之注）；二揲而一位成，八扐而四位成（家→部→州→方），得首；
     同法再演四位之余以定赞（初一至上九以三商之：余一居初四七，余二居二五八，
     余三居三六九，再以挂扐之奇偶分上中下——此处取注家通行之简法：三数定段、
     段内以再搜之余定序）。分揲之「随手分」由可复现种子随机源给出：
     同一「起占时刻＋所问」必得同一首赞。 */
  function splitStalks(rnd, total) {
    /* 随手中分：左 0..total，模拟人手之不齐 */
    const L = Math.floor(rnd.rand() * (total + 1));
    return { L: L, R: total - L };
  }
  function searchThree(n) {
    /* 以三搜之：数至三而置；返回所用（耗）与所余 */
    const rem = n % 3;
    const used = rem === 0 ? 3 : rem;   /* 整除者最后一组亦用三 */
    return { used: used, rem: rem };
  }
  function oneDraw(rnd) {
    /* 一次「二揲」定一位：36 策虚 3 挂 1（实用 33），随手中分，左右各三搜，
       复合见存之策不挂再分再搜；两揲毕，见存正策必为 21/24/27（与王涯
       「三者得三十策…六者得二十七策」、胡煦「所余之数非七则八非八则九」合）：
       三三数之，21→七→一、24→八→二、27→九→三（「七八九皆除去两个三」）。 */
    let stalks = 32;                                       /* 33 策挂 1 之后 */
    const s1 = splitStalks(rnd, stalks);
    const l1 = searchThree(s1.L), r1 = searchThree(s1.R);
    const after1 = (s1.L - l1.used) + (s1.R - r1.used);    /* 初揲见存：27 或 30 */
    const s2 = splitStalks(rnd, after1);
    const l2 = searchThree(s2.L), r2 = searchThree(s2.R);
    const after2 = (s2.L - l2.used) + (s2.R - r2.used);    /* 再揲见存：21/24/27 */
    const k = after2 / 3;                                   /* 7 / 8 / 9 */
    if (k === 7) return 1;
    if (k === 8) return 2;
    if (k === 9) return 3;
    return 3;                                               /* 兜底，正常不可达 */
  }
  function taiXuanShi(rnd) {
    /* 八扐而四位成：家→部→州→方（自下而上，据东华大学《太玄》筮法考） */
    const jia = oneDraw(rnd), bu = oneDraw(rnd), zhou = oneDraw(rnd), fang = oneDraw(rnd);
    const shou = (fang - 1) * 27 + (zhou - 1) * 9 + (bu - 1) * 3 + jia;
    /* 赞位：《太玄》九赞分三段（初一至次三 / 次四至次六 / 次七至上九），
       「夜则测阴，昼则测阳」相参而三之。以再演两位之余定段与段内之序：
       段 = oneDraw（1/2/3，得 上/中/下 玄），序 = oneDraw（1/2/3）。
       为免「二」之偏（见存 24 之途最广），段与序各以两次独立之揲合并定之：
       seg = 两次之和（2..6 归 1..3），pos 同理，使三段三序皆可达且较匀。 */
    const s1 = oneDraw(rnd), s2 = oneDraw(rnd), p1 = oneDraw(rnd), p2 = oneDraw(rnd);
    const segRaw = s1 + s2, posRaw = p1 + p2;               /* 2..6 */
    const seg = segRaw <= 3 ? 1 : (segRaw >= 5 ? 3 : 2);    /* 2→1 3/4→2 5/6→3 */
    const pos = posRaw <= 3 ? 1 : (posRaw >= 5 ? 3 : 2);
    const zan = (seg - 1) * 3 + pos;
    return { shou: shou, zan: zan, jia: jia, bu: bu, zhou: zhou, fang: fang, seg: seg, pos: pos };
  }
  function fnv1a(s, seed) {
    let h = (seed >>> 0) || 2166136261;
    for (let i = 0; i < s.length; i++) {
      h = (h ^ (s.charCodeAt(i) & 0xffff)) >>> 0;
      h = Math.imul(h, 16777619) >>> 0;
    }
    return h >>> 0;
  }

  window.ART({
    id: 'taixuan',
    name: '太玄数',
    alias: ['太玄', '太玄经', '扬子太玄'],
    gua: 'qian',
    order: 4,
    tagline: '扬雄拟易 · 三方九州八十一首，以「首」代卦、以「赞」代爻。',

    intro: `
      <p>《太玄》为西汉扬雄（子云）拟《周易》而作。其书以「玄」为天地人三才之本，以一玄分三方，一方分三州，一州分三部，一部分三家；四重相乘，得八十一首，以拟六十四卦。首各有九赞，自初一以至上九，以拟一卦之六爻而益其三，凡七百二十九赞。</p>
      <p>其法与《易》异而同旨：易以阴阳二画错而为六十四卦，玄以方州部家四重之数积而为八十一首；易之爻有六，玄之赞有九；易有《序卦》《杂卦》，玄有《玄冲》《玄错》；易有《象》《彖》，玄有《玄测》。故读玄者，当以读易之心读之，取其象数与义理，而不必强合其数。</p>
      <p>历代注家，晋有范望，宋有司马光《太玄集注》，皆以《太玄》为拟经之作而疏通其义。本站所起之「首」与「赞」，取方州部家之四重结构为骨，断语则为白话之引申，非原书文字；八十一首之名，亦只列可确证者，其余以「第 N 首」占位，不敢妄补。</p>`,

    method: `
      <p>本页有三种起法：一曰以蓍起（古法复原），二曰以时间起，三曰以数字起。起者得「首」，再于首中定「赞」位，合首与赞以观其象。</p>
      <p><strong>以蓍起（依《太玄·玄数》复原，默认）</strong>：三十六策，虚三不用，挂一于小指，中分其余，以三搜之，并余于扐；一扐之后数其余，三七为七（一）、三八为八（二）、三九为九（三）——胡煦所谓「七八九皆除去两个三」也；二揲而一位成，八扐而四位成，自下而上定家、部、州、方，得首；赞位以同法之余三商定段、段内定序（初一至上九）。分揲之「随手分」由「起占时刻＋所问」合成之可复现种子随机源给出，同一输入必得同一首赞。</p>
      <p><strong>以时间起（本站约定，属简化演示）</strong>：取所填时刻之四柱，以年、月、日、时四干支之序号相加为「玄数」，首＝（玄数 mod 81）＋1；赞＝（时干支序 mod 9）＋1。</p>
      <p><strong>以数字起（本站约定，属简化演示）</strong>：任报一至三个数字（不足三数则重复末数补足，如报 7 21，作 7、21、21），首＝（三数之和－1 mod 81）＋1；赞＝（末数－1 mod 9）＋1。所报之数另依《玄数》五行之数（一六水、二七火、三八木、四九金、五土）归其五行，附于断语。</p>
      <p><strong>首与方州部家之换算（本站约定）</strong>：家＝((N−1) mod 3)＋1，部＝(⌊(N−1)/3⌋ mod 3)＋1，州＝(⌊(N−1)/9⌋ mod 3)＋1，方＝(⌊(N−1)/27⌋ mod 3)＋1。故首一「中」即一方一州一部一家，首八十一即三方三州三部三家；方州部家四重由粗及细，家最近于事。</p>`,

    form: [
      { name: 'way', label: '起首方式', type: 'chips', options: [{ v: 'shi', t: '以蓍起（古法）' }, { v: 'time', t: '以时间起' }, { v: 'num', t: '以数字起' }], value: 'shi' },
      { name: 'dt', label: '起占时刻', type: 'datetime-local', value: U.nowStr(), wide: true, hint: '蓍起以「时刻＋所问」合种子，可复现；时间起用此刻四柱；数字起可不填' },
      { name: 'nums', label: '所报之数', type: 'text', placeholder: '如 7 21 3', hint: '一至三个数；不足三数则重复末数补足', wide: true },
      { name: 'q', label: '所问（可选）', type: 'text', placeholder: '如：此事当作何打算', wide: true }
    ],

    cast(input) {
      const way = input.way === 'num' ? 'num' : (input.way === 'time' ? 'time' : 'shi');
      const q = String(input.q === undefined || input.q === null ? '' : input.q).trim();
      let shou, zan, basis, nums = null, shuWx = [], xuanShu = 0, pillars = null, shiTrace = null;

      if (way === 'num') {
        const raw = String(input.nums === undefined || input.nums === null ? '' : input.nums).match(/\d+/g);
        if (!raw || !raw.length) return { error: '请报出至少一个数字（如 7 或 7 21 3）' };
        nums = raw.slice(0, 3).map(n => Number(n));
        while (nums.length < 3) nums.push(nums[nums.length - 1]);
        xuanShu = nums[0] + nums[1] + nums[2];
        shou = ((xuanShu - 1) % 81 + 81) % 81 + 1;
        zan = ((nums[2] - 1) % 9 + 9) % 9 + 1;
        shuWx = nums.map(n => wxOfNum(n));
        basis = '所报 ' + nums.join('、') + '，三数相合为 ' + xuanShu;
      } else if (way === 'time') {
        const d = parseDT(input.dt);
        if (!d) return { error: '起首时刻格式有误，请用「2024-05-01T13:00」之式' };
        pillars = G.fourPillars(d);
        xuanShu = pillars.year.idx + pillars.month.idx + pillars.day.idx + pillars.hour.idx;
        shou = (xuanShu % 81) + 1;
        zan = (pillars.hour.idx % 9) + 1;
        basis = '四柱 ' + pillars.year.name + '年 ' + pillars.month.name + '月 ' + pillars.day.name + '日 ' + pillars.hour.name + '时，干支序相合为 ' + xuanShu;
        shuWx = [pillars.year.idx, pillars.month.idx, pillars.day.idx].map(n => wxOfNum(n));
      } else {
        /* 以蓍起（古法复原）：种子＝FNV-1a(起占时刻|所问)，可复现 */
        const dtStr = String(input.dt || '').trim() || U.nowStr();
        const seed = fnv1a(dtStr + '|' + q);
        const rnd = C.RNG.seeded(seed);
        const r = taiXuanShi(rnd);
        shou = ((r.shou - 1) % 81 + 81) % 81 + 1;
        zan = ((r.zan - 1) % 9 + 9) % 9 + 1;
        shiTrace = r;
        xuanShu = r.jia + r.bu + r.zhou + r.fang;
        basis = '三十六策虚三挂一，八扐四位：家' + r.jia + '、部' + r.bu + '、州' + r.zhou + '、方' + r.fang +
          '（四揆得第 ' + shou + ' 首），赞以余定（段' + r.seg + '·序' + r.pos + '）';
        shuWx = [r.fang, r.zhou, r.bu].map(n => wxOfNum(n));
      }

      const fang = fangOf(shou), zhou = zhouOf(shou), bu = buOf(shou), jia = jiaOf(shou);
      const nm = nameOf(shou);
      const zanName = ZAN[zan - 1];
      const yangWei = zan % 2 === 1;

      const jue = [];
      jue.push('当值' + (nm ? '「' + nm + '」首' : '第 ' + shou + ' 首（本站未列其名，只据方州部家与赞位论之）') + '，居第 ' + fang + ' 方、第 ' + zhou + ' 州、第 ' + bu + ' 部、第 ' + jia + ' 家。');
      jue.push('方者，大势之域；州者，一方之分；部者，一州之别；家者，一事之细。四重由粗及细，家为至细之位，最近于事，故所占之应，以家为切。');
      jue.push(FANG_TEXT[fang] + ZHOU_TEXT[zhou]);
      jue.push('当值「' + zanName + '」，居' + (yangWei ? '阳位（奇数之赞）' : '阴位（偶数之赞）') + '：' + ZAN_JUE[zan - 1]);
      if (way === 'num') {
        const uniq = shuWx.filter((w, i) => shuWx.indexOf(w) === i);
        jue.push('所报之数归' + uniq.join('、') + '；' + uniq.map(w => w + '则宜' + (WX_YI[w] || '守常') + '之事').join('，') + '。');
      } else {
        jue.push('以年、月、日三柱之数归五行言之：' + shuWx.map((w, i) => ['年', '月', '日'][i] + '属' + w + '（宜' + (WX_YI[w] || '守常') + '）').join('，') + '。');
      }
      jue.push('合而观之：事在' + FANG_SHORT[fang] + '之地，而当「' + zanName + '」之位，宜循其次第而行，先立其本、后图其功；此为首赞相应之常理，非必然之数。');

      return {
        head: (nm ? nm : '第 ' + shou + ' 首') + ' · ' + zanName,
        sub: '太玄数 · ' + (way === 'shi' ? '以蓍起（古法复原）' : way === 'num' ? '以数起首' : '以时起首'),
        q: q, way: way, shou: shou, shouName: nm, zan: zan, zanName: zanName, yangWei: yangWei,
        fang: fang, zhou: zhou, bu: bu, jia: jia,
        basis: basis, xuanShu: xuanShu, nums: nums, shuWx: shuWx, pillars: pillars, shiTrace: shiTrace,
        jue: jue
      };
    },

    view(d) {
      let out = U.resHead(d.head, d.sub);
      if (d.q) out += U.note('所问：' + U.esc(d.q));

      /* 当值之首与赞 */
      const zanChips = ZAN.map((t, i) => ({ t: t, sel: i === d.zan - 1 }));
      out += U.sec('当值之首与赞',
        U.card('首 · ' + (d.shouName ? d.shouName : '第 ' + d.shou + ' 首'),
          U.kv([
            ['首次', '第 ' + d.shou + ' 首（共八十一首）'],
            ['方州部家', '第 ' + d.fang + ' 方 · 第 ' + d.zhou + ' 州 · 第 ' + d.bu + ' 部 · 第 ' + d.jia + ' 家'],
            ['起首之由', U.esc(d.basis)],
            ['当值之赞', d.zanName + '（第 ' + d.zan + ' 赞，' + (d.yangWei ? '阳位' : '阴位') + '）']
          ])) +
        U.card('九赞之位', U.chips(zanChips) +
          U.note('当值之赞：' + d.zanName + '——' + ZAN_JUE[d.zan - 1])) +
        U.note('起首之法：以蓍起者，依《太玄·玄数》复原（三十六策虚三挂一、三搜取余、三七为七三八为八三九为九、二揲一位八扐四位），「随手分」由种子随机源仿真，同一「时刻＋所问」必得同首；以时间起者，取年月日时四干支序之和为玄数，首＝（玄数 mod 81）＋1，赞＝（时干支序 mod 9）＋1；以数字起者，取三数之和为玄数，首＝（三数和－1 mod 81）＋1，赞＝（末数－1 mod 9）＋1。时间起与数字起皆古无此定法，为一可算之约定，非《太玄》原式；蓍起之赞位取段×序之简法，注家于赞位定法本有异说。', true) +
        U.note('九赞之名依《太玄》「初一、次二、次三、次四、次五、次六、次七、次八、上九」之序；赞位之白话（初一为事之始、上九为数之极）为本站参考语，非原书文字。') +
        U.note('以时间起者，四干支之序数（0 至 59）取其末位，依《玄数》「一六水、二七火、三八木、四九金、五土」之配归其五行，亦本站借以立说之简化约定，非古法。'));

      /* 白话语 */
      out += U.sec('白话断语',
        U.card('首赞之象', U.ul(d.jue)) +
        U.note('以上为本站依首、赞、方州部家之结构所作之参考白话（非《太玄》原文），以「宜／忌／倾向」言之，不下断言。'));

      /* 三方八十一首之结构 */
      const rows = [];
      for (let j = 1; j <= 9; j++) {
        const bu = Math.floor((j - 1) / 3) + 1, jia = (j - 1) % 3 + 1;
        const cells = ['第' + bu + '部 第' + jia + '家'];
        for (let z = 1; z <= 3; z++) {
          const n = (z - 1) * 9 + j;
          cells.push(labelOf(n) + '<span class="hint">（' + n + '）</span>');
        }
        rows.push({ cells: cells, left: [0] });
      }
      out += U.sec('三方八十一首之结构',
        U.card('方一 · 二十七首（本站确证之序）',
          U.table(['部家', '州一', '州二', '州三'], rows, { align: ['l', 'l', 'l', 'l'] })) +
        U.card('四重之数', U.kv([
          ['一玄', '含三方，一方二十七首'],
          ['方', '一方三州，各九首'],
          ['州', '一州三部，各三首'],
          ['部', '一部三家，各一首'],
          ['总', '3 × 3 × 3 × 3 = 81 首，首各九赞，凡七百二十九赞']
        ]) +
        U.note('换算之约定（本站）：家＝((N−1) mod 3)＋1，部＝(⌊(N−1)/3⌋ mod 3)＋1，州＝(⌊(N−1)/9⌋ mod 3)＋1，方＝(⌊(N−1)/27⌋ mod 3)＋1。以此式核之，首一「中」即一方一州一部一家，末首即三方三州三部三家，与《太玄》本书之自题相合。')) +
        U.note('首名说明：本站只确证「方一」二十七首之次序（中、周、礥、闲、少、戾、上、干、羡；差、童、增、锐、达、交、䎩、徯、从；进、释、格、夷、乐、争、务、事、更），故上表只列此二十七名，方二、方三诸首一律以「第 N 首」占位，不作臆造。通行本中另见之常用首名（如断、毅、装、众、密、亲、敛、彊、睟、盛、居、法、应、迎、遇、灶、大、廓、文、礼、逃、唐、常、度、永、昆、减、唫、守、翕、聚、积、饰、疑、视、沈、内、去、晦、瞢、穷、割、止、坚、成、失、剧、驯、将、难、勤、养等），因各本次序与异体字互有出入，本站不系其序号。', true));

      /* 术语 */
      out += U.sec('术语小释',
        U.card('太玄术语', U.kv([
          ['首 / 赞', '《太玄》以「首」拟卦、以「赞」拟爻，八十一首各九赞，赞名自初一至上九。'],
          ['方州部家', '一玄三方，一方三州，一州三部，一部三家，四重相乘得八十一首；四重由粗及细，家最近于事。'],
          ['玄数', '《太玄·玄数》所载五行之数：一六为水、二七为火、三八为木、四九为金、五为土；本站借以论所报之数。'],
          ['九天', '通行有中天、羡天、从天、更天、睟天、廓天、减天、沈天、成天之说，以九首为一天；其分组次序各本略有出入，本站不据以推算。'],
          ['七百二十九赞', '八十一首各九赞，凡七百二十九赞；通行之说以二赞当一日，凡三百六十四日半，约合岁实。']
        ])));

      out += U.disclaim('本页首名只列可确证者，起首之法为本站约定（简化演示），断语为白话引申，非《太玄》原文。');
      return out;
    }
  });
})();
