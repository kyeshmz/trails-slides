# trails-slides

レイアウトをすべて JavaScript で行うスライドデッキです。CSS ファイルはなく、
スライドは `src/slides.js` のデータとして記述し、`src/layout.js` のレイアウト
エンジンが DOM の生成・配置・スタイル適用を行います。

## 起動方法

ES Modules を使っているため、ローカルサーバー経由で開いてください。

```sh
npx serve .
# または
python3 -m http.server 8000
```

ブラウザで `http://localhost:8000` を開きます。

## 操作

- `→` / `Space` / クリック: 次のスライド
- `←` / 画面左端 1/4 のクリック: 前のスライド
- `Home` / `End`: 最初 / 最後のスライド
- URL の `#3` などで直接スライドに移動できます

## スライドの追加

`src/slides.js` の配列にオブジェクトを追加します。利用できるレイアウトは
`profile`(ラベル+本文の行)、`columns`(2 カラムのリスト)、`section`
(章扉)です。新しいレイアウトは `src/layout.js` に関数を足して登録します。
