// エントリーポイント:Markdown スライドの読み込み、もくじ(ボード)の挿入、
// ホームボタン、ステージの拡大縮小、スライド切り替え。
import { SLIDE_WIDTH, SLIDE_HEIGHT, theme } from "./theme.js";
import { el } from "./dom.js";
import { renderSlide } from "./layout.js";
import { parseDoc, parseBlocks } from "./markdown.js";
import { manifest } from "../slides/manifest.js";

Object.assign(document.body.style, {
  margin: "0",
  background: theme.background,
  overflow: "hidden",
});

const stage = el("div", {
  position: "fixed",
  left: "50%",
  top: "50%",
  width: `${SLIDE_WIDTH}px`,
  height: `${SLIDE_HEIGHT}px`,
  transformOrigin: "center center",
});

// ホームボタン:どのスライドからでも、もくじ(ボード)へ戻れる。
const homeButton = el(
  "button",
  {
    position: "fixed",
    left: "20px",
    top: "18px",
    zIndex: "10",
    cursor: "pointer",
    padding: "8px 16px",
    fontSize: "15px",
    fontWeight: "700",
    fontFamily: theme.fontFamily,
    color: theme.accent,
    background: theme.accentDim,
    border: `1px solid ${theme.border}`,
    borderRadius: "999px",
  },
  "⌂ もくじ",
);

const counter = el("div", {
  position: "fixed",
  right: "20px",
  bottom: "16px",
  fontSize: "14px",
  fontFamily: theme.fontFamily,
  color: theme.muted,
  zIndex: "10",
});

document.body.append(stage, homeButton, counter);

let slides = [];
let boardIndex = 1;
let current = 0;

function clampIndex(index) {
  return Math.min(Math.max(index, 0), slides.length - 1);
}

const context = { get slides() { return slides; }, goTo: (i) => show(i) };

function show(index) {
  current = clampIndex(index);
  const slide = slides[current];
  stage.replaceChildren(renderSlide(slide, context));
  counter.textContent = `${current + 1} / ${slides.length}`;
  homeButton.style.display = slide.meta.layout === "board" ? "none" : "block";
  if (location.hash !== `#${current + 1}`) {
    history.replaceState(null, "", `#${current + 1}`);
  }
}

function fitToWindow() {
  const scale = Math.min(
    window.innerWidth / SLIDE_WIDTH,
    window.innerHeight / SLIDE_HEIGHT,
  );
  stage.style.transform = `translate(-50%, -50%) scale(${scale})`;
}

homeButton.addEventListener("click", () => show(boardIndex));

window.addEventListener("resize", fitToWindow);

window.addEventListener("keydown", (event) => {
  if (["ArrowRight", "ArrowDown", "PageDown", " "].includes(event.key)) {
    event.preventDefault();
    show(current + 1);
  } else if (["ArrowLeft", "ArrowUp", "PageUp"].includes(event.key)) {
    event.preventDefault();
    show(current - 1);
  } else if (event.key === "Home") {
    show(0);
  } else if (event.key === "End") {
    show(slides.length - 1);
  } else if (event.key === "Escape") {
    show(boardIndex);
  }
});

// クリック/タップでの送り(ボードではカード操作を優先するため無効化)。
stage.addEventListener("click", (event) => {
  if (slides[current]?.meta.layout === "board") return;
  const goBack = event.clientX < window.innerWidth / 4;
  show(current + (goBack ? -1 : 1));
});

function showFromHash() {
  const fromHash = Number.parseInt(location.hash.slice(1), 10);
  show(Number.isFinite(fromHash) ? fromHash - 1 : 0);
}
window.addEventListener("hashchange", showFromHash);

async function loadSlide(file) {
  const res = await fetch(new URL(`../slides/${file}`, import.meta.url));
  if (!res.ok) throw new Error(`読み込み失敗: ${file} (${res.status})`);
  const { meta, body } = parseDoc(await res.text());
  return { meta, blocks: parseBlocks(body) };
}

async function init() {
  const docs = await Promise.all(manifest.map(loadSlide));
  // もくじ(ボード)を 2 番目のスライドとして挿入する。
  const board = { meta: { layout: "board", kicker: "INDEX", title: "もくじ" }, blocks: [] };
  docs.splice(boardIndex, 0, board);
  slides = docs;

  fitToWindow();
  showFromHash();
}

init().catch((error) => {
  document.body.append(
    el(
      "pre",
      { color: theme.text, fontFamily: theme.fontFamily, padding: "24px" },
      String(error),
    ),
  );
});
