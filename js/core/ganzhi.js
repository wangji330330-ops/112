/* ============================================================
   干支历引擎 —— 儒略日 / 真太阳黄经定节气 / 四柱 / 旬空 / 月将
   精度说明：太阳视黄经采用 Meeus 低精度公式（约 0.01°），
   节气时刻误差通常在一至数分钟量级（例：2024 立春实为 16:26:53，本引擎算得 16:21），
   足供术数排盘使用；若出生时刻恰在节气前后数分钟内，年月柱可能有一柱之差，宜人工复核。
   时间基准：默认以本机本地时间（即用户所填时刻）为墙上时间；传 {utc:true,tz:8} 则按东八区读。
   ============================================================ */
window.CORE = window.CORE || {};

(function (C) {
  'use strict';

  const RAD = Math.PI / 180;

  /* ---------- 儒略日 ---------- */
  function jdnFromYMD(y, m, d) {
    const a = Math.floor((14 - m) / 12);
    const yy = y + 4800 - a;
    const mm = m + 12 * a - 3;
    return d + Math.floor((153 * mm + 2) / 5) + 365 * yy + Math.floor(yy / 4)
      - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045;
  }
  /* 含小时小数的儒略日（以 0 时为本日整数） */
  function jdFromYMDH(y, m, d, h) {
    return jdnFromYMD(y, m, d) + (h - 12) / 24;   // JDN 以正午为本日整数
  }
  function ymdFromJDN(jdn) {
    let a = jdn + 32044;
    let b = Math.floor((4 * a + 3) / 146097);
    let c = a - Math.floor(146097 * b / 4);
    let dd = Math.floor((4 * c + 3) / 1461);
    let e = c - Math.floor(1461 * dd / 4);
    let mm = Math.floor((5 * e + 2) / 153);
    const day = e - Math.floor((153 * mm + 2) / 5) + 1;
    const month = mm + 3 - 12 * Math.floor(mm / 10);
    const year = 100 * b + dd - 4800 + Math.floor(mm / 10);
    return { y: year, m: month, d: day };
  }

  /* ---------- 太阳视黄经（度，0-360） ---------- */
  function sunLongitude(jd) {
    const T = (jd - 2451545.0) / 36525;
    const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
    const M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
    const Mr = M * RAD;
    const Cc = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mr)
      + (0.019993 - 0.000101 * T) * Math.sin(2 * Mr)
      + 0.000289 * Math.sin(3 * Mr);
    const omega = 125.04 - 1934.136 * T;
    let lam = L0 + Cc - 0.00569 - 0.00478 * Math.sin(omega * RAD);
    lam = ((lam % 360) + 360) % 360;
    return lam;
  }

  /* 求太阳视黄经等于 targetLon（度）的时刻（儒略日，UT） */
  function solarTermJD(year, targetLon) {
    /* 初值：黄经 0°（春分）约在 3 月 20 日 */
    const base = jdnFromYMD(year, 3, 20);
    let guess = base + (targetLon / 360) * 365.2422;
    /* 黄经 >= 285（小寒…惊蛰）外推会落到次年，须回绕到本年 */
    const gy = ymdFromJDN(Math.floor(guess + 0.5)).y;
    if (gy > year) guess -= 365.2422;
    else if (gy < year) guess += 365.2422;
    const diff = (jd) => {
      let d = sunLongitude(jd) - targetLon;
      while (d > 180) d -= 360;
      while (d < -180) d += 360;
      return d;
    };
    // 扫描定位换号区间
    let lo = guess - 8, hi = guess + 8, step = 0.25;
    let a = lo, fa = diff(a), b = a, fb = fa, found = false;
    for (let x = lo + step; x <= hi; x += step) {
      const fx = diff(x);
      if (fa === 0) { a = b = x - step; found = true; break; }
      if (fa * fx < 0) { a = x - step; b = x; found = true; break; }
      fa = fx;
    }
    if (!found) return guess;
    for (let i = 0; i < 60; i++) {
      const mid = (a + b) / 2;
      const fm = diff(mid);
      if (fa * fm <= 0) { b = mid; } else { a = mid; fa = fm; }
    }
    return (a + b) / 2;
  }

  /* 二十四节气：以黄经定义，k=0 为春分，每 15° 一节气 */
  const TERMS = [
    { n: '春分', lon: 0 }, { n: '清明', lon: 15 }, { n: '谷雨', lon: 30 },
    { n: '立夏', lon: 45 }, { n: '小满', lon: 60 }, { n: '芒种', lon: 75 },
    { n: '夏至', lon: 90 }, { n: '小暑', lon: 105 }, { n: '大暑', lon: 120 },
    { n: '立秋', lon: 135 }, { n: '处暑', lon: 150 }, { n: '白露', lon: 165 },
    { n: '秋分', lon: 180 }, { n: '寒露', lon: 195 }, { n: '霜降', lon: 210 },
    { n: '立冬', lon: 225 }, { n: '小雪', lon: 240 }, { n: '大雪', lon: 255 },
    { n: '冬至', lon: 270 }, { n: '小寒', lon: 285 }, { n: '大寒', lon: 300 },
    { n: '立春', lon: 315 }, { n: '雨水', lon: 330 }, { n: '惊蛰', lon: 345 }
  ];
  const TERM_BY_NAME = {};
  TERMS.forEach(t => TERM_BY_NAME[t.n] = t);

  /* 某年第 k 个节气（k 以 TERMS 数组序）的北京时间 {y,m,d,h,min} */
  function termTime(year, k) {
    const jdUT = solarTermJD(year, TERMS[k].lon);
    return jdToBeijing(jdUT);
  }
  function jdToBeijing(jdUT) {
    const jdLocal = jdUT + 8 / 24;                 // 东八区
    const jdn = Math.floor(jdLocal + 0.5);
    const frac = jdLocal + 0.5 - jdn;
    const ymd = ymdFromJDN(jdn);
    let hours = frac * 24;
    const h = Math.floor(hours);
    const min = Math.round((hours - h) * 60);
    let d = ymd.d, m = ymd.m, y = ymd.y;
    let hh = h, mm = min;
    if (mm >= 60) { mm -= 60; hh += 1; }
    if (hh >= 24) { hh -= 24; d += 1; }
    return { y, m, d, h: hh, min: mm };
  }
  /* 节气时刻（东八区）的儒略日 */
  function termJDLocal(year, k) { return solarTermJD(year, TERMS[k].lon) + 8 / 24; }

  /* ---------- 干支 ---------- */
  const GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  const ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  function gzName(i) { i = ((i % 60) + 60) % 60; return GAN[i % 10] + ZHI[i % 12]; }
  function gzIndex(gan, zhi) {
    const g = GAN.indexOf(gan), z = ZHI.indexOf(zhi);
    if (g < 0 || z < 0) return 0;
    for (let i = 0; i < 60; i++) if (i % 10 === g && i % 12 === z) return i;
    return 0;
  }
  /* 日干支序号（0=甲子） */
  function dayGZIndex(jdn) { return (((jdn + 49) % 60) + 60) % 60; }

  /* 十二节 → 月支（寅=2 起） */
  const JIE_TO_ZHI = { '立春': 2, '惊蛰': 3, '清明': 4, '立夏': 5, '芒种': 6, '小暑': 7, '立秋': 8, '白露': 9, '寒露': 10, '立冬': 11, '大雪': 0, '小寒': 1 };
  const JIE_NAMES = Object.keys(JIE_TO_ZHI);

  /* 中气 → 月将（大六壬），支序 子=0 */
  const ZHONGQI_TO_YUEJIANG = [
    { n: '雨水', zhi: 11 }, { n: '春分', zhi: 10 }, { n: '谷雨', zhi: 9 },
    { n: '小满', zhi: 8 }, { n: '夏至', zhi: 7 }, { n: '大暑', zhi: 6 },
    { n: '处暑', zhi: 5 }, { n: '秋分', zhi: 4 }, { n: '霜降', zhi: 3 },
    { n: '小雪', zhi: 2 }, { n: '冬至', zhi: 1 }, { n: '大寒', zhi: 0 }
  ];

  /* 收集某年前后所有"节"的临界时刻（用于月柱） */
  function jieBoundaries(yFrom, yTo) {
    const list = [];
    for (let y = yFrom; y <= yTo; y++) {
      for (const name of JIE_NAMES) {
        const t = TERM_BY_NAME[name];
        const jd = solarTermJD(y, t.lon) + 8 / 24;
        list.push({ jd, name, zhi: JIE_TO_ZHI[name] });
      }
    }
    list.sort((a, b) => a.jd - b.jd);
    return list;
  }

  /* ---------- 四柱 ---------- */
  /* 取"墙上时间"：默认直接用本机本地时间（用户所填即其所处之时刻）；
     传 {utc:true, tz:8} 时，把该瞬时按东八区墙上时间读。 */
  function wallTime(date, opt) {
    opt = opt || {};
    if (opt.utc) {
      const t = opt.tz === undefined ? 8 : opt.tz;
      const D = new Date(date.getTime() + t * 3600000);
      return { Y: D.getUTCFullYear(), M: D.getUTCMonth() + 1, D: D.getUTCDate(), H: D.getUTCHours(), Mi: D.getUTCMinutes() };
    }
    return { Y: date.getFullYear(), M: date.getMonth() + 1, D: date.getDate(), H: date.getHours(), Mi: date.getMinutes() };
  }

  /* date: JS Date（默认按本机本地时间解释，即用户所填即北京时间） */
  function fourPillars(date, opt) {
    opt = opt || {};
    const W = wallTime(date, opt);
    const Y = W.Y, M = W.M, Dd = W.D, H = W.H, Mi = W.Mi;

    const jd = jdFromYMDH(Y, M, Dd, H + Mi / 60);   // 东八区当地儒略日（用同一坐标系比较即可）
    const jdn = jdnFromYMD(Y, M, Dd);

    /* 年柱：以立春为界 */
    const lichun = solarTermJD(Y, TERM_BY_NAME['立春'].lon) + 8 / 24;
    let yearForGZ = Y;
    if (jd < lichun) yearForGZ = Y - 1;
    const yearIdx = (((yearForGZ - 4) % 60) + 60) % 60;

    /* 月柱：以十二节为界 */
    const bounds = jieBoundaries(Y - 1, Y + 1);
    let cur = bounds[0];
    for (const b of bounds) { if (b.jd <= jd) cur = b; else break; }
    const monthZhi = cur.zhi;
    const offsetFromYin = ((monthZhi - 2) % 12 + 12) % 12;
    const yinGan = ((yearIdx % 10) % 5) * 2 + 2;             // 五虎遁
    const monthGan = (yinGan + offsetFromYin) % 10;
    const monthIdx = gzIndex(GAN[monthGan], ZHI[monthZhi]);

    /* 日柱：23 时换日（子时起新日） */
    const dayJDN = jdn + (H >= 23 ? 1 : 0);
    const dayIdx = dayGZIndex(dayJDN);

    /* 时柱：五鼠遁 */
    const hourZhi = Math.floor(((H + 1) % 24) / 2) % 12;
    const hourGan = (((dayIdx % 10) % 5) * 2 + hourZhi) % 10;
    const hourIdx = gzIndex(GAN[hourGan], ZHI[hourZhi]);

    const xunShou = dayIdx - (dayIdx % 10);
    const kong = [(xunShou % 12 + 10) % 12, (xunShou % 12 + 11) % 12];

    return {
      input: { y: Y, m: M, d: Dd, h: H, min: Mi, tz: opt.utc ? (opt.tz === undefined ? 8 : opt.tz) : null },
      year: { idx: yearIdx, gan: GAN[yearIdx % 10], zhi: ZHI[yearIdx % 12], name: gzName(yearIdx) },
      month: { idx: monthIdx, gan: GAN[monthGan], zhi: ZHI[monthZhi], name: gzName(monthIdx), jie: cur.name },
      day: { idx: dayIdx, gan: GAN[dayIdx % 10], zhi: ZHI[dayIdx % 12], name: gzName(dayIdx), jdn: dayJDN },
      hour: { idx: hourIdx, gan: GAN[hourGan], zhi: ZHI[hourZhi], name: gzName(hourIdx) },
      xun: { shou: gzName(xunShou), kongZhi: kong, kong: ZHI[kong[0]] + ZHI[kong[1]] },
      jieqi: cur.name,
      jd: jd
    };
  }

  /* 当前时间的四柱 */
  function nowFourPillars(opt) { return fourPillars(new Date(), opt); }

  /* ---------- 月将 / 节气 ---------- */
  /* 取当前时刻所属"中气"决定的月将（大六壬） */
  function yueJiang(date, opt) {
    const W = wallTime(date, opt);
    const Y = W.Y;
    const jd = jdFromYMDH(Y, W.M, W.D, W.H + W.Mi / 60);
    const list = [];
    for (let y = Y - 1; y <= Y + 1; y++) {
      for (const q of ZHONGQI_TO_YUEJIANG) {
        list.push({ jd: solarTermJD(y, TERM_BY_NAME[q.n].lon) + 8 / 24, name: q.n, zhi: q.zhi });
      }
    }
    list.sort((a, b) => a.jd - b.jd);
    let cur = list[0];
    for (const b of list) { if (b.jd <= jd) cur = b; else break; }
    return { zhi: cur.zhi, name: ZHI[cur.zhi], zhongqi: cur.name };
  }

  /* 当前处于第几个节气区间（含精确时刻） */
  function currentTerm(date, opt) {
    const W = wallTime(date, opt);
    const Y = W.Y;
    const jd = jdFromYMDH(Y, W.M, W.D, W.H + W.Mi / 60);
    const list = [];
    for (let y = Y - 1; y <= Y + 1; y++) {
      TERMS.forEach((t, k) => list.push({ jd: solarTermJD(y, t.lon) + 8 / 24, name: t.n, k }));
    }
    list.sort((a, b) => a.jd - b.jd);
    let cur = list[0], next = list[1];
    for (let i = 0; i < list.length - 1; i++) {
      if (list[i].jd <= jd && jd < list[i + 1].jd) { cur = list[i]; next = list[i + 1]; break; }
    }
    return { name: cur.name, jd: jd, startJD: cur.jd, nextName: next.name, nextJD: next.jd };
  }

  /* ---------- 奇门：三元（符头） ---------- */
  function qiMenYuan(dayIdx) {
    // 符头：当日或向前最近的甲/己日
    let i = dayIdx;
    while (i % 5 !== 0) i = (i - 1 + 60) % 60;   // 甲(0)、己(5) 皆 %5==0
    const zhi = i % 12;
    const group = zhi % 3;                       // 子午卯酉=0 寅申巳亥=1 辰戌丑未=2
    return { futou: gzName(i), futouIdx: i, zhi, yuan: group === 0 ? '上元' : (group === 1 ? '中元' : '下元'), yuanK: group };
  }

  /* ---------- 纳音 ---------- */
  const NAYIN = ['海中金', '炉中火', '大林木', '路旁土', '剑锋金', '山头火', '涧下水', '城头土', '白蜡金', '杨柳木',
    '泉中水', '屋上土', '霹雳火', '松柏木', '长流水', '沙中金', '山下火', '平地木', '壁上土', '金箔金',
    '覆灯火', '天河水', '大驿土', '钗钏金', '桑柘木', '大溪水', '沙中土', '天上火', '石榴木', '大海水'];
  function nayin(i) { i = ((i % 60) + 60) % 60; return NAYIN[Math.floor(i / 2)]; }

  /* ---------- 时间工具 ---------- */
  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function fmtTime(t) { return t.y + '-' + pad2(t.m) + '-' + pad2(t.d) + ' ' + pad2(t.h) + ':' + pad2(t.min); }
  function shiChenName(h) {
    const names = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
    const i = Math.floor(((h + 1) % 24) / 2) % 12;
    const label = { 0: '夜半', 1: '鸡鸣', 2: '平旦', 3: '日出', 4: '食时', 5: '隅中', 6: '日中', 7: '日昳', 8: '哺时', 9: '日入', 10: '黄昏', 11: '人定' };
    return { zhi: names[i], idx: i, label: label[i], range: names[i] + '时' };
  }

  C.GZ = {
    jdnFromYMD, jdFromYMDH, ymdFromJDN, sunLongitude, solarTermJD, termTime, termJDLocal,
    TERMS, TERM_BY_NAME, GAN, ZHI, gzName, gzIndex, dayGZIndex, fourPillars, nowFourPillars,
    yueJiang, currentTerm, qiMenYuan, nayin, pad2, fmtTime, shiChenName,
    JIE_TO_ZHI, ZHONGQI_TO_YUEJIANG, jieBoundaries
  };
})(window.CORE);
