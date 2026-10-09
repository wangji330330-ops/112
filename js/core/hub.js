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
  const R_OUT = 470, R_IN = 300;
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
  const R_LABEL = 355;                       // 文字块中心至盘心（1000 视框单位）
  function labelXY(i, sel) {
    const phi = (i - sel) * 45 * Math.PI / 180;
    return [500 + R_LABEL * Math.sin(phi), 500 - R_LABEL * Math.cos(phi)];
  }
  function labelTf(x, y) { return 'translate(' + x.toFixed(2) + 'px,' + y.toFixed(2) + 'px)'; }

  const Hub = {
    current: null,
    onOpenArt: null,
    onOpenBranch: null,
    _ro: null,

    isMobile() { return window.matchMedia('(max-width: 940px)').matches; },

    /* ---------- 构建 ---------- */
    init() {
      const host = document.getElementById('wheel-host');
      host.innerHTML = this.buildSvg() + `<div class="wheel-center" id="wheel-center"></div>`;
      this.setCenter(null);
      this.buildOtherStrip();
      this.bind();
      const rot = document.getElementById('wheelRot');
      /* 懒自适应：尺寸变化则重画连线 */
      if (window.ResizeObserver) {
        this._ro = new ResizeObserver(() => this.scheduleLines());
        this._ro.observe(host);
        const bn = document.getElementById('branch-nodes');
        if (bn) this._ro.observe(bn);
      }
      window.addEventListener('resize', () => this.scheduleLines());
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
        const n = window.artsOfGua(id).length;
        const xy = labelXY(i, 0);
        p.push(`<g class="sec-label" data-i="${i}" style="transform:${labelTf(xy[0], xy[1])}">`);
        p.push(`<text class="sec-trig" x="0" y="-47" text-anchor="middle" font-size="56">${g.symbol}</text>`);
        p.push(`<text class="sec-name" x="0" y="17" text-anchor="middle" font-size="46" letter-spacing="6">${g.name}</text>`);
        p.push(`<text class="sec-nat" x="0" y="47" text-anchor="middle" font-size="22">${g.nature} · ${n}门</text>`);
        p.push('</g>');
      });
      p.push(`</g>`);
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
      center.addEventListener('click', () => { if (this.current) this.clear(); });
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
      rot.style.transform = `rotate(${-idx * 45}deg)`;
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
      document.getElementById('wheelRot').style.transform = 'rotate(0deg)';
      this.setLabels(-1);
      document.querySelectorAll('.sector').forEach(s => s.classList.remove('on'));
      document.getElementById('hub').classList.remove('branch');
      document.body.classList.remove('branch-open');
      const bn = document.getElementById('branch-nodes');
      bn.innerHTML = '';
      document.getElementById('branch-lines').innerHTML = '';
      this.setCenter(null);
    },

    setCenter(guaId, hover) {
      const el = document.getElementById('wheel-center');
      if (!el) return;
      if (!guaId) {
        el.innerHTML = `<div class="wc-hint">八卦枢机</div><div class="wc-sub">择一卦 &nbsp;入其门</div>`;
        return;
      }
      const g = C.GUA_BY_ID[guaId];
      const n = window.artsOfGua(guaId).length;
      el.innerHTML = `<div class="wc-trig">${g.symbol}</div>` +
        `<div class="wc-name">${g.name}</div>` +
        `<div class="wc-sub">${g.nature} · ${g.dex} · ${n}门术数</div>`;
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
      this.scheduleLines();
      /* 待缩放过渡结束后再精确画一次 */
      setTimeout(() => this.drawLines(), 950);
      setTimeout(() => this.drawLines(), 1800);
    },

    scheduleLines() {
      if (this._raf) cancelAnimationFrame(this._raf);
      this._raf = requestAnimationFrame(() => this.drawLines());
    },

    drawLines() {
      const svg = document.getElementById('branch-lines');
      const hub = document.getElementById('hub');
      const host = document.getElementById('wheel-host');
      if (!svg || !hub || !host) return;
      if (!this.current) { svg.innerHTML = ''; return; }
      const hr = hub.getBoundingClientRect();
      const wr = host.getBoundingClientRect();
      svg.setAttribute('viewBox', `0 0 ${Math.round(hr.width)} ${Math.round(hr.height)}`);
      svg.setAttribute('width', Math.round(hr.width));
      svg.setAttribute('height', Math.round(hr.height));
      const sx = wr.left + wr.width / 2 - hr.left;
      const sy = wr.top - hr.top + wr.height * 0.028;      /* 顶端扇区外缘附近 */
      const nodes = Array.prototype.slice.call(document.querySelectorAll('.bnode'));
      const out = [];
      out.push(`<circle class="bl-origin" cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="4.5"/>`);
      nodes.forEach((n, i) => {
        const r = n.getBoundingClientRect();
        const ex = r.left - hr.left, ey = r.top + r.height / 2 - hr.top;
        const cx1 = sx + (ex - sx) * 0.62, cy1 = sy + (ey - sy) * 0.1;
        out.push(`<path class="bl" d="M${sx.toFixed(1)},${sy.toFixed(1)} Q${cx1.toFixed(1)},${cy1.toFixed(1)} ${ex.toFixed(1)},${ey.toFixed(1)}" style="--i:${i}"/>`);
        out.push(`<circle class="bl-dot" cx="${ex.toFixed(1)}" cy="${ey.toFixed(1)}" r="3.4" style="--i:${i}"/>`);
      });
      svg.innerHTML = out.join('');
      /* 连线以淡入呈现（无水墨描线动画） */
      svg.querySelectorAll('.bl, .bl-dot, .bl-origin').forEach(el => {
        el.style.opacity = '0';
        requestAnimationFrame(() => {
          el.style.transition = 'opacity .22s ease';
          el.style.opacity = '1';
        });
      });
    }
  };

  window.HUB = Hub;
})();
