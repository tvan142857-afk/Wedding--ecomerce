import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext(null);
const STORAGE_KEY = 'wedding_cart_v1';

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch { /* bỏ qua lỗi lưu trữ */ }
  }, [items]);

  const addItem = (product, qty = 1) => {
    const id = product.id;
    setItems((prev) => {
      const found = prev.find((i) => String(i.id) === String(id));
      if (found) {
        return prev.map((i) => (String(i.id) === String(id) ? { ...i, qty: i.qty + qty } : i));
      }
      return [...prev, {
        id, name: product.name, price: Number(product.price) || 0,
        imageUrl: product.imageUrl || '', qty,
      }];
    });
  };

  const updateQty = (id, qty) => {
    if (qty <= 0) {
      setItems((prev) => prev.filter((i) => String(i.id) !== String(id)));
    } else {
      setItems((prev) => prev.map((i) => (String(i.id) === String(id) ? { ...i, qty } : i)));
    }
  };

  const removeItem = (id) => setItems((prev) => prev.filter((i) => String(i.id) !== String(id)));
  const clearCart = () => setItems([]);

  const value = useMemo(() => ({
    items, addItem, updateQty, removeItem, clearCart,
    count: items.reduce((s, i) => s + i.qty, 0),
    total: items.reduce((s, i) => s + i.qty * (Number(i.price) || 0), 0),
  }), [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart phải dùng trong CartProvider');
  return ctx;
}
