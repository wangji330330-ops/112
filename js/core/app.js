/* ============================================================
   应用层：路由 / 卷轴面板 / 水墨转场 / 起课表单
   ============================================================ */
(function () {
  'use strict';
  const C = window.CORE, U = C.UI;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.prototype.slice.call((r || document).querySelectorAll(s));

  /* ============================================================
     换页：整屏遮罩淡入淡出（清晰的过渡，不用水墨）
     ============================================================ */
  const Fade = {
    init() {
      this.layer = $('#fade-layer');
    },
    hide() {
      if (this.layer) this.layer.style.opacity = '0';
    },
    /* 全流程：遮罩淡入 → 换内容 → 淡出 */
    async run(fn) {
      const layer = this.layer;
      if (!layer) { try { fn(); } catch (e) { console.error(e); } return; }
      layer.style.transition = 'opacity .16s ease';
      layer.style.opacity = '1';
      await new Promise(r => setTimeout(r, 175));
      try { fn(); } catch (e) { console.error(e); }
      await new Promise(r => setTimeout(r, 30));
      layer.style.opacity = '0';
      await new Promise(r => setTimeout(r, 175));
    }
  };

  /* ============================================================
     提示
     ============================================================ */
  let toastTimer;
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
  }

  /* ============================================================
     应用
     ============================================================ */
  const APP = {
    state: { art: null, gua: null, mode: 'hub' },

    init() {
      Fade.init();
      window.HUB.init();
      window.HUB.onOpenArt = id => this.openArt(id);
      window.HUB.onOpenBranch = guaId => this.openBranchList(guaId);
      $('#brand').addEventListener('click', () => this.goHub(true));
      window.addEventListener('keydown', e => { if (e.key === 'Escape') this.back(); });
      window.addEventListener('hashchange', () => this.applyHash());
      this.renderCrumbs();
      this.applyHash();
    },

    /* ---------- 地址栏路由（#/gua/qian、#/art/qimen）---------- */
    setHash(h) { if (location.hash !== h) { try { history.replaceState(null, '', h); } catch (e) { location.hash = h; } } },

    applyHash() {
      const h = location.hash || '';
      let m = h.match(/^#\/art\/([\w-]+)/);
      if (m) { if (this.state.art !== m[1]) this.openArt(m[1], true); return; }
      m = h.match(/^#\/gua\/(\w+)/);
      if (m && C.GUA_BY_ID[m[1]]) { if (this.state.mode !== 'branch' || this.state.gua !== m[1]) this.goGua(m[1], true); return; }
      if (this.state.mode !== 'hub') this.goHub(false, true);
    },

    /* ---------- 路径面包屑 ---------- */
    renderCrumbs() {
      const el = $('#crumbs');
      const parts = [];
      if (this.state.mode === 'hub') {
        parts.push(`<span class="crumb here">八卦</span>`);
      } else {
        parts.push(`<button class="crumb" data-go="hub">八卦</button>`);
      }
      if (this.state.gua) {
        const g = C.GUA_BY_ID[this.state.gua];
        parts.push('<span class="crumb-sep">›</span>');
        if (this.state.mode === 'art') parts.push(`<button class="crumb" data-go="gua">${g.symbol} ${g.name}</button>`);
        else parts.push(`<span class="crumb here">${g.symbol} ${g.name}</span>`);
      }
      if (this.state.mode === 'art' && this.state.art) {
        const m = window.artMeta(this.state.art);
        parts.push('<span class="crumb-sep">›</span>');
        parts.push(`<span class="crumb here">${m ? m.name : ''}</span>`);
      }
      if (this.state.mode === 'branch' && this.mobile()) {
        const g = C.GUA_BY_ID[this.state.gua];
        parts.push('<span class="crumb-sep">›</span>');
        parts.push(`<span class="crumb here">${g.name}卦之门</span>`);
      }
      el.innerHTML = parts.join('');
      $$('.crumb[data-go]', el).forEach(b => b.addEventListener('click', () => {
        if (b.dataset.go === 'hub') this.goHub(true);
        else if (b.dataset.go === 'gua') this.goGua(this.state.gua);
      }));
    },

    mobile() { return window.matchMedia('(max-width: 940px)').matches; },

    /* ---------- 回八卦 ---------- */
    goHub(animate, fromHash) {
      const act = () => {
        this.closePanel();
        window.HUB.clear();
        this.state = { art: null, gua: null, mode: 'hub' };
        this.renderCrumbs();
      };
      if (fromHash) { act(); return; }
      this.setHash('#/');
      if (animate) Fade.run(act); else act();
    },

    /* ---------- 回到某卦的分支视图 ---------- */
    goGua(guaId, fromHash) {
      const act = () => {
        this.closePanel();
        this.state = { art: null, gua: guaId, mode: 'branch' };
        window.HUB.select(guaId);
        this.renderCrumbs();
        if (this.mobile()) this.openBranchList(guaId);
      };
      if (fromHash) { act(); return; }
      this.setHash('#/gua/' + guaId);
      Fade.run(act);
    },

    back() {
      if (this.state.mode === 'art') {
        if (this.state.gua) this.goGua(this.state.gua); else this.goHub(true);
      } else if (this.state.mode === 'branch') {
        this.goHub(true);
      }
    },

    /* ---------- 面板 ---------- */
    openPanel() {
      const p = $('#panel');
      p.classList.add('open');
      p.setAttribute('aria-hidden', 'false');
      document.body.classList.add('panel-open');
      $('#hub').classList.add('shift');
    },
    closePanel() {
      const p = $('#panel');
      p.classList.remove('open');
      p.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('panel-open');
      $('#hub').classList.remove('shift');
    },

    /* 移动端：卦下术数列表 */
    openBranchList(guaId) {
      const g = C.GUA_BY_ID[guaId];
      const arts = window.artsOfGua(guaId);
      $('#panel-head').innerHTML =
        `<div class="head-row"><div class="head-titles">
           <div class="branch-gua"><span class="sym">${g.symbol}</span>
             <span><span class="nm">${g.name}</span><span class="nat">${g.nature} · ${g.dex}</span></span></span></div>
           <p class="head-desc">${g.desc}</p>
         </div><div class="head-actions"><button class="mini-btn" data-act="hub">回八卦</button></div></div>
         <hr class="hr-ink">`;
      $('#panel-body').innerHTML =
        `<p class="branch-lead">${g.desc}</p>` +
        `<div class="art-list" style="margin-top:16px">` + arts.map(a =>
          `<button class="art-card${a.ready ? '' : ' pending'}" data-art="${a.id}"${a.ready ? '' : ' disabled'}>
             <h4><span class="idx">${String(a.idx).padStart(2, '0')}</span>${a.name}</h4>
             <p>${a.tagline}</p>
             <div class="tags">${(a.tags || []).map(t => `<span class="tag">${t}</span>`).join('')}</div>
           </button>`).join('') + `</div>`;
      this.bindBranchList();
      this.openPanel();
      $('#panel-body').scrollTop = 0;
    },

    bindBranchList(guaId) {
      $$('#panel-body .art-card').forEach(el => {
        el.addEventListener('click', () => { if (!el.disabled) this.openArt(el.dataset.art); });
      });
      $$('#panel-head [data-act="hub"]').forEach(b => b.addEventListener('click', () => this.goHub(true)));
      $$('#panel-head [data-act="back"]').forEach(b => b.addEventListener('click', () => this.back()));
    },

    /* ---------- 打开术数页 ---------- */
    openArt(artId, fromHash) {
      const art = window.artById(artId);
      const meta = window.artMeta(artId);
      if (!art) { toast('此术数尚在整理中'); return; }
      const guaId = meta && meta.gua !== 'other' ? meta.gua : null;
      const act = () => {
        this.state = { art: artId, gua: guaId, mode: 'art' };
        this.renderArt(art, meta);
        this.renderCrumbs();
      };
      if (fromHash) { act(); return; }
      this.setHash('#/art/' + artId);
      Fade.run(act);
    },

    renderArt(art, meta) {
      const gua = meta && meta.gua !== 'other' ? C.GUA_BY_ID[meta.gua] : null;
      const sealTxt = art.name.length > 4 ? art.name.slice(0, 4) : art.name;
      $('#panel-head').innerHTML =
        `<div class="head-row">
           <div class="head-titles">
             <div class="head-gua">
               <span class="g">${gua ? gua.symbol : (window.OTHER_ARTS.symbol || '☯')}</span>
               <span>${gua ? gua.name + ' · ' + gua.nature + ' · ' + gua.dex : '其他术数 · 不与八卦相系'}</span>
             </div>
             <h2 class="head-title">${art.name}</h2>
             ${art.alias && art.alias.length ? `<div class="head-alias">别名 · ${art.alias.join(' · ')}</div>` : ''}
             <p class="head-desc">${art.tagline || ''}</p>
           </div>
           <div class="head-actions">
             <div class="seal">${sealTxt.slice(0, 2)}<br>${sealTxt.slice(2) || '术'}</div>
             <button class="mini-btn" data-act="back">${gua ? '返回' + gua.name + '卦' : '回八卦'}</button>
           </div>
         </div>
         <hr class="hr-ink">`;

      const formHtml = (art.form && art.form.length)
        ? `<form id="cast-form">${U.form(art.form)}</form>`
        : '';
      $('#panel-body').innerHTML =
        `<div class="art-body">
           ${U.sec('源流与原理', art.intro || '')}
           ${U.sec('起占方式', (art.method || '') + formHtml)}
           <div class="sec">
             <div class="btn-row">
               <button class="btn-ink" id="btn-cast">起 课</button>
               <button class="btn-ink ghost" id="btn-reset">重 来</button>
               <button class="tiny-btn" id="btn-copy">复制结果</button>
             </div>
           </div>
           <div id="cast-result"></div>
           ${U.disclaim()}
         </div>`;
      this.bindArt(art);
      this.openPanel();
      $('#panel-body').scrollTop = 0;
    },

    bindArt(art) {
      const body = $('#panel-body');
      /* chips 型字段 */
      $$('[data-chips]', body).forEach(box => {
        box.addEventListener('click', e => {
          const btn = e.target.closest('.chip'); if (!btn) return;
          $$('.chip', box).forEach(c => c.classList.remove('sel'));
          btn.classList.add('sel');
          const hid = box.parentNode.querySelector('input[type=hidden]');
          if (hid) hid.value = btn.dataset.v;
        });
      });
      const form = $('#cast-form', body);
      if (form) form.addEventListener('submit', e => { e.preventDefault(); this.run(art); });
      const bc = $('#btn-cast', body); if (bc) bc.addEventListener('click', () => this.run(art));
      const br = $('#btn-reset', body);
      if (br) br.addEventListener('click', () => {
        const r = $('#cast-result'); r.innerHTML = '';
        const c = $('#cast-form'); if (c) c.reset();
        $$('[data-chips] .chip', body).forEach((c, i) => c.classList.toggle('sel', i === 0));
        toast('已清盘');
      });
      const bcp = $('#btn-copy', body);
      if (bcp) bcp.addEventListener('click', () => {
        const txt = ($('#cast-result').innerText || '').trim() ||
          ($('#panel-body').innerText || '').trim();
        navigator.clipboard.writeText(txt).then(() => toast('已复制'), () => toast('复制失败'));
      });
      $$('#panel-head [data-act="back"]', document).forEach(b => b.addEventListener('click', () => this.back()));
      $$('#panel-head [data-act="hub"]', document).forEach(b => b.addEventListener('click', () => this.goHub(true)));
    },

    run(art) {
      const body = $('#panel-body');
      const out = $('#cast-result');
      let input = {};
      try { input = U.readForm(body, art.form); }
      catch (e) { console.error(e); }
      let data;
      try {
        data = art.cast(input, { UI: U, CORE: C, RNG: C.RNG, GZ: C.GZ });
      } catch (e) {
        console.error('[cast]', e);
        toast('起课出错：' + (e && e.message ? e.message : e));
        return;
      }
      if (!data || data.error) { toast((data && data.error) || '请检查输入'); return; }
      let html;
      try { html = art.view(data, { UI: U, CORE: C, RNG: C.RNG }); }
      catch (e) { console.error('[view]', e); toast('排盘渲染出错：' + e.message); return; }
      out.innerHTML = `<div class="result art-body">${html}</div>`;
      if (typeof art.mount === 'function') {
        try { art.mount(out, data); } catch (e) { console.error('[mount]', e); }
      }
      const y = out.getBoundingClientRect().top + $('#panel-body').scrollTop - 130;
      $('#panel-body').scrollTo({ top: Math.max(y, 0), behavior: 'smooth' });
    }
  };

  window.APP = APP;
  document.addEventListener('DOMContentLoaded', () => APP.init());
})();
