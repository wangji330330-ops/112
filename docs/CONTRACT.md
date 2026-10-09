# 术数模块开发契约（务必先读完再写代码）

本站是**纯静态、零构建**的中文术数占卜站：双击 `index.html` 即可运行（`file://`）。
因此**只能用传统 `<script>` 标签加载的普通脚本**（不要 ES module、不要 import/export、不要 fetch 外部资源）。

---

## 一、你要交付什么

每个术数 = 一个文件 `js/arts/<id>.js`，内容形如：

```js
/* 梅花易数 */
(function () {
  'use strict';
  const C = window.CORE, U = C.UI, G = C.GZ;

  ART({
    id: 'meihua',              // 必须与文件名、登记表一致
    name: '梅花易数',
    alias: ['梅花心易', '观梅数'],
    gua: 'zhen',               // 所属卦：qian kun zhen xun kan li gen dui
    order: 3,                  // 在本卦内的排序（与登记表一致）
    tagline: '邵康节观梅 · 时间、数字、单字皆可起卦，体用生克断吉凶',

    /* 简介：源流、原理、术语 —— 2~4 段，写成 HTML 片段 */
    intro: `
      <p>梅花易数为北宋邵雍（康节）所传……</p>
      <p>其法不拘一格：以年月日时起，或以数字起，或以一字之笔画起……</p>`,

    /* 起占说明：告诉用户怎么用这一页 */
    method: `<p>任选一种起卦方式，填好后按“起卦”。……</p>`,

    /* 表单：见下方字段规范。不需要输入就写 [] */
    form: [
      { name: 'way', label: '起卦方式', type: 'select', options: [
          { v: 'time', t: '以时间起卦' }, { v: 'num', t: '以数字起卦' } ] },
      { name: 'nums', label: '两个数字', type: 'text', placeholder: '如 12 与 7', hint: '可选' }
    ],

    /* ★ 纯函数：只能读 input，不得碰 DOM、不得有副作用 */
    cast(input) {
      if (input.way === 'num' && !/\d/.test(input.nums || '')) return { error: '请至少输入一个数字' };
      /* …计算… */
      return { hex: C.HEX_BY_NAME['天风姤'], ti: '…' };
    },

    /* ★ 纯函数：返回 HTML 字符串（用 U.* 工具生成，别自己拼复杂结构） */
    view(d) {
      return U.resHead(d.name, d.sub) + U.card('卦象', U.hexBox(d.hex)) + U.note('…');
    },

    /* 可选：结果渲染完成后的挂载钩子，唯一可以操作 DOM 的地方（画 canvas 等） */
    mount(root, data) { /* root.querySelector('canvas')… */ }
  });
})();
```

**返回错误**：`cast` 返回 `{ error: '提示' }` 时，页面会弹出提示且不渲染 `view`。

---

## 二、铁律（违反即返工）

1. `cast(input)` **必须是纯函数**：不读 `document`、不写全局、不调 `new Date()`（时间从 input 传入或用 `C.GZ` 的纯函数），同样输入必然同样输出。推荐签名 `cast(input)`，需要随机时**只用 `C.RNG`**。
2. `view(data)` 只返回 HTML 字符串，**不许碰 DOM**。`U.esc()` 转义一切用户输入。
3. 不用外部资源（无 CDN、无图片、无 webfont）。图形用 CSS 类 + 内联 SVG 或 canvas（在 `mount` 里画）。
4. 不覆盖/不修改 `js/core/*` 与 `index.html`；只写你自己的 `js/arts/*.js`。
5. **诚信高于炫技**：
   - 排盘算法须尽量合古法；规则存在异说或你无法确证时，**必须在页面明写"简化演示"**。
   - **不得伪造古籍原文**。断语用白话，并注明是参考白话而非原书文字。
   - 任何术数的结果页都要有 `U.disclaim()`（免责与"仅供文化体验"声明）。
   - 不写生死、疾病确诊、投资盈亏保证、婚姻必成必败等确定性断语；用"倾向/宜/忌"表述。
6. 一个文件只登记一个 `ART(...)`（`扶乩` 之类多形态的也只用一条）。
7. 写完后自检：`node --check js/arts/<你的文件>.js` 必须无错。

---

## 三、CORE API 速查

> 全局：`window.CORE`（下称 `C`）、`window.CORE.UI`（下称 `U`）、`window.CORE.GZ`（干支历，下称 `G`）、`window.CORE.RNG`、`window.CORE.QIMEN`、`window.CORE.ZIWEI`、`window.CORE.BAZHAI`、`window.CORE.XUANKONG`。

### 3.1 五行 / 天干地支
```js
C.WX              // ['木','火','土','金','水']
C.WX_COLOR        // {木:'#3d6b45', …}
C.wxSheng('木')   // '火'（我生）
C.wxKe('木')      // '土'（我克）
C.wxRelation(a,b) // '同'|'我生'|'生我'|'我克'|'克我'（以 a 为我）
C.liuQin(gongWx, wx)  // '兄弟'|'父母'|'子孙'|'官鬼'|'妻财'
C.GAN, C.ZHI      // ['甲'…], ['子'…]
C.GAN_WX, C.ZHI_WX, C.GAN_YY, C.ZHI_YY
C.SHENGXIAO       // ['鼠','牛',…]
C.ZHI_CANGGAN     // { 子:[['癸',1]], 寅:[['甲',.6],['丙',.3],['戊',.1]], … }
C.HOURS           // [{zhi:'子',range:'23:00-00:59',idx:0}, …]
C.hourOptions()   // 直接喂给 select 的 options
C.isLiuHe(a,b) C.isLiuChong(a,b)      // 参数是地支序号 0..11
C.sanHeGroup(z)   // {idx, zhi:[…], wx} 或 null
C.shiShen(日干序, 天干序)              // '正官' '偏财' …
C.changSheng(干序, 支序)               // '长生'…'养'
C.xunKong(干支序)  // ['戌','亥'] 旬空
C.ZHI_GONG        // 地支序 → 洛书宫数 {0:1(子→坎), 2:8(寅→艮), …}
```

### 3.2 干支历（`C.GZ`）
```js
G.jdnFromYMD(y,m,d)          // 儒略日
G.jdFromYMDH(y,m,d,h)
G.ymdFromJDN(jdn)
G.sunLongitude(jd)
G.solarTermJD(year, k)       // 第k个节气的儒略日（k 以 G.TERMS 序，0=春分）
G.termTime(year, k)          // {y,m,d,h,min} 北京时间
G.currentTerm(date)          // {name, jd, startJD, nextName, nextJD}
G.fourPillars(date)          // ★ 四柱
G.nowFourPillars()
G.yueJiang(date)             // {zhi:11, name:'亥', zhongqi:'雨水'} 大六壬月将
G.qiMenYuan(日干支序)         // {futou:'甲子', futouIdx, zhi, yuan:'上元', yuanK:0}
G.nayin(干支序)               // '海中金'
G.gzName(i) G.gzIndex(gan,zhi) G.dayGZIndex(jdn)
G.TERMS G.TERM_BY_NAME G.JIE_TO_ZHI
G.pad2(n) G.fmtTime(t) G.shiChenName(h)
```

`G.fourPillars(date)` 返回：
```js
{
  input:{y,m,d,h,min,tz},
  year: {idx, gan, zhi, name},     // 以立春为界
  month:{idx, gan, zhi, name, jie},// 以十二节为界，jie 为节名
  day:  {idx, gan, zhi, name, jdn},// 以 23:00 换日
  hour: {idx, gan, zhi, name},
  xun:  {shou:'甲子', kongZhi:[10,11], kong:'戌亥'},
  jieqi: '立春'
}
```
`idx` 均为 0..59（0=甲子）。时间输入请用 `U.parseDT(input.dt)` 把 `datetime-local` 的值转 Date。

### 3.3 八卦 / 六十四卦
```js
C.BAGUA              // 8 个：{id,name,symbol,nature,lines,wx,num,houtian,dir,family,body,dex,desc}
C.GUA_BY_ID / GUA_BY_NAME / GUA_BY_LINES['101']   // 八卦速查
C.XIANTIAN / C.HOUTIAN                            // 先天/后天八卦 id 序
C.LUOSHU C.GONG_POS C.GONG_ORDER                  // 洛书九宫
C.GONG_NAME['1']==='坎一宫' C.GONG_GUA C.GONG_DIR
C.MEN_AT_GONG C.MEN_ORDER C.XING_AT_GONG C.XING_ORDER C.SHEN_ORDER C.YIQI_ORDER
C.HEX64['101010']    // 以六爻（自下而上，1=阳）为键
C.HEX_LIST           // 64 卦按序卦传次序
C.HEX_BY_NAME['天风姤']
// hex 对象：{key,name,lines[6],no(卦序),upper,lower,upperName,lowerName,symbol,duan(白话大意),wx}
C.bianGua(lines, [动爻下标0..5])   // 变卦
C.huGua(lines)   C.cuoGua(lines)   C.zongGua(lines)
C.NAJIA          // 京房纳甲表（8 卦内/外卦干支）
C.najiaOf(lines) // 六爻纳甲（自下而上）
C.BAGONG['101010']  // {gong:'乾',gongId,gongWx:'金',type:'本宫'|'一世'…,shi:6,ying:3}
C.SHI_YING C.LIUSHEN C.liuShenOf(日干序)
C.zhuangGua(lines, 日干序, 日支序)  // ★ 六爻装卦：{hex,bg,yaos[6]}
//   yaos[i] = {pos,yang,gz,gan,zhi,wx,qin(六亲),shen(六神),shi,ying}
C.fuShen(lines, 日干序, 日支序)     // 伏神
```

### 3.4 奇门（`C.QIMEN`）
```js
C.QIMEN.JU            // {'冬至':[1,7,4], …} 上中下元局数
C.QIMEN.ju(节气名, 0|1|2)   C.QIMEN.dun(节气名)   // +1 阳遁 -1 阴遁
C.QIMEN.earthPlate(局数, 遁) // {1:'戊', 2:'己', …} 地盘三奇六仪
C.QIMEN.gongOfGan(plate,'戊')// → 宫数
C.QIMEN.feiXing(中宫星, ±1) // 九宫飞星
C.QIMEN.pan({term, yuanK, xunShouGan, hourGan, hourSteps, hourZhiIdx})
//  → {term,yuan,ju,dun,dunName,earth,sky,skyGan,men,shen,fuXing,shiMen,fuGong,
//     shiGanGong,zhiShiGong,ma:{zhi,gong},ring}
//  earth/sky/men/shen 皆以宫数 1..9 为键
```
时家奇门取用：`term = G.currentTerm(date).name`（注意用**节气**，非节）；
`yuanK = G.qiMenYuan(day.idx).yuanK`；`hourSteps = (hour.idx - 旬首序) % 10`；
`xunShouGan` = 旬首之仪：甲子旬→戊、甲戌旬→己、甲申旬→庚、甲午旬→辛、甲辰旬→壬、甲寅旬→癸
（即 `C.YIQI_ORDER[Math.floor(hour.idx / 10) % 6]`… 请自行核对：旬首 = `hour.idx - hour.idx % 10`，
其天干必为甲，取该旬序 0..5 对应 `['戊','己','庚','辛','壬','癸']`）。

### 3.5 紫微（`C.ZIWEI`）
```js
C.ZIWEI.PALACES        // ['命宫','兄弟','夫妻','子女','财帛','疾厄','迁移','交友','官禄','田宅','福德','父母']
C.ZIWEI.WXJU           // {水:{name:'水二局',n:2}, …}
C.ZIWEI.ziweiPos(局数, 农历日)  // ★ 紫微星宫（子=0…亥=11），已用原书三例校验
C.ZIWEI.tianfuPos(紫微宫)
C.ZIWEI.mingShen(农历月, 时辰序0..11) // {ming, shen}
C.ZIWEI.SERIES         // 紫微系偏移：紫微0 天机1 太阳3 武曲4 天同5 廉贞8（逆）
C.ZIWEI.TIANFU_SERIES  // 天府系偏移：天府0 太阴1 贪狼2 巨门3 天相4 天梁5 七杀6 破军10（顺）
C.ZIWEI.stepZhi('辰', 3, 1)   // 地支步进
C.ZIWEI.LUCUN / SIHUA / WXJU_CHANGSHENG / MINGZHU / SHENZHU / HOUR_STARS / MONTH_STARS / HUO_LING_START
C.ZIWEI.MAIN           // 十四主星 {五行, 性质, 庙旺}
```
五行局由**命宫干支纳音**定（`G.nayin(G.gzIndex(命宫干, 命宫支))` 的五行 → 局）。
紫微命盘需**农历**生日，表单直接让用户选农历月/日（`U.lunarMonths()` `U.lunarDays()`），
并在页面注明"需农历生日，本站不做公历农历换算"。

### 3.6 八宅 / 玄空
```js
C.BAZHAI.youNian('乾')   // {qian:{code,name,luck}, kan:{…}, …} 八方游年
C.BAZHAI.mingGua(1990,'男')   // '坎'（命卦，五寄坤/艮）
C.BAZHAI.LUCK            // {生气:'大吉', 绝命:'大凶', …}
C.XUANKONG.JIU_XING      // ['一白贪狼', …]
C.XUANKONG.XING_WX / XING_LUCK
C.XUANKONG.yearStar(2024)  C.XUANKONG.monthStar(2024, 正月=1)
```

### 3.7 通用
```js
C.XIAOLIU        // 小六壬六宫 [{name,wx,luck,pos,body,poem,jie}, …]
C.TIAN_JIANG     // 十二天将 ['贵人','螣蛇',…]
C.JIANG_DESC     // 天将释义
C.GUI_REN        // 贵人：{甲:['丑','未'], …}
C.JI_GONG        // 日干寄宫：{甲:'寅', …}
C.ZHAN_ZHONG     // 十二月将名 {子:'神后', …}
C.TAIYI_SHEN     // 太乙十六神
C.JIANCHU / C.JIANCHU_DESC   // 建除十二神 + 释义
C.SHAN24 / C.SHAN24_WX / C.SHAN24_DIR   // 二十四山
C.XIU28          // 二十八宿
C.XIAOXI_GUA     // 十二消息卦

C.RNG.rand() C.RNG.randInt(a,b) C.RNG.pick(arr) C.RNG.sample(arr,n) C.RNG.shuffle(arr)
C.RNG.weighted([{w:3,…},{w:1,…}], 'w')
C.RNG.seeded(seed)   // 可复现随机源
C.RNG.threeCoins()   // 6/7/8/9（老阴/少阳/少阴/老阳）
C.RNG.yarrowYao()    // 大衍筮法一爻
```

### 3.8 UI 工具（`C.UI`，全部返回 HTML 字符串）
```js
U.esc(s)                       // 转义（用户输入必须过它）
U.wx('子','水')                 // 五行着色 <span data-wx>
U.sec('标题', html)             // <section class="sec"><h3>
U.card('小标题', html, '副标')   // 卡片
U.note(html, true)             // 提示/警示条
U.p(s) U.ul(['…','…'])
U.kv([['日干','甲'], …])        // 定义列表
U.table(['表头'], [{cells:['…'],cls:'hi',left:[0]}, …], {align:['l','c'], cls:''})
U.grid9({1:{html:'…'}, 5:{html:'…'}, …})   // ★ 洛书九宫，键为宫数 1..9
U.cell({gong:'坎一宫', main:'天蓬', sub:'休门 戊'})   // 九宫单元内容
U.yao(lines, {labels, dong:[下标], shi:6, ying:3, from:'top'})  // 六爻爻线（默认上爻在上）
U.hexBox(hex)                  // 卦象方块
U.twoHex(hexA, hexB, '本卦', '变卦')
U.form([字段…]) U.field(字段)    // 一般不用手写，form 属性会自动渲染
U.chips([{t:'吉',sel:true}])
U.bars([['木',3], ['火',1,'旺']])   // 条形比例
U.verse(['句一','句二'])          // 竖排诗句感
U.poem('正文\n换行', '小注')
U.resHead('大安', '小六壬 · 吉')   // 结果大标题
U.coins([3,2,3])               // 铜钱（3=背/阳 2=字/阴）
U.qian(12, 3)                  // 签筒（12 支，第 4 支抽出）
U.jiaobei([{flat:false,label:'圣筊'},{flat:true}])  // 筊杯
U.nowStr() U.dateStr(偏移天数) U.parseDT('2024-05-01T13:00')
U.lunarMonths() U.lunarDays()  // 农历月/日下拉选项
U.disclaim('补充')              // 免责（每个结果页必带）
```

### 3.9 表单字段
```js
{ name:'dt', label:'起课时间', type:'datetime-local', value:U.nowStr(), wide:true }
{ name:'num', label:'数字', type:'number', min:1, max:99, value:7 }
{ name:'q', label:'所问', type:'text', placeholder:'…', hint:'小字说明' }
{ name:'m', label:'农历月', type:'select', options:U.lunarMonths() }
{ name:'txt', label:'文字', type:'textarea', rows:2 }
{ name:'way', label:'方式', type:'chips', options:[{v:'a',t:'甲'},{v:'b',t:'乙'}] }
```
`cast` 拿到的 `input` 即 `{name: value}`。注意 `value` 默认值要写好，用户不改也能起课。

---

## 四、可用 CSS 类（无需新写样式，直接用）

`sec / card / note / note.warn / grid2 / grid3 / chips / chip / chip.sel / kv / pan-wrap / table.pan /
pan th td / tr.hi / td.l / td.mono / gong9 / cell / gn / gz / gs / yao-set / yao / yao.dong / bar / bar.half /
bar.full / bar.gap / center / big-hex / verse / poem-box / poem-zh / poem-py / bar-line / lab / track /
fill / val / res-head / big / sm / coins / coin / qian-tube / qian-stick / jiaobei / bei / bei.flat /
face-grid / chips / mono-k / figure / form-row / field / hint / btn-ink / btn-row / tiny-btn / tag / tags`

正文标题层级只用 `U.sec()` / `U.card()`，不要自己写 `<h1>`。

---

## 五、内容标准（决定这一页是否"像样"）

每个术数页至少包含：
1. **源流与原理**（`intro`）：谁创、何书所载、核心概念 2~3 个、与相邻术数的关系。3 段左右，每段 60~160 字。
2. **起占方式**（`method`）：本页怎么用，术语怎么填。
3. **可交互起课**：真的能算出结果，结果里体现该术数的**核心结构**（六爻要六亲世应、奇门要九宫八门、大六壬要四课三传、紫微要十二宫……）。
4. **断语**：把结构翻译成人能读的白话（宜/忌/倾向），可给分项结论。
5. **术语小释**（`U.card('术语', U.kv([…]))`）：3~6 条。
6. **`U.disclaim()`** 收尾。
7. 无法确证的算法，加 `U.note('…为简化演示…', true)`。

文字风格：文言底色 + 现代白话，克制、不神棍、不下断言。术语要准确（如"世应"不写成"世爻应爻"混用）。

---

## 六、文件分配（只写分配给你的文件）

**重要**：本站分两层 —— 只有**与八卦有象数关联**的术数才作为分支连线挂在卦下；
与八卦无直接关联者列入 `window.OTHER_ARTS`（显示于大八卦下方，无连线）。
登记时 `gua` 字段请与本表一致（`other` 表示列于卦外）。

| 卦 | 文件（`js/arts/`） | 术数 | gua / order |
|---|---|---|---|
| 乾 qian | `qian-taiyi.js` `qian-huangji.js` `qian-taixuan.js` | 太乙神数、皇极经世、太玄数 | `qian` / 2,3,4 |
| 坤 kun | `kun-fengshui.js` `kun-bazhai.js` `kun-xuankong.js` `kun-luopan.js` | 风水堪舆、八宅明镜、玄空飞星、罗盘二十四山 | `kun` / 1,2,3,4 |
| 巽 xun | `xun-cezi.js` `xun-zhanmeng.js` | 测字、占梦 | `xun` / 1,2 |
| 巽→其他 | `xun-xingming.js` | 姓名学 | **`other`** / 3 |
| 坎 kan | `kan-daliuren.js` `kan-jinkoujue.js` | 大六壬、六壬金口诀 | `kan` / 1,3 |
| 离 li | `li-bazi.js` `li-ziwei.js` `li-tieban.js` `li-qizheng.js` | 四柱八字、紫微斗数、铁板神数、七政四余 | `li` / 1,2,3,4 |
| 艮 gen | `gen-shicao.js` `gen-guijia.js` `gen-lingqi.js` `gen-heluo.js` | 蓍草筮、龟甲卜、灵棋经、河洛理数 | `gen` / 1,2,3,4 |
| 兑 dui | `dui-qianshi.js` `dui-zhibei.js` `dui-fuji.js` | 签诗占、掷筊问事、扶乩 | `dui` / 1,2,3 |
| 兑→其他 | `dui-zeri.js` `dui-xiangshu.js` `dui-minjian.js` | 择日·建除黄道、相术、民间杂占 | **`other`** / 2,1,4 |

（`震` 的六爻/金钱卦/梅花、`坎` 的小六壬、`乾` 的奇门由主程自行编写，**不要动**。）

---

## 七、交付自检

```powershell
node --check js/arts/<你的每个文件>.js
```
另可用下列方法做无浏览器冒烟测试（把 `<id>` 换成你的 id）。注意 `global.ART = window.ART` 一行不可省：
`registry.js` 只设 `window.ART`，若不导出到 global，脚本里裸写的 `ART({...})` 在 node 下会 `ReferenceError`（浏览器中无此问题）。

```powershell
node -e "global.window={};require('./js/core/rng.js');require('./js/core/data.js');require('./js/core/ganzhi.js');require('./js/core/ui.js');require('./js/core/tables.js');require('./js/core/registry.js');require('./js/arts/<id>.js');const a=window.ART_REGISTRY[0];const inp={};a.form.forEach(f=>inp[f.name]=f.value!==undefined?f.value:'');const d=a.cast(inp);if(d&&d.error)throw new Error(d.error);const html=a.view(d);if(typeof html!=='string')throw new Error('view 未返回字符串');console.log('OK',a.id,html.length);"
```
（若 `cast` 需要特定输入，请在脚本里喂入合法值，确保**不报错**。）

**完成后回报**：文件清单 + 每个术数一句话说明 + 你标注了"简化演示"的地方。
