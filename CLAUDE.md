# CLAUDE.md

「Claude code の PowerUP info」— Claude Code の活用情報を毎朝 9:00 (JST) に配信するデイリーメディア。
サイト: https://ryotaly-hub.github.io/claude-code-powerup-info/ ／ Slack: `#general`

## このリポジトリの性質

ビルドツール・npm 依存・テストフレームワークは**一切使っていない**。素の Node.js スクリプト 2 本だけで動く。

- `node build.js` — `posts/*.json` を読んで `index.html` と `posts/*.html` を生成する
- `node slack.js YYYY-MM-DD` — その号の Slack 投稿文（mrkdwn）を標準出力に出す

`index.html` と `posts/*.html` は**生成物**。手で編集してはいけない（次のビルドで消える）。
編集してよいのは `posts/*.json`、`build.js`、`slack.js`、`assets/style.css` のみ。

## 毎朝の発行手順

1. **調べる** — Web 検索で、直近1〜2週間の Claude Code に関する実用情報を集める。優先順位は
   公式（code.claude.com の新機能ダイジェスト / changelog）> 技術ブログ・Qiita・Zenn > 海外の Tips 記事。
2. **選ぶ** — 「明日からの作業が実際に速くなるか」で 4〜6 本に絞る。バージョン番号・コマンド名・設定キーなど、
   手を動かせる具体物が含まれるものを優先する。前号（`posts/` の直近ファイル）と内容が重複しないか必ず確認する。
3. **書く** — `posts/YYYY-MM-DD.json` を新規作成する。形は README.md の「記事 JSON のかたち」に従う。
   - `links` は**必ず 1 件以上**入れる。出典のない項目は載せない。
   - `howto` には「つまりこう使う」を具体的な操作で書く。抽象的な心構えは書かない。
   - 文体は常体（だ・である）。煽り・誇張はしない。不確かなことは書かない。
4. **生成する** — `node build.js` を実行し、エラーなく終わることを確認する。
5. **公開する** — `posts/YYYY-MM-DD.json`、生成された HTML、`index.html` をコミットして push する。
   コミットメッセージは `Add issue YYYY-MM-DD: <headline>` の形。
6. **Slack に流す** — `node slack.js YYYY-MM-DD` の出力を、そのまま Slack `#general`（ID: `C0ANTJKPZEJ`）に投稿する。
   Slack MCP の `slack_send_message` は**標準 Markdown** を受け取る（Slack 独自の mrkdwn ではない）ので、`slack.js` の出力は加工しないこと。

## 書くときの約束

- カテゴリは `新機能` / `ワークフロー` / `Tips` / `エコシステム` / `注意点` から選ぶ
- 出典が確認できない噂・リーク・未発表情報は扱わない
- 同じネタを続けて載せない。前号の `headline` と `title` を読んでから選ぶ
- リンクは記事本文中の `links` に置く。本文に生 URL を書かない
