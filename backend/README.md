# Backend — Cửa hàng Wedding

Spring Boot 3, Java 17, Spring Data JPA, Spring Security + JWT, H2 (dev) / Postgres (profile).

## Cách chạy

```bash
cd backend
mvn spring-boot:run
```

- Cổng mặc định: **8080** (đổi bằng `server.port` hoặc biến `SERVER_PORT` khi chạy jar).
- Frontend dev chạy ở `http://localhost:5173` đã được cho phép CORS.
- Lần chạy đầu tiên sẽ tự seed dữ liệu mẫu (xem bên dưới).

### Tài khoản mẫu (CHỈ DÙNG CHO DEV)

| Vai trò | Email | Mật khẩu |
|---|---|---|
| Admin | `admin@wedding.local` | `admin123` |
| User | `user@wedding.local` | `user123` |

> Đổi mật khẩu và `JWT_SECRET` trước khi đưa lên production. Secret mặc định trong
> `application.properties` rất yếu và chỉ dùng cho dev.

## Cách xác định người dùng cho giỏ hàng / đơn hàng

Chọn **1 cách đơn giản, thống nhất** cho cả giỏ hàng và đơn hàng:

- **Đã đăng nhập:** gửi header `Authorization: Bearer <JWT>`. Backend dùng email trong JWT,
  owner = `user:<email>`.
- **Khách (guest):** không cần JWT, nhưng **bắt buộc** gửi header `X-Guest-Id`
  (frontend tự sinh 1 UUID, lưu `localStorage`, gửi kèm mọi request giỏ hàng/checkout).
  Owner = `guest:<X-Guest-Id>`.
- Không có cả JWT lẫn `X-Guest-Id` → API trả lỗi 400.

Lưu ý: `GET /api/orders` (xem đơn của mình) và `GET /api/orders/{id}` yêu cầu JWT,
không dùng guest. Admin xem tất cả đơn qua `GET /api/orders/admin/all` (role ADMIN).

## API chính (prefix `/api`)

### Auth
- `POST /api/auth/register` — body: `{email, password, fullName, phone}` → trả JWT
- `POST /api/auth/login` — body: `{email, password}` → trả `{token, email, fullName, role}`

### Danh mục & sản phẩm (không cần đăng nhập)
- `GET /api/categories`
- `GET /api/products?search=&categoryId=&minPrice=&maxPrice=&featured=&sort=`
  - `sort`: `newest` (mặc định) | `priceAsc` | `priceDesc` | `name`
  - Giá tính bằng VND (số nguyên, đơn vị đồng).
- `GET /api/products/{id}`

### Giỏ hàng (JWT hoặc `X-Guest-Id`)
- `GET /api/cart`
- `POST /api/cart` — body: `{productId, quantity}`
- `DELETE /api/cart/{itemId}` — `itemId` là id của CartItem, không phải productId

### Đơn hàng & checkout
- `POST /api/orders` — tạo đơn từ giỏ hàng, body: `{fullName, phone, address, note, paymentProvider}`
- `GET /api/orders` — đơn của user hiện tại (cần JWT)
- `GET /api/orders/{id}` — cần JWT, chỉ chủ đơn hoặc ADMIN mới xem được
- `GET /api/orders/admin/all` — ADMIN
- `POST /api/checkout` — giống `POST /api/orders` nhưng trả thêm:
  `{order, paymentProvider, paymentStatus, clientSecret}`

Trạng thái đơn (`status`): `PENDING`, `CONFIRMED`, `SHIPPED`, `DELIVERED`, `CANCELLED`.

## Thanh toán

Đổi provider bằng biến môi trường:

```bash
PAYMENT_PROVIDER=cod mvn spring-boot:run     # mặc định: COD
PAYMENT_PROVIDER=stripe mvn spring-boot:run  # Stripe test
```

Hoặc gửi `paymentProvider: "cod" | "stripe"` trong body của `/api/orders` / `/api/checkout`
(giá trị trong body thắng biến môi trường).

| Provider | Hành vi hiện tại |
|---|---|
| `cod` | Luôn thành công khi tạo đơn, `paymentStatus = SUCCESS`, không có `clientSecret`. |
| `stripe` | **Chế độ test, KHÔNG gọi API Stripe thật.** Nếu chưa có `STRIPE_SECRET_KEY` → `paymentStatus = TEST_MODE`, `clientSecret` giả, checkout không fail. Nếu đã có key, vẫn trả `TEST_MODE` cho tới khi tích hợp stripe-java SDK. |

- VNPay và MoMo: mới chỉ có placeholder là class `VnPayPaymentService` và
  `MoMoPaymentService` (ghi TODO trong code), chưa implement — cắm thêm sau bằng cách
  implement `PaymentService` và đăng ký trong `PaymentServiceFactory`.
- **Không commit key thật.** Xem `.env.example` để biết các biến cần thiết:
  `JWT_SECRET`, `STRIPE_SECRET_KEY`, `PAYMENT_PROVIDER`, `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`.

## Đổi sang Postgres

1. Tạo database Postgres, ví dụ `wedding_shop`.
2. Chạy với profile `postgres` và biến môi trường:

```bash
DB_URL=jdbc:postgresql://localhost:5432/wedding_shop \
DB_USERNAME=postgres \
DB_PASSWORD=mat-khau-that \
mvn spring-boot:run -Dspring-boot.run.profiles=postgres
```

Cấu hình nằm ở `src/main/resources/application-postgres.properties`.
Profile mặc định (không chỉ định) vẫn dùng H2 file tại `./data/weddingdb`.

## Dữ liệu mẫu

- 5 danh mục: Váy cưới, Vest chú rể, Áo dài, Phụ kiện, Dịch vụ cưới.
- 15 sản phẩm tiếng Việt: váy cưới công chúa, váy đuôi cá, vest chú rể,
  áo dài, phụ kiện, dịch vụ trang trí/chụp ảnh/makeup. Ảnh dùng ảnh mẫu
  `picsum.photos` theo seed để frontend hiển thị được ngay.
- Seed chỉ chạy khi bảng sản phẩm còn trống; tài khoản mẫu seed riêng nên
  không bị mất khi chạy lại.
