// 最小限の Markdown パーサ。外部依存なしで、スライドに必要な記法だけを扱う:
// フロントマター、見出し(# ## ###)、箇条書き(- *)、番号付きリスト、引用(>)、
// 段落、インライン(**太字** *斜体* `コード` [リンク](url))。
import { el } from "./dom.js";
import { theme } from "./theme.js";

// `---` で囲んだフロントマターを meta に、それ以外を body に分ける。
export function parseDoc(text) {
  const normalized = text.replace(/\r\n/g, "\n");
  const lines = normalized.split("\n");
  const meta = {};
  if (lines[0]?.trim() === "---") {
    let i = 1;
    while (i < lines.length && lines[i].trim() !== "---") {
      const idx = lines[i].indexOf(":");
      if (idx !== -1) {
        meta[lines[i].slice(0, idx).trim()] = lines[i].slice(idx + 1).trim();
      }
      i++;
    }
    return { meta, body: lines.slice(i + 1).join("\n") };
  }
  return { meta, body: normalized };
}

// 本文をブロックの配列に変換する。レイアウト側がブロックを使って配置を決める。
export function parseBlocks(md) {
  const lines = md.split("\n");
  const blocks = [];
  let i = 0;
  const isSpecial = (l) =>
    /^(#{1,3}\s|\s*[-*]\s|\s*\d+\.\s|\s*>\s?)/.test(l);

  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === "") {
      i++;
      continue;
    }
    let m;
    if ((m = /^(#{1,3})\s+(.*)$/.exec(line))) {
      blocks.push({ type: `h${m[1].length}`, text: m[2] });
      i++;
    } else if (/^\s*[-*]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, ""));
        i++;
      }
      blocks.push({ type: "ul", items });
    } else if (/^\s*\d+\.\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, ""));
        i++;
      }
      blocks.push({ type: "ol", items });
    } else if (/^\s*>\s?/.test(line)) {
      const parts = [];
      while (i < lines.length && /^\s*>\s?/.test(lines[i])) {
        parts.push(lines[i].replace(/^\s*>\s?/, ""));
        i++;
      }
      blocks.push({ type: "quote", text: parts.join(" ") });
    } else {
      const parts = [];
      while (i < lines.length && lines[i].trim() !== "" && !isSpecial(lines[i])) {
        parts.push(lines[i].trim());
        i++;
      }
      blocks.push({ type: "p", text: parts.join(" ") });
    }
  }
  return blocks;
}

// インライン記法を DOM ノードの配列に変換する。
export function inline(text) {
  const nodes = [];
  const re =
    /\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\)/g;
  let last = 0;
  let m;
  while ((m = re.exec(text))) {
    if (m.index > last) {
      nodes.push(document.createTextNode(text.slice(last, m.index)));
    }
    if (m[1] != null) {
      nodes.push(el("strong", { fontWeight: "700" }, m[1]));
    } else if (m[2] != null) {
      nodes.push(el("em", { fontStyle: "italic" }, m[2]));
    } else if (m[3] != null) {
      nodes.push(
        el(
          "code",
          {
            fontFamily: "ui-monospace, monospace",
            fontSize: "0.92em",
            padding: "1px 6px",
            borderRadius: "5px",
            background: "rgba(255,255,255,0.08)",
          },
          m[3],
        ),
      );
    } else if (m[4] != null) {
      const a = el("a", { color: theme.accent, textDecoration: "none" }, m[4]);
      a.href = m[5];
      nodes.push(a);
    }
    last = re.lastIndex;
  }
  if (last < text.length) {
    nodes.push(document.createTextNode(text.slice(last)));
  }
  return nodes;
}
