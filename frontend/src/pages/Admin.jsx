import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, statusLabel, unwrapList } from '../api.js';
import { formatVND } from '../utils/format.js';
import { useAuth } from '../store/AuthContext.jsx';

export default function Admin() {
  const { isLoggedIn } = useAuth();
  const [tab, setTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError('');
      try {
        if (tab === 'orders') {
          // Admin xem tất cả đơn qua endpoint riêng, không dùng endpoint đơn của chính mình.
          const res = await api.getAllOrders();
          if (!cancelled) setOrders(unwrapList(res));
        } else {
          const res = await api.getProducts();
          if (!cancelled) setProducts(unwrapList(res));
        }
      } catch (err) {
        if (cancelled) return;
        if (err.status === 401 || err.status === 403) {
          setError('Bạn không có quyền xem trang quản trị. Vui lòng đăng nhập bằng tài khoản quản trị viên.');
        } else {
          setError(err.message || 'Không tải được dữ liệu. Vui lòng kiểm tra backend và thử lại.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [tab]);

  return (
    <div>
      <h1>Trang quản trị</h1>
      {!isLoggedIn && (
        <div className="alert alert-warning">
          Bạn chưa đăng nhập. Trang quản trị thường yêu cầu tài khoản quản trị viên — hãy <Link to="/login">đăng nhập</Link> trước.
        </div>
      )}
      <div className="tabs">
        <button className={tab === 'orders' ? 'btn btn-primary' : 'btn btn-outline'} onClick={() => setTab('orders')}>Đơn hàng</button>
        <button className={tab === 'products' ? 'btn btn-primary' : 'btn btn-outline'} onClick={() => setTab('products')}>Sản phẩm</button>
      </div>
      {error && <div className="alert alert-error">{error}</div>}
      {loading && <p className="muted">Đang tải…</p>}
      {!loading && !error && tab === 'orders' && (
        orders.length === 0
          ? <p className="muted">Chưa có đơn hàng nào.</p>
          : <div className="card table-wrap"><table className="table">
            <thead><tr><th>ID / Mã đơn</th><th>Khách hàng</th><th>Tổng tiền</th><th>Trạng thái</th><th>Thanh toán</th></tr></thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id || o.orderId}>
                  <td>{o.id || o.orderId}{o.orderCode ? ` (${o.orderCode})` : ''}</td>
                  <td>{o.fullName || o.customerName || o.customer?.name || '—'}</td>
                  <td>{formatVND(o.totalAmount ?? o.total ?? 0)}</td>
                  <td>{statusLabel(o.status)}</td>
                  <td>{o.paymentProvider || o.paymentMethod || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table></div>
      )}
      {!loading && !error && tab === 'products' && (
        products.length === 0
          ? <p className="muted">Chưa có sản phẩm nào.</p>
          : <div className="card table-wrap"><table className="table">
            <thead><tr><th>ID</th><th>Tên sản phẩm</th><th>Giá</th><th>Danh mục</th></tr></thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td><Link to={`/products/${p.id}`}>{p.name}</Link></td>
                  <td>{formatVND(p.price)}</td>
                  <td>{p.categoryName || p.category?.name || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table></div>
      )}
      <p className="muted small">Lưu ý: trang admin này chỉ đọc dữ liệu từ API. Tab đơn hàng dùng endpoint riêng GET /api/orders/admin/all (yêu cầu quyền ADMIN).</p>
    </div>
  );
}
