// レイアウトエンジン:スライドの DOM 構築・配置・寸法計算をすべて JavaScript で行う。
import { SLIDE_WIDTH, SLIDE_HEIGHT, theme } from "./theme.js";

// スタイルオブジェクトを渡して要素を生成する小さなヘルパー。
export function el(tag, style = {}, children = []) {
  const node = document.createElement(tag);
  Object.assign(node.style, style);
  for (const child of [].concat(children)) {
    if (child == null) continue;
    node.append(typeof child === "string" ? document.createTextNode(child) : child);
  }
  return node;
}

function slideRoot(extraStyle = {}) {
  return el("section", {
    position: "relative",
    width: `${SLIDE_WIDTH}px`,
    height: `${SLIDE_HEIGHT}px`,
    boxSizing: "border-box",
    padding: "72px 96px",
    display: "flex",
    flexDirection: "column",
    background: theme.background,
    color: theme.text,
    fontFamily: theme.fontFamily,
    overflow: "hidden",
    ...extraStyle,
  });
}

function kicker(text) {
  return el(
    "p",
    {
      margin: "0 0 16px",
      fontSize: "20px",
      fontWeight: "700",
      letterSpacing: "0.2em",
      color: theme.accent,
    },
    text,
  );
}

function heading(text, size = "56px") {
  return el(
    "h1",
    {
      margin: "0",
      fontSize: size,
      fontWeight: "900",
      lineHeight: "1.25",
    },
    text,
  );
}

function accentBar() {
  return el("div", {
    width: "96px",
    height: "6px",
    margin: "24px 0 0",
    borderRadius: "3px",
    background: theme.accent,
  });
}

// 「ラベル + 本文」の行で構成するプロフィール型レイアウト。
function profileLayout(slide) {
  const root = slideRoot();
  root.append(
    kicker(slide.kicker),
    heading(slide.title),
    el(
      "p",
      {
        margin: "12px 0 0",
        fontSize: "28px",
        fontWeight: "500",
        color: theme.muted,
      },
      slide.subtitle,
    ),
    accentBar(),
  );

  const rows = el("div", {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    marginTop: "40px",
  });
  for (const [label, value] of slide.rows) {
    rows.append(
      el("div", { display: "flex", gap: "28px", alignItems: "baseline" }, [
        el(
          "div",
          {
            flex: "0 0 160px",
            padding: "6px 0",
            fontSize: "20px",
            fontWeight: "700",
            textAlign: "center",
            color: theme.accent,
            background: theme.accentDim,
            borderRadius: "8px",
          },
          label,
        ),
        el(
          "div",
          { fontSize: "23px", lineHeight: "1.6", color: theme.text },
          value,
        ),
      ]),
    );
  }
  root.append(rows);
  return root;
}

// 2 カラムでリストを並べるレイアウト。
function columnsLayout(slide) {
  const root = slideRoot();
  root.append(kicker(slide.kicker), heading(slide.title), accentBar());

  const columns = el("div", {
    display: "flex",
    gap: "48px",
    marginTop: "40px",
    flex: "1",
  });
  for (const column of slide.columns) {
    const list = el("div", {
      flex: "1",
      display: "flex",
      flexDirection: "column",
      gap: "16px",
      padding: "28px",
      background: theme.surface,
      border: `1px solid ${theme.border}`,
      borderRadius: "16px",
    });
    list.append(
      el(
        "h2",
        {
          margin: "0 0 4px",
          fontSize: "26px",
          fontWeight: "700",
          color: theme.accent,
        },
        column.heading,
      ),
    );
    for (const item of column.items) {
      list.append(
        el("div", { fontSize: "20px", lineHeight: "1.55" }, [
          item.name
            ? el("span", { fontWeight: "700" }, `${item.name} — `)
            : null,
          el("span", { color: item.name ? theme.muted : theme.text }, item.text),
        ]),
      );
    }
    columns.append(list);
  }
  root.append(columns);
  return root;
}

// 章扉(セクション)用の中央寄せレイアウト。
function sectionLayout(slide) {
  const root = slideRoot({ justifyContent: "center", alignItems: "center" });
  root.append(
    heading(slide.title, "88px"),
    el(
      "p",
      { margin: "24px 0 0", fontSize: "28px", color: theme.muted },
      slide.subtitle ?? "",
    ),
  );
  return root;
}

const layouts = {
  profile: profileLayout,
  columns: columnsLayout,
  section: sectionLayout,
};

export function renderSlide(slide) {
  const layout = layouts[slide.layout];
  if (!layout) throw new Error(`未定義のレイアウトです: ${slide.layout}`);
  return layout(slide);
}
