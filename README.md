# HAE Portfolio

Portfolio của HAE, UI/UX Designer đang học Business Analysis.

## Chạy

```
npm install
npm run dev      # xem khi đang sửa
npm run build    # ra thư mục dist/
```

Đẩy lên nhánh `main` thì GitHub Actions tự build và deploy lên GitHub Pages (`.github/workflows/deploy.yml`).

## Các trang

- `index.html`: trang chủ, cuộn ngang có quán tính (tự chuyển sang cuộn dọc trên màn hình hẹp). CSS và JS nằm ngay trong file.
- `swapifly.html`: case study Swapifly, giữ bố cục và demo tương tác gốc (`src/swapifly.css`, `src/swapifly.js`); `src/swapifly-theme.css` nạp sau cùng để đổi font, màu nền, nav và footer cho khớp các trang khác.
- `hong-da.html`, `paragon.html`, `cityu-vmc.html`: case study các dự án VTL, dùng chung `src/case.css` và `src/case.js`.
- `versions/v1-cuon-doc.html`: bản đầu tiên của trang chủ, cuộn dọc. Không nằm trong build.

Thêm trang mới thì khai báo trong `vite.config.js`.

## Chuyển động nhận diện: "khung chọn"

`src/select.js` + `src/select.css`. Khi một ảnh vào tầm nhìn, con trỏ gắn nhãn HAE kéo một vùng chọn kiểu Figma quanh ảnh, bốn tay nắm bật ra, nhãn kích thước đếm lên rồi bỏ chọn; rê chuột vào thì khung chọn hiện lại. Gọi `initSelect(selector)` để gắn cho phần tử mới (thêm `{ wrap: true }` nếu phần tử cắt `overflow`). Tự tắt khi người xem bật giảm chuyển động.

## Màn hình chờ và nền chuyển động

- `public/loader.js`: màn hình chờ với logo HAE. Chữ HAE dùng đúng font của logo; một nét line chạy vẽ đường viền từng chữ, chữ được tô đặc, khung chọn bật ra, rồi logo thu nhỏ bay về vị trí logo trên nav trong lúc nền mờ đi để lộ trang. Mỗi trang nạp nó bằng `<script src="./loader.js">` ngay sau `<body>`. Lần đầu vào trang chủ chạy bản đầy đủ (~3 giây); trang chi tiết dự án và mọi lần tải sau đó chạy bản nhanh (~1,3 giây, hệ số `FAST`). Đổi `SHOW_EVERY_LOAD` thành `false` để chỉ hiện một lần mỗi phiên, `MIN_MS` là thời gian hiện tối thiểu, `FLY_MS` là thời gian logo bay về góc.
- `src/bg.js` + `src/bg.css`: nền chuyển động. Các đường line lao chéo qua lưới chấm như sao băng, đuôi mờ dần. Trong `spawn()` chỉnh tốc độ (`v`), độ dài đuôi (`len`), độ đậm (`a`); `count` là số vệt tối đa cùng lúc; `ANGLE` là hướng bay.

Cả hai tự giảm về bản tĩnh khi người xem bật giảm chuyển động.

## Ngôn ngữ (VI / EN)

Tiếng Việt là bản gốc, viết thẳng trong HTML. Tiếng Anh nằm trong `src/i18n/en.js`, tra theo đúng chuỗi tiếng Việt. Nút VI / EN ở góc trên phải do `src/i18n.js` gắn vào; lựa chọn được nhớ giữa các trang.

Khi sửa hoặc thêm chữ tiếng Việt trong HTML, chạy `npm run i18n:check` để xem chuỗi nào chưa có bản tiếng Anh rồi thêm vào `en.js`. Chuỗi thiếu bản dịch sẽ hiện nguyên tiếng Việt. Chữ trong giao diện sản phẩm của các demo Swapifly luôn là tiếng Anh.

## Xem ảnh phóng to

`src/lightbox.js` + `src/lightbox.css`. Nhấn vào ảnh màn hình để mở toàn màn hình; Esc, nút đóng hoặc nhấn nền để đóng; ← → để chuyển ảnh. Chú thích lấy từ `figcaption`, không có thì lấy `alt`. Gọi `initLightbox(selector)` để gắn cho ảnh mới.

## Ảnh

Ảnh màn hình nằm trong `src/assets/images/<dự án>/`. Ảnh của Hong Da, Paragon và CityU VMC là bản chụp tạm từ Figma. Xuất lại bản nét rồi ghi đè đúng tên file là trang tự cập nhật.

## Cần thay trước khi gửi nhà tuyển dụng

- Hai thẻ dự án cuối trên trang chủ còn là nội dung mẫu, chờ dự án ListenField và KIS.
- Nội dung ba case study VTL viết lại từ file Figma: cần rà vai trò, năm và các nhận định.
- Link CV: sửa biến `CV_URL` trong thẻ `<script>` cuối `index.html`.
- Ảnh chân dung ở hero đang là hình minh hoạ mẫu (SVG trong `index.html`, khối `#portrait`). Thay bằng thẻ `<img>` tỉ lệ 4:5 khi có ảnh thật.
