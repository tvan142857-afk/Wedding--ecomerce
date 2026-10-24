import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, unwrapOne } from '../api.js';
import { formatVND, normalizeProduct } from '../utils/format.js';
import { FALLBACK_PRODUCTS } from '../data/fallback.js';
import { useCart } from '../store/CartContext.jsx';

export default function ProductDetail() {
  const { id } = useParams();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const res = await api.getProduct(id);
        const p = normalizeProduct(unwrapOne(res));
        if (cancelled) return;
        if (!p) throw new Error('not-found');
        setProduct(p);
      } catch {
        if (cancelled) return;
        const fb = FALLBACK_PRODUCTS.find((p) => String(p.id) === String(id));
        if (fb) {
          setProduct(fb);
          setError('Không kết nối được tới backend, đang hiển thị dữ liệu mẫu dự phòng cho sản phẩm này.');
        } else {
          setError('Không tìm thấy sản phẩm hoặc không kết nối được tới máy chủ. Vui lòng quay lại trang chủ và thử lại.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [id]);

  if (loading) return <p className="muted">Đang tải chi tiết sản phẩm…</p>;
  if (!product) return <div><div className="alert alert-error">{error}</div><Link to="/" className="btn btn-primary">Về trang chủ</Link></div>;

  return (
    <div>
      {error && <div className="alert alert-warning">{error}</div>}
      <Link to="/" className="back-link">← Quay lại danh sách</Link>
      <div className="detail card">
        <div className="detail-image">
          {product.imageUrl ? <img src={product.imageUrl} alt={product.name} /> : <div className="product-placeholder large">💍</div>}
        </div>
        <div className="detail-info">
          <span className="tag">{product.categoryName || 'Sản phẩm'}</span>
          <h1>{product.name}</h1>
          <p className="price large">{formatVND(product.price)}</p>
          {product.originalPrice && product.originalPrice > product.price && (
            <p className="old-price">{formatVND(product.originalPrice)}</p>
          )}
          <p className="description">{product.description || 'Sản phẩm wedding được tuyển chọn cho ngày trọng đại của bạn.'}</p>
          <div className="qty-row">
            <label htmlFor="qty">Số lượng</label>
            <div className="qty-controls">
              <button className="btn btn-outline" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
              <input id="qty" className="input qty-input" type="number" min="1" value={qty} onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))} />
              <button className="btn btn-outline" onClick={() => setQty((q) => q + 1)}>+</button>
            </div>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => { addItem(product, qty); setAdded(true); }}
          >
            {added ? '✓ Đã thêm vào giỏ' : 'Thêm vào giỏ hàng'}
          </button>
          {added && <p><Link to="/cart">Xem giỏ hàng →</Link></p>}
        </div>
      </div>
    </div>
  );
}
