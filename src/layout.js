// レイアウトエンジン:Markdown のブロックを受け取り、DOM の生成・配置・スタイル適用を
// すべて JavaScript で行う。
import { SLIDE_WIDTH, SLIDE_HEIGHT, theme } from "./theme.js";
import { el } from "./dom.js";
import { inline } from "./markdown.js";

function slideRoot(extra = {}) {
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
    ...extra,
  });
}

function kicker(text) {
  if (!text) return null;
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
    { margin: "0", fontSize: size, fontWeight: "900", lineHeight: "1.25" },
    inline(text),
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

// 1 つの Markdown ブロックを DOM に変換する。
function renderBlock(block) {
  switch (block.type) {
    case "h2":
      return el(
        "h2",
        { margin: "0 0 4px", fontSize: "26px", fontWeight: "700", color: theme.accent },
        inline(block.text),
      );
    case "h3":
      return el(
        "h3",
        { margin: "8px 0 0", fontSize: "22px", fontWeight: "700" },
        inline(block.text),
      );
    case "ul":
    case "ol": {
      const list = el(block.type === "ol" ? "ol" : "ul", {
        margin: "0",
        paddingLeft: "1.4em",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
      });
      for (const item of block.items) {
        list.append(
          el("li", { fontSize: "23px", lineHeight: "1.55" }, inline(item)),
        );
      }
      return list;
    }
    case "quote":
      return el(
        "blockquote",
        {
          margin: "0",
          padding: "12px 24px",
          borderLeft: `4px solid ${theme.accent}`,
          fontSize: "24px",
          color: theme.muted,
        },
        inline(block.text),
      );
    default:
      return el(
        "p",
        { margin: "0", fontSize: "23px", lineHeight: "1.6" },
        inline(block.text),
      );
  }
}

// 見出し + サブタイトル + 本文を縦に積む標準レイアウト。
function contentLayout(slide) {
  const root = slideRoot();
  root.append(kicker(slide.meta.kicker), heading(slide.meta.title));
  if (slide.meta.subtitle) {
    root.append(
      el(
        "p",
        { margin: "12px 0 0", fontSize: "28px", fontWeight: "500", color: theme.muted },
        slide.meta.subtitle,
      ),
    );
  }
  root.append(accentBar());

  const body = el("div", {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    marginTop: "40px",
  });
  for (const block of slide.blocks) body.append(renderBlock(block));
  root.append(body);
  return root;
}

// `## 見出し` ごとにカラムを分けて横並びにするレイアウト。
function columnsLayout(slide) {
  const root = slideRoot();
  root.append(kicker(slide.meta.kicker), heading(slide.meta.title), accentBar());

  const columns = el("div", {
    display: "flex",
    gap: "48px",
    marginTop: "40px",
    flex: "1",
  });

  let column = null;
  for (const block of slide.blocks) {
    if (block.type === "h2") {
      column = el("div", {
        flex: "1",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        padding: "28px",
        background: theme.surface,
        border: `1px solid ${theme.border}`,
        borderRadius: "16px",
      });
      column.append(renderBlock(block));
      columns.append(column);
    } else if (column) {
      column.append(renderBlock(block));
    }
  }
  root.append(columns);
  return root;
}

// ゴールスライド:大きな番号付きリストを中央寄せで見せる。
function goalLayout(slide) {
  const root = slideRoot({ justifyContent: "center" });
  root.append(kicker(slide.meta.kicker), heading(slide.meta.title, "52px"), accentBar());

  const items = slide.blocks.find((b) => b.type === "ol")?.items ?? [];
  const list = el("div", {
    display: "flex",
    flexDirection: "column",
    gap: "28px",
    marginTop: "48px",
  });
  items.forEach((item, idx) => {
    list.append(
      el("div", { display: "flex", gap: "28px", alignItems: "center" }, [
        el(
          "div",
          {
            flex: "0 0 64px",
            height: "64px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "30px",
            fontWeight: "900",
            color: theme.background,
            background: theme.accent,
            borderRadius: "50%",
          },
          String(idx + 1),
        ),
        el("div", { fontSize: "38px", fontWeight: "700" }, inline(item)),
      ]),
    );
  });
  root.append(list);
  return root;
}

// もくじ(ボード):全スライドを 1 ページに並べ、クリックでそのスライドへジャンプ。
function boardLayout(slide, ctx) {
  const root = slideRoot();
  root.append(kicker(slide.meta.kicker), heading(slide.meta.title), accentBar());

  const grid = el("div", {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "20px",
    marginTop: "40px",
  });

  ctx.slides.forEach((target, index) => {
    if (target.meta.layout === "board") return; // ボード自身は並べない
    const card = el(
      "button",
      {
        textAlign: "left",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        padding: "20px 22px",
        background: theme.surface,
        border: `1px solid ${theme.border}`,
        borderRadius: "14px",
        color: theme.text,
        font: "inherit",
      },
      [
        el(
          "span",
          { fontSize: "16px", fontWeight: "700", color: theme.accent },
          String(index + 1).padStart(2, "0"),
        ),
        el("span", { fontSize: "22px", fontWeight: "700", lineHeight: "1.3" }, target.meta.title),
      ],
    );
    card.addEventListener("mouseenter", () => {
      card.style.borderColor = theme.accent;
    });
    card.addEventListener("mouseleave", () => {
      card.style.borderColor = theme.border;
    });
    card.addEventListener("click", (event) => {
      event.stopPropagation();
      ctx.goTo(index);
    });
    grid.append(card);
  });
  root.append(grid);
  return root;
}

const layouts = {
  content: contentLayout,
  columns: columnsLayout,
  goal: goalLayout,
  board: boardLayout,
};

export function renderSlide(slide, ctx) {
  const layout = layouts[slide.meta.layout] ?? contentLayout;
  return layout(slide, ctx);
}
