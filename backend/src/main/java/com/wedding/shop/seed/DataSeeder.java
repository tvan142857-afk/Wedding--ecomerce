package com.wedding.shop.seed;

import com.wedding.shop.model.Category;
import com.wedding.shop.model.Product;
import com.wedding.shop.repository.CategoryRepository;
import com.wedding.shop.repository.ProductRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * Seed dev: chi chay khi DB trong. Tai khoan mau CHI DUNG CHO DEV.
 * Admin: admin@wedding.local / admin123 | User: user@wedding.local / user123
 */
@Component
public class DataSeeder implements CommandLineRunner {
    private final CategoryRepository categories;
    private final ProductRepository products;

    public DataSeeder(CategoryRepository categories, ProductRepository products) {
        this.categories = categories; this.products = products;
    }

    @Override
    public void run(String... args) {
        if (products.count() > 0) return;

        categories.save(new Category("Váy cưới", "vay-cuoi", "Váy cưới cô dâu"));
        categories.save(new Category("Vest chú rể", "vest-chu-re", "Vest và suit chú rể"));
        categories.save(new Category("Áo dài", "ao-dai", "Áo dài cưới truyền thống"));
        categories.save(new Category("Phụ kiện", "phu-kien", "Vương miện, voan, giày cưới"));
        categories.save(new Category("Dịch vụ cưới", "dich-vu-cuoi", "Trang trí, chụp ảnh, makeup"));

        // Anh dung picsum seed (anh mau, khong ban quyen) de frontend hien thi duoc ngay.
        add("Váy cưới công chúa tay bồng", "Váy cưới dáng công chúa, ren cao cấp, đuôi váy dài thướt tha.",
                25000000L, "vay", 8, true, "vay-cong-chua");
        add("Váy cưới đuôi cá sang trọng", "Váy đuôi cá ôm dáng, đính đá lấp lánh, tôn vóc dáng cô dâu.",
                32000000L, "vay", 5, true, "vay-duoi-ca");
        add("Váy cưới chữ A đơn giản", "Váy chữ A nhẹ nhàng, phù hợp tiệc cưới ngoài trời và nhà hàng.",
                15000000L, "vay", 10, false, "vay-chu-a");
        add("Váy cưới trễ vai ren Pháp", "Váy trễ vai với ren Pháp nhập khẩu, cổ điển và lãng mạn.",
                28000000L, "vay", 4, true, "vay-tre-vai");
        add("Vest chú rể đen cổ điển", "Vest đen 3 mảnh, vải wool cao cấp, may đo vừa vặn.",
                12000000L, "vest", 12, true, "vest-den");
        add("Vest chú rể xanh navy", "Vest xanh navy trẻ trung, phù hợp đám cưới hiện đại.",
                13500000L, "vest", 9, false, "vest-navy");
        add("Vest chú rể trắng kem", "Vest trắng kem lịch lãm cho lễ cưới ban ngày.",
                11000000L, "vest", 7, false, "vest-trang-kem");
        add("Áo dài cưới đỏ thêu rồng phượng", "Áo dài đỏ truyền thống, thêu tay rồng phượng tinh xảo.",
                9000000L, "aodai", 15, true, "ao-dai-do");
        add("Áo dài cưới trắng tinh khôi", "Áo dài trắng cho lễ gia tiên, chất liệu lụa mềm mại.",
                7500000L, "aodai", 12, false, "ao-dai-trang");
        add("Vương miện cô dâu đính đá", "Vương miện đính đá pha lê, điểm nhấn cho cô dâu.",
                2500000L, "phukien", 30, false, "vuong-mien");
        add("Voan cưới dài 3m", "Voan cưới dài, ren viền, tạo hiệu ứng bay bổng khi di chuyển.",
                1800000L, "phukien", 40, false, "voan-cuoi");
        add("Giày cưới cao gót trắng", "Giày cưới trắng êm chân, gót 7cm, đi cả ngày không mỏi.",
                3200000L, "phukien", 25, false, "giay-cuoi");
        add("Gói trang trí tiệc cưới trọn gói", "Trang trí sân khấu, cổng hoa, bàn tiệc theo chủ đề riêng.",
                45000000L, "dichvu", 99, true, "trang-tri-tiec");
        add("Gói chụp ảnh cưới ngoại cảnh", "Chụp ảnh cưới ngoại cảnh 1 ngày, 200 ảnh chỉnh sửa, album cao cấp.",
                18000000L, "dichvu", 99, true, "chup-anh-cuoi");
        add("Gói makeup cô dâu ngày cưới", "Makeup + làm tóc cô dâu trong ngày cưới, dặm lại tận nơi.",
                5500000L, "dichvu", 99, false, "makeup-co-dau");
    }

    private void add(String name, String desc, Long price, String catKey,
                     int stock, boolean featured, String imgSeed) {
        products.save(new Product(name, desc, price,
                "https://picsum.photos/seed/" + imgSeed + "/800/1000",
                stock, resolveCategory(catKey), featured));
    }

    private Category resolveCategory(String catKey) {
        // Map truc tiep theo key da dinh nghia o tren, tranh suy luan tu ten san pham.
        String slug = switch (catKey) {
            case "vay" -> "vay-cuoi";
            case "vest" -> "vest-chu-re";
            case "aodai" -> "ao-dai";
            case "phukien" -> "phu-kien";
            case "dichvu" -> "dich-vu-cuoi";
            default -> "vay-cuoi";
        };
        return categories.findAll().stream()
                .filter(x -> slug.equals(x.getSlug()))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("Thieu category: " + slug));
    }
}
