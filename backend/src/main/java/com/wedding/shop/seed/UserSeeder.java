package com.wedding.shop.seed;

import com.wedding.shop.model.Role;
import com.wedding.shop.model.User;
import com.wedding.shop.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/** Seed tai khoan mau, chay rieng ke ca khi san pham da co. CHI DUNG CHO DEV. */
@Component
@Order(2)
public class UserSeeder implements CommandLineRunner {
    private final UserRepository users;
    private final PasswordEncoder encoder;

    public UserSeeder(UserRepository users, PasswordEncoder encoder) {
        this.users = users; this.encoder = encoder;
    }

    @Override
    public void run(String... args) {
        if (!users.existsByEmail("admin@wedding.local")) {
            users.save(new User("admin@wedding.local", encoder.encode("admin123"),
                    "Quản trị viên", Role.ADMIN));
        }
        if (!users.existsByEmail("user@wedding.local")) {
            User u = new User("user@wedding.local", encoder.encode("user123"),
                    "Khách hàng mẫu", Role.USER);
            u.setPhone("0900000000");
            users.save(u);
        }
    }
}
