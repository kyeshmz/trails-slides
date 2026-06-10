# trails-slides

スライドの**内容は Markdown**(`slides/*.md`)で書き、**レイアウトはすべて
JavaScript** で行うデッキです。CSS ファイルはありません。`src/markdown.js` が
Markdown を解析し、`src/layout.js` のレイアウトエンジンが DOM の生成・配置・
スタイル適用を行います。

## 起動方法

ES Modules と `fetch` を使うため、ローカルサーバー経由で開いてください。

```sh
npx serve .
# または
python3 -m http.server 8000
```

ブラウザで `http://localhost:8000` を開きます。

## 構成

- `slides/*.md` — スライド本文(フロントマター + Markdown)
- `slides/manifest.js` — スライドの表示順
- `src/markdown.js` — フロントマター + Markdown パーサ
- `src/layout.js` — レイアウトエンジン(`content` / `columns` / `goal` / `board`)
- `src/main.js` — 読み込み・ナビゲーション・もくじ挿入・ホームボタン
- `src/theme.js`, `src/dom.js` — デザイントークンと DOM ヘルパー

スライドの並びは `1. 自己紹介` → `2. もくじ(ボード)` → `3. ゴール` →
`4. 自己紹介2` → `5. お金` → `6. お金がもたらすもの`。もくじは 2 番目の
スライドとして自動挿入されます(`main.js`)。

## 操作

- `→` / `Space` / クリック: 次のスライド
- `←` / 画面左端 1/4 のクリック: 前のスライド
- 左上の **⌂ もくじ**ボタン / `Esc`: もくじ(ボード)へ移動
- もくじのカードをクリック: そのスライドへジャンプ
- `Home` / `End`: 最初 / 最後のスライド
- URL の `#3` などで直接スライドに移動できます

## スライドの追加・編集

`slides/` に `.md` を追加し、`slides/manifest.js` の配列に並び順を書きます。
フロントマターの `layout` で見た目を選びます。

```md
---
layout: content      # content / columns / goal
kicker: セクション名
title: タイトル
subtitle: サブタイトル   # 任意
---

- **ラベル** — 本文
```

`columns` レイアウトでは `## 見出し` ごとに横並びのカラムになります。新しい
レイアウトは `src/layout.js` に関数を足して `layouts` に登録します。
