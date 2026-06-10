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

// スライド全面に敷く背景画像と、文字を読みやすくするグラデーション。
function fullBleedImage(src, gradient) {
  const img = el("img", {
    position: "absolute",
    inset: "0",
    width: "100%",
    height: "100%",
    objectFit: "cover",
  });
  img.src = src;
  img.alt = "";
  const shade = el("div", { position: "absolute", inset: "0", background: gradient });
  return [img, shade];
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
    case "img": {
      const img = el("img", {
        maxWidth: "100%",
        maxHeight: "320px",
        borderRadius: "16px",
        objectFit: "cover",
      });
      img.src = block.src;
      img.alt = block.alt;
      return img;
    }
    case "ul":
    case "ol": {
      const list = el(block.type === "ol" ? "ol" : "ul", {
        margin: "0",
        paddingLeft: "1.4em",
        display: "flex",
        flexDirection: "column",
        gap: "18px",
      });
      for (const item of block.items) {
        list.append(
          el("li", { fontSize: "26px", lineHeight: "1.55" }, inline(item)),
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
        { margin: "0", fontSize: "26px", lineHeight: "1.6" },
        inline(block.text),
      );
  }
}

// 見出し + 本文を縦に積む標準レイアウト。
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
    gap: "22px",
    marginTop: "44px",
    justifyContent: "center",
    flex: "1",
  });
  for (const block of slide.blocks) body.append(renderBlock(block));
  root.append(body);
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

// 章扉:全面写真の上にカテゴリ名を大きく載せる。
function coverLayout(slide) {
  const root = slideRoot({
    padding: "0",
    justifyContent: "flex-end",
  });
  if (slide.meta.image) {
    root.append(
      ...fullBleedImage(
        slide.meta.image,
        "linear-gradient(to top, rgba(10,11,15,0.92) 0%, rgba(10,11,15,0.35) 55%, rgba(10,11,15,0.25) 100%)",
      ),
    );
  }
  const text = el("div", {
    position: "relative",
    padding: "0 96px 84px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  });
  if (slide.meta.kicker) text.append(kicker(slide.meta.kicker));
  text.append(heading(slide.meta.title, "96px"));
  if (slide.meta.subtitle) {
    text.append(
      el(
        "p",
        { margin: "0", fontSize: "30px", fontWeight: "500", color: "rgba(244,245,247,0.85)" },
        slide.meta.subtitle,
      ),
    );
  }
  root.append(text);
  return root;
}

// 作品ギャラリーの 1 枚:全面写真 + タイトル + ひとこと。矢印キーで次々に送る。
function galleryItemLayout(slide) {
  const root = slideRoot({ padding: "0", justifyContent: "flex-end" });
  root.append(
    ...fullBleedImage(
      slide.meta.image,
      "linear-gradient(to top, rgba(10,11,15,0.9) 0%, rgba(10,11,15,0.2) 45%, rgba(10,11,15,0.1) 100%)",
    ),
  );

  const progress = el(
    "div",
    {
      position: "absolute",
      top: "28px",
      right: "36px",
      fontSize: "18px",
      fontWeight: "700",
      letterSpacing: "0.15em",
      color: "rgba(244,245,247,0.9)",
      padding: "6px 16px",
      borderRadius: "999px",
      background: "rgba(10,11,15,0.45)",
    },
    `${slide.meta.kicker}  ${String(slide.meta.index + 1).padStart(2, "0")} / ${String(slide.meta.total).padStart(2, "0")}`,
  );

  const text = el("div", {
    position: "relative",
    padding: "0 96px 72px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  });
  text.append(heading(slide.meta.title, "56px"));
  if (slide.meta.caption) {
    text.append(
      el(
        "p",
        { margin: "0", fontSize: "27px", fontWeight: "500", color: "rgba(244,245,247,0.88)" },
        slide.meta.caption,
      ),
    );
  }
  root.append(progress, text);
  return root;
}

// もくじ(ボード):カテゴリの章扉スライドを写真カードとして並べ、クリックでジャンプ。
function boardLayout(slide, ctx) {
  const root = slideRoot();
  root.append(kicker(slide.meta.kicker), heading(slide.meta.title), accentBar());

  const grid = el("div", {
    display: "flex",
    gap: "20px",
    marginTop: "44px",
    flex: "1",
    alignItems: "stretch",
  });

  ctx.slides.forEach((target, index) => {
    if (target.meta.layout !== "cover") return;
    const card = el(
      "button",
      {
        position: "relative",
        flex: "1",
        cursor: "pointer",
        overflow: "hidden",
        padding: "0",
        border: `1px solid ${theme.border}`,
        borderRadius: "18px",
        background: theme.surface,
        color: theme.text,
        font: "inherit",
        display: "flex",
        alignItems: "flex-end",
        transition: "transform 0.2s ease, border-color 0.2s ease",
      },
      [
        ...(target.meta.image
          ? fullBleedImage(
              target.meta.image,
              "linear-gradient(to top, rgba(10,11,15,0.9) 0%, rgba(10,11,15,0.15) 60%)",
            )
          : []),
        el(
          "div",
          {
            position: "relative",
            width: "100%",
            padding: "0 18px 20px",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            textAlign: "left",
          },
          [
            el(
              "span",
              { fontSize: "15px", fontWeight: "700", color: theme.accent },
              String(index + 1).padStart(2, "0"),
            ),
            el(
              "span",
              { fontSize: "30px", fontWeight: "900", lineHeight: "1.2" },
              target.meta.title,
            ),
            target.meta.subtitle
              ? el(
                  "span",
                  { fontSize: "15px", color: "rgba(244,245,247,0.75)" },
                  target.meta.subtitle,
                )
              : null,
          ],
        ),
      ],
    );
    card.addEventListener("mouseenter", () => {
      card.style.borderColor = theme.accent;
      card.style.transform = "translateY(-6px)";
    });
    card.addEventListener("mouseleave", () => {
      card.style.borderColor = theme.border;
      card.style.transform = "translateY(0)";
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
  goal: goalLayout,
  cover: coverLayout,
  galleryItem: galleryItemLayout,
  board: boardLayout,
};

export function renderSlide(slide, ctx) {
  const layout = layouts[slide.meta.layout] ?? contentLayout;
  return layout(slide, ctx);
}
