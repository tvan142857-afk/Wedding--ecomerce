import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { formatVND } from '../utils/format.js';
import { useCart } from '../store/CartContext.jsx';
import { useAuth } from '../store/AuthContext.jsx';

// Luồng checkout đúng với backend (không sửa backend):
//  1. Đồng bộ giỏ local lên giỏ backend qua POST /api/cart (kèm X-Guest-Id cho guest).
//  2. Gửi checkout với đúng field backend nhận: fullName, phone, address, note, paymentProvider ('cod'|'stripe').
//  3. Đọc response chuẩn: /api/checkout trả {order, paymentProvider, paymentStatus, clientSecret},
//     /api/orders trả Order trực tiếp. Lưu đơn vừa tạo để guest vẫn xem được ngay sau đó.
const LAST_ORDER_KEY = 'wedding_last_order';

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', phone: '', address: '', paymentProvider: 'cod', note: '' });
  const [submitting, setSubmitting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (items.length === 0) {
      setError('Giỏ hàng đang trống. Hãy chọn sản phẩm trước khi thanh toán.');
      return;
    }
    if (!form.name.trim() || !form.phone.trim() || !form.address.trim()) {
      setError('Vui lòng điền đầy đủ họ tên, số điện thoại và địa chỉ nhận hàng.');
      return;
    }
    if (!/^[0-9+\s]{9,15}$/.test(form.phone.trim())) {
      setError('Số điện thoại chưa hợp lệ. Vui lòng nhập 9–15 chữ số.');
      return;
    }
    setSubmitting(true);
    try {
      // Bước 1: đồng bộ giỏ local lên backend, nếu không backend sẽ báo "Giỏ hàng trống".
      setSyncing(true);
      try {
        await api.syncCart(items);
      } catch (syncErr) {
        throw new Error(`Không đồng bộ được giỏ hàng lên máy chủ: ${syncErr.message}`);
      } finally {
        setSyncing(false);
      }

      // Bước 2: checkout với đúng field backend nhận (OrderRequest).
      const payload = {
        fullName: form.name.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        note: form.note.trim(),
        paymentProvider: form.paymentProvider,
      };
      let res;
      try {
        res = await api.checkout(payload);
      } catch (err) {
        if (err.status === 404) res = await api.createOrder(payload);
        else throw err;
      }

      // Bước 3: parse response cả 2 dạng, không crash khi thiếu field.
      const order = res?.order || res || {};
      const placed = {
        id: order.id ?? res?.orderId ?? null,
        orderCode: order.orderCode || res?.orderCode || '',
        fullName: order.fullName || payload.fullName,
        paymentProvider: res?.paymentProvider || order.paymentProvider || payload.paymentProvider,
        paymentStatus: res?.paymentStatus || order.paymentStatus || '',
        clientSecret: res?.clientSecret || order.clientSecret || '',
        totalAmount: order.totalAmount ?? total,
        status: order.status || 'PENDING',
      };
      if (!placed.id && !placed.orderCode) {
        throw new Error('Máy chủ đã nhận đơn nhưng không trả về mã đơn. Vui lòng kiểm tra lại trong mục đơn hàng.');
      }
      try {
        localStorage.setItem(LAST_ORDER_KEY, JSON.stringify(placed));
      } catch { /* bỏ qua */ }
      setSuccess(placed);
      clearCart();
    } catch (err) {
      setError(err.message || 'Đặt hàng thất bại. Vui lòng kiểm tra kết nối và thử lại.');
    } finally {
      setSubmitting(false);
      setSyncing(false);
    }
  };

  if (items.length === 0 && !success) {
    return (
      <div className="card empty-cart">
        <h1>Chưa có sản phẩm để thanh toán</h1>
        <p className="muted">Giỏ hàng đang trống. Hãy chọn sản phẩm trước khi thanh toán.</p>
        <Link to="/" className="btn btn-primary">Về trang chủ</Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="card empty-cart">
        <h1>🎉 Đặt hàng thành công!</h1>
        <p>Cảm ơn bạn đã tin tưởng L'amour Wedding. Chúng tôi sẽ liên hệ xác nhận đơn hàng sớm nhất.</p>
        {success.id && <p>ID đơn hàng (dùng để tra cứu): <strong>{success.id}</strong></p>}
        {success.orderCode && <p>Mã đơn hàng: <strong>{success.orderCode}</strong></p>}
        <p className="muted">Phương thức thanh toán: {success.paymentProvider === 'stripe' ? 'Thẻ qua Stripe (test)' : 'COD — Thanh toán khi nhận hàng'}{success.paymentStatus ? ` — Trạng thái thanh toán: ${success.paymentStatus}` : ''}</p>
        {success.clientSecret && <p className="muted small">Mã thanh toán test (clientSecret): {success.clientSecret}</p>}
        <p className="muted">Lưu ý: tra cứu đơn trên hệ thống dùng ID đơn hàng (số), không dùng mã đơn dạng DH-….</p>
        <Link to="/orders" className="btn btn-primary">Theo dõi đơn hàng</Link>
      </div>
    );
  }

  return (
    <div>
      <h1>Thanh toán</h1>
      {!isLoggedIn && (
        <div className="alert alert-warning">
          Bạn chưa đăng nhập. Bạn vẫn có thể đặt hàng với tư cách khách (hệ thống tự gắn mã khách cho giỏ hàng), nhưng để xem lại đơn sau này hãy <Link to="/login">đăng nhập</Link> trước.
        </div>
      )}
      {error && <div className="alert alert-error">{error}</div>}
      <div className="checkout-layout">
        <form className="card checkout-form" onSubmit={handleSubmit}>
          <label>Họ và tên *<input className="input" value={form.name} onChange={set('name')} placeholder="Nguyễn Thị A" required /></label>
          <label>Số điện thoại *<input className="input" value={form.phone} onChange={set('phone')} placeholder="090…" required /></label>
          <label>Địa chỉ nhận hàng *<textarea className="input" value={form.address} onChange={set('address')} placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành" required /></label>
          <label>Ghi chú<textarea className="input" value={form.note} onChange={set('note')} placeholder="Ghi chú thêm (không bắt buộc)" /></label>
          <fieldset>
            <legend>Phương thức thanh toán</legend>
            <label className="radio"><input type="radio" name="payment" value="cod" checked={form.paymentProvider === 'cod'} onChange={set('paymentProvider')} /> Thanh toán khi nhận hàng (COD)</label>
            <label className="radio"><input type="radio" name="payment" value="stripe" checked={form.paymentProvider === 'stripe'} onChange={set('paymentProvider')} /> Thẻ qua Stripe (chế độ test)</label>
          </fieldset>
          {form.paymentProvider === 'stripe' && (
            <p className="muted small">Chế độ test: backend sẽ xử lý thanh toán Stripe test. Không nhập thẻ thật tại đây — bước nhập thẻ (nếu có) do backend/Stripe Checkout cung cấp sau khi tạo đơn.</p>
          )}
          <button className="btn btn-primary" disabled={submitting}>{syncing ? 'Đang đồng bộ giỏ hàng…' : submitting ? 'Đang gửi đơn…' : 'Đặt hàng'}</button>
        </form>
        <aside className="card">
          <h2>Tóm tắt đơn hàng</h2>
          {items.map((i) => (
            <div key={i.id} className="summary-row"><span>{i.name} × {i.qty}</span><span>{formatVND(i.price * i.qty)}</span></div>
          ))}
          <div className="summary-row total"><span>Tổng cộng</span><strong>{formatVND(total)}</strong></div>
          <button className="btn btn-outline" type="button" onClick={() => navigate('/cart')}>Quay lại giỏ hàng</button>
        </aside>
      </div>
    </div>
  );
}
