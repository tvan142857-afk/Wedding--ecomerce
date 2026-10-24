package com.wedding.shop.controller;
import com.wedding.shop.dto.CartDtos.OrderRequest;
import com.wedding.shop.model.Order;
import com.wedding.shop.service.OrderService;
import com.wedding.shop.service.OwnerResolver;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController
@RequestMapping("/api/orders")
public class OrderController {
    private final OrderService orderService;
    private final OwnerResolver ownerResolver;
    public OrderController(OrderService orderService, OwnerResolver ownerResolver) {
        this.orderService = orderService; this.ownerResolver = ownerResolver;
    }
    @PostMapping
    public Order create(Authentication auth, @RequestHeader(value = "X-Guest-Id", required = false) String guestId,
                        @RequestBody(required = false) OrderRequest req) {
        return orderService.createFromCart(ownerResolver.resolve(auth, guestId), req);
    }
    @GetMapping
    public List<Order> myOrders(Authentication auth) {
        // GET /api/orders yeu cau JWT (SecurityConfig). Neu khong co auth, Spring tra 403.
        return orderService.myOrders("user:" + auth.getName());
    }
    @GetMapping("/{id}")
    public Order get(Authentication auth, @PathVariable Long id) {
        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        return orderService.getById(id, "user:" + auth.getName(), isAdmin);
    }
    @GetMapping("/admin/all")
    public List<Order> all() { return orderService.allOrders(); }
}
