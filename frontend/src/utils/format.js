export function formatVND(value) {
  const n = Number(value) || 0;
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
}

export function normalizeProduct(p, index = 0) {
  if (!p || typeof p !== 'object') return null;
  return {
    id: p.id ?? p.productId ?? index + 1,
    name: p.name ?? p.title ?? 'Sản phẩm',
    price: Number(p.price ?? p.unitPrice ?? 0),
    originalPrice: p.originalPrice ? Number(p.originalPrice) : null,
    imageUrl: p.imageUrl || p.image || p.thumbnail || '',
    description: p.description || p.desc || '',
    categoryId: p.categoryId ?? p.category?.id ?? '',
    categoryName: p.categoryName || p.category?.name || '',
    stock: p.stock ?? p.quantity ?? null,
  };
}

export function normalizeCategory(c, index = 0) {
  if (typeof c === 'string') return { id: c, name: c };
  return { id: c?.id ?? c?.categoryId ?? index + 1, name: c?.name ?? c?.title ?? 'Danh mục' };
}
