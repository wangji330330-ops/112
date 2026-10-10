/* ============================================================
   八卦盘（枢纽）
   - 先天八卦方位：乾南（上）坤北（下）离东（左）坎西（右）
   - 点击卦象 → 八卦转动 → 以水墨连线牵出该卦所系之术数
   - 与八卦无象数关联者，列于大八卦之下（其他术数）
   ============================================================ */
(function () {
  'use strict';
  const C = window.CORE;

  /* 顺时针（自顶端起）：乾 巽 坎 艮 坤 震 离 兑 —— 传统先天八卦图方位 */
  const WHEEL_ORDER = ['qian', 'xun', 'kan', 'gen', 'kun', 'zhen', 'li', 'dui'];
  const R_OUT = 470, R_IN = 288;
  const CN = 500;

  function polar(r, deg) {
    const a = (deg - 90) * Math.PI / 180;
    return [CN + r * Math.cos(a), CN + r * Math.sin(a)];
  }
  function sectorPath(r0, r1, a0, a1) {
    const [x0, y0] = polar(r1, a0), [x1, y1] = polar(r1, a1);
    const [x2, y2] = polar(r0, a1), [x3, y3] = polar(r0, a0);
    const large = (a1 - a0) > 180 ? 1 : 0;
    return `M${x0.toFixed(2)},${y0.toFixed(2)} A${r1},${r1} 0 ${large} 1 ${x1.toFixed(2)},${y1.toFixed(2)} ` +
      `L${x2.toFixed(2)},${y2.toFixed(2)} A${r0},${r0} 0 ${large} 0 ${x3.toFixed(2)},${y3.toFixed(2)} Z`;
  }

  /* 八方文字：不随盘自转，而以「文字块中心到盘心的距离」算出落点，
     故无论盘如何转动，八方之卦名永远正立可读。 */
  /* 八方文字：不随盘自转，而以「文字块中心到盘心的距离」算出落点，
     故无论盘如何转动，八方之卦名永远正立可读。
     扇区自 R_IN(288) 至 R_OUT(470)，文字块中心取 R_LABEL(381)，
     卦象（爻）与卦名分别落在 400 / 321 两条基线上，上下留白大致相当。 */
  const R_LABEL = 381;
  function labelXY(i, sel) {
    const phi = (i - sel) * 45 * Math.PI / 180;
    return [500 + R_LABEL * Math.sin(phi), 500 - R_LABEL * Math.cos(phi)];
  }
  function labelTf(x, y) { return 'translate(' + x.toFixed(2) + 'px,' + y.toFixed(2) + 'px)'; }

  const Hub = {
    current: null,
    onOpenArt: null,
    onOpenBranch: null,
    isSpinning: false,
    _spinAnim: null,
    _currentRot: 0,

    isMobile() { return window.matchMedia('(max-width: 940px)').matches; },

    /* ---------- 构建 ---------- */
    init() {
      const host = document.getElementById('wheel-host');
      host.innerHTML = this.buildSvg() + `<div class="wheel-center" id="wheel-center"></div>`;
      this.setCenter(null);
      this.buildOtherStrip();
      this.bind();
    },

    buildSvg() {
      const p = [];
      p.push('<svg viewBox="0 0 1000 1000" aria-label="八卦盘">');
      /* 外圈 */
      p.push(`<circle cx="500" cy="500" r="${R_OUT + 22}" class="ring-line strong"/>`);
      p.push(`<circle cx="500" cy="500" r="${R_OUT + 8}" class="ring-line"/>`);
      p.push(`<g class="wheel-rot" id="wheelRot">`);
      /* 十二地支环（原二十四山装饰环从略，以求清晰） */
      p.push(`<circle cx="500" cy="500" r="212" class="ring-line"/>`);
      C.ZHI.forEach((z, i) => {
        const deg = i * 30;
        p.push(`<g transform="rotate(${deg} 500 500)"><text class="ring-txt" x="500" y="${500 - 256 + 7}" text-anchor="middle" font-size="20">${z}</text></g>`);
      });
      /* 盘心阴阳鱼：阳之首朝乾（先天之位在上）、阴之首朝坤（在下），
         与盘同转，故乾恒为阳首、坤恒为阴首。 */
      const TR = 112;
      p.push(`<g class="taiji" aria-hidden="true">
        <circle class="tj-yin-bg" cx="500" cy="500" r="${TR}"/>
        <path class="tj-yang-fish" d="M500,${500 - TR} A${TR},${TR} 0 0 1 500,${500 + TR} A${TR / 2},${TR / 2} 0 0 0 500,500 A${TR / 2},${TR / 2} 0 0 1 500,${500 - TR} Z"/>
        <circle class="tj-eye-b" cx="500" cy="${500 - TR / 2}" r="13"/>
        <circle class="tj-eye-w" cx="500" cy="${500 + TR / 2}" r="13"/>
      </g>`);
      /* 八卦扇区 */
      const dpath = sectorPath(R_IN, R_OUT, -23.3, 23.3);
      WHEEL_ORDER.forEach((id, i) => {
        const g = C.GUA_BY_ID[id];
        const n = window.artsOfGua(id).length;
        p.push(`<g class="sector" transform="rotate(${i * 45} 500 500)" data-gua="${id}" tabindex="0" role="button" aria-label="${g.name}卦，${n}门术数">`);
        p.push(`<path class="sec-fill" d="${dpath}"/>`);
        p.push(`<path class="sec-tint" d="${dpath}" stroke="none"/>`);
        p.push('</g>');
      });
      p.push(`</g>`);   /* /wheel-rot */
      /* 八方文字另置一层（不随盘自转，恒正立） */
      p.push(`<g id="sec-labels">`);
      WHEEL_ORDER.forEach((id, i) => {
        const g = C.GUA_BY_ID[id];
        const xy = labelXY(i, 0);
        p.push(`<g class="sec-label" data-i="${i}" style="transform:${labelTf(xy[0], xy[1])}">`);
        p.push(`<text class="sec-trig" x="0" y="-14" text-anchor="middle" font-size="52">${g.symbol}</text>`);
        p.push(`<text class="sec-name" x="0" y="60" text-anchor="middle" font-size="46">${g.name}</text>`);
        p.push('</g>');
      });
      p.push(`</g>`);
      /* 盘心读数（不随盘自转，恒正立） */
      p.push(`<text class="center-readout" id="centerReadout" x="500" y="652" text-anchor="middle" font-size="20"></text>`);
      p.push('</svg>');
      return p.join('');
    },

    buildOtherStrip() {
      const wrap = document.getElementById('other-strip');
      const list = window.otherArts();
      wrap.innerHTML =
        `<div class="strip-head"><span class="sh-t">其他术数</span><span class="sh-d">不与八卦相系</span></div>` +
        `<div class="strip-list">` + list.map(a =>
          `<button class="ocard${a.ready ? '' : ' pending'}" data-art="${a.id}"${a.ready ? '' : ' disabled'}>` +
          `<span class="oc-n">${a.name}</span><span class="oc-t">${(a.tags || []).join(' · ')}</span></button>`).join('') +
        `</div><p class="strip-note">${window.OTHER_ARTS.lead}</p>`;
      wrap.querySelectorAll('.ocard').forEach(el => {
        el.addEventListener('click', () => {
          if (el.disabled) return;
          if (this.onOpenArt) this.onOpenArt(el.dataset.art);
        });
      });
    },

    bind() {
      const host = document.getElementById('wheel-host');
      host.querySelectorAll('.sector').forEach(sec => {
        const id = sec.dataset.gua;
        sec.addEventListener('click', () => this.toggle(id));
        sec.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.toggle(id); } });
        sec.addEventListener('mouseenter', () => {
          this.hotLabel(id, true);
          if (!this.current) this.setCenter(id, true);
        });
        sec.addEventListener('mouseleave', () => {
          this.hotLabel(id, false);
          if (!this.current) this.setCenter(null);
        });
      });
      const center = document.getElementById('wheel-center');
      center.addEventListener('click', () => {
        if (this.isSpinning) {
          this.stopSpin();
          return;
        }
        if (this.current) { this.clear(); return; }
        this.spin();
      });
    },

    hotLabel(guaId, on) {
      const i = WHEEL_ORDER.indexOf(guaId);
      const el = document.querySelector('.sec-label[data-i="' + i + '"]');
      if (el) el.classList.toggle('hot', on);
    },

    toggle(id) {
      if (this.current === id) { this.clear(); return; }
      this.select(id);
    },

    /* 使八方文字始终正立：文字自转 = (选中序 − 本卦序) × 45° */
    setLabels(sel) {
      document.querySelectorAll('.sec-label').forEach(el => {
        const i = Number(el.dataset.i);
        const xy = labelXY(i, sel < 0 ? 0 : sel);
        el.style.transform = labelTf(xy[0], xy[1]);
        el.classList.toggle('on', i === sel);
      });
    },

    /* ---------- 选择某卦 ---------- */
    select(id) {
      const idx = WHEEL_ORDER.indexOf(id);
      if (idx < 0) return;
      this.current = id;
      const rot = document.getElementById('wheelRot');
      const target = -idx * 45;
      this._currentRot = target;
      rot.style.transition = 'transform .8s var(--ease)';
      rot.style.transform = `rotate(${target}deg)`;
      this.setLabels(idx);
      document.querySelectorAll('.sector').forEach(s => s.classList.toggle('on', s.dataset.gua === id));
      window.HUB.setCenter(id);
      document.getElementById('hub').classList.add('branch');
      document.body.classList.add('branch-open');
      if (this.isMobile()) {
        document.getElementById('branch-nodes').innerHTML = '';
        if (this.onOpenBranch) this.onOpenBranch(id);
        return;
      }
      this.renderNodes(id);
    },

    clear() {
      this.current = null;
      this._currentRot = 0;
      document.getElementById('wheelRot').style.transform = 'rotate(0deg)';
      this.setLabels(-1);
      document.querySelectorAll('.sector').forEach(s => s.classList.remove('on'));
      document.getElementById('hub').classList.remove('branch');
      document.body.classList.remove('branch-open');
      const bn = document.getElementById('branch-nodes');
      bn.innerHTML = '';
      this.setCenter(null);
    },

    setCenter(guaId, hover) {
      const el = document.getElementById('centerReadout');
      if (!el) return;
      if (!guaId) {
        el.textContent = '';
        el.style.opacity = '0';
        return;
      }
      const g = C.GUA_BY_ID[guaId];
      const n = window.artsOfGua(guaId).length;
      el.textContent = `${g.symbol} ${g.name} · ${g.nature} · ${n}门`;
      el.style.opacity = hover ? '.72' : '1';
    },

    /* ---------- 分支节点 ---------- */
    renderNodes(guaId) {
      const arts = window.artsOfGua(guaId);
      const bn = document.getElementById('branch-nodes');
      bn.innerHTML = arts.map(a =>
        `<button class="bnode${a.ready ? '' : ' pending'}" data-art="${a.id}"${a.ready ? '' : ' disabled'}>` +
        `<h5><span class="bn-idx">${String(a.idx).padStart(2, '0')}</span>${a.name}</h5>` +
        `<p>${a.tagline}</p>` +
        `<div class="tags">${(a.tags || []).map(t => `<span class="tag">${t}</span>`).join('')}</div>` +
        `</button>`).join('');
      bn.querySelectorAll('.bnode').forEach(el => {
        el.addEventListener('click', () => { if (!el.disabled && this.onOpenArt) this.onOpenArt(el.dataset.art); });
      });
    },

    /* ---------- 自动旋转：缓慢 → 快速 → 缓慢 → 停止 ---------- */
    spin() {
      if (this.isSpinning) return;
      this.isSpinning = true;
      const rot = document.getElementById('wheelRot');
      rot.style.transition = 'none';
      const start = this._currentRot || 0;
      const totalRev = 3 + Math.random() * 2; // 3~5 圈
      const totalDeg = totalRev * 360;
      const duration = 2500 + Math.random() * 600; // 2.5~3.1s
      const startTs = performance.now();

      const easeInOutCubic = (t) => t < 0.5
        ? 4 * t * t * t
        : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;

      const tick = (ts) => {
        const elapsed = ts - startTs;
        let p = Math.min(elapsed / duration, 1);
        p = easeInOutCubic(p);
        const cur = start + totalDeg * p;
        this._currentRot = ((cur % 360) + 360) % 360;
        rot.style.transform = `rotate(${cur}deg)`;
        this.setLabels(-1);
        if (p < 1) {
          this._spinAnim = requestAnimationFrame(tick);
        } else {
          this.isSpinning = false;
          cancelAnimationFrame(this._spinAnim);
          this._spinAnim = null;
          this._currentRot = 0;
          rot.style.transition = 'none';
          rot.style.transform = 'rotate(0deg)';
          this.setLabels(-1);
        }
      };
      this._spinAnim = requestAnimationFrame(tick);
    },

    stopSpin() {
      if (!this.isSpinning) return;
      this.isSpinning = false;
      if (this._spinAnim) {
        cancelAnimationFrame(this._spinAnim);
        this._spinAnim = null;
      }
      const rot = document.getElementById('wheelRot');
      rot.style.transition = 'transform .5s var(--ease)';
      this._currentRot = ((this._currentRot % 360) + 360) % 360;
      rot.style.transform = `rotate(${this._currentRot}deg)`;
    }
  };

  window.HUB = Hub;
})();
