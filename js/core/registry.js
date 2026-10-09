/* ============================================================
   术数注册表 + 八卦分支定义
   —— 每个术数模块以 ART({...}) 自行登记，本文件不依赖任何模块。
   ============================================================ */
window.ART_REGISTRY = window.ART_REGISTRY || [];

/* 术数登记：def = { id, name, alias[], gua, order, tagline, form[], cast(), view(), mount() } */
window.ART = function (def) {
  if (!def || !def.id || !def.name || !def.gua) {
    console.warn('[ART] 注册失败，缺少 id/name/gua：', def);
    return;
  }
  if (window.ART_REGISTRY.some(a => a.id === def.id)) {
    console.warn('[ART] 重复注册：', def.id);
    return;
  }
  def.alias = def.alias || [];
  def.form = def.form || [];
  def.order = def.order === undefined ? 50 : def.order;
  if (typeof def.cast !== 'function') def.cast = function () { return {}; };
  if (typeof def.view !== 'function') def.view = function () { return window.CORE.UI.note('此术数尚在整理中。'); };
  window.ART_REGISTRY.push(def);
};

/* 取某卦下的术数（按 order 排序，未登记的也在列，标为整理中） */
window.artsOfGua = function (guaId) {
  const br = window.BRANCHES.find(b => b.id === guaId);
  if (!br) return [];
  return br.arts.map((meta, i) => {
    const reg = window.ART_REGISTRY.find(a => a.id === meta.id);
    return Object.assign({}, meta, { idx: i + 1, gua: guaId, ready: !!reg, art: reg || null });
  });
};
window.artById = function (id) { return window.ART_REGISTRY.find(a => a.id === id) || null; };
window.artMeta = function (id) {
  for (const b of window.BRANCHES) { const m = b.arts.find(a => a.id === id); if (m) return Object.assign({ gua: b.id }, m); }
  const o = window.OTHER_ARTS.arts.find(a => a.id === id);
  return o ? Object.assign({ gua: 'other' }, o) : null;
};
/* 取"其他术数"（同样允许未登记） */
window.otherArts = function () {
  return window.OTHER_ARTS.arts.map((meta, i) => {
    const reg = window.ART_REGISTRY.find(a => a.id === meta.id);
    return Object.assign({}, meta, { idx: i + 1, gua: 'other', ready: !!reg, art: reg || null });
  });
};

/* ---------- 八卦分支 ---------- */
window.BRANCHES = [
  {
    id: 'qian', name: '乾', symbol: '☰', nature: '天', num: 1, dir: '西北', dex: '健', wx: '金',
    theme: '天 · 帝王之学与天道历数',
    lead: '乾为天，刚健中正，主天道、君道、历数。三式之中奇门、太乙皆起于天数推步，' +
      '皇极经世以元会运世推世运，太玄拟易而作，皆属"观天之道、执天之行"的一路。',
    arts: [
      { id: 'qimen', name: '奇门遁甲', tagline: '时家转盘 · 九宫八门九星八神，三式之首，古称帝王之学。', tags: ['三式', '排盘', '九宫'] },
      { id: 'taiyi', name: '太乙神数', tagline: '太乙九宫 · 主客算数，推国家世运与大事吉凶，三式之一。', tags: ['三式', '九宫'] },
      { id: 'huangji', name: '皇极经世', tagline: '邵雍元会运世 · 以三十年为一世推演世运升降。', tags: ['象数', '世运'] },
      { id: 'taixuan', name: '太玄数', tagline: '扬雄拟易 · 三方九州八十一首，以"首"代卦、以"赞"代爻。', tags: ['拟易', '八十一首'] }
    ]
  },
  {
    id: 'kun', name: '坤', symbol: '☷', nature: '地', num: 8, dir: '西南', dex: '顺', wx: '土',
    theme: '地 · 形法堪舆与宅法',
    lead: '坤为地，厚德载物，主形法、方位、居止。堪舆一道，形法察山川之性情，理气辨方位之吉凶，' +
      '八宅、玄空、罗盘皆为理气之器。',
    arts: [
      { id: 'fengshui', name: '风水堪舆', tagline: '形势与理气纲要 · 觅龙、察砂、观水、点穴、立向。', tags: ['形法', '理气'] },
      { id: 'bazhai', name: '八宅明镜', tagline: '东四命西四命 · 大游年歌定八方吉凶，阳宅入门之法。', tags: ['阳宅', '游年'] },
      { id: 'xuankong', name: '玄空飞星', tagline: '三元九运 · 九星飞泊，看年月飞星到宫之吉凶。', tags: ['三元', '飞星'] },
      { id: 'luopan', name: '罗盘二十四山', tagline: '二十四山向 · 立向分金，坐山与朝向的五行生克。', tags: ['罗盘', '二十四山'] }
    ]
  },
  {
    id: 'zhen', name: '震', symbol: '☳', nature: '雷', num: 4, dir: '东', dex: '动', wx: '木',
    theme: '雷 · 动变之占（卦爻之法）',
    lead: '震为雷，动也。占卜之要，全在一"动"字：动则生变，变则成卦。' +
      '六爻纳甲、金钱卦、梅花易数皆以动爻为机，观其生克以断吉凶。',
    arts: [
      { id: 'liuyao', name: '六爻纳甲', tagline: '三钱六摇 · 装卦纳甲，六亲六神世应俱全，今世最通行之法。', tags: ['纳甲', '装卦'] },
      { id: 'jinqian', name: '金钱卦', tagline: '文王课简法 · 三枚铜钱六掷成卦，以本卦变卦断之。', tags: ['铜钱', '简法'] },
      { id: 'meihua', name: '梅花易数', tagline: '邵康节观梅 · 时间、数字、单字皆可起卦，体用生克断吉凶。', tags: ['体用', '起卦'] }
    ]
  },
  {
    id: 'xun', name: '巽', symbol: '☴', nature: '风', num: 5, dir: '东南', dex: '入', wx: '木',
    theme: '风 · 无形而入（字与梦）',
    lead: '巽为风，无孔不入。字有形而意无穷，梦无痕而象可索，' +
      '皆如风之入物，故测字、占梦二术系于此。',
    arts: [
      { id: 'cezi', name: '测字', tagline: '拆字观形 · 一字之中见增损离合、五行偏旁，断事之始终。', tags: ['拆字', '字占'] },
      { id: 'zhanmeng', name: '占梦', tagline: '梦象配五行人事 · 辨吉凶与心之所系，附传统梦占梗概。', tags: ['梦占', '意象'] }
    ]
  },
  {
    id: 'kan', name: '坎', symbol: '☵', nature: '水', num: 6, dir: '北', dex: '陷', wx: '水',
    theme: '水 · 数术谋略（六壬之宗）',
    lead: '坎为水，主数、主智、主隐。六壬以月将加时布天地盘，四课三传如水流曲折，' +
      '最见数术之精微；小六壬掐指六宫，金口诀以地分贵神立课，皆六壬之支流。',
    arts: [
      { id: 'daliuren', name: '大六壬', tagline: '月将加时 · 天地盘、四课、三传，十二天将断吉凶，三式之一。', tags: ['三式', '四课三传'] },
      { id: 'xiaoliuren', name: '小六壬', tagline: '掐指六宫 · 大安留连速喜赤口小吉空亡，月日时三数定吉凶。', tags: ['掌诀', '六宫'] },
      { id: 'jinkoujue', name: '六壬金口诀', tagline: '地分、月将、贵神、人元四位立课，大六壬之简捷法门。', tags: ['六壬', '四位'] }
    ]
  },
  {
    id: 'li', name: '离', symbol: '☲', nature: '火', num: 3, dir: '南', dex: '丽', wx: '火',
    theme: '火 · 星命推步（明而丽于天）',
    lead: '离为火，为明，为丽于天者。命理之学以人禀天地之气而生，' +
      '故以干支纪其生时，以星曜布其命宫，推其禀赋与运程。',
    arts: [
      { id: 'bazi', name: '四柱八字', tagline: '年月日时四柱 · 十神藏干、五行旺衰、喜用忌神。', tags: ['干支', '十神'] },
      { id: 'ziwei', name: '紫微斗数', tagline: '十二宫十四主星 · 命身二宫、五行局、四化飞星。', tags: ['命盘', '星曜'] },
      { id: 'tieban', name: '铁板神数', tagline: '邵子神数 · 以八字数理推条文断语，术家称"铁板"。', tags: ['条文', '数理'] },
      { id: 'qizheng', name: '七政四余', tagline: '日月五星与四余 · 中国古代星命之学，参中西之法。', tags: ['星命', '七政'] }
    ]
  },
  {
    id: 'gen', name: '艮', symbol: '☶', nature: '山', num: 7, dir: '东北', dex: '止', wx: '土',
    theme: '山 · 古法龟蓍（止而静，静而通）',
    lead: '艮为山，止也。古之卜筮，蓍草以数起、龟甲以象告，皆须静心斋戒而后应。' +
      '河洛理数与灵棋经亦存古法之一线。',
    arts: [
      { id: 'shicao', name: '蓍草筮', tagline: '大衍之数五十 · 十八变而成卦，《系辞》所载最古的筮法。', tags: ['古法', '大衍'] },
      { id: 'guijia', name: '龟甲卜', tagline: '灼龟观兆 · 甲骨钻凿火灼，视其坼纹以问吉凶。', tags: ['甲骨', '象占'] },
      { id: 'lingqi', name: '灵棋经', tagline: '十二棋子 · 掷棋成卦，上中下各四子，一百二十四卦。', tags: ['掷棋', '古占'] },
      { id: 'heluo', name: '河洛理数', tagline: '八字化卦 · 以河图洛书数化干支为卦，推先天后天之数。', tags: ['河洛', '化卦'] }
    ]
  },
  {
    id: 'dui', name: '兑', symbol: '☱', nature: '泽', num: 2, dir: '西', dex: '悦', wx: '金',
    theme: '泽 · 巫祝口舌（兑为巫、为口）',
    lead: '兑为泽，为口舌，为巫祝，为悦。签诗口诵、掷筊问神、扶乩书字，' +
      '皆以口与神相交，故系于兑。',
    arts: [
      { id: 'qianshi', name: '签诗占', tagline: '抽签问事 · 签诗配典故断之，附签筒与掷筊程序。', tags: ['签诗', '民俗'] },
      { id: 'zhibei', name: '掷筊问事', tagline: '圣筊、笑筊、阴筊 · 以两筊俯仰问神明可否。', tags: ['杯筊', '问事'] },
      { id: 'fuji', name: '扶乩', tagline: '乩笔降神 · 沙盘书字，民间问事之法，附乩坛仪轨。', tags: ['乩坛', '民俗'] }
    ]
  }
];

/* ---------- 其他术数：与八卦无直接象数关联者，列于大八卦之下 ----------
   理由：这些术数或为形法（相术）、或属丛辰家（择日）、或为近代民俗术数
   （姓名学五格剖象）、或纯为民俗兆应（民间杂占），不以八卦为体，故不设连线。 */
window.OTHER_ARTS = {
  id: 'other', name: '其他术数', symbol: '☯', nature: '杂', theme: '不与八卦相系者',
  lead: '下列术数与八卦无直接象数关联：相术属形法（与堪舆同源而异流），' +
    '择日属丛辰家（以月建日辰为体），姓名学五格剖象为近代民俗术数，' +
    '民间杂占则为兆应之俗信。故列于八卦之下，另为一区。',
  arts: [
    { id: 'xiangshu', name: '相术', tagline: '面相三停十二宫 · 手相掌丘纹路，形法之属。', tags: ['形法', '面相'] },
    { id: 'zeri', name: '择日·建除黄道', tagline: '建除十二神与二十八宿 · 丛辰家择吉避凶之法。', tags: ['丛辰', '建除'] },
    { id: 'xingming', name: '姓名学', tagline: '五格剖象 · 天格人格地格总格外格，近代民俗术数。', tags: ['五格', '近代'] },
    { id: 'minjian', name: '民间杂占', tagline: '眼跳、耳鸣、心惊、灯花、喷嚏 · 以时辰方位断其兆。', tags: ['兆应', '俗信'] }
  ]
};
