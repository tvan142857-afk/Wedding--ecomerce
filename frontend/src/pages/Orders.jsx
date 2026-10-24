import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, statusLabel, unwrapList, unwrapOne, ORDER_STEPS, ORDER_STEP_LABELS } from '../api.js';
import { formatVND } from '../utils/format.js';
import { useAuth } from '../store/AuthContext.jsx';

const LAST_ORDER_KEY = 'wedding_last_order';

function loadLastOrder() {
  try {
    const raw = localStorage.getItem(LAST_ORDER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function Orders() {
  const { isLoggedIn } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [code, setCode] = useState('');
  const [searched, setSearched] = useState(null);
  const [lastOrder] = useState(loadLastOrder);

  const loadMyOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getOrders();
      setOrders(unwrapList(res));
    } catch (err) {
      setError(err.status === 401
        ? 'Bạn cần đăng nhập để xem danh sách đơn hàng của mình.'
        : (err.message || 'Không tải được danh sách đơn hàng.'));
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) loadMyOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  const handleSearch = async (e) => {
    e.preventDefault();
    const input = code.trim();
    if (!input) return;
    setError('');
    setSearched(null);
    // Backend chỉ nhận id số ở GET /api/orders/{id}. Mã đơn dạng DH-… (orderCode)
    // chỉ để hiển thị, không tra cứu được qua endpoint này.
    if (!/^\d+$/.test(input)) {
      setError('Backend chỉ tra cứu được bằng ID đơn hàng (số, ví dụ: 123) — mã đơn dạng DH-… chỉ để hiển thị. ID đơn được in ngay sau khi bạn đặt hàng thành công, hoặc xem trong danh sách đơn của bạn sau khi đăng nhập.');
      return;
    }
    setLoading(true);
    try {
      const res = await api.getOrder(input);
      setSearched(unwrapOne(res));
    } catch (err) {
      // Đơn của guest không tra được qua API khi chưa đăng nhập (endpoint yêu cầu JWT):
      // báo rõ thay vì "không tìm thấy" chung chung.
      setError(err.status === 401 || err.status === 403
        ? 'Bạn cần đăng nhập để tra cứu đơn hàng này. Đơn đặt với tư cách khách chỉ xem được ngay sau khi đặt hàng (thông tin đơn vừa tạo ở bên dưới, nếu có).'
        : 'Không tìm thấy đơn hàng với ID đã nhập, hoặc máy chủ chưa phản hồi. Vui lòng kiểm tra lại ID đơn.');
    } finally {
      setLoading(false);
    }
  };

  const renderOrder = (o) => {
    const id = o.id || o.orderId;
    const status = statusLabel(o.status);
    // Backend trả items[] với unitPrice (không phải price), và fullName/paymentProvider.
    const items = o.items || o.orderItems || [];
    const total = o.totalAmount ?? o.total ?? items.reduce((s, i) => s + (Number(i.unitPrice ?? i.price) || 0) * (Number(i.quantity) || 1), 0);
    const stepIndex = ORDER_STEPS.indexOf(String(o.status || '').toUpperCase());
    return (
      <article key={id || o.orderCode || Math.random()} className="card order-card">
        <div className="order-head">
          <strong>Đơn #{id || '—'}</strong>
          <span className={`status status-${String(o.status || '').toLowerCase()}`}>{status}</span>
        </div>
        {o.orderCode && <p className="muted small">Mã đơn: {o.orderCode}</p>}
        {o.createdAt && <p className="muted small">Ngày đặt: {new Date(o.createdAt).toLocaleString('vi-VN')}</p>}
        {(o.fullName || o.customerName) && <p>Người nhận: {o.fullName || o.customerName} — {o.phone || ''}</p>}
        {o.address && <p className="muted">Địa chỉ: {o.address}</p>}
        {stepIndex >= 0 && o.status !== 'CANCELLED' && o.status !== 'DA_HUY' && (
          <div className="steps">
            {ORDER_STEP_LABELS.map((s, i) => (
              <span key={s} className={i <= stepIndex ? 'step done' : 'step'}>{s}</span>
            ))}
          </div>
        )}
        {items.length > 0 && (
          <ul className="order-items">
            {items.map((it, idx) => (
              <li key={idx}>{it.productName || it.name || `Sản phẩm #${it.productId}`} × {it.quantity || 1} — {formatVND((Number(it.unitPrice ?? it.price) || 0) * (Number(it.quantity) || 1))}</li>
            ))}
          </ul>
        )}
        <p><strong>Tổng tiền: {formatVND(total)}</strong></p>
        {(o.paymentProvider || o.paymentMethod) && <p className="muted small">Thanh toán: {(o.paymentProvider || o.paymentMethod) === 'stripe' || (o.paymentProvider || o.paymentMethod) === 'STRIPE' ? 'Thẻ qua Stripe (test)' : 'COD — Thanh toán khi nhận hàng'}</p>}
        {o.paymentStatus && <p className="muted small">Trạng thái thanh toán: {o.paymentStatus}</p>}
      </article>
    );
  };

  return (
    <div>
      <h1>Theo dõi đơn hàng</h1>
      <form className="card search-order" onSubmit={handleSearch}>
        <label>Nhập ID đơn hàng (số)
          <input className="input" value={code} onChange={(e) => setCode(e.target.value)} placeholder="Ví dụ: 123" />
        </label>
        <button className="btn btn-primary" disabled={loading}>Tra cứu</button>
      </form>
      {error && <div className="alert alert-error">{error}</div>}
      {searched && renderOrder(searched)}
      {!searched && lastOrder && lastOrder.id && (
        <>
          <h2>Đơn vừa đặt</h2>
          <div className="card order-card">
            <p><strong>Đơn #{lastOrder.id}</strong>{lastOrder.orderCode ? ` — Mã đơn: ${lastOrder.orderCode}` : ''}</p>
            <p className="muted">Người nhận: {lastOrder.fullName || ''}</p>
            <p className="muted">Thanh toán: {lastOrder.paymentProvider === 'stripe' ? 'Thẻ qua Stripe (test)' : 'COD'}{lastOrder.paymentStatus ? ` — ${lastOrder.paymentStatus}` : ''}</p>
            <p><strong>Tổng tiền: {formatVND(lastOrder.totalAmount || 0)}</strong></p>
          </div>
        </>
      )}
      {!searched && (
        <>
          <h2>Đơn hàng của tôi</h2>
          {!isLoggedIn && <p className="muted">Bạn chưa đăng nhập — <Link to="/login">đăng nhập</Link> để xem toàn bộ đơn hàng của mình, hoặc tra cứu bằng ID đơn ở trên.</p>}
          {loading && <p className="muted">Đang tải…</p>}
          {!loading && isLoggedIn && orders.length === 0 && !error && <p className="muted">Bạn chưa có đơn hàng nào.</p>}
          <div className="orders-list">{orders.map(renderOrder)}</div>
        </>
      )}
    </div>
  );
}
