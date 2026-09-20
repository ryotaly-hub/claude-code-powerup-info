# Claude code の PowerUP info

Claude Code での作業が毎日ちょっとずつ速くなる情報を、**毎朝 9:00 (JST)** にまとめて配信するデイリーダイジェスト。

- 📰 サイト: https://ryotaly-hub.github.io/claude-code-powerup-info/
- 💬 Slack: `#general` に同名で自動投稿

## 仕組み

クラウドの Claude Code エージェント（Routine）が毎朝 9:00 JST に起動し、次を順に実行する。

1. Web を調べて、その日の Claude Code 関連トピックを 4〜6 本選ぶ
2. `posts/YYYY-MM-DD.json` を書く
3. `node build.js` で `index.html` と `posts/YYYY-MM-DD.html` を生成
4. コミット & push（GitHub Pages が自動で公開）
5. `node slack.js YYYY-MM-DD` の出力を Slack `#general` に投稿

## ローカルでの使い方

```sh
node build.js              # 全ページを生成し直す
node slack.js 2026-09-20   # その号の Slack 投稿文を確認する
open index.html            # 見た目を確認する
```

## 構成

| パス | 役割 |
| --- | --- |
| `posts/*.json` | 記事の元データ。ここだけが手で書く対象 |
| `posts/*.html` | 生成物。直接編集しない |
| `index.html` | 生成物。直接編集しない |
| `build.js` | 静的サイトジェネレータ（依存ゼロ） |
| `slack.js` | Slack 投稿文のジェネレータ |
| `assets/style.css` | ledge.ai 風のスタイル |

## 記事 JSON のかたち

```jsonc
{
  "date": "2026-09-20",
  "headline": "その日いちばんの見出し",
  "lead": "リード文。カードの抜粋と Slack 冒頭にも使われる",
  "items": [
    {
      "category": "新機能",          // 新機能 / ワークフロー / Tips / エコシステム / 注意点
      "title": "項目の見出し",
      "body": "本文。空行で段落を分ける。`code` と **強調** が使える",
      "howto": ["つまりこう使う、を1〜3行"],
      "links": [{ "label": "出典タイトル", "url": "https://..." }]
    }
  ]
}
```

`issue`（VOL. 番号）は `build.js` が日付順に自動採番するので書かなくてよい。
