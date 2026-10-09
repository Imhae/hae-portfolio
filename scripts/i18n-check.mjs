// Liệt kê các chuỗi tiếng Việt trong HTML chưa có bản tiếng Anh trong src/i18n/en.js.
// Chạy: npm run i18n:check
import { JSDOM } from 'jsdom';
import fs from 'node:fs';
import { collect, norm } from '../src/i18n-core.js';
import en from '../src/i18n/en.js';

const VI = /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i;
const root = new URL('..', import.meta.url).pathname;
const pages = fs.readdirSync(root).filter((f) => f.endsWith('.html'));
const seen = new Set();
let missing = 0;
for (const p of pages) {
  const d = new JSDOM(fs.readFileSync(root + p, 'utf8')).window.document;
  const keys = [norm(d.title), norm(d.querySelector('meta[name=description]')?.content || ''), ...collect(d.body).map((u) => u.key)];
  const list = keys.filter((k) => k && VI.test(k) && en[k] === undefined && !seen.has(k) && seen.add(k));
  if (list.length) { console.log(`\n${p} — thiếu ${list.length} chuỗi:`); list.forEach((k) => console.log('  ' + k)); }
  missing += list.length;
}
console.log(missing ? `\nThiếu ${missing} chuỗi. Thêm vào src/i18n/en.js.` : 'Đủ: mọi chuỗi tiếng Việt đều có bản tiếng Anh.');
process.exit(missing ? 1 : 0);
