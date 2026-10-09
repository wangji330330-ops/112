/* ============================================================
   易学基础数据：五行 / 天干地支 / 八卦 / 六十四卦 / 京房纳甲 / 八宫世应
   ============================================================ */
window.CORE = window.CORE || {};

(function (C) {
  'use strict';

  /* ---------- 五行 ---------- */
  const WX = ['木', '火', '土', '金', '水'];
  const WX_COLOR = { 木: '#3d6b45', 火: '#a8322d', 土: '#8a6a2f', 金: '#7d838c', 水: '#2f4a6b' };
  const SHENG = { 木: '火', 火: '土', 土: '金', 金: '水', 水: '木' };
  const KE = { 木: '土', 土: '水', 水: '火', 火: '金', 金: '木' };
  const wxSheng = (w) => SHENG[w];
  const wxKe = (w) => KE[w];
  /* a 与 b 的关系（以 a 为我） */
  function wxRelation(a, b) {
    if (a === b) return '同';
    if (SHENG[a] === b) return '我生';
    if (SHENG[b] === a) return '生我';
    if (KE[a] === b) return '我克';
    if (KE[b] === a) return '克我';
    return '—';
  }
  /* 六亲：以卦宫五行为"我" */
  function liuQin(gongWx, wx) {
    if (wx === gongWx) return '兄弟';
    if (SHENG[wx] === gongWx) return '父母';
    if (SHENG[gongWx] === wx) return '子孙';
    if (KE[wx] === gongWx) return '官鬼';
    if (KE[gongWx] === wx) return '妻财';
    return '—';
  }

  /* ---------- 天干地支 ---------- */
  const GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  const ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  const GAN_WX = ['木', '木', '火', '火', '土', '土', '金', '金', '水', '水'];
  const GAN_YY = [1, 0, 1, 0, 1, 0, 1, 0, 1, 0];          // 1 阳
  const ZHI_WX = ['水', '土', '木', '木', '土', '火', '火', '土', '金', '金', '土', '水'];
  const ZHI_YY = [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0];
  const SHENGXIAO = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];
  const ZHI_CANGGAN = {
    子: [['癸', 1]], 丑: [['己', 0.6], ['癸', 0.3], ['辛', 0.1]],
    寅: [['甲', 0.6], ['丙', 0.3], ['戊', 0.1]], 卯: [['乙', 1]],
    辰: [['戊', 0.6], ['乙', 0.3], ['癸', 0.1]], 巳: [['丙', 0.6], ['庚', 0.3], ['戊', 0.1]],
    午: [['丁', 0.7], ['己', 0.3]], 未: [['己', 0.6], ['丁', 0.3], ['乙', 0.1]],
    申: [['庚', 0.6], ['壬', 0.3], ['戊', 0.1]], 酉: [['辛', 1]],
    戌: [['戊', 0.6], ['辛', 0.3], ['丁', 0.1]], 亥: [['壬', 0.7], ['甲', 0.3]]
  };
  const HOURS = [
    { zhi: '子', range: '23:00-00:59', idx: 0 }, { zhi: '丑', range: '01:00-02:59', idx: 1 },
    { zhi: '寅', range: '03:00-04:59', idx: 2 }, { zhi: '卯', range: '05:00-06:59', idx: 3 },
    { zhi: '辰', range: '07:00-08:59', idx: 4 }, { zhi: '巳', range: '09:00-10:59', idx: 5 },
    { zhi: '午', range: '11:00-12:59', idx: 6 }, { zhi: '未', range: '13:00-14:59', idx: 7 },
    { zhi: '申', range: '15:00-16:59', idx: 8 }, { zhi: '酉', range: '17:00-18:59', idx: 9 },
    { zhi: '戌', range: '19:00-20:59', idx: 10 }, { zhi: '亥', range: '21:00-22:59', idx: 11 }
  ];

  /* 地支关系 */
  const LIU_HE = [[0, 1], [2, 11], [3, 10], [4, 9], [5, 8], [6, 7]];         // 子丑 寅亥 卯戌 辰酉 巳申 午未
  const LIU_CHONG = [[0, 6], [1, 7], [2, 8], [3, 9], [4, 10], [5, 11]];      // 子午 丑未 寅申 卯酉 辰戌 巳亥
  const SAN_HE = [[8, 0, 4], [11, 3, 7], [2, 6, 10], [5, 9, 1]];             // 申子辰 亥卯未 寅午戌 巳酉丑
  const LIU_HAI = [[0, 7], [1, 6], [2, 5], [3, 4], [8, 11], [9, 10]];
  const SAN_XING = [
    { zhi: [2, 5, 8], n: '寅巳申 无恩之刑' }, { zhi: [1, 10, 7], n: '丑戌未 恃势之刑' },
    { zhi: [0], n: '子 无礼之刑' }, { zhi: [3], n: '卯 无礼之刑' },
    { zhi: [4], n: '辰 自刑' }, { zhi: [6], n: '午 自刑' }, { zhi: [9], n: '酉 自刑' }, { zhi: [11], n: '亥 自刑' }
  ];
  function pairIn(list, a, b) { return list.some(p => (p[0] === a && p[1] === b) || (p[0] === b && p[1] === a)); }
  function isLiuHe(a, b) { return pairIn(LIU_HE, a, b); }
  function isLiuChong(a, b) { return pairIn(LIU_CHONG, a, b); }
  /* 三合局中是否同局 */
  function sanHeGroup(z) { const i = SAN_HE.findIndex(g => g.indexOf(z) >= 0); return i < 0 ? null : { idx: i, zhi: SAN_HE[i], wx: ['水', '木', '火', '金'][i] }; }

  /* 十神 */
  const SHISHEN = {
    same: { same: '比肩', diff: '劫财' },
    woSheng: { same: '食神', diff: '伤官' },
    woKe: { same: '偏财', diff: '正财' },
    keWo: { same: '七杀', diff: '正官' },
    shengWo: { same: '偏印', diff: '正印' }
  };
  function shiShen(dayGanIdx, ganIdx) {
    const me = GAN_WX[dayGanIdx], other = GAN_WX[ganIdx];
    const same = GAN_YY[dayGanIdx] === GAN_YY[ganIdx];
    const rel = wxRelation(me, other);
    if (rel === '同') return same ? '比肩' : '劫财';
    if (rel === '我生') return same ? '食神' : '伤官';
    if (rel === '我克') return same ? '偏财' : '正财';
    if (rel === '克我') return same ? '七杀' : '正官';
    if (rel === '生我') return same ? '偏印' : '正印';
    return '—';
  }

  /* 十二长生 */
  const CHANGSHENG_NAMES = ['长生', '沐浴', '冠带', '临官', '帝旺', '衰', '病', '死', '墓', '绝', '胎', '养'];
  const CHANGSHENG_START = [11, 6, 2, 9, 2, 9, 5, 0, 8, 3];  // 甲亥 乙午 丙寅 丁酉 戊寅 己酉 庚巳 辛子 壬申 癸卯
  function changSheng(ganIdx, zhiIdx) {
    const start = CHANGSHENG_START[ganIdx];
    const dir = GAN_YY[ganIdx] ? 1 : -1;
    let step = ((zhiIdx - start) * dir % 12 + 12) % 12;
    return CHANGSHENG_NAMES[step];
  }

  /* ---------- 八卦 ---------- */
  /* lines 自下而上：初爻在前 */
  const BAGUA = [
    { id: 'qian', name: '乾', symbol: '☰', nature: '天', lines: [1, 1, 1], wx: '金', num: 1, houtian: 6, dir: '西北', family: '父', body: '首', dex: '健', desc: '刚健中正，为天为君为父' },
    { id: 'dui', name: '兑', symbol: '☱', nature: '泽', lines: [1, 1, 0], wx: '金', num: 2, houtian: 7, dir: '西', family: '少女', body: '口', dex: '悦', desc: '和悦柔顺，为泽为口为少女' },
    { id: 'li', name: '离', symbol: '☲', nature: '火', lines: [1, 0, 1], wx: '火', num: 3, houtian: 9, dir: '南', family: '中女', body: '目', dex: '丽', desc: '附丽光明，为火为日为目' },
    { id: 'zhen', name: '震', symbol: '☳', nature: '雷', lines: [1, 0, 0], wx: '木', num: 4, houtian: 3, dir: '东', family: '长男', body: '足', dex: '动', desc: '奋动而进，为雷为龙为长男' },
    { id: 'xun', name: '巽', symbol: '☴', nature: '风', lines: [0, 1, 1], wx: '木', num: 5, houtian: 4, dir: '东南', family: '长女', body: '股', dex: '入', desc: '顺入无碍，为风为木为长女' },
    { id: 'kan', name: '坎', symbol: '☵', nature: '水', lines: [0, 1, 0], wx: '水', num: 6, houtian: 1, dir: '北', family: '中男', body: '耳', dex: '陷', desc: '重险而通，为水为月为中男' },
    { id: 'gen', name: '艮', symbol: '☶', nature: '山', lines: [0, 0, 1], wx: '土', num: 7, houtian: 8, dir: '东北', family: '少男', body: '手', dex: '止', desc: '止而不迁，为山为门为少男' },
    { id: 'kun', name: '坤', symbol: '☷', nature: '地', lines: [0, 0, 0], wx: '土', num: 8, houtian: 2, dir: '西南', family: '母', body: '腹', dex: '顺', desc: '厚德载物，为地为母为众' }
  ];
  const GUA_BY_ID = {};
  BAGUA.forEach(b => GUA_BY_ID[b.id] = b);
  const GUA_BY_NAME = {};
  BAGUA.forEach(b => GUA_BY_NAME[b.name] = b);
  const GUA_BY_LINES = {};
  BAGUA.forEach(b => GUA_BY_LINES[b.lines.join('')] = b);
  const XIANTIAN = ['qian', 'dui', 'li', 'zhen', 'xun', 'kan', 'gen', 'kun'];
  const HOUTIAN = ['kan', 'kun', 'zhen', 'xun', null, 'qian', 'dui', 'gen', 'li'];
  const LUOSHU = ['kan', 'kun', 'zhen', 'xun', null, 'qian', 'dui', 'gen', 'li'];   // 宫1..宫9
  const GONG_POS = {                                    // 洛书九宫在 3×3 网格中的位置（行,列）
    4: [0, 0], 9: [0, 1], 2: [0, 2], 3: [1, 0], 5: [1, 1], 7: [1, 2], 8: [2, 0], 1: [2, 1], 6: [2, 2]
  };
  const GONG_ORDER = [1, 2, 3, 4, 5, 6, 7, 8, 9];       // 洛书宫序（阳遁顺飞用）
  /* 八门原始定位（依后天八卦） */
  const MEN_AT_GONG = { 1: '休门', 8: '生门', 3: '伤门', 4: '杜门', 9: '景门', 2: '死门', 7: '惊门', 6: '开门' };
  const MEN_ORDER = ['休门', '生门', '伤门', '杜门', '景门', '死门', '惊门', '开门'];  // 顺时针
  /* 九星原始定位 */
  const XING_AT_GONG = { 1: '天蓬', 8: '天任', 3: '天冲', 4: '天辅', 9: '天英', 2: '天芮', 7: '天柱', 6: '天心', 5: '天禽' };
  const XING_ORDER = ['天蓬', '天任', '天冲', '天辅', '天英', '天芮', '天柱', '天心'];
  const SHEN_ORDER = ['值符', '腾蛇', '太阴', '六合', '白虎', '玄武', '九地', '九天'];   // 阳遁顺布
  const YIQI_ORDER = ['戊', '己', '庚', '辛', '壬', '癸', '丁', '丙', '乙'];             // 六仪三奇
  const GONG_NAME = { 1: '坎一宫', 2: '坤二宫', 3: '震三宫', 4: '巽四宫', 5: '中五宫', 6: '乾六宫', 7: '兑七宫', 8: '艮八宫', 9: '离九宫' };
  const GONG_GUA = { 1: '坎', 2: '坤', 3: '震', 4: '巽', 5: '中', 6: '乾', 7: '兑', 8: '艮', 9: '离' };
  const GONG_DIR = { 1: '北', 2: '西南', 3: '东', 4: '东南', 5: '中', 6: '西北', 7: '西', 8: '东北', 9: '南' };

  /* ---------- 六十四卦 ---------- */
  const TRI = ['qian', 'dui', 'li', 'zhen', 'xun', 'kan', 'gen', 'kun'];   // 上卦为行，下卦为列
  const NAME_MATRIX = [
    ['乾为天', '天泽履', '天火同人', '天雷无妄', '天风姤', '天水讼', '天山遁', '天地否'],
    ['泽天夬', '兑为泽', '泽火革', '泽雷随', '泽风大过', '泽水困', '泽山咸', '泽地萃'],
    ['火天大有', '火泽睽', '离为火', '火雷噬嗑', '火风鼎', '火水未济', '火山旅', '火地晋'],
    ['雷天大壮', '雷泽归妹', '雷火丰', '震为雷', '雷风恒', '雷水解', '雷山小过', '雷地豫'],
    ['风天小畜', '风泽中孚', '风火家人', '风雷益', '巽为风', '风水涣', '风山渐', '风地观'],
    ['水天需', '水泽节', '水火既济', '水雷屯', '水风井', '坎为水', '水山蹇', '水地比'],
    ['山天大畜', '山泽损', '山火贲', '山雷颐', '山风蛊', '山水蒙', '艮为山', '山地剥'],
    ['地天泰', '地泽临', '地火明夷', '地雷复', '地风升', '地水师', '地山谦', '坤为地']
  ];
  /* 序卦传次序 */
  const SEQ = ('乾为天 坤为地 水雷屯 山水蒙 水天需 天水讼 地水师 水地比 风天小畜 天泽履 地天泰 天地否 ' +
    '天火同人 火天大有 地山谦 雷地豫 泽雷随 山风蛊 地泽临 风地观 火雷噬嗑 山火贲 山地剥 地雷复 ' +
    '天雷无妄 山天大畜 山雷颐 泽风大过 坎为水 离为火 泽山咸 雷风恒 天山遁 雷天大壮 火地晋 地火明夷 ' +
    '风火家人 火泽睽 水山蹇 雷水解 山泽损 风雷益 泽天夬 天风姤 泽地萃 地风升 泽水困 水风井 ' +
    '泽火革 火风鼎 震为雷 艮为山 风山渐 雷泽归妹 雷火丰 火山旅 巽为风 兑为泽 风水涣 水泽节 ' +
    '风泽中孚 雷山小过 水火既济 火水未济').split(' ');

  /* 白话大意（自撰参考语，非古籍原文） */
  const DUAN = [
    '乾为天|刚健中正，大通而利在守正。宜进取，忌骄盈。',
    '坤为地|厚德载物，柔顺承天。宜守静待时，忌争先。',
    '水雷屯|万物初生，艰难起步。宜守正待援，不宜躁进。',
    '山水蒙|蒙昧未开，求教则通。宜就明师，忌自专自是。',
    '水天需|云上于天，待时而动。宜蓄势养力，忌强求速成。',
    '天水讼|争讼之象，中吉终凶。宜和解退让，忌逞强斗胜。',
    '地水师|兴师众动，行险而顺。宜有节制，得众则吉。',
    '水地比|亲近辅佐，众心归附。宜择友结盟，忌孤行独断。',
    '风天小畜|小有积蓄，密云不雨。宜小步渐进，忌骤然大举。',
    '天泽履|履虎尾而亨，谨慎则安。宜守礼循分，忌轻率冒进。',
    '地天泰|天地交泰，上下通达。诸事顺遂，宜乘时而行。',
    '天地否|天地不交，闭塞不通。宜守静自守，待时转机。',
    '天火同人|与人同心，和同于野。宜协力合作，忌偏私结党。',
    '火天大有|大有收获，光明盛大。宜诚信待人，忌盈满自骄。',
    '地山谦|谦德受益，卑以自牧。宜退让自持，无往不利。',
    '雷地豫|顺动而悦，豫备则乐。宜安乐有备，忌耽于逸豫。',
    '泽雷随|随时随人，随而有获。宜顺势而为，忌盲目跟从。',
    '山风蛊|积弊生蛊，整治则治。宜革除旧弊，先难后易。',
    '地泽临|临下以德，居高而近。宜亲众施惠，须防后患。',
    '风地观|观仰风化，静而察之。宜审时观势，忌妄动轻举。',
    '火雷噬嗑|咬合除梗，刑罚明断。宜决断除障，忌姑息养患。',
    '山火贲|文饰之美，贲而少实。宜修其文饰，忌徒饰无本。',
    '山地剥|剥落衰败，阴盛阳消。宜守静自保，不宜有所往。',
    '地雷复|一阳来复，反本还元。宜复归正道，七日来复。',
    '天雷无妄|无妄而行，天佑其正。宜守正安分，忌妄求非分。',
    '山天大畜|大有蓄积，厚积待发。宜养贤蓄德，利涉大川。',
    '山雷颐|颐养之道，慎言节食。宜自养养人，忌贪求无度。',
    '泽风大过|阳盛过甚，栋梁将挠。宜非常之举，然须慎之。',
    '坎为水|重险习坎，维心亨通。宜守信不移，涉险须谨。',
    '离为火|附丽光明，柔顺则吉。宜依附正道，忌燥烈妄动。',
    '泽山咸|交感相应，两情相通。宜虚心相待，婚配则吉。',
    '雷风恒|恒久不变，守常则利。宜持之以恒，忌中途动摇。',
    '天山遁|退避隐遁，君子远害。宜全身而退，忌恋战不止。',
    '雷天大壮|阳刚壮盛，壮而守正。宜正用其壮，忌恃力妄为。',
    '火地晋|明出地上，进而有赏。宜进取向前，前程光明。',
    '地火明夷|明入地中，韬光养晦。宜内明外晦，守正待时。',
    '风火家人|家道正则天下定。宜和家守分，忌失序乱伦。',
    '火泽睽|睽违相背，异中求同。宜小事可为，忌强求大同。',
    '水山蹇|行止维艰，见险能止。宜择时而动，利西南不利东北。',
    '雷水解|险难解散，动而脱困。宜速图早解，迟则生变。',
    '山泽损|损下益上，损而有孚。宜减损私欲，终得大益。',
    '风雷益|损上益下，民悦无疆。宜施惠于人，利有攸往。',
    '泽天夬|决断去邪，扬于王庭。宜果决除患，忌优柔不断。',
    '天风姤|不期而遇，女壮勿娶。宜慎于交往，防阴长阳消。',
    '泽地萃|汇聚成群，聚而能通。宜聚众修备，忌涣散无主。',
    '地风升|积小成高，柔顺而升。宜循序而升，见大人则吉。',
    '泽水困|处困守正，言而不信。宜守志不移，静以待援。',
    '水风井|井养不穷，汲之则得。宜修己养人，慎守其瓶。',
    '泽火革|顺天应人，革故鼎新。宜因时变改，巳日乃孚。',
    '火风鼎|鼎新取象，调和致养。宜稳重取新，大吉而亨。',
    '震为雷|震惊百里，动而省惧。宜临事戒惧，可无丧匕鬯。',
    '艮为山|时止则止，不获其身。宜静守其分，忌妄行越位。',
    '风山渐|渐进有序，女归则吉。宜循序而进，忌躁急越次。',
    '雷泽归妹|归妹非正，征凶无攸利。宜守分自持，慎于婚配。',
    '雷火丰|丰大光明，日中则昃。宜盛时思危，守中持正。',
    '火山旅|旅居在外，小亨守贞。宜谨慎自持，忌轻率招祸。',
    '巽为风|顺入无碍，小亨而利。宜柔顺行事，利见大人。',
    '兑为泽|和悦相说，朋友讲习。宜以悦待人，守正则吉。',
    '风水涣|涣散离析，聚而可济。宜散小群，以成大事。',
    '水泽节|节制有度，苦节不可贞。宜适可而止，忌过与纵。',
    '风泽中孚|中心诚信，信及豚鱼。宜以诚感人，利涉大川。',
    '雷山小过|小有过越，可为小事。宜谦下守分，忌高飞远举。',
    '水火既济|事已成也，初吉终乱。宜守成防变，慎终如始。',
    '火水未济|事未成也，亨而待济。宜审慎续进，慎终则吉。'
  ];
  const DUAN_MAP = {};
  DUAN.forEach(s => { const i = s.indexOf('|'); DUAN_MAP[s.slice(0, i)] = s.slice(i + 1); });

  const HEX64 = {};
  const HEX_LIST = [];
  TRI.forEach((u, ui) => {
    TRI.forEach((l, li) => {
      const up = GUA_BY_ID[u], lo = GUA_BY_ID[l];
      const lines = lo.lines.concat(up.lines);            // 自下而上
      const key = lines.join('');
      const name = NAME_MATRIX[ui][li];
      const hex = {
        key, name, lines,
        no: SEQ.indexOf(name) + 1,
        upper: up, lower: lo,
        upperName: up.nature, lowerName: lo.nature,
        symbol: up.symbol + lo.symbol,
        duan: DUAN_MAP[name] || '',
        wx: up.wx
      };
      HEX64[key] = hex;
      HEX_LIST.push(hex);
    });
  });
  HEX_LIST.sort((a, b) => a.no - b.no);
  const HEX_BY_NAME = {};
  HEX_LIST.forEach(h => HEX_BY_NAME[h.name] = h);

  /* 变卦：动爻（自下而上 idx 数组）取反 */
  function bianGua(lines, dong) {
    const l = lines.slice();
    dong.forEach(i => { if (i >= 0 && i < 6) l[i] = l[i] ? 0 : 1; });
    return HEX64[l.join('')];
  }
  /* 互卦：取 2-4 爻为下卦、3-5 爻为上卦（自下而上编号 0-5） */
  function huGua(lines) {
    const key = [lines[1], lines[2], lines[3], lines[2], lines[3], lines[4]].join('');
    return HEX64[key];
  }
  /* 错卦 / 综卦 */
  function cuoGua(lines) { return HEX64[lines.map(x => x ? 0 : 1).join('')]; }
  function zongGua(lines) { return HEX64[lines.slice().reverse().join('')]; }

  /* ---------- 京房纳甲 ---------- */
  const NAJIA = {
    qian: { nei: ['甲子', '甲寅', '甲辰'], wai: ['壬午', '壬申', '壬戌'], wx: '金' },
    kun: { nei: ['乙未', '乙巳', '乙卯'], wai: ['癸丑', '癸亥', '癸酉'], wx: '土' },
    zhen: { nei: ['庚子', '庚寅', '庚辰'], wai: ['庚午', '庚申', '庚戌'], wx: '木' },
    xun: { nei: ['辛丑', '辛亥', '辛酉'], wai: ['辛未', '辛巳', '辛卯'], wx: '木' },
    kan: { nei: ['戊寅', '戊辰', '戊午'], wai: ['戊申', '戊戌', '戊子'], wx: '水' },
    li: { nei: ['己卯', '己丑', '己亥'], wai: ['己酉', '己未', '己巳'], wx: '火' },
    gen: { nei: ['丙辰', '丙午', '丙申'], wai: ['丙戌', '丙子', '丙寅'], wx: '土' },
    dui: { nei: ['丁巳', '丁卯', '丁丑'], wai: ['丁亥', '丁酉', '丁未'], wx: '金' }
  };
  /* 取某卦六爻纳甲（自下而上） */
  function najiaOf(lines) {
    const lo = GUA_BY_LINES[lines.slice(0, 3).join('')];
    const up = GUA_BY_LINES[lines.slice(3, 6).join('')];
    const interior = (up.id === lo.id) ? NAJIA[lo.id].nei.concat(NAJIA[lo.id].wai)
      : (lo.id === 'qian' || lo.id === 'kun' ? NAJIA[lo.id].nei.concat(NAJIA[up.id].wai)
        : NAJIA[lo.id].nei.concat(NAJIA[up.id].wai));
    // 乾坤为上下卦时以外卦纳甲为准（坤外卦自癸起）
    return interior.map(gz => ({
      gz, gan: gz[0], zhi: gz[1],
      wxGan: GAN_WX[GAN.indexOf(gz[0])],
      wxZhi: ZHI_WX[ZHI.indexOf(gz[1])],
      wx: ZHI_WX[ZHI.indexOf(gz[1])]
    }));
  }

  /* ---------- 京房八宫卦 + 世应 ---------- */
  const SHI_YING = {
    '本宫': [6, 3], '一世': [1, 4], '二世': [2, 5], '三世': [3, 6],
    '四世': [4, 1], '五世': [5, 2], '游魂': [4, 1], '归魂': [3, 6]
  };
  const BAGONG = {};   // key(lines) -> {gong, gongWx, type, shi, ying}
  BAGUA.forEach(g => {
    const base = g.lines.concat(g.lines);
    const seq = [];
    const mk = (l, type) => seq.push({ lines: l.slice(), type });
    mk(base, '本宫');
    /* 一世至五世：自初爻起逐爻累积变之 */
    let cur = base.slice();
    const names = ['一世', '二世', '三世', '四世', '五世'];
    for (let i = 0; i < 5; i++) { cur = cur.slice(); cur[i] = cur[i] ? 0 : 1; mk(cur, names[i]); }
    /* 游魂：五世卦再变第四爻；归魂：游魂卦下三爻复归本宫 */
    const youhun = cur.slice(); youhun[3] = youhun[3] ? 0 : 1; mk(youhun, '游魂');
    const guihun = youhun.slice(); guihun[0] = base[0]; guihun[1] = base[1]; guihun[2] = base[2]; mk(guihun, '归魂');
    seq.forEach(s => {
      const key = s.lines.join('');
      const sy = SHI_YING[s.type];
      BAGONG[key] = { gong: g.name, gongId: g.id, gongWx: g.wx, type: s.type, shi: sy[0], ying: sy[1] };
    });
  });

  /* 六神（六兽）：依日干起 */
  const LIUSHEN = ['青龙', '朱雀', '勾陈', '螣蛇', '白虎', '玄武'];
  function liuShenOf(dayGanIdx) {
    const start = [0, 0, 1, 1, 2, 3, 4, 4, 5, 5][dayGanIdx];   // 甲乙青龙 丙丁朱雀 戊勾陈 己螣蛇 庚辛白虎 壬癸玄武
    return [0, 1, 2, 3, 4, 5].map(i => LIUSHEN[(start + i) % 6]);
  }

  /* ---------- 六十四卦完整装卦（六爻用） ---------- */
  function zhuangGua(lines, dayGanIdx, dayZhiIdx) {
    const hex = HEX64[lines.join('')];
    const bg = BAGONG[lines.join('')] || { gong: '—', gongWx: '土', type: '—', shi: 1, ying: 4 };
    const nj = najiaOf(lines);
    const shen = dayGanIdx === undefined ? null : liuShenOf(dayGanIdx);
    const yaos = lines.map((v, i) => {
      const zhi = nj[i].zhi, gz = nj[i].gz;
      const zhiIdx = ZHI.indexOf(zhi);
      return {
        pos: i + 1,
        yang: !!v,
        gz, gan: nj[i].gan, zhi,
        wx: ZHI_WX[zhiIdx],
        qin: liuQin(bg.gongWx, ZHI_WX[zhiIdx]),
        shen: shen ? shen[i] : '',
        shi: bg.shi === i + 1, ying: bg.ying === i + 1,
        kong: dayZhiIdx !== undefined ? false : false
      };
    });
    return { hex, bg, yaos };
  }

  /* 伏神：本卦六亲不全时，从本宫卦同位取 */
  function fuShen(lines, dayGanIdx, dayZhiIdx) {
    const cur = zhuangGua(lines, dayGanIdx, dayZhiIdx);
    const have = new Set(cur.yaos.map(y => y.qin));
    const need = ['父母', '兄弟', '子孙', '妻财', '官鬼'].filter(q => !have.has(q));
    if (!need.length) return [];
    const gongId = cur.bg.gongId;
    const gongHex = GUA_BY_ID[gongId].lines.concat(GUA_BY_ID[gongId].lines);
    const nj = najiaOf(gongHex);
    const out = [];
    cur.yaos.forEach((y, i) => {
      const zhi = nj[i].zhi, wx = ZHI_WX[ZHI.indexOf(zhi)];
      const qin = liuQin(cur.bg.gongWx, wx);
      if (need.indexOf(qin) >= 0 && !out.some(o => o.qin === qin)) {
        out.push({ pos: i + 1, qin, gz: nj[i].gz, zhi, wx });
      }
    });
    return out;
  }

  /* ---------- 小六壬六宫 ---------- */
  const XIAOLIU = [
    { name: '大安', wx: '木', luck: '吉', pos: '东方', body: '青龙', poem: '大安事事昌，求财在坤方，失物去不远，宅舍保平安。', jie: '身不动，事安稳。宜守成、宜静守，凡事平和，谋事可成，行人即至，病者无妨。' },
    { name: '留连', wx: '水', luck: '凶', pos: '南方', body: '玄武', poem: '留连事难成，求谋日未明，官事只宜缓，去者未回程。', jie: '事难成就，纠缠拖延。宜缓图、宜等待，急则生变，凡事迟滞反复。' },
    { name: '速喜', wx: '火', luck: '吉', pos: '南方', body: '朱雀', poem: '速喜喜来临，求财向南行，失物申未午，逢人路上寻。', jie: '喜事速至，消息即来。宜速行、宜主动，谋事多成，求财得利，行人立至。' },
    { name: '赤口', wx: '金', luck: '凶', pos: '西方', body: '白虎', poem: '赤口主口舌，官非切要防，失物急去寻，行人有惊慌。', jie: '口舌是非，官讼惊恐。宜谨言、宜避争，防小人暗算，不宜远行。' },
    { name: '小吉', wx: '木', luck: '吉', pos: '东方', body: '六合', poem: '小吉最吉昌，路上好商量，阴人来报喜，失物在坤方。', jie: '和合吉祥，凡事顺遂。宜合作、宜托人，谋望皆成，婚姻和合，行人即至。' },
    { name: '空亡', wx: '土', luck: '大凶', pos: '中央', body: '勾陈', poem: '空亡事不长，阴人多乖张，求财无利益，行人有灾殃。', jie: '落空无成，劳而无功。宜止、宜守，谋事多虚，求财不得，凡事不宜妄动。' }
  ];

  /* ---------- 大六壬：十二天将 / 贵人 ---------- */
  const TIAN_JIANG = ['贵人', '螣蛇', '朱雀', '六合', '勾陈', '青龙', '天空', '白虎', '太常', '玄武', '太阴', '天后'];
  const JIANG_DESC = {
    贵人: '尊贵扶助，得贵人提携，宜谒见求托。', 螣蛇: '虚惊怪异，缠绕不安，防惊恐虚诈。',
    朱雀: '文书口舌，消息是非，宜文书不利争讼。', 六合: '和合婚姻，交易成就，凡事得中介之力。',
    勾陈: '田土勾连，迟滞争讼，事多牵绊。', 青龙: '财喜吉庆，进财添丁，谋事得利。',
    天空: '虚妄不实，事多落空，防欺诳诈伪。', 白虎: '凶丧道路，疾病伤残，防血光争斗。',
    太常: '衣食宴乐，平稳和顺，宜婚嫁宴请。', 玄武: '盗贼暗昧，失脱欺瞒，防盗窃阴私。',
    太阴: '阴私暗助，妇女之事，宜暗中谋划。', 天后: '妇女恩泽，婚配孕育，主阴人扶持。'
  };
  /* 贵人：甲戊庚牛羊、乙己鼠猴乡、丙丁猪鸡位、壬癸兔蛇藏、六辛逢马虎 */
  const GUI_REN = { 甲: ['丑', '未'], 戊: ['丑', '未'], 庚: ['丑', '未'], 乙: ['子', '申'], 己: ['子', '申'], 丙: ['亥', '酉'], 丁: ['亥', '酉'], 壬: ['卯', '巳'], 癸: ['卯', '巳'], 辛: ['午', '寅'] };
  /* 日干寄宫 */
  const JI_GONG = { 甲: '寅', 乙: '辰', 丙: '巳', 丁: '未', 戊: '巳', 己: '未', 庚: '申', 辛: '戌', 壬: '亥', 癸: '丑' };
  /* 地支六亲在壬课中的十神（日干为我） */
  const ZHAN_ZHONG = {
    子: '神后', 丑: '大吉', 寅: '功曹', 卯: '太冲', 辰: '天罡', 巳: '太乙',
    午: '胜光', 未: '小吉', 申: '传送', 酉: '从魁', 戌: '河魁', 亥: '登明'
  };

  /* ---------- 太乙：十六神 ---------- */
  const TAIYI_SHEN = ['地主', '阳德', '和德', '吕申', '高丛', '太阳', '太炅', '大神', '大威', '天道', '大武', '武德', '太簇', '阴主', '阴德', '大义'];

  /* ---------- 建除十二神（择日） ---------- */
  const JIANCHU = ['建', '除', '满', '平', '定', '执', '破', '危', '成', '收', '开', '闭'];
  const JIANCHU_DESC = {
    建: '万物生育，宜出行赴任、祈福求嗣。', 除: '除旧布新，宜扫舍疗病、解除厄难。',
    满: '丰盈圆满，宜祭祀祈福，忌动土服药。', 平: '平常安稳，宜修饰垣墙、平治道涂。',
    定: '安定守成，宜宴乐协议，忌诉讼远行。', 执: '执持坚固，宜捕捉造作，忌开市出行。',
    破: '破败大耗，宜破屋坏垣，余事不宜。', 危: '危险不安，宜安床祭祀，忌登高远行。',
    成: '成就结纳，宜开市嫁娶、入学求医。', 收: '收获纳财，宜纳财进人口，忌开仓放债。',
    开: '开通顺畅，宜祈福开市，忌安葬上任。', 闭: '闭塞收藏，宜筑堤埋穴，忌开市出行。'
  };

  /* ---------- 二十四山 ---------- */
  const SHAN24 = ['壬', '子', '癸', '丑', '艮', '寅', '甲', '卯', '乙', '辰', '巽', '巳',
    '丙', '午', '丁', '未', '坤', '申', '庚', '酉', '辛', '戌', '乾', '亥'];
  const SHAN24_WX = {
    壬: '水', 子: '水', 癸: '水', 丑: '土', 艮: '土', 寅: '木', 甲: '木', 卯: '木', 乙: '木', 辰: '土', 巽: '木', 巳: '火',
    丙: '火', 午: '火', 丁: '火', 未: '土', 坤: '土', 申: '金', 庚: '金', 酉: '金', 辛: '金', 戌: '土', 乾: '金', 亥: '水'
  };
  const SHAN24_DIR = (i) => ((((i - 1) * 15) % 360) + 360) % 360;   // 子山中心为正北 0°（表首为壬山，居 345°）

  /* ---------- 二十八宿 ---------- */
  const XIU28 = ['角', '亢', '氐', '房', '心', '尾', '箕', '斗', '牛', '女', '虚', '危', '室', '壁',
    '奎', '娄', '胃', '昴', '毕', '觜', '参', '井', '鬼', '柳', '星', '张', '翼', '轸'];

  /* ---------- 常用时辰选项 ---------- */
  function hourOptions(sel) {
    return HOURS.map(h => ({ v: String(h.idx), t: h.zhi + '时 ' + h.range, sel: sel === h.idx }));
  }

  /* ---------- 导出 ---------- */
  C.WX = WX; C.WX_COLOR = WX_COLOR; C.wxSheng = wxSheng; C.wxKe = wxKe; C.wxRelation = wxRelation; C.liuQin = liuQin;
  C.GAN = GAN; C.ZHI = ZHI; C.GAN_WX = GAN_WX; C.GAN_YY = GAN_YY; C.ZHI_WX = ZHI_WX; C.ZHI_YY = ZHI_YY;
  C.SHENGXIAO = SHENGXIAO; C.ZHI_CANGGAN = ZHI_CANGGAN; C.HOURS = HOURS; C.hourOptions = hourOptions;
  C.LIU_HE = LIU_HE; C.LIU_CHONG = LIU_CHONG; C.SAN_HE = SAN_HE; C.LIU_HAI = LIU_HAI; C.SAN_XING = SAN_XING;
  C.isLiuHe = isLiuHe; C.isLiuChong = isLiuChong; C.sanHeGroup = sanHeGroup;
  C.SHISHEN = SHISHEN; C.shiShen = shiShen; C.CHANGSHENG_NAMES = CHANGSHENG_NAMES; C.changSheng = changSheng;
  C.BAGUA = BAGUA; C.GUA_BY_ID = GUA_BY_ID; C.GUA_BY_NAME = GUA_BY_NAME; C.GUA_BY_LINES = GUA_BY_LINES;
  C.XIANTIAN = XIANTIAN; C.HOUTIAN = HOUTIAN; C.LUOSHU = LUOSHU; C.GONG_POS = GONG_POS; C.GONG_ORDER = GONG_ORDER;
  C.MEN_AT_GONG = MEN_AT_GONG; C.MEN_ORDER = MEN_ORDER; C.XING_AT_GONG = XING_AT_GONG; C.XING_ORDER = XING_ORDER;
  C.SHEN_ORDER = SHEN_ORDER; C.YIQI_ORDER = YIQI_ORDER;
  C.GONG_NAME = GONG_NAME; C.GONG_GUA = GONG_GUA; C.GONG_DIR = GONG_DIR;
  C.HEX64 = HEX64; C.HEX_LIST = HEX_LIST; C.HEX_BY_NAME = HEX_BY_NAME; C.bianGua = bianGua; C.huGua = huGua;
  C.cuoGua = cuoGua; C.zongGua = zongGua;
  C.NAJIA = NAJIA; C.najiaOf = najiaOf; C.BAGONG = BAGONG; C.SHI_YING = SHI_YING;
  C.LIUSHEN = LIUSHEN; C.liuShenOf = liuShenOf; C.zhuangGua = zhuangGua; C.fuShen = fuShen;
  C.XIAOLIU = XIAOLIU; C.TIAN_JIANG = TIAN_JIANG; C.JIANG_DESC = JIANG_DESC; C.GUI_REN = GUI_REN;
  C.JI_GONG = JI_GONG; C.ZHAN_ZHONG = ZHAN_ZHONG; C.TAIYI_SHEN = TAIYI_SHEN;
  C.JIANCHU = JIANCHU; C.JIANCHU_DESC = JIANCHU_DESC;
  C.SHAN24 = SHAN24; C.SHAN24_WX = SHAN24_WX; C.SHAN24_DIR = SHAN24_DIR; C.XIU28 = XIU28;
})(window.CORE);
