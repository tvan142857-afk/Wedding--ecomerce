import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, unwrapList } from '../api.js';
import { formatVND, normalizeCategory, normalizeProduct } from '../utils/format.js';
import { FALLBACK_CATEGORIES, FALLBACK_PRODUCTS } from '../data/fallback.js';
import { useCart } from '../store/CartContext.jsx';

export default function Home() {
  const { addItem } = useCart();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [usingFallback, setUsingFallback] = useState(false);

  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState('');
  const [addedId, setAddedId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const [catRes, prodRes] = await Promise.all([
          api.getCategories().catch(() => null),
          api.getProducts().catch(() => null),
        ]);
        if (cancelled) return;
        const cats = catRes ? unwrapList(catRes).map(normalizeCategory) : [];
        const prods = prodRes ? unwrapList(prodRes).map(normalizeProduct).filter(Boolean) : [];
        if (prods.length === 0) throw new Error('api-empty');
        setCategories(cats.length ? cats : FALLBACK_CATEGORIES);
        setProducts(prods);
        setUsingFallback(false);
      } catch (e) {
        if (cancelled) return;
        // API không reachable / trả rỗng: dùng dữ liệu dự phòng, không crash trang trắng.
        setCategories(FALLBACK_CATEGORIES);
        setProducts(FALLBACK_PRODUCTS);
        setUsingFallback(true);
        setError('Không kết nối được tới backend, đang hiển thị dữ liệu mẫu dự phòng. Vui lòng kiểm tra backend và tải lại trang.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    let list = [...products];
    const q = search.trim().toLowerCase();
    if (q) list = list.filter((p) => p.name.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q));
    if (categoryId) list = list.filter((p) => String(p.categoryId) === String(categoryId));
    if (minPrice !== '') list = list.filter((p) => p.price >= Number(minPrice));
    if (maxPrice !== '') list = list.filter((p) => p.price <= Number(maxPrice));
    if (sort === 'price_asc') list.sort((a, b) => a.price - b.price);
    if (sort === 'price_desc') list.sort((a, b) => b.price - a.price);
    if (sort === 'name_asc') list.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
    return list;
  }, [products, search, categoryId, minPrice, maxPrice, sort]);

  const handleAdd = (p) => {
    addItem(p, 1);
    setAddedId(p.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  return (
    <div>
      <section className="hero">
        <h1>Ngày trọng đại, bắt đầu từ đây</h1>
        <p>Váy cưới, vest chú rể, phụ kiện và trang trí tiệc — nhẹ nhàng, sang trọng, đúng như bạn mơ.</p>
      </section>

      {error && <div className="alert alert-warning">{error}</div>}
      {usingFallback && !error && <div className="alert alert-warning">Đang hiển thị dữ liệu mẫu dự phòng (backend chưa kết nối).</div>}

      <section className="filters card">
        <input
          className="input" type="search" placeholder="Tìm kiếm sản phẩm…"
          value={search} onChange={(e) => setSearch(e.target.value)}
        />
        <select className="input" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">Tất cả danh mục</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <input className="input" type="number" min="0" placeholder="Giá từ (VND)" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
        <input className="input" type="number" min="0" placeholder="Giá đến (VND)" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
        <select className="input" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="">Sắp xếp: Mặc định</option>
          <option value="price_asc">Giá: Thấp đến cao</option>
          <option value="price_desc">Giá: Cao đến thấp</option>
          <option value="name_asc">Tên: A – Z</option>
        </select>
      </section>

      {loading ? (
        <p className="muted">Đang tải sản phẩm…</p>
      ) : filtered.length === 0 ? (
        <p className="muted">Không tìm thấy sản phẩm phù hợp. Hãy thử nới lỏng bộ lọc.</p>
      ) : (
        <div className="grid">
          {filtered.map((p) => (
            <article key={p.id} className="product-card card">
              <Link to={`/products/${p.id}`} className="product-image">
                {p.imageUrl ? (
                  <img src={p.imageUrl} alt={p.name} />
                ) : (
                  <div className="product-placeholder">💍</div>
                )}
              </Link>
              <div className="product-body">
                <span className="tag">{p.categoryName || 'Sản phẩm'}</span>
                <h3><Link to={`/products/${p.id}`}>{p.name}</Link></h3>
                <p className="price">{formatVND(p.price)}</p>
                <button className="btn btn-primary" onClick={() => handleAdd(p)}>
                  {addedId === p.id ? '✓ Đã thêm vào giỏ' : 'Thêm vào giỏ'}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
