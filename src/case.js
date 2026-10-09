import './case.css';
import { initSelect } from './select.js';
import { initLightbox } from './lightbox.js';
import { initI18n } from './i18n.js';
import { initBg } from './bg.js';

const root = document.documentElement;
root.classList.add('js');

// Dùng chung khoá theme với trang chủ để lựa chọn sáng/tối đi theo người xem.
const store = {
  get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
};
const saved = store.get('hae-theme');
if (saved) root.dataset.theme = saved;
document.getElementById('themeBtn')?.addEventListener('click', () => {
  const cur = root.dataset.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  root.dataset.theme = cur === 'dark' ? 'light' : 'dark';
  store.set('hae-theme', root.dataset.theme);
});

// Thanh tiến độ đọc
const bar = document.getElementById('progress');
const onScroll = () => {
  const max = document.documentElement.scrollHeight - innerHeight;
  if (bar) bar.style.transform = `scaleX(${max > 0 ? Math.min(1, scrollY / max) : 0})`;
};
addEventListener('scroll', onScroll, { passive: true });
addEventListener('resize', onScroll);
onScroll();

// Reveal
const els = document.querySelectorAll('[data-r]');
if (!('IntersectionObserver' in window)) {
  els.forEach((el) => el.classList.add('in'));
} else {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
  els.forEach((el) => io.observe(el));
}

// Chuyển động nhận diện: khung chọn kiểu Figma quanh mỗi ảnh màn hình
initSelect('.shot, .phone .frame', { wrap: true });

// Nhấn vào ảnh để xem phóng to
initLightbox('.shot img, .phone .frame img, .band > img');

// Nền chuyển động: lưới chấm và các khung chọn tự phác phía sau nội dung
initBg();

// Nút chuyển ngôn ngữ VI / EN (chạy sau cùng để dịch cả phần DOM các module trên vừa dựng)
initI18n();
