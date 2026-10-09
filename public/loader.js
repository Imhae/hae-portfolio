/* Màn hình chờ với logo HAE. Nạp bằng <script src="./loader.js"> ngay sau <body> để hiện trước khi trang vẽ.
   Chữ HAE dùng đúng nét chữ của logo trên nav (Bricolage Grotesque 700): đường viền từng chữ được một nét
   line chạy vẽ ra, chữ được tô đặc, rồi khung chọn và bốn tay nắm bật ra. Khi logo hiện đủ và trang đã tải
   xong, logo thu nhỏ và bay về đúng vị trí logo ở góc trên bên trái, nền mờ dần để lộ trang. Trong suốt
   lúc đó logo thật trên nav được ẩn đi, chỉ hiện ra đúng khoảnh khắc logo của màn hình chờ đáp xuống,
   nên người xem thấy đó là cùng một logo.
   Lần đầu vào trang chủ chạy bản đầy đủ (~3 giây); trang chi tiết dự án và các lần tải sau chạy bản nhanh
   (~1,3 giây). Đổi SHOW_EVERY_LOAD thành false để chỉ hiện một lần mỗi phiên trình duyệt. */
(function () {
  var SHOW_EVERY_LOAD = true;
  var MIN_MS = 2300;      // thời gian tối thiểu kể từ lúc bắt đầu vẽ, đủ để logo hiện trọn
  var FLY_MS = 850;       // thời gian logo bay về góc
  var FAST = 0.36;        // hệ số rút ngắn cho bản nhanh (xem bên dưới)

  var seen = false, theme = null;
  try { seen = sessionStorage.getItem('hae-loaded') === '1'; theme = localStorage.getItem('hae-theme'); } catch (e) {}
  if (seen && !SHOW_EVERY_LOAD) return;

  // Bản đầy đủ chỉ chạy ở lần đầu vào trang chủ trong phiên. Trang chi tiết dự án, và mọi lần tải sau đó,
  // chạy bản nhanh (cùng trình tự nhưng rút còn khoảng 1,3 giây) để người xem tới nội dung ngay.
  var isHome = /(\/|\/index\.html)$/.test(location.pathname);
  var f = (seen || !isHome) ? FAST : 1;
  MIN_MS = Math.round(MIN_MS * f);
  FLY_MS = Math.round(FLY_MS * (f < 1 ? 0.62 : 1));
  function T(sec) { return (sec * f).toFixed(3) + 's'; }
  try { sessionStorage.setItem('hae-loaded', '1'); } catch (e) {}

  var dark = theme ? theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var c = dark
    ? { bg: '#121613', ink: '#E4E9E2', accent: '#9FA9FF', dots: '#28302A', surface: '#1A1F1B' }
    : { bg: '#EEF1EC', ink: '#1B211D', accent: '#3645C4', dots: '#C9D1C5', surface: '#F8FAF6' };

  // Tỉ lệ đúng bằng 5 lần logo trên nav (chữ 20px, đệm 4px × 10px, viền 1px, tay nắm 7px), để khi co về
  // 1/5 thì chữ, khung và tay nắm trùng khít logo thật. Khung SVG tính theo tâm nét viền nên đệm cộng nửa viền.
  var FS = 100, PAD_X = 52.5, PAD_Y = 22.5, HANDLE = 30, STROKE = 5, DASH = 760;
  // Bricolage là font biến thiên có trục optical size: chữ 100px mặc định sẽ hẹp hơn chữ 20px của logo.
  // Khoá trục này ở 20 để hình chữ giống hệt logo trên nav.
  var OPSZ = 'font-optical-sizing:none;font-variation-settings:"opsz" 20;';
  var FONT = '"Bricolage Grotesque","Be Vietnam Pro",system-ui,sans-serif';

  var css =
    '.hae-loader{position:fixed;inset:0;z-index:9999;display:grid;place-items:center;pointer-events:none}' +
    '.hl-bg{position:absolute;inset:0;pointer-events:auto;background-color:' + c.bg + ';background-image:radial-gradient(' + c.dots + ' 1.1px,transparent 1.4px);background-size:28px 28px;transition:opacity .7s ease}' +
    '.hae-loader svg{position:relative;width:min(58vw,400px);height:auto;overflow:visible;transform-origin:center;will-change:transform,opacity}' +
    '.hae-loader.fly .hl-bg{opacity:0}' +
    '.hae-loader.fly svg{transition:transform ' + FLY_MS + 'ms cubic-bezier(.7,0,.15,1)}' +
    '.hae-loader.land svg{opacity:0;transition:opacity .14s linear}' +
    'html.hae-loading header .logo,html.hae-loading header .hlogo{visibility:hidden}' +
    '.hae-loader.fade .hl-bg,.hae-loader.fade svg{opacity:0;transition:opacity .5s ease}' +
    '.hl-text{font:700 ' + FS + 'px/1 ' + FONT + ';letter-spacing:.04em;' + OPSZ + 'fill:' + c.ink + ';fill-opacity:0;stroke:' + c.ink + ';stroke-width:2;stroke-linejoin:round;stroke-dasharray:' + DASH + ';stroke-dashoffset:' + DASH + '}' +
    '.go .hl-text{animation:hl-draw ' + T(1.5) + ' cubic-bezier(.5,.05,.3,1) forwards,hl-fill ' + T(.45) + ' ease ' + T(1.15) + ' forwards,hl-thin ' + T(.3) + ' ease ' + T(1.6) + ' forwards}' +
    '.hl-head{font:700 ' + FS + 'px/1 ' + FONT + ';letter-spacing:.04em;' + OPSZ + 'fill:none;stroke:' + c.accent + ';stroke-width:4;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:70 3000;stroke-dashoffset:70;opacity:0}' +
    '.hl-frame{fill:none;stroke:' + c.accent + ';stroke-width:' + STROKE + ';stroke-dasharray:1;stroke-dashoffset:1}' +
    '.hl-handle{fill:' + c.surface + ';stroke:' + c.accent + ';stroke-width:' + STROKE + ';transform-box:fill-box;transform-origin:center;transform:scale(0)}' +
    '.go .hl-head{animation:hl-head ' + T(1.5) + ' cubic-bezier(.5,.05,.3,1) forwards,hl-on .05s linear forwards,hl-off ' + T(.3) + ' ease ' + T(1.25) + ' forwards}' +
    '.go .hl-frame{animation:hl-draw ' + T(.55) + ' cubic-bezier(.16,1,.3,1) ' + T(1.4) + ' forwards}' +
    '.go .hl-handle{animation:hl-pop ' + T(.35) + ' cubic-bezier(.16,1,.3,1) forwards}' +
    '@keyframes hl-draw{to{stroke-dashoffset:0}}' +
    '@keyframes hl-head{to{stroke-dashoffset:' + (70 - DASH) + '}}' +
    '@keyframes hl-fill{to{fill-opacity:1}}' +
    '@keyframes hl-thin{to{stroke-opacity:0}}' +
    '@keyframes hl-on{to{opacity:1}}' +
    '@keyframes hl-off{to{opacity:0}}' +
    '@keyframes hl-pop{to{transform:scale(1)}}' +
    '@media (prefers-reduced-motion:reduce){.hl-text{stroke-dashoffset:0;fill-opacity:1;animation:none!important}.hl-head{display:none}.hl-frame{stroke-dashoffset:0;animation:none!important}.hl-handle{transform:none;animation:none!important}}';

  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  var el = document.createElement('div');
  el.className = 'hae-loader';
  el.setAttribute('aria-hidden', 'true');
  // Khung và tay nắm được đặt lại theo bề rộng chữ thật sau khi font tải xong (xem layout()).
  el.innerHTML = '<div class="hl-bg"></div>' +
    '<svg viewBox="0 0 400 180" role="img" aria-label="HAE">' +
      '<text class="hl-text" x="0" y="0">HAE</text><text class="hl-head" x="0" y="0">HAE</text>' +
      '<rect class="hl-frame" pathLength="1"/>' +
      '<rect class="hl-handle"/><rect class="hl-handle"/><rect class="hl-handle"/><rect class="hl-handle"/>' +
    '</svg>';
  document.body.appendChild(el);
  document.documentElement.classList.add('hae-loading');

  var svg = el.querySelector('svg'), frame = el.querySelector('.hl-frame');
  var texts = el.querySelectorAll('text'), handles = el.querySelectorAll('.hl-handle');

  function layout() {
    // Bề rộng chữ (bỏ khoảng giãn sau chữ cuối), chữ hoa cao ~0.7em và nằm giữa khung như ở logo thật
    var len = texts[0].getComputedTextLength() - FS * 0.04;
    var w = len + PAD_X * 2, h = FS + PAD_Y * 2, m = HANDLE;
    var baseline = m + PAD_Y + FS / 2 + FS * 0.35;
    for (var i = 0; i < texts.length; i++) { texts[i].setAttribute('x', m + PAD_X); texts[i].setAttribute('y', baseline); }
    frame.setAttribute('x', m); frame.setAttribute('y', m); frame.setAttribute('width', w); frame.setAttribute('height', h);
    [[m, m], [m + w, m], [m, m + h], [m + w, m + h]].forEach(function (p, i) {
      var r = handles[i];
      r.setAttribute('x', p[0] - HANDLE / 2); r.setAttribute('y', p[1] - HANDLE / 2);
      r.setAttribute('width', HANDLE); r.setAttribute('height', HANDLE);
      r.style.animationDelay = T(1.85 + i * 0.06);
    });
    svg.setAttribute('viewBox', '0 0 ' + (w + m * 2) + ' ' + (h + m * 2));
  }

  // Bản nhanh không chờ ảnh tải hết: chỉ cần trang dựng xong khung (DOMContentLoaded) là đủ để mở màn.
  var fast = f < 1;
  var start = 0, loaded = fast ? document.readyState !== 'loading' : document.readyState === 'complete', going = false, done = false;

  function go() {
    if (going) return; going = true;
    layout();
    start = Date.now();
    el.classList.add('go');
    maybeFinish();
  }
  // Chờ font của logo để nét vẽ đúng chữ; quá 1,2 giây (bản nhanh: 0,35 giây) thì vẽ bằng font dự phòng
  if (document.fonts && document.fonts.load) {
    document.fonts.load('700 ' + FS + 'px "Bricolage Grotesque"', 'HAE').then(go, go);
    setTimeout(go, fast ? 350 : 1200);
  } else go();

  function maybeFinish() {
    if (!going || !loaded || done) return;
    done = true;
    setTimeout(exit, Math.max(0, (reduce ? 400 : MIN_MS) - (Date.now() - start)));
  }

  function exit() {
    var target = document.querySelector('header .logo, header .hlogo, .nav .logo, .hnav .hlogo');
    var t = target && target.getBoundingClientRect();
    if (reduce || !t || !t.width) {
      el.classList.add('fade');
      setTimeout(cleanup, 600);
      return;
    }
    // Đưa khung của logo trên màn hình chờ về trùng khung logo trên nav (tâm nét viền = lùi vào nửa pixel)
    t = { left: t.left + 0.5, top: t.top + 0.5, width: t.width - 1, height: t.height - 1 };
    var s = frame.getBoundingClientRect();
    var k = t.width / s.width;
    var b = svg.getBoundingClientRect();
    var dx = (t.left + t.width / 2) - (s.left + s.width / 2);
    var dy = (t.top + t.height / 2) - (s.top + s.height / 2);
    // tâm biến đổi là tâm svg; bù phần lệch giữa tâm svg và tâm khung khi co lại
    var ox = (s.left + s.width / 2) - (b.left + b.width / 2), oy = (s.top + s.height / 2) - (b.top + b.height / 2);
    el.classList.add('fly');
    svg.style.transform = 'translate(' + (dx + ox * (1 - k)) + 'px,' + (dy + oy * (1 - k)) + 'px) scale(' + k + ')';
    // Đáp xuống: logo thật hiện ra đúng chỗ, logo của màn hình chờ tan ngay trên nó
    setTimeout(function () {
      document.documentElement.classList.remove('hae-loading');
      el.classList.add('land');
      setTimeout(cleanup, 180);
    }, FLY_MS);
  }

  function cleanup() { document.documentElement.classList.remove('hae-loading'); el.remove(); style.remove(); }

  if (!loaded) (fast ? document : window).addEventListener(fast ? 'DOMContentLoaded' : 'load', function () { loaded = true; maybeFinish(); });
  setTimeout(function () { loaded = true; if (!going) go(); else maybeFinish(); }, 6000); // không bao giờ kẹt lại
})();
