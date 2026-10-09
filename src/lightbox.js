import './lightbox.css';

// Nhấn vào ảnh màn hình để xem phóng to toàn màn hình.
const icon = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"/></svg>`;

export function initLightbox(selector) {
  const imgs = [...document.querySelectorAll(selector)];
  if (!imgs.length) return;

  const lb = document.createElement('div');
  lb.className = 'lb';
  lb.setAttribute('role', 'dialog');
  lb.setAttribute('aria-modal', 'true');
  lb.setAttribute('aria-label', 'Xem ảnh phóng to');
  lb.innerHTML = `
    <div class="lb-top">
      <span class="lb-count"></span>
      <button type="button" class="lb-btn lb-close" aria-label="Đóng">${icon('M6 6l12 12M18 6 6 18')}</button>
    </div>
    <div class="lb-stage"><img class="lb-img" alt=""></div>
    <p class="lb-cap"></p>
    <button type="button" class="lb-btn lb-nav lb-prev" aria-label="Ảnh trước">${icon('M15 6l-6 6 6 6')}</button>
    <button type="button" class="lb-btn lb-nav lb-next" aria-label="Ảnh sau">${icon('M9 6l6 6-6 6')}</button>`;
  document.body.appendChild(lb);

  const stage = lb.querySelector('.lb-stage'), big = lb.querySelector('.lb-img');
  const cap = lb.querySelector('.lb-cap'), count = lb.querySelector('.lb-count');
  const prev = lb.querySelector('.lb-prev'), next = lb.querySelector('.lb-next'), close = lb.querySelector('.lb-close');
  let cur = -1, opener = null;

  function show(i) {
    cur = (i + imgs.length) % imgs.length;
    const src = imgs[cur];
    big.classList.remove('ready');
    big.onload = () => big.classList.add('ready');
    big.src = src.currentSrc || src.src;
    big.alt = src.alt;
    if (big.complete) big.classList.add('ready');
    const fc = src.closest('figure')?.querySelector('figcaption');
    cap.textContent = fc ? fc.textContent.trim() : src.alt;
    count.textContent = `${String(cur + 1).padStart(2, '0')} / ${String(imgs.length).padStart(2, '0')}`;
    stage.scrollTop = 0;
  }
  function open(i, from) {
    opener = from;
    show(i);
    lb.classList.add('open');
    document.documentElement.style.overflow = 'hidden';
    close.focus();
  }
  function shut() {
    lb.classList.remove('open');
    document.documentElement.style.overflow = '';
    opener?.focus({ preventScroll: true });
  }

  const single = imgs.length < 2;
  prev.hidden = next.hidden = single;

  imgs.forEach((img, i) => {
    img.classList.add('lb-zoomable');
    img.tabIndex = 0;
    img.setAttribute('role', 'button');
    img.addEventListener('click', () => open(i, img));
    img.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(i, img); }
    });
  });

  close.addEventListener('click', shut);
  prev.addEventListener('click', () => show(cur - 1));
  next.addEventListener('click', () => show(cur + 1));
  stage.addEventListener('click', (e) => { if (e.target === stage) shut(); });
  addEventListener('keydown', (e) => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') shut();
    else if (e.key === 'ArrowLeft' && !single) show(cur - 1);
    else if (e.key === 'ArrowRight' && !single) show(cur + 1);
    else if (e.key === 'Tab') {
      // Giữ focus trong hộp xem ảnh
      const f = [close, prev, next].filter((b) => !b.hidden);
      const idx = f.indexOf(document.activeElement);
      e.preventDefault();
      f[(idx + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
    }
  });
}
