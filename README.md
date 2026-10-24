# Cửa hàng Wedding — Thương mại điện tử (MVP)

Dự án MVP cho cửa hàng wedding: bán váy cưới, vest, áo dài, phụ kiện và dịch vụ cưới,
kèm giỏ hàng, đơn hàng, checkout và thanh toán COD / Stripe (test).

> Trạng thái thật (ngày bàn giao): frontend đã build thành công. Backend đã viết đầy đủ
> source nhưng **chưa biên dịch/chạy thử được trong sandbox này** vì sandbox chặn kết nối
> TCP trực tiếp của tiến trình Java nên Maven không tải được dependency (xem mục
> "Hạn chế đã biết" bên dưới). **Chưa test end-to-end frontend ↔ backend thật.**
> Ngoài ra QA phát hiện lỗi tích hợp checkout mức P0 (mục "Cần sửa trước khi chạy tích hợp").

## Cấu trúc thư mục

```
wedding-ecommerce/
├── README.md                 # File này (hướng dẫn tổng)
├── backend/                  # Spring Boot 3.3.5, Java 17, Maven
│   ├── pom.xml
│   ├── README.md             # Hướng dẫn riêng backend (API, Postgres, thanh toán)
│   ├── .env.example          # JWT_SECRET, STRIPE_SECRET_KEY, PAYMENT_PROVIDER, DB_*
│   └── src/main/java/com/wedding/shop/
│       ├── controller/       # Auth, Category, Product, Cart, Order, Checkout
│       ├── model/            # User, Category, Product, Cart/CartItem, Order/OrderItem
│       ├── repository/       # Spring Data JPA
│       ├── service/          # AuthService, CartService, OrderService, OwnerResolver
│       ├── security/         # JwtUtil, JwtAuthFilter (BCrypt, stateless)
│       ├── payment/          # PaymentService, COD, Stripe (test), VNPay/MoMo placeholder
│       └── seed/             # DataSeeder (5 danh mục, 15 sản phẩm), UserSeeder
└── frontend/                 # React + Vite, giao diện tiếng Việt
    ├── package.json
    ├── README.md             # Hướng dẫn riêng frontend
    ├── .env.example          # VITE_API_URL=http://localhost:8080
    └── src/
        ├── api.js            # API client (base URL từ VITE_API_URL)
        ├── App.jsx           # Router: /, /products/:id, /cart, /checkout,
        │                     # /orders, /admin, /login, /register
        ├── pages/            # Home, ProductDetail, CartPage, Checkout, Orders, Admin, Auth
        ├── store/            # CartContext (localStorage), AuthContext (JWT)
        └── data/fallback.js  # Dữ liệu dự phòng khi API chưa reachable
```

## Cách chạy

### Backend (cổng 8080)

```bash
cd ~/workspace/wedding-ecommerce/backend
mvn spring-boot:run
# Mở http://localhost:8080
```

- CORS đã cho phép `http://localhost:5173`.
- Database mặc định: H2 file `./data/weddingdb`.
- Tài khoản mẫu **chỉ dùng dev**: `admin@wedding.local` / `admin123` (ADMIN),
  `user@wedding.local` / `user123` (USER). Đổi secret trước khi đưa lên production.

Đổi sang Postgres:

```bash
DB_URL=jdbc:postgresql://localhost:5432/wedding_shop \
DB_USERNAME=postgres DB_PASSWORD=<mật-khẩu-thật> \
mvn spring-boot:run -Dspring-boot.run.profiles=postgres
```

### Frontend (cổng 5173)

```bash
cd ~/workspace/wedding-ecommerce/frontend
npm install
npm run dev   # mở http://localhost:5173
```

Đổi API backend: copy `.env.example` thành `.env`, sửa `VITE_API_URL`, khởi động lại dev server.

## Tính năng đã xong

**Backend:**
- Danh mục, sản phẩm: tìm kiếm, lọc theo danh mục/giá, sắp xếp (`newest`, `priceAsc`,
  `priceDesc`, `name`), lọc sản phẩm nổi bật (`featured=`).
- Auth JWT: đăng ký, đăng nhập, phân quyền USER/ADMIN.
- Giỏ hàng: theo JWT hoặc header `X-Guest-Id` cho khách vãng lai.
- Đơn hàng: tạo từ giỏ, trừ tồn kho, xem đơn của mình, xem tất cả đơn (ADMIN),
  trạng thái PENDING → CONFIRMED → SHIPPED → DELIVERED / CANCELLED.
- Checkout + thanh toán (xem bên dưới).
- Seed: 5 danh mục (Váy cưới, Vest chú rể, Áo dài, Phụ kiện, Dịch vụ cưới),
  15 sản phẩm mẫu tiếng Việt (váy công chúa, váy đuôi cá, vest, áo dài, vương miện,
  voan, giày cưới, trang trí tiệc, chụp ảnh ngoại cảnh, makeup…).

**Frontend:**
- Trang chủ: tìm kiếm, lọc danh mục/giá, sắp xếp, thêm vào giỏ.
- Chi tiết sản phẩm, giỏ hàng (lưu localStorage, giữ khi reload).
- Checkout: form tên/SĐT/địa chỉ, chọn COD hoặc Stripe (test).
- Theo dõi đơn: tra cứu mã đơn, danh sách đơn, thanh tiến trình trạng thái.
- Admin cơ bản: xem danh sách đơn và sản phẩm (chỉ đọc).
- Đăng nhập/đăng ký, xử lý lỗi API bằng thông báo tiếng Việt (không crash trang trắng).
- Build đã kiểm chứng: `npm run build` thành công (36 modules, JS ~288 KB).

## Thanh toán — cách đổi cổng

Abstraction: `PaymentService` (backend `payment/`), chọn bằng biến môi trường
`PAYMENT_PROVIDER=cod|stripe`, hoặc field `paymentProvider` trong body checkout
(sẽ thắng biến môi trường).

| Phương thức | Trạng thái hiện tại |
|---|---|
| COD | Hoạt động: tạo đơn là thành công. |
| Stripe (test) | Chế độ test: chưa có `STRIPE_SECRET_KEY` thì trả `paymentStatus = TEST_MODE` + `clientSecret` giả, checkout không fail. Chưa tích hợp SDK Stripe thật, **không gọi API Stripe thật, không log/commit key**. |
| VNPay | Placeholder + TODO, chưa implement. |
| MoMo | Placeholder + TODO, chưa implement. |

Không có key thật nào được commit — chỉ có `.env.example` (giá trị trống) và
mật khẩu/secret dev mẫu đã ghi rõ chỉ dùng dev.

## Đã sửa blocker P0 checkout (theo khuyến nghị QA, user đã chốt)

Chiến lược đã chốt: **đồng bộ giỏ local lên backend trước checkout**, không sửa
backend để nhận `items` trong body. Thanh toán giữ COD + Stripe test mode,
không làm VNPay/MoMo thật trong lần này.

1. **Giỏ hàng đã đồng bộ:** `src/api.js` thêm `syncCart()` + `X-Guest-Id` bền vững
   (`wedding_guest_id`); `Checkout.jsx` gọi sync trước checkout (xóa item cũ trên
   backend rồi POST lại đúng số lượng local, tránh cộng dồn). User đăng nhập dùng
   JWT, guest dùng header — backend ưu tiên JWT.
2. **Field checkout đã sửa:** gửi `fullName`, `phone`, `address`, `note`,
   `paymentProvider` (`cod`|`stripe`); không còn `customerName`/`paymentMethod`/`items`.
3. **Parse response đã sửa:** đọc cả 2 dạng — `/api/checkout` trả
   `{order, paymentProvider, paymentStatus, clientSecret}`, `/api/orders` trả Order
   trực tiếp — và hiển thị ID đơn, `orderCode`, `paymentStatus`, `clientSecret`.
4. **Hiển thị đơn đã sửa:** dùng `fullName`, `paymentProvider`, `items[].unitPrice`;
   thêm nhãn `SHIPPED` (tiến trình theo mã trạng thái, không theo nhãn);
   Admin dùng `GET /api/orders/admin/all`.
5. **Tra cứu đơn đã sửa:** tra bằng ID số ở `GET /api/orders/{id}`; mã `DH-…`
   chỉ để hiển thị. Đơn vừa đặt được lưu ở `wedding_last_order` để guest xem ngay.
6. **Auth đã sửa:** register gửi `fullName`; login lưu đủ `email`/`fullName`/`role`
   từ response phẳng, `AuthContext` có thêm `role`/`isAdmin`.

**Vẫn chưa kiểm chứng end-to-end với backend thật** (xem "Hạn chế đã biết"):
backend chưa build được trong sandbox do chặn mạng. Kịch bản cần chạy sau khi
backend build được: register → login → kiểm tra seed → thêm giỏ → checkout COD
→ checkout Stripe test → xem đơn → tra cứu đơn bằng ID → admin xem tất cả đơn.
Cho tới khi kịch bản này chạy qua, đừng kết luận "hệ thống chạy được end-to-end".

## Hạn chế đã biết

- **Backend chưa biên dịch trong sandbox:** tiến trình Java bị chặn TCP trực tiếp
  (thông báo sandbox: cần bật quyền `other_tcp` trong Muse settings → Permissions
  → Direct network protocols, hoặc build trên máy không bị sandbox này), trong khi
  `curl` vẫn tải được. Maven vì vậy không tải được parent POM/dependency.
  Cách gỡ: bật quyền trên hoặc build ở máy khác, rồi chạy lại `mvn compile` /
  `mvn spring-boot:run`. Không cần sửa code để thử lại.
- **Chưa có:** test tự động backend, phân trang sản phẩm, CRUD sản phẩm cho admin,
  endpoint đổi trạng thái đơn, tích hợp SDK Stripe thật, VNPay/MoMo thật.
- H2 console đang `permitAll` và tắt frameOptions trong `SecurityConfig` — chấp nhận
  cho dev, **phải tắt trước khi public**.

## Lưu ý về model OpenCode DeepSeek V4.1 Flash Free

Theo giới hạn đã nêu trong yêu cầu dự án: free tier của model
`opencode/deepseek-v4.1-flash-free` (200K context, 32K output) chỉ dùng được từ bên
trong app OpenCode; gọi trực tiếp endpoint OpenCode Zen từ ngoài app sẽ bị
HTTP 403 FreeTierError. Vì vậy dự án này **không gọi endpoint OpenCode Zen** từ code
hay script, và đội Dev (chạy trên Muse) cũng không chạy bằng API OpenCode.
Giới hạn này không chặn việc xây dựng dự án — code backend/frontend ở trên chạy độc
lập với model đó. Nếu user muốn dùng model này để code tiếp, hãy mở app OpenCode
và chọn model đó trong app thay vì gọi API trực tiếp.

## Bước tiếp theo user cần quyết

1. **Chiến lược giỏ hàng checkout:** đồng bộ giỏ lên backend (khuyến nghị) hay sửa
   backend nhận `items` trong body checkout.
2. **Cổng thanh toán thật:** giữ COD + Stripe test, hay ưu tiên tích hợp VNPay/MoMo
   thật trước (cần tài khoản merchant + key test của cổng đó, nhập qua biến môi trường,
   không gửi key vào chat).
3. **Môi trường build backend:** bật quyền `other_tcp` trong Muse settings hay build
   trên máy/server khác.
4. **Database production:** giữ H2 hay chuyển Postgres (thông tin DB production).
5. **Domain / nơi deploy:** chạy local demo hay deploy lên server/cloud nào để chọn
   cấu hình CORS, URL API và secret production.
