import { Link } from 'react-router-dom';
import { formatVND } from '../utils/format.js';
import { useCart } from '../store/CartContext.jsx';

export default function CartPage() {
  const { items, updateQty, removeItem, total, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="card empty-cart">
        <h1>Giỏ hàng trống</h1>
        <p className="muted">Bạn chưa chọn sản phẩm nào. Hãy khám phá bộ sưu tập wedding của chúng tôi.</p>
        <Link to="/" className="btn btn-primary">Tiếp tục mua sắm</Link>
      </div>
    );
  }

  return (
    <div>
      <h1>Giỏ hàng của bạn</h1>
      <div className="card">
        {items.map((item) => (
          <div key={item.id} className="cart-row">
            <div className="cart-thumb">{item.imageUrl ? <img src={item.imageUrl} alt={item.name} /> : '💍'}</div>
            <div className="cart-main">
              <strong>{item.name}</strong>
              <span className="muted">{formatVND(item.price)} / sản phẩm</span>
            </div>
            <div className="qty-controls">
              <button className="btn btn-outline" onClick={() => updateQty(item.id, item.qty - 1)}>−</button>
              <span>{item.qty}</span>
              <button className="btn btn-outline" onClick={() => updateQty(item.id, item.qty + 1)}>+</button>
            </div>
            <strong>{formatVND(item.price * item.qty)}</strong>
            <button className="btn btn-text" onClick={() => removeItem(item.id)}>Xóa</button>
          </div>
        ))}
      </div>
      <div className="cart-summary card">
        <div><span>Tổng tiền</span><strong>{formatVND(total)}</strong></div>
        <div className="row-actions">
          <button className="btn btn-outline" onClick={clearCart}>Xóa toàn bộ giỏ</button>
          <Link to="/" className="btn btn-outline">Tiếp tục mua sắm</Link>
          <Link to="/checkout" className="btn btn-primary">Tiến hành thanh toán</Link>
        </div>
        <p className="muted small">Giỏ hàng được lưu tự động trên trình duyệt này, không mất khi tải lại trang. Khi bạn bấm đặt hàng, giỏ sẽ được đồng bộ lên máy chủ trước rồi mới tạo đơn.</p>
      </div>
    </div>
  );
}
