import './select.css';

// "Khung chọn": con trỏ HAE kéo vùng chọn kiểu Figma quanh từng khung hình khi nó vào tầm nhìn.
// wrap: bọc phần tử để khung chọn nằm ngoài mép (dùng khi phần tử cắt overflow).
// Không wrap: khung chọn nằm bên trong phần tử, không đụng tới bố cục sẵn có.
const reduce = matchMedia('(prefers-reduced-motion: reduce)');

function sizeOf(el) {
  const img = el.matches('img') ? el : el.querySelector('img');
  const w = +(img?.getAttribute('width') || 0) || img?.naturalWidth || Math.round(el.offsetWidth);
  const h = +(img?.getAttribute('height') || 0) || img?.naturalHeight || Math.round(el.offsetHeight);
  return [w, h];
}

function countUp(label, w, h) {
  const t0 = performance.now();
  const step = (t) => {
    const k = Math.min(1, (t - t0) / 700), e = 1 - Math.pow(1 - k, 4);
    label.textContent = `${Math.round(w * e)} × ${Math.round(h * e)}`;
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

export function initSelect(selector, { wrap = false } = {}) {
  const targets = [...document.querySelectorAll(selector)];
  if (!targets.length || reduce.matches || !('IntersectionObserver' in window)) return;

  const hosts = targets.map((el) => {
    let host = el;
    if (wrap) {
      host = document.createElement('div');
      host.className = 'sel-wrap';
      el.replaceWith(host);
      el.classList.add('sel-t');
      host.appendChild(el);
    } else {
      el.classList.add('sel-host');
    }
    const sel = document.createElement('span');
    sel.className = 'sel';
    sel.setAttribute('aria-hidden', 'true');
    sel.innerHTML = '<i></i><i></i><i></i><i></i><b></b><span class="cur"><svg viewBox="0 0 18 18"><path d="M2 2l5.2 13 2-5.6 5.6-2z"/></svg><em>HAE</em></span>';
    host.appendChild(sel);
    host._size = sizeOf(el);
    sel.querySelector('b').textContent = `${host._size[0]} × ${host._size[1]}`;
    return host;
  });

  const io = new IntersectionObserver((entries) => {
    // Các khung vào cùng lúc thì chọn lần lượt, không đồng loạt.
    entries.filter((e) => e.isIntersecting).forEach((e, i) => {
      const host = e.target;
      io.unobserve(host);
      setTimeout(() => {
        host.classList.add('on');
        setTimeout(() => countUp(host.querySelector('.sel b'), ...host._size), 250);
        setTimeout(() => host.classList.add('done'), 2800);
      }, i * 160);
    });
  }, { threshold: 0.2 });
  hosts.forEach((h) => io.observe(h));
}
