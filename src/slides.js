// スライドの内容。レイアウト名とデータだけを書き、見た目は layout.js が組み立てる。
// 自己紹介の内容は kyeshimizu.com をもとにしている。
export const slides = [
  {
    layout: "profile",
    kicker: "自己紹介 1 / 2",
    title: "Kye Shimizu(キー・シミズ)",
    subtitle: "インターフェースデザイナー / リサーチエンジニア",
    rows: [
      ["所属", "MIT メディアラボ(米国・ケンブリッジ)"],
      [
        "専門分野",
        "ヒューマン・コンピュータ・インタラクション(HCI)、コンピュテーショナルデザイン、現代アート",
      ],
      [
        "研究テーマ",
        "新しいテクノロジーが人にどう理解されるか — 共有空間でのロボットのコミュニケーションや、人間の知覚にはたらきかけるシステムなど",
      ],
      [
        "Web",
        "kyeshimizu.com / GitHub: kyeshmz / X: @kyeshimizu",
      ],
    ],
  },
  {
    layout: "columns",
    kicker: "自己紹介 2 / 2",
    title: "主なプロジェクトと受賞歴",
    columns: [
      {
        heading: "主なプロジェクト",
        items: [
          {
            name: "Algorithmic Couture",
            text: "AI と生成アルゴリズムによる衣服の計算論的デザイン",
          },
          {
            name: "Morphing Identity",
            text: "自己と他者のあいだで顔が変容する複合現実(MR)体験",
          },
          {
            name: "Synthetic Feathers",
            text: "計算的手法によるバイオインスパイアード素材のデザイン",
          },
          {
            name: "Deviation Game",
            text: "人の振る舞いとゲームメカニクスを問うインタラクティブ作品",
          },
          {
            text: "Synflux・HATRA・YUIMA NAKAZATO などファッションとの協働も多数",
          },
        ],
      },
      {
        heading: "受賞・展示",
        items: [
          {
            name: "2024",
            text: "Gemini API Developer Competition「Most Creative App」",
          },
          {
            name: "2021",
            text: "Innovative Technologies 2021(Morphing Identity)",
          },
          {
            name: "2019",
            text: "H&M Global Change Award, Early Bird / Dezeen Awards Longlist",
          },
          {
            name: "2018",
            text: "WIRED Creative Hack Award 審査員賞(Algorithmic Couture)",
          },
          {
            text: "展示:Ars Electronica、V&A、Science Gallery、21_21 DESIGN SIGHT ほか",
          },
        ],
      },
    ],
  },
  {
    layout: "section",
    title: "TRAILS",
    subtitle: "ここから本編のスライドを追加してください",
  },
];
