package com.wedding.shop.service;

import com.wedding.shop.model.Cart;
import com.wedding.shop.model.CartItem;
import com.wedding.shop.model.Product;
import com.wedding.shop.repository.CartRepository;
import com.wedding.shop.repository.ProductRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional
public class CartService {
    private final CartRepository carts;
    private final ProductRepository products;

    public CartService(CartRepository carts, ProductRepository products) {
        this.carts = carts; this.products = products;
    }

    // Khong dung readOnly o day: GET cart lan dau phai tao + luu gio moi.
    public Cart getCart(String ownerKey) {
        return carts.findByOwnerKey(ownerKey).orElseGet(() -> carts.save(new Cart(ownerKey)));
    }

    public Cart addItem(String ownerKey, Long productId, int quantity) {
        Cart cart = getCart(ownerKey);
        Product product = products.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Khong tim thay san pham"));
        for (CartItem item : cart.getItems()) {
            if (item.getProduct().getId().equals(productId)) {
                item.setQuantity(item.getQuantity() + quantity);
                return carts.save(cart);
            }
        }
        cart.getItems().add(new CartItem(cart, product, quantity));
        return carts.save(cart);
    }

    public void removeItem(String ownerKey, Long itemId) {
        Cart cart = getCart(ownerKey);
        boolean removed = cart.getItems().removeIf(i -> i.getId().equals(itemId));
        if (!removed) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Khong tim thay muc trong gio hang");
        }
        carts.save(cart);
    }

    public void clear(String ownerKey) {
        Cart cart = getCart(ownerKey);
        cart.getItems().clear();
        carts.save(cart);
    }
}
