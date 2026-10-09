/* ============================================================
   术数专用表：奇门遁甲 / 紫微斗数 / 八宅 / 玄空飞星 / 塔罗 / 卢恩
   易错处一律写成函数，调用即得，勿手抄。
   ============================================================ */
window.CORE = window.CORE || {};

(function (C) {
  'use strict';

  /* ============================================================
     一、奇门遁甲（时家 · 转盘）
     ============================================================ */
  /* 二十四节气三元局数：[上元, 中元, 下元]；冬至→芒种 阳遁，夏至→大雪 阴遁 */
  const QIMEN_JU = {
    冬至: [1, 7, 4], 小寒: [2, 8, 5], 大寒: [3, 9, 6], 立春: [8, 5, 2],
    雨水: [9, 6, 3], 惊蛰: [1, 7, 4], 春分: [3, 9, 6], 清明: [4, 1, 7],
    谷雨: [5, 2, 8], 立夏: [4, 1, 7], 小满: [5, 2, 8], 芒种: [6, 3, 9],
    夏至: [9, 3, 6], 小暑: [8, 2, 5], 大暑: [7, 1, 4], 立秋: [2, 5, 8],
    处暑: [1, 4, 7], 白露: [9, 3, 6], 秋分: [7, 1, 4], 寒露: [6, 9, 3],
    霜降: [5, 8, 2], 立冬: [6, 9, 3], 小雪: [5, 8, 2], 大雪: [4, 7, 1]
  };
  const YANG_TERMS = ['冬至', '小寒', '大寒', '立春', '雨水', '惊蛰', '春分', '清明', '谷雨', '立夏', '小满', '芒种'];
  /* 外围八宫顺时针序（后天八卦方位） */
  const RING = [1, 8, 3, 4, 9, 2, 7, 6];
  /* 洛书九宫飞泊序 */
  const FLY = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  /* 八门 / 八神 / 八星 沿 RING 的固定顺序 */
  const MEN_RING = { 1: '休门', 8: '生门', 3: '伤门', 4: '杜门', 9: '景门', 2: '死门', 7: '惊门', 6: '开门' };
  const XING_RING = { 1: '天蓬', 8: '天任', 3: '天冲', 4: '天辅', 9: '天英', 2: '天芮', 7: '天柱', 6: '天心', 5: '天禽' };

  const QIMEN = {
    JU: QIMEN_JU,
    RING, FLY,
    MEN_RING, XING_RING,
    isYang(termName) { return YANG_TERMS.indexOf(termName) >= 0; },
    /* 由节气与三元取局 */
    ju(termName, yuanK) { const a = QIMEN_JU[termName]; return a ? a[yuanK] : 1; },
    /* 阴阳遁：+1 阳遁，-1 阴遁 */
    dun(termName) { return this.isYang(termName) ? 1 : -1; },
    /* 地盘三奇六仪：返回 { 宫数: 天干 } */
    earthPlate(ju, dun) {
      const idx = FLY.indexOf(ju);
      const map = {};
      C.YIQI_ORDER.forEach((gan, i) => {
        const g = FLY[(((idx + i * dun) % 9) + 9) % 9];
        map[g] = gan;
      });
      return map;
    },
    /* 由地盘干反查宫 */
    gongOfGan(plate, gan) { for (const g in plate) if (plate[g] === gan) return Number(g); return 5; },
    /* 九宫飞星（洛书飞泊，用于玄空紫白年、月、运盘）：中宫星 → 各宫星
       洛书飞泊次序：中五 → 乾六 → 兑七 → 艮八 → 离九 → 坎一 → 坤二 → 震三 → 巽四；
       dir=1 顺飞、dir=-1 逆飞。星值随步递增（逆飞则沿反序之宫）。
       注意：与奇门地盘三奇六仪的「按宫数顺布」（earthPlate）不同，二者不可混用。 */
    LUOSHU_PATH: [5, 6, 7, 8, 9, 1, 2, 3, 4],
    feiXing(centerStar, dir) {
      const d = (dir === -1) ? -1 : 1;
      /* 逆飞：中宫仍居中，其后依洛书反序行（中→巽→震→坤→坎→离→艮→兑→乾） */
      const path = (d === 1) ? this.LUOSHU_PATH
        : [this.LUOSHU_PATH[0]].concat(this.LUOSHU_PATH.slice(1).reverse());
      const map = {};
      path.forEach((g, i) => {
        let k = ((centerStar - 1 + i) % 9 + 9) % 9;
        map[g] = k + 1;
      });
      return map;
    },
    /* 完整时家转盘排局
       opts: { term, yuanK, xunShouGan(旬首之仪，如甲子旬为戊), hourGan(时干),
               hourSteps(本旬第几个时辰 0..9), hourZhiIdx(时支) } */
    pan(opts) {
      const term = opts.term, yuanK = opts.yuanK;
      const ju = opts.ju || this.ju(term, yuanK);
      const dun = (opts.dun !== undefined) ? opts.dun : this.dun(term);
      const earth = this.earthPlate(ju, dun);
      const hourSteps = opts.hourSteps || 0;

      /* 值符：旬首之仪所落之宫的本宫九星；该宫原始八门即值使门 */
      let fuGongRaw = this.gongOfGan(earth, opts.xunShouGan);
      const fuXing = (fuGongRaw === 5) ? '天禽' : XING_RING[fuGongRaw];
      const shiMenSrc = (fuGongRaw === 5) ? '死门' : MEN_RING[fuGongRaw];   // 中宫寄坤二宫
      const fuGong = (fuGongRaw === 5) ? 2 : fuGongRaw;

      /* 天盘值符加临：时干所落之宫（落中宫者亦寄坤二） */
      let shiGanGong = this.gongOfGan(earth, opts.hourGan);
      if (shiGanGong === 5) shiGanGong = 2;

      const p0 = RING.indexOf(fuGong), pt = RING.indexOf(shiGanGong);
      const shift = ((pt - p0) % 8 + 8) % 8;
      const sky = {}, skyGan = {};
      RING.forEach((g, p) => {
        const src = RING[((p - shift) % 8 + 8) % 8];
        sky[g] = XING_RING[src];
        skyGan[g] = earth[src];
      });

      /* 八门：值使门自旬首宫起，依阳顺阴逆沿九宫飞泊，数至本旬第 hourSteps 个时辰 */
      const landGongRaw = FLY[(((FLY.indexOf(fuGong) + hourSteps * dun) % 9) + 9) % 9];
      let landPos = RING.indexOf(landGongRaw);
      const landGong = landPos < 0 ? 2 : landGongRaw;                 // 落中宫者寄坤二
      if (landPos < 0) landPos = RING.indexOf(2);
      const men = {};
      RING.forEach((g, p) => { men[g] = MEN_RING[RING[((p - landPos) % 8 + 8) % 8]]; });

      /* 八神：值符起于天盘值符所临之宫，阳遁顺布、阴遁逆布 */
      const fuLand = RING.indexOf(shiGanGong);
      const shen = {};
      RING.forEach((g, p) => {
        let k = ((p - fuLand) * dun) % 8; if (k < 0) k += 8;
        shen[g] = C.SHEN_ORDER[k];
      });

      /* 驿马：申子辰马在寅、寅午戌马在申、巳酉丑马在亥、亥卯未马在巳（以时支取） */
      const maZhiIdx = { 0: 2, 4: 2, 8: 2, 2: 8, 6: 8, 10: 8, 5: 11, 9: 11, 1: 11, 11: 5, 3: 5, 7: 5 }[opts.hourZhiIdx];

      return {
        term, yuan: ['上元', '中元', '下元'][yuanK], ju, dun,
        dunName: dun === 1 ? '阳遁' : '阴遁',
        earth, sky, skyGan, men, shen,
        fuXing, shiMen: shiMenSrc, fuGong, shiGanGong,
        zhiShiGong: landGong,
        ma: { zhi: C.ZHI[maZhiIdx], gong: ZHI_GONG[maZhiIdx] },
        ring: RING
      };
    }
  };

  /* ============================================================
     二、紫微斗数（基础表）
     ============================================================ */
  const ZIWEI_PALACES = ['命宫', '兄弟', '夫妻', '子女', '财帛', '疾厄', '迁移', '交友', '官禄', '田宅', '福德', '父母'];
  /* 十四主星：星系、五行、性质 */
  const ZIWEI_MAIN = {
    紫微: { xi: '紫微系', wx: '土', xing: '尊贵之曜，主统御、才器、孤高。', miao: '庙' },
    天机: { xi: '紫微系', wx: '木', xing: '智慧之星，主机变、谋略、多思。', miao: '庙' },
    太阳: { xi: '紫微系', wx: '火', xing: '贵显之星，主声名、博爱、付出。', miao: '庙' },
    武曲: { xi: '紫微系', wx: '金', xing: '财帛之星，主财权、刚毅、决断。', miao: '庙' },
    天同: { xi: '紫微系', wx: '水', xing: '福寿之星，主和顺、享受、懒散。', miao: '庙' },
    廉贞: { xi: '紫微系', wx: '火', xing: '次桃花，主才艺、纠葛、刚柔并济。', miao: '平' },
    天府: { xi: '天府系', wx: '土', xing: '财库之星，主稳重、保守、厚积。', miao: '庙' },
    太阴: { xi: '天府系', wx: '水', xing: '阴柔之星，主母妻、田宅、内敛。', miao: '庙' },
    贪狼: { xi: '天府系', wx: '木', xing: '桃花之星，主欲望、才艺、交际。', miao: '平' },
    巨门: { xi: '天府系', wx: '水', xing: '暗曜，主口舌、是非、钻研。', miao: '旺' },
    天相: { xi: '天府系', wx: '水', xing: '印绶之星，主辅佐、公正、随和。', miao: '庙' },
    天梁: { xi: '天府系', wx: '土', xing: '荫星，主庇佑、老成、清高。', miao: '庙' },
    七杀: { xi: '天府系', wx: '金', xing: '将星，主肃杀、闯荡、刚烈。', miao: '旺' },
    破军: { xi: '天府系', wx: '水', xing: '耗星，主开创、破旧、变动。', miao: '旺' }
  };
  /* 紫微星系：相对紫微宫逆行的偏移量 */
  const ZIWEI_SERIES = [['紫微', 0], ['天机', 1], ['太阳', 3], ['武曲', 4], ['天同', 5], ['廉贞', 8]];
  /* 天府星系：相对天府宫顺行的偏移量 */
  const TIANFU_SERIES = [['天府', 0], ['太阴', 1], ['贪狼', 2], ['巨门', 3], ['天相', 4], ['天梁', 5], ['七杀', 6], ['破军', 10]];
  const ZIWEI_WXJU = { 水: { name: '水二局', n: 2 }, 木: { name: '木三局', n: 3 }, 金: { name: '金四局', n: 4 }, 土: { name: '土五局', n: 5 }, 火: { name: '火六局', n: 6 } };
  /* 安紫微星 —— 《紫微斗数全书》"六五四三二，酉午亥辰丑，局数除日数，商数宫前走；
     若见数无余，便要起虎口；日数小于局，还直宫中守。"
     与开源实现（iztro / dart_iztro）一致，并以原书三例校验通过：
     27日木三局→戌、13日火六局→亥、6日土五局→未。返回 子=0…亥=11 */
  function ziweiPos(juNum, lunarDay) {
    let offset = -1, quotient = 0, remainder = -1;
    do {
      offset++;
      const divisor = lunarDay + offset;
      quotient = Math.floor(divisor / juNum);
      remainder = divisor % juNum;
    } while (remainder !== 0 && offset < 40);
    let z = (quotient % 12) - 1;                     // 以寅宫为 0
    z += (offset % 2 === 0) ? offset : -offset;
    z = ((z % 12) + 12) % 12;
    return (z + 2) % 12;                             // 转 子=0 序
  }
  /* 天府常对紫微：丑卯相更迭、未酉互为根、午戌、子辰、巳亥、同位寅申 */
  function tianfuPos(ziweiIdx) { return (((4 - ziweiIdx) % 12) + 12) % 12; }
  /* 命宫身宫：寅起正月顺数生月，自生月宫起子时，逆至生时为命宫，顺至生时为身宫 */
  function mingShen(lunarMonth, hourIdx) {
    const base = (2 + ((lunarMonth - 1) % 12 + 12) % 12) % 12;
    return { ming: ((base - hourIdx) % 12 + 12) % 12, shen: ((base + hourIdx) % 12 + 12) % 12 };
  }
  /* 地支步进：自某支起，走 n 步（dir=1 顺行 子→丑→…，-1 逆行） */
  function stepZhi(startZhiName, n, dir) {
    const i = C.ZHI.indexOf(startZhiName);
    return C.ZHI[(((i + n * (dir || 1)) % 12) + 12) % 12];
  }
  /* 禄存：甲寅乙卯丙戊巳、丁己午、庚申辛酉壬亥癸子 */
  const LUCUN = { 甲: '寅', 乙: '卯', 丙: '巳', 丁: '午', 戊: '巳', 己: '午', 庚: '申', 辛: '酉', 壬: '亥', 癸: '子' };
  /* 四化：年干 → [化禄, 化权, 化科, 化忌] */
  const SIHUA = {
    甲: ['廉贞', '破军', '武曲', '太阳'], 乙: ['天机', '天梁', '紫微', '太阴'],
    丙: ['天同', '天机', '文昌', '廉贞'], 丁: ['太阴', '天同', '天机', '巨门'],
    戊: ['贪狼', '太阴', '右弼', '天机'], 己: ['武曲', '贪狼', '天梁', '文曲'],
    庚: ['太阳', '武曲', '太阴', '天同'], 辛: ['巨门', '太阳', '文曲', '文昌'],
    壬: ['天梁', '紫微', '左辅', '武曲'], 癸: ['破军', '巨门', '太阴', '贪狼']
  };
  /* 五行局长生位（水二申、木三亥、金四巳、土五申、火六寅） */
  const WXJU_CHANGSHENG = { 2: '申', 3: '亥', 4: '巳', 5: '申', 6: '寅' };
  const MINGZHU = { 子: '贪狼', 丑: '巨门', 寅: '禄存', 卯: '文曲', 辰: '廉贞', 巳: '武曲', 午: '破军', 未: '武曲', 申: '廉贞', 酉: '文曲', 戌: '禄存', 亥: '巨门' };
  const SHENZHU = { 子: '火星', 丑: '天相', 寅: '天梁', 卯: '天同', 辰: '文昌', 巳: '天机', 午: '火星', 未: '天相', 申: '天梁', 酉: '天同', 戌: '文昌', 亥: '天机' };
  /* 安时系诸星（口诀）：文昌戌上起子逆至生时、文曲辰上起子顺至生时、
     地劫亥上起子顺行、地空亥上起子逆行 */
  const HOUR_STARS = [
    { name: '文昌', start: '戌', dir: -1 }, { name: '文曲', start: '辰', dir: 1 },
    { name: '地劫', start: '亥', dir: 1 }, { name: '地空', start: '亥', dir: -1 }
  ];
  /* 安月系诸星：左辅辰上起正月顺行至生月、右弼戌上起正月逆行至生月 */
  const MONTH_STARS = [
    { name: '左辅', start: '辰', dir: 1 }, { name: '右弼', start: '戌', dir: -1 }
  ];
  /* 火铃：寅午戌人丑卯、申子辰人寅戌、亥卯未人酉戌、巳酉丑人卯戌；再自该宫起子时顺至生时 */
  const HUO_LING_START = { 寅: ['丑', '卯'], 午: ['丑', '卯'], 戌: ['丑', '卯'], 申: ['寅', '戌'], 子: ['寅', '戌'], 辰: ['寅', '戌'], 亥: ['酉', '戌'], 卯: ['酉', '戌'], 未: ['酉', '戌'], 巳: ['卯', '戌'], 酉: ['卯', '戌'], 丑: ['卯', '戌'] };

  /* ============================================================
     三、八宅游年（大游年歌）
     ============================================================ */
  const DAYOUNIAN = {
    乾: '六天五祸绝延生', 坎: '五天生延绝祸六', 艮: '六绝祸生延天五', 震: '延生祸绝五天六',
    巽: '天五六祸生绝延', 离: '六五绝延祸生天', 坤: '天延绝生祸五六', 兑: '生祸延绝六五天'
  };
  const YOU_NIAN_CODE = { 生: '生气', 天: '天医', 延: '延年', 伏: '伏位', 绝: '绝命', 五: '五鬼', 六: '六煞', 祸: '祸害' };
  const YOU_NIAN_LUCK = { 生气: '大吉', 天医: '吉', 延年: '吉', 伏位: '小吉', 祸害: '凶', 六煞: '凶', 五鬼: '大凶', 绝命: '大凶' };
  const HOUTIAN_RING = ['kan', 'gen', 'zhen', 'xun', 'li', 'kun', 'dui', 'qian'];   // 后天八卦顺时针
  function youNian(mingGuaName) {
    const ring = HOUTIAN_RING.slice();
    const selfIdx = ring.findIndex(id => C.GUA_BY_ID[id].name === mingGuaName);
    const codes = DAYOUNIAN[mingGuaName].split('');
    const res = {};
    for (let i = 0; i < 7; i++) {
      const id = ring[(selfIdx + 1 + i) % 8];
      res[id] = { code: codes[i], name: YOU_NIAN_CODE[codes[i]], luck: YOU_NIAN_LUCK[YOU_NIAN_CODE[codes[i]]] };
    }
    res[ring[selfIdx]] = { code: '伏', name: '伏位', luck: '小吉' };
    return res;
  }
  /* 命卦（男女命卦）：以生年四位数字和归九 ——
     男命 = 11 − 数字和，女命 = 4 + 数字和；过 9 减 9 得 1..9 之数，五寄男坤女艮。
     校验：1990 男 → 坎、1984 男 → 兑、1990 女 → 艮 */
  function mingGua(year, gender) {
    const male = (gender === 'male' || gender === '男');
    let sum = 0, y = Math.abs(parseInt(year, 10) || 0);
    while (y > 0) { sum += y % 10; y = Math.floor(y / 10); }
    let n = sum % 9; if (n === 0) n = 9;
    let k = male ? (11 - n) : (4 + n);
    k = ((k - 1) % 9 + 9) % 9 + 1;
    if (k === 5) k = male ? 2 : 8;                    // 五寄：男坤女艮
    const map = { 1: '坎', 2: '坤', 3: '震', 4: '巽', 6: '乾', 7: '兑', 8: '艮', 9: '离' };
    return map[k] || '坎';
  }

  /* ============================================================
     四、玄空飞星 / 三元九运
     ============================================================ */
  const JIU_XING = ['一白贪狼', '二黑巨门', '三碧禄存', '四绿文曲', '五黄廉贞', '六白武曲', '七赤破军', '八白左辅', '九紫右弼'];
  const XING_WX = { 1: '水', 2: '土', 3: '木', 4: '木', 5: '土', 6: '金', 7: '金', 8: '土', 9: '火' };
  const XING_LUCK = { 1: '吉', 2: '凶', 3: '凶', 4: '吉', 5: '大凶', 6: '吉', 7: '凶', 8: '吉', 9: '吉' };
  /* 年飞星（紫白）：以生年四位数字和归九 —— 年星 = 11 − 数字和，过 9 者减 9
     校验：1864 一白（上元甲子一白起）、1984 七赤、2000 九紫、2023 四绿、2024 三碧、2025 二黑 */
  function yearStar(year) {
    let sum = 0, y = Math.abs(parseInt(year, 10) || 0);
    while (y > 0) { sum += y % 10; y = Math.floor(y / 10); }
    let k = ((11 - sum) % 9 + 9) % 9;
    return k === 0 ? 9 : k;
  }
  /* 月飞星：子午卯酉年正月八白、辰戌丑未年正月五黄、寅申巳亥年正月二黑，逐月「逆行」
     校验：2024（甲辰）正月五黄、二月四绿、三月三碧；2023（癸卯）正月八白 */
  function monthStar(year, lunarMonth) {
    const yz = ((year - 4) % 12 + 12) % 12;          // 年支
    const base = [8, 5, 2, 8, 5, 2, 8, 5, 2, 8, 5, 2][yz];
    let k = ((base - 1 - (lunarMonth - 1)) % 9 + 9) % 9;
    return k + 1;
  }

  /* ============================================================
     五、其余术数通用小表
     ============================================================ */
  /* 地支 → 后天八卦宫（用于马星、方位类判断） */
  const ZHI_GONG = { 0: 1, 1: 8, 2: 8, 3: 3, 4: 4, 5: 4, 6: 9, 7: 2, 8: 2, 9: 7, 10: 6, 11: 6 };
  /* 十二消息卦（配十二月建） */
  const XIAOXI_GUA = ['地雷复', '地泽临', '地天泰', '雷天大壮', '泽天夬', '乾为天', '天风姤', '天山遁', '天地否', '风地观', '山地剥', '坤为地'];
  /* 六十甲子旬空 */
  function xunKong(gzIdx) {
    const shou = gzIdx - (gzIdx % 10);
    return [C.ZHI[(shou % 12 + 10) % 12], C.ZHI[(shou % 12 + 11) % 12]];
  }

  /* 导出 */
  C.QIMEN = QIMEN;
  C.ZHI_GONG = ZHI_GONG;
  C.XIAOXI_GUA = XIAOXI_GUA;
  C.xunKong = xunKong;
  C.ZIWEI = {
    PALACES: ZIWEI_PALACES, MAIN: ZIWEI_MAIN, SERIES: ZIWEI_SERIES, TIANFU_SERIES: TIANFU_SERIES,
    WXJU: ZIWEI_WXJU, ziweiPos, tianfuPos, mingShen, stepZhi,
    LUCUN, SIHUA, WXJU_CHANGSHENG, MINGZHU, SHENZHU, HOUR_STARS, MONTH_STARS, HUO_LING_START
  };
  C.BAZHAI = { DAYOUNIAN, CODE: YOU_NIAN_CODE, LUCK: YOU_NIAN_LUCK, RING: HOUTIAN_RING, youNian, mingGua };
  C.XUANKONG = { JIU_XING, XING_WX, XING_LUCK, yearStar, monthStar };
})(window.CORE);
