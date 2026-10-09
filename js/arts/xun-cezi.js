/* 测字（拆字观形）—— 巽卦之一 */
(function () {
  'use strict';
  const C = window.CORE, U = C.UI;

  /* ============================================================
     一、字形的可复现"近似"笔画
     —— 汉字笔画数须查字典，本页不内置字库，故用时：
        ① 用户自行填入笔画数（最准）；
        ② 未填时，以字符码位映射到 1~30 之间一个固定值（近似，逐字稳定）。
     ============================================================ */
  function cp(ch) { return ch.codePointAt(0); }

  /* 码位 → 1..30 的可复现近似笔画 */
  function approxStrokes(ch) {
    const c = cp(ch);
    return ((c * 31 + 17) % 30) + 1;
  }

  function strokesOf(ch, override) {
    if (override && override > 0) return { n: override, exact: true };
    return { n: approxStrokes(ch), exact: false };
  }

  /* ============================================================
     二、结构（上下 / 左右 / 包围 / 独体）
     —— 真拆字须看字形，此处只作粗判：单字先看是否为独体之文，
        两字者以首字取左旁或上冠、以末字取下托，余者以码位哈希作可复现判定。
     ============================================================ */
  /* 独体之文：其形即其字，不能再拆（只收本身即为独体、且不作左旁用者） */
  const STANDALONE = '一丨丿丶乙亅二三十丁七卜八入儿匕几亠冫凵勹匚十又厶土木王山石田日月水火川口手足目耳心女马牛羊犬豕龙虎弓车舟雨风玉贝米禾竹艹屮飞了乃九亍于亏士夕大寸小尢尸巛工己巾干廾弋彐彡文斤方无曰欠止歹殳毋比毛氏气爪父爻爿片牙玄瓜瓦甘生用疋疒癶白皮皿矛矢示禸穴立糸缶网羽老而耒聿肉臣自至臼舌舛艮色虍血行衣襾見角言谷豆豸赤走身車辛辰辵邑酉釆里長門隶隹靑非面革韋韭音頁風食首香骨高髟鬥鬯鬲鬼鹵鹿麥麻黃黍黑黹黽鼎鼓鼠鼻齊齒龜';
  /* 常见"左旁"（真形声字之形旁，多居左） */
  const LEFT = '氵亻讠扌忄纟钅犭阝卩刂彳攵礻衤月子子虫鱼鸟马车足身页食饣见贝酉骨革韦';
  /* 常见"上冠" */
  const TOP = '艹竹雨宀穴冖覀罒癶';
  /* 常见"下托" */
  const BOTTOM = '心灬皿廾贝儿八人口土日目';
  /* 包围、半包围之廓 */
  const WRAP = '囗门冂匚勹广厂疒尸虍';

  const STRUCT_POOL = ['左右结构', '上下结构', '包围结构', '独体结构'];

  /* 一字之中所含的偏旁部件（其本身不成字，故不能以「首字/末字」判）：只收最常见者 */
  const LEFT_PART = {
    海: '氵', 江: '氵', 河: '氵', 湖: '氵', 沙: '氵', 汉: '氵', 池: '氵', 汤: '氵', 波: '氵', 治: '氵',
    洗: '氵', 深: '氵', 浅: '氵', 流: '氵', 消: '氵', 满: '氵', 清: '氵', 港: '氵', 游: '氵', 源: '氵',
    演: '氵', 潜: '氵', 潮: '氵', 激: '氵', 油: '氵', 法: '氵', 活: '氵', 洞: '氵', 浪: '氵', 沐: '氵',
    你: '亻', 他: '亻', 们: '亻', 住: '亻', 位: '亻', 何: '亻', 作: '亻', 使: '亻', 供: '亻', 保: '亻',
    信: '亻', 修: '亻', 倍: '亻', 值: '亻', 停: '亻', 健: '亻', 传: '亻', 伟: '亻', 优: '亻', 佳: '亻',
    说: '讠', 话: '讠', 语: '讠', 请: '讠', 谁: '讠', 谢: '讠', 讲: '讠', 论: '讠', 议: '讠', 认: '讠',
    识: '讠', 记: '讠', 访: '讠', 谈: '讠', 讨: '讠', 训: '讠', 试: '讠', 诚: '讠', 词: '讠', 诗: '讠',
    打: '扌', 找: '扌', 把: '扌', 提: '扌', 指: '扌', 接: '扌', 推: '扌', 排: '扌', 换: '扌', 招: '扌',
    持: '扌', 挂: '扌', 捕: '扌', 抽: '扌', 护: '扌', 报: '扌', 拉: '扌', 拔: '扌', 拾: '扌', 投: '扌',
    情: '忄', 快: '忄', 慢: '忄', 怕: '忄', 恨: '忄', 悔: '忄', 慌: '忄', 惊: '忄', 怀: '忄', 惭: '忄',
    姐: '女', 妹: '女', 妈: '女', 她: '女', 好: '女', 姓: '女', 婚: '女', 姻: '女', 婆: '女', 娘: '女',
    孩: '子', 孙: '子', 孤: '子', 孔: '子', 字: '子', 学: '子', 存: '子', 孝: '子',
    红: '纟', 纸: '纟', 结: '纟', 线: '纟', 经: '纟', 约: '纟', 织: '纟', 维: '纟', 缘: '纟', 缠: '纟',
    铜: '钅', 钢: '钅', 铁: '钅', 银: '钅', 钟: '钅', 错: '钅', 铺: '钅', 锦: '钅', 镇: '钅', 铃: '钅', 钱: '钅', 铅: '钅', 钓: '钅', 钞: '钅',
    猫: '犭', 狗: '犭', 狐: '犭', 猴: '犭', 狼: '犭', 猪: '犭',
    蚊: '虫', 蝴: '虫', 蜂: '虫', 蚁: '虫', 蝶: '虫', 蚂: '虫', 蛇: '虫', 蛛: '虫', 蟹: '虫', 蜜: '虫',
    明: '日', 时: '日', 晚: '日', 昨: '日', 晴: '日', 暗: '日', 暖: '日', 晒: '日', 星: '日', 春: '日',
    期: '月', 朝: '月', 朗: '月', 服: '月', 朋: '月', 肌: '月', 肥: '月', 胖: '月', 脑: '月', 脸: '月',
    张: '弓', 强: '弓', 引: '弓', 弹: '弓',
    城: '土', 地: '土', 场: '土', 坏: '土', 坐: '土', 块: '土', 坚: '土',
    矿: '石', 码: '石', 破: '石', 硬: '石', 碗: '石',
    种: '禾', 秋: '禾', 科: '禾', 稻: '禾', 稀: '禾', 积: '禾',
    粉: '米', 糖: '米', 粗: '米', 粮: '米', 精: '米',
    财: '贝', 货: '贝', 贵: '贝', 贫: '贝', 贺: '贝', 赠: '贝',
    读: '讠', 学: '子'
  };
  /* 一字之中所含的上冠部件 */
  const TOP_PART = { 花: '艹', 草: '艹', 菜: '艹', 茶: '艹', 药: '艹', 荒: '艹', 落: '艹', 蓝: '艹', 藏: '艹', 英: '艹', 苦: '艹', 若: '艹', 莫: '艹', 莲: '艹', 蒙: '艹', 茄: '艹', 茅: '艹', 苍: '艹' };
  /* 一字之中所含的下托部件 */
  const BOTTOM_PART = { 忘: '心', 志: '心', 念: '心', 思: '心', 想: '心', 意: '心', 感: '心', 愿: '心', 愁: '心', 怨: '心', 忠: '心', 悲: '心', 恐: '心', 怒: '心', 息: '心', 慧: '心' };

  function structureOf(ch) {
    if (LEFT_PART[ch]) return { name: '左右结构', how: '一字之中见左旁「' + LEFT_PART[ch] + '」，属左右并列之形' };
    if (TOP_PART[ch]) return { name: '上下结构', how: '一字之中见上冠「' + TOP_PART[ch] + '」，属上下相承之形' };
    if (BOTTOM_PART[ch]) return { name: '上下结构', how: '一字之中见下托「' + BOTTOM_PART[ch] + '」，属上下相承之形' };
    if (STANDALONE.indexOf(ch) >= 0) return { name: '独体结构', how: '「' + ch + '」本为独体之文，不可再拆' };
    if (BOTTOM.indexOf(ch) >= 0) return { name: '上下结构', how: '下部见「' + ch + '」，属上下相承之形' };
    if (WRAP.indexOf(ch) >= 0) return { name: '包围结构', how: '外有「' + ch + '」框廓，属包围含藏之形' };
    if (TOP.indexOf(ch) >= 0) return { name: '上下结构', how: '上冠「' + ch + '」，属上下相承之形' };
    if (LEFT.indexOf(ch) >= 0) return { name: '左右结构', how: '左侧见「' + ch + '」，属左右并列之形' };
    const i = cp(ch) % STRUCT_POOL.length;
    return { name: STRUCT_POOL[i], how: '按字形归入' + STRUCT_POOL[i] + '（<b>近似判定</b>：此字不在本站部件表内）' };
  }

  /* 判一个词（一或二字）的结构 */
  function structureOfWord(word) {
    const chars = word.split('');
    const first = chars[0], last = chars[chars.length - 1];
    if (chars.length === 1) {
      if (LEFT.indexOf(first) >= 0) return { name: '左右结构', how: '「' + first + '」本为左旁之文，其行款得势在左' };
      return structureOf(first);
    }
    const a = structureOf(first), b = structureOf(last);
    if (b.name === '上下结构' || b.name === '包围结构') {
      return { name: b.name, how: '末字「' + last + '」' + (b.name === '上下结构' ? '有下托之形' : '有包廓之形') + '，全词以' + b.name + '论' };
    }
    if (a.name === '独体结构' && b.name === '独体结构') {
      return { name: '独体结构', how: '两字皆独体之文，合之仍作独体论（近似判定）' };
    }
    if (a.name === '左右结构') return { name: '左右结构', how: '首字「' + first + '」有左旁之形，全词以左右论' };
    return { name: b.name, how: '以末字「' + last + '」之字形论' };
  }

  const STRUCT_MEAN = {
    左右结构: '左右并列，主两事并行、须人相助，凡事有商有量则成。',
    上下结构: '上下相承，主先后有序、循序而进，宜按次第行事，急则失序。',
    包围结构: '外廓内实，主受制于外、事有范围，宜守界内经营，出界则费力。',
    独体结构: '浑然一体，主事由己出、独立自主，宜自守其志，不必依人。'
  };

  /* ============================================================
     三、五行偏旁（依《康熙字典》部首五行之通例，取其常见者）
     ============================================================ */
  const RADICAL_WX = [
    { wx: '水', list: ['氵', '水', '冫', '雨', '川', '舟'], jie: '水部' },
    { wx: '木', list: ['木', '艹', '竹', '禾', '米', '糸', '纟', '巾', '亻', '彳'], jie: '木部' },
    { wx: '金', list: ['钅', '金', '刂', '刀', '斤', '戈', '玉', '王'], jie: '金部' },
    { wx: '火', list: ['火', '灬', '日', '光', '赤', '忄', '彡'], jie: '火部' },
    { wx: '土', list: ['土', '山', '石', '阝', '圭', '田', '囗', '宀', '广', '厂', '尸'], jie: '土部（宫室居止之形）' },
    { wx: '火', list: ['心', '目', '言', '讠'], jie: '心言目之部（取火之明）' },
    { wx: '土', list: ['女', '子', '手', '扌', '足', '口'], jie: '人形之部（取土之载）' }
  ];
  /* 单字部首的五行（如「水」「木」独用） */
  const SINGLE_WX = { 水: '水', 木: '木', 金: '金', 火: '火', 土: '土', 山: '土', 石: '土', 日: '火', 月: '水', 田: '土', 雨: '水' };

  /* 笔画数配五行：1-2 木、3-4 火、5-6 土、7-8 金、9-10 水，>10 循环 */
  function strokesToWx(n) {
    const k = ((n - 1) % 10 + 10) % 10;
    return ['木', '木', '火', '火', '土', '土', '金', '金', '水', '水'][k];
  }

  function radicalOf(ch) {
    const hits = [];
    RADICAL_WX.forEach(g => {
      if (g.list.indexOf(ch) >= 0) hits.push({ wx: g.wx, jie: g.jie, part: ch });
    });
    if (SINGLE_WX[ch]) hits.unshift({ wx: SINGLE_WX[ch], jie: ch + '部', part: ch });
    return hits;
  }

  /* 一字之中数其偏旁五行，取多者为主（同数则以码位定次序，保证可复现） */
  function wuxingOf(ch, strokes) {
    const cnt = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };
    const hits = radicalOf(ch);
    hits.forEach(h => { cnt[h.wx] += 1; });
    const max = Math.max.apply(null, C.WX.map(w => cnt[w]));
    let main, from = '';
    if (max > 0) {
      const ties = C.WX.filter(w => cnt[w] === max);
      main = ties[cp(ch) % ties.length];
      from = '偏旁部首';
    } else {
      main = strokesToWx(strokes);
      from = '笔画数配五行（无可辨偏旁）';
    }
    return { main, cnt, hits, from };
  }

  /* ============================================================
     四、测字九法：指事 象形 形声 会意 转注 假借 观梅 谐音 拆合
     —— 择与当前字形相关者给出观察角度。
     ============================================================ */
  const POS_HINT = { 上: '上', 下: '下', 中: '中', 左: '左', 右: '右', 前: '前', 后: '后', 内: '内', 外: '外', 大: '大', 小: '小', 多: '多', 少: '少' };
  const TIME_HINT = '日月年时早晚昼夜春夏秋冬晦朔望';
  const NUM_HINT = '一二三四五六七八九十百千万';
  const BODY_HINT = '心手足目耳口鼻身首血肉骨发须眉眼齿舌';
  const KIN_HINT = '父母兄弟子女夫妻祖孙叔伯姊妹';
  const NATURE_HINT = '金木水火土风雨雪云雷电霜露';
  const ANIMAL_HINT = '马牛羊犬豕鸡鱼龙虎蛇鼠兔猴鸟雀虫龟鹤';
  const MONEY_HINT = '金玉贝钱银宝珍宝货财帛';
  const ILL_HINT = '病疾疮痍瘦弱衰败困穷';
  const JOY_HINT = '喜乐庆贺福禄寿安康宁';
  const SAD_HINT = '哭泣悲哀愁苦忧怨别离';

  function nineMethods(ch, strokes) {
    const out = [];
    const chWx = strokesToWx(strokes);
    const stru = structureOf(ch);
    const shape = stru.name.replace('结构', '');
    const clean = U.esc(ch);

    /* 指事 */
    if (POS_HINT[ch]) {
      out.push({ name: '指事', text: '「' + clean + '」本为方位之文，直指' + POS_HINT[ch] + '方之事，问事可先辨其方位与时序。' });
    } else if (TIME_HINT.indexOf(ch) >= 0) {
      out.push({ name: '指事', text: '「' + clean + '」直指时日，所问之事应于时令历数之间，宜先定其期。' });
    } else if (NUM_HINT.indexOf(ch) >= 0) {
      out.push({ name: '指事', text: '「' + clean + '」为数之文，事有定数，宜计其多寡而后动。' });
    } else if (BODY_HINT.indexOf(ch) >= 0) {
      out.push({ name: '指事', text: '「' + clean + '」直指人身一部，所问之事实与己身相关，宜自省而后求诸外。' });
    } else {
      out.push({ name: '指事', text: '指事者，视字之所指。此字无所直指，宜以所问之事为准——先问清自己究竟想问什么。' });
    }

    /* 象形 */
    out.push({ name: '象形', text: '象形者，视字之所肖。此字作「' + shape + '」之形，如物有内外先后，则所问之事亦有次第，宜分其本末。' });

    /* 形声 */
    out.push({ name: '形声', text: '形声者，半形半声。此字读「' + clean + '」，其音近者可借（见「谐音」法）；字形归' + describeWx(chWx) + '，是其"形"之属。' });

    /* 会意 */
    out.push({ name: '会意', text: '会意者，合文见义。' + (stru.name === '独体结构'
      ? '此字独体，义在自身，须以所问之事合看。'
      : '此字可拆为数件，' + STRUCT_MEAN[stru.name]) });

    /* 转注 */
    out.push({ name: '转注', text: '转注者，义之相通。' + (KIN_HINT.indexOf(ch) >= 0
      ? '此字属人伦之称，所问之事牵连他人，宜以"彼此"两处看。'
      : '此字之义可与他义相通，所问之事往往不是它表面那件，宜追到底。') });

    /* 假借 */
    out.push({ name: '假借', text: '假借者，借字代事。' + (MONEY_HINT.indexOf(ch) >= 0
      ? '此字本为财货之文，若所问非财，则所借者当是"值不值"之意。'
      : '若所问之事与此字本义无关，则此字不过借来一用，断时当轻看字面、重看所问。') });

    /* 观梅 */
    out.push({ name: '观梅', text: '观梅者，即目所见皆可入占。测字之时，字外之物——窗外之声、手边之器、心中忽起之念，' +
      '皆可与「' + clean + '」并观，取其一瞬之感，不必拘泥。' });

    /* 谐音 */
    out.push({ name: '谐音', text: '谐音者，以声取义。此字音近者或吉或凶，随所问而取：问事取其"成"声则吉，取其"空"声则虚。' +
      '测字家最重此题，然亦最易穿凿。' });

    /* 拆合 */
    out.push({ name: '拆合', text: '拆合者，离合其文。' + (stru.name === '独体结构'
      ? '此字不宜再拆，拆之则散，主事不可分，宜合而图之。'
      : '此字可拆而合之：' + stru.how + '，主事可分亦可合，宜先分其条目再总其成。') });

    /* 择要：取与字形最相关者五条 */
    const score = m => {
      let s = 0;
      if (m.name === '指事' && (POS_HINT[ch] || TIME_HINT.indexOf(ch) >= 0 || NUM_HINT.indexOf(ch) >= 0)) s += 3;
      if (m.name === '拆合' && stru.name !== '独体结构') s += 2;
      if (m.name === '会意' && stru.name !== '独体结构') s += 1;
      if (m.name === '象形') s += 1;
      if (m.name === '谐音') s += 1;
      return s;
    };
    return out.map((m, i) => ({ m, i, s: score(m) }))
      .sort((a, b) => (b.s - a.s) || (a.i - b.i))
      .slice(0, 5).map(o => o.m);
  }

  function describeWx(wx) {
    const d = { 木: '木（生发、曲直）', 火: '火（炎上、明丽）', 土: '土（承载、厚实）', 金: '金（刚断、肃杀）', 水: '水（润下、流通）' };
    return d[wx] || wx;
  }

  /* ============================================================
     五、吉凶倾向与断语
     —— 依传统"取数"之意：以总笔画数为本，结构、五行、偏旁各加一分，
        合而除八取余（与配卦同用除八之法），得"字之数"；八档自滞至大吉：
        0·1 滞　2·3 小滞　4·5 平　6 吉　7 大吉。
        故同一字必同档，且笔画之数为主、结构五行为辅，可复现、可复核。
     ============================================================ */
  const LUCK_LEVELS = [
    { name: '大吉', note: '字形与数皆顺，所问之事有可成之势。', yi: '宜进取、宜决断、宜当面直言', ji: '忌骄盈自满' },
    { name: '吉', note: '字势向顺，事有可为之机，须稍待其熟。', yi: '宜循序而进、宜托人相助', ji: '忌急求速成' },
    { name: '平', note: '字中吉凶相半，事在人为，不增不减。', yi: '宜守常按部、宜先小后大', ji: '忌孤注一掷' },
    { name: '小滞', note: '字势稍滞，事有牵绊，宜缓不宜急。', yi: '宜等待转机、宜查漏补缺', ji: '忌争先冒进' },
    { name: '滞', note: '字形收敛，此时谋事难顺，宜藏不宜露。', yi: '宜静守自持、宜收敛锋芒', ji: '忌远行大举' }
  ];
  /* 八档：0·1 滞　2·3 小滞　4·5 平　6 吉　7 大吉 */
  const BUCKETS = ['滞', '滞', '小滞', '小滞', '平', '平', '吉', '大吉'];
  const STRUCT_OFF = { 左右结构: 0, 上下结构: 1, 独体结构: 0, 包围结构: 1 };
  const WX_OFF = { 木: 0, 火: 1, 土: 1, 金: 0, 水: 0 };

  function luckOf(structName, wxFrom, wx, total) {
    const s = STRUCT_OFF[structName] === undefined ? 1 : STRUCT_OFF[structName];
    const w = WX_OFF[wx] === undefined ? 0 : WX_OFF[wx];
    const p = wxFrom === '偏旁部首' ? 1 : 0;
    const idx = ((total + s + w + p) % 8 + 8) % 8;
    const name = BUCKETS[idx];
    const level = LUCK_LEVELS.filter(l => l.name === name)[0] || LUCK_LEVELS[2];
    return { idx, level, parts: { struct: structName, s, wx, w, p, total } };
  }

  const JUDGE = {
    木: '主生发而性直。事在萌动之初，宜培植其根，久之自长；不宜折其锐气。',
    火: '主炎上而性急。事有光明之象，宜速决；然过急则焦，须防一时之愤。',
    土: '主承载而性缓。事有根基可守，宜稳中求进；然守之过久则泥，须知变通。',
    金: '主肃杀而性刚。事有决断之机，宜明断是非；然刚极易折，须留余地。',
    水: '主润下而性通。事有流通之象，宜顺势而行；然水无常形，须自守其志。'
  };

  /* 字之五行 与 卦之五行 的关系（以字为我）→ 辞 */
  const REL_TEXT = {
    同: { name: '比和', text: '字与卦同气，内外相和，事多顺遂，谋之得人。' },
    我生: { name: '我生（泄）', text: '字生卦，是我出力而事得成，须先付出方有回报，不利坐等。' },
    生我: { name: '生我（助）', text: '卦生字，外来之力相助，宜求援于人、借势而行。' },
    我克: { name: '我克（制）', text: '字克卦，是我能制之，事在掌握之中，宜主动经营。' },
    克我: { name: '克我（受制）', text: '卦克字，受制于外，事多阻格，宜退守待时。' }
  };

  /* ============================================================
     六、以笔画数配卦（先天八卦数：乾一兑二离三震四巽五坎六艮七坤八）
     ============================================================ */
  function xiantianByNum(n) { return C.XIANTIAN[(((n - 1) % 8) + 8) % 8]; }

  function guaOfWord(chars, strokeList) {
    const total = strokeList.reduce((a, b) => a + b, 0);
    const first = strokeList[0];
    const upIdx = ((total - 1) % 8 + 8) % 8;      /* 总数除八，取上卦 */
    const loIdx = ((first - 1) % 8 + 8) % 8;      /* 首字笔画除八，取下卦 */
    const up = C.BAGUA[upIdx], lo = C.BAGUA[loIdx];
    const lines = lo.lines.concat(up.lines);
    const hex = C.HEX64[lines.join('')];
    const dong = ((total - 1) % 6 + 6) % 6;       /* 总数除六，取动爻 */
    const bian = C.bianGua(lines, [dong]);
    return { total, up, lo, hex, lines, dong, bian, upIdx, loIdx, dongBy: '总笔画数' };
  }

  /* ============================================================
     七、正文
     ============================================================ */
  ART({
    id: 'cezi',
    name: '测字',
    alias: ['拆字', '字占', '相字'],
    gua: 'xun',
    order: 1,
    tagline: '拆字观形 · 一字之中见增损离合、五行偏旁，断事之始终',

    intro: `
      <p>测字又称拆字、相字，是随地取字、就字论事的占法。其源甚早，《左传》已有以"止戈为武""反正为乏"解字言事的记载；至隋唐有"破字"之目，宋代市井有相字之人，明末清初周亮工辑《字触》六卷，广收历代拆字故实，为这一路术数留下最完整的文献。清人程省《测字秘牒》更立"测字十法"，将取字之法条分缕析，可视为测字的术法总纲。</p>
      <p>其理不在字，而在"象"。汉字本为表意之文，一笔一画皆有所肖，一字之中有偏旁、有上下、有内外、有增损，测者即以此形此义比附所问之事，观其离合聚散以言始终。故测字与梅花易数同源而异流：梅花重在数与时间，测字重在形与义，皆属"即物取象"一路，与六爻纳甲那类先成卦、再装卦的体系不同。</p>
      <p>须如实说明：测字之术成分杂糅，既有从六书借来的分析框架，也有取谐音、抓外应的直感成分，历代记载多为"应验"之例，无从校验。本站所实现的，是以字形结构、偏旁五行、笔画数配卦三者构成的可复现规则，取其"言之成理"以供省思；这既非周亮工序中之法，更非《说文》《康熙》的本义。测字传统上视为文人游戏与市井杂占，读者当以文化体验视之。</p>`,

    method: `
      <p>输入一个字（或一两个字）即可。同一个字，本站结果稳定不变——测字贵在"字不动而问者动"，故不再另加随机。</p>
      <ul>
        <li><b>所测之字</b>：心中默念所问之事，随手写一字或取眼前一字填入。传统以"触机"取字为贵，不必刻意挑选。</li>
        <li><b>笔画数</b>：本页无字库，无法自动查准笔画。若知该字笔画，请直接填入，计算最准；不填则用码位近似，结果仅供参考。</li>
        <li><b>字之数</b>：可填一至两字。两字时以总笔画取上卦、首字笔画取下卦、总笔画取动爻，合两字之义而断。</li>
      </ul>`,

    form: [
      { name: 'word', label: '所测之字', type: 'text', value: '明', placeholder: '如 明、安、問', hint: '一至两字' },
      { name: 'strokes', label: '笔画数（可选）', type: 'text', value: '', placeholder: '如 8', hint: '不填则以码位近似' }
    ],

    cast(input) {
      const raw = String(input.word === undefined || input.word === null ? '' : input.word);
      const chars = raw.replace(/[\s\u3000]+/g, '').split('');
      if (!chars.length) return { error: '请先输入一个要测的字' };
      const han = /[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/;
      for (let i = 0; i < chars.length; i++) {
        if (!han.test(chars[i])) return { error: '请只输入汉字（勿填字母、数字或标点）' };
      }
      if (chars.length > 2) return { error: '测字以一字为贵，至多两字，请勿多填（现为 ' + chars.length + ' 字）' };

      const ovr = String(input.strokes === undefined ? '' : input.strokes).match(/\d+/);
      const override = ovr ? Number(ovr[0]) : 0;
      if (override && (override < 1 || override > 64)) return { error: '笔画数请填 1 至 64 之间的整数' };
      if (ovr && chars.length > 1) return { error: '两字时请勿手填笔画（无法对应到单字），留空即可' };

      const items = chars.map(ch => {
        const st = strokesOf(ch, override);
        const w = wuxingOf(ch, st.n);
        const stru = structureOf(ch);
        return { ch, strokes: st.n, exact: st.exact, wx: w.main, wxCnt: w.cnt, wxHits: w.hits, wxFrom: w.from, struct: stru.name, structHow: stru.how, code: cp(ch) };
      });
      const whole = structureOfWord(chars.join(''));

      const strokesArr = items.map(o => o.strokes);
      const total = strokesArr.reduce((a, b) => a + b, 0);
      const g = guaOfWord(chars, strokesArr);

      const seed = total * 1000 + items[0].code + (chars.length > 1 ? items[1].code : 0);
      const lk = luckOf(whole.name, items[0].wxFrom, items[0].wx, total);
      const luck = lk.level;

      const rel = C.wxRelation(items[0].wx, g.hex.wx);
      const relText = REL_TEXT[rel] || REL_TEXT['同'];

      /* 断语：字五行判辞 + 倾向 + 生克 */
      const judges = items.map(o => ({ ch: o.ch, wx: o.wx, text: JUDGE[o.wx] }));

      return {
        name: '测字',
        sub: chars.join('') + ' · ' + luck.name + ' · ' + items[0].wx + '字',
        word: chars.join(''),
        chars,
        items,
        total,
        exact: items.every(o => o.exact),
        hex: g.hex, bian: g.bian, dong: g.dong, up: g.up, lo: g.lo,
        upIdx: g.upIdx, loIdx: g.loIdx, dongBy: g.dongBy,
        luck, judges, rel, relText,
        nine: nineMethods(chars[0], strokesArr[0]),
        whole: whole.name, wholeHow: whole.how,
        structMean: STRUCT_MEAN[whole.name],
        luckIdx: lk.idx, luckParts: lk.parts,
        seed
      };
    },

    view(d) {
      const E = U.esc;
      let h = U.resHead('测字 · ' + d.word, d.sub);

      /* 一、拆解笔形 */
      const rows = d.items.map(o => ({
        cells: [
          o.ch,
          o.strokes + (o.exact ? '' : ' <span class="hint">近似</span>'),
          U.wx(o.wx, o.wx),
          o.wxFrom === '偏旁部首' ? (o.wxHits.map(x => E(x.part) + '（' + x.jie + '·' + x.wx + '）').join('、') || '—') : '无可辨偏旁'
        ],
        left: [0]
      }));
      const structRows = d.items.map(o => ({ cells: [E(o.ch), E(o.struct), E(o.structHow)], left: [2] }));

      h += U.card('一 · 拆解笔形',
        U.table(['字', '笔画', '五行', '所据偏旁'], rows, { align: ['c', 'c', 'c', 'l'] }) +
        U.table(['字', '结构', '析形'], structRows, { align: ['c', 'c', 'l'] }) +
        U.kv([
          ['总笔画', '<b>' + d.total + '</b> 画' + (d.exact ? '（用户自填，较准）' : '（本站用时：以字符码位映射 1~30 所得的<b>近似值</b>）')],
          ['合看结构', '<b>' + E(d.whole) + '</b>　' + E(d.wholeHow)],
          ['结构之义', E(d.structMean)],
          ['五行取法', '以偏旁部首为第一义；无偏旁可辨者，以笔画数配五行 —— 1-2 木、3-4 火、5-6 土、7-8 金、9-10 水，过十循环。']
        ]) +
        U.note('本站不内置汉字笔画字库，<b>未填笔画时所示笔画数为近似值</b>（码位映射，同一字恒定）；' +
          '字形结构亦只按常见偏旁表粗判，与字典部首或有出入。求真者请自行填入笔画数。')
      );

      /* 二、测字九法 */
      h += U.card('二 · 测字九法 · 择要五则',
        U.table(['法', '观察'], d.nine.map(m => ({ cells: ['<b>' + m.name + '</b>', m.text], left: [1] })), { align: ['c', 'l'] }) +
        U.note('所谓"九法"，是把六书（指事、象形、形声、会意、转注、假借）借来作分析框架，' +
          '再加"观梅"（即目取象）、"谐音"、"拆合"三种测字家自有的手法凑成九数，' +
          '并非许慎六书之原义，亦非《测字秘牒》所列的十法。此为本页之整理与简化。')
      );

      /* 三、配卦 */
      h += U.card('三 · 以数配卦',
        U.twoHex(d.hex, d.bian, '本卦', '之卦（动爻' + (d.dong + 1) + '）') +
        U.kv([
          ['取卦之法', '总笔画 ' + d.total + ' ÷ 8 余 ' + (d.upIdx + 1) + ' → 上卦 ' + U.wx(d.up.name, d.up.wx) + '（' + E(d.up.nature) + '）；首字笔画 ÷ 8 → 下卦 ' + U.wx(d.lo.name, d.lo.wx) + '（' + E(d.lo.nature) + '）'],
          ['动爻', '总笔画 ÷ 6 余 ' + (d.dong + 1) + '，' + E(d.dongBy) + '取之'],
          ['卦名', E(d.hex.name) + '（第 ' + d.hex.no + ' 卦）'],
          ['卦辞大意', E(d.hex.duan)],
          ['之卦', E(d.bian.name) + '　' + E(d.bian.duan)]
        ]) +
        U.note('测字家本不以卦为主，配卦是本站增意趣的一层。取数以"总数除八为上卦、首字除八为下卦"为定，' +
          '若依《梅花易数》以两字笔画分上下卦亦通，读者不必拘泥。')
      );

      /* 四、白话结论 */
      const relRow = '<b>' + E(d.relText.name) + '</b>（字 ' + U.wx(d.items[0].wx, d.items[0].wx) + ' 于卦 ' + U.wx(d.hex.wx, d.hex.wx) + '）：' + E(d.relText.text);
      h += U.card('四 · 白话结论',
        U.resHead(d.luck.name, '倾向 · 以「' + E(d.word) + '」为占') +
        U.p(E(d.luck.note)) +
        U.kv([
          ['字之五行', d.judges.map(j => U.wx(j.ch, j.wx) + '：' + E(j.text)).join('<br>')],
          ['字与卦', relRow],
          ['宜', E(d.luck.yi)],
          ['忌', E(d.luck.ji)],
          ['参考', '所问之事若无从落于"宜/忌"之一端，则此占所答的只是"此事此刻的气象"，不必强作解人。']
        ]) +
        U.note('倾向之定法（<b>取数</b>）：以总笔画数为本，字之结构（上下、包围各加 1）、字之五行（火、土各加 1）、有无可辨偏旁（有则加 1）为辅 —— ' +
          d.luckParts.total + '＋' + d.luckParts.s + '＋' + d.luckParts.w + '＋' + d.luckParts.p + '＝<b>' + (d.luckParts.total + d.luckParts.s + d.luckParts.w + d.luckParts.p) + '</b>，' +
          '除八取余得第 <b>' + (d.luckIdx + 1) + '</b> 档；八档为：滞·滞·小滞·小滞·平·平·吉·大吉。' +
          '此法为本页自订（<b>非古法</b>），与配卦同用"除八"之义，只为使结果可复现、可复核；<b>同一字结果恒定</b>。')
      );

      /* 五、术语 */
      h += U.card('术语小释', U.kv([
        ['拆字 / 相字', '即测字。拆者离合其文，相者观其形貌，实为一事。'],
        ['触机', '随手取字之谓。传统以为临时所见之字最灵，刻意择字则"机"已滞。'],
        ['增损', '就原字添笔或减笔而成他字，以他字之义断吉凶，是测字家最常用的手法。'],
        ['外应 / 观梅', '取字之时耳目所及之物、所闻之声，与字并观，谓之外应。'],
        ['偏旁五行', '以部首配五行，如 氵水、木艹木、钅金、灬火、土山石土，为宋以后字占与姓名学通用的约定。'],
        ['先天卦数', '乾一、兑二、离三、震四、巽五、坎六、艮七、坤八，见《梅花易数》，本站取卦即用此数。']
      ]));

      h += U.disclaim('测字为文人游戏与市井杂占，本站不主张其预测效力；所测之"字"由用户自取，笔画数未经字典校验。');
      return h;
    }
  });
})();
