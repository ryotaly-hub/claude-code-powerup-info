/**
 * ヘッダのキーワード検索。全号の項目（見出し・本文・つまりこう使う・カテゴリ）を対象に、
 * スペース区切りの語をすべて含むもの（AND）を新しい号から最大 20 件出す。
 * インデックス assets/search-index.js は初めて入力欄を触ったときに読み込む。
 */
(function () {
  const form = document.querySelector('.search');
  if (!form) return;
  const input = form.querySelector('.search__input');
  const box = form.querySelector('.search__results');
  const base = form.dataset.base || '';
  const MAX = 20;

  const esc = (s) => String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  let loading = null;
  function loadIndex() {
    if (window.SEARCH_INDEX) return Promise.resolve();
    if (!loading) {
      loading = new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = base + 'assets/search-index.js';
        s.onload = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
      });
    }
    return loading;
  }

  /** 最初にヒットした語の前後を抜き出し、各語を <mark> で囲む。 */
  function snippet(text, terms) {
    const lower = text.toLowerCase();
    let at = -1;
    terms.forEach((t) => {
      const i = lower.indexOf(t);
      if (i >= 0 && (at < 0 || i < at)) at = i;
    });
    const start = Math.max(0, at - 30);
    const raw = (start > 0 ? '…' : '') + text.slice(start, start + 90) + (start + 90 < text.length ? '…' : '');
    return highlight(raw, terms);
  }

  function highlight(text, terms) {
    const pattern = terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
    return esc(text).replace(new RegExp(`(${esc(pattern)})`, 'gi'), '<mark>$1</mark>');
  }

  function render() {
    const q = input.value.trim().toLowerCase();
    if (!q) { box.hidden = true; box.innerHTML = ''; return; }
    const terms = q.split(/\s+/);
    const hits = window.SEARCH_INDEX.filter((e) => {
      const hay = `${e.t} ${e.b} ${e.c} ${e.h}`.toLowerCase();
      return terms.every((t) => hay.includes(t));
    });
    if (!hits.length) {
      box.innerHTML = '<p class="search__empty">該当する記事はありません</p>';
    } else {
      box.innerHTML = `<p class="search__count">${hits.length} 件${hits.length > MAX ? `（新しい順に ${MAX} 件を表示）` : ''}</p>`
        + hits.slice(0, MAX).map((e) => `<a class="search__hit" href="${base}posts/${e.d}.html#item-${e.n}">
          <span class="search__meta">${e.d.replace(/-/g, '.')} ／ VOL.${e.v} ／ ${esc(e.c)}</span>
          <span class="search__title">${highlight(e.t, terms)}</span>
          <span class="search__snip">${snippet(e.b, terms)}</span>
        </a>`).join('');
    }
    box.hidden = false;
  }

  input.addEventListener('focus', () => { loadIndex().then(render, () => {}); });
  input.addEventListener('input', () => { loadIndex().then(render, () => {}); });
  input.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape') { input.value = ''; render(); input.blur(); }
  });
  document.addEventListener('click', (ev) => {
    if (!form.contains(ev.target)) box.hidden = true;
  });
})();
