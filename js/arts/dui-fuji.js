/* 扶乩（民间信仰活动 · 本站为文化演示） */
(function () {
  'use strict';
  const C = window.CORE, U = C.UI, G = C.GZ;

  /* ============================================================
     一、内置字库（本站自撰：84 字，每字一句"判词"式的白话转译）
     转译一律写作处事与心态上的倾向，不写生死、疾病、灾祸、贫富、婚姻成败。
     ============================================================ */
  const ZIKU = [
    /* 天时 14 */
    { ch: '天', tag: '天时', gloss: '天在上，事有不可强求者。宜存敬畏，先看大势再动。' },
    { ch: '日', tag: '天时', gloss: '日主光明，宜把事摊开来说。藏着的话最耗人。' },
    { ch: '月', tag: '天时', gloss: '月有圆缺，事有起落。此刻不宜求全，宜待其自圆。' },
    { ch: '星', tag: '天时', gloss: '星众而微，力在积累。一件小事做成，胜过十件空想。' },
    { ch: '云', tag: '天时', gloss: '云聚云散，消息未定。宜多听少断，勿据传闻定案。' },
    { ch: '雨', tag: '天时', gloss: '雨润万物，缓而能入。宜以温和之法推进，急则伤人。' },
    { ch: '风', tag: '天时', gloss: '风无定所，传言易起。宜谨言，勿代人传话。' },
    { ch: '霜', tag: '天时', gloss: '霜降而后肃，宜收敛。此时宜整理旧事，不宜开新局。' },
    { ch: '明', tag: '天时', gloss: '明则无隐，宜坦白相告。隐瞒之事早晚见光。' },
    { ch: '暗', tag: '天时', gloss: '暗处生疑，宜点灯自查。疑心多起于信息不足，未必有诈。' },
    { ch: '晨', tag: '天时', gloss: '晨为一日之始，宜早谋。今日定下的框架，往后省许多力。' },
    { ch: '夜', tag: '天时', gloss: '夜主静藏，宜休息。事有未决者，留待明旦再看。' },
    { ch: '春', tag: '天时', gloss: '春主生发，宜起步。新事可先试小样，不必一次求全。' },
    { ch: '秋', tag: '天时', gloss: '秋主收敛，宜结算。把该收的尾收干净，再谈远方。' },
    /* 地理 12 */
    { ch: '山', tag: '地理', gloss: '山高而止，宜守住本位。越位之事，纵成亦难久。' },
    { ch: '水', tag: '地理', gloss: '水就下而曲行，宜柔进。绕开硬处，事反易成。' },
    { ch: '川', tag: '地理', gloss: '川流不息，宜持续推进。不求一日之功，贵在不间断。' },
    { ch: '石', tag: '地理', gloss: '石坚而重，宜立底线。哪些可让、哪些不可让，先说清。' },
    { ch: '田', tag: '地理', gloss: '田须耕而后获。宜实做，不宜只议。' },
    { ch: '井', tag: '地理', gloss: '井养不穷，宜自修。本事在手，不愁无处用。' },
    { ch: '路', tag: '地理', gloss: '路在脚下，宜先行一步。站着问路，不如走一段再问。' },
    { ch: '桥', tag: '地理', gloss: '桥接两岸，宜有中间人。僵持之事，多半缺一个传话的。' },
    { ch: '门', tag: '地理', gloss: '门有开阖，宜择时。此时宜叩门探问，不宜破门而入。' },
    { ch: '庭', tag: '地理', gloss: '庭者家中之空地。宜留余地，自家之事留三分不争。' },
    { ch: '岸', tag: '地理', gloss: '岸为界，宜知止。到此为止的话，说在前头最省事。' },
    { ch: '舟', tag: '地理', gloss: '舟行靠水，宜借势。顺势者省力，逆势者费功。' },
    /* 人事 16 */
    { ch: '人', tag: '人事', gloss: '人在事中，宜先问人。此事关键多半不在事，而在人。' },
    { ch: '心', tag: '人事', gloss: '心为主宰，宜先安己。己心不定，看什么都像险。' },
    { ch: '言', tag: '人事', gloss: '言出难收，宜慎诺。此时少许人，多做事。' },
    { ch: '信', tag: '人事', gloss: '信为立身之本。宜守小诺，小诺最见人品。' },
    { ch: '礼', tag: '人事', gloss: '礼者分寸。宜以礼相接，纵有分歧也不失体面。' },
    { ch: '和', tag: '人事', gloss: '和者两可之间。宜先商量再定论，不必急辩输赢。' },
    { ch: '合', tag: '人事', gloss: '合须两愿。宜找共同处，不宜各说各话。' },
    { ch: '分', tag: '人事', gloss: '分者别也。宜先分明界限，再谈合作。' },
    { ch: '聚', tag: '人事', gloss: '聚则力大。宜结伴同行，独行此时费力。' },
    { ch: '散', tag: '人事', gloss: '散则力薄。宜检点人手，先把人心聚一聚。' },
    { ch: '行', tag: '人事', gloss: '行主行动。宜起身去做，纸上再算不如一试。' },
    { ch: '止', tag: '人事', gloss: '止主收束。宜暂停，等看清楚再动。' },
    { ch: '来', tag: '人事', gloss: '来者将至。宜备而不迎，做好手边事即可。' },
    { ch: '去', tag: '人事', gloss: '去者不留。宜顺其自然，强留反生怨。' },
    { ch: '进', tag: '人事', gloss: '进须有据。宜小步试进，每步都留退路。' },
    { ch: '退', tag: '人事', gloss: '退非怯也。宜暂退一步，换个位置看得更清。' },
    /* 心性 12 */
    { ch: '静', tag: '心性', gloss: '静能生明。宜少言，先把事听全。' },
    { ch: '安', tag: '心性', gloss: '安者不摇。宜稳守现状，此时不宜大改。' },
    { ch: '定', tag: '心性', gloss: '定者不疑。宜早下决心，久悬之事最耗神。' },
    { ch: '诚', tag: '心性', gloss: '诚能动人心。宜说实话，短期的难堪好过长期的猜疑。' },
    { ch: '敬', tag: '心性', gloss: '敬者重人也。宜尊重对手，轻慢之心最先坏事。' },
    { ch: '慎', tag: '心性', gloss: '慎者不轻发。宜再核一遍，细节处最易失手。' },
    { ch: '宽', tag: '心性', gloss: '宽者容人。宜放宽尺度，标准太紧则无人可用。' },
    { ch: '忍', tag: '心性', gloss: '忍者蓄力。宜暂受一口气，此时争胜所得有限。' },
    { ch: '直', tag: '心性', gloss: '直者不绕。宜有话直说，但须拣时候、拣言辞。' },
    { ch: '柔', tag: '心性', gloss: '柔能克刚。宜以柔法处之，硬碰硬此时不划算。' },
    { ch: '刚', tag: '心性', gloss: '刚者主断。宜立规矩，先把边界定下再谈交情。' },
    { ch: '恒', tag: '心性', gloss: '恒者久也。宜守常，日日做一点胜过一时奋起。' },
    /* 器物 10 */
    { ch: '书', tag: '器物', gloss: '书为载道之物。宜留下字据，口头之约易生歧义。' },
    { ch: '琴', tag: '器物', gloss: '琴贵知音。宜寻同道者，此事一人做不来。' },
    { ch: '灯', tag: '器物', gloss: '灯照暗处。宜把话说明白，含糊最易生误会。' },
    { ch: '镜', tag: '器物', gloss: '镜照己而不自照人。宜先自查，再看他人长短。' },
    { ch: '壶', tag: '器物', gloss: '壶中容物。宜容人之短，把不满收一收。' },
    { ch: '玉', tag: '器物', gloss: '玉贵温润。宜以温和而坚定的姿态处事。' },
    { ch: '金', tag: '器物', gloss: '金主决断。宜分清利害，把账算清再谈交情。' },
    { ch: '木', tag: '器物', gloss: '木主生长。宜培育长远之事，急功者此时无利。' },
    { ch: '火', tag: '器物', gloss: '火主明烈。宜果断处理积压之事，但须防急躁伤人。' },
    { ch: '土', tag: '器物', gloss: '土主承载。宜踏实垒基，此阶段的功夫在日积月累。' },
    /* 动作 10 */
    { ch: '问', tag: '动作', gloss: '问则不迷。宜开口问明白，猜是最贵的成本。' },
    { ch: '答', tag: '动作', gloss: '答须有据。宜想清楚再回话，此刻不宜随口应承。' },
    { ch: '见', tag: '动作', gloss: '见者相遇。宜当面一谈，隔空传话多有失真。' },
    { ch: '闻', tag: '动作', gloss: '闻者听也。宜多听，听话里的意思而非只听字面。' },
    { ch: '思', tag: '动作', gloss: '思则得之。宜静下来推演一遍，最坏的情形先想好。' },
    { ch: '学', tag: '动作', gloss: '学在日进。宜补上那点欠缺的本事，比自己硬撑划算。' },
    { ch: '守', tag: '动作', gloss: '守者不移。宜守住已有的，此时扩张的风险大于收益。' },
    { ch: '待', tag: '动作', gloss: '待者候时。宜等，但把等的这段时间用来准备。' },
    { ch: '成', tag: '动作', gloss: '成在主收。宜把事收尾，善始更要善终。' },
    { ch: '变', tag: '动作', gloss: '变在时机。宜小改，不宜推倒重来。' },
    /* 数位 10 */
    { ch: '一', tag: '数位', gloss: '一为数之始。宜专注一件事，同时开多头最易皆空。' },
    { ch: '二', tag: '数位', gloss: '二主对待。宜设身处地想一想对面的处境。' },
    { ch: '三', tag: '数位', gloss: '三生万物。宜多备一两个法子，单路行事不留退路。' },
    { ch: '中', tag: '数位', gloss: '中者不偏。宜取折中之策，两边都留一步。' },
    { ch: '正', tag: '数位', gloss: '正者不邪。宜走明路，捷径此时多半有后账。' },
    { ch: '圆', tag: '数位', gloss: '圆者善转。宜灵活处之，规矩之内不妨变通。' },
    { ch: '方', tag: '数位', gloss: '方者有棱。宜有原则，但把棱角藏在礼貌里。' },
    { ch: '长', tag: '数位', gloss: '长主久远。宜着眼长线，此时的小亏未必是亏。' },
    { ch: '久', tag: '数位', gloss: '久者不速。宜有耐心，此事急不来。' },
    { ch: '新', tag: '数位', gloss: '新主更始。宜换一个做法，旧法已到尽头。' }
  ];
  const ZIKU_BY_CH = {};
  ZIKU.forEach(z => { ZIKU_BY_CH[z.ch] = z; });

  /* ============================================================
     二、乩坛仪轨（依民俗记载整理的白话记述，非某书原文）
     ============================================================ */
  const YIGUI = [
    '设坛：择净室设香案，供香、烛、清水与乩盘（沙盘）。坛上悬所请之神号，或关帝、吕祖、文昌、天后，或地方所祀之神。',
    '斋戒净手：与坛者斋戒沐浴、净口，忌荤酒、忌喧哗嬉笑；问事者先在坛前默告所问之事。',
    '请神：焚香、诵请神咒（各地咒文不同），报明坛号、问事人与事由，行三上香或三跪九叩之礼。',
    '开乩：正鸾（执乩者）双手虚扶乩架，副鸾（唱录者）执笔侍立，侍坛者将盘中细沙抹平。',
    '降笔：乩笔在沙上自行书写，或疾或徐，或作圈点、或书符、或先画一圆而后成字。副鸾逐字唱出记录，遇不识之字由坛上公议。',
    '判词与落款：书毕往往另作一"判"，或以神号落款、用印，说明所问之事的宜忌。',
    '送神：谢神、焚化疏文、平沙，乩文誊清入册。',
    '结坛：历次乩文结集，称"鸾书"或"乩录"；鸾堂以此劝善济世，兼作问事之用。'
  ];
  const QIWU = [
    ['乩架 / 乩笔', '丁字木架、柳枝笔，或以筲箕插笔——"扶箕"之名即由此来，亦称"扶鸾"。'],
    ['乩盘 / 沙盘', '木盘铺细沙（或香灰、米），用以显字，亦便抹平重来。'],
    ['香案烛台', '香、烛、清水、疏文与供品。'],
    ['乩录 / 鸾书', '记录乩文的册子；累积成书即称鸾书。'],
    ['正鸾', '执乩者，双手扶架而不主动运笔。'],
    ['副鸾', '唱录者，逐字唱出并记录，亦称唱生、录生。'],
    ['侍坛', '平沙、添香、传递，维持坛场秩序。'],
    ['主坛', '主持请神、送神与坛规。']
  ];
  const WENXIAN = [
    '宋 · 洪迈《夷坚志》：已记扶箕降笔、乩仙作诗判事之事，是现存较早的扶箕记载之一。',
    '清 · 纪昀《阅微草堂笔记》、袁枚《子不语》：多记乩坛事，且作者本人多持审慎或怀疑的态度，常以"理不可解"作结。',
    '明清以降的降笔经卷：如《关圣帝君觉世真经》一类流通极广的劝善书，多自称由乩坛降笔而成；《吕祖全书》亦收大量乩降文字。',
    '鸾堂与鸾书：近现代各地鸾堂以扶乩为主要的劝善与济世手段，自行刊印大量鸾书；民国以来各地鸾堂所编的乩文汇刊（书名著录不一，本站未逐一核校，故不作具体引证）。',
    '许地山《扶箕迷信底研究》（商务印书馆，1941）：以民俗学与心理学的眼光系统梳理扶箕的源流、材料与心理机制，是中文世界最早的专门研究之一。',
    '近现代学界另有以鸾堂、飞鸾、佛教与扶乩之交涉为题的专题研究（散见于宗教学与民俗学刊物）；本站未逐一核校篇目，故不列举。'
  ];
  const JIESHI = [
    '<strong>观念运动效应（ideomotor effect）</strong>：人在"放弃主动控制、只保持接触"的状态下，仍会做出自己意识不到的小幅肌肉运动。十九世纪 Chevreul 的摆锤实验（受试手持悬摆，心中默想摆动方向，摆锤果然按所想方向摆动，而受试自认为手未动）与 Faraday 1853 年对"桌转"的检验，都指向这一机制；Carpenter 在十九世纪中叶把这类现象概括为 "ideomotor action"。',
    '<strong>同源的欧美形态</strong>：planchette（心形板）与 Ouija board（通灵板）与扶乩原理相同，十九世纪中叶以后风行欧美，其兴衰与研究史几乎与扶乩平行。',
    '<strong>预期与注意</strong>：当人把注意放在"等待神示"上，随意的主动控制被有意让开，动作便由更低层的运动程序带出；此时动作确实在发生，只是不在意识的"我在动"这一栏里登记。',
    '<strong>归因错置与感觉衰减</strong>：自己产生的动作，其感官后果会被预测而削弱（sensory attenuation），于是手"像不是我控制的"；人便把这股运动归因于外部力量。',
    '<strong>记录者效应</strong>：沙上笔迹模糊，唱录者倾向于把它读成有意义、通顺的字——这与"辅助沟通"（facilitated communication）一案的经典陷阱同源，后者经严格检验已被推翻。',
    '<strong>无法双盲</strong>：正鸾知道所问之事、也知道坛上供的是哪位神，故乩文的内容必受其知识、记忆与期待影响。这一点既不能证明乩文来自神明，也不否定参与者的真诚——它只是说明，现场结构本身无法把这两种解释分开。'
  ];

  /* ---------- 纯函数：字符串散列（FNV-1a 变体，可复现） ---------- */
  function hashStr(s, seed) {
    let h = (seed >>> 0) || 2166136261;
    h = (h ^ (s.length & 0xffff)) >>> 0;
    for (let i = 0; i < s.length; i++) {
      h = (h ^ (s.charCodeAt(i) & 0xffff)) >>> 0;
      h = Math.imul(h, 16777619) >>> 0;
    }
    return h >>> 0;
  }

  window.ART({
    id: 'fuji',
    name: '扶乩',
    alias: ['扶箕', '扶鸾', '降笔', '乩坛'],
    gua: 'dui',
    order: 3,
    tagline: '乩笔沙盘书字 · 民间信仰活动；本页为文化演示，乩文由可复现随机数生成',

    intro: `
      <p>扶乩亦称<strong>扶箕</strong>、<strong>扶鸾</strong>、<strong>降笔</strong>，是流传于民间信仰中的"请神书字"之法：
      一人扶乩架（或筲箕插笔），一人唱录，乩笔在沙盘上自行书写，坛上众人以其字为神示，录而成文，谓"鸾书"。
      其事宋代已见记载（洪迈《夷坚志》），明清大盛，纪昀《阅微草堂笔记》、袁枚《子不语》多记之且多存疑；
      明清以降大量的"降笔"劝善经卷与近现代的鸾堂（鸾书）皆出于此。许地山《扶箕迷信底研究》（1941）
      以民俗学与心理学的眼光系统梳理了它的源流与材料，是中文世界最早的专门研究之一。</p>
      <p>近代以来，学界对"乩笔自动书写"的解释集中在<strong>观念运动效应（ideomotor effect）</strong>：
      人在只保持接触、有意放弃主动控制时，会出现自己意识不到的小幅肌肉运动。十九世纪 Chevreul 的摆锤实验
      与 Faraday 对"桌转"的检验都指向这一机制，欧美的 planchette 与 Ouija board 与扶乩同源同理。
      现代心理学更补充了预期与注意、归因错置、感觉衰减、记录者效应等环节。须如实说明：
      <strong>这些解释既不能证明乩文来自神明，也不否定参与者的真诚</strong>；
      但它确实说明——乩坛的现场结构（正鸾知道所问、知道所请之神）<em>无法双盲</em>，
      故乩文的内容必然受参与者的知识与期待影响。</p>
      <p>本站把扶乩作为<strong>民俗文化</strong>来介绍：这里<strong>不请神、不降笔、不设坛</strong>。
      下面的"乩笔书字"是一个演示程序——它用<strong>可复现的伪随机数</strong>从本站内置的 84 字字库中取字，
      同一个人、同一问题、同一时刻，必得同一篇乩文；换一个字，全篇就变。所谓"判词"也是本站自撰的白话，
      与任何神明、任何古书都无关。<strong>请勿据以决策。</strong></p>`,

    method: `
      <p>写下<strong>所问之事</strong>（一句话即可），再选<strong>起乩时刻</strong>，按"起乩"。
      程序会显示一篇四至八字的乩文，并逐字给出白话"判词"。每一字的出处、字库类别、以及笔迹生长所用的
      延时与位置抖动参数，都会一并列出。</p>
      <p><strong>取字规则（写明，可复现）：</strong>种子 = FNV-1a 散列（所问文字，初值取「字数 × 2654435761」）
      → 再混入起乩时刻字符串 → 再异或（日干支序 × 7919 + 时干支序 × 104729）。
      以该种子初始化确定性随机源（mulberry32），字数为 4 + randInt(0,4)，字序由该随机源洗牌决定。
      因此：<em>同问、同时 → 同文；改一字或改一分钟 → 全篇不同。</em>
      这一点本身就是对"乩文有定数"的说明：变的不是神意，是种子。</p>
      <p>再说一次：本页<strong>不祈请、不降神</strong>，乩文是随机组合的文字，不是任何神明的指示，
      也不构成对未来的预测。<strong>请勿据以决策</strong>——凡涉医疗、法律、财务、婚嫁之事，请依专业意见与自己的判断。</p>`,

    form: [
      { name: 'q', label: '所问之事', type: 'text', value: '', wide: true, placeholder: '如：此事宜进宜退', hint: '一句话即可；留空则按"未书所问"起乩' },
      { name: 'dt', label: '起乩时刻', type: 'datetime-local', value: U.nowStr(), hint: '与问题一同决定乩文（同问同时必得同文）' }
    ],

    cast(input) {
      const q = String(input.q === undefined || input.q === null ? '' : input.q).trim().slice(0, 80);
      const asked = q || '（未书所问）';
      const dtStr = String(input.dt || '');
      const date = U.parseDT(dtStr);
      const fp = G.fourPillars(date);

      /* 可复现种子：问题字数 + 问题字符 + 时刻 + 当日/当时干支 */
      let seed = hashStr(asked, Math.imul(asked.length, 2654435761) >>> 0);
      seed = hashStr(dtStr, seed);
      seed = (seed ^ ((fp.day.idx * 7919 + fp.hour.idx * 104729) >>> 0)) >>> 0;
      if (!seed) seed = 1;

      const rng = C.RNG.seeded(seed);
      const count = 4 + rng.randInt(0, 4);                  /* 4~8 字 */
      const pool = rng.sample(ZIKU, ZIKU.length);            /* 洗牌后取前 count 字 */
      const chars = [];
      for (let i = 0; i < count; i++) {
        const z = pool[i % pool.length];
        const prev = i === 0 ? 260 : chars[i - 1].delay + chars[i - 1].write;
        chars.push({
          ch: z.ch, tag: z.tag, gloss: z.gloss,
          delay: prev + (i === 0 ? 0 : 240 + rng.randInt(0, 380)),   /* 笔顺延时（毫秒） */
          write: 620 + rng.randInt(0, 520),                          /* 单字书写时长 */
          jx: rng.randInt(-7, 7), jy: rng.randInt(-6, 6),             /* 位置抖动（像素） */
          rot: rng.randInt(-48, 48) / 1000,                            /* 倾斜（弧度） */
          scale: 0.9 + rng.randInt(0, 16) / 100,
          ink: 0.6 + rng.randInt(0, 32) / 100
        });
      }
      const last = chars[chars.length - 1];
      return {
        ask: asked, asked2: q, isDefault: !q,
        seed: seed, seedText: '0x' + seed.toString(16).toUpperCase().padStart(8, '0'),
        count: count, chars: chars, totalMs: last.delay + last.write + 500,
        dtText: dtStr ? dtStr.replace('T', ' ') : '（未填时刻）',
        dayGZ: fp.day.name, hourGZ: fp.hour.name, monthZhi: fp.month.zhi, jie: fp.month.jie,
        zikuSize: ZIKU.length
      };
    },

    view(d) {
      const ban = U.note('<strong>乩文为随机生成，非任何神明降笔，请勿据以决策。</strong>' +
        '本页不祈请、不降神；乩文由可复现的伪随机数从本站自撰字库中取出，判词亦为本站自撰白话。' +
        '<em>凡涉医疗、法律、财务、婚嫁之事，请依专业意见与自己的判断。</em>', true);

      const head = U.resHead('乩笔书字 · ' + d.chars.map(c => c.ch).join(''),
        d.count + ' 字 · 种子 ' + d.seedText);

      const askCard = U.card('所问', U.kv([
        ['所问之事', U.esc(d.ask) + (d.isDefault ? '<span style="font-size:11.5px;color:#9a9486">（未书，按默认起乩）</span>' : '')],
        ['起乩时刻', U.esc(d.dtText)],
        ['坛上干支', U.wx(d.dayGZ) + '日 · ' + U.wx(d.hourGZ) + '时（月建 ' + U.wx(d.monthZhi) + '，节气 ' + U.esc(d.jie) + '）'],
        ['取字种子', '<span class="mono-k">' + d.seedText + '</span>（同问同时必得同文）'],
        ['字库', '本站自撰常用字 ' + d.zikuSize + ' 个，每字一句白话判词']
      ]));

      const wenCard = U.card('乩文（沙盘显字）',
        '<div class="figure"><canvas id="fuji-canvas" width="760" height="300" style="width:100%;max-width:100%"></canvas></div>' +
        '<div class="verse">' + d.chars.map(c => '<span class="l">' + U.esc(c.ch) + '</span>').join('') + '</div>' +
        U.note('沙盘显字为"笔迹生长"动画：<strong>cast 只出数据</strong>（字序列、笔顺延时、单字书写时长、位置抖动 jx/jy、倾斜 rot、缩放 scale、墨色 ink），' +
          '<strong>mount 只按数据绘制</strong>，动画中不含任何随机。若系统设为"减少动态效果"，则直接显示成文。'));

      const pan = U.card('判词 · 逐字白话转译（本站自撰）',
        U.table(['序', '字', '类', '判词（白话转译）'],
          d.chars.map((c, i) => ({
            cells: [String(i + 1), '<span class="mono-k">' + U.esc(c.ch) + '</span>', U.esc(c.tag), U.esc(c.gloss)],
            left: [3], mono: [1]
          })), { align: ['c', 'c', 'c', 'l'] }) +
        U.p('<strong>参考连读（本站自撰，非乩文原意）：</strong>' + U.esc(d.chars.map(c => c.gloss).join(''))) +
        U.note('这些判词一律只谈处事与心态上的倾向，不写寿命、疾病、灾祸、贫富、婚姻成败——' +
          '既是本站的自我约束，也因为这些字本来就是随机取出的，没有可断之事。'));

      const yigui = U.card('乩坛仪轨（依民俗记载整理的白话记述）',
        U.ul(YIGUI) +
        U.note('仪轨各处坛堂互有异同（请神咒、叩拜之数、落款格式皆不同），此处为<strong>概括性的白话记述</strong>，' +
          '不是任何一坛的坛规原文。'));

      const qiwu = U.card('坛上人物与器物', U.kv(QIWU));

      const wenxian = U.card('历史上著名的乩坛与文献', U.ul(WENXIAN) +
        U.note('凡本站未能核校者（如民国以来各地鸾堂自印的乩文汇刊），只作类别性的说明，<strong>不举具体书名与卷数</strong>，' +
          '以免以讹传讹。'));

      const jieshi = U.card('学界对自动书写现象的解释', U.ul(JIESHI) +
        U.note('一次可以在家里做的小观察：同一个人、同一个问题，在不告知"所请何神"的情况下重复扶乩。' +
          '若前后文字随"所请之神"而变（请关帝则语多刚健、请吕祖则语多飘逸），变的便是人心里对这两位神的<em>文体预设</em>，' +
          '而不是神的文风。'));

      const terms = U.card('术语小释', U.kv([
        ['扶乩 / 扶箕 / 扶鸾', '同一类活动的不同称法。称"箕"因旧时以筲箕插笔；称"鸾"因乩坛多请"鸾驾"（神驾）。'],
        ['正鸾 / 副鸾', '正鸾执乩架而不主动运笔；副鸾唱录，逐字唱出并记录。'],
        ['开乩 / 降笔', '"开乩"指起坛扶笔；"降笔"指乩笔自行书写，坛上以为神降。'],
        ['鸾书 / 乩录', '乩文的结集。鸾堂以此劝善济世，兼作问事之用。'],
        ['观念运动效应', 'ideomotor effect：放弃主动控制时产生的、自己意识不到的细微肌肉运动，是自动书写现象的主要解释。'],
        ['自动书写', 'automatic writing / automatism：手在脱离主动注意的状态下自行书写，十九至二十世纪在心理学与文学中皆有人实践。']
      ]));

      const tail = U.note('本页标注为<strong>文化演示 / 自撰 / 随机生成</strong>之处：①"乩笔书字"程序<strong>不祈请、不降神</strong>，' +
        '乩文由可复现伪随机数从内置字库取出；②字库 84 字与其"判词"全部为<strong>本站自撰白话</strong>，与古籍、坛规、神谕无关；' +
        '③仪轨、器物、文献三节为依民俗与公开记载整理的<strong>概括记述</strong>，非某书原文，未能核校者已注明不作具体引证；' +
        '④沙盘动画为本站自绘，仅为观感。' +
        '再次声明：<strong>乩文不是任何神明的指示，也不构成对未来的预测，请勿据以决策。</strong>', true);

      return ban + head + U.sec('起乩', askCard) + U.sec('乩文', wenCard + pan) +
        U.sec('乩坛', yigui + qiwu) + U.sec('源流与解释', wenxian + jieshi) +
        U.sec('参考', terms + tail +
          U.disclaim('扶乩为民间信仰活动，涉及心理暗示与自动书写（观念运动效应）；本站仅作文化演示，不提供任何超自然服务。'));
    },

    /* 唯一可操作 DOM 的地方：把 cast 给的数据画出来 */
    mount(root, data) {
      const cv = root.querySelector('#fuji-canvas');
      if (!cv || !cv.getContext || !data || !data.chars || !data.chars.length) return;
      const ctx = cv.getContext('2d');
      const W = cv.width, H = cv.height;
      const chars = data.chars;
      const n = chars.length;
      const cellW = (W - 96) / n;
      const size = Math.max(30, Math.min(92, cellW - 12));
      const cy = H / 2 - 6;

      /* 位置只由 cast 的数据决定，绘图本身不再取随机（用固定式伪随机做沙纹） */
      const xs = [], ys = [];
      for (let i = 0; i < n; i++) {
        xs.push(48 + cellW * (i + 0.5) + chars[i].jx);
        ys.push(cy + chars[i].jy);
      }

      function sand() {
        ctx.clearRect(0, 0, W, H);
        /* 沙盘底 */
        ctx.fillStyle = 'rgba(232,220,196,.55)';
        ctx.beginPath();
        if (ctx.roundRect) { ctx.roundRect(8, 8, W - 16, H - 16, 10); } else { ctx.rect(8, 8, W - 16, H - 16); }
        ctx.fill();
        ctx.strokeStyle = 'rgba(90,74,40,.45)';
        ctx.lineWidth = 2;
        ctx.stroke();
        /* 沙纹（固定式伪随机，与数据无关） */
        ctx.strokeStyle = 'rgba(120,104,78,.16)';
        ctx.lineWidth = 1;
        let s = 20260101;
        const rnd = () => { s = (Math.imul(s, 1103515245) + 12345) & 0x7fffffff; return s / 0x7fffffff; };
        for (let i = 0; i < 46; i++) {
          const y = 16 + rnd() * (H - 32);
          const x0 = 16 + rnd() * (W - 120);
          const x1 = x0 + 40 + rnd() * 140;
          ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y + (rnd() - 0.5) * 3); ctx.stroke();
        }
      }

      function glyph(c, p, x, y) {
        const half = size * 0.78;
        const h = half * 2;
        const top = -half;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(c.rot);
        ctx.scale(c.scale, c.scale);
        ctx.font = 'bold ' + size + 'px "Kaiti SC","STKaiti","KaiTi","Songti SC","STSong","SimSun",serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.save();
        if (p < 1) { ctx.beginPath(); ctx.rect(-half, top, half * 2, h * Math.max(0.02, p)); ctx.clip(); }
        ctx.fillStyle = 'rgba(58,48,34,' + c.ink + ')';
        ctx.fillText(c.ch, 0, 0);
        ctx.restore();
        ctx.restore();
        /* 笔尖 */
        if (p < 1) {
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(c.rot);
          ctx.beginPath();
          ctx.arc(0, top + h * p, 4.2, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(168,50,45,.85)';
          ctx.fill();
          ctx.restore();
        }
      }

      function paint(t) {
        sand();
        for (let i = 0; i < n; i++) {
          if (t < chars[i].delay) continue;
          const p = Math.min(1, (t - chars[i].delay) / chars[i].write);
          glyph(chars[i], p, xs[i], ys[i]);
        }
      }

      const reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
      if (reduce || !window.requestAnimationFrame) { paint(data.totalMs); return; }

      if (cv.__fujiRaf) window.cancelAnimationFrame(cv.__fujiRaf);
      const t0 = window.performance && window.performance.now ? window.performance.now() : Date.now();
      const step = (now) => {
        const t = now - t0;
        paint(t);
        if (t < data.totalMs) cv.__fujiRaf = window.requestAnimationFrame(step);
        else cv.__fujiRaf = 0;
      };
      cv.__fujiRaf = window.requestAnimationFrame(step);
    }
  });
})();
