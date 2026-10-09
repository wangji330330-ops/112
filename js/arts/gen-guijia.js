/* ============================================================
   艮 · 龟甲卜（甲骨卜）
   灼龟观兆：钻、凿、灼而后坼，视其裂痕（兆）以问吉凶。
   cast 只生成纯数据（裂纹几何参数 + 兆形判定 + 拟卜辞），
   mount 只按数据绘制，不在 mount 内重新随机。
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
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }

  /* ---------- 卜问事类（拟辞用） ---------- */
  const LEI = {
    xun: { t: '旬夕（未来十日）', ming: '旬亡（无）祸？', zhu: '问未来一旬之内有无灾祸' },
    yu: { t: '风雨', ming: '今日其雨？', zhu: '问风雨之来与时候' },
    nian: { t: '年成', ming: '今岁其有年？', zhu: '问岁收之丰歉' },
    xing: { t: '行止', ming: '其行，不其行？', zhu: '问出行与否、行止之宜' },
    ji: { t: '祭祀', ming: '其燎于某，受年？', zhu: '问祭祀之可否与所祈' },
    tian: { t: '田渔', ming: '其田，获？', zhu: '问田猎渔获之多少' }
  };

  /* ---------- 兆形：只取可确证之古兆名，余以形态描述 ---------- */
  const ZHAO = {
    yangKai: {
      ming: '首仰足开', gu: '古兆名（学界所称引）', luck: '吉之属',
      jie: '兆体舒展：兆干上仰，足枝外张。古以首仰足开为吉兆之属，事象外显、路径通达，宜乘时进取；惟张而易散，须防铺张而无所收。'
    },
    yangHan: {
      ming: '首仰足肣', gu: '古兆名（学界所称引）', luck: '小吉而末收',
      jie: '首仰而足敛：启端有路，末后收束。宜先动而后守——前期可为，中段以后以收敛、留余地为要，忌一路猛进不知止。'
    },
    fuKai: {
      ming: '首俯足开', gu: '形态描述（本站未用古兆名）', luck: '平而宜缓',
      jie: '首垂而足张：外散内虚之象。事有其表而其中未实，宜缓行、宜先察实情，勿为声势所动，亦勿以虚名自许。'
    },
    fuHan: {
      ming: '首俯足肣', gu: '形态描述（本站未用古兆名）', luck: '宜静守',
      jie: '首足俱敛，兆体收束：事机未启之象。宜静守待时、蓄力而后动；此时强求，多劳而少功。'
    }
  };

  /* ---------- 兆纹几何（纯数据，全部由种子随机源生成） ---------- */
  function genCrack(rnd) {
    const W = 340, H = 430;
    const cx = W / 2, cy = H / 2;

    /* 骨面轮廓（腹甲示意） */
    const shell = [];
    const N = 30;
    for (let i = 0; i < N; i++) {
      const t = i / N * Math.PI * 2;
      const rx = 138 + Math.sin(t * 3) * 4 + rnd.randInt(-2, 2);
      const ry = 196 + Math.cos(t * 2) * 6 + rnd.randInt(-2, 2);
      shell.push({ x: cx + Math.cos(t) * rx, y: cy + Math.sin(t) * ry });
    }

    /* 骨面浅纹理 */
    const grain = [];
    for (let i = 0; i < 16; i++) {
      const y0 = 40 + rnd.randInt(0, H - 80);
      const x0 = 60 + rnd.randInt(0, 90);
      grain.push({ x1: x0, y1: y0, x2: x0 + rnd.randInt(40, 120), y2: y0 + rnd.randInt(-6, 6) });
    }

    /* 灼位：偏左 / 居中 / 偏右 */
    const side = rnd.randInt(-1, 1);
    const sideName = side < 0 ? '偏左' : (side > 0 ? '偏右' : '居中');

    /* 兆之根：灼点 */
    const bx = cx + side * 42 + rnd.randInt(-10, 10);
    const by = cy + rnd.randInt(34, 62);

    const shouUp = rnd.rand() < 0.6;      /* 首仰 / 首俯 */
    const zuOpen = rnd.rand() < 0.55;     /* 足开 / 足肣 */
    const curve = rnd.randInt(-30, 30);   /* 兆干弯度（正负为左右） */
    const len = rnd.randInt(132, 186);    /* 兆干长度 */
    const tips = rnd.randInt(2, 3);       /* 兆枝（足）之数 */

    /* 兆干：自灼点向上 */
    const steps = 10, stem = [];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const bend = curve * Math.sin(t * Math.PI) * 0.9;
      const tipShift = (shouUp ? 12 : -9) * t * t;
      stem.push({
        x: bx + bend + tipShift + rnd.randInt(-1, 1),
        y: by - len * t + rnd.randInt(-1, 1)
      });
    }

    /* 兆枝与细枝 */
    const branches = [], hair = [];
    const at = [0.16, 0.42, 0.66];
    const geoBranchAngle = [], geoBranchLen = [], geoBranchSide = [], geoBranchAt = [];
    for (let k = 0; k < tips; k++) {
      const base = stem[Math.round(at[k] * steps)];
      const s = k % 2 === 0 ? -1 : 1;
      const blen = zuOpen ? rnd.randInt(54, 88) : rnd.randInt(24, 42);
      const a0 = zuOpen ? 0.62 : -0.46;
      const a1 = zuOpen ? a0 + 0.30 : a0 - 0.34;
      const p1 = { x: base.x + s * Math.cos(a0) * blen * 0.6, y: base.y - Math.sin(a0) * blen * 0.6 };
      const p2 = { x: p1.x + s * Math.cos(a1) * blen * 0.45, y: p1.y - Math.sin(a1) * blen * 0.45 };
      branches.push({ pts: [{ x: base.x, y: base.y }, p1, p2], w: 1.8 });
      geoBranchAt.push(at[k]); geoBranchSide.push(s);
      geoBranchAngle.push([Number(a0.toFixed(3)), Number(a1.toFixed(3))]);
      geoBranchLen.push([Number((blen * 0.6).toFixed(1)), Number((blen * 0.45).toFixed(1))]);
      if (rnd.rand() < 0.55) {
        hair.push({ pts: [p1, { x: p1.x + s * rnd.randInt(12, 22), y: p1.y + rnd.randInt(-9, 9) }], w: 1 });
      }
    }

    /* 首之分叉：象「卜」字之一纵一横 */
    const top = stem[stem.length - 1];
    const fk = rnd.randInt(18, 32);
    const fork = [
      { pts: [{ x: top.x, y: top.y }, { x: top.x - fk, y: top.y + (shouUp ? -fk * 0.5 : fk * 0.3) }], w: 1.5 },
      { pts: [{ x: top.x, y: top.y }, { x: top.x + fk * 0.8, y: top.y + (shouUp ? -fk * 0.42 : fk * 0.26) }], w: 1.5 }
    ];
    fork.forEach(function (b) { branches.push(b); });

    /* 钻凿：钻（圆）与凿（长槽）施于骨之背面 */
    const chisel = [
      { kind: '钻', x: bx + rnd.randInt(-4, 4), y: by + rnd.randInt(8, 14), rx: rnd.randInt(11, 15), ry: rnd.randInt(9, 12), rot: 0 },
      { kind: '凿', x: bx + rnd.randInt(-16, 16), y: by + rnd.randInt(34, 46), rx: 6, ry: rnd.randInt(16, 22), rot: rnd.randInt(-3, 3) / 10 }
    ];
    if (rnd.rand() < 0.5) {
      chisel.push({ kind: '凿', x: bx + rnd.randInt(-16, 16), y: by + rnd.randInt(-58, -44), rx: 6, ry: rnd.randInt(14, 20), rot: rnd.randInt(-3, 3) / 10 });
    }
    const burn = { x: bx, y: by + rnd.randInt(2, 8), r: rnd.randInt(9, 14) };

    const b0 = branches[0].pts[2];
    const labels = [
      { x: clamp(top.x + 7, 6, W - 26), y: clamp(top.y - 3, 14, H - 6), t: '首' },
      { x: clamp(stem[4].x + 9, 6, W - 40), y: clamp(stem[4].y + 13, 14, H - 6), t: '兆干' },
      { x: clamp(b0.x - 12, 6, W - 40), y: clamp(b0.y + 14, 14, H - 6), t: '兆枝（足）' },
      { x: clamp(bx + 20, 6, W - 44), y: clamp(by + 50, 14, H - 6), t: '钻凿·灼点' }
    ];

    const shape = {
      shouUp: shouUp, zuOpen: zuOpen, curve: curve,
      straight: Math.abs(curve) < 10,
      tips: tips, side: side, sideName: sideName, len: len
    };
    const zhao = (shouUp ? (zuOpen ? ZHAO.yangKai : ZHAO.yangHan)
      : (zuOpen ? ZHAO.fuKai : ZHAO.fuHan));

    /* 兆纹之几何参数（纯数据，供页面列示与 mount 绘制）：
       主干长度与弯度、兆枝的角度与长度数组、首叉之长度 */
    const geo = {
      stemLen: len,
      stemCurve: curve,
      stemPoints: stem.length,
      branchAt: geoBranchAt,
      branchSide: geoBranchSide,
      branchAngle: geoBranchAngle,
      branchLen: geoBranchLen,
      forkLen: [fk, Number((fk * 0.8).toFixed(1))],
      forkDy: [Number((shouUp ? -fk * 0.5 : fk * 0.3).toFixed(1)), Number((shouUp ? -fk * 0.42 : fk * 0.26).toFixed(1))],
      burnR: burn.r
    };

    return {
      W: W, H: H, shell: shell, grain: grain, chisel: chisel, burn: burn,
      stem: stem, branches: branches, hair: hair, labels: labels,
      shape: shape, zhao: zhao, geo: geo
    };
  }

  ART({
    id: 'guijia',
    name: '龟甲卜',
    alias: ['甲骨卜', '灼龟', '龟卜'],
    gua: 'gen',
    order: 2,
    tagline: '灼龟观兆 · 钻凿火灼，视其坼纹（兆）以问吉凶，并附甲骨卜辞四部分之体例',

    intro: `
      <p>龟甲卜是商代王室最主要的占问之法，与蓍筮并称「龟蓍」。其法：先整治龟腹甲（或牛肩胛骨），于其<b>背面</b>施「钻」与「凿」，再以火炷灼于钻处，使骨面受热迸裂，<b>正面</b>遂现出纵横之裂纹，此即「兆」。占者视兆之形态以定吉凶，并把卜问之事与结果刻在兆旁，这就是今日所见「甲骨卜辞」。</p>
      <p>许慎《说文解字》释「卜」云：「卜，灼剥龟也，象灸龟之形；一曰象龟兆之纵横也。」——「兆」的一纵一横，正与「卜」字之形相合。商王所卜多涉祭祀、征伐、田猎、风雨、年成、旬夕等国事与王室起居之常，由专职的「贞人」灼龟读兆，重大的占问则商王亲自视兆（「王占曰」）。</p>
      <p>1899 年，王懿荣于中药材「龙骨」上认出古文字，甲骨文自此为世所知（此为通行之说）；1928 年起中央研究院历史语言研究所在安阳小屯开始科学发掘，董作宾主持第一次发掘。甲骨学史上罗振玉（雪堂）、王国维（观堂）、郭沫若（鼎堂）、董作宾（彦堂）并称「四堂」。甲骨出土以殷墟小屯为大宗，1936 年第 13 次发掘所获 YH127 坑，一次出土甲骨约一万七千片。</p>
      <p>本站以程序按几何参数生成一幅「兆图」，并据其首、足之形态给出兆名与吉凶倾向，同时按甲骨卜辞的叙辞、命辞、占辞、验辞四部分体例，拟写一版卜辞示例。所生成之裂纹非任何实物拓本，拟写之卜辞亦非甲骨原文，页面中均逐一标明。</p>`,

    method: `
      <p>填起占时刻与所问之事（可留空），选择卜问之事类（旬夕、风雨、年成、行止、祭祀、田渔），按「灼龟起占」即见：程序生成的兆图（兆干、兆枝、钻凿与灼点）、兆形解析（首、足、干、枝）与吉凶倾向，以及按四部分体例拟写的卜辞一版。</p>
      <p>兆图由「起占时刻 + 所问 + 事类 + 起课之数」合成的可复现种子随机源一次生成：<b>同一组输入必得同一兆</b>，改时间或改数即另得一兆。若所问为空，命辞按所选事类套用甲骨卜辞的通行句式（如「旬亡祸？」「今日其雨？」）。</p>`,

    form: [
      { name: 'dt', label: '起占时刻', type: 'datetime-local', value: U.nowStr(), wide: true, hint: '参与合成兆纹的随机种子' },
      { name: 'q', label: '所问之事', type: 'text', placeholder: '如「此番合作可成否」，可留空' },
      { name: 'lei', label: '卜问事类', type: 'select', value: 'xun', options: [
        { v: 'xun', t: '旬夕（未来十日）' }, { v: 'yu', t: '风雨' }, { v: 'nian', t: '年成' },
        { v: 'xing', t: '行止' }, { v: 'ji', t: '祭祀' }, { v: 'tian', t: '田渔' }
      ] },
      { name: 'n', label: '起课之数', type: 'number', min: 1, max: 9999, value: 9, hint: '改动此数可另得一兆' }
    ],

    /* ★ 纯函数：只读 input，不碰 DOM；裂纹几何在此一次生成 */
    cast: function (input) {
      const dt = (input.dt || '').trim();
      if (!dt) return { error: '请填写起占时刻' };
      const q = (input.q || '').trim();
      const leiKey = LEI[input.lei] ? input.lei : 'xun';
      const lei = LEI[leiKey];
      let n = Number(input.n);
      if (!isFinite(n) || n === 0) n = 9;
      n = Math.abs(Math.floor(n)) || 9;

      const seed = hashStr(dt + '|' + q + '|' + leiKey + '|' + n);
      const rnd = C.RNG.seeded(seed);
      const crack = genCrack(rnd);

      const fp = G.fourPillars(U.parseDT(dt));
      const riGanZhi = fp.day.name;

      /* 甲骨卜辞四部分（本站依体例拟写，非甲骨原文） */
      const mingci = q ? ('贞：' + q + '？') : ('贞：' + lei.ming);
      const buci = [
        { k: '叙辞', v: riGanZhi + '卜，贞人某。', s: '记卜之日（干支）与贞人。真实卜辞亦多只记日干支，不记年月；贞人为当时之卜官，多有专名（如宾、争等），本站不具名。' },
        { k: '命辞', v: mingci, s: '所卜之事，即「贞问」之辞。本站按所选事类套用通行句式；若填了所问，则径以所问为命辞。' },
        { k: '占辞', v: '王占曰：' + crack.zhao.ming + '，' + crack.zhao.luck + '。', s: '视兆而下的判断。真实的占辞多为商王亲占之语（「王占曰」），亦有不记占辞者。' },
        { k: '验辞', v: '（本站不拟验辞）', s: '验辞是事后追记应验之辞（如「允雨」——果然下雨），占时不可预知，故本站留空。' }
      ];

      return {
        dt: dt, q: q, n: n, seed: seed, lei: leiKey, leiName: lei.t, leiZhu: lei.zhu,
        crack: crack, zhao: crack.zhao, shape: crack.shape,
        fpText: fp.year.name + '年 ' + fp.month.name + '月 ' + fp.day.name + '日 ' + fp.hour.name + '时',
        riGanZhi: riGanZhi, jieqi: fp.jieqi, buci: buci
      };
    },

    /* ★ 纯函数：返回 HTML 字符串 */
    view: function (d) {
      const sh = d.shape, z = d.zhao, out = [];
      const g0 = d.crack.geo || {};
      function fa(a) {
        return '[' + (a || []).map(function (x) {
          return Array.isArray(x) ? x.join(' , ') : x;
        }).join('　|　') + ']';
      }

      out.push(U.resHead('兆 · ' + z.ming, '龟甲卜 · ' + d.leiName + ' · ' + d.dt));

      /* 兆图（canvas 由 mount 绘制） */
      out.push(U.card('灼龟之兆',
        '<div class="figure"><canvas data-role="guijia" width="' + d.crack.W + '" height="' + d.crack.H + '"></canvas></div>' +
        U.note('图中骨面、钻凿、灼点与兆纹（兆干、兆枝、细枝）皆依本课之几何参数绘出，非实物拓本。') +
        U.note('图中所示方位为示意：兆干自灼点向上，兆枝向两侧分出；「首」指兆干上端，「足」指兆枝之末。')
      ));

      /* 兆形解析 */
      out.push(U.card('兆形解析', U.kv([
        ['兆名', z.ming + '　<span class="tag">' + z.gu + '</span>'],
        ['首（兆干上端）', sh.shouUp ? '仰——上端上扬外展' : '俯——上端内敛下垂（本站形态描述）'],
        ['足（兆枝之末）', sh.zuOpen ? '开——枝末外张舒展' : '肣（hán）——枝末收敛下垂'],
        ['兆干', (sh.straight ? '直' : '曲') + '（弯度 ' + sh.curve + '，' + (sh.straight ? '兆体端正，事有直路' : '兆体曲折，事多转折') + '）'],
        ['兆枝（足）之数', sh.tips + ' 枝' + (sh.tips >= 3 ? '（三叉，事有多端）' : '（枝少，事体较专）')],
        ['灼位', sh.sideName + '（' + (sh.side === 0 ? '中之位，事在两可之间' : (sh.side < 0 ? '左，本站参「左为阳」之说，主外发' : '右，本站参「右为阴」之说，主内敛')) + '）'],
        ['兆纹几何参数', '主干长 ' + (g0.stemLen || 0) + '、弯度 ' + (g0.stemCurve || 0) + '、折点 ' + (g0.stemPoints || 0) +
          '；兆枝角度 ' + fa(g0.branchAngle) + '（弧度）、长度 ' + fa(g0.branchLen) +
          '；首叉长度 ' + ((g0.forkLen || []).join('、')) + '；灼痕半径 ' + (g0.burnR || 0)],
        ['兆辞参考', '甲骨兆旁或刻决断小字，学者称「兆辞」，常见者如「吉」「大吉」「亡（无）災」之类。']
      ]) + U.note('上列「兆纹几何参数」即 cast 一次生成、由 mount 依之绘制的纯数据（主干长度与弯度、兆枝的角度与长度数组、首叉长度）；mount 不重新随机，故同一课之图与数必然相合。') + U.note('传统兆名传世而为学界所称引者，本站只用「首仰足开」「首仰足肣」二名；其余形态一律以「首俯足开」「首俯足肣」等<b>形态描述</b>给出，不敢以臆测妄补古兆名。左右阴阳之说亦仅作形态提示，非确证之古法。')));

      /* 吉凶倾向 */
      out.push(U.card('吉凶倾向（白话参考）', U.ul([
        '<b>兆象</b>：' + z.ming + '，属' + z.luck + '。' + z.jie,
        '<b>参以兆干</b>：' + (sh.straight ? '干直则事有直路，宜循正途、直道而行，不必绕行。' : '干曲则事多曲折，宜预留回旋之地，勿以一途自限。'),
        '<b>参以兆枝</b>：' + (sh.tips >= 3 ? '三枝并出，事有数端，宜分主次，勿贪多而力分。' : '枝数只二三，事体尚专，宜专注一处用力。'),
        '<b>参以灼位</b>：' + (sh.side === 0 ? '兆自中起，事在两可之间，宜先定己意而后行。' : (sh.side < 0 ? '兆自左起，倾向外发，宜主动而先发。' : '兆自右起，倾向内敛，宜后应而徐图。'))
      ]) + U.note('以上倾向为形态—白话的对照参考，不是「必吉必凶」的判决；古之卜者亦须「卜以决疑」，疑已决则卜可不用。')));

      /* 拟卜辞 */
      out.push(U.card('卜辞拟写（依叙辞、命辞、占辞、验辞四部分之体例）',
        U.table(['部分', '拟辞', '说明'], d.buci.map(function (b) {
          return { cells: [b.k, '<span class="mono-k">' + U.esc(b.v) + '</span>', b.s], left: [1, 2] };
        })) +
        U.note('四部分之体例为学者归纳所得（如董作宾、陈梦家等均有论述），并非每一版甲骨皆四者俱备：有省占辞者，有省验辞者，亦有仅刻命辞者。上表之「拟辞」为本站依此体例拟写，<b>不是任何一片甲骨的原文</b>，切勿引作史料。', true)));

      /* 工艺流程 */
      out.push(U.card('钻凿灼之工艺流程', U.ul([
        '<b>取材</b>：龟以腹甲为主，亦用背甲；牛以肩胛骨为主。牛骨易得，故殷墟出土甲骨中牛骨的数量其实最大。',
        '<b>整治</b>：锯去边缘、错平内面、刮磨使骨面平滑，再于边缘钻小孔以便穿绳缀合、成册收藏（甲骨文有「册」字，即象编缀之形）。',
        '<b>钻凿</b>：于骨之<b>背面</b>施「钻」（圆钻，或钻凿相间）与「凿」（长槽，多紧邻钻旁），钻凿皆不穿透骨面。',
        '<b>灼</b>：以火炷（燃木或炭）灼于钻处，骨受热则正面迸裂，现出一纵一横之裂痕，即所谓<b>兆</b>。',
        '<b>读兆</b>：占者视兆之「首」「足」形态定吉凶，重大之事由商王亲占。',
        '<b>刻辞</b>：于兆旁刻记卜问之事、判断与应验，字口多填墨或填朱。',
        '<b>庋藏</b>：刻毕之甲骨多收入窖穴，故有整坑出土者（如殷墟 YH127 坑）。'
      ])));

      /* 殷墟背景 */
      out.push(U.card('殷墟与甲骨学', U.ul([
        '甲骨文为商代晚期（约公元前 14 至前 11 世纪）王室占卜与记事的刻辞，出土地以河南安阳小屯一带的殷墟为大宗。',
        '1899 年王懿荣于「龙骨」药材上认出古文字，甲骨文自此为世所知（此为通行之说；发现经过尚存异说）。',
        '1928 年起中央研究院历史语言研究所开始在殷墟进行科学发掘，董作宾主持第一次发掘，此后十余次发掘所获甲骨数以万计。',
        '1936 年第 13 次发掘所获 YH127 坑，出土甲骨约一万七千片，是甲骨学史上最著名的一坑。',
        '甲骨学史上罗振玉（雪堂）、王国维（观堂）、郭沫若（鼎堂）、董作宾（彦堂）并称「四堂」，于文字考释、断代与史料研究各有大功。',
        '卜辞内容以祭祀、征伐、田猎、风雨、年成、旬夕（未来十日之吉凶）等王室之事为主，亦见记事刻辞、干支表与习刻。'
      ])));

      /* 术语 */
      out.push(U.card('术语小释', U.kv([
        ['兆（坼）', '骨面受灼迸裂所现之纹，即占者所视之「象」。纵者为兆干，旁出者为兆枝。'],
        ['首 · 足', '兆干的上端称「首」，兆枝的末端称「足」；首仰/首俯、足开/足肣，是兆形的两组基本分别。'],
        ['肣（hán）', '收敛、合拢之义，「足肣」即兆枝之末收敛下垂，与「足开」相对。'],
        ['钻 · 凿 · 灼', '背面的圆形钻与长条形凿合称「钻凿」；火炷灼于钻处，正面乃坼。'],
        ['贞人', '主持卜问的卜官。卜辞叙辞中常见「某贞」，此「某」即贞人之名。'],
        ['卜辞四部分', '叙辞（干支与贞人）、命辞（所问）、占辞（视兆之判断）、验辞（事后应验之记）。'],
        ['兆辞', '刻于兆旁的决断小字，如「吉」「大吉」「亡（无）災」之类，学者称之为兆辞。'],
        ['龟蓍', '龟甲卜与蓍草筮的合称；《礼记》有「龟为卜，策为筮」之说，二者并用而各有宜。']
      ])));

      out.push(U.note('本站自述（须读者知者三事）：① 兆图为程序依几何参数生成，形态与真实甲骨之坼纹只求神似，非拓本、非实物；② 传统兆名只取「首仰足开」「首仰足肣」二名，其余一律标为形态描述，不敢妄补；③ 卜辞四部分之拟辞为依体例拟写，绝不可当史料引用。', true));

      out.push(U.disclaim('龟卜所求，是借一副图象把疑事再看一遍；考之甲骨，古人亦曰「卜以决疑，不疑何卜」。'));
      return out.join('');
    },

    /* ★ 唯一可操作 DOM 之处：只按 cast 生成的几何数据绘制，不重新随机 */
    mount: function (root, data) {
      if (!root || !data || !data.crack) return;
      const cv = root.querySelector('canvas[data-role="guijia"]');
      if (!cv || typeof cv.getContext !== 'function') return;
      const cr = data.crack;
      const dpr = Math.min(2, (window.devicePixelRatio || 1));
      cv.width = Math.round(cr.W * dpr);
      cv.height = Math.round(cr.H * dpr);
      cv.style.width = cr.W + 'px';
      cv.style.height = cr.H + 'px';
      const g = cv.getContext('2d');
      if (!g) return;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, cr.W, cr.H);

      /* 骨面 */
      g.beginPath();
      cr.shell.forEach(function (p, i) { if (i) g.lineTo(p.x, p.y); else g.moveTo(p.x, p.y); });
      g.closePath();
      const grad = g.createLinearGradient(0, 0, 0, cr.H);
      grad.addColorStop(0, '#f0e7d1');
      grad.addColorStop(1, '#dccfae');
      g.fillStyle = grad;
      g.fill();
      g.strokeStyle = 'rgba(96,80,50,.6)';
      g.lineWidth = 1.4;
      g.stroke();

      /* 骨面纹理 */
      g.strokeStyle = 'rgba(120,100,60,.18)';
      g.lineWidth = 1;
      cr.grain.forEach(function (p) {
        g.beginPath(); g.moveTo(p.x1, p.y1); g.lineTo(p.x2, p.y2); g.stroke();
      });

      /* 钻凿 */
      cr.chisel.forEach(function (c) {
        g.beginPath();
        g.ellipse(c.x, c.y, c.rx, c.ry, c.rot, 0, Math.PI * 2);
        g.fillStyle = c.kind === '钻' ? 'rgba(126,104,66,.34)' : 'rgba(100,84,52,.30)';
        g.fill();
        g.strokeStyle = 'rgba(84,68,40,.5)';
        g.lineWidth = 1;
        g.stroke();
      });

      /* 灼痕 */
      const bg = g.createRadialGradient(cr.burn.x, cr.burn.y, 1, cr.burn.x, cr.burn.y, cr.burn.r);
      bg.addColorStop(0, 'rgba(38,28,16,.85)');
      bg.addColorStop(0.45, 'rgba(92,62,30,.5)');
      bg.addColorStop(1, 'rgba(120,90,50,0)');
      g.fillStyle = bg;
      g.beginPath();
      g.arc(cr.burn.x, cr.burn.y, cr.burn.r, 0, Math.PI * 2);
      g.fill();

      /* 兆纹：一道浅晕 + 一道深痕，取坼裂之感（线宽与形态皆来自数据） */
      function stroke(pts, w, alpha) {
        g.beginPath();
        pts.forEach(function (p, i) { if (i) g.lineTo(p.x, p.y); else g.moveTo(p.x, p.y); });
        g.lineCap = 'round';
        g.lineJoin = 'round';
        g.lineWidth = w + 1.8;
        g.strokeStyle = 'rgba(70,56,34,' + (alpha * 0.42) + ')';
        g.stroke();
        g.lineWidth = w;
        g.strokeStyle = 'rgba(34,26,16,' + alpha + ')';
        g.stroke();
      }
      stroke(cr.stem, 2.6, 0.95);
      cr.branches.forEach(function (b) { stroke(b.pts, b.w + 0.3, 0.92); });
      cr.hair.forEach(function (b) { stroke(b.pts, b.w, 0.68); });

      /* 标注 */
      g.fillStyle = 'rgba(70,56,36,.85)';
      g.font = '11px system-ui, sans-serif';
      cr.labels.forEach(function (l) { g.fillText(l.t, l.x, l.y); });
    }
  });
})();
