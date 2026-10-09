import './bg.css';

// Nền chuyển động: những đường line lao chéo qua lưới chấm như sao băng, đuôi mờ dần.
// Đầu mỗi vệt là một ô vuông nhỏ, lấy từ tay nắm của khung chọn trong logo.
//   initBg()                → canvas cố định phủ cả trang (trang chủ, case study)
//   initBg({ container })   → canvas nằm trong một khối (hero của Swapifly)
const ANGLE = (145 * Math.PI) / 180; // hướng bay: từ trên-phải xuống dưới-trái
const DX = Math.cos(ANGLE), DY = Math.sin(ANGLE);

export function initBg({ container = null, dots = true, color = null, count = 6 } = {}) {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const cv = document.createElement('canvas');
  cv.className = 'hae-bg' + (container ? ' in-box' : '') + (dots ? ' dots' : '');
  cv.setAttribute('aria-hidden', 'true');
  if (container) container.prepend(cv);
  else { document.documentElement.classList.add('has-bg'); document.body.prepend(cv); }
  const ctx = cv.getContext('2d');
  let W = 0, H = 0, stars = [], raf = 0, last = 0, next = 0.4;

  const accent = () => color || getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#3645C4';

  function resize() {
    const r = container ? container.getBoundingClientRect() : { width: innerWidth, height: innerHeight };
    const dpr = Math.min(2, devicePixelRatio || 1);
    W = r.width; H = r.height;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function spawn() {
    // Xuất phát từ mép trên hoặc mép phải, ngay ngoài khung nhìn
    const fromTop = Math.random() < 0.6;
    return {
      x: fromTop ? W * (0.15 + Math.random() * 1.0) : W + 20,
      y: fromTop ? -20 : H * Math.random() * 0.6,
      v: 520 + Math.random() * 520,          // px/giây
      len: 160 + Math.random() * 260,        // độ dài đuôi
      w: 1.2 + Math.random() * 1,
      a: 0.6 + Math.random() * 0.35,
    };
  }

  function draw(s, col) {
    const tx = s.x - DX * s.len, ty = s.y - DY * s.len;
    const g = ctx.createLinearGradient(s.x, s.y, tx, ty);
    g.addColorStop(0, col); g.addColorStop(1, 'transparent');
    ctx.globalAlpha = s.a;
    ctx.strokeStyle = g; ctx.lineWidth = s.w; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(tx, ty); ctx.stroke();
    // đầu vệt: ô vuông nhỏ kiểu tay nắm
    ctx.fillStyle = col; ctx.globalAlpha = Math.min(1, s.a + 0.25);
    ctx.fillRect(s.x - 2, s.y - 2, 4, 4);
  }

  function tick(now) {
    const dt = Math.min(0.05, (now - last) / 1000 || 0); last = now;
    ctx.clearRect(0, 0, W, H);
    const col = accent();
    next -= dt;
    if (next <= 0 && stars.length < count) { stars.push(spawn()); next = 0.3 + Math.random() * 1.1; }
    stars = stars.filter((s) => {
      s.x += DX * s.v * dt; s.y += DY * s.v * dt;
      draw(s, col);
      return s.x + s.len > -40 && s.y - s.len < H + 40;
    });
    ctx.globalAlpha = 1;
    raf = requestAnimationFrame(tick);
  }

  function start() {
    cancelAnimationFrame(raf);
    resize();
    if (reduce.matches) return; // giảm chuyển động: chỉ còn lưới chấm tĩnh
    last = performance.now();
    raf = requestAnimationFrame(tick);
  }

  addEventListener('resize', resize);
  document.addEventListener('visibilitychange', () => {
    cancelAnimationFrame(raf);
    if (!document.hidden && !reduce.matches) { last = performance.now(); raf = requestAnimationFrame(tick); }
  });
  start();
}
