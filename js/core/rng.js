/* ============================================================
   随机数 / 起课取数
   —— 默认使用 crypto 真随机；提供可复现的种子随机
   ============================================================ */
window.CORE = window.CORE || {};

(function (C) {
  'use strict';

  /* xorshift/mulberry32 —— 可复现序列 */
  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function cryptoUint32() {
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const a = new Uint32Array(1);
      crypto.getRandomValues(a);
      return a[0];
    }
    return (Math.random() * 4294967296) >>> 0;
  }

  /* 返回 [0,1) */
  function rand() { return cryptoUint32() / 4294967296; }

  /* 整数 [min,max] 闭区间 */
  function randInt(min, max) { return min + Math.floor(rand() * (max - min + 1)); }

  /* 取数组之一 */
  function pick(arr) { return arr[Math.floor(rand() * arr.length)]; }

  /* 不重复取 n 个 */
  function sample(arr, n) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a.slice(0, Math.min(n, a.length));
  }

  function shuffle(arr) { return sample(arr, arr.length); }

  /* 权重抽取：items = [{w:number, ...}] */
  function weighted(items, key) {
    const k = key || 'w';
    let total = 0;
    for (const it of items) total += (it[k] || 0);
    let r = rand() * total;
    for (const it of items) { r -= (it[k] || 0); if (r <= 0) return it; }
    return items[items.length - 1];
  }

  /* 可复现的随机源（用于"以数起课"等场景） */
  function seeded(seed) {
    const f = mulberry32(seed);
    return {
      rand: f,
      randInt: (a, b) => a + Math.floor(f() * (b - a + 1)),
      pick: (arr) => arr[Math.floor(f() * arr.length)],
      sample: (arr, n) => {
        const a = arr.slice();
        for (let i = a.length - 1; i > 0; i--) {
          const j = Math.floor(f() * (i + 1));
          const t = a[i]; a[i] = a[j]; a[j] = t;
        }
        return a.slice(0, Math.min(n, a.length));
      }
    };
  }

  /* 随机种子（用于展示"起课之数"） */
  function seed32() { return cryptoUint32(); }

  /* 六十四卦随机取一爻等常用：模拟三钱 */
  function threeCoins() {
    // 三枚铜钱：字为阴(2)、背为阳(3)之俗，此处以背=3计
    let s = 0;
    for (let i = 0; i < 3; i++) s += rand() < 0.5 ? 2 : 3;
    // 6 老阴(变) 7 少阳 8 少阴 9 老阳(变)
    return s;
  }

  /* 大衍筮法：三变成一爻 → 6/7/8/9
     依《易学启蒙》《筮仪》所推之数：
       初变去五（3/4）或去九（1/4）；第二、三变各去四（1/2）或去八（1/2）；
       三变毕余策 36/32/28/24 → 老阳9、少阴8、少阳7、老阴6，
       其概率为 9:3/16、8:7/16、7:5/16、6:1/16。
     注：若逐策实分（左策在 1..n 间均匀取），因策数离散，去四之机略大于
     1/2（约 52%），分布会略偏少阳、老阳；本站取前说之模型数，以求合于古法。
     欲观逐变细录者，见「蓍草筮」一页。 */
  function yarrowYao() {
    const r1 = rand() < 0.75 ? 5 : 9;     // 初变
    const r2 = rand() < 0.5 ? 4 : 8;      // 二变
    const r3 = rand() < 0.5 ? 4 : 8;      // 三变
    const remain = 49 - r1 - r2 - r3;     // 36/32/28/24
    return remain / 4;                    // 9/8/7/6
  }

  C.RNG = { mulberry32, rand, randInt, pick, sample, shuffle, weighted, seeded, seed32, threeCoins, yarrowYao, cryptoUint32 };
})(window.CORE);
