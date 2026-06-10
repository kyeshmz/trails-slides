// DOM 生成のための小さなヘルパー(レイアウトと Markdown 両方から使うため独立モジュールに切り出し)。
export function el(tag, style = {}, children = []) {
  const node = document.createElement(tag);
  Object.assign(node.style, style);
  for (const child of [].concat(children)) {
    if (child == null) continue;
    node.append(
      typeof child === "string" ? document.createTextNode(child) : child,
    );
  }
  return node;
}
