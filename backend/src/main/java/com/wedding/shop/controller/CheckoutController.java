package com.wedding.shop.controller;
import com.wedding.shop.dto.CartDtos.OrderRequest;
import com.wedding.shop.model.Order;
import com.wedding.shop.service.OrderService;
import com.wedding.shop.service.OwnerResolver;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
@RestController
@RequestMapping("/api/checkout")
public class CheckoutController {
    private final OrderService orderService;
    private final OwnerResolver ownerResolver;
    public CheckoutController(OrderService orderService, OwnerResolver ownerResolver) {
        this.orderService = orderService; this.ownerResolver = ownerResolver;
    }
    @PostMapping
    public Map<String, Object> checkout(Authentication auth,
            @RequestHeader(value = "X-Guest-Id", required = false) String guestId,
            @RequestBody(required = false) OrderRequest req) {
        Order order = orderService.createFromCart(ownerResolver.resolve(auth, guestId), req);
        return Map.of(
                "order", order,
                "paymentProvider", order.getPaymentProvider(),
                "paymentStatus", order.getPaymentStatus(),
                "clientSecret", order.getClientSecret() == null ? "" : order.getClientSecret());
    }
}
