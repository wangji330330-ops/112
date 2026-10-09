/* ============================================================
   坤 · 八宅明镜 —— 东四命 / 西四命，大游年歌定八方吉凶
   ============================================================ */
(function () {
  'use strict';
  const C = window.CORE, U = C.UI, ART = window.ART;

  /* ---------- 八宅表：一律取 core（js/core/tables.js）之 C.BAZHAI ---------- */
  /* 命卦与游年歌之算法在 core 中已实现，本页只调用，不重写。 */
  const BZ = C.BAZHAI;
  const RING = (BZ && BZ.RING) || ['kan', 'gen', 'zhen', 'xun', 'li', 'kun', 'dui', 'qian'];
  const BZ_READY = !!(BZ && typeof BZ.youNian === 'function' && typeof BZ.mingGua === 'function');

  const DONG_SI = ['坎', '离', '震', '巽'];       // 东四命
  const XI_SI = ['乾', '坤', '艮', '兑'];         // 西四命
  const GUA_IDS = ['qian', 'dui', 'li', 'zhen', 'xun', 'kan', 'gen', 'kun'];

  const guaOf = (id) => C.GUA_BY_ID[id];
  const fang = (id) => guaOf(id).dir;

  /* ---------- 大游年八方宜忌（白话参考语，非古籍原文） ---------- */
  const YN_TEXT = {
    生气: { t: '贪狼生气，主生发进取，为八宅第一吉方。', men: '宜', chuang: '宜（床头所向）', zao: '火口宜向之', shu: '宜' },
    延年: { t: '武曲延年，主和顺寿考、婚姻和合。', men: '宜', chuang: '宜', zao: '火口宜向之', shu: '宜' },
    天医: { t: '巨门天医，主康健与扶助，病者宜居。', men: '宜', chuang: '宜', zao: '火口宜向之', shu: '宜（体弱者尤宜）' },
    伏位: { t: '伏位为本命方，主安定守常，宜静不宜动。', men: '可（宜作后门、静门）', chuang: '宜', zao: '平', shu: '宜' },
    祸害: { t: '禄存祸害，主口舌小耗、事多牵绊。', men: '忌', chuang: '忌', zao: '灶身可坐之', shu: '忌' },
    六煞: { t: '文曲六煞，主是非桃花、人情反复。', men: '忌', chuang: '忌', zao: '灶身可坐之', shu: '忌' },
    五鬼: { t: '廉贞五鬼，主争斗火烛、性烈不安。', men: '忌', chuang: '忌', zao: '灶身宜坐之（压凶）', shu: '忌' },
    绝命: { t: '破军绝命，气最烈，为八宅最忌之方。', men: '大忌', chuang: '大忌', zao: '灶身宜坐之（压凶）', shu: '忌' }
  };

  /* 通行命卦口诀：男 11 减生年数字和，女 4 加生年数字和（五寄坤/艮）—— 用于与引擎结果参校 */
  function mingGuaTongxing(year, gender) {
    const male = (gender === '男' || gender === 'male');
    const s = String(Math.abs(Number(year) || 0)).split('').reduce((a, c) => a + (Number(c) || 0), 0);
    const n = ((s - 1) % 9 + 9) % 9 + 1;
    let k = male ? 11 - n : 4 + n;
    k = ((k - 1) % 9 + 9) % 9 + 1;
    if (k === 5) k = male ? 2 : 8;
    return { 1: '坎', 2: '坤', 3: '震', 4: '巽', 6: '乾', 7: '兑', 8: '艮', 9: '离' }[k] || '坎';
  }

  ART({
    id: 'bazhai',
    name: '八宅明镜',
    alias: ['八宅', '游年', '东西四宅'],
    gua: 'kun',
    order: 2,
    tagline: '东四命西四命 · 大游年歌定八方吉凶，阳宅入门之法',

    intro: `
      <p>八宅之法专论阳宅，以「命卦」配「宅卦」而定八方吉凶。其书《八宅明镜》旧题唐·杨筠松所传，
      明清间刊本流传甚广（撰者托名不一），与《阳宅三要》《阳宅十书》同为阳宅入门之要籍。
      法以人之生年推命卦，以宅之坐向定宅卦，二者相配，再以「大游年歌」顺布八方。</p>
      <p>其核心在一「配」字：命卦分东四命（坎、离、震、巽）与西四命（乾、坤、艮、兑），
      宅亦分东四宅与西四宅，东四命宜居东四宅、西四命宜居西四宅，谓之「命宅相配」；
      若东命住西宅、西命住东宅，则八方吉凶错位，古人谓之「不配」，主居之不安。</p>
      <p>八方所布八星，依次为生气（贪狼）、延年（武曲）、天医（巨门）、伏位（辅弼）、
      祸害（禄存）、六煞（文曲）、五鬼（廉贞）、绝命（破军）。前四者为吉，后四者为凶。
      阳宅取用尤重「门、主、灶」三要：门为气口、主为卧房、灶为养命之源，
      三者各安其位，其余房舍、书桌、神位亦各有所宜。本页只取命卦与游年一段，属简化演示。</p>`,

    method: `
      <p>填写出生年（公历）与性别，或直接指定命卦，按「起盘」即得：命卦属东四还是西四、
      八方各布何星、以及门、床、灶、书桌的宜忌方位。</p>
      <p>须知命卦本应以<b>立春</b>为年界（立春前生者算上一年），本页只取年份数字，未作立春换算；
      又八宅尚有宅卦、东西四宅、九星伏位、抽爻换象诸法，本页只论命卦游年，未及宅卦。</p>`,

    form: [
      { name: 'year', label: '出生年（公历）', type: 'number', value: 1990, min: 1900, max: 2100 },
      { name: 'gender', label: '性别', type: 'chips', value: '男', options: [{ v: '男', t: '男' }, { v: '女', t: '女' }] },
      {
        name: 'gua', label: '命卦', type: 'select', value: 'auto',
        options: [{ v: 'auto', t: '自动（依出生年与性别）' }].concat(GUA_IDS.map(id => ({ v: guaOf(id).name, t: guaOf(id).name + '卦（' + fang(id) + '）' }))),
        hint: '可直接指定'
      }
    ],

    cast(input) {
      if (!BZ_READY) return { error: '八宅核心表未加载：请确认 index.html 已引入 js/core/tables.js' };
      const gender = String(input.gender || '男').trim() === '女' ? '女' : '男';
      const year = Number(input.year);
      if (!year || year < 1000 || year > 2999) return { error: '请填写四位数的出生年（公历）' };
      const guaIn = String(input.gua || 'auto').trim();
      const ming = (guaIn && guaIn !== 'auto') ? guaIn : BZ.mingGua(year, gender);
      if (GUA_IDS.map(id => guaOf(id).name).indexOf(ming) < 0) return { error: '命卦须为乾、坤、震、巽、坎、离、艮、兑之一' };

      const yn = BZ.youNian(ming);
      const group = DONG_SI.indexOf(ming) >= 0 ? '东四命' : '西四命';
      const zhuzhai = group === '东四命' ? '东四宅（坎、离、震、巽）' : '西四宅（乾、坤、艮、兑）';

      const list = RING.map(id => {
        const g = guaOf(id);
        const y = yn[id] || { name: '—', luck: '—', code: '' };
        return {
          id: id, gua: g.name, dir: g.dir, wx: g.wx, gong: g.houtian,
          name: y.name, luck: y.luck, t: (YN_TEXT[y.name] || {}).t || '',
          ji: y.luck !== '凶' && y.luck !== '大凶'
        };
      });

      const jiFang = list.filter(x => x.ji);
      const xiongFang = list.filter(x => !x.ji);
      const pick = (names) => list.filter(x => names.indexOf(x.name) >= 0)
        .map(x => x.gua + '方（' + x.dir + '）').join('、');

      const doorYi = pick(['生气', '延年', '天医', '伏位']);
      const doorJi = pick(['五鬼', '绝命', '六煞', '祸害']);
      const chuangYi = pick(['伏位', '生气', '天医', '延年']);
      const chuangJi = pick(['五鬼', '绝命']);
      const zaoZuo = pick(['五鬼', '绝命', '六煞', '祸害']);
      const zaoKou = pick(['生气', '延年', '天医']);
      const shuWei = pick(['生气', '天医']);
      const caiWei = pick(['生气', '延年']);

      const tongxing = mingGuaTongxing(year, gender);
      const same = tongxing === ming;

      return {
        year: year, gender: gender, ming: ming, group: group, zhuzhai: zhuzhai,
        list: list, jiFang: jiFang, xiongFang: xiongFang,
        doorYi: doorYi, doorJi: doorJi, chuangYi: chuangYi, chuangJi: chuangJi,
        zaoZuo: zaoZuo, zaoKou: zaoKou, shuWei: shuWei, caiWei: caiWei,
        tongxing: tongxing, same: same,
        mingId: GUA_IDS.filter(id => guaOf(id).name === ming)[0] || 'kan',
        fuwei: pick(['伏位'])
      };
    },

    view(d) {
      const cells = {};
      d.list.forEach(x => {
        cells[x.gong] = {
          html: U.cell({
            gong: x.gua + '宫 · ' + x.dir,
            main: x.name + '<span class="sub"> ' + x.luck + '</span>',
            sub: U.wx(x.gua, x.wx) + ' ' + x.wx + (x.ji ? ' · 吉方' : ' · 凶方')
          })
        };
      });

      const table = U.table(['卦位', '方位', '五行', '游年', '吉凶', '门', '床', '灶', '书桌'],
        d.list.map(x => {
          const yt = YN_TEXT[x.name] || {};
          return {
            cells: [x.gua, x.dir, U.wx(x.wx, x.wx), x.name, x.luck, yt.men || '—', yt.chuang || '—', yt.zao || '—', yt.shu || '—'],
            cls: x.ji ? 'hi' : ''
          };
        }), { align: ['c', 'c', 'c', 'c', 'c', 'l', 'l', 'l', 'l'] });

      const ynList = U.ul(d.list.map(x => '<b>' + x.name + '</b>（' + x.luck + '）在' + x.gua + '方（' + x.dir + '）：' + x.t));

      const useTable = U.table(['所宜', '方位', '白话说明'], [
        { cells: ['大门（气口）', d.doorYi || '—', '门为气口，宜开于四吉方；忌于 ' + (d.doorJi || '—') + '。'], cls: 'hi' },
        { cells: ['床位（主卧）', d.chuangYi || '—', '床头所向宜四吉方，尤宜伏位与生气；忌 ' + (d.chuangJi || '—') + '。床不宜正对门、不宜压梁。'] },
        { cells: ['灶位（养命）', '灶身坐 ' + (d.zaoZuo || '—') + '；火口朝 ' + (d.zaoKou || '—'), '灶身（炉座）宜压凶方以镇之，火口（炉门）宜朝吉方以纳生气。'] },
        { cells: ['书桌 · 文昌', d.shuWei || '—', '宜坐吉方、面吉方；生气主进、天医主健，皆宜读书用功之所。'], cls: 'hi' },
        { cells: ['财位', d.caiWei || '—', '生气主生发、延年主和合，皆为聚财之方；宜整洁明亮，忌堆塞。'] }
      ], { align: ['l', 'l', 'l'] });

      const pairSaid = d.group === '东四命'
        ? '东四命宜居东四宅；若住西四宅（乾、坤、艮、兑坐向之宅），则本命之四吉方与宅之吉方错位，古人谓之命宅不配。'
        : '西四命宜居西四宅；若住东四宅（坎、离、震、巽坐向之宅），则本命之四吉方与宅之吉方错位，古人谓之命宅不配。';

      const capNote = d.same
        ? U.note('本页命卦取自引擎 C.BAZHAI.mingGua（男 11 减、女 4 加生年数字和，五寄坤/艮）；' +
          '以通行口诀（生年<b>四位</b>数字和，或用「男 (100−后两位)÷9、女 (后两位−4)÷9」取余）复核，' +
          '本例二者所得相同，皆为 ' + d.ming + ' 卦。')
        : U.note('本页命卦取自引擎 C.BAZHAI.mingGua（男 11 减、女 4 加生年数字和，五寄坤/艮），' +
          '本例得 <b>' + d.ming + '</b> 卦；若以通行口诀（生年<b>四位</b>数字和，或用「男 (100−后两位)÷9、女 (后两位−4)÷9」取余）复核，' +
          '则为 <b>' + d.tongxing + '</b> 卦，二者不同。本页正盘从引擎所定之 ' + d.ming + ' 卦，通行值并列于上以备勘，' +
          '请读者留意所用约定。', true);

      return U.resHead(d.ming + '命 · ' + d.group, '八宅明镜 · 游年八方') +
        U.card('命卦', U.kv([
          ['出生年', d.year + ' 年（' + d.gender + '命，未作立春换年）'],
          ['命卦', '<b>' + d.ming + '</b> 卦　方位 ' + fang(d.mingId) + '　属' + d.group],
          ['伏位', d.fuwei + '（本命方，宜静宜居）'],
          ['宜住', d.zhuzhai],
          ['通行口诀命卦', d.tongxing + '卦' + (d.same ? '（与引擎一致）' : '（与引擎不同，见下注）')]
        ])) +
        U.card('八方游年 · 洛书九宫', U.grid9(cells, U.cell({ gong: '中宫', main: '命卦 ' + d.ming, sub: d.group })) +
          U.note('图以南上北下排布：上排巽四·离九·坤二，中排震三·中五·兑七，下排艮八·坎一·乾六。')) +
        U.card('八方详表', table) +
        U.card('八星次第', ynList) +
        U.card('门 · 主 · 灶 · 书桌 宜忌', useTable +
          U.p('八宅以「门、主、灶」为三要：门为气口，纳一方之气；主为卧房，安一身之居；灶为养命之源。' +
            '三者之中，门最为要，古人云「门为宅之口」，气口得吉则一宅俱得其气。')) +
        U.card('东四命 · 西四命', U.p(pairSaid) +
          U.kv([
            ['东四命 · 东四宅', '坎、离、震、巽　—— 四吉方多在东、东南、南、北'],
            ['西四命 · 西四宅', '乾、坤、艮、兑　—— 四吉方多在西、西南、东北、西北'],
            ['配法', '东命配东宅、西命配西宅；命宅相配则八方吉凶各得其位，反之则错位。']
          ])) +
        capNote +
        U.card('术语小释', U.kv([
          ['命卦', '以生年推得的本命卦，男、女算法不同；五黄无卦，男寄坤、女寄艮。'],
          ['大游年歌', '八句口诀，自本命卦起依后天八卦顺时针布生气、天医、延年等八星，为八宅立盘之本。'],
          ['伏位', '本命卦所在之方，主安定守常，宜作卧室静室，不宜作重动之所。'],
          ['四吉四凶', '生气、延年、天医、伏位为四吉；祸害、六煞、五鬼、绝命为四凶。'],
          ['门主灶', '阳宅三要：门为气口、主为卧房、灶为养命之源，各有宜忌方位。'],
          ['东四西四', '命与宅皆分东西四，同组相配为宜，古人谓之「命宅相配」。']
        ])) +
        U.note('本页为简化演示：只论命卦游年，未及宅卦（宅之坐向所定之卦）与东西四宅定法，' +
          '亦未作九星伏位、抽爻换象、命宅配合与否的完整推演；命卦未按立春换年，' +
          '出生年只取年份数字。八宅流派异说颇多（伏位起法、五黄寄宫皆有异同），此页从通说。', true) +
        U.disclaim('八宅断语为参考白话，非古籍原文；方位宜忌仅供参考，不作迁居、装修、投资之凭据。');
    }
  });
})();
