package com.wedding.shop.service;

import com.wedding.shop.dto.AuthDtos.*;
import com.wedding.shop.model.Role;
import com.wedding.shop.model.User;
import com.wedding.shop.repository.UserRepository;
import com.wedding.shop.security.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {
    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository users, PasswordEncoder encoder, JwtUtil jwtUtil) {
        this.users = users; this.encoder = encoder; this.jwtUtil = jwtUtil;
    }

    public AuthResponse register(RegisterRequest req) {
        if (users.existsByEmail(req.email())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email da duoc dang ky");
        }
        User user = new User(req.email(), encoder.encode(req.password()), req.fullName(), Role.USER);
        user.setPhone(req.phone());
        users.save(user);
        return toResponse(user);
    }

    public AuthResponse login(LoginRequest req) {
        User user = users.findByEmail(req.email())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email hoac mat khau khong dung"));
        if (!encoder.matches(req.password(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email hoac mat khau khong dung");
        }
        return toResponse(user);
    }

    private AuthResponse toResponse(User user) {
        return new AuthResponse(
                jwtUtil.generateToken(user.getEmail(), user.getRole().name()),
                user.getEmail(), user.getFullName(), user.getRole().name());
    }
}
