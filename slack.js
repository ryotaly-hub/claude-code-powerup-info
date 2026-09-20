#!/usr/bin/env node
/**
 * 指定した号の JSON から Slack 投稿用のテキストを組み立てて標準出力に出す。
 * Slack MCP の slack_send_message は標準 Markdown を受け取るので、
 * **強調** と [label](url) の記法で出す（Slack 独自の mrkdwn ではない）。
 * 使い方: node slack.js 2026-09-20
 */
const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://ryotaly-hub.github.io/claude-code-powerup-info';
const date = process.argv[2];
if (!date) { console.error('usage: node slack.js YYYY-MM-DD'); process.exit(1); }

const post = JSON.parse(fs.readFileSync(path.join(__dirname, 'posts', `${date}.json`), 'utf8'));
const [y, m, d] = date.split('-').map(Number);
const pad = (n) => String(n).padStart(2, '0');

const lines = [];
lines.push(`## Claude code の PowerUP info — ${y}/${pad(m)}/${pad(d)}`);
lines.push(`**${post.headline}**`);
lines.push('');
lines.push(post.lead);
lines.push('');

post.items.forEach((it, i) => {
  lines.push(`**${i + 1}. [${it.category}] ${it.title}**`);
  // 本文は最初の段落だけ。全文はサイト側で読ませる。
  lines.push(it.body.split(/\n\n+/)[0].trim());
  if (it.howto && it.howto.length) {
    lines.push(`- ${it.howto[0]}`);
  }
  (it.links || []).forEach((l) => lines.push(`- 🔗 [${l.label}](${l.url})`));
  lines.push('');
});

lines.push('---');
lines.push(`📖 全文 → [${post.headline}](${SITE_URL}/posts/${date}.html)`);
lines.push(`🗂 バックナンバー → [Claude code の PowerUP info](${SITE_URL}/)`);

console.log(lines.join('\n'));
