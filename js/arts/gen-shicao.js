/* ============================================================
   艮 · 蓍草筮（大衍筮法）
   《系辞上传》：大衍之数五十，其用四十有九，分而为二以象两，
   挂一以象三，揲之以四以象四时，归奇于扐以象闰。
   三变成一爻，十有八变而成卦；三变之余策 24/28/32/36 → 6/7/8/9。
   ============================================================ */
(function () {
  'use strict';
  const C = window.CORE, U = C.UI, G = C.GZ;
  const ART = window.ART;      /* 取注册器（浏览器中由 registry.js 提供） */

  /* ---------- 小工具 ---------- */
  /* FNV-1a 32 位散列：把「起占时间 + 所问 + 起课之数」化为可复现的种子 */
  function hashStr(s) {
    let h = 2166136261 >>> 0;
    s = String(s === undefined || s === null ? '' : s);
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    return h >>> 0;
  }

  const POS = ['初', '二', '三', '四', '五', '上'];
  const POS_MEAN = {
    0: '初爻为事之始端，根基初立，宜慎其发端，谋定而后动。',
    1: '二爻居内卦之中，为己身之位，宜守中自处，以柔济刚。',
    2: '三爻为内卦之极、进退之交，宜审势知止，勿过而失据。',
    3: '四爻为外卦之始、渐近尊位，宜谨言慎动，防越位招嫌。',
    4: '五爻居外卦之中，为得中之位，宜正大而行，可得众助。',
    5: '上爻为卦之终末、事之收束，宜知退知返，勿恋栈不舍。'
  };
  const YAO = {
    9: { ming: '老阳', yang: true, dong: true },
    8: { ming: '少阴', yang: false, dong: false },
    7: { ming: '少阳', yang: true, dong: false },
    6: { ming: '老阴', yang: false, dong: true }
  };
  const YAO_NOTE = {
    9: '老阳之性：阳之极，动而将变为阴。所主之事正在显盛，而转折亦已伏于其中。',
    8: '少阴之性：阴之正，静而不变。所主之事宜静守其常，不宜强求更张。',
    7: '少阳之性：阳之正，静而不变。所主之事可循正道而行，稳步渐进为宜。',
    6: '老阴之性：阴之极，动而将变为阳。所主之事方在收抑之中，而转机已伏于其中。'
  };
  /* 爻题古例：阳爻称九、阴爻称六（老少之别不改爻题） */
  function yaoTi(i, yang) { return POS[i] + (yang ? '九' : '六'); }

  /* ---------- 大衍筮法：三变成爻，十八变成卦 ---------- */
  /* 每一变：以四十九（或前变之余）策「分而为二」→「挂一」（自右策取出）
     →左右各「揲之以四」→「归奇于扐」。
     首变去策必五或九；次变、三变去策必四或八。 */
  function daYan(seed) {
    const rnd = C.RNG.seeded(seed);
    const list = [];
    for (let y = 0; y < 6; y++) {
      let stalks = 49;                       // 大衍之数五十，其用四十有九
      const bians = [];
      for (let b = 0; b < 3; b++) {
        const total = stalks;
        const left = rnd.randInt(1, total - 1);
        const right = total - left;
        const rightAfter = right - 1;                       // 挂一自右策取出
        const lRem = left % 4 === 0 ? 4 : left % 4;          // 揲四之余，适尽则以四为奇
        const rRem = rightAfter % 4 === 0 ? 4 : rightAfter % 4;
        const removed = lRem + rRem + 1;                     // 归奇于扐 = 左余 + 右余 + 挂一
        const remain = total - removed;
        bians.push({
          b: b + 1, total: total, left: left, right: right, hung: 1,
          lRem: lRem, rRem: rRem, removed: removed, remain: remain
        });
        stalks = remain;
      }
      const ce = stalks;                     // 24 / 28 / 32 / 36
      const v = ce / 4;                      // 6 / 7 / 8 / 9
      const info = YAO[v];
      list.push({
        pos: y, ti: yaoTi(y, info.yang), bians: bians, ce: ce, v: v,
        ming: info.ming, yang: info.yang, dong: info.dong, qu: 49 - ce
      });
    }
    return list;
  }

  ART({
    id: 'shicao',
    name: '蓍草筮',
    alias: ['大衍筮法', '蓍筮', '揲蓍'],
    gua: 'gen',
    order: 1,
    tagline: '大衍之数五十，其用四十有九 · 十八变而成卦，《系辞》所载最古的筮法',

    intro: `
      <p>蓍草筮即《周易·系辞上传》所载的<b>大衍筮法</b>。《系辞》述其法曰：「大衍之数五十，其用四十有九，分而为二以象两，挂一以象三，揲之以四以象四时，归奇于扐以象闰；五岁再闰，故再扐而后挂。」又曰「四营而成易，十有八变而成卦」，是文献所记最古、也最完整的一套成卦程序。</p>
      <p>古人以龟为卜、以蓍为筮，合称「龟蓍」或「卜筮」。《史记》有《龟策列传》专记龟蓍之事，其中言及蓍草与神龟之瑞应；蓍为多年生草本（今植物学名蓍，俗称锯齿草、一支蒿），古人取其茎挺直匀长而可用以计数。今日实作多以竹签、牙签五十枚代之，其数理不变。</p>
      <p>与大行其道的京房纳甲（金钱卦）相比，蓍筮同为「以数成卦」，但一爻须经三变、全卦须十八变，且只出本卦、变卦与动爻，不装纳甲六亲、不讲世应，断法更近于《左传》《国语》所记先秦筮例的路数——观卦象与动爻之位，参以事理，不作繁复的爻位装卦。</p>`,

    method: `
      <p>填好起占时刻与所问之事（可留空），必要时改动「起课之数」以另得一课，按「起卦」即列<b>十八变细录</b>、六爻策数、本卦与变卦，并附动爻提示与白话断语。</p>
      <p>本站为纯静态页面，「分二」之数由「起占时刻 + 所问 + 起课之数」合成的可复现种子随机源给出：<b>同一组输入必得同一卦</b>（可自行复核），欲另起一课，改时间或改数即可。页面下方另附实体揲蓍的操作步骤，欲以蓍草、竹签实操者可按之行之。</p>`,

    form: [
      { name: 'dt', label: '起占时刻', type: 'datetime-local', value: U.nowStr(), wide: true, hint: '参与合成本课的随机种子' },
      { name: 'q', label: '所问之事', type: 'text', placeholder: '如「此番出行何如」，可留空' },
      { name: 'n', label: '起课之数', type: 'number', min: 1, max: 9999, value: 7, hint: '改动此数可另得一课' }
    ],

    /* ★ 纯函数：只读 input，不碰 DOM */
    cast: function (input) {
      const dt = (input.dt || '').trim();
      if (!dt) return { error: '请填写起占时刻' };
      const q = (input.q || '').trim();
      let n = input.n;
      if (n === '' || n === undefined || n === null || isNaN(Number(n))) n = 7;
      n = Math.abs(Math.floor(Number(n))) || 7;

      const seed = hashStr(dt + '|' + q + '|' + n);
      const yaoList = daYan(seed);
      const lines = yaoList.map(function (o) { return o.yang ? 1 : 0; });
      const dong = [];
      yaoList.forEach(function (o) { if (o.dong) dong.push(o.pos); });

      const ben = C.HEX64[lines.join('')];
      const bian = dong.length ? C.bianGua(lines, dong) : null;

      const fp = G.fourPillars(U.parseDT(dt));
      const fpText = fp.year.name + '年 ' + fp.month.name + '月 ' + fp.day.name + '日 ' + fp.hour.name + '时';

      return {
        dt: dt, q: q, n: n, seed: seed,
        yaoList: yaoList, lines: lines, dong: dong,
        ben: ben, bian: bian, fpText: fpText, jieqi: fp.jieqi
      };
    },

    /* ★ 纯函数：返回 HTML 字符串 */
    view: function (d) {
      const y = d.yaoList, bian = d.bian, out = [];

      out.push(U.resHead(
        '本卦 ' + d.ben.name,
        '蓍草筮 · ' + (d.dong.length ? '动爻 ' + d.dong.length + ' 处' : '六爻皆静') + ' · ' + d.dt
      ));

      /* 卦象 */
      out.push(U.card('本卦 · 变卦', U.twoHex(
        d.ben, bian,
        '本卦 ' + d.ben.name + '（上' + d.ben.upperName + '下' + d.ben.lowerName + '）',
        bian ? '变卦 ' + bian.name + '（上' + bian.upperName + '下' + bian.lowerName + '）' : ''
      ) + U.note('六爻自下而上：初、二、三为内卦（下卦），四、五、上为外卦（上卦）。朱色者为动爻。')));

      /* 六爻 */
      out.push(U.card('六爻', U.yao(d.lines, {
        labels: y.map(function (o) { return o.ti; }),
        dong: d.dong
      }) + U.note('爻题依古例：阳爻称「九」、阴爻称「六」；老阳（九）、老阴（六）为动爻，少阳（七）、少阴（八）为静爻。')));

      /* 十八变细录 */
      const rows = [];
      y.forEach(function (o) {
        o.bians.forEach(function (b, k) {
          rows.push({
            cls: k === 0 ? 'hi' : '',
            cells: [
              k === 0 ? o.ti : '',
              b.b + '变',
              b.left + ' / ' + b.right,
              '一策',
              b.lRem, b.rRem,
              b.lRem + ' + ' + b.rRem + ' + 1 = ' + b.removed,
              b.remain
            ]
          });
        });
      });
      out.push(U.card('十八变细录（三变一爻，六爻十八变）',
        U.table(['爻', '变次', '分二（左 / 右）', '挂一', '左策余', '右策余', '归奇（所去之策）', '余策'], rows) +
        U.note('「归奇」= 左策揲四之余 + 右策揲四之余 + 挂一之一策。首变所去必为五或九，次变、三变所去必为四或八；三变之后余策必为 24、28、32、36 之一。策数适尽则以四为余（归奇必有所归），此为本站所采之通说处理。')
      ));

      /* 六爻策数 */
      out.push(U.card('六爻策数',
        U.table(['爻', '三变所去', '余策（策数）', '以四约之', '老少', '阴阳', '动静'],
          y.map(function (o) {
            return {
              cls: o.dong ? 'hi' : '',
              cells: [o.ti, o.qu, o.ce, o.v, o.ming, o.yang ? '阳' : '阴', o.dong ? '动（变）' : '静']
            };
          })) +
        U.note('36 = 老阳（九）、32 = 少阴（八）、28 = 少阳（七）、24 = 老阴（六）。《系辞》言「乾之策二百一十有六，坤之策百四十有四」，即六爻皆为老阳、六爻皆为老阴之策数（36×6、24×6）。')
      ));

      /* 白话断语 */
      const duan = [];
      duan.push('<b>本卦（事之见在）</b>：' + d.ben.name + ' ——' + U.esc(d.ben.duan));
      if (bian) duan.push('<b>变卦（事之所趋）</b>：' + bian.name + ' ——' + U.esc(bian.duan));
      else duan.push('<b>六爻皆静</b>：无动爻则无变卦，一以本卦之象为断；事无骤变，宜守常循序。');
      duan.push('<b>取断之要</b>：' + (d.dong.length
        ? '有动爻者，先看动爻所处之位与其老少之性，再看由本卦趋变卦之势；动爻多者，重变卦。'
        : '静卦重本卦之全象，宜就卦义所示之宜忌从容取择，不必强索动爻。'));
      duan.push('<b>倾向</b>：' + U.esc(d.ben.duan.split('。')[1] || d.ben.duan) + '（由本卦大意摘出，仅示倾向，非断言。）');
      out.push(U.card('白话断语', U.ul(duan)));

      /* 动爻提示 */
      if (d.dong.length) {
        out.push(U.card('动爻提示（自撰白话，非爻辞原文）', U.ul(d.dong.map(function (i) {
          const o = y[i];
          return '<b>' + o.ti + '（' + o.ming + '）动</b>：' + POS_MEAN[i] + ' ' + YAO_NOTE[o.v];
        })) + U.note('本站不录《周易》爻辞、卦辞原文，此处只按爻位（初至上的六位之义）与老少（动静之性）作白话提示。')));
      } else {
        out.push(U.card('动爻提示', U.note('六爻皆为七、八，谓之静卦：无动爻可指，宜就本卦全象与卦义参看，不必强指一爻。')));
      }

      /* 参断提要 */
      out.push(U.card('参断提要', U.kv([
        ['贞（本卦）', '本卦 ' + d.ben.name + '，卦序第 ' + d.ben.no + ' 卦'],
        ['变卦', bian ? '变卦 ' + bian.name + '，卦序第 ' + bian.no + ' 卦' : '无（六爻皆静）'],
        ['动爻', d.dong.length ? d.dong.map(function (i) { return y[i].ti; }).join('、') : '无'],
        ['起占时刻', U.esc(d.dt) + '　' + U.esc(d.fpText) + '（节气：' + U.esc(d.jieqi) + '）'],
        ['起课之数', String(d.n)]
      ])));

      /* 实体操作 */
      out.push(U.card('实体操作（欲以蓍草或竹签实操者按此）', U.ul([
        '取蓍五十策（今人多以竹签、牙签代之），先取一策置而不用，只用四十九策。',
        '第一变：任意分为两堆（分二），自右堆取一策夹于左手小指间（挂一）；左右两堆各以四为单位数之（揲四），所余之策（若适尽则作四）与挂一之策一并置于案上（归奇于扐）。',
        '第二变、第三变：将案上未去之策合而为一，重做分二、挂一、揲四、归奇。如是三变，看最后所余之策。',
        '以四约三变之余策：三十六为老阳、三十二为少阴、二十八为少阳、二十四为老阴，得一爻。',
        '合六爻（自下而上：初、二、三、四、五、上）成本卦；老阳、老阴为动爻，动则爻变，变而得变卦。'
      ])));

      /* 术语 */
      out.push(U.card('术语小释', U.kv([
        ['大衍之数', '《系辞》「大衍之数五十，其用四十有九」。以五十为体，虚一不用，实用四十九策起课。'],
        ['分二 · 挂一 · 揲四 · 归奇', '分四十九策为两堆以象两仪；自右策取一策挂于指间以象三才；两堆各以四为单位数之以象四时；所余之策与挂一之策合而置之，以象闰月。'],
        ['扐（lè）', '手指之间。「归奇于扐」即把余策夹在指间，故三变所去之数亦称「挂扐之数」。'],
        ['三变 · 十八变', '三变而成一爻，六爻共十八变，故曰「十有八变而成卦」。'],
        ['老阳 · 少阳 · 少阴 · 老阴', '九为老阳、七为少阳、八为少阴、六为老阴。老则变、少则不变，故老阳老阴为动爻。'],
        ['贞 · 悔', '《左传》筮例中「贞」多指内卦或本卦、「悔」多指外卦或变卦；古今解说略有出入，此处取其通行之义。']
      ])));

      out.push(U.note('《系辞》既言「大衍之数五十」，又言「天地之数五十有五」，二者相差之由，古今解说纷纭（虚一、虚五、除六等说），本站不涉此辨，仅以四十九策起课。'));

      out.push(U.note('本站自述：十八变之「分二」由可复现种子随机源取数，为程序仿真而非实揲蓍草；卦义白话语出本站内置参考语，非古籍原文；动爻提示为按爻位、老少自撰，不冒充爻辞。', true));

      out.push(U.card('合参之法（六爻动变之取断通例，本站参用）', U.ul([
        '一爻动：以本卦此动爻之位为主，参变卦相应之义。',
        '二爻动：以两动爻相较，居上者为主，居下者为辅。',
        '三爻动：本卦、变卦参半，重卦义而不重一爻。',
        '四爻及以上动：以变卦为主，本卦为宾。',
        '六爻皆静：一以本卦为断；六爻皆动（全为老阳老阴）：多以变卦为断。'
      ]) + U.note('此为通行取断之例，属参考性框架，非《周易》原文之规定。')));

      out.push(U.disclaim('蓍筮所求，不过是把纷繁之事换个角度理一遍；卦象示倾向，取舍仍在人。'));
      return out.join('');
    }
  });
})();
