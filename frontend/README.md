# L'amour Wedding — Frontend

Cửa hàng wedding thương mại điện tử. Giao diện tiếng Việt, phong cách nhẹ nhàng, sang trọng, responsive cơ bản.
Stack: React + Vite (JavaScript), React Router, CSS thuần (không dùng Tailwind để tránh lỗi build do thiếu dependency).

## Cách chạy

```bash
cd frontend
npm install
npm run dev
```

Mở http://localhost:5173 (cổng mặc định của Vite).

Build production:

```bash
npm run build
npm run preview
```

## Cách đổi API URL

Tạo file `.env` từ mẫu:

```bash
cp .env.example .env
```

Sửa `VITE_API_URL` trong `.env` trỏ tới backend Spring Boot của bạn, ví dụ:

```
VITE_API_URL=http://localhost:8080
```

Mặc định khi không có biến môi trường là `http://localhost:8080` (xem `src/api.js`).
Lưu ý: sau khi đổi `.env` cần khởi động lại `npm run dev` để Vite nhận biến mới.

## Danh sách trang đã làm

| Route | Trang / tính năng |
|---|---|
| `/` | Trang chủ / danh sách sản phẩm: tìm kiếm, lọc theo danh mục, lọc giá (từ — đến), sắp xếp (giá tăng/giảm, tên A–Z) |
| `/products/:id` | Chi tiết sản phẩm: ảnh, mô tả, giá VND, chọn số lượng, thêm vào giỏ |
| `/cart` | Giỏ hàng: tăng/giảm số lượng, xóa từng món, xóa toàn bộ, tổng tiền |
| `/checkout` | Thanh toán: form tên, số điện thoại, địa chỉ, ghi chú, chọn COD hoặc Stripe (test), gửi đơn về backend |
| `/orders` | Theo dõi đơn hàng: nhập mã đơn để tra cứu, xem danh sách đơn của mình, trạng thái Chờ xác nhận / Đã xác nhận / Đang giao / Đã giao / Đã hủy |
| `/admin` | Quản trị cơ bản: xem danh sách đơn hàng và danh sách sản phẩm (chỉ đọc từ API; nếu thiếu quyền thì hiển thị thông báo lỗi thân thiện) |
| `/login`, `/register` | Đăng nhập / đăng ký, lưu JWT vào `localStorage` (`wedding_token`) |

## Kết nối backend (hợp đồng API giả định)

File API tập trung tại `src/api.js`:

- `GET /api/categories`
- `GET /api/products?search=&categoryId=&minPrice=&maxPrice=&sort=`
- `GET /api/products/{id}`
- `POST /api/auth/register`, `POST /api/auth/login`
- `GET /api/cart`, `POST /api/cart`, `DELETE /api/cart/{id}` (kèm header `X-Guest-Id` cho khách vãng lai, xem `src/api.js`)
- `POST /api/checkout` (chính, trả `{order, paymentProvider, paymentStatus, clientSecret}`), fallback `POST /api/orders` (trả Order trực tiếp)
- `GET /api/orders`, `GET /api/orders/{id}` (id số), `GET /api/orders/admin/all` (ADMIN)

## Luồng checkout mới (đã sửa blocker P0)

Backend tạo đơn hoàn toàn từ giỏ backend, nên frontend không gửi `items` trong body checkout nữa:

1. Giỏ hàng vẫn lưu trong state + `localStorage` (`wedding_cart_v1`) nên không mất khi tải lại trang.
2. Khi bấm đặt hàng, frontend đồng bộ giỏ local lên backend trước (`api.syncCart`): xóa item cũ trên backend rồi `POST /api/cart` lại đúng số lượng local. Khách vãng lai dùng `X-Guest-Id` bền vững lưu ở `wedding_guest_id`; user đã đăng nhập dùng JWT (backend ưu tiên JWT).
3. Gửi checkout với đúng field backend nhận: `fullName`, `phone`, `address`, `note`, `paymentProvider` (`cod`|`stripe`).
4. Đọc response cả 2 dạng và hiển thị: ID đơn (số, dùng để tra cứu), mã đơn `orderCode` (chỉ để hiển thị), `paymentStatus`, `clientSecret` (Stripe test). Đơn vừa tạo được lưu ở `wedding_last_order` để khách vãng lai vẫn xem được ngay sau đó.
5. Tra cứu đơn dùng ID số ở `GET /api/orders/{id}` (cần đăng nhập với đơn của mình; tra bằng mã `DH-…` không được backend hỗ trợ).

## Dữ liệu dự phòng

**Ưu tiên gọi API thật.** Chỉ khi API không reachable hoặc trả về rỗng, trang danh sách / chi tiết mới hiển thị dữ liệu mẫu dự phòng trong `src/data/fallback.js` kèm cảnh báo rõ ràng trên giao diện, để trang không trống và không crash trang trắng.
Khi backend chưa chạy hoặc API lỗi, các trang khác cũng hiển thị thông báo lỗi thân thiện bằng tiếng Việt thay vì crash.

## Cấu trúc file chính

- `src/api.js` — API client, base URL từ `VITE_API_URL`
- `src/store/CartContext.jsx` — giỏ hàng + localStorage
- `src/store/AuthContext.jsx` — JWT + thông tin người dùng
- `src/pages/` — Home, ProductDetail, CartPage, Checkout, Orders, Admin, Auth
- `src/components/Header.jsx` — header, điều hướng, số lượng giỏ
- `src/index.css` — toàn bộ CSS thuần
