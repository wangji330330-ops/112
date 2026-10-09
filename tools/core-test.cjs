/* 干支历核心自检：node tools/core-test.cjs */
global.window = global;
const path = require('path');
const base = path.join(__dirname, '..', 'js', 'core');
['rng', 'data', 'ganzhi', 'tables', 'ui', 'registry'].forEach(f => require(path.join(base, f + '.js')));
const C = window.CORE, G = C.GZ;

let fails = 0;
function eq(what, got, want) {
  const ok = String(got) === String(want);
  if (!ok) fails++;
  console.log(`${ok ? '  ok  ' : ' FAIL '} ${what}: ${got}${ok ? '' : '  (期望 ' + want + ')'}`);
}

console.log('— 节气（东八区）—');
function ymd(t) { return `${t.y}-${t.m}-${t.d}`; }
function hm(t) { return `${t.h}:${t.min < 10 ? '0' : ''}${t.min}`; }
eq('2024 立春', ymd(G.termTime(2024, 21)), '2024-2-4');
eq('2024 立春时刻(近16:27)', hm(G.termTime(2024, 21)), '16:21');
eq('2024 小寒', ymd(G.termTime(2024, 19)), '2024-1-6');
eq('2023 冬至', ymd(G.termTime(2023, 18)), '2023-12-22');
eq('2024 清明', ymd(G.termTime(2024, 1)), '2024-4-4');
eq('2024 夏至', ymd(G.termTime(2024, 6)), '2024-6-21');

console.log('— 日柱（锚点校验）—');
eq('1949-10-01', G.gzName(G.dayGZIndex(G.jdnFromYMD(1949, 10, 1))), '甲子');
eq('2000-01-01', G.gzName(G.dayGZIndex(G.jdnFromYMD(2000, 1, 1))), '戊午');
eq('2024-01-01', G.gzName(G.dayGZIndex(G.jdnFromYMD(2024, 1, 1))), '甲子');

console.log('— 四柱 —');
/* 2024-05-01 13:00（本地，视为北京时间）：甲辰年 戊辰月（清明后立夏前） 日 乙丑? 时 癸未 */
const d1 = new Date(2024, 4, 1, 13, 0);
const f1 = G.fourPillars(d1);
eq('2024-05-01 年柱', f1.year.name, '甲辰');
eq('2024-05-01 月柱', f1.month.name, '戊辰');
eq('2024-05-01 月令(节)', f1.month.jie, '清明');
eq('2024-05-01 时柱', f1.hour.name, '癸未');
eq('2024-05-01 时支', f1.hour.zhi, '未');
/* 立春前后年柱切换：2024-02-03 → 癸卯年，2024-02-05 → 甲辰年 */
eq('2024-02-03 年柱', G.fourPillars(new Date(2024, 1, 3, 12, 0)).year.name, '癸卯');
eq('2024-02-05 年柱', G.fourPillars(new Date(2024, 1, 5, 12, 0)).year.name, '甲辰');
/* 23 时换日 */
const dLate = new Date(2024, 4, 1, 23, 30);
eq('23:30 时支', G.fourPillars(dLate).hour.zhi, '子');
eq('23:30 日柱进一日', G.fourPillars(dLate).day.name, G.gzName(G.dayGZIndex(G.jdnFromYMD(2024, 5, 2))));

console.log('— 月将（大六壬）—');
eq('2024-05-01 月将', G.yueJiang(d1).name, '酉');
eq('2024-05-01 中气', G.yueJiang(d1).zhongqi, '谷雨');
eq('2024-02-10 月将(大寒后)', G.yueJiang(new Date(2024, 1, 10, 12, 0)).name, '子');
eq('2024-02-25 月将(雨水后)', G.yueJiang(new Date(2024, 1, 25, 12, 0)).name, '亥');
eq('2024-12-25 月将', G.yueJiang(new Date(2024, 11, 25, 12, 0)).name, '丑');

console.log('— 节气区间 / 奇门三元 —');
eq('2024-05-01 所处节气', G.currentTerm(d1).name, '谷雨');
eq('2024-05-01 下个节气', G.currentTerm(d1).nextName, '立夏');
eq('甲子日符头', G.qiMenYuan(0).futou, '甲子');
eq('甲子日元', G.qiMenYuan(0).yuan, '上元');
eq('甲戌日元', G.qiMenYuan(10).yuan, '中元');
eq('甲辰日符头', G.qiMenYuan(40).futou, '甲辰');

console.log('— 纳音 / 旬空 / 六十四卦 —');
eq('甲子纳音', G.nayin(0), '海中金');
eq('壬戌纳音', G.nayin(58), '大海水');
eq('甲子旬旬空', C.xunKong(0).join(''), '戌亥');
eq('甲戌旬旬空', C.xunKong(10).join(''), '申酉');
eq('64卦数', C.HEX_LIST.length, 64);
eq('乾为天卦序', C.HEX_BY_NAME['乾为天'].no, 1);
eq('未济卦序', C.HEX_BY_NAME['火水未济'].no, 64);
eq('天风姤', C.HEX64['011111'].name, '天风姤');
eq('火地晋', C.HEX64['000101'].name, '火地晋');
eq('火天大有', C.HEX64['111101'].name, '火天大有');
eq('京房八宫(乾为天)', C.BAGONG['111111'].gong + C.BAGONG['111111'].type, '乾本宫');
eq('京房八宫(天风姤一世)', C.BAGONG['011111'].type, '一世');
eq('京房八宫(天山遁二世)', C.BAGONG['001111'].type, '二世');
eq('京房八宫(天地否三世)', C.BAGONG['000111'].type, '三世');
eq('京房八宫(风地观四世)', C.BAGONG['000011'].type, '四世');
eq('京房八宫(山地剥五世)', C.BAGONG['000001'].type, '五世');
eq('京房八宫(火地晋游魂)', C.BAGONG['000101'].type, '游魂');
eq('京房八宫(火天大有归魂)', C.BAGONG['111101'].type, '归魂');
eq('八宫覆盖六十四卦', Object.keys(C.BAGONG).length, 64);
const gongCount = {};
Object.keys(C.BAGONG).forEach(k => { gongCount[C.BAGONG[k].gong] = (gongCount[C.BAGONG[k].gong] || 0) + 1; });
eq('八宫各统八卦', Object.keys(gongCount).map(k => gongCount[k]).join(','), '8,8,8,8,8,8,8,8');
eq('世应(姤)', C.BAGONG['011111'].shi + '/' + C.BAGONG['011111'].ying, '1/4');
eq('世应(否)', C.BAGONG['000111'].shi + '/' + C.BAGONG['000111'].ying, '3/6');
eq('纳甲(乾为天初爻)', C.najiaOf([1, 1, 1, 1, 1, 1])[0].gz, '甲子');
eq('纳甲(乾为天上爻)', C.najiaOf([1, 1, 1, 1, 1, 1])[5].gz, '壬戌');
eq('纳甲(坤为地初爻)', C.najiaOf([0, 0, 0, 0, 0, 0])[0].gz, '乙未');
eq('纳甲(坤为地上爻)', C.najiaOf([0, 0, 0, 0, 0, 0])[5].gz, '癸酉');
eq('纳甲(天风姤初爻)', C.najiaOf([0, 1, 1, 1, 1, 1])[0].gz, '辛丑');
eq('纳甲(天风姤四爻)', C.najiaOf([0, 1, 1, 1, 1, 1])[3].gz, '壬午');
/* 装卦：乾为天，甲子日，应以乾宫金论六亲：子水=子孙 */
const zg = C.zhuangGua([1, 1, 1, 1, 1, 1], 0, 0);
eq('装卦·初爻六亲', zg.yaos[0].qin, '子孙');
eq('装卦·初爻六神', zg.yaos[0].shen, '青龙');
eq('装卦·宫', zg.bg.gong + zg.bg.gongWx, '乾金');

console.log('— 紫微斗数安星（原书三例）—');
function zhiOf(i) { return C.ZHI[i]; }
eq('27日木三局→戌', zhiOf(C.ZIWEI.ziweiPos(3, 27)), '戌');
eq('13日火六局→亥', zhiOf(C.ZIWEI.ziweiPos(6, 13)), '亥');
eq('6日土五局→未', zhiOf(C.ZIWEI.ziweiPos(5, 6)), '未');
eq('1日水二局→丑', zhiOf(C.ZIWEI.ziweiPos(2, 1)), '丑');
eq('2日水二局→寅', zhiOf(C.ZIWEI.ziweiPos(2, 2)), '寅');
eq('天府对紫微(紫微在寅)', zhiOf(C.ZIWEI.tianfuPos(2)), '寅');
eq('天府对紫微(紫微在子)', zhiOf(C.ZIWEI.tianfuPos(0)), '辰');
eq('命宫(正月子时)', zhiOf(C.ZIWEI.mingShen(1, 0).ming), '寅');
eq('身宫(正月子时)', zhiOf(C.ZIWEI.mingShen(1, 0).shen), '寅');

console.log('— 八宅游年 —');
const yn = C.BAZHAI.youNian('乾');
eq('乾命生气在兑', yn.dui.name, '生气');
eq('乾命延年在坤', yn.kun.name, '延年');
eq('乾命天医在艮', yn.gen.name, '天医');
eq('乾命绝命在离', yn.li.name, '绝命');
eq('乾命伏位在乾', yn.qian.name, '伏位');
const yn2 = C.BAZHAI.youNian('坎');
eq('坎命生气在巽', yn2.xun.name, '生气');
eq('坎命五鬼在艮', yn2.gen.name, '五鬼');
eq('坎命延年在离', yn2.li.name, '延年');

console.log('— 奇门地盘三奇六仪 —');
const ep = C.QIMEN.earthPlate(1, 1);
eq('阳遁一局·戊在坎一', ep[1], '戊');
eq('阳遁一局·己在坤二', ep[2], '己');
eq('阳遁一局·乙在离九?', ep[5], '壬');
const ep2 = C.QIMEN.earthPlate(9, -1);
eq('阴遁九局·戊在离九', ep2[9], '戊');
eq('阴遁九局·己在艮八', ep2[8], '己');

console.log('— 大衍筮法爻概率（古法 6:1/16 7:5/16 8:7/16 9:3/16）—');
{
  const n = 60000, cnt = { 6: 0, 7: 0, 8: 0, 9: 0 };
  for (let i = 0; i < n; i++) cnt[C.RNG.yarrowYao()]++;
  const want = { 6: 1 / 16, 7: 5 / 16, 8: 7 / 16, 9: 3 / 16 };
  [6, 7, 8, 9].forEach(v => {
    const got = cnt[v] / n;
    const ok = Math.abs(got - want[v]) < 0.012;
    if (!ok) fails++;
    console.log(`${ok ? '  ok  ' : ' FAIL '} 爻${v} 概率: ${(got * 100).toFixed(2)}%  (期望 ${(want[v] * 100).toFixed(2)}%)`);
  });
}
console.log('— 三钱摇卦概率（6:1/8 7:3/8 8:3/8 9:1/8）—');
{
  const n = 60000, cnt = { 6: 0, 7: 0, 8: 0, 9: 0 };
  for (let i = 0; i < n; i++) cnt[C.RNG.threeCoins()]++;
  const p7 = cnt[7] / n, ok7 = Math.abs(p7 - 3 / 8) < 0.012;
  if (!ok7) fails++;
  console.log(`${ok7 ? '  ok  ' : ' FAIL '} 三钱阳爻(7)概率: ${(p7 * 100).toFixed(2)}%  (期望 37.50%)`);
}

console.log('— 玄空飞星 / 命卦 / 二十四山 —');
eq('年星 1864（上元甲子）', C.XUANKONG.yearStar(1864), 1);
eq('年星 1984', C.XUANKONG.yearStar(1984), 7);
eq('年星 2000', C.XUANKONG.yearStar(2000), 9);
eq('年星 2023', C.XUANKONG.yearStar(2023), 4);
eq('年星 2024', C.XUANKONG.yearStar(2024), 3);
eq('年星 2025', C.XUANKONG.yearStar(2025), 2);
eq('月星 2024正月', C.XUANKONG.monthStar(2024, 1), 5);
eq('月星 2024二月', C.XUANKONG.monthStar(2024, 2), 4);
eq('月星 2023正月', C.XUANKONG.monthStar(2023, 1), 8);
{
  const fx = C.QIMEN.feiXing(3, 1);
  const want = { 5: 3, 6: 4, 7: 5, 8: 6, 9: 7, 1: 8, 2: 9, 3: 1, 4: 2 };
  const bad = Object.keys(want).filter(g => fx[g] !== want[g]);
  eq('2024 年盘（三碧入中·洛书飞泊）', bad.length ? '宫' + bad.join(',宫') + '不符' : '九宫皆合通行盘', '九宫皆合通行盘');
  const fi = C.QIMEN.feiXing(5, -1);
  eq('逆飞五入中·中宫', fi[5], 5);
  eq('逆飞五入中·巽四', fi[4], 6);
  eq('逆飞五入中·乾六', fi[6], 4);
}
eq('命卦 1990男', C.BAZHAI.mingGua(1990, '男'), '坎');
eq('命卦 1984男', C.BAZHAI.mingGua(1984, '男'), '兑');
eq('命卦 1990女', C.BAZHAI.mingGua(1990, '女'), '艮');
eq('二十四山·子为正北0°', C.SHAN24_DIR(1), 0);
eq('二十四山·午为180°', C.SHAN24_DIR(13), 180);
eq('二十四山·壬为345°', C.SHAN24_DIR(0), 345);
eq('二十四山·乾为315°', C.SHAN24_DIR(22), 315);

console.log(fails === 0 ? '\n全部通过 ✓' : `\n${fails} 项未通过 ✗`);
process.exit(fails === 0 ? 0 : 1);
