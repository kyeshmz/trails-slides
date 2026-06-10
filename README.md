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
- `assets/` — kyeshimizu.com から取得した作品写真・カテゴリ写真
- `src/markdown.js` — フロントマター + Markdown パーサ(画像 `![]()` 対応)
- `src/layout.js` — レイアウトエンジン(`content` / `goal` / `cover` / `galleryItem` / `board`)
- `src/main.js` — 読み込み・ナビゲーション・ギャラリー展開・もくじ挿入・ホームボタン
- `src/theme.js`, `src/dom.js` — デザイントークンと DOM ヘルパー

並びは `自己紹介` → `もくじ(ボード)` → `ゴール` → `作品ギャラリー(8 枚)` →
`お金(扉 + 2 枚)` → `環境` → `旅` → `仕事` → `ストーリーテリング`。
もくじは 2 番目のスライドとして自動挿入され、カテゴリの章扉
(`layout: cover`)が写真カードとして並びます。

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
layout: content      # content / goal / cover / gallery
kicker: セクション名
title: タイトル
subtitle: サブタイトル   # 任意
image: assets/...     # cover で使う背景写真
---

- **ラベル** — 本文
```

`gallery` レイアウトは `## 作品名` + `![](画像)` + ひとことの繰り返しで書き、
1 作品 = 1 スライドに展開されて順番に送れます。`cover`(章扉)を追加すると
もくじのカードにも自動で並びます。新しいレイアウトは `src/layout.js` に
関数を足して `layouts` に登録します。
