// Tìm các "đơn vị dịch" trong DOM. Dùng chung cho trình duyệt (i18n.js) và script kiểm tra từ điển,
// để khoá tra cứu ở hai nơi luôn giống nhau.
//  - el:   phần tử có chữ trực tiếp và chỉ chứa thẻ inline trơn (strong, b, em, br…) → dịch cả innerHTML
//  - text: một text node lẻ (khi phần tử cha còn chứa svg, span có class…)
//  - attr: alt, aria-label, title, placeholder, data-label

const PLAIN = new Set(['STRONG', 'B', 'EM', 'I', 'BR', 'SUP', 'SUB', 'SMALL']);
const SKIP = new Set(['SCRIPT', 'STYLE', 'SVG', 'NOSCRIPT', 'TEMPLATE']);
export const ATTRS = ['alt', 'aria-label', 'title', 'placeholder', 'data-label'];

export const norm = (s) => s.replace(/\s+/g, ' ').trim();

function plainInline(el) {
  for (const c of el.children) {
    if (!PLAIN.has(c.tagName.toUpperCase()) || c.attributes.length || !plainInline(c)) return false;
  }
  return true;
}

export function ser(el) {
  let out = '';
  for (const n of el.childNodes) {
    if (n.nodeType === 3) out += n.nodeValue;
    else if (n.nodeType === 1) {
      const t = n.tagName.toLowerCase();
      out += t === 'br' ? '<br>' : `<${t}>${ser(n)}</${t}>`;
    }
  }
  return out;
}

export function collect(root) {
  const units = [];
  const walk = (el) => {
    const tag = el.tagName.toUpperCase();
    if (SKIP.has(tag) || el.hasAttribute('data-i18n-skip')) return;
    for (const a of ATTRS) {
      const v = el.getAttribute(a);
      if (v && norm(v)) units.push({ type: 'attr', el, attr: a, key: norm(v) });
    }
    const texts = [...el.childNodes].filter((n) => n.nodeType === 3 && norm(n.nodeValue));
    if (texts.length && el.children.length && plainInline(el)) {
      units.push({ type: 'el', el, key: norm(ser(el)) });
      return;
    }
    for (const n of texts) units.push({ type: 'text', node: n, key: norm(n.nodeValue) });
    for (const c of el.children) walk(c);
  };
  walk(root);
  return units;
}
