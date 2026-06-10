# CLAUDE.md

## 何を作っているか

Kye Shimizu のプレゼン用スライドデッキ。**内容は Markdown、レイアウトはすべて
JavaScript** で行う。ビルドステップなし・外部ライブラリなしの素の ES Modules で、
ローカルサーバーから配信して使う。本文は日本語。

- スライド本文は `slides/*.md`(フロントマター + Markdown)
- 見た目・配置・スタイル適用・アニメーションは `src/*.js`
- CSS ファイルは存在しない(スタイルは JS から `el()` で適用)

## 起動 / 確認

ES Modules と `fetch` を使うため、必ずローカルサーバー経由で開く。

```sh
python3 -m http.server 8000   # または npx serve .
```

ブラウザで `http://localhost:8000`。`#3` のように URL ハッシュで特定スライドへ。

ヘッドレスでの見た目確認(この環境で利用可能):

```sh
NODE_PATH=/opt/node22/lib/node_modules node -e "
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  await p.goto('http://localhost:8000/index.html#4', { waitUntil: 'networkidle' });
  await p.waitForTimeout(1400); // 入場アニメーションの完了を待つ
  await p.screenshot({ path: '/tmp/shot.png' });
  await b.close();
})();
"
```

構文チェック:`for f in src/*.js; do node --check --input-type=module < "$f"; done`

> 注意:Google Fonts の CDN はサンドボックスのネットワーク制限で読めず
> `ERR_CERT_AUTHORITY_INVALID` が出るが、システムフォントにフォールバックするので無視してよい。

## ファイル構成

```
index.html              フォント読み込みと src/main.js の起動だけ
src/
  theme.js              デザイントークン(色・フォント・スライド寸法 1280x720)
  dom.js                el(tag, style, children) ヘルパー
  markdown.js           フロントマター + Markdown パーサ(画像 ![]() 対応)
  layout.js             レイアウトエンジン(全レイアウト関数)
  main.js               読み込み・ナビゲーション・もくじ挿入・アニメーション
slides/
  manifest.js           スライドの表示順(配列)
  *.md                  各スライド(フロントマターの layout で見た目を選ぶ)
assets/
  projects/             作品ギャラリーの写真
  covers/               カテゴリ章扉の背景写真
  logos/                経歴タイムラインのロゴ
```

## スライドの並び(現在)

1. 自己紹介(`01-intro.md`, content)
2. **もくじ / ボード**(自動挿入。`manifest` には無い)
3. ゴール(`02-goal.md`, goal)— いい感じだと思われたい / ちょいためになる
4. 3 文字キャリア年表(`03-education.md`, timeline)— ICU → CSL → MIT → ???(KFC/IBM)
5〜12. 作品ギャラリー(`04-works.md`, gallery → 1 作品 = 1 スライドに展開、8 枚)
13〜17. お金(`10-money-cover.md` 扉 + `11`〜`14`)
18〜21. 環境 / 旅 / 仕事 / ストーリーテリング(各 `*-cover.md`, cover)

「もくじ」は `main.js` が 2 番目に自動挿入する。`layout: cover` のスライドは
もくじに写真カードとして自動で並び、クリックでそのセクションへジャンプする。

## レイアウト一覧(`layout:` の値)

| layout      | 用途 | 主なフロントマター / 本文 |
|-------------|------|---------------------------|
| `content`   | 標準。見出し + 箇条書き | `kicker` `title` `subtitle`、本文に `- ` 箇条書き |
| `goal`      | 大きな番号付きリスト | `1. ` の番号付きリスト |
| `timeline`  | 経歴年表(矢印でつなぐ) | `## 略称` + `![](ロゴ)` + ひとこと の繰り返し。略称に `?` を含むとオチ用カード(破線・複数ロゴ可) |
| `cover`     | 章扉(全面写真) | `kicker` `title` `subtitle` `image:` |
| `gallery`   | 作品集。1 作品 = 1 スライドに展開 | `## 作品名` + `![](写真)` + ひとこと の繰り返し |
| `board`     | もくじ(自動生成、Markdown 不要) | — |

## 守るべきルール / 規約

- **箇条書きは 1 スライド最大 3 つ**。`layout.js` が 4 つ目以降を描画せず
  console に警告を出す(`MAX_BULLETS`)。増やしたい時はここを変える。
- **すべての要素はアニメーションする**。`layout.js` で要素に `data-animate` を
  付け、`main.js` の `animateSlide()` が順番にフェードイン。全面写真は
  `data-kenburns` でスローズーム。新しい要素を足すときは `animated()` で包む。
- 寸法は 1280x720 固定。`main.js` の `fitToWindow()` が transform でウィンドウに合わせる。
- 本文は日本語。

## 操作(プレゼン中)

- `→` / `Space` / クリック:次 ／ `←` / 画面左端 1/4 クリック:前
- 左上「⌂ もくじ」ボタン / `Esc`:もくじへ ／ もくじのカードクリック:ジャンプ
- `Home` / `End`:最初 / 最後

## スライドの追加手順

1. `slides/` に `NN-name.md` を作成(フロントマターで `layout` を指定)
2. `slides/manifest.js` の配列に並び順を追記
3. 画像は `assets/` に置き、`![alt](assets/...)` で参照
4. 新しいレイアウトが要るときは `src/layout.js` に関数を足し、`layouts` に登録

## 画像の出どころ

作品写真・章扉写真は kyeshimizu.com から取得。ロゴは各公式サイトと
Wikimedia Commons から取得(Sony CSL は on-dark のワードマークしか無いため、
エンブレム部分を切り出して `sonycsl-emblem.png` として使用)。

## Git

- 開発ブランチ:`claude/js-layout-japanese-intro-qzroa7`
- ユーザーが明示的に頼んだときだけコミット / プッシュする。PR は頼まれない限り作らない。
