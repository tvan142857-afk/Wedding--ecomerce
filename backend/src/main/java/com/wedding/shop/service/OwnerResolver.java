package com.wedding.shop.service;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

/**
 * Cach xac dinh chu gio hang / don hang (ghi ro trong README):
 * - Neu co JWT hop le: owner = "user:<email>".
 * - Neu khong: bat buoc gui header X-Guest-Id (frontend tu sinh UUID va luu localStorage),
 *   owner = "guest:<X-Guest-Id>".
 * Khong co ca hai -> 400, frontend phai gui mot trong hai.
 */
@Component
public class OwnerResolver {
    public String resolve(Authentication auth, String guestId) {
        if (auth != null && auth.isAuthenticated() && auth.getName() != null
                && !"anonymousUser".equals(auth.getName())) {
            return "user:" + auth.getName();
        }
        if (guestId != null && !guestId.isBlank()) {
            return "guest:" + guestId.trim();
        }
        throw new IllegalArgumentException("Can dang nhap (JWT) hoac gui header X-Guest-Id");
    }
}
