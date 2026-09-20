#!/usr/bin/env node
/**
 * posts/*.json を読んで index.html と posts/<date>.html を生成する。
 * 依存ゼロ。`node build.js` で全ページを作り直す。
 */

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const POSTS_DIR = path.join(ROOT, 'posts');

const SITE_TITLE = 'Claude code の PowerUP info';
const SITE_DESC = 'Claude Code での作業が毎日ちょっとずつ速くなる。新機能・小技・ワークフローを毎朝9時にお届けするデイリーダイジェスト。';
const SITE_URL = 'https://ryotaly-hub.github.io/claude-code-powerup-info/';

/* 号ごとのサムネイルに使うグラデーション。日付から決まるので再ビルドしてもぶれない。 */
const GRADIENTS = [
  ['#e6002d', '#7a0038'],
  ['#1b3a7a', '#0c9bd6'],
  ['#0f6b52', '#57b894'],
  ['#4b2a7a', '#a35bd1'],
  ['#c2410c', '#f0a02b'],
  ['#0f172a', '#475569'],
];

const esc = (s) => String(s)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

/** 本文だけは `code` と **強調** を許可する（それ以外はエスケープ）。 */
const rich = (s) => esc(s)
  .replace(/`([^`]+)`/g, '<code>$1</code>')
  .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

const jpDate = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  const wd = ['日', '月', '火', '水', '木', '金', '土'][new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
  return `${y}年${m}月${d}日(${wd})`;
};

const gradientFor = (iso) => {
  const n = Number(iso.replace(/-/g, ''));
  return GRADIENTS[n % GRADIENTS.length];
};

function thumb(post, big) {
  const [a, b] = gradientFor(post.date);
  const [y, m, d] = post.date.split('-');
  return `<div class="thumb" style="background:linear-gradient(135deg,${a} 0%,${b} 100%)">
        <div class="thumb__deco"></div>
        <div class="thumb__issue">POWERUP INFO / VOL.${post.issue}</div>
        <div class="thumb__date"${big ? ' style="font-size:38px"' : ''}>${y}.${m}.${d}</div>
      </div>`;
}

function layout({ title, description, body, depth }) {
  const base = depth ? '../' : '';
  return `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:type" content="website">
<link rel="stylesheet" href="${base}assets/style.css">
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='14' fill='%23e6002d'/><text x='50' y='72' font-size='64' font-weight='bold' text-anchor='middle' fill='white' font-family='Arial'>P</text></svg>">
</head>
<body>
<header class="site-header">
  <div class="wrap site-header__inner">
    <a class="logo" href="${base}index.html">
      <span class="logo__mark">P</span>
      <span class="logo__text">Claude code の <em>PowerUP</em> info</span>
    </a>
    <span class="site-header__tag">DAILY 9:00 JST</span>
  </div>
</header>
${body}
<footer class="site-footer">
  <div class="wrap">
    <p>${esc(SITE_TITLE)} — 毎朝9時（JST）更新のデイリーダイジェスト。</p>
    <p>各記事の出典リンクは本文内に記載しています。内容は各出典の公開時点の情報です。</p>
    <p><a href="${base}index.html">記事一覧</a></p>
  </div>
</footer>
</body>
</html>
`;
}

function renderIndex(posts) {
  const [latest, ...rest] = posts;

  const hero = `
  <div class="wrap">
    <section class="hero">
      <a class="hero__thumb" href="posts/${latest.date}.html">${thumb(latest, true)}</a>
      <div class="hero__body">
        <span class="chip">最新号</span>
        <h1>${esc(latest.headline)}</h1>
        <p>${esc(latest.lead)}</p>
        <a class="readmore" href="posts/${latest.date}.html">この号を読む</a>
      </div>
    </section>
  </div>`;

  const cards = rest.length ? `
  <div class="wrap">
    <div class="section-head"><h2>バックナンバー</h2><span>ARCHIVE</span></div>
    <div class="cards">
      ${rest.map((p) => `<a class="card" href="posts/${p.date}.html">
        <div class="card__thumb">${thumb(p, false)}</div>
        <span class="chip">VOL.${p.issue}</span>
        <div class="card__title">${esc(p.headline)}</div>
        <p class="card__excerpt">${esc(p.lead.slice(0, 68))}…</p>
        <div class="card__meta">${jpDate(p.date)}</div>
      </a>`).join('\n      ')}
    </div>
  </div>` : '';

  return layout({
    title: `${SITE_TITLE}｜Claude Code を毎日ちょっと速くする`,
    description: SITE_DESC,
    depth: 0,
    body: hero + cards,
  });
}

function renderPost(post, prev) {
  const items = post.items.map((it, i) => {
    const bodyHtml = it.body.split(/\n\n+/).map((p) => `<p>${rich(p.trim())}</p>`).join('\n      ');
    const howto = it.howto && it.howto.length
      ? `<div class="howto">
        <h3>つまりこう使う</h3>
        <ul>${it.howto.map((h) => `<li>${rich(h)}</li>`).join('')}</ul>
      </div>`
      : '';
    const links = it.links && it.links.length
      ? `<ul class="links">${it.links.map((l) => `<li><a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)}</a></li>`).join('')}</ul>`
      : '';
    return `    <section class="item" id="item-${i + 1}">
      <span class="chip">${esc(it.category)}</span>
      <h2>${esc(it.title)}</h2>
      ${bodyHtml}
      ${howto}
      ${links}
    </section>`;
  }).join('\n');

  const toc = `<nav class="toc">
      <h2>この号の内容</h2>
      <ol>${post.items.map((it, i) => `<li><a href="#item-${i + 1}">${esc(it.title)}</a></li>`).join('')}</ol>
    </nav>`;

  const nav = prev
    ? `<p class="breadcrumb" style="margin:40px 0 0">前号：<a href="${prev.date}.html">${esc(prev.headline)}</a></p>`
    : '';

  const body = `
  <div class="wrap">
    <article class="article">
      <p class="breadcrumb"><a href="../index.html">${esc(SITE_TITLE)}</a> ／ VOL.${post.issue}</p>
      <div class="article__head">
        <span class="chip">${esc(post.date.replace(/-/g, '.'))}</span>
        <h1>${esc(post.headline)}</h1>
        <div class="article__date">${jpDate(post.date)}公開 ／ VOL.${post.issue}</div>
      </div>
      <div class="article__hero">${thumb(post, true)}</div>
      <p class="lead">${esc(post.lead)}</p>
      ${toc}
${items}
      ${nav}
    </article>
  </div>`;

  return layout({
    title: `${post.headline}｜${SITE_TITLE}`,
    description: post.lead,
    depth: 1,
    body,
  });
}

function main() {
  const files = fs.readdirSync(POSTS_DIR).filter((f) => f.endsWith('.json'));
  if (!files.length) {
    console.error('posts/*.json が1件もない。記事を追加してから実行すること。');
    process.exit(1);
  }

  const posts = files
    .map((f) => JSON.parse(fs.readFileSync(path.join(POSTS_DIR, f), 'utf8')))
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  // issue 番号は日付順に自動採番する（古い号が VOL.1）。
  const byOld = [...posts].reverse();
  byOld.forEach((p, i) => { p.issue = i + 1; });

  posts.forEach((p, i) => {
    fs.writeFileSync(path.join(POSTS_DIR, `${p.date}.html`), renderPost(p, posts[i + 1]));
  });
  fs.writeFileSync(path.join(ROOT, 'index.html'), renderIndex(posts));

  console.log(`built: index.html + ${posts.length} post page(s)`);
  console.log(`latest: VOL.${posts[0].issue} ${posts[0].date} ${posts[0].headline}`);
  console.log(`url: ${SITE_URL}posts/${posts[0].date}.html`);
}

main();
