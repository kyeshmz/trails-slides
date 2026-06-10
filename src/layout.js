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

// data-animate の付いた要素は、スライド表示時に main.js が順番にアニメーションさせる。
function animated(node) {
  if (node) node.dataset.animate = "";
  return node;
}

function kicker(text) {
  if (!text) return null;
  return animated(
    el(
      "p",
      {
        margin: "0 0 16px",
        fontSize: "20px",
        fontWeight: "700",
        letterSpacing: "0.2em",
        color: theme.accent,
      },
      text,
    ),
  );
}

function heading(text, size = "56px") {
  return animated(
    el(
      "h1",
      { margin: "0", fontSize: size, fontWeight: "900", lineHeight: "1.25" },
      inline(text),
    ),
  );
}

function accentBar() {
  return animated(
    el("div", {
      width: "96px",
      height: "6px",
      margin: "24px 0 0",
      borderRadius: "3px",
      background: theme.accent,
    }),
  );
}

// スライド全面に敷く背景画像と、文字を読みやすくするグラデーション。
// 画像には data-kenburns が付き、表示中ゆっくりズームする。
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
  img.dataset.kenburns = "";
  const shade = el("div", { position: "absolute", inset: "0", background: gradient });
  return [img, shade];
}

// 1 つの Markdown ブロックを DOM に変換する。
function renderBlock(block) {
  switch (block.type) {
    case "h2":
      return animated(
        el(
          "h2",
          { margin: "0 0 4px", fontSize: "26px", fontWeight: "700", color: theme.accent },
          inline(block.text),
        ),
      );
    case "h3":
      return animated(
        el(
          "h3",
          { margin: "8px 0 0", fontSize: "22px", fontWeight: "700" },
          inline(block.text),
        ),
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
      return animated(img);
    }
    case "ul":
    case "ol": {
      // 1 スライドの箇条書きは最大 3 つまで。超えた分は表示しない。
      const MAX_BULLETS = 3;
      if (block.items.length > MAX_BULLETS) {
        console.warn(
          `箇条書きが ${block.items.length} 個あります。最大 ${MAX_BULLETS} 個までしか表示されません:`,
          block.items[MAX_BULLETS],
        );
      }
      const list = el(block.type === "ol" ? "ol" : "ul", {
        margin: "0",
        paddingLeft: "1.4em",
        display: "flex",
        flexDirection: "column",
        gap: "18px",
      });
      for (const item of block.items.slice(0, MAX_BULLETS)) {
        list.append(
          animated(
            el("li", { fontSize: "26px", lineHeight: "1.55" }, inline(item)),
          ),
        );
      }
      return list;
    }
    case "quote":
      return animated(
        el(
          "blockquote",
          {
            margin: "0",
            padding: "12px 24px",
            borderLeft: `4px solid ${theme.accent}`,
            fontSize: "24px",
            color: theme.muted,
          },
          inline(block.text),
        ),
      );
    default:
      return animated(
        el(
          "p",
          { margin: "0", fontSize: "26px", lineHeight: "1.6" },
          inline(block.text),
        ),
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
      animated(el("div", { display: "flex", gap: "28px", alignItems: "center" }, [
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
      ])),
    );
  });
  root.append(list);
  return root;
}

// SVG 要素用ヘルパー(エッジの描画に使う)。
function svgEl(tag, attrs) {
  const node = document.createElementNS("http://www.w3.org/2000/svg", tag);
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value);
  return node;
}

// 2 軸チャート:x 軸 / y 軸(`x:` `y:` フロントマター)の上に点を打つ。
// 本文の `- ラベル | x | y`(0〜100)が点。`*` で始まるラベルはアクセント色。
// `link: A -- B` で 2 点を破線でつなぐ(「同じ話でも相手で実用性が変わる」用)。
function chartLayout(slide) {
  const root = slideRoot();
  root.append(kicker(slide.meta.kicker), heading(slide.meta.title, "48px"));
  if (slide.meta.subtitle) {
    root.append(
      animated(
        el(
          "p",
          { margin: "10px 0 0", fontSize: "26px", fontWeight: "500", color: theme.muted },
          slide.meta.subtitle,
        ),
      ),
    );
  }
  root.append(accentBar());

  const points = [];
  for (const item of slide.blocks.find((b) => b.type === "ul")?.items ?? []) {
    const m = /^(\*?)\s*(.+?)\s*\|\s*(\d+)\s*\|\s*(\d+)$/.exec(item);
    if (!m) continue;
    points.push({ accent: m[1] === "*", label: m[2], x: Number(m[3]), y: Number(m[4]) });
  }

  // 軸ラベルの分だけ余白を取ったチャート領域。座標は % で配置する。
  const area = el("div", {
    position: "relative",
    flex: "1",
    margin: "20px 24px 34px 56px",
  });
  const toTop = (y) => 100 - y; // y は上が大きい値になるように反転

  // 軸(下と左)と中央の補助線。
  area.append(
    el("div", { position: "absolute", left: "0", right: "0", bottom: "0", height: "2px", background: "rgba(255,255,255,0.35)" }),
    el("div", { position: "absolute", left: "0", top: "0", bottom: "0", width: "2px", background: "rgba(255,255,255,0.35)" }),
    el("div", { position: "absolute", left: "50%", top: "0", bottom: "0", width: "1px", background: "rgba(255,255,255,0.08)" }),
    el("div", { position: "absolute", left: "0", right: "0", top: "50%", height: "1px", background: "rgba(255,255,255,0.08)" }),
    // 軸の矢印とラベル
    el("div", { position: "absolute", right: "-6px", bottom: "-7px", fontSize: "16px", color: "rgba(255,255,255,0.55)" }, "▶"),
    el("div", { position: "absolute", left: "-7px", top: "-8px", fontSize: "16px", color: "rgba(255,255,255,0.55)" }, "▲"),
    animated(
      el(
        "div",
        {
          position: "absolute",
          right: "0",
          bottom: "-34px",
          fontSize: "20px",
          fontWeight: "700",
          color: theme.muted,
        },
        `${slide.meta.x ?? "x"} →`,
      ),
    ),
    animated(
      el(
        "div",
        {
          position: "absolute",
          left: "12px",
          top: "-6px",
          fontSize: "20px",
          fontWeight: "700",
          color: theme.muted,
        },
        `↑ ${slide.meta.y ?? "y"}`,
      ),
    ),
  );

  // link: A -- B の 2 点を破線でつなぐ。
  const linkMatch = /^(.+?)\s*--\s*(.+)$/.exec(slide.meta.link ?? "");
  if (linkMatch) {
    const a = points.find((p) => p.label === linkMatch[1].trim());
    const b = points.find((p) => p.label === linkMatch[2].trim());
    if (a && b) {
      const svg = svgEl("svg", {
        viewBox: "0 0 100 100",
        preserveAspectRatio: "none",
        style: "position:absolute;inset:0;width:100%;height:100%;overflow:visible",
      });
      svg.append(
        svgEl("line", {
          x1: a.x, y1: toTop(a.y), x2: b.x, y2: toTop(b.y),
          stroke: "rgba(94,234,212,0.6)",
          "stroke-width": "2",
          "stroke-dasharray": "7 7",
          "vector-effect": "non-scaling-stroke",
        }),
      );
      svg.dataset.animate = "";
      area.append(svg);
    }
  }

  // 点とラベル。
  for (const point of points) {
    const color = point.accent ? theme.accent : "#aab1bd";
    area.append(
      animated(
        el(
          "div",
          {
            position: "absolute",
            left: `${point.x}%`,
            top: `${toTop(point.y)}%`,
            transform: "translate(-50%, -50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "10px",
          },
          [
            el(
              "div",
              {
                padding: "8px 18px",
                borderRadius: "999px",
                fontSize: "20px",
                fontWeight: "700",
                whiteSpace: "nowrap",
                color: point.accent ? theme.accent : theme.text,
                background: point.accent ? theme.accentDim : theme.surface,
                border: point.accent ? `2px solid ${theme.accent}` : `1px solid ${theme.border}`,
              },
              point.label,
            ),
            el("div", {
              width: "16px",
              height: "16px",
              borderRadius: "50%",
              background: color,
              boxShadow: `0 0 0 5px ${point.accent ? "rgba(94,234,212,0.2)" : "rgba(255,255,255,0.08)"}`,
            }),
          ],
        ),
      ),
    );
  }
  root.append(area);
  return root;
}

// 経歴タイムライン:`## 頭字語` + ロゴ画像 + ひとことのグループを矢印でつなぐ。// `???` のノードはオチ用(ロゴは複数並べられる)。
function timelineLayout(slide) {
  const root = slideRoot();
  root.append(kicker(slide.meta.kicker), heading(slide.meta.title));
  if (slide.meta.subtitle) {
    root.append(
      animated(
        el(
          "p",
          { margin: "12px 0 0", fontSize: "28px", fontWeight: "500", color: theme.muted },
          slide.meta.subtitle,
        ),
      ),
    );
  }
  root.append(accentBar());

  const stops = [];
  let stop = null;
  for (const block of slide.blocks) {
    if (block.type === "h2") {
      stop = { name: block.text, logos: [], desc: "" };
      stops.push(stop);
    } else if (stop && block.type === "img") {
      stop.logos.push(block);
    } else if (stop && block.type === "p") {
      stop.desc = block.text;
    }
  }

  const row = el("div", {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    flex: "1",
    marginTop: "48px",
  });

  stops.forEach((entry, idx) => {
    const isPun = entry.name.includes("?");
    if (idx > 0) {
      row.append(
        animated(
          el(
            "div",
            { fontSize: "40px", fontWeight: "900", color: theme.accent, flex: "0 0 auto" },
            "→",
          ),
        ),
      );
    }
    // ロゴは白いチップに載せて、ダークテーマでも見えるようにする。
    const logoChip = el(
      "div",
      {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "14px",
        width: "100%",
        height: "88px",
        padding: "14px 18px",
        boxSizing: "border-box",
        background: "#ffffff",
        borderRadius: "14px",
      },
      entry.logos.map((logo) => {
        const img = el("img", {
          maxHeight: "100%",
          maxWidth: entry.logos.length > 1 ? "44%" : "85%",
          objectFit: "contain",
        });
        img.src = logo.src;
        img.alt = logo.alt;
        return img;
      }),
    );
    row.append(
      animated(
        el(
          "div",
          {
            flex: "1",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
            padding: "28px 16px",
            textAlign: "center",
            background: isPun ? theme.accentDim : theme.surface,
            border: isPun ? `2px dashed ${theme.accent}` : `1px solid ${theme.border}`,
            borderRadius: "20px",
          },
          [
            logoChip,
            el(
              "div",
              {
                fontSize: "44px",
                fontWeight: "900",
                letterSpacing: "0.06em",
                color: isPun ? theme.accent : theme.text,
              },
              entry.name,
            ),
            el(
              "div",
              { fontSize: "16px", lineHeight: "1.5", color: theme.muted },
              inline(entry.desc),
            ),
          ],
        ),
      ),
    );
  });
  root.append(row);
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
    padding: "0 96px 104px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  });
  if (slide.meta.kicker) text.append(kicker(slide.meta.kicker));
  text.append(heading(slide.meta.title, "96px"));
  if (slide.meta.subtitle) {
    text.append(
      animated(
        el(
          "p",
          { margin: "0", fontSize: "30px", fontWeight: "500", color: "rgba(244,245,247,0.85)" },
          slide.meta.subtitle,
        ),
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

  const progress = animated(el(
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
  ));

  const text = el("div", {
    position: "relative",
    padding: "0 96px 96px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  });
  text.append(heading(slide.meta.title, "56px"));
  if (slide.meta.caption) {
    text.append(
      animated(
        el(
          "p",
          { margin: "0", fontSize: "27px", fontWeight: "500", color: "rgba(244,245,247,0.88)" },
          slide.meta.caption,
        ),
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
    grid.append(animated(card));
  });
  root.append(grid);
  return root;
}

const layouts = {
  content: contentLayout,
  goal: goalLayout,
  chart: chartLayout,
  timeline: timelineLayout,
  cover: coverLayout,
  galleryItem: galleryItemLayout,
  board: boardLayout,
};

// マスターテンプレート:全スライド共通のフッター。
// 左下に「名前 — スライドタイトル」、右下にページ番号を小さく載せる。
const AUTHOR = "Kye Shimizu";

function applyMasterTemplate(root, slide, pos) {
  const footerText = {
    position: "absolute",
    bottom: "26px",
    fontSize: "15px",
    fontWeight: "500",
    letterSpacing: "0.04em",
    color: "rgba(244, 245, 247, 0.6)",
    zIndex: "5",
    margin: "0",
  };
  root.append(
    el("div", {
      position: "absolute",
      left: "36px",
      right: "36px",
      bottom: "58px",
      height: "1px",
      background: "rgba(255, 255, 255, 0.12)",
      zIndex: "5",
    }),
    el(
      "p",
      { ...footerText, left: "36px" },
      `${AUTHOR}${slide.meta.title ? ` — ${slide.meta.title}` : ""}`,
    ),
    el(
      "p",
      { ...footerText, right: "36px" },
      `${pos.index + 1} / ${pos.total}`,
    ),
  );
}

export function renderSlide(slide, ctx, pos) {
  const layout = layouts[slide.meta.layout] ?? contentLayout;
  const root = layout(slide, ctx);
  if (pos) applyMasterTemplate(root, slide, pos);
  return root;
}
