// エントリーポイント:ステージの生成、ウィンドウへのフィット、スライド切り替え。
import { SLIDE_WIDTH, SLIDE_HEIGHT, theme } from "./theme.js";
import { el, renderSlide } from "./layout.js";
import { slides } from "./slides.js";

Object.assign(document.body.style, {
  margin: "0",
  background: theme.background,
  overflow: "hidden",
});

// スライドを実寸(1280x720)で描画し、transform でウィンドウにフィットさせる。
const stage = el("div", {
  position: "fixed",
  left: "50%",
  top: "50%",
  width: `${SLIDE_WIDTH}px`,
  height: `${SLIDE_HEIGHT}px`,
  transformOrigin: "center center",
});

const counter = el("div", {
  position: "fixed",
  right: "20px",
  bottom: "16px",
  fontSize: "14px",
  fontFamily: theme.fontFamily,
  color: theme.muted,
  zIndex: "10",
});

document.body.append(stage, counter);

let current = 0;

function clampIndex(index) {
  return Math.min(Math.max(index, 0), slides.length - 1);
}

function show(index) {
  current = clampIndex(index);
  stage.replaceChildren(renderSlide(slides[current]));
  counter.textContent = `${current + 1} / ${slides.length}`;
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
  }
});

// クリック/タップでも進められるように(左端 1/4 は戻る)。
stage.addEventListener("click", (event) => {
  const goBack = event.clientX < window.innerWidth / 4;
  show(current + (goBack ? -1 : 1));
});

function showFromHash() {
  const fromHash = Number.parseInt(location.hash.slice(1), 10);
  show(Number.isFinite(fromHash) ? fromHash - 1 : 0);
}

window.addEventListener("hashchange", showFromHash);
fitToWindow();
showFromHash();
