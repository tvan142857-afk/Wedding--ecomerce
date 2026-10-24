package com.wedding.shop.controller;
import com.wedding.shop.dto.CartDtos.AddItemRequest;
import com.wedding.shop.model.Cart;
import com.wedding.shop.service.CartService;
import com.wedding.shop.service.OwnerResolver;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
@RestController
@RequestMapping("/api/cart")
public class CartController {
    private final CartService cartService;
    private final OwnerResolver ownerResolver;
    public CartController(CartService cartService, OwnerResolver ownerResolver) {
        this.cartService = cartService; this.ownerResolver = ownerResolver;
    }
    @GetMapping
    public Cart get(Authentication auth, @RequestHeader(value = "X-Guest-Id", required = false) String guestId) {
        return cartService.getCart(ownerResolver.resolve(auth, guestId));
    }
    @PostMapping
    public Cart add(Authentication auth, @RequestHeader(value = "X-Guest-Id", required = false) String guestId,
                    @Valid @RequestBody AddItemRequest req) {
        return cartService.addItem(ownerResolver.resolve(auth, guestId), req.productId(), req.quantity());
    }
    @DeleteMapping("/{itemId}")
    public ResponseEntity<Map<String, String>> remove(Authentication auth,
            @RequestHeader(value = "X-Guest-Id", required = false) String guestId,
            @PathVariable Long itemId) {
        cartService.removeItem(ownerResolver.resolve(auth, guestId), itemId);
        return ResponseEntity.ok(Map.of("message", "Da xoa khoi gio hang"));
    }
}
