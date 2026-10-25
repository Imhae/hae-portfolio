import './bg.css';

// Nền chuyển động: lưới chấm tĩnh + một cụm chấm sáng đi theo con trỏ (CSS mask, không vẽ canvas).
// Con trỏ dùng chung của site cũng được khởi tạo ở đây, một lần cho cả trang dù initBg() gọi nhiều lần.
//   initBg()                → lớp nền cố định phủ cả trang (trang chủ, case study)
//   initBg({ container })   → lớp nền nằm trong một khối (hero của Swapifly)
let cursorReady = false;
const glows = [];

function syncGlows(clientX, clientY) {
  for (const g of glows) {
    let x = clientX, y = clientY;
    if (g.container) {
      const r = g.container.getBoundingClientRect();
      x -= r.left; y -= r.top;
    }
    g.el.style.setProperty('--mx', x + 'px');
    g.el.style.setProperty('--my', y + 'px');
  }
}

function initCursor() {
  if (cursorReady) return;
  cursorReady = true;
  if (!matchMedia('(pointer: fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const el = document.createElement('div');
  el.className = 'hae-cursor';
  el.setAttribute('aria-hidden', 'true');
  el.innerHTML = '<span class="ring"></span><span class="mark"><i></i><i></i><i></i><i></i></span>';
  document.body.appendChild(el);

  let mx = -100, my = -100, cx = -100, cy = -100, on = false;
  addEventListener('pointermove', (e) => {
    mx = e.clientX; my = e.clientY;
    if (!on) { on = true; el.classList.add('on'); }
    el.classList.toggle('big', !!e.target.closest('a,button,.card,.shot,.phone .frame,.next,.c'));
    syncGlows(mx, my);
  }, { passive: true });
  document.addEventListener('pointerleave', () => { on = false; el.classList.remove('on'); });

  (function loop() {
    cx += (mx - cx) * 0.22; cy += (my - cy) * 0.22;
    el.style.transform = `translate3d(${cx}px,${cy}px,0)`;
    requestAnimationFrame(loop);
  })();
}

export function initBg({ container = null, dots = true, color = null } = {}) {
  initCursor();

  const wrap = document.createElement('div');
  wrap.className = 'hae-bg' + (container ? ' in-box' : '') + (dots ? ' dots' : '');
  wrap.setAttribute('aria-hidden', 'true');
  if (color) wrap.style.setProperty('--glow-color', color);

  const glow = document.createElement('div');
  glow.className = 'hae-bg__glow';
  wrap.appendChild(glow);

  if (container) container.prepend(wrap);
  else { document.documentElement.classList.add('has-bg'); document.body.prepend(wrap); }

  glows.push({ el: glow, container });
}
