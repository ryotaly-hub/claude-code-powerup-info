#!/usr/bin/env node
/**
 * 指定した号の JSON から Slack 投稿用の mrkdwn を組み立てて標準出力に出す。
 * 使い方: node slack.js 2026-09-20
 */
const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://ryotaly-hub.github.io/claude-code-powerup-info';
const date = process.argv[2];
if (!date) { console.error('usage: node slack.js YYYY-MM-DD'); process.exit(1); }

const post = JSON.parse(fs.readFileSync(path.join(__dirname, 'posts', `${date}.json`), 'utf8'));
const [y, m, d] = date.split('-').map(Number);

const lines = [];
lines.push(`*Claude code の PowerUP info*  ${y}/${String(m).padStart(2, '0')}/${String(d).padStart(2, '0')}`);
lines.push(`_${post.headline}_`);
lines.push('');
lines.push(post.lead);
lines.push('');

post.items.forEach((it, i) => {
  lines.push(`*${i + 1}. [${it.category}] ${it.title}*`);
  // 本文は最初の段落だけ。全文はサイト側で読ませる。
  lines.push(it.body.split(/\n\n+/)[0].replace(/\*\*([^*]+)\*\*/g, '*$1*').trim());
  if (it.howto && it.howto.length) {
    lines.push(`• ${it.howto[0].replace(/\*\*([^*]+)\*\*/g, '*$1*')}`);
  }
  (it.links || []).forEach((l) => lines.push(`<${l.url}|${l.label}>`));
  lines.push('');
});

lines.push(`――――――――――`);
lines.push(`全文はこちら → <${SITE_URL}/posts/${date}.html|${post.headline}>`);
lines.push(`バックナンバー → <${SITE_URL}/|Claude code の PowerUP info>`);

console.log(lines.join('\n'));
