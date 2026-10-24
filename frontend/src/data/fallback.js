// DỮ LIỆU DỰ PHÒNG — chỉ hiển thị khi API không reachable.
// Nội dung chính của shop luôn ưu tiên gọi API thật từ backend.
export const FALLBACK_CATEGORIES = [
  { id: 'vay-cuoi', name: 'Váy cưới' },
  { id: 'vest', name: 'Vest chú rể' },
  { id: 'phu-kien', name: 'Phụ kiện' },
  { id: 'trang-tri', name: 'Trang trí tiệc' },
];

export const FALLBACK_PRODUCTS = [
  {
    id: 1, name: 'Váy cưới công chúa đuôi dài', price: 18900000, categoryId: 'vay-cuoi',
    categoryName: 'Váy cưới', imageUrl: '',
    description: 'Váy cưới dáng công chúa, ren cao cấp, đuôi dài sang trọng cho ngày trọng đại.',
  },
  {
    id: 2, name: 'Váy cưới dáng chữ A đơn giản', price: 12900000, categoryId: 'vay-cuoi',
    categoryName: 'Váy cưới', imageUrl: '',
    description: 'Thiết kế chữ A nhẹ nhàng, tôn dáng, phù hợp tiệc ngoài trời và nhà hàng.',
  },
  {
    id: 3, name: 'Vest chú rể xanh navy', price: 7900000, categoryId: 'vest',
    categoryName: 'Vest chú rể', imageUrl: '',
    description: 'Bộ vest 3 mảnh màu xanh navy, form slim-fit lịch lãm.',
  },
  {
    id: 4, name: 'Vương miện & voan cô dâu', price: 1890000, categoryId: 'phu-kien',
    categoryName: 'Phụ kiện', imageUrl: '',
    description: 'Bộ vương miện pha lê và voan dài, hoàn thiện vẻ ngoài cô dâu.',
  },
  {
    id: 5, name: 'Bộ trang trí bàn tiệc hoa hồng', price: 4500000, categoryId: 'trang-tri',
    categoryName: 'Trang trí tiệc', imageUrl: '',
    description: 'Set trang trí bàn tiệc tông hồng — trắng, gồm hoa, nến và khăn trải bàn.',
  },
  {
    id: 6, name: 'Giày cưới cô dâu đế thấp', price: 2490000, categoryId: 'phu-kien',
    categoryName: 'Phụ kiện', imageUrl: '',
    description: 'Giày cưới êm chân, đế thấp, thoải mái suốt buổi tiệc.',
  },
];
