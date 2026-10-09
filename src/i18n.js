import './i18n.css';
import { collect, norm } from './i18n-core.js';
import en from './i18n/en.js';

// Chuyển ngôn ngữ Việt ⇄ Anh. Tiếng Việt là bản gốc trong HTML; tiếng Anh tra theo từ điển src/i18n/en.js.
// Lựa chọn lưu ở localStorage ('hae-lang') nên đi theo người xem qua các trang.
const KEY = 'hae-lang';
const root = document.documentElement;
const store = {
  get() { try { return localStorage.getItem(KEY); } catch (e) { return null; } },
  set(v) { try { localStorage.setItem(KEY, v); } catch (e) {} },
};

const decoder = document.createElement('textarea');
const decode = (s) => { if (!s.includes('&')) return s; decoder.innerHTML = s; return decoder.value; };

// Dùng cho chuỗi sinh ra từ JS (toast, nhãn động)
window.haeT = (s) => (root.lang === 'en' && en[norm(s)] ? decode(en[norm(s)]) : s);

let units = [];
const title = { vi: document.title };
const meta = document.querySelector('meta[name="description"]');
const metaVi = meta?.content;

function snapshot() {
  units = collect(document.body).filter((u) => en[u.key] !== undefined);
  for (const u of units) {
    if (u.type === 'el') u.orig = u.el.innerHTML;
    else if (u.type === 'text') u.orig = u.node.nodeValue;
    else u.orig = u.el.getAttribute(u.attr);
  }
}

// Tiêu đề hero trang chủ: mỗi từ là một span có hiệu ứng riêng nên phải dựng lại theo câu mới
const heroH1 = document.querySelector('h1[data-i18n-words]');
const heroVi = heroH1 && { html: heroH1.innerHTML, label: heroH1.getAttribute('aria-label') };
function heroWords(sentence) {
  // *…* đánh dấu cụm được nhấn
  let i = 0;
  return sentence.split(' ').map((w) => {
    const em = w.startsWith('*');
    const word = w.replace(/\*/g, '').replace(/_/g, '&nbsp;');
    return `<span class="w"><span style="--i:${i++}">${em ? `<em>${word}</em>` : word}</span></span>`;
  }).join(' ');
}

function apply(lang) {
  root.lang = lang;
  for (const u of units) {
    const v = lang === 'en' ? en[u.key] : null;
    if (u.type === 'el') u.el.innerHTML = v ?? u.orig;
    else if (u.type === 'text') {
      if (v == null) u.node.nodeValue = u.orig;
      else { const m = u.orig.match(/^(\s*)[\s\S]*?(\s*)$/); u.node.nodeValue = m[1] + decode(v) + m[2]; }
    } else u.el.setAttribute(u.attr, v != null ? decode(v) : u.orig);
  }
  if (heroH1) {
    const e = en['@hero'];
    if (lang === 'en' && e) { heroH1.innerHTML = heroWords(e); heroH1.setAttribute('aria-label', e.replace(/[*]/g, '').replace(/_/g, ' ')); }
    else { heroH1.innerHTML = heroVi.html; heroH1.setAttribute('aria-label', heroVi.label); }
  }
  document.title = (lang === 'en' && en[norm(title.vi)]) || title.vi;
  if (meta) meta.content = (lang === 'en' && en[norm(metaVi)]) || metaVi;
  btn?.setAttribute('aria-label', lang === 'en' ? 'Switch to Vietnamese' : 'Chuyển sang tiếng Anh');
  btn?.setAttribute('data-lang', lang);
  // Trang chủ cuộn ngang phải đo lại bề rộng; các module khác nghe 'hae:lang' nếu cần
  dispatchEvent(new Event('resize'));
  dispatchEvent(new CustomEvent('hae:lang', { detail: lang }));
}

let btn = null;

// Gọi sau khi các module khác đã dựng xong DOM của mình (lightbox, khung chọn…)
export function initI18n() {
  // Nút chuyển ngôn ngữ, đặt cạnh nút sáng/tối
  const themeBtn = document.getElementById('themeBtn');
  if (themeBtn) {
    btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'lang-btn';
    btn.id = 'langBtn';
    btn.setAttribute('data-i18n-skip', '');
    btn.innerHTML = '<span data-l="vi">VI</span><span data-l="en">EN</span>';
    themeBtn.before(btn);
    btn.addEventListener('click', () => {
      const next = root.lang === 'en' ? 'vi' : 'en';
      store.set(next);
      apply(next);
    });
  }

  snapshot();
  apply(store.get() === 'en' ? 'en' : 'vi');
}
