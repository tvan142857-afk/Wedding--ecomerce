package com.wedding.shop.service;

import com.wedding.shop.dto.CartDtos.OrderRequest;
import com.wedding.shop.model.*;
import com.wedding.shop.payment.PaymentResult;
import com.wedding.shop.payment.PaymentService;
import com.wedding.shop.payment.PaymentServiceFactory;
import com.wedding.shop.repository.CartRepository;
import com.wedding.shop.repository.OrderRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class OrderService {
    private final OrderRepository orders;
    private final CartRepository carts;
    private final PaymentServiceFactory paymentFactory;

    public OrderService(OrderRepository orders, CartRepository carts, PaymentServiceFactory paymentFactory) {
        this.orders = orders; this.carts = carts; this.paymentFactory = paymentFactory;
    }

    /** Tao don tu gio hang + goi PaymentService. Tra ve don da gan paymentStatus/clientSecret. */
    public Order createFromCart(String ownerKey, OrderRequest req) {
        Cart cart = carts.findByOwnerKey(ownerKey)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Gio hang trong"));
        if (cart.getItems().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Gio hang trong");
        }
        Order order = new Order();
        order.setOrderCode("DH-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        order.setBuyerKey(ownerKey);
        order.setFullName(req == null ? null : req.fullName());
        order.setPhone(req == null ? null : req.phone());
        order.setAddress(req == null ? null : req.address());
        order.setNote(req == null ? null : req.note());
        order.setStatus(OrderStatus.PENDING);

        long total = 0;
        for (CartItem ci : cart.getItems()) {
            Product p = ci.getProduct();
            if (p.getStock() != null && p.getStock() < ci.getQuantity()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "San pham het hang hoac khong du ton kho: " + p.getName());
            }
            OrderItem oi = new OrderItem(order, p, p.getName(), p.getPrice(), ci.getQuantity());
            order.getItems().add(oi);
            total += p.getPrice() * ci.getQuantity();
        }
        order.setTotalAmount(total);

        String providerName = req == null ? null : req.paymentProvider();
        PaymentService payment = paymentFactory.resolve(providerName);
        PaymentResult result = payment.charge(
                new PaymentService.PaymentRequest(order.getOrderCode(), total, ownerKey));
        order.setPaymentProvider(payment.providerName());
        order.setPaymentStatus(result.status());
        order.setClientSecret(result.clientSecret());

        Order saved = orders.save(order);
        // Tru ton kho + xoa gio hang sau khi tao don thanh cong.
        for (OrderItem oi : saved.getItems()) {
            Product p = oi.getProduct();
            if (p.getStock() != null) p.setStock(p.getStock() - oi.getQuantity());
        }
        cart.getItems().clear();
        carts.save(cart);
        return saved;
    }

    @Transactional(readOnly = true)
    public List<Order> myOrders(String ownerKey) {
        return orders.findByBuyerKeyOrderByCreatedAtDesc(ownerKey);
    }

    @Transactional(readOnly = true)
    public Order getById(Long id, String ownerKey, boolean isAdmin) {
        Order order = orders.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Khong tim thay don hang"));
        if (!isAdmin && !order.getBuyerKey().equals(ownerKey)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Khong co quyen xem don hang nay");
        }
        return order;
    }

    @Transactional(readOnly = true)
    public List<Order> allOrders() {
        return orders.findAll();
    }
}
