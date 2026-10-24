// API client cho backend Spring Boot.
// Base URL đọc từ VITE_API_URL, mặc định http://localhost:8080
// Không gọi bất kỳ endpoint nào khác ngoài backend đã cấu hình.
export const API_BASE_URL =
  (import.meta.env.VITE_API_URL || 'http://localhost:8080').replace(/\/$/, '');

function getToken() {
  try {
    return localStorage.getItem('wedding_token') || '';
  } catch {
    return '';
  }
}

export function getAuthHeader() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Guest ID bền vững cho khách vãng lai: backend xác định chủ giỏ/đơn bằng
// JWT nếu có, ngược lại bằng header X-Guest-Id (xem OwnerResolver bên backend).
// ID này phải dùng nhất quán cho cả cart và checkout, nếu không backend sẽ
// coi là 2 giỏ khác nhau và checkout báo "Giỏ hàng trống".
const GUEST_KEY = 'wedding_guest_id';
export function getGuestId() {
  try {
    let id = localStorage.getItem(GUEST_KEY);
    if (!id) {
      id = (typeof crypto !== 'undefined' && crypto.randomUUID)
        ? crypto.randomUUID()
        : `guest-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem(GUEST_KEY, id);
    }
    return id;
  } catch {
    return `guest-${Date.now()}`;
  }
}

export function getGuestHeader() {
  return { 'X-Guest-Id': getGuestId() };
}

async function request(path, { method = 'GET', body, auth = false, guest = false } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) Object.assign(headers, getAuthHeader());
  // Với user đã đăng nhập, backend ưu tiên JWT nên header guest thừa nhưng vô hại.
  // Với guest, header này là bắt buộc — thiếu nó backend trả 400.
  if (guest) Object.assign(headers, getGuestHeader());
  let res;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (e) {
    // Backend chưa chạy / không reachable: ném lỗi thân thiện, UI sẽ bắt và hiển thị.
    throw new Error('Không kết nối được tới máy chủ. Vui lòng kiểm tra backend đang chạy và thử lại.');
  }
  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  if (!res.ok) {
    const msg =
      (data && (data.message || data.error)) ||
      `Yêu cầu thất bại (HTTP ${res.status}). Vui lòng thử lại.`;
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

// Chuẩn hoá response: backend có thể trả mảng trực tiếp, hoặc {data: [...]}, {content: [...]}, {items: [...]}
export function unwrapList(data) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.data)) return data.data;
  if (data && Array.isArray(data.content)) return data.content;
  if (data && Array.isArray(data.items)) return data.items;
  return [];
}
export function unwrapOne(data) {
  if (data && typeof data === 'object' && data.data && typeof data.data === 'object') return data.data;
  return data;
}

// Lấy các item trong giỏ backend (Cart.items: [{id (CartItem id), product: {id,...}, quantity}])
function backendCartItems(cartData) {
  const cart = unwrapOne(cartData);
  if (cart && Array.isArray(cart.items)) return cart.items;
  return [];
}

export const api = {
  getCategories: () => request('/api/categories'),
  getProducts: (params = {}) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== '' && v !== undefined && v !== null) q.set(k, String(v));
    });
    const qs = q.toString();
    return request(`/api/products${qs ? `?${qs}` : ''}`);
  },
  getProduct: (id) => request(`/api/products/${id}`),
  register: (payload) => request('/api/auth/register', { method: 'POST', body: payload }),
  login: (payload) => request('/api/auth/login', { method: 'POST', body: payload }),
  // Giỏ hàng backend. Luôn kèm X-Guest-Id để guest cũng dùng được;
  // user đã đăng nhập thì backend ưu tiên JWT.
  getCart: () => request('/api/cart', { auth: true, guest: true }),
  addToCart: (payload) => request('/api/cart', { method: 'POST', body: payload, auth: true, guest: true }),
  removeFromCart: (id) => request(`/api/cart/${id}`, { method: 'DELETE', auth: true, guest: true }),
  // Đồng bộ giỏ local (localStorage) lên giỏ backend trước checkout.
  // Backend tạo đơn hoàn toàn từ giỏ backend, nên bước này là bắt buộc —
  // nếu không checkout sẽ lỗi 400 "Giỏ hàng trống".
  // Cách làm: xóa hết item cũ trên backend rồi POST lại đúng số lượng local,
  // để giỏ backend bằng đúng giỏ local (tránh cộng dồn 2 lần nếu giỏ cũ còn sót).
  syncCart: async (localItems) => {
    const current = await request('/api/cart', { auth: true, guest: true });
    for (const bi of backendCartItems(current)) {
      if (bi.id == null) continue;
      try {
        await request(`/api/cart/${bi.id}`, { method: 'DELETE', auth: true, guest: true });
      } catch (err) {
        if (err.status !== 404) throw err;
      }
    }
    for (const li of localItems) {
      await request('/api/cart', {
        method: 'POST',
        body: { productId: li.id, quantity: li.qty },
        auth: true,
        guest: true,
      });
    }
    return request('/api/cart', { auth: true, guest: true });
  },
  // Checkout chính: POST /api/checkout trả {order, paymentProvider, paymentStatus, clientSecret}.
  // POST /api/orders trả Order trực tiếp, dùng làm fallback khi checkout 404.
  createOrder: (payload) => request('/api/orders', { method: 'POST', body: payload, auth: true, guest: true }),
  checkout: (payload) => request('/api/checkout', { method: 'POST', body: payload, auth: true, guest: true }),
  getOrders: () => request('/api/orders', { auth: true }),
  getOrder: (id) => request(`/api/orders/${id}`, { auth: true }),
  getAllOrders: () => request('/api/orders/admin/all', { auth: true }),
};

export const ORDER_STATUS_LABEL = {
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  SHIPPED: 'Đang giao',
  SHIPPING: 'Đang giao',
  DELIVERED: 'Đã giao',
  CANCELLED: 'Đã hủy',
  // Các biến thể tên khác backend có thể dùng
  CHO_XAC_NHAN: 'Chờ xác nhận',
  DA_XAC_NHAN: 'Đã xác nhận',
  DANG_GIAO: 'Đang giao',
  DA_GIAO: 'Đã giao',
  DA_HUY: 'Đã hủy',
};

export function statusLabel(status) {
  if (!status) return 'Chờ xác nhận';
  return ORDER_STATUS_LABEL[status] || ORDER_STATUS_LABEL[String(status).toUpperCase()] || String(status);
}

// Bước tiến trình theo mã trạng thái (không theo nhãn, tránh lệch SHIPPED/SHIPPING).
export const ORDER_STEPS = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];
export const ORDER_STEP_LABELS = ['Chờ xác nhận', 'Đã xác nhận', 'Đang giao', 'Đã giao'];
